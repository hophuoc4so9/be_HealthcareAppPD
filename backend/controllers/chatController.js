const { body, validationResult } = require('express-validator');
const chatService = require('../services/chatService');

class ChatController {
  validateMessage() {
    return [
      body('messageContent').trim().notEmpty().withMessage('Message content required')
    ];
  }

  validateCreateConversation() {
    return [
      body('targetUserId').isUUID().withMessage('Valid target user ID required')
    ];
  }

  async createConversation(req, res, next) {
    try {
      const { doctorUserId } = req.body;
      const result = await chatService.createConversation(req.user.id, doctorUserId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async createConversationWithUser(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { targetUserId } = req.body;
      const result = await chatService.createConversationWithUser(req.user.id, targetUserId);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMyConversations(req, res, next) {
    try {
      const result = await chatService.getMyConversations(req.user.id, req.user.role);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getConversationDetails(req, res, next) {
    try {
      const { conversationId } = req.params;
      const result = await chatService.getConversationDetails(conversationId, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async getMessages(req, res, next) {
    try {
      const { conversationId } = req.params;
      const { limit } = req.query;
      
      const result = await chatService.getMessages(conversationId, req.user.id, parseInt(limit) || 50);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async sendMessage(req, res, next) {
    try {
      console.log('sendMessage - req.body:', req.body);
      console.log('sendMessage - req.params:', req.params);
      
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { conversationId } = req.params;
      const { messageContent } = req.body;
      
      console.log('Sending message:', { conversationId, messageContent });
      
      const result = await chatService.sendMessage(conversationId, req.user.id, messageContent);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const { messageId } = req.params;
      const result = await chatService.markAsRead(messageId, req.user.id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ChatController();
