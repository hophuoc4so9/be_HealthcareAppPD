import { Layout, Menu, Avatar, Dropdown, Space } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  FileTextOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const menuItems = [
    {
      key: '/admin/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/admin/dashboard'),
    },
    {
      key: '/admin/users',
      icon: <UserOutlined />,
      label: 'Users Management',
      onClick: () => navigate('/admin/users'),
    },
    {
      key: '/admin/doctors',
      icon: <MedicineBoxOutlined />,
      label: 'Doctor Verification',
      onClick: () => navigate('/admin/doctors'),
    },
    {
      key: '/admin/appointments',
      icon: <CalendarOutlined />,
      label: 'Appointments',
      onClick: () => navigate('/admin/appointments'),
    },
    {
      key: '/admin/articles',
      icon: <FileTextOutlined />,
      label: 'Articles',
      onClick: () => navigate('/admin/articles'),
    },
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh', width: '100%' }}>
      <Sider 
        width={250}
        style={{
          overflow: 'auto',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '20px',
          fontWeight: 'bold',
          background: 'rgba(255, 255, 255, 0.1)',
        }}>
          PD Health Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: 250, width: 'calc(100% - 250px)' }}>
        <Header style={{
          padding: '0 24px',
          background: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          position: 'sticky',
          top: 0,
          zIndex: 99,
          boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          width: '100%',
        }}>
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
              <span>Admin</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{
          margin: 0,
          padding: 0,
          minHeight: 'calc(100vh - 64px)',
          overflow: 'auto',
          width: '100%',
        }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
}
