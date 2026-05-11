import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, DatePicker, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { subcontractPurchases } from '../../../mock/subcontractPurchaseMock';

const { RangePicker } = DatePicker;

const SubcontractPurchaseSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(subcontractPurchases);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...subcontractPurchases];
    
    if (values.orderNo) filtered = filtered.filter(p => p.orderNo.includes(values.orderNo));
    if (values.supplierName) filtered = filtered.filter(p => p.supplierName.includes(values.supplierName));
    if (values.productName) filtered = filtered.filter(p => p.productName.includes(values.productName));
    if (values.dateRange) {
        const [start, end] = values.dateRange;
        filtered = filtered.filter(p => {
            const date = p.orderDate;
            return date >= start.format('YYYY-MM-DD') && date <= end.format('YYYY-MM-DD');
        });
    }

    setData(filtered);
  };

  const columns = [
    { title: '委外采购单号', dataIndex: 'orderNo', width: 160 },
    { title: '供应商', dataIndex: 'supplierName', width: 150 },
    { 
        title: '加工件信息', 
        key: 'product',
        render: (_, record) => `${record.productCode} / ${record.productName}`
    },
    { title: '委外数量', dataIndex: 'quantity', width: 100, align: 'right' },
    { title: '加工费单价', dataIndex: 'price', width: 100, align: 'right', render: (v) => `￥${v}` },
    { title: '下单日期', dataIndex: 'orderDate', width: 120 },
    { 
      title: '状态', 
      dataIndex: 'status',
      width: 100,
      render: (s) => <Tag color="blue">{s}</Tag>
    },
  ];

  return (
    <Modal forceRender
      title="选择委外采购单"
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
        <Form.Item name="orderNo" label="单号">
          <Input placeholder="请输入" style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="supplierName" label="供应商">
          <Input placeholder="请输入" style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="productName" label="加工件">
          <Input placeholder="请输入" style={{ width: 140 }} />
        </Form.Item>
        <Form.Item name="dateRange" label="日期">
            <RangePicker style={{ width: 240 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(subcontractPurchases); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data.filter(p => p.status === '已下达')}
        rowSelection={{
          type: 'radio',
          onChange: (_, selectedRows) => setSelectedRow(selectedRows[0]),
        }}
        onRow={(record) => ({
          onClick: () => setSelectedRow(record),
        })}
        pagination={{ pageSize: 5 }}
        scroll={{ x: 1000 }}
      />
    </Modal>
  );
};

export default SubcontractPurchaseSelectModal;
