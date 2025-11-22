import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, Menu, Avatar, Dropdown, Space, Typography, Card, Row, Col, Statistic, Table, Tag, Button, Tabs, Calendar, Badge, List, Input, message } from 'antd';
import { 
  UserOutlined, LogoutOutlined, CalendarOutlined, TeamOutlined, 
  MessageOutlined, BarChartOutlined, DashboardOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import type { MenuProps, BadgeProps } from 'antd';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Search } = Input;

export default function DoctorDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<any>({});
  const [appointments, setAppointments] = useState<any[]>([]);
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('doctorToken');
    const userData = localStorage.getItem('doctorUser');
    
    if (!token || !userData) {
      navigate('/doctor/login');
      return;
    }
    
    setUser(JSON.parse(userData));
    loadDashboardData();
  }, [navigate]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;
      
      // Load dashboard stats
      const statsRes: any = await apiService.getDoctorDashboardStats(token);
      if (statsRes?.success) {
        setStats(statsRes.data);
      }

      // Load appointments
      const appointmentsRes: any = await apiService.getDoctorAppointments(token);
      if (appointmentsRes?.success) {
        setAppointments(appointmentsRes.data || []);
      }

      // Load patients
      const patientsRes: any = await apiService.getDoctorPatients(token, 20);
      if (patientsRes?.success) {
        setPatients(patientsRes.data || []);
      }

    } catch (error: any) {
      console.error('Error loading dashboard data:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctorToken');
    localStorage.removeItem('doctorUser');
    navigate('/doctor/login');
  };

  const userMenu: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems = [
    {
      key: 'overview',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
    },
    {
      key: 'calendar',
      icon: <CalendarOutlined />,
      label: 'Lịch khám',
    },
    {
      key: 'appointments',
      icon: <ClockCircleOutlined />,
      label: 'Quản lý lịch hẹn',
    },
    {
      key: 'patients',
      icon: <TeamOutlined />,
      label: 'Bệnh nhân',
    },
    {
      key: 'chat',
      icon: <MessageOutlined />,
      label: 'Tin nhắn',
    },
    {
      key: 'metrics',
      icon: <BarChartOutlined />,
      label: 'Chỉ số sức khỏe',
    },
  ];

  const appointmentColumns = [
    {
      title: 'Ngày',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: (text: string) => dayjs(text).format('DD/MM/YYYY'),
    },
    {
      title: 'Giờ',
      key: 'time',
      render: (_: any, record: any) => 
        `${record.slotStartTime?.substring(0, 5)} - ${record.slotEndTime?.substring(0, 5)}`,
    },
    {
      title: 'Bệnh nhân',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Email',
      dataIndex: 'patientEmail',
      key: 'patientEmail',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          scheduled: { color: 'blue', text: 'Đã đặt lịch' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text || status}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: true,
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="link" 
            size="small" 
            onClick={() => navigate(`/doctor/patients/${record.patientUserId}`)}
          >
            Xem hồ sơ
          </Button>
          {record.status === 'scheduled' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleUpdateStatus(record.id, 'completed')}
              >
                Hoàn thành
              </Button>
              <Button 
                danger 
                size="small" 
                onClick={() => handleCancelAppointment(record.id)}
              >
                Hủy
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;
      
      await apiService.updateAppointmentStatus(token, id, status);
      message.success('Cập nhật trạng thái thành công');
      loadDashboardData();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Cập nhật thất bại');
    }
  };

  const handleCancelAppointment = async (id: string) => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;
      
      await apiService.cancelAppointment(token, id);
      message.success('Đã hủy lịch hẹn');
      loadDashboardData();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      message.error('Hủy lịch hẹn thất bại');
    }
  };

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(apt => 
      apt.appointmentDate === dateStr
    );
    return dayAppointments.map(apt => ({
      type: apt.status === 'scheduled' ? 'success' : apt.status === 'completed' ? 'default' : 'error',
      content: `${apt.slotStartTime?.substring(0, 5)} - ${apt.patientName}`,
    }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge status={item.type as BadgeProps['status']} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  const renderOverview = () => (
    <>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng lịch hẹn"
              value={stats.totalAppointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Hôm nay"
              value={stats.todayAppointments || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Sắp tới"
              value={stats.upcomingAppointments || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng bệnh nhân"
              value={stats.totalPatients || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Lịch hẹn gần đây" style={{ marginBottom: 24 }}>
        <Table
          columns={appointmentColumns}
          dataSource={appointments.slice(0, 5)}
          rowKey="id"
          loading={loading}
          pagination={false}
        />
      </Card>
    </>
  );

  const renderCalendar = () => (
    <Card>
      <Button 
        type="primary" 
        onClick={() => navigate('/doctor/schedule')}
        style={{ marginBottom: 16 }}
      >
        Quản lý lịch làm việc chi tiết
      </Button>
      <Calendar dateCellRender={dateCellRender} />
    </Card>
  );

  const renderAppointments = () => (
    <Card title="Quản lý lịch hẹn">
      <Table
        columns={appointmentColumns}
        dataSource={appointments}
        rowKey="id"
        loading={loading}
      />
    </Card>
  );

  const renderPatients = () => (
    <Card title="Danh sách bệnh nhân">
      <Search
        placeholder="Tìm kiếm bệnh nhân..."
        style={{ marginBottom: 16 }}
        size="large"
      />
      <List
        dataSource={patients}
        loading={loading}
        locale={{ emptyText: 'Chưa có bệnh nhân nào' }}
        renderItem={(patient: any) => (
          <List.Item
            actions={[
              <Button 
                type="link" 
                onClick={() => navigate(`/doctor/patients/${patient.id}`)}
              >
                Xem hồ sơ
              </Button>,
              <Button 
                type="primary" 
                icon={<MessageOutlined />}
                onClick={() => navigate('/doctor/chat')}
              >
                Nhắn tin
              </Button>
            ]}
          >
            <List.Item.Meta
              avatar={<Avatar icon={<UserOutlined />} size={48} />}
              title={patient.fullName || 'Chưa cập nhật'}
              description={
                <Space direction="vertical" size={0}>
                  <Text type="secondary">{patient.email}</Text>
                  <Text type="secondary">
                    Số điện thoại: {patient.phoneNumber || 'Chưa cập nhật'}
                  </Text>
                  <Text type="secondary">
                    Tổng lịch hẹn: {patient.totalAppointments || 0} | 
                    Lần khám gần nhất: {patient.lastAppointmentDate ? dayjs(patient.lastAppointmentDate).format('DD/MM/YYYY') : 'Chưa có'}
                  </Text>
                </Space>
              }
            />
          </List.Item>
        )}
      />
    </Card>
  );

  const renderChat = () => {
    navigate('/doctor/chat');
    return null;
  };

  const renderMetrics = () => (
    <Card>
      <div style={{ textAlign: 'center', padding: '60px 20px' }}>
        <BarChartOutlined style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
        <Title level={4}>Chỉ số sức khỏe</Title>
        <Text type="secondary">Xem và theo dõi chỉ số sức khỏe của bệnh nhân</Text>
      </div>
    </Card>
  );

  const renderContent = () => {
    switch (selectedTab) {
      case 'overview':
        return renderOverview();
      case 'calendar':
        return renderCalendar();
      case 'appointments':
        return renderAppointments();
      case 'patients':
        return renderPatients();
      case 'chat':
        return renderChat();
      case 'metrics':
        return renderMetrics();
      default:
        return renderOverview();
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ color: 'white', margin: 0 }}>
          🩺 Dashboard Bác sĩ
        </Title>
        <Dropdown menu={{ items: userMenu }} placement="bottomRight">
          <Space style={{ cursor: 'pointer' }}>
            <Avatar icon={<UserOutlined />} />
            <Text style={{ color: 'white' }}>{user.email}</Text>
          </Space>
        </Dropdown>
      </Header>
      
      <Layout>
        <Sider 
          width={250}
          breakpoint="lg"
          collapsedWidth="0"
          style={{ background: '#fff' }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedTab]}
            items={menuItems}
            onClick={({ key }) => setSelectedTab(key)}
            style={{ height: '100%', borderRight: 0 }}
          />
        </Sider>
        
        <Layout style={{ padding: '24px' }}>
          <Content>
            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}
