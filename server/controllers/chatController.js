const { generateChatResponse } = require('../services/aiChatService');

const handleChatMessage = async (req, res) => {
  try {
    const { query, history, language } = req.body;
    const userId = req.user ? req.user._id : null;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Query is required' });
    }

    const response = await generateChatResponse(query, history || [], userId, language);

    return res.status(200).json({
      success: true,
      intent: response.intent,
      message: response.message
    });
  } catch (error) {
    console.error('Chat Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error processing chat message'
    });
  }
};

module.exports = {
  handleChatMessage
};
