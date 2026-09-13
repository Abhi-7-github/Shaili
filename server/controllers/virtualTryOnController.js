const { processVirtualTryOn, CatVTONQuotaError } = require('../services/virtualTryOnService');

/**
 * Controller for Virtual Try-On API
 * POST /api/virtual-tryon
 */
const handleVirtualTryOn = async (req, res) => {
  try {
    // 1. Resolve person photo file upload
    const personFile = (req.files && req.files.personImage && req.files.personImage[0]) || req.file;
    if (!personFile || !personFile.buffer) {
      return res.status(400).json({
        success: false,
        error: 'MISSING_PERSON_PHOTO',
        message: 'Please upload a photo of yourself (personImage file is required).'
      });
    }

    // 2. Resolve garment image priority: Custom garment file > Preset garment URL
    const customGarmentFile = req.files && req.files.garmentImage && req.files.garmentImage[0];
    const { garmentImageUrl, category = 'upper', requestId } = req.body;

    let targetGarmentBuffer = null;
    let targetGarmentUrl = null;
    let garmentFileName = 'preset_garment';

    if (customGarmentFile && customGarmentFile.buffer) {
      targetGarmentBuffer = customGarmentFile.buffer;
      garmentFileName = customGarmentFile.originalname || 'custom_garment.png';
      console.log(`[VTON Controller] Using Custom Uploaded Garment: ${garmentFileName}`);
    } else if (garmentImageUrl && typeof garmentImageUrl === 'string' && garmentImageUrl.trim()) {
      targetGarmentUrl = garmentImageUrl.trim();
      garmentFileName = targetGarmentUrl;
      console.log(`[VTON Controller] Using Preset Garment URL: ${targetGarmentUrl}`);
    } else {
      return res.status(400).json({
        success: false,
        error: 'MISSING_GARMENT',
        message: 'Please select or upload a garment image.'
      });
    }

    console.log(`[VTON Controller] Processing CatVTON Try-On for user ${req.user?._id || 'authenticated'}`);
    console.log(`[VTON Controller] Category: ${category}, Request ID: ${requestId || 'N/A'}`);

    // 3. Process Virtual Try-On via CatVTON ZeroGPU provider
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
    console.error('[VTON Controller Error]:', err.message);

    if (err instanceof CatVTONQuotaError || err.name === 'CatVTONQuotaError') {
      return res.status(503).json({
        success: false,
        error: 'ZEROGPU_QUOTA_EXHAUSTED',
        message: err.message,
        details: 'Free Hugging Face ZeroGPU queue or quota is temporarily busy. Please retry in a few moments.'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'VTON_GENERATION_FAILED',
      message: err.message || 'Virtual Try-On generation failed. Please try again with a clear photo.'
    });
  }
};

module.exports = {
  handleVirtualTryOn
};
