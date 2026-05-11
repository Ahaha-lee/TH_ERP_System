import React, { useState } from 'react';
import { Modal, Table, Input, Form, Space, Button, Tag, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { customers } from '../../mock';

const CustomerSelectModal = ({ open, onCancel, onConfirm }) => {
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [dataSource, setDataSource] = useState(customers);
  const [form] = Form.useForm();

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60 },
    { title: '客户编码', dataIndex: 'code' },
    { title: '客户名称', dataIndex: 'name' },
    { title: '客户类型', dataIndex: 'type', render: (val) => <Tag color="blue">{val}</Tag> },
    { title: '结算方式', dataIndex: 'settlementMethod' },
    { title: '联系人名称', dataIndex: 'contact' },
    { title: '联系电话', dataIndex: 'phone' }
  ];

  const handleSearch = (values) => {
    let filtered = customers;
    if (values.name) filtered = filtered.filter(c => c.name.includes(values.name));
    if (values.type) filtered = filtered.filter(c => c.type === values.type);
    setDataSource(filtered);
  };

  const handleConfirm = () => {
    if (selectedCustomer) {
      onConfirm(selectedCustomer);
      onCancel();
    }
  };

  return (
    <Modal forceRender
      title="客户选择"
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={900}
      okButtonProps={{ disabled: !selectedCustomer }}
    >
      <Form form={form} layout="inline" className="mb-4" onFinish={handleSearch}>
        <Form.Item name="name" label="客户名称">
          <Input placeholder="模糊查询" />
        </Form.Item>
        <Form.Item name="type" label="客户类型">
          <Select placeholder="选择类型" className="w-32" allowClear>
            <Select.Option value="独立店">独立店</Select.Option>
            <Select.Option value="分销商">分销商</Select.Option>
            <Select.Option value="合伙人">合伙人</Select.Option>
            <Select.Option value="直营店">直营店</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button onClick={() => { form.resetFields(); setDataSource(customers); }} icon={<ReloadOutlined />}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        size="small"
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
          onChange: (keys, rows) => {
            setSelectedRowKey(keys[0]);
            setSelectedCustomer(rows[0]);
          }
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKey(record.id);
            setSelectedCustomer(record);
          }
        })}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default CustomerSelectModal;
