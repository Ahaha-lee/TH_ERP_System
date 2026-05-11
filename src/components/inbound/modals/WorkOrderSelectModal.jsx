
import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, message } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockWorkOrders } from '../../../mock/workOrderMock';

const WorkOrderSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(mockWorkOrders);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...mockWorkOrders];
    if (values.orderNo) filtered = filtered.filter(o => o.orderNo.includes(values.orderNo));
    if (values.productName) filtered = filtered.filter(o => o.productName.includes(values.productName));
    setData(filtered);
  };

  const handleConfirm = () => {
    if (!selectedRow) {
      message.warning('请选择一个生产工单');
      return;
    }
    onSelect(selectedRow);
  };

  const columns = [
    { title: '工单号', dataIndex: 'orderNo', width: 140 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '计划数量', dataIndex: 'planQty', width: 100, align: 'right' },
    { title: '未入库', dataIndex: 'remainQty', width: 100, align: 'right' },
    { title: '计划完工', dataIndex: 'finishDate', width: 110 },
    { title: '状态', dataIndex: 'status', width: 90 },
  ];

  return (
    <Modal forceRender
      title="选择生产工单"
      open={open}
      width={900}
      onCancel={onCancel}
      onOk={handleConfirm}
      
    >
      <Form form={form} layout="inline" className="mb-4">
        <Form.Item name="orderNo" label="工单号">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item name="productName" label="产品名称">
          <Input placeholder="请输入" allowClear />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(mockWorkOrders); }}>重置</Button>
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

export default WorkOrderSelectModal;
