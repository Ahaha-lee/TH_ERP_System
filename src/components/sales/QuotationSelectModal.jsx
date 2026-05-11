
import React, { useState } from 'react';
import { Modal, Table, Input, Form, Row, Col, Button, Space, Tag } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { quotations } from '../../mock/quotationMock';
import { customers } from '../../mock/masterData';

const QuotationSelectModal = ({ open, onCancel, onConfirm }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState(quotations);
  const [selectedRowKey, setSelectedRowKey] = useState(null);

  const handleSearch = (values) => {
    setLoading(true);
    setTimeout(() => {
      let filtered = [...quotations];
      if (values.quotationNo) {
        filtered = filtered.filter(q => q.quotationNo.includes(values.quotationNo));
      }
      if (values.customerName) {
        filtered = filtered.filter(q => q.customerName.includes(values.customerName));
      }
      setList(filtered);
      setLoading(false);
    }, 300);
  };

  const handleReset = () => {
    form.resetFields();
    setList(quotations);
  };

  const columns = [
    { title: '报价单号', dataIndex: 'quotationNo', width: 150 },
    { 
      title: '客户编码', 
      dataIndex: 'customerId', 
      width: 100,
      render: (id) => {
        const c = customers.find(item => item.id === id);
        return c?.code || id;
      }
    },
    { title: '客户名称', dataIndex: 'customerName', width: 180, ellipsis: true },
    { 
      title: '产品信息', 
      dataIndex: 'items', 
      render: (items) => (items || []).map(i => i.productName).join('、') || '-',
      ellipsis: true 
    },
    { title: '报价日期', dataIndex: 'quotationDate', width: 110 },
    { title: '总金额', dataIndex: 'totalAmount', width: 100, align: 'right', render: val => `¥${val.toFixed(2)}` },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 100, 
      render: (status) => <Tag color={status === '已转订单' ? 'green' : 'default'}>{status}</Tag> 
    },
  ];

  const handleConfirm = () => {
    const selected = list.find(q => q.id === selectedRowKey);
    if (selected) {
      onConfirm(selected);
    }
  };

  return (
    <Modal forceRender
      title="选择报价单"
      open={open}
      onCancel={onCancel}
      width={900}
      onOk={handleConfirm}
      okButtonProps={{ disabled: !selectedRowKey }}
      okText="确认"
      cancelText="取消"
    >
      <Form form={form} layout="horizontal" onFinish={handleSearch} className="mb-4">
        <Row gutter={16}>
          <Col span={10}>
            <Form.Item name="quotationNo" label="报价单号">
              <Input placeholder="输入单号" allowClear />
            </Form.Item>
          </Col>
          <Col span={10}>
            <Form.Item name="customerName" label="客户名称">
              <Input placeholder="输入姓名" allowClear />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Form>
      <Table
        dataSource={list}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
        loading={loading}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
          onChange: (keys) => setSelectedRowKey(keys[0])
        }}
        onRow={(record) => ({
          onClick: () => setSelectedRowKey(record.id)
        })}
      />
    </Modal>
  );
};

export default QuotationSelectModal;
