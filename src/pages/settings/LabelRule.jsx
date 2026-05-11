import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Switch, 
  Popconfirm, 
  message 
} from 'antd';
import { PlusOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockLabelRules } from '../../mock';
import { materialFields } from '../../mock';
import LabelRuleFormModal from '../../components/label/LabelRuleFormModal';

const LabelRule = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState(mockLabelRules);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  const handleSearch = (values) => {
    let filtered = [...mockLabelRules];
    if (values.category) {
      filtered = filtered.filter(item => item.category === values.category);
    }
    if (values.ruleName) {
      filtered = filtered.filter(item => item.ruleName.includes(values.ruleName));
    }
    if (values.status) {
      filtered = filtered.filter(item => item.status === values.status);
    }
    setData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setData(mockLabelRules);
  };

  const handleToggleStatus = (record, checked) => {
    const newStatus = checked ? '启用' : '禁用';
    const newData = data.map(item => {
      if (item.id === record.id) {
        return { ...item, status: newStatus };
      }
      return item;
    });
    setData(newData);
    // Since it's mock, we don't update mockLabelRules globally 
    // but a real app would persist this.
    message.success(`规则 [${record.ruleName}] 已${newStatus}`);
  };

  const handleDelete = (record) => {
    const newData = data.filter(item => item.id !== record.id);
    setData(newData);
    message.success('删除成功');
  };

  const handleSave = (values) => {
    if (values.id) {
      // Edit
      setData(data.map(item => item.id === values.id ? { ...item, ...values } : item));
      message.success('更新成功');
    } else {
      // Add
      const newRule = {
        ...values,
        id: Date.now().toString(),
        ruleNo: `R00${data.length + 1}`,
      };
      setData([newRule, ...data]);
      message.success('新增成功');
    }
    setModalOpen(false);
    setEditingRecord(null);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '规则编号',
      dataIndex: 'ruleNo',
      key: 'ruleNo',
      width: 120,
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 150,
    },
    {
      title: '物料分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (category) => (
        <Tag color={category === '成品' ? 'blue' : 'green'}>{category}</Tag>
      ),
    },
    {
      title: '包含字段',
      dataIndex: 'fields',
      key: 'fields',
      width: 250,
      render: (fields) => {
        const fieldNames = fields.map(f => {
          const field = materialFields.find(mf => mf.value === f);
          return field ? field.label : f;
        });
        return fieldNames.join('、');
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      render: (status, record) => (
        <Space>
          <Tag color={status === '启用' ? 'success' : 'default'}>{status}</Tag>
          <Switch 
            checked={status === '启用'} 
            size="small" 
            onChange={(checked) => handleToggleStatus(record, checked)}
          />
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => {
            setEditingRecord(record);
            setModalOpen(true);
          }}>编辑</Button>
          {record.status === '禁用' && (
            <Popconfirm 
              title="确定删除该规则吗?" 
              onConfirm={() => handleDelete(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small">删除</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="category" label="物料分类">
            <Select placeholder="请选择" style={{ width: 120 }} allowClear>
              <Select.Option value="成品">成品</Select.Option>
              <Select.Option value="半成品">半成品</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="ruleName" label="规则名称">
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" style={{ width: 100 }} allowClear>
              <Select.Option value="启用">启用</Select.Option>
              <Select.Option value="禁用">禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card 
        size="small" 
        title="标签规则列表" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => {
              setEditingRecord(null);
              setModalOpen(true);
            }}
          >
            新增规则
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          size="small"
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10,
          }}
        />
      </Card>

      <LabelRuleFormModal 
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false);
          setEditingRecord(null);
        }}
        onSave={handleSave}
        editingRecord={editingRecord}
        existingNames={data.map(item => item.ruleName)}
      />
    </div>
  );
};

export default LabelRule;
