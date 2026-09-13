const { Client, handle_file } = require('@gradio/client');
const { VTONProvider, VTONQuotaError, VTONTimeoutError, VTONProviderError } = require('./VTONProvider');

/**
 * Maps clothing category & file metadata to IDM-VTON descriptive string
 */
const mapCategoryToIDMDescription = (category = '', garmentFileName = '') => {
  const cat = (category || '').toLowerCase().trim();
  const file = (garmentFileName || '').toLowerCase();

  if (file.includes('coat') || file.includes('outerwear')) {
    return 'stylish outerwear coat jacket';
  }
  if (file.includes('leather')) {
    return 'black leather jacket';
  }
  if (file.includes('tailoring') || file.includes('suit') || file.includes('blazer')) {
    return 'tailored suit blazer jacket';
  }
  if (cat.includes('bottom') || cat.includes('lower') || cat.includes('pants') || cat.includes('skirt')) {
    return 'pants lower body garment';
  }
  if (cat.includes('dress') || cat.includes('overall')) {
    return 'full body dress outfit';
  }
  return 'upper body shirt garment';
};

class IDMVTONProvider extends VTONProvider {
  constructor(options = {}) {
    super('idm-vton', options);
  }

  get spaceId() {
    return process.env.IDM_VTON_SPACE_ID || 'yisol/IDM-VTON';
  }


  /**
   * Generates Try-On image via IDM-VTON Gradio Client with timeout enforcement
   */
  async generateTryOn({ personImagePath, garmentImagePath, category, requestId, options = {} }) {
    const timeoutMs = options.timeout || parseInt(process.env.VTON_TIMEOUT, 10) || 120000;
    const hfToken = process.env.HF_TOKEN || undefined;
    const garmentDes = mapCategoryToIDMDescription(category, options.garmentFileName || '');

    console.log(`[IDM-VTON Provider] Initiating request ${requestId} (Space: ${this.spaceId}, Timeout: ${timeoutMs / 1000}s)`);

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new VTONTimeoutError(`IDM-VTON request timed out after ${timeoutMs / 1000}s`, this.name));
      }, timeoutMs);
    });

    const executionPromise = (async () => {
      try {
        const clientOptions = {};
        if (hfToken) clientOptions.token = hfToken;

        const app = await Client.connect(this.spaceId, clientOptions);
        const personFileData = handle_file(personImagePath);
        const garmentFileData = handle_file(garmentImagePath);

        console.log(`[IDM-VTON Provider] Submitting job to /tryon endpoint...`);

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

        throw new VTONProviderError('IDM-VTON completed but did not return a valid result payload', this.name);
      } catch (err) {
        if (err instanceof VTONProviderError) throw err;

        const errMsg = (err.message || String(err)).toLowerCase();
        
        // Detect ZeroGPU quota, queue, rate limit, or space busy signals
        if (
          errMsg.includes('zerogpu') ||
          errMsg.includes('quota') ||
          errMsg.includes('exceeded') ||
          errMsg.includes('queue') ||
          errMsg.includes('busy') ||
          errMsg.includes('too many requests') ||
          errMsg.includes('rate limit') ||
          errMsg.includes('503') ||
          errMsg.includes('429')
        ) {
          throw new VTONQuotaError(`IDM-VTON Space is busy or ZeroGPU quota exceeded: ${err.message}`, this.name);
        }

        throw new VTONProviderError(`IDM-VTON execution failed: ${err.message}`, this.name);
      }
    })();

    try {
      const resultUrl = await Promise.race([executionPromise, timeoutPromise]);
      return resultUrl;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }
}

module.exports = IDMVTONProvider;
