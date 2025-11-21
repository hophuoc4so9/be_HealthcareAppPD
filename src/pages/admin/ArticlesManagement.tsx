import { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Popconfirm, Card, Modal, Form, Input, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, LinkOutlined } from '@ant-design/icons';
import MDEditor from '@uiw/react-md-editor';
import type { ColumnsType } from 'antd/es/table';

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  external_url?: string;
  status: string;
  created_at: string;
}

export default function ArticlesManagement() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [form] = Form.useForm();
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('https://be-healthcareapppd.onrender.com/api/articles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setArticles(data.data.articles);
    } catch (error) {
      message.error('Failed to fetch articles');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrUpdate = async (values: any) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingArticle 
        ? `https://be-healthcareapppd.onrender.com/api/articles/${editingArticle.id}`
        : 'https://be-healthcareapppd.onrender.com/api/articles';
      
      await fetch(url, {
        method: editingArticle ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...values,
          content: editorContent
        })
      });
      
      message.success(`Article ${editingArticle ? 'updated' : 'created'} successfully`);
      setModalVisible(false);
      setEditingArticle(null);
      form.resetFields();
      setEditorContent('');
      fetchArticles();
    } catch (error) {
      message.error(`Failed to ${editingArticle ? 'update' : 'create'} article`);
    }
  };

  const handleEdit = (record: Article) => {
    setEditingArticle(record);
    setEditorContent(record.content || '');
    setModalVisible(true);
    // Set form values after modal is visible
    setTimeout(() => {
      form.setFieldsValue({
        title: record.title,
        external_url: record.external_url || '',
        status: record.status,
      });
    }, 0);
  };

  const handlePublish = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`https://be-healthcareapppd.onrender.com/api/articles/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'published' })
      });
      message.success('Article published successfully');
      fetchArticles();
    } catch (error) {
      message.error('Failed to publish article');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`https://be-healthcareapppd.onrender.com/api/articles/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      message.success('Article deleted successfully');
      fetchArticles();
    } catch (error) {
      message.error('Failed to delete article');
    }
  };

  const copyArticleLink = (slug: string) => {
    const link = `https://yourapp.com/articles/${slug}`;
    navigator.clipboard.writeText(link);
    message.success('Article link copied to clipboard!');
  };

  const columns: ColumnsType<Article> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      sorter: (a, b) => a.title.localeCompare(b.title),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug: string) => (
        <Space>
          <span>{slug}</span>
          <Button 
            type="link" 
            size="small" 
            icon={<LinkOutlined />}
            onClick={() => copyArticleLink(slug)}
          />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Draft', value: 'draft' },
        { text: 'Published', value: 'published' },
        { text: 'Archived', value: 'archived' },
      ],
      onFilter: (value, record) => record.status === value,
      render: (status: string) => {
        const colors: Record<string, string> = {
          draft: 'default',
          published: 'success',
          archived: 'error',
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
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
      width: 250,
      render: (_, record) => (
        <Space>
          <Button
            type="default"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          {record.status === 'draft' && (
            <Popconfirm
              title="Publish this article?"
              onConfirm={() => handlePublish(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
              >
                Publish
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="Delete this article?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ background: '#f0f2f5', padding: '24px', minHeight: 'calc(100vh - 112px)' }}>
      <Card 
        title={<h1 style={{ fontSize: '24px', margin: 0, fontWeight: 600 }}>Articles Management</h1>}
        extra={
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingArticle(null);
                setEditorContent('');
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Create Article
            </Button>
            <Button onClick={fetchArticles}>Refresh</Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={articles}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} articles`,
            showSizeChanger: true,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingArticle ? "Edit Article" : "Create New Article"}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingArticle(null);
          form.resetFields();
          setEditorContent('');
        }}
        onOk={() => form.submit()}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateOrUpdate}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please enter article title' }]}
          >
            <Input placeholder="Enter article title" />
          </Form.Item>

          <Form.Item
            name="external_url"
            label="External URL (Optional)"
            extra="Nhập link bài viết từ nguồn khác (ví dụ: VnExpress, Tuổi Trẻ...) để hiển thị trên Android app. Nếu có URL này thì app sẽ mở WebView thay vì hiển thị nội dung."
          >
            <Input placeholder="https://example.com/article" />
          </Form.Item>
          
          <Form.Item
            label="Content (Markdown)"
            extra="Hỗ trợ Markdown syntax. Upload ảnh: dùng syntax ![alt text](image-url)"
          >
            <div data-color-mode="light">
              <MDEditor
                value={editorContent}
                onChange={(val) => setEditorContent(val || '')}
                height={400}
                preview="live"
                visibleDragbar={false}
              />
            </div>
          </Form.Item>
          
          <Form.Item
            name="status"
            label="Status"
            initialValue="draft"
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="draft">Draft</Select.Option>
              <Select.Option value="published">Published</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
