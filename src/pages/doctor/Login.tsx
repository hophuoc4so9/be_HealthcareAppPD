import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Title, Text } = Typography;

export default function DoctorLogin() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    if (token) {
      navigate('/doctor/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (values: { email: string; password: string }) => {
    try {
      const response = await apiService.login(values.email, values.password);
      
      if (response.data.user.role !== 'doctor') {
        form.setFields([
          {
            name: 'email',
            errors: ['Tài khoản này không phải là bác sĩ!'],
          },
        ]);
        return;
      }

      localStorage.setItem('doctorToken', response.data.token);
      localStorage.setItem('doctorUser', JSON.stringify(response.data.user));
      navigate('/doctor/dashboard');
    } catch (err: any) {
      form.setFields([
        {
          name: 'password',
          errors: [err.response?.data?.message || 'Đăng nhập thất bại'],
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
            🩺 Đăng nhập Bác sĩ
          </Title>
          <Text type="secondary">Truy cập vào hệ thống quản lý bệnh nhân</Text>
        </div>

        <Form
          form={form}
          name="doctorLogin"
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="doctor@example.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập mật khẩu"
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
                border: 'none',
                marginBottom: '16px'
              }}
            >
              Đăng nhập
            </Button>
            
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Chưa có tài khoản? <Link to="/doctor/register">Đăng ký ngay</Link>
              </Text>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
