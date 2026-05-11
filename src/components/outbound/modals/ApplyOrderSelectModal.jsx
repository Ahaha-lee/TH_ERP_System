import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, Select, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { applyOrders } from '../../../mock/applyOrderMock';

const ApplyOrderSelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(applyOrders);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...applyOrders];
    if (values.type) filtered = filtered.filter(a => a.type === values.type);
    if (values.orderNo) filtered = filtered.filter(a => a.orderNo.includes(values.orderNo));
    setData(filtered);
  };

  const columns = [
    { title: '申请单号', dataIndex: 'orderNo' },
    { title: '类型', dataIndex: 'type' },
    { title: '申请人', dataIndex: 'applicant' },
    { title: '申请部门', dataIndex: 'deptName' },
    { title: '摘要', dataIndex: 'summary', ellipsis: true },
    { title: '申请日期', dataIndex: 'createDate' },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (s) => <Tag color="blue">{s}</Tag>
    },
  ];

  return (
    <Modal forceRender
      title="选择申请单"
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
        <Form.Item name="type" label="类型">
          <Select placeholder="请选择" style={{ width: 120 }} allowClear>
            <Select.Option value="请购">请购</Select.Option>
            <Select.Option value="费用申请">费用申请</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="orderNo" label="申请单号">
          <Input placeholder="请输入" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(applyOrders); }}>重置</Button>
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

export default ApplyOrderSelectModal;
