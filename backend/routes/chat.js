const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);

// Conversations
router.post('/conversations', authorize('patient'), chatController.createConversation); // Old endpoint (backward compatible)
router.post('/conversations/start', chatController.validateCreateConversation(), chatController.createConversationWithUser); // New endpoint (for any user)
router.get('/conversations', chatController.getMyConversations);
router.get('/conversations/:conversationId', chatController.getConversationDetails);

// Messages
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.validateMessage(), chatController.sendMessage);
router.patch('/messages/:messageId/read', chatController.markAsRead);

module.exports = router;
