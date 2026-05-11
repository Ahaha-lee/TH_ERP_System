import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, DatePicker, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { deliveryNotices } from '../../../mock/deliveryNoticeMock';

const { RangePicker } = DatePicker;

const DeliveryNoticeSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(deliveryNotices);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...deliveryNotices];
    
    if (values.orderNo) filtered = filtered.filter(d => d.orderNo.includes(values.orderNo));
    if (values.salesOrderNo) filtered = filtered.filter(d => d.salesOrderNo.includes(values.salesOrderNo));
    if (values.customerName) filtered = filtered.filter(d => d.customerName.includes(values.customerName));
    if (values.salesman) filtered = filtered.filter(d => d.salesman.includes(values.salesman));

    setData(filtered);
  };

  const columns = [
    { title: '发货通知单号', dataIndex: 'orderNo' },
    { title: '销售订单号', dataIndex: 'salesOrderNo' },
    { title: '客户名称', dataIndex: 'customerName' },
    { title: '物料摘要', dataIndex: 'materialSummary', ellipsis: true },
    { title: '创建日期', dataIndex: 'createDate' },
    { title: '业务员', dataIndex: 'salesman' },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (s) => <Tag color={s === '已出库' ? 'success' : 'processing'}>{s}</Tag>
    },
  ];

  return (
    <Modal forceRender
      title="选择发货通知单"
      open={open}
      width={900}
      onCancel={onCancel}
      onOk={() => {
        if (selectedRow) {
          onSelect(selectedRow);
          onCancel();
        }
      }}
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="orderNo" label="通知单号">
          <Input placeholder="请输入" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="salesOrderNo" label="销售订单">
          <Input placeholder="请输入" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="customerName" label="客户">
          <Input placeholder="请输入" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(deliveryNotices); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        rowSelection={{
          type: 'radio',
          onChange: (_, selectedRows) => setSelectedRow(selectedRows[0]),
        }}
        onRow={(record) => ({
          onClick: () => setSelectedRow(record),
        })}
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

export default DeliveryNoticeSelectModal;
