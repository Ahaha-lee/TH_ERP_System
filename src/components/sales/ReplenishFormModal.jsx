import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, DatePicker, Select, Button, Space, Table, InputNumber, Divider, message, Typography } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import OrderSourceSelectModal from './OrderSourceSelectModal';
import { employees } from '../../mock';
import { products } from '../../mock';

const { TextArea } = Input;

const ReplenishFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [sourceOrder, setSourceOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({ ...editingRecord, orderDate: dayjs(editingRecord.orderDate) });
        setItems(editingRecord.items || []);
        setSourceOrder({ orderNo: editingRecord.orderNo, customerName: editingRecord.customerName });
      } else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            orderDate: dayjs(),
            salesperson: '当前用户'
        });
        setItems([]);
        setSourceOrder(null);
      }
    }
  }, [open, editingRecord, form]);

  const handleSourceConfirm = (order) => {
    setSourceOrder(order);
    form.setFieldsValue({ customerName: order.customerName });
  };

  const handleAddItem = () => {
    setItems([...items, { id: Date.now(), productCode: '', productName: '', quantity: 1, remark: '' }]);
  };

  const handleSave = (isSubmit = false) => {
    form.validateFields().then(values => {
      if (!sourceOrder) return message.warning('请选择原销售订单');
      if (items.length === 0) return message.warning('请添加补货产品');
      
      onSave({
          ...values,
          id: editingRecord?.id,
          orderNo: sourceOrder.orderNo,
          items,
          status: isSubmit ? '待发货' : '草稿',
          orderDate: values.orderDate.format('YYYY-MM-DD')
      });
    });
  };

  const columns = [
      { title: '产品', dataIndex: 'productCode', render: (val, rec) => (
          <Select 
            showSearch 
            style={{ width: '100%' }} 
            value={val} 
            onChange={v => {
                const p = products.find(x => x.productCode === v);
                setItems(prev => prev.map(i => i.id === rec.id ? { ...i, productCode: v, productName: p?.productName } : i))
            }}
            options={products.map(p => ({ value: p.productCode, label: `${p.productCode}-${p.productName}` }))}
          />
      )},
      { title: '数量', dataIndex: 'quantity', width: 100, render: (v, rec) => <InputNumber min={1} value={v} onChange={val => setItems(prev => prev.map(i => i.id === rec.id ? { ...i, quantity: val } : i))} /> },
      { title: '备注', dataIndex: 'remark', render: (v, rec) => <Input value={v} onChange={e => setItems(prev => prev.map(i => i.id === rec.id ? { ...i, remark: e.target.value } : i))} /> },
      { title: '操作', width: 60, render: (_, rec) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setItems(prev => prev.filter(i => i.id !== rec.id))} /> }
  ];

  return (
    <Modal forceRender
      title={editingRecord ? `编辑补货单 - ${editingRecord.replenishNo}` : '新建补货单'}
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleSave(false)}>保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleSave(true)}>保存并提交</Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}><Form.Item name="replenishNo" label="补货单号"><Input disabled /></Form.Item></Col>
          <Col span={6}>
            <Form.Item label="原销售订单" required>
              <Space.Compact style={{ width: '100%' }}>
                <Input value={sourceOrder?.orderNo} disabled />
                <Button type="primary" icon={<SearchOutlined />} onClick={() => setOrderModalOpen(true)} />
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={6}><Form.Item name="customerName" label="客户"><Input disabled /></Form.Item></Col>
          <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
        </Row>
        <Divider titlePlacement="left">补货明细</Divider>
        <Button icon={<PlusOutlined />} onClick={handleAddItem} style={{ marginBottom: 8 }}>添加行</Button>
        <Table dataSource={items} columns={columns} rowKey="id" size="small" pagination={false} />
      </Form>
      <OrderSourceSelectModal open={orderModalOpen} onCancel={() => setOrderModalOpen(false)} onConfirm={handleSourceConfirm} />
    </Modal>
  );
};

export default ReplenishFormModal;
