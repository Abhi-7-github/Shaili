class VTONProviderError extends Error {
  constructor(message, providerName = 'unknown', isQuotaError = false, isTimeout = false) {
    super(message);
    this.name = 'VTONProviderError';
    this.providerName = providerName;
    this.isQuotaError = isQuotaError;
    this.isTimeout = isTimeout;
  }
}

class VTONQuotaError extends VTONProviderError {
  constructor(message, providerName = 'unknown') {
    super(message, providerName, true, false);
    this.name = 'VTONQuotaError';
  }
}

class VTONTimeoutError extends VTONProviderError {
  constructor(message, providerName = 'unknown') {
    super(message, providerName, false, true);
    this.name = 'VTONTimeoutError';
  }
}

class VTONAllProvidersUnavailableError extends Error {
  constructor(message = 'Virtual try-on is temporarily unavailable. Please try again shortly.') {
    super(message);
    this.name = 'VTONAllProvidersUnavailableError';
    this.code = 'VTON_TEMPORARILY_UNAVAILABLE';
    this.statusCode = 503;
  }
}

/**
 * Base abstract interface for Virtual Try-On (VTON) Providers
 */
class VTONProvider {
  /**
   * @param {string} name - Unique provider identifier
   * @param {Object} options - Provider configuration options
   */
  constructor(name, options = {}) {
    if (new.target === VTONProvider) {
      throw new TypeError('Cannot construct VTONProvider instances directly');
    }
    this.name = name;
    this.options = options;
    this.cooldownUntil = 0;
    this.consecutiveFailures = 0;
  }

  /**
   * Checks whether provider is available (not on cooldown)
   * @returns {Promise<boolean>|boolean}
   */
  async isAvailable() {
    return Date.now() >= this.cooldownUntil;
  }

  /**
   * Puts provider on cooldown for specified duration (ms)
   * @param {number} durationMs 
   */
  markCooldown(durationMs = 180000) {
    this.cooldownUntil = Date.now() + durationMs;
    console.log(`[VTON Provider Manager] Provider '${this.name}' marked on COOLDOWN for ${Math.round(durationMs / 1000)}s until ${new Date(this.cooldownUntil).toISOString()}`);
  }

  /**
   * Resets cooldown and failure counters
   */
  resetCooldown() {
    this.cooldownUntil = 0;
    this.consecutiveFailures = 0;
  }

  /**
   * Abstract method for executing VTON generation
   * @param {Object} params 
   * @param {string} params.personImagePath - Absolute filesystem path to normalized person PNG
   * @param {string} params.garmentImagePath - Absolute filesystem path to normalized garment PNG
   * @param {string} params.category - Clothing category ('upper' | 'lower' | 'overall')
   * @param {string} params.requestId - Unique request tracking ID
   * @param {Object} [params.options] - Optional additional parameters
   * @returns {Promise<string>} - Output image URL or file path
   */
  async generateTryOn({ personImagePath, garmentImagePath, category, requestId, options = {} }) {
    throw new Error(`generateTryOn method must be implemented by provider subclass '${this.name}'`);
  }
}

module.exports = {
  VTONProvider,
  VTONProviderError,
  VTONQuotaError,
  VTONTimeoutError,
  VTONAllProvidersUnavailableError
};
