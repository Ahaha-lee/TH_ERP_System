
import React, { useState } from 'react';
import { Modal, Form, Input, Select, Table, Space, Button, Radio } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { customers } from '../../mock';

const CustomerSelectModal = ({ open, onCancel, onConfirm }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(customers);
  const [selectedId, setSelectedId] = useState(null);

  const handleSearch = (values) => {
    let filtered = [...customers];
    if (values.name) {
      filtered = filtered.filter(c => c.name.includes(values.name));
    }
    if (values.type) {
      filtered = filtered.filter(c => c.type === values.type);
    }
    setData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setData(customers);
  };

  const handleConfirm = () => {
    const customer = customers.find(c => c.id === selectedId);
    if (customer) {
      onConfirm(customer);
      onCancel();
    }
  };

  const columns = [
    {
      title: '选择',
      key: 'radio',
      width: 50,
      render: (_, record) => (
        <Radio 
          checked={selectedId === record.id} 
          onChange={() => setSelectedId(record.id)} 
        />
      ),
    },
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '客户编码', dataIndex: 'code', width: 120 },
    { title: '客户名称', dataIndex: 'name', ellipsis: true },
    { title: '客户类型', dataIndex: 'type', width: 100 },
    { title: '结算方式', dataIndex: 'settlementMethod', width: 120 },
    { title: '联系人', dataIndex: 'contact', width: 100 },
    { title: '联系电话', dataIndex: 'phone', width: 130 },
  ];

  return (
    <Modal forceRender
      title="选择客户"
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={900}
      okButtonProps={{ disabled: !selectedId }}
      
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="name" label="客户名称">
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          <Form.Item name="type" label="客户类型">
            <Select placeholder="请选择" style={{ width: 120 }} allowClear>
              <Select.Option value="经销商">经销商</Select.Option>
              <Select.Option value="零售">零售</Select.Option>
              <Select.Option value="设计师">设计师</Select.Option>
              <Select.Option value="独立店">独立店</Select.Option>
              <Select.Option value="专卖店">专卖店</Select.Option>
              <Select.Option value="买手店">买手店</Select.Option>
              <Select.Option value="工厂合作">工厂合作</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>

        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          size="small"
          onRow={(record) => ({
            onClick: () => setSelectedId(record.id),
          })}
          pagination={{ pageSize: 5 }}
        />
      </Space>
    </Modal>
  );
};

export default CustomerSelectModal;
