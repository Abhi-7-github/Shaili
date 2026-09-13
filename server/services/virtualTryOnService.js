const { Client, handle_file } = require('@gradio/client');
const fs = require('fs');
const path = require('path');
const os = require('os');
const sharp = require('sharp');
const crypto = require('crypto');
const { uploadImageBuffer } = require('./cloudinaryService');

/**
 * Hybrid Free Virtual Try-On Service (IDM-VTON Primary, CatVTON Fallback)
 * Primary:  yisol/IDM-VTON (Public Hugging Face Space)
 * Fallback: zhengchong/CatVTON (Public Hugging Face Space)
 */

class VTONQuotaError extends Error {
  constructor(message) {
    super(message);
    this.name = 'VTONQuotaError';
    this.statusCode = 503;
  }
}

/**
 * Normalizes any input image (buffer or file path) to a clean 3-channel RGB PNG buffer.
 * If the image has an alpha channel (RGBA, LA, P), composites it onto a solid white background (#FFFFFF)
 * and strips transparency before encoding as 3-channel sRGB PNG to prevent PIL mode RGBA conversion issues.
 *
 * @param {Buffer|string} inputBufferOrPath - Input image buffer or filesystem path
 * @param {string} labelName - Diagnostic label for logging ('Person Image' | 'Garment Image')
 * @returns {Promise<Buffer>} - Normalized 3-channel RGB PNG Buffer
 */
const normalizeImageToRGBPng = async (inputBufferOrPath, labelName = 'Image') => {
  try {
    const instance = sharp(inputBufferOrPath);
    const metadata = await instance.metadata();

    console.log(
      `[Image Normalizer - ${labelName}] Original Format: ${metadata.format || 'unknown'}, Space: ${metadata.space || 'unknown'}, Channels: ${metadata.channels}, HasAlpha: ${metadata.hasAlpha ? 'true' : 'false'}`
    );

    // Composite alpha transparency onto solid white background (#FFFFFF) and convert to 3-channel sRGB PNG
    const normalizedBuffer = await instance
      .flatten({ background: { r: 255, g: 255, b: 255 } })
      .toColorspace('srgb')
      .png()
      .toBuffer();

    const finalMeta = await sharp(normalizedBuffer).metadata();
    console.log(
      `[Image Normalizer - ${labelName}] Final Format: ${finalMeta.format}, Space: ${finalMeta.space}, Channels: ${finalMeta.channels}, HasAlpha: ${finalMeta.hasAlpha ? 'true' : 'false'}`
    );

    return normalizedBuffer;
  } catch (err) {
    console.error(`[Image Normalizer Error - ${labelName}]:`, err.message);
    throw new Error(`Failed to preprocess ${labelName} for VTON: ${err.message}`);
  }
};

/**
 * Maps Shaili clothing categories & filenames to IDM-VTON garment description string (`garment_des`).
 */
const mapCategoryToIDMDescription = (category = '', garmentFileName = '', garmentImageUrl = '') => {
  const cat = (category || '').toLowerCase().trim();
  const file = (garmentFileName || garmentImageUrl || '').toLowerCase();

  let desc = 'upper body garment';

  if (file.includes('coat') || file.includes('outerwear')) {
    desc = 'stylish outerwear coat jacket';
  } else if (file.includes('leather')) {
    desc = 'black leather jacket';
  } else if (file.includes('tailoring') || file.includes('suit') || file.includes('blazer')) {
    desc = 'tailored suit blazer jacket';
  } else if (cat.includes('bottom') || cat.includes('lower') || cat.includes('pants')) {
    desc = 'pants lower body garment';
  } else if (cat.includes('dress') || cat.includes('overall')) {
    desc = 'full body dress outfit';
  } else if (cat.includes('upper') || cat.includes('top')) {
    desc = 'upper body shirt garment';
  }

  return desc;
};

/**
 * Maps Shaili clothing categories to CatVTON expected values ('upper' | 'lower' | 'overall')
 */
const mapCategoryToCatVTON = (category = '') => {
  const cat = category.toLowerCase().trim();
  if (['tops', 'top', 'upper', 'outerwear', 'jacket', 'blazer', 'shirt', 'polo', 'tshirt'].includes(cat)) {
    return 'upper';
  }
  if (['bottoms', 'bottom', 'lower', 'pants', 'skirt', 'slacks', 'shorts', 'jeans', 'trousers'].includes(cat)) {
    return 'lower';
  }
  if (['dresses', 'dress', 'overall', 'one-pieces', 'one-piece', 'suit', 'ensemble', 'saree'].includes(cat)) {
    return 'overall';
  }
  return 'upper';
};

