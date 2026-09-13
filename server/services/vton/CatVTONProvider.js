const { Client, handle_file } = require('@gradio/client');
const { VTONProvider, VTONQuotaError, VTONTimeoutError, VTONProviderError } = require('./VTONProvider');

/**
 * Maps Shaili clothing categories to CatVTON expected strings ('upper' | 'lower' | 'overall')
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

class CatVTONProvider extends VTONProvider {
  constructor(options = {}) {
    super('catvton', options);
  }

  get spaceId() {
    return process.env.CATVTON_SPACE_ID || 'zhengchong/CatVTON';
  }

  /**
   * Generates Try-On image via CatVTON Gradio Client with timeout enforcement
   */
  async generateTryOn({ personImagePath, garmentImagePath, category, requestId, options = {} }) {
    const timeoutMs = options.timeout || parseInt(process.env.VTON_TIMEOUT, 10) || 120000;
    const hfToken = process.env.HF_TOKEN || undefined;
    const catCategory = mapCategoryToCatVTON(category);

    console.log(`[CatVTON Provider] Initiating request ${requestId} (Space: ${this.spaceId}, Category: ${catCategory}, Timeout: ${timeoutMs / 1000}s)`);

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new VTONTimeoutError(`CatVTON request timed out after ${timeoutMs / 1000}s`, this.name));
      }, timeoutMs);
    });

    const executionPromise = (async () => {
      try {
        const clientOptions = {};
        if (hfToken) clientOptions.token = hfToken;

        const app = await Client.connect(this.spaceId, clientOptions);
        const personFileData = handle_file(personImagePath);
        const garmentFileData = handle_file(garmentImagePath);

        console.log(`[CatVTON Provider] Submitting job to /submit_function endpoint...`);

        const predictionResult = await app.predict('/submit_function', [
          {
            background: personFileData,
            layers: [],
            composite: personFileData
          },
          garmentFileData,
          catCategory, // 'upper' | 'lower' | 'overall'
          50,          // num_inference_steps
          2.5,         // guidance_scale (must be <= 7.5)
          42,          // seed
          'result only'// show_type
        ]);

        if (predictionResult && predictionResult.data && predictionResult.data[0]) {
          const rawData = predictionResult.data[0];
          if (typeof rawData === 'string') return rawData;
          if (rawData && rawData.url) return rawData.url;
          if (rawData && rawData.path) return rawData.path;
        }

        throw new VTONProviderError('CatVTON completed but did not return a valid result payload', this.name);
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
          throw new VTONQuotaError(`CatVTON Space is busy or ZeroGPU quota exceeded: ${err.message}`, this.name);
        }

        throw new VTONProviderError(`CatVTON execution failed: ${err.message}`, this.name);
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

module.exports = CatVTONProvider;
