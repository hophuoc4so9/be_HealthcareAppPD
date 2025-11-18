import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm, Card, Modal, Select } from 'antd';
import { StopOutlined, CheckCircleOutlined, SwapOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_banned: boolean;
  created_at: string;
}

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.data.users);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanUnban = async (userId: string, currentStatus: boolean) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:5000/api/users/${userId}/${currentStatus ? 'unban' : 'ban'}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success(`User ${currentStatus ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
    } catch (error) {
      message.error('Operation failed');
    }
  };

  const handleChangeRole = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalVisible(true);
  };

  const handleRoleUpdate = async () => {
    if (!selectedUser) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      });
      message.success('User role updated successfully');
      setRoleModalVisible(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update user role');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Patient', value: 'patient' },
        { text: 'Doctor', value: 'doctor' },
        { text: 'Admin', value: 'admin' },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role: string) => {
        const colors: Record<string, string> = {
          admin: 'red',
          doctor: 'blue',
          patient: 'green',
        };
        return <Tag color={colors[role]}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      filters: [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false },
      ],
      onFilter: (value, record) => record.is_active === value,
      render: (isActive: boolean) => (
        <Tag color={isActive ? 'success' : 'default'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Banned',
      dataIndex: 'is_banned',
      key: 'is_banned',
      filters: [
        { text: 'Banned', value: true },
        { text: 'Not Banned', value: false },
      ],
      onFilter: (value, record) => record.is_banned === value,
      render: (isBanned: boolean) => (
        <Tag color={isBanned ? 'error' : 'success'}>
          {isBanned ? 'Banned' : 'Active'}
        </Tag>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<SwapOutlined />}
            onClick={() => handleChangeRole(record)}
          >
            Change Role
          </Button>
          <Popconfirm
            title={`Are you sure to ${record.is_banned ? 'unban' : 'ban'} this user?`}
            onConfirm={() => handleBanUnban(record.id, record.is_banned)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type={record.is_banned ? 'primary' : 'default'}
              danger={!record.is_banned}
              size="small"
              icon={record.is_banned ? <CheckCircleOutlined /> : <StopOutlined />}
            >
              {record.is_banned ? 'Unban' : 'Ban'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: 'calc(100vh - 112px)' }}>
      <Card 
        title={<h1 style={{ fontSize: '24px', margin: 0, fontWeight: 600 }}>Users Management</h1>}
        extra={<Button type="primary" onClick={fetchUsers}>Refresh</Button>}
      >
        <Table
          columns={columns}
          dataSource={users}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} users`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="Change User Role"
        open={roleModalVisible}
        onOk={handleRoleUpdate}
        onCancel={() => {
          setRoleModalVisible(false);
          setSelectedUser(null);
        }}
      >
        {selectedUser && (
          <div>
            <p><strong>User:</strong> {selectedUser.email}</p>
            <p><strong>Current Role:</strong> <Tag color={selectedUser.role === 'admin' ? 'red' : selectedUser.role === 'doctor' ? 'blue' : 'green'}>{selectedUser.role.toUpperCase()}</Tag></p>
            <div style={{ marginTop: '16px' }}>
              <label><strong>New Role:</strong></label>
              <Select
                value={newRole}
                onChange={setNewRole}
                style={{ width: '100%', marginTop: '8px' }}
              >
                <Select.Option value="patient">Patient</Select.Option>
                <Select.Option value="doctor">Doctor</Select.Option>
                <Select.Option value="admin">Admin</Select.Option>
              </Select>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
