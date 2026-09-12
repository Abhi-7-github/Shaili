const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect, optionalProtect } = require('../middleware/authMiddleware');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const {
  analyzeClothing,
  uploadWardrobeItem,
  getWardrobeItems,
  getUnderused,
  getWardrobeItemById,
  updateWardrobeItem,
  deleteWardrobeItem,
} = require('../controllers/wardrobeController');

// Multer memory storage & MIME type validation
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file format. Only image files are allowed.'), false);
    }
  },
});

router.post('/analyze', optionalProtect, aiRateLimiter, upload.single('image'), analyzeClothing);
router.post('/upload', optionalProtect, aiRateLimiter, upload.single('image'), uploadWardrobeItem);
router.get('/underused', optionalProtect, getUnderused);
router.get('/', optionalProtect, getWardrobeItems);
router.get('/:id', optionalProtect, getWardrobeItemById);
router.put('/:id', optionalProtect, updateWardrobeItem);
router.delete('/:id', optionalProtect, deleteWardrobeItem);

module.exports = router;
