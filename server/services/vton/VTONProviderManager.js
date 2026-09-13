const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const crypto = require('crypto');

const IDMVTONProvider = require('./IDMVTONProvider');
const CatVTONProvider = require('./CatVTONProvider');
const DedicatedGPUProvider = require('./DedicatedGPUProvider');
const {
  VTONQuotaError,
  VTONTimeoutError,
  VTONAllProvidersUnavailableError
} = require('./VTONProvider');
const { uploadImageBuffer } = require('../cloudinaryService');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Normalizes input image buffer to 3-channel RGB PNG
 */
const normalizeImageToRGBPng = async (inputBufferOrPath, labelName = 'Image') => {
  try {
    const instance = sharp(inputBufferOrPath);
    const metadata = await instance.metadata();

    console.log(
      `[VTON Image Normalizer - ${labelName}] Format: ${metadata.format || 'unknown'}, Channels: ${metadata.channels}, HasAlpha: ${Boolean(metadata.hasAlpha)}`
    );

    const normalizedBuffer = await instance
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toColorspace('srgb')
      .png()
      .toBuffer();

    return normalizedBuffer;
  } catch (err) {
    console.error(`[VTON Image Normalizer Error - ${labelName}]:`, err.message);
    throw new Error(`Failed to preprocess ${labelName} for VTON: ${err.message}`);
  }
};

/**
 * Fetches garment image Buffer from URL or local path
 */
const fetchGarmentBuffer = async (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('GARMENT_IMAGE_LOAD_FAILED: Invalid garment image URL provided');
  }

  try {
    if (url.startsWith('/')) {
      const localPublicPath = path.join(__dirname, '../../../client/public', url);
      if (fs.existsSync(localPublicPath)) {
        return fs.readFileSync(localPublicPath);
      }
    }

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch (err) {
    throw new Error(`GARMENT_IMAGE_LOAD_FAILED: Failed to load garment image (${err.message})`);
  }
};

class VTONProviderManager {
  constructor() {
    this.providers = new Map();
    this.registerDefaultProviders();
  }

  registerDefaultProviders() {
    const idm = new IDMVTONProvider();
    const cat = new CatVTONProvider();
    const dedicated = new DedicatedGPUProvider();

    this.providers.set(idm.name, idm);
    this.providers.set(cat.name, cat);
    this.providers.set(dedicated.name, dedicated);
  }

  getProvider(name) {
    const providerName = (name || '').toLowerCase().trim();
    return this.providers.get(providerName) || null;
  }

