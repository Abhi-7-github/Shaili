const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { handleChatMessage } = require('../controllers/chatController');

router.use(protect);
router.post('/message', handleChatMessage);

module.exports = router;
