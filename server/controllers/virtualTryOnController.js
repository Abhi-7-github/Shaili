const {
  processVirtualTryOn,
  VTONQuotaError,
  VTONAllProvidersUnavailableError
} = require('../services/virtualTryOnService');

/**
 * Controller for Virtual Try-On API
 * Handles POST /api/virtual-try-on (and /api/virtual-tryon)
 */
const handleVirtualTryOn = async (req, res) => {
  const requestId = req.body?.requestId || `VTON_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  try {
    // 1. Resolve person photo file upload
    const personFile = (req.files && req.files.personImage && req.files.personImage[0]) || req.file;
    if (!personFile || !personFile.buffer) {
      return res.status(400).json({
        success: false,
        code: 'MISSING_PERSON_PHOTO',
        message: 'Please upload a photo of yourself (personImage file is required).'
      });
    }

    // 2. Resolve garment image priority: Custom garment file > Preset garment URL
    const customGarmentFile = req.files && req.files.garmentImage && req.files.garmentImage[0];
    const { garmentImageUrl, category = 'upper' } = req.body;

    let targetGarmentBuffer = null;
    let targetGarmentUrl = null;
    let garmentFileName = 'preset_garment';

    if (customGarmentFile && customGarmentFile.buffer) {
      targetGarmentBuffer = customGarmentFile.buffer;
      garmentFileName = customGarmentFile.originalname || 'custom_garment.png';
      console.log(`[VTON Controller] Custom Garment Uploaded: ${garmentFileName}`);
    } else if (garmentImageUrl && typeof garmentImageUrl === 'string' && garmentImageUrl.trim()) {
      targetGarmentUrl = garmentImageUrl.trim();
      garmentFileName = targetGarmentUrl;
      console.log(`[VTON Controller] Preset Garment URL selected`);
    } else {
      return res.status(400).json({
        success: false,
        code: 'MISSING_GARMENT',
        message: 'Please select or upload a garment image.'
      });
    }

    console.log(`[VTON Controller] Request ID ${requestId} started for User ${req.user?._id || 'authenticated'}`);

    // 3. Process Virtual Try-On via Provider Architecture
    const result = await processVirtualTryOn({
      personImageBuffer: personFile.buffer,
      personMimeType: personFile.mimetype,
      customGarmentBuffer: targetGarmentBuffer,
      garmentImageUrl: targetGarmentUrl,
      garmentFileName,
      category: (category || 'upper').trim(),
      requestId
    });

    return res.status(200).json({
      success: true,
      resultImageUrl: result.resultImageUrl,
      provider: result.provider,
      category: result.category,
      requestId: result.requestId,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error(`[VTON Controller Error] Request ID: ${requestId}:`, err.message);

    if (
      err instanceof VTONAllProvidersUnavailableError ||
      err instanceof VTONQuotaError ||
      err.code === 'VTON_TEMPORARILY_UNAVAILABLE' ||
      err.statusCode === 503
    ) {
      return res.status(503).json({
        success: false,
        code: 'VTON_TEMPORARILY_UNAVAILABLE',
        message: 'Virtual try-on is temporarily unavailable. Please try again shortly.',
        requestId
      });
    }

    return res.status(500).json({
      success: false,
      code: 'VTON_GENERATION_FAILED',
      message: err.message || 'Virtual Try-On generation failed. Please try again with a clear photo.',
      requestId
    });
  }
};

module.exports = {
  handleVirtualTryOn
};
