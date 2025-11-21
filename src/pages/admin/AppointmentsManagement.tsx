import { useState, useEffect } from 'react';
import { Table, Tag, Card, Button, Select, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Appointment {
  id: string;
  patient_name: string;
  doctor_name: string;
  start_time: string;
  end_time: string;
  status: string;
  created_at: string;
}

export default function AppointmentsManagement() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://be-healthcareapppd.onrender.com/api/admin/recent-appointments?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setAppointments(data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: React.ReactNode }> = {
      scheduled: { color: 'blue', icon: <ClockCircleOutlined /> },
      completed: { color: 'success', icon: <CheckCircleOutlined /> },
      cancelled_by_patient: { color: 'error', icon: <CloseCircleOutlined /> },
      cancelled_by_doctor: { color: 'warning', icon: <CloseCircleOutlined /> },
    };
    return configs[status] || { color: 'default', icon: <CalendarOutlined /> };
  };

  const columns: ColumnsType<Appointment> = [
    {
      title: 'Patient',
      dataIndex: 'patient_name',
      key: 'patient_name',
      sorter: (a, b) => a.patient_name.localeCompare(b.patient_name),
    },
    {
      title: 'Doctor',
      dataIndex: 'doctor_name',
      key: 'doctor_name',
      sorter: (a, b) => a.doctor_name.localeCompare(b.doctor_name),
    },
    {
      title: 'Date',
      dataIndex: 'start_time',
      key: 'date',
      sorter: (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Time',
      dataIndex: 'start_time',
      key: 'time',
      render: (_, record) => (
        <div>
          <div>{new Date(record.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
          <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
            {new Date(record.end_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Scheduled', value: 'scheduled' },
        { text: 'Completed', value: 'completed' },
        { text: 'Cancelled by Patient', value: 'cancelled_by_patient' },
        { text: 'Cancelled by Doctor', value: 'cancelled_by_doctor' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const config = getStatusConfig(status);
        return (
          <Tag icon={config.icon} color={config.color}>
            {status.replace(/_/g, ' ').toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => new Date(date).toLocaleString(),
    },
  ];

  const filteredData = filter === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === filter);

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: 'calc(100vh - 112px)' }}>
      <Card 
        title={<h1 style={{ fontSize: '24px', margin: 0, fontWeight: 600 }}>Appointments Management</h1>}
        extra={
          <Space>
            <Select
              value={filter}
              onChange={setFilter}
              style={{ width: 200 }}
              options={[
                { value: 'all', label: 'All Appointments' },
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled_by_patient', label: 'Cancelled by Patient' },
                { value: 'cancelled_by_doctor', label: 'Cancelled by Doctor' },
              ]}
            />
            <Button type="primary" onClick={fetchAppointments}>Refresh</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} appointments`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
}
