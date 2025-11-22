import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Layout, Card, Row, Col, Descriptions, Typography, Button, Space, 
  Table, Tag, Tabs, message, Spin, Avatar, Statistic 
} from 'antd';
import { 
  ArrowLeftOutlined, UserOutlined, PhoneOutlined, MailOutlined,
  CalendarOutlined, HeartOutlined, MessageOutlined, BarChartOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

const { Content } = Layout;
const { Title, Text } = Typography;
const { TabPane } = Tabs;

export default function PatientDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    loadPatientData();
  }, [id]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token || !id) return;

      // Load patient detail
      const patientRes: any = await apiService.getPatientDetail(token, id);
      if (patientRes?.success) {
        setPatient(patientRes.data);
      }

      // Load patient appointments
      const appointmentsRes: any = await apiService.getPatientAppointments(token, id);
      if (appointmentsRes?.success) {
        setAppointments(appointmentsRes.data || []);
      }

    } catch (error) {
      console.error('Error loading patient data:', error);
      message.error('Không thể tải thông tin bệnh nhân');
    } finally {
      setLoading(false);
    }
  };

  const appointmentColumns = [
    {
      title: 'Ngày khám',
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
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: any = {
          scheduled: { color: 'blue', text: 'Đã đặt lịch' },
          completed: { color: 'green', text: 'Hoàn thành' },
          cancelled: { color: 'red', text: 'Đã hủy' },
        };
        return <Tag color={statusMap[status]?.color}>{statusMap[status]?.text}</Tag>;
      },
    },
    {
      title: 'Ghi chú',
      dataIndex: 'notes',
      key: 'notes',
    },
  ];

  if (loading) {
    return (
      <Layout style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (!patient) {
    return (
      <Layout style={{ minHeight: '100vh', padding: '24px' }}>
        <Content>
          <Card>
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <Title level={4}>Không tìm thấy thông tin bệnh nhân</Title>
              <Button type="primary" onClick={() => navigate('/doctor/dashboard')}>
                Quay lại Dashboard
              </Button>
            </div>
          </Card>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/doctor/dashboard')}
          style={{ marginBottom: 16 }}
        >
          Quay lại
        </Button>

        <Row gutter={[16, 16]}>
          {/* Patient Info Card */}
          <Col xs={24} lg={8}>
            <Card>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <Avatar size={100} icon={<UserOutlined />} />
                <Title level={3} style={{ marginTop: 16, marginBottom: 0 }}>
                  {patient.fullName || 'Chưa cập nhật'}
                </Title>
              </div>

              <Descriptions column={1} bordered size="small">
                <Descriptions.Item label={<><MailOutlined /> Email</>}>
                  {patient.email || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>
                  {patient.phoneNumber || 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label={<><CalendarOutlined /> Ngày sinh</>}>
                  {patient.dateOfBirth ? dayjs(patient.dateOfBirth).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                </Descriptions.Item>
                <Descriptions.Item label="Giới tính">
                  {patient.gender === 'male' ? 'Nam' : patient.gender === 'female' ? 'Nữ' : 'Khác'}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {patient.address || 'Chưa cập nhật'}
                </Descriptions.Item>
              </Descriptions>

              <Space direction="vertical" style={{ width: '100%', marginTop: 16 }}>
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />} 
                  block
                  onClick={() => {
                    navigate('/doctor/dashboard');
                    // Set tab to chat after navigation
                    setTimeout(() => {
                      const event = new CustomEvent('selectTab', { detail: 'chat' });
                      window.dispatchEvent(event);
                    }, 100);
                  }}
                >
                  Gửi tin nhắn
                </Button>
              </Space>
            </Card>

            {/* Stats Card */}
            <Card style={{ marginTop: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Tổng lịch hẹn"
                    value={patient?.totalAppointments || 0}
                    prefix={<CalendarOutlined />}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Đã hoàn thành"
                    value={patient?.completedAppointments || 0}
                    prefix={<HeartOutlined />}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={16}>
            <Card>
              <Tabs defaultActiveKey="appointments">
                <TabPane tab="Lịch sử khám" key="appointments">
                  <Table
                    columns={appointmentColumns}
                    dataSource={appointments}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                  />
                </TabPane>

                <TabPane tab="Biểu đồ chỉ số" key="metrics">
                  <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <BarChartOutlined style={{ fontSize: 64, color: '#ccc', marginBottom: 16 }} />
                    <Title level={4}>Biểu đồ chỉ số sức khỏe</Title>
                    <Text type="secondary">Tính năng biểu đồ đang được phát triển</Text>
                  </div>
                </TabPane>
              </Tabs>
            </Card>
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
