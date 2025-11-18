import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag } from 'antd';
import {
  UserOutlined,
  MedicineBoxOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

interface Stats {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  pending_appointments: number;
  pending_verifications: number;
  published_articles: number;
}

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  status: string;
  start_time: string;
  created_at: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setStats(data.data.stats);
      setRecentUsers(data.data.recentUsers);
      setRecentAppointments(data.data.recentAppointments);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const userColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'doctor' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'error'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const appointmentColumns = [
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
    },
    {
      title: 'Time',
      dataIndex: 'start_time',
      key: 'start_time',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          scheduled: 'blue',
          completed: 'success',
          cancelled_by_patient: 'error',
          cancelled_by_doctor: 'warning',
        };
        return <Tag color={colors[status]}>{status.replace(/_/g, ' ').toUpperCase()}</Tag>;
      },
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: 'calc(100vh - 112px)' }}>
      <h1 style={{ fontSize: '24px', marginBottom: '24px', fontWeight: 600, marginTop: 0 }}>Dashboard</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Patients"
              value={stats?.total_patients || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Doctors"
              value={stats?.total_doctors || 0}
              prefix={<MedicineBoxOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Total Appointments"
              value={stats?.total_appointments || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Appointments"
              value={stats?.pending_appointments || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Pending Verifications"
              value={stats?.pending_verifications || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Published Articles"
              value={stats?.published_articles || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} xl={12}>
          <Card title="Recent Users" bordered={false}>
            <Table
              columns={userColumns}
              dataSource={recentUsers}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
        <Col xs={24} xl={12}>
          <Card title="Recent Appointments" bordered={false}>
            <Table
              columns={appointmentColumns}
              dataSource={recentAppointments}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
