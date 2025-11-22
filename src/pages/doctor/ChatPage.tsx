import { useState, useEffect, useRef } from 'react';
import { 
  Layout, Card, List, Avatar, Input, Button, Space, Typography, 
  Badge, Empty, message, Spin 
} from 'antd';
import { 
  UserOutlined, SendOutlined, SearchOutlined, MessageOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

const { Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

interface Conversation {
  id: string;
  patientUserId: string;
  patientName: string;
  patientEmail: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  messageContent: string;
  isRead: boolean;
  createdAt: string;
}

export default function ChatPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = JSON.parse(localStorage.getItem('doctorUser') || '{}').id;

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      // TODO: Implement API call when backend is ready
      // const response = await apiService.getMyConversations(token);
      // setConversations(response.data || []);
      
      // Mock data for now
      setConversations([]);
      
    } catch (error) {
      console.error('Error loading conversations:', error);
      message.error('Không thể tải danh sách hội thoại');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      // TODO: Implement API call when backend is ready
      // const response = await apiService.getMessages(token, conversationId);
      // setMessages(response.data || []);
      
      // Mock data for now
      setMessages([]);
      
    } catch (error) {
      console.error('Error loading messages:', error);
      message.error('Không thể tải tin nhắn');
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversation) return;

    setSending(true);
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      // TODO: Implement API call when backend is ready
      // await apiService.sendMessage(token, selectedConversation, messageText);
      
      setMessageText('');
      // loadMessages(selectedConversation);
      message.info('Chức năng chat đang được phát triển');
      
    } catch (error) {
      console.error('Error sending message:', error);
      message.error('Không thể gửi tin nhắn');
    } finally {
      setSending(false);
    }
  };

  const renderConversationList = () => (
    <Card 
      title="Tin nhắn" 
      extra={<SearchOutlined />}
      bodyStyle={{ padding: 0, height: 'calc(100vh - 200px)', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin />
        </div>
      ) : conversations.length === 0 ? (
        <Empty 
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description="Chưa có cuộc trò chuyện nào"
          style={{ padding: '60px 20px' }}
        />
      ) : (
        <List
          dataSource={conversations}
          renderItem={(conversation) => (
            <List.Item
              onClick={() => setSelectedConversation(conversation.id)}
              style={{
                cursor: 'pointer',
                background: selectedConversation === conversation.id ? '#e6f7ff' : 'transparent',
                padding: '12px 16px'
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={conversation.unreadCount || 0}>
                    <Avatar icon={<UserOutlined />} size={48} />
                  </Badge>
                }
                title={conversation.patientName}
                description={
                  <div>
                    <Text ellipsis style={{ width: 200, display: 'block' }}>
                      {conversation.lastMessage || 'Chưa có tin nhắn'}
                    </Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {conversation.lastMessageTime 
                        ? dayjs(conversation.lastMessageTime).format('HH:mm DD/MM/YYYY')
                        : ''
                      }
                    </Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </Card>
  );

  const renderChatWindow = () => {
    if (!selectedConversation) {
      return (
        <Card style={{ height: 'calc(100vh - 150px)' }}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%' 
          }}>
            <MessageOutlined style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
            <Title level={4}>Chọn một cuộc trò chuyện để bắt đầu</Title>
            <Text type="secondary">Chọn bệnh nhân từ danh sách bên trái</Text>
          </div>
        </Card>
      );
    }

    const selectedConv = conversations.find(c => c.id === selectedConversation);

    return (
      <Card 
        title={
          <Space>
            <Avatar icon={<UserOutlined />} />
            <div>
              <div>{selectedConv?.patientName}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedConv?.patientEmail}
              </Text>
            </div>
          </Space>
        }
        bodyStyle={{ padding: 0 }}
      >
        <div style={{ 
          height: 'calc(100vh - 300px)', 
          overflowY: 'auto',
          padding: '16px',
          background: '#f5f5f5'
        }}>
          {messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">Chưa có tin nhắn nào</Text>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.senderUserId === currentUserId;
              return (
                <div
                  key={message.id}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: 12
                  }}
                >
                  <div
                    style={{
                      maxWidth: '60%',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: isMe ? '#1890ff' : '#fff',
                      color: isMe ? '#fff' : '#000'
                    }}
                  >
                    <div>{message.messageContent}</div>
                    <Text 
                      style={{ 
                        fontSize: 11, 
                        color: isMe ? 'rgba(255,255,255,0.7)' : '#999',
                        display: 'block',
                        textAlign: 'right',
                        marginTop: 4
                      }}
                    >
                      {dayjs(message.createdAt).format('HH:mm')}
                    </Text>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '16px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
          <Space.Compact style={{ width: '100%' }}>
            <TextArea
              placeholder="Nhập tin nhắn..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ flex: 1 }}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={sending}
              disabled={!messageText.trim()}
            >
              Gửi
            </Button>
          </Space.Compact>
        </div>
      </Card>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Layout style={{ background: 'transparent' }}>
          <Sider 
            width={350} 
            style={{ background: 'transparent', marginRight: 16 }}
            breakpoint="lg"
            collapsedWidth="0"
          >
            {renderConversationList()}
          </Sider>
          <Content>
            {renderChatWindow()}
          </Content>
        </Layout>
      </Content>
    </Layout>
  );
}
