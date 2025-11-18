import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Typography } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const response = await apiService.login(values.email, values.password);
      
      if (response.data.user.role !== 'admin') {
        form.setFields([
          {
            name: 'email',
            errors: ['Access denied. Admin account required.'],
          },
        ]);
        return;
      }

      localStorage.setItem('adminToken', response.data.token);
      localStorage.setItem('adminUser', JSON.stringify(response.data.user));
      navigate('/admin/dashboard');
    } catch (err: any) {
      form.setFields([
        {
          name: 'password',
          errors: [err.response?.data?.message || 'Login failed'],
        },
      ]);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: '450px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <MedicineBoxOutlined style={{ fontSize: '64px', color: '#667eea', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
            Healthcare Admin
          </Title>
          <Text type="secondary">Sign in to access admin panel</Text>
        </div>

        <Alert
          message="Default Credentials"
          description={
            <div>
              <div><strong>Email:</strong> admin@healthcare.com</div>
              <div><strong>Password:</strong> Admin123456</div>
            </div>
          }
          type="info"
          showIcon
          style={{ marginBottom: '24px' }}
        />

        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="admin@healthcare.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please input your password!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Enter your password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button 
              type="primary" 
              htmlType="submit" 
              block
              style={{ 
                height: '48px',
                fontSize: '16px',
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                border: 'none'
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
