import React, { useState, useEffect } from 'react';
import { Modal, Table, Input, Form, Space, Button, Tag, Select } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { normalOrders, consignmentOrders, mockExchanges } from '../../mock';

const SalesOrderSelectModal = ({ open, onCancel, onConfirm }) => {
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [dataSource, setDataSource] = useState([]);
  const [form] = Form.useForm();

  // Normalize data from different sources
  const getNormalizedData = () => {
      const normal = normalOrders.map(o => ({
          ...o,
          orderNo: o.orderNo,
          type: '普通销售',
          orderDate: o.orderDate || o.createdAt,
          items: o.items || []
      }));
      const consignment = consignmentOrders.map(o => ({
          ...o,
          orderNo: o.orderNo,
          type: '受托加工销售',
          orderDate: o.orderDate,
          items: o.items?.map(i => ({ productCode: 'CON', productName: i.processName, spec: i.processSpec, quantity: i.quantity, unitPrice: i.unitPrice }))
      }));
      const afterSale = mockExchanges.map(o => ({
          ...o,
          orderNo: o.exchangeNo, // Use exchangeNo as display order no
          type: '售后销售',
          orderDate: o.orderDate,
          items: o.items?.filter(i => i.action === '换出').map(i => ({ productName: i.productName, quantity: i.quantity }))
      }));

      return [...normal, ...consignment, ...afterSale].filter(o => o.status !== '草稿' && o.status !== '完成');
  };

  useEffect(() => {
    if (open) {
        setDataSource(getNormalizedData());
        setSelectedRowKey(null);
        setSelectedOrder(null);
    }
  }, [open]);

  const columns = [
    { title: '销售订单号', dataIndex: 'orderNo', width: 160 },
    { 
      title: '销售订单类型', 
      dataIndex: 'type', 
      width: 120,
      render: (val) => <Tag color={val === '普通销售' ? 'blue' : val === '售后销售' ? 'purple' : 'orange'}>{val}</Tag>
    },
    { title: '订单时间', dataIndex: 'orderDate', width: 120 },
    { 
      title: '产品信息', 
      dataIndex: 'items', 
      ellipsis: true,
      render: (items) => items?.map(i => `${i.productName || '未知'}*${i.quantity || 0}`).join(', ') 
    },
    { title: '客户名称', dataIndex: 'customerName', width: 180, ellipsis: true },
    { title: '业务员', dataIndex: 'salesperson', width: 100 }
  ];

  const handleSearch = (values) => {
    let all = getNormalizedData();
    if (values.orderNo) all = all.filter(o => o.orderNo.toLowerCase().includes(values.orderNo.toLowerCase()));
    if (values.customerName) all = all.filter(o => o.customerName.includes(values.customerName));
    if (values.type) {
        const typeMap = { 'normal': '普通销售', 'after-sale': '售后销售', 'consignment': '受托加工销售' };
        all = all.filter(o => o.type === typeMap[values.type]);
    }
    setDataSource(all);
  };

  return (
    <Modal forceRender
      title="关联销售订单 (仅显示待发货/备货中的订单)"
      open={open}
      onCancel={onCancel}
      width={900}
      onOk={() => onConfirm(selectedOrder)}
      okButtonProps={{ disabled: !selectedOrder }}
      centered
    >
      <Form form={form} layout="inline" className="mb-4" onFinish={handleSearch}>
        <Form.Item name="customerName" label="客户名称">
          <Input placeholder="模糊查询" allowClear className="w-32" />
        </Form.Item>
        <Form.Item name="orderNo" label="订单号">
          <Input placeholder="模糊查询" allowClear className="w-40" />
        </Form.Item>
        <Form.Item name="type" label="订单类型">
          <Select placeholder="选择类型" className="w-32" allowClear>
            <Select.Option value="normal">普通销售</Select.Option>
            <Select.Option value="after-sale">售后销售</Select.Option>
            <Select.Option value="consignment">受托加工销售</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button onClick={() => { form.resetFields(); setDataSource(getNormalizedData()); }} icon={<ReloadOutlined />}>重置</Button>
          </Space>
        </Form.Item>
      </Form>

      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="id"
        size="small"
        scroll={{ y: 400 }}
        rowSelection={{
          type: 'radio',
          selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
          onChange: (keys, rows) => {
            setSelectedRowKey(keys[0]);
            setSelectedOrder(rows[0]);
          }
        }}
        onRow={(record) => ({
          onClick: () => {
            setSelectedRowKey(record.id);
            setSelectedOrder(record);
          }
        })}
        pagination={{ pageSize: 10, showSizeChanger: true }}
      />
    </Modal>
  );
};

export default SalesOrderSelectModal;
