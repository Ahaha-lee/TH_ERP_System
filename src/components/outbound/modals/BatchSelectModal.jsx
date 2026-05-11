import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, Tag, Radio } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { batches } from '../../../mock/batchMock';

const BatchSelectModal = ({ open, onCancel, onSelect, productCode }) => {
  const [form] = Form.useForm();
  // Simple filter for the specific product if needed, but the requirements say search by code/name
  const [data, setData] = useState(batches);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...batches];
    if (values.batchNo) filtered = filtered.filter(b => b.batchNo.includes(values.batchNo));
    if (values.warehouseName) filtered = filtered.filter(b => b.warehouseName === values.warehouseName);
    setData(filtered);
  };

  const columns = [
    { title: '批次号', dataIndex: 'batchNo' },
    { title: '仓库', dataIndex: 'warehouseName' },
    { title: '货位', dataIndex: 'location' },
    { title: '生产日期', dataIndex: 'createDate' },
    { 
        title: '当前库存', 
        dataIndex: 'stockQty', 
        render: () => Math.floor(Math.random() * 100) + 10 // Mock stock
    },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (s) => <Tag color={s === '有效' ? 'success' : 'default'}>{s}</Tag>
    },
  ];

  return (
    <Modal forceRender
      title="选择物料批次"
      open={open}
      width={800}
      onCancel={onCancel}
      onOk={() => {
        if (selectedRow) {
          // Add a mock stock field for the return
          const mockStock = Math.floor(Math.random() * 100) + 10;
          onSelect({ ...selectedRow, stockQty: mockStock });
          onCancel();
        }
      }}
    >
      <Form form={form} layout="inline" style={{ marginBottom: 16 }}>
        <Form.Item name="batchNo" label="批次号">
          <Input placeholder="请输入" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item name="warehouseName" label="仓库">
          <Input placeholder="请输入" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(batches); }}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data.filter(b => b.status === '有效')}
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

export default BatchSelectModal;
