const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateToken, authorize } = require('../middleware/auth');

router.use(authenticateToken);

router.post('/conversations', authorize('patient'), chatController.createConversation);
router.get('/conversations', chatController.getMyConversations);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.post('/conversations/:conversationId/messages', chatController.validateMessage(), chatController.sendMessage);
router.patch('/messages/:messageId/read', chatController.markAsRead);

module.exports = router;
