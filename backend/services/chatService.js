const chatRepository = require('../repositories/chatRepository');

class ChatService {
  async createConversation(patientUserId, doctorUserId) {
    const conversation = await chatRepository.createConversation(patientUserId, doctorUserId);

    return {
      success: true,
      message: 'Conversation created',
      data: conversation
    };
  }

  async getMyConversations(userId, role) {
    const conversations = await chatRepository.getConversationsByUserId(userId, role);

    return {
      success: true,
      data: { conversations, count: conversations.length }
    };
  }

  async getMessages(conversationId, limit = 50) {
    const messages = await chatRepository.getMessagesByConversationId(conversationId, limit);

    return {
      success: true,
      data: { messages, count: messages.length }
    };
  }

  async sendMessage(conversationId, senderUserId, messageContent) {
    if (!messageContent || !messageContent.trim()) {
      throw new Error('Message content required');
    }

    const message = await chatRepository.sendMessage(conversationId, senderUserId, messageContent.trim());

    return {
      success: true,
      message: 'Message sent',
      data: message
    };
  }

  async markAsRead(messageId) {
    const message = await chatRepository.markAsRead(messageId);

    return {
      success: true,
      data: message
    };
  }
}

module.exports = new ChatService();
