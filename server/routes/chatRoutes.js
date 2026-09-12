const express = require('express');
const router = express.Router();
const { optionalProtect } = require('../middleware/authMiddleware');
const { handleChatMessage } = require('../controllers/chatController');

router.post('/message', optionalProtect, handleChatMessage);

module.exports = router;

