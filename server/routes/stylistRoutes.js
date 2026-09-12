const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { aiRateLimiter } = require('../middleware/rateLimiter');
const { generateOutfitRecommendations } = require('../controllers/stylistController');

router.use(protect);
router.post('/generate', aiRateLimiter, generateOutfitRecommendations);

module.exports = router;