  /**
   * Main entry point to process Virtual Try-On using provider failover architecture
   */
  async processVirtualTryOn({
    personImageBuffer,
    personMimeType = 'image/png',
    customGarmentBuffer = null,
    garmentImageUrl = null,
    garmentFileName = 'garment.png',
    category = 'upper',
    requestId = null
  }) {
    const startTime = Date.now();
    const currentReqId = requestId || `VTON_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Read dynamic environment configurations
    const primaryName = (process.env.VTON_PRIMARY_PROVIDER || 'idm-vton').toLowerCase().trim();
    const fallbackName = (process.env.VTON_FALLBACK_PROVIDER || 'catvton').toLowerCase().trim();
    const timeoutMs = parseInt(process.env.VTON_TIMEOUT, 10) || 120000;
    const maxRetries = Math.max(1, parseInt(process.env.VTON_MAX_RETRIES, 10) || 2);
    const cooldownMs = parseInt(process.env.VTON_COOLDOWN_PERIOD, 10) || 180000;

    console.log(`\n==================================================`);
    console.log(`[VTON Manager] Starting Request ID: ${currentReqId}`);
    console.log(`[VTON Manager] Primary Provider: '${primaryName}' | Fallback Provider: '${fallbackName}'`);
    console.log(`[VTON Manager] Configured Timeout: ${timeoutMs / 1000}s | Max Retries: ${maxRetries} | Cooldown: ${cooldownMs / 1000}s`);

    let tempPersonPath = null;
    let tempGarmentPath = null;

    try {
      // 1. Resolve Raw Garment Buffer
      let rawGarmentBuffer;
      if (customGarmentBuffer && Buffer.isBuffer(customGarmentBuffer)) {
        rawGarmentBuffer = customGarmentBuffer;
      } else if (garmentImageUrl) {
        rawGarmentBuffer = await fetchGarmentBuffer(garmentImageUrl);
      } else {
        throw new Error('GARMENT_IMAGE_LOAD_FAILED: No garment buffer or URL provided');
      }

      // 2. Compute Hashes (Sanitized, no URLs logged)
      const personHash = crypto.createHash('sha256').update(personImageBuffer).digest('hex').substring(0, 16);
      const garmentHash = crypto.createHash('sha256').update(rawGarmentBuffer).digest('hex').substring(0, 16);
      console.log(`[VTON Manager] Person SHA256: ${personHash} | Garment SHA256: ${garmentHash}`);

      // 3. Normalize Person & Garment Images to filesystem
      const normalizedPersonBuffer = await normalizeImageToRGBPng(personImageBuffer, 'Person Image');
      tempPersonPath = path.join(os.tmpdir(), `vton_${currentReqId}_person.png`);
      fs.writeFileSync(tempPersonPath, normalizedPersonBuffer);

      const normalizedGarmentBuffer = await normalizeImageToRGBPng(rawGarmentBuffer, 'Garment Image');
      tempGarmentPath = path.join(os.tmpdir(), `vton_${currentReqId}_garment.png`);
      fs.writeFileSync(tempGarmentPath, normalizedGarmentBuffer);

      // 4. Resolve Providers
      const primaryProvider = this.getProvider(primaryName);
      const fallbackProvider = this.getProvider(fallbackName);

      if (!primaryProvider) {
        throw new Error(`Configured primary VTON provider '${primaryName}' is invalid or missing`);
      }

      let resultUrl = null;
      let usedProvider = null;

      // --- STEP A: TRY PRIMARY PROVIDER ---
      const primaryAvailable = await primaryProvider.isAvailable();
      if (primaryAvailable) {
        console.log(`[VTON Manager] Primary Provider '${primaryProvider.name}' is available. Attempting execution...`);
        try {
          resultUrl = await this.executeProviderWithRetry({
            provider: primaryProvider,
            personImagePath: tempPersonPath,
            garmentImagePath: tempGarmentPath,
            category,
            requestId: currentReqId,
            maxRetries,
            timeoutMs,
            garmentFileName
          });
          usedProvider = primaryProvider.name;
          primaryProvider.resetCooldown();
        } catch (err) {
          console.warn(`[VTON Manager] Primary Provider '${primaryProvider.name}' failed: ${err.message}`);
          
          // Mark Primary Provider on Cooldown if quota/queue or timeout error
          if (err instanceof VTONQuotaError || err instanceof VTONTimeoutError || primaryProvider.consecutiveFailures >= maxRetries) {
            console.warn(`[VTON Manager] Triggering COOLDOWN for Primary Provider '${primaryProvider.name}' for ${cooldownMs / 1000}s`);
            primaryProvider.markCooldown(cooldownMs);
          }
        }
      } else {
        console.warn(`[VTON Manager] Primary Provider '${primaryProvider.name}' is currently on COOLDOWN. Skipping to fallback...`);
      }

      // --- STEP B: TRY FALLBACK PROVIDER IF PRIMARY FAILED ---
      if (!resultUrl && fallbackProvider) {
        const fallbackAvailable = await fallbackProvider.isAvailable();
        if (fallbackAvailable) {
          console.log(`[VTON Manager] Activating Fallback Provider '${fallbackProvider.name}'...`);
          try {
            resultUrl = await this.executeProviderWithRetry({
              provider: fallbackProvider,
              personImagePath: tempPersonPath,
              garmentImagePath: tempGarmentPath,
              category,
              requestId: currentReqId,
              maxRetries,
              timeoutMs,
              garmentFileName
            });
            usedProvider = fallbackProvider.name;
            fallbackProvider.resetCooldown();
          } catch (err) {
            console.error(`[VTON Manager] Fallback Provider '${fallbackProvider.name}' failed: ${err.message}`);
            if (err instanceof VTONQuotaError || err instanceof VTONTimeoutError || fallbackProvider.consecutiveFailures >= maxRetries) {
              fallbackProvider.markCooldown(cooldownMs);
            }
          }
        } else {
          console.warn(`[VTON Manager] Fallback Provider '${fallbackProvider.name}' is also on COOLDOWN.`);
        }
      }

      // --- STEP C: IF BOTH PROVIDERS FAILED ---
      if (!resultUrl) {
        const totalDuration = Date.now() - startTime;
        console.error(`[VTON Manager] ALL providers exhausted/unavailable for Request ID: ${currentReqId} after ${totalDuration}ms`);
        throw new VTONAllProvidersUnavailableError('Virtual try-on is temporarily unavailable. Please try again shortly.');
      }

      // 5. Cloudinary / Base64 Output Resolution
      if (fs.existsSync(resultUrl)) {
        const fileBuffer = fs.readFileSync(resultUrl);
        try {
          const cloudRes = await uploadImageBuffer(fileBuffer, 'shaili_vton_results', ['vton_result']);
          resultUrl = cloudRes.secure_url;
        } catch (cErr) {
          const base64Data = fileBuffer.toString('base64');
          resultUrl = `data:image/png;base64,${base64Data}`;
        }
      }

      const totalDuration = Date.now() - startTime;
      console.log(`[VTON Manager] Request ID: ${currentReqId} completed successfully using '${usedProvider}' in ${totalDuration}ms`);
      console.log(`==================================================\n`);

      return {
        resultImageUrl: resultUrl,
        provider: usedProvider,
        category,
        requestId: currentReqId,
        durationMs: totalDuration
      };

    } finally {
      // Cleanup temp files
      try {
        if (tempPersonPath && fs.existsSync(tempPersonPath)) fs.unlinkSync(tempPersonPath);
        if (tempGarmentPath && fs.existsSync(tempGarmentPath)) fs.unlinkSync(tempGarmentPath);
      } catch (e) {
        // Ignore file cleanup errors
      }
    }
  }

  /**
   * Helper to execute a provider with exponential backoff retries
   */
  async executeProviderWithRetry({ provider, personImagePath, garmentImagePath, category, requestId, maxRetries, timeoutMs, garmentFileName }) {
    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`[VTON Manager] Provider '${provider.name}' - Attempt ${attempt}/${maxRetries}`);

      if (attempt > 1) {
        const backoffDelay = Math.min(10000, 1000 * Math.pow(2, attempt - 2)); // 1s, 2s, 4s...
        console.log(`[VTON Manager] Exponential backoff: Waiting ${backoffDelay}ms before retry...`);
        await sleep(backoffDelay);
      }

      try {
        const resultUrl = await provider.generateTryOn({
          personImagePath,
          garmentImagePath,
          category,
          requestId,
          options: {
            timeout: timeoutMs,
            garmentFileName
          }
        });

        if (resultUrl) {
          return resultUrl;
        }
      } catch (err) {
        lastError = err;
        provider.consecutiveFailures += 1;
        console.error(`[VTON Manager] Provider '${provider.name}' attempt ${attempt} error: ${err.message}`);

        // If it's a quota / queue error, don't keep hammering the same provider repeatedly
        if (err instanceof VTONQuotaError) {
          console.warn(`[VTON Manager] Immediate queue/quota error detected on '${provider.name}'. Aborting further retries for this provider.`);
          break;
        }
      }
    }

    throw lastError || new Error(`Provider '${provider.name}' failed after ${maxRetries} attempts`);
  }
}

// Export singleton instance
const providerManager = new VTONProviderManager();

module.exports = {
  providerManager,
  VTONProviderManager
};