/**
 * Fetches or resolves garment image as Buffer
 */
const fetchGarmentBuffer = async (url) => {
  if (!url || typeof url !== 'string') {
    throw new Error('GARMENT_IMAGE_LOAD_FAILED: Invalid garment image URL provided');
  }

  try {
    if (url.startsWith('/')) {
      const localPublicPath = path.join(__dirname, '../../client/public', url);
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
    throw new Error(`GARMENT_IMAGE_LOAD_FAILED: Failed to load garment image from ${url} (${err.message})`);
  }
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Call Primary Provider: IDM-VTON (yisol/IDM-VTON)
 */
const callIDMVTON = async (tempPersonPath, tempGarmentPath, garmentDes, hfToken) => {
  const spaceId = process.env.IDM_VTON_SPACE_ID || 'yisol/IDM-VTON';
  console.log(`[IDM-VTON Primary] Connecting to Gradio Space: ${spaceId}...`);

  const clientOptions = {};
  if (hfToken) clientOptions.token = hfToken;

  const app = await Client.connect(spaceId, clientOptions);
  const personFileData = handle_file(tempPersonPath);
  const garmentFileData = handle_file(tempGarmentPath);

  console.log(`[IDM-VTON Primary] Submitting job via /tryon endpoint...`);

  const predictionResult = await app.predict('/tryon', [
    {
      background: personFileData,
      layers: [],
      composite: personFileData
    },
    garmentFileData,
    garmentDes,
    true,  // is_checked (Auto masking)
    false, // is_checked_crop
    30,    // denoise_steps
    42     // seed
  ]);

  if (predictionResult && predictionResult.data && predictionResult.data[0]) {
    const rawData = predictionResult.data[0];
    if (typeof rawData === 'string') return rawData;
    if (rawData && rawData.url) return rawData.url;
    if (rawData && rawData.path) return rawData.path;
  }
  throw new Error('IDM-VTON completed but did not return a valid result image.');
};

/**
 * Call Fallback Provider: CatVTON (zhengchong/CatVTON)
 */
const callCatVTON = async (tempPersonPath, tempGarmentPath, hfToken) => {
  const spaceId = process.env.CATVTON_SPACE_ID || 'zhengchong/CatVTON';
  console.log(`[CatVTON Fallback] Connecting to Gradio Space: ${spaceId}...`);

  const clientOptions = {};
  if (hfToken) clientOptions.token = hfToken;

  const app = await Client.connect(spaceId, clientOptions);
  const personFileData = handle_file(tempPersonPath);
  const garmentFileData = handle_file(tempGarmentPath);

  console.log(`[CatVTON Fallback] Submitting job via /submit_function_p2p endpoint...`);

  const predictionResult = await app.predict('/submit_function_p2p', [
    {
      background: personFileData,
      layers: [],
      composite: personFileData
    },
    garmentFileData,
    50,  // num_inference_steps
    2.5, // guidance_scale
    42   // seed
  ]);

  if (predictionResult && predictionResult.data && predictionResult.data[0]) {
    const rawData = predictionResult.data[0];
    if (typeof rawData === 'string') return rawData;
    if (rawData && rawData.url) return rawData.url;
    if (rawData && rawData.path) return rawData.path;
  }
  throw new Error('CatVTON completed but did not return a valid result image.');
};

/**
 * Executes Virtual Try-On with IDM-VTON (Primary) and CatVTON (Fallback)
 */
const processVirtualTryOn = async ({
  personImageBuffer,
  personMimeType = 'image/png',
  customGarmentBuffer = null,
  garmentImageUrl = null,
  garmentFileName = 'garment.png',
  category = 'upper',
  requestId = null
}) => {
  let tempPersonPath = null;
  let tempGarmentPath = null;

  try {
    const currentReqId = requestId || `VTON_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const catvtonCategory = mapCategoryToCatVTON(category);
    const idmGarmentDes = mapCategoryToIDMDescription(category, garmentFileName, garmentImageUrl);

    console.log(`\n[VTON Service] Initiating Request ID: ${currentReqId}`);
    console.log(`[VTON Service] Category: ${category} | CatVTON Category: ${catvtonCategory} | IDM Description: "${idmGarmentDes}"`);

    // 1. Resolve raw Garment Buffer
    let rawGarmentBuffer;
    if (customGarmentBuffer && Buffer.isBuffer(customGarmentBuffer)) {
      rawGarmentBuffer = customGarmentBuffer;
    } else if (garmentImageUrl) {
      rawGarmentBuffer = await fetchGarmentBuffer(garmentImageUrl);
    } else {
      throw new Error('GARMENT_IMAGE_LOAD_FAILED: No garment buffer or URL provided');
    }

    // 2. Compute SHA-256 hashes for debugging & verification
    const personHash = crypto.createHash('sha256').update(personImageBuffer).digest('hex').substring(0, 16);
    const garmentHash = crypto.createHash('sha256').update(rawGarmentBuffer).digest('hex').substring(0, 16);

    console.log(`[VTON HASH] person: ${personHash} | garment: ${garmentHash}`);
    if (personHash === garmentHash) {
      console.warn('[VTON WARNING] Person image and Garment image have identical hashes!');
    }

    // 3. Normalize Person Image buffer to 3-channel RGB PNG
    const normalizedPersonBuffer = await normalizeImageToRGBPng(personImageBuffer, 'Person Image');
    tempPersonPath = path.join(os.tmpdir(), `vton_${currentReqId}_person.png`);
    fs.writeFileSync(tempPersonPath, normalizedPersonBuffer);

    // 4. Normalize Garment Image buffer to 3-channel RGB PNG
    const normalizedGarmentBuffer = await normalizeImageToRGBPng(rawGarmentBuffer, 'Garment Image');
    tempGarmentPath = path.join(os.tmpdir(), `vton_${currentReqId}_garment.png`);
    fs.writeFileSync(tempGarmentPath, normalizedGarmentBuffer);

    const hfToken = process.env.HF_TOKEN || undefined;
    let resultUrl = null;
    let usedProvider = null;

    // --- STEP 1: Attempt Primary Provider (IDM-VTON) ---
    console.log('\n--- PRIMARY PROVIDER: IDM-VTON ---');
    try {
      resultUrl = await callIDMVTON(tempPersonPath, tempGarmentPath, idmGarmentDes, hfToken);
      usedProvider = 'IDM-VTON (Primary)';
      console.log(`[IDM-VTON] Success! Output image obtained.`);
    } catch (idmErr) {
      console.error('[IDM-VTON Error]:', idmErr.message || idmErr);
      console.log('--- FALLING BACK TO SECONDARY PROVIDER: CatVTON ---');

      // --- STEP 2: Fallback Provider (CatVTON) with 3 Attempts ---
      const maxAttempts = 3;
      const backoffDelays = [0, 5000, 15000];

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`[CatVTON Fallback] Attempt ${attempt}/${maxAttempts}`);

        if (attempt > 1) {
          const delayMs = backoffDelays[attempt - 1] || 5000;
          console.log(`[CatVTON Fallback] Busy - retrying in ${delayMs / 1000} seconds...`);
          await sleep(delayMs);
        }

        try {
          resultUrl = await callCatVTON(tempPersonPath, tempGarmentPath, hfToken);
          usedProvider = 'CatVTON (Fallback)';
          console.log(`[CatVTON Fallback] Success on attempt ${attempt}!`);
          break;
        } catch (catErr) {
          console.error(`[CatVTON Error - Attempt ${attempt}/${maxAttempts}]:`, catErr.message || catErr);
          if (attempt === maxAttempts) {
            throw new VTONQuotaError('All VTON providers (IDM-VTON and CatVTON) are currently busy. Please try again later.');
          }
        }
      }
    }

    if (!resultUrl) {
      throw new VTONQuotaError('Virtual Try-On providers are currently busy. Please try again later.');
    }

    // 5. If output is a local temp file returned by Gradio client, upload to Cloudinary or serve as base64
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

    return {
      resultImageUrl: resultUrl,
      provider: usedProvider,
      category: catvtonCategory,
      requestId: currentReqId
    };

  } catch (err) {
    console.error('[VTON Service Final Error]:', err.stack || err);
    throw err;
  } finally {
    try {
      if (tempPersonPath && fs.existsSync(tempPersonPath)) fs.unlinkSync(tempPersonPath);
      if (tempGarmentPath && fs.existsSync(tempGarmentPath)) fs.unlinkSync(tempGarmentPath);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
};

module.exports = {
  processVirtualTryOn,
  CatVTONQuotaError: VTONQuotaError
};
