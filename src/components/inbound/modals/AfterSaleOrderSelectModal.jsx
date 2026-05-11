
import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockAfterSaleOrders } from '../../../mock/afterSaleMock';

const AfterSaleOrderSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(mockAfterSaleOrders);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...mockAfterSaleOrders];
    if (values.orderNo) filtered = filtered.filter(o => o.orderNo.includes(values.orderNo));
    if (values.customerName) filtered = filtered.filter(o => o.customerName.includes(values.customerName));
    setData(filtered);
  };

  const handleConfirm = () => {
    if (!selectedRow) {
      message.warning('请选择一个售后单');
      return;
    }
    onSelect(selectedRow);
  };

  const columns = [
    { title: '售后单号', dataIndex: 'orderNo', width: 140 },
    { title: '源销售单号', dataIndex: 'relSalesOrderNo', width: 160 },
    { title: '客户', dataIndex: 'customerName', width: 150 },
    { title: '售后类型', dataIndex: 'type', width: 100 },
    { title: '退货摘要', dataIndex: 'summary', width: 200, ellipsis: true },
    { title: '申请日期', dataIndex: 'createDate', width: 110 },
    { title: '状态', dataIndex: 'status', width: 90 },
  ];

  return (
    <Modal forceRender
      title="选择售后订单"
      open={open}
      width={900}
      onCancel={onCancel}
      onOk={handleConfirm}
      
    >
      <Form form={form} layout="inline" className="mb-4">
        <Form.Item name="orderNo" label="售后单号">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item name="customerName" label="客户名称">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(mockAfterSaleOrders); }}>重置</Button>
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

export default AfterSaleOrderSelectModal;
