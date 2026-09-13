const express = require('express');
const multer = require('multer');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { handleVirtualTryOn } = require('../controllers/virtualTryOnController');

// Multer memory storage configuration for person & custom garment image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware wrapper for Multer handling both personImage and custom garmentImage
const handleUploadMiddleware = (req, res, next) => {
  const uploadFields = upload.fields([
    { name: 'personImage', maxCount: 1 },
    { name: 'garmentImage', maxCount: 1 },
  ]);

  uploadFields(req, res, (err) => {
    if (err) {
      console.error('[Multer VTON Upload Error]:', err);
      return res.status(400).json({
        success: false,
        error: 'UPLOAD_ERROR',
        message: err.message || 'File upload error',
      });
    }

    // Set req.file for personImage backwards compatibility
    if (req.files && req.files.personImage && req.files.personImage[0]) {
      req.file = req.files.personImage[0];
    }

    next();
  });
};

// All VTON routes are strictly protected by authentication
router.use(protect);

// POST /api/virtual-tryon
router.post('/', handleUploadMiddleware, handleVirtualTryOn);

module.exports = router;
