
import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { consignmentOrders } from '../../../mock/consignmentMock';

const ConsignmentOrderSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(consignmentOrders);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...consignmentOrders];
    if (values.orderNo) filtered = filtered.filter(o => o.orderNo.includes(values.orderNo));
    if (values.customerName) filtered = filtered.filter(o => o.customerName.includes(values.customerName));
    setData(filtered);
  };

  const handleConfirm = () => {
    if (!selectedRow) {
      message.warning('请选择一个受托订单');
      return;
    }
    onSelect(selectedRow);
  };

  const columns = [
    { title: '单号', dataIndex: 'orderNo', width: 140 },
    { title: '客户', dataIndex: 'customerName', width: 150 },
    { title: '加工成品', dataIndex: 'productName', width: 150 },
    { title: '材料摘要', dataIndex: 'summary', width: 200, ellipsis: true },
    { title: '日期', dataIndex: 'createDate', width: 110 },
    { title: '状态', dataIndex: 'status', width: 90 },
  ];

  return (
    <Modal forceRender
      title="选择受托加工订单"
      open={open}
      width={900}
      onCancel={onCancel}
      onOk={handleConfirm}
      
    >
      <Form form={form} layout="inline" className="mb-4">
        <Form.Item name="orderNo" label="单号">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item name="customerName" label="客户">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(consignmentOrders); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="orderNo"
        columns={columns}
        dataSource={data}
        size="small"
        rowSelection={{
          type: 'radio',
          onChange: (_, rows) => setSelectedRow(rows[0])
        }}
        pagination={{ pageSize: 5 }}
        onRow={(record) => ({
          onClick: () => setSelectedRow(record)
        })}
      />
    </Modal>
  );
};

export default ConsignmentOrderSelectModal;
