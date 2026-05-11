import React, { useState } from 'react';
import { Modal, Table, Input, Select, Space, Button, Form } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { customers as allCustomers, customerCategories, priceVersions } from '../mock';
import { getDiscountRateValue } from '../utils/helpers';

const CustomerSelectModal = ({ open, onCancel, onConfirm }) => {
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customers, setCustomers] = useState(allCustomers);
  const [form] = Form.useForm();

  const handleSearch = (values) => {
    let filtered = allCustomers;
    if (values.name) filtered = filtered.filter(c => c.name.includes(values.name));
    if (values.type) filtered = filtered.filter(c => c.type === values.type);
    setCustomers(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setCustomers(allCustomers);
  };

  const columns = [
    { title: '客户编码', dataIndex: 'code' },
    { title: '客户名称', dataIndex: 'name' },
    { title: '客户类型', dataIndex: 'type' },
    { title: '结算方式', dataIndex: 'settlementMethod' },
    { title: '联系人', dataIndex: 'contactName' },
    { title: '联系电话', dataIndex: 'contactPhone' },
  ];

  const handleConfirm = () => {
    if (selectedCustomer) {
      const discountRate = getDiscountRateValue(selectedCustomer.type, priceVersions, customerCategories);
      onConfirm({
        ...selectedCustomer,
        discountRate
      });
    }
  };

  return (
    <Modal
      title="选择客户"
      open={open}
      onCancel={onCancel}
      width={900}
      onOk={handleConfirm}
      okButtonProps={{ disabled: !selectedCustomer }}
      forceRender
    >
      <Form form={form} layout="inline" className="mb-4" onFinish={handleSearch}>
        <Form.Item name="name" label="客户名称">
          <Input placeholder="模糊查询" allowClear className="w-48" />
        </Form.Item>
        <Form.Item name="type" label="客户类型">
          <Select placeholder="请选择" className="w-40" allowClear>
            {customerCategories.map(c => (
              <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table 
        columns={columns}
        dataSource={customers}
        size="small"
        rowKey={(record) => record?.id || record?.key || record?.code}
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
