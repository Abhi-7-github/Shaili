const { providerManager } = require('./vton/VTONProviderManager');
const {
  VTONQuotaError,
  VTONTimeoutError,
  VTONAllProvidersUnavailableError
} = require('./vton/VTONProvider');

/**
 * High-level Virtual Try-On Service Entrypoint
 * Refactored to delegate directly to the robust VTONProviderManager architecture.
 */
const processVirtualTryOn = async (params) => {
  return await providerManager.processVirtualTryOn(params);
};

module.exports = {
  processVirtualTryOn,
  CatVTONQuotaError: VTONQuotaError,
  VTONQuotaError,
  VTONTimeoutError,
  VTONAllProvidersUnavailableError
};
