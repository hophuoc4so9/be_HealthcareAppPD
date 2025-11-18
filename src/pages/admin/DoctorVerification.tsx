import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm, Card, Empty } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface Doctor {
  user_id: string;
  full_name: string;
  specialization: string;
  email: string;
  status: string;
  registered_at: string;
}

export default function DoctorVerification() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/doctors?status=pending', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setDoctors(data.data.doctors);
    } catch (error) {
      message.error('Failed to fetch doctors');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId: string, status: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:5000/api/doctors/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      message.success(`Doctor ${status} successfully`);
      fetchDoctors();
    } catch (error) {
      message.error('Verification failed');
    }
  };

  const columns: ColumnsType<Doctor> = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      sorter: (a, b) => a.full_name.localeCompare(b.full_name),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Specialization',
      dataIndex: 'specialization',
      key: 'specialization',
      sorter: (a, b) => a.specialization.localeCompare(b.specialization),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag icon={<ClockCircleOutlined />} color="warning">
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Registered At',
      dataIndex: 'registered_at',
      key: 'registered_at',
      sorter: (a, b) => new Date(a.registered_at).getTime() - new Date(b.registered_at).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, record) => (
        <Space>
          <Popconfirm
            title="Approve this doctor?"
            onConfirm={() => handleVerify(record.user_id, 'approved')}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              size="small"
              icon={<CheckCircleOutlined />}
            >
              Approve
            </Button>
          </Popconfirm>
          <Popconfirm
            title="Reject this doctor?"
            onConfirm={() => handleVerify(record.user_id, 'rejected')}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<CloseCircleOutlined />}
            >
              Reject
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: 'calc(100vh - 112px)' }}>
      <Card 
        title={<h1 style={{ fontSize: '24px', margin: 0, fontWeight: 600 }}>Doctor Verification</h1>}
        extra={<Button type="primary" onClick={fetchDoctors}>Refresh</Button>}
      >
        {doctors.length === 0 && !loading ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No pending verifications"
          />
        ) : (
          <Table
            columns={columns}
            dataSource={doctors}
            rowKey="user_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showTotal: (total) => `Total ${total} pending verifications`,
            }}
          />
        )}
      </Card>
    </div>
  );
}
