
import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockPurchaseOrders } from '../../../mock';

const PurchaseOrderSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(mockPurchaseOrders);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...mockPurchaseOrders];
    if (values.orderNo) filtered = filtered.filter(o => o.orderNo.includes(values.orderNo));
    if (values.supplierName) filtered = filtered.filter(o => o.supplierName.includes(values.supplierName));
    setData(filtered);
  };

  const handleConfirm = () => {
    if (!selectedRow) {
      message.warning('请选择一个采购单');
      return;
    }
    onSelect(selectedRow);
  };

  const columns = [
    { title: '采购单号', dataIndex: 'orderNo', width: 140 },
    { title: '供应商', dataIndex: 'supplierName', width: 200, ellipsis: true },
    { title: '采购员', dataIndex: 'purchaser', width: 100 },
    { title: '下单日期', dataIndex: 'orderDate', width: 110 },
    { title: '物料信息摘要', dataIndex: 'summary', width: 150, ellipsis: true },
    { title: '计划数量', dataIndex: 'totalQty', width: 90, align: 'right' },
    { title: '未入库', dataIndex: 'remainQty', width: 90, align: 'right' },
    { title: '状态', dataIndex: 'status', width: 80 },
  ];

  return (
    <Modal forceRender
      title="选择采购单"
      open={open}
      width={900}
      onCancel={onCancel}
      onOk={handleConfirm}
      centered
      
    >
      <Form form={form} layout="inline" className="mb-4">
        <Form.Item name="orderNo" label="单号">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item name="supplierName" label="供应商">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(mockPurchaseOrders); }}>重置</Button>
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

export default PurchaseOrderSelectModal;
