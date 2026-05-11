import React, { useState } from 'react';
import { Modal, Table, Input, Form, Space, Button, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockNormalOrders } from '../../mock';

const OrderSourceSelectModal = ({ open, onCancel, onConfirm }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(mockNormalOrders);

  const handleSearch = (values) => {
    let filtered = [...mockNormalOrders];
    if (values.orderNo) filtered = filtered.filter(o => o.orderNo.includes(values.orderNo));
    if (values.customerName) filtered = filtered.filter(o => o.customerName.includes(values.customerName));
    setData(filtered);
  };

  const columns = [
    { title: '订单号', dataIndex: 'orderNo', width: 180 },
    { title: '客户名称', dataIndex: 'customerName', ellipsis: true },
    { title: '订单日期', dataIndex: 'orderDate', width: 120 },
    { title: '业务员', dataIndex: 'salesperson', width: 100 },
    { title: '状态', dataIndex: 'status', width: 100, render: s => <Tag>{s}</Tag> }
  ];

  return (
    <Modal forceRender
      title="选择原销售订单"
      open={open}
      onCancel={onCancel}
      width={800}
      footer={null}
    >
      <Space orientation="vertical" style={{ width: '100%' }}>
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="orderNo">
            <Input placeholder="订单号" allowClear prefix={<SearchOutlined />} />
          </Form.Item>
          <Form.Item name="customerName">
            <Input placeholder="客户名称" allowClear />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button onClick={() => { form.resetFields(); setData(mockNormalOrders); }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
        <Table
          dataSource={data}
          columns={columns}
          rowKey="id"
          size="small"
          onRow={(record) => ({
            onClick: () => {
              onConfirm(record);
              onCancel();
            }
          })}
        />
      </Space>
    </Modal>
  );
};

export default OrderSourceSelectModal;
