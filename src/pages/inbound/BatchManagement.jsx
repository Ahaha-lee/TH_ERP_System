
import React, { useState } from 'react';
import { Table, Card, Form, Input, Select, Button, Space, DatePicker, message, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { batches } from '../../mock';
import { warehouses } from '../../mock';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const BatchManagement = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState(batches);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...batches];
    if (values.batchNo) filtered = filtered.filter(b => b.batchNo.includes(values.batchNo));
    if (values.warehouseName) filtered = filtered.filter(b => b.warehouseName === values.warehouseName);
    if (values.status) filtered = filtered.filter(b => b.status === values.status);
    setData(filtered);
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '批次号', dataIndex: 'batchNo', width: 160 },
    { 
      title: '关联工单号', 
      dataIndex: 'relOrderNo', 
      width: 160,
      render: (text) => <Link onClick={() => message.info(`跳转至工单：${text}`)}>{text}</Link>
    },
    { title: '存放仓库', dataIndex: 'warehouseName', width: 150 },
    { title: '存放货位', dataIndex: 'location', width: 120 },
    { title: '创建日期', dataIndex: 'createDate', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100 },
  ];

  return (
    <div className="p-4 space-y-4">
      <Card size="small">
        <Form form={form} layout="inline">
          <Form.Item name="batchNo" label="批次号">
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          <Form.Item name="warehouseName" label="存放仓库">
            <Select placeholder="选择仓库" style={{ width: 150 }} allowClear>
              {warehouses.map(w => <Select.Option key={w.id} value={w.name}>{w.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
              <Select.Option value="有效">有效</Select.Option>
              <Select.Option value="已用完">已用完</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="创建日期">
            <RangePicker />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={() => { form.resetFields(); setData(batches); }}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
      <Card size="small" title="批次列表">
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          size="small" 
          pagination={{ showSizeChanger: true }}
        />
      </Card>
    </div>
  );
};

export default BatchManagement;
