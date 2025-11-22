import { useState, useEffect } from 'react';
import { 
  Layout, Card, Calendar, Badge, Button, Modal, TimePicker, 
  message, Space, List, Tag, Typography, Row, Col, Statistic 
} from 'antd';
import { 
  PlusOutlined, ClockCircleOutlined, CheckCircleOutlined,
  CloseCircleOutlined, CalendarOutlined
} from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import apiService from '../../services/apiService';

const { Content } = Layout;
const { Title, Text } = Typography;

export default function ScheduleManagement() {
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [showAddModal, setShowAddModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [startTime, setStartTime] = useState<Dayjs | null>(null);
  const [endTime, setEndTime] = useState<Dayjs | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      // Load appointments
      const appointmentsRes = await apiService.getDoctorAppointments(token);
      if ((appointmentsRes as any).success) {
        setAppointments((appointmentsRes as any).data || []);
      }

    } catch (error) {
      console.error('Error loading schedule data:', error);
      message.error('Không thể tải dữ liệu lịch làm việc');
    }
  };

  const handleGenerateDailySlots = async () => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      const dateStr = selectedDate.format('YYYY-MM-DD');
      await apiService.generateDailySlots(token, dateStr);
      message.success('Đã tạo lịch làm việc cho ngày ' + selectedDate.format('DD/MM/YYYY'));
      loadData();
    } catch (error) {
      console.error('Error generating slots:', error);
      message.error('Không thể tạo lịch làm việc');
    }
  };

  const handleToggleDate = async (enable: boolean) => {
    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      const dateStr = selectedDate.format('YYYY-MM-DD');
      await apiService.toggleDateAvailability(token, dateStr, enable);
      message.success(enable ? 'Đã mở lịch làm việc' : 'Đã đóng lịch làm việc');
      loadData();
    } catch (error) {
      console.error('Error toggling availability:', error);
      message.error('Không thể cập nhật trạng thái');
    }
  };

  const handleCreateAvailability = async () => {
    if (!startTime || !endTime) {
      message.warning('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }

    try {
      const token = localStorage.getItem('doctorToken');
      if (!token) return;

      const dateStr = selectedDate.format('YYYY-MM-DD');
      await apiService.createAvailability(token, {
        startTime: `${dateStr}T${startTime.format('HH:mm:ss')}.000Z`,
        endTime: `${dateStr}T${endTime.format('HH:mm:ss')}.000Z`,
      });

      message.success('Đã thêm khung giờ làm việc');
      setShowAddModal(false);
      setStartTime(null);
      setEndTime(null);
      loadData();
    } catch (error) {
      console.error('Error creating availability:', error);
      message.error('Không thể thêm khung giờ làm việc');
    }
  };

  const getListData = (value: Dayjs) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayAppointments = appointments.filter(apt => apt.appointmentDate === dateStr);
    
    return dayAppointments.map(apt => ({
      type: apt.status === 'scheduled' ? 'success' : apt.status === 'completed' ? 'default' : 'error',
      content: `${apt.slotStartTime?.substring(0, 5)} - ${apt.patientName}`,
    }));
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);
    return (
      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {listData.map((item, index) => (
          <li key={index}>
            <Badge 
              status={item.type as any} 
              text={<Text style={{ fontSize: 11 }}>{item.content}</Text>} 
            />
          </li>
        ))}
      </ul>
    );
  };

  const selectedDateAppointments = appointments.filter(
    apt => apt.appointmentDate === selectedDate.format('YYYY-MM-DD')
  );

  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '24px' }}>
        <Title level={2}>Quản lý lịch làm việc</Title>

        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Tổng lịch hẹn"
                value={stats.total}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã đặt lịch"
                value={stats.scheduled}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Hoàn thành"
                value={stats.completed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card>
              <Statistic
                title="Đã hủy"
                value={stats.cancelled}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} lg={16}>
            <Card
              title="Lịch làm việc"
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={() => setShowAddModal(true)}
                  >
                    Thêm khung giờ
                  </Button>
                </Space>
              }
            >
              <Calendar 
                dateCellRender={dateCellRender}
                onSelect={(date) => setSelectedDate(date)}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card 
              title={`Lịch hẹn ngày ${selectedDate.format('DD/MM/YYYY')}`}
              extra={
                <Space>
                  <Button 
                    size="small"
                    onClick={handleGenerateDailySlots}
                  >
                    Tạo lịch
                  </Button>
                  <Button 
                    size="small" 
                    danger
                    onClick={() => handleToggleDate(false)}
                  >
                    Đóng lịch
                  </Button>
                </Space>
              }
            >
              <List
                dataSource={selectedDateAppointments}
                locale={{ emptyText: 'Không có lịch hẹn nào' }}
                renderItem={(apt: any) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space>
                          <ClockCircleOutlined />
                          {`${apt.slotStartTime?.substring(0, 5)} - ${apt.slotEndTime?.substring(0, 5)}`}
                        </Space>
                      }
                      description={
                        <div>
                          <div>{apt.patientName}</div>
                          <Tag color={
                            apt.status === 'scheduled' ? 'blue' : 
                            apt.status === 'completed' ? 'green' : 'red'
                          }>
                            {apt.status === 'scheduled' ? 'Đã đặt' : 
                             apt.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                          </Tag>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title="Thêm khung giờ làm việc"
          open={showAddModal}
          onOk={handleCreateAvailability}
          onCancel={() => {
            setShowAddModal(false);
            setStartTime(null);
            setEndTime(null);
          }}
          okText="Thêm"
          cancelText="Hủy"
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Ngày: </Text>
              <Text>{selectedDate.format('DD/MM/YYYY')}</Text>
            </div>
            <div>
              <Text strong>Giờ bắt đầu:</Text>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                format="HH:mm"
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
            <div>
              <Text strong>Giờ kết thúc:</Text>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                format="HH:mm"
                style={{ width: '100%', marginTop: 8 }}
              />
            </div>
          </Space>
        </Modal>
      </Content>
    </Layout>
  );
}
