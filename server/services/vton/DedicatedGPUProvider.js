const fs = require('fs');
const { VTONProvider, VTONProviderError, VTONQuotaError, VTONTimeoutError } = require('./VTONProvider');

class DedicatedGPUProvider extends VTONProvider {
  constructor(options = {}) {
    super('dedicated-gpu', options);
    this.endpointUrl = process.env.VTON_DEDICATED_GPU_URL || '';
    this.apiKey = process.env.VTON_DEDICATED_GPU_API_KEY || '';
  }

  /**
   * Checks if dedicated GPU endpoint is configured and active
   * @returns {Promise<boolean>}
   */
  async isAvailable() {
    const parentAvailable = await super.isAvailable();
    const isConfigured = Boolean(process.env.VTON_DEDICATED_GPU_URL && process.env.VTON_DEDICATED_GPU_URL.trim());
    return parentAvailable && isConfigured;
  }

  /**
   * Generates Try-On image via HTTP POST call to self-hosted dedicated GPU service
   */
  async generateTryOn({ personImagePath, garmentImagePath, category, requestId, options = {} }) {
    const timeoutMs = options.timeout || parseInt(process.env.VTON_TIMEOUT, 10) || 120000;
    const url = process.env.VTON_DEDICATED_GPU_URL;
    const apiKey = process.env.VTON_DEDICATED_GPU_API_KEY;

    if (!url) {
      throw new VTONProviderError('VTON_DEDICATED_GPU_URL is not configured in environment variables', this.name);
    }

    console.log(`[Dedicated GPU Provider] Sending request ${requestId} to custom GPU endpoint...`);

    let timer;
    const timeoutPromise = new Promise((_, reject) => {
      timer = setTimeout(() => {
        reject(new VTONTimeoutError(`Dedicated GPU request timed out after ${timeoutMs / 1000}s`, this.name));
      }, timeoutMs);
    });

    const executionPromise = (async () => {
      try {
        const personBase64 = fs.readFileSync(personImagePath).toString('base64');
        const garmentBase64 = fs.readFileSync(garmentImagePath).toString('base64');

        const headers = {
          'Content-Type': 'application/json',
        };
        if (apiKey) {
          headers['Authorization'] = `Bearer ${apiKey}`;
          headers['x-api-key'] = apiKey;
        }

        const response = await fetch(url, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            personImage: `data:image/png;base64,${personBase64}`,
            garmentImage: `data:image/png;base64,${garmentBase64}`,
            category,
            requestId,
          }),
        });

        if (!response.ok) {
          if (response.status === 429 || response.status === 503) {
            throw new VTONQuotaError(`Dedicated GPU returned status HTTP ${response.status}`, this.name);
          }
          throw new Error(`Dedicated GPU request failed with status ${response.status}`);
        }

        const data = await response.json();
        const outputUrl = data.imageUrl || data.resultImageUrl || data.url || data.result;

        if (!outputUrl) {
          throw new Error('Dedicated GPU response did not contain a valid result image URL');
        }

        return outputUrl;
      } catch (err) {
        if (err instanceof VTONProviderError) throw err;
        throw new VTONProviderError(`Dedicated GPU error: ${err.message}`, this.name);
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

module.exports = DedicatedGPUProvider;
