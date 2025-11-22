const chatRepository = require('../repositories/chatRepository');
const authRepository = require('../repositories/authRepository');

class ChatService {
  async createConversation(patientUserId, doctorUserId) {
    const conversation = await chatRepository.createConversation(patientUserId, doctorUserId);

    return {
      success: true,
      message: 'Conversation created',
      data: conversation
    };
  }

  // New method: Create conversation with any user (automatically determine roles)
  async createConversationWithUser(currentUserId, targetUserId) {
    // Get user info to determine roles
    const currentUser = await authRepository.findUserById(currentUserId);
    const targetUser = await authRepository.findUserById(targetUserId);

    if (!currentUser || !targetUser) {
      throw new Error('User not found');
    }

    // Only allow patient-doctor conversations
    const validRoles = ['patient', 'doctor'];
    if (!validRoles.includes(currentUser.role) || !validRoles.includes(targetUser.role)) {
      throw new Error('Conversations are only allowed between patients and doctors');
    }

    if (currentUser.role === targetUser.role) {
      throw new Error('Cannot create conversation with same role');
    }

    const conversation = await chatRepository.createConversationGeneric(
      currentUserId, 
      currentUser.role, 
      targetUserId, 
      targetUser.role
    );

    return {
      success: true,
      message: 'Conversation created or retrieved',
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

  async getConversationDetails(conversationId, userId) {
    // Check access
    const hasAccess = await chatRepository.checkConversationAccess(conversationId, userId);
    if (!hasAccess) {
      throw new Error('Access denied to this conversation');
    }

    const conversation = await chatRepository.getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return {
      success: true,
      data: conversation
    };
  }

  async getMessages(conversationId, userId, limit = 50) {
    // Check access
    const hasAccess = await chatRepository.checkConversationAccess(conversationId, userId);
    if (!hasAccess) {
      throw new Error('Access denied to this conversation');
    }

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

    // Check access
    const hasAccess = await chatRepository.checkConversationAccess(conversationId, senderUserId);
    if (!hasAccess) {
      throw new Error('Access denied to this conversation');
    }

    const message = await chatRepository.sendMessage(conversationId, senderUserId, messageContent.trim());

    return {
      success: true,
      message: 'Message sent',
      data: message
    };
  }

  async markAsRead(messageId, userId) {
    const message = await chatRepository.markAsRead(messageId);

    return {
      success: true,
      data: message
    };
  }
}

module.exports = new ChatService();
