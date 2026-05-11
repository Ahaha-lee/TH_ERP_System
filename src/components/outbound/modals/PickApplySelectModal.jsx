import React, { useState } from 'react';
import { Modal, Form, Input, Table, Space, Button, DatePicker, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { pickApplys } from '../../../mock/pickApplyMock';

const PickApplySelectModal = ({ open, onCancel, onSelect }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(pickApplys);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...pickApplys];
    if (values.orderNo) filtered = filtered.filter(p => p.orderNo.includes(values.orderNo));
    if (values.workOrderNo) filtered = filtered.filter(p => p.workOrderNo.includes(values.workOrderNo));
    setData(filtered);
  };

  const columns = [
    { title: '领料申请单号', dataIndex: 'orderNo' },
    { title: '工单号', dataIndex: 'workOrderNo' },
    { title: '领料部门', dataIndex: 'deptName' },
    { title: '领料人/单位', dataIndex: 'applicant' },
    { title: '创建日期', dataIndex: 'createDate' },
    { 
      title: '状态', 
      dataIndex: 'status',
      render: (s) => <Tag color={s === '已审核' ? 'success' : 'default'}>{s}</Tag>
    },
  ];

  return (
    <Modal forceRender
      title="选择领料申请单"
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
        <Form.Item name="orderNo" label="申请单号">
          <Input placeholder="请输入" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item name="workOrderNo" label="工单号">
          <Input placeholder="请输入" style={{ width: 160 }} />
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(pickApplys); }}>重置</Button>
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

export default PickApplySelectModal;
