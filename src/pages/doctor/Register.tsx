import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, Select, message } from 'antd';
import { UserOutlined, LockOutlined, MedicineBoxOutlined, PhoneOutlined, IdcardOutlined } from '@ant-design/icons';
import apiService from '../../services/apiService';

const { Title, Text } = Typography;
const { TextArea } = Input;

export default function DoctorRegister() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleRegister = async (values: any) => {
    try {
      await apiService.post('/auth/register', {
        ...values,
        role: 'doctor'
      });

      message.success('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        navigate('/doctor/login');
      }, 2000);
    } catch (err: any) {
      message.error(err.response?.data?.message || 'Đăng ký thất bại!');
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
          maxWidth: '600px',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <MedicineBoxOutlined style={{ fontSize: '64px', color: '#667eea', marginBottom: '16px' }} />
          <Title level={2} style={{ margin: 0, color: '#1a1a1a' }}>
            🩺 Đăng ký Bác sĩ
          </Title>
          <Text type="secondary">Tạo tài khoản để bắt đầu khám bệnh trực tuyến</Text>
        </div>

        <Form
          form={form}
          name="doctorRegister"
          onFinish={handleRegister}
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
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Tối thiểu 6 ký tự"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Nhập lại mật khẩu"
            />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input 
              prefix={<IdcardOutlined />} 
              placeholder="Bác sĩ Nguyễn Văn A"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="0912345678"
            />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Chuyên khoa"
            rules={[{ required: true, message: 'Vui lòng chọn chuyên khoa!' }]}
          >
            <Select placeholder="-- Chọn chuyên khoa --">
              <Select.Option value="Nội khoa">Nội khoa</Select.Option>
              <Select.Option value="Ngoại khoa">Ngoại khoa</Select.Option>
              <Select.Option value="Nhi khoa">Nhi khoa</Select.Option>
              <Select.Option value="Sản phụ khoa">Sản phụ khoa</Select.Option>
              <Select.Option value="Tim mạch">Tim mạch</Select.Option>
              <Select.Option value="Thần kinh">Thần kinh</Select.Option>
              <Select.Option value="Da liễu">Da liễu</Select.Option>
              <Select.Option value="Tai mũi họng">Tai mũi họng</Select.Option>
              <Select.Option value="Mắt">Mắt</Select.Option>
              <Select.Option value="Răng hàm mặt">Răng hàm mặt</Select.Option>
              <Select.Option value="Khác">Khác</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="medicalLicenseId"
            label="Số giấy phép hành nghề"
          >
            <Input placeholder="VD: BYT-12345" />
          </Form.Item>

          <Form.Item
            name="clinicAddress"
            label="Địa chỉ phòng khám"
          >
            <TextArea 
              rows={2}
              placeholder="Địa chỉ phòng khám hoặc bệnh viện"
            />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Giới thiệu bản thân"
          >
            <TextArea 
              rows={3}
              placeholder="Kinh nghiệm, bằng cấp, lĩnh vực chuyên môn..."
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
              Đăng ký
            </Button>
            
            <div style={{ textAlign: 'center' }}>
              <Text type="secondary">
                Đã có tài khoản? <Link to="/doctor/login">Đăng nhập ngay</Link>
              </Text>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
