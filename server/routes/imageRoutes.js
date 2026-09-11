const express = require('express');
const multer = require('multer');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const {
  uploadImage,
  searchImages,
  getUserImages,
  deleteImage,
  trainModelController,
} = require('../controllers/imageController');

// Multer memory storage configuration for file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware wrapper to handle Multer errors gracefully
const handleUploadMiddleware = (req, res, next) => {
  const uploadSingle = upload.single('image');
  uploadSingle(req, res, (err) => {
    if (err) {
      console.error('Multer Upload Error:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error',
      });
    }
    next();
  });
};

// All image routes are strictly protected
router.use(protect);

// Routes
router.post('/upload', handleUploadMiddleware, uploadImage);
router.post('/train-model', trainModelController);
router.get('/search', searchImages);
router.get('/', getUserImages);
router.delete('/:id', deleteImage);

module.exports = router;
