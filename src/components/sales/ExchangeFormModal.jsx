import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Row, Col, Input, DatePicker, Select, Button, Space, Table, Divider, message, Typography, Card, Checkbox } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import OrderSourceSelectModal from './OrderSourceSelectModal';
import { employees } from '../../mock';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ExchangeFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [sourceOrder, setSourceOrder] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({ ...editingRecord, orderDate: dayjs(editingRecord.orderDate) });
        setReturnItems(editingRecord.returnItems || []);
        setExchangeItems(editingRecord.exchangeItems || []);
        setSourceOrder({ orderNo: editingRecord.orderNo, customerName: editingRecord.customerName });
      } else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            orderDate: dayjs(),
            salesperson: '当前用户'
        });
        setReturnItems([]);
        setExchangeItems([]);
        setSourceOrder(null);
      }
    }
  }, [open, editingRecord, form]);

  const handleSourceConfirm = (order) => {
    setSourceOrder(order);
    form.setFieldsValue({ customerName: order.customerName });
    setReturnItems(order.items.map(i => ({ ...i, checked: false, returnQuantity: i.quantity })));
    setExchangeItems([]);
  };

  const handleReturnCheck = (id, checked) => {
    setReturnItems(prev => prev.map(item => {
        if (item.id === id) return { ...item, checked };
        return item;
    }));
    // Sync with exchangeItems
    if (checked) {
        const item = returnItems.find(i => i.id === id);
        setExchangeItems(prev => [...prev, { ...item, id: item.id + '-ex', quantity: item.quantity }]);
    } else {
        setExchangeItems(prev => prev.filter(i => i.id !== id + '-ex'));
    }
  };

  const totals = useMemo(() => {
      const retTotal = returnItems.filter(i => i.checked).reduce((acc, curr) => acc + (curr.unitPrice * curr.returnQuantity), 0);
      const excTotal = exchangeItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
      return { retTotal, excTotal, diff: excTotal - retTotal };
  }, [returnItems, exchangeItems]);

  const handleSave = (isSubmit = false) => {
    form.validateFields().then(values => {
      if (!sourceOrder) return message.warning('请选择原销售订单');
      if (exchangeItems.length === 0) return message.warning('请选择要换货的产品');

      onSave({
          ...values,
          id: editingRecord?.id,
          orderNo: sourceOrder.orderNo,
          returnItems: returnItems.filter(i => i.checked),
          exchangeItems,
          status: isSubmit ? '待发货' : '草稿',
          returnStatus: '待收货',
          orderDate: values.orderDate.format('YYYY-MM-DD')
      });
    });
  };

  return (
    <Modal forceRender
      title={editingRecord ? `编辑换货单 - ${editingRecord.exchangeNo}` : '新建换货单'}
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleSave(false)}>保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleSave(true)}>提交审批</Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}><Form.Item name="exchangeNo" label="换货单号"><Input disabled /></Form.Item></Col>
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
          <Col span={24}><Form.Item name="reason" label="换货原因"><Input /></Form.Item></Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Card title="退回旧货" size="small">
              <Table 
                dataSource={returnItems} 
                rowKey="id" 
                size="small" 
                pagination={false} 
                columns={[
                    { title: '', dataIndex: 'checked', width: 40, render: (val, rec) => <Checkbox checked={val} onChange={e => handleReturnCheck(rec.id, e.target.checked)} /> },
                    { title: '产品', dataIndex: 'productName' },
                    { title: '数量', dataIndex: 'returnQuantity', width: 60 }
                ]} 
              />
            </Card>
          </Col>
          <Col span={12}>
            <Card title="换出新货" size="small">
                <Table 
                    dataSource={exchangeItems} 
                    rowKey="id" 
                    size="small" 
                    pagination={false} 
                    columns={[
                        { title: '产品', dataIndex: 'productName' },
                        { title: '数量', dataIndex: 'quantity', width: 80, render: (v, rec) => <InputNumber size="small" value={v} onChange={val => setExchangeItems(prev => prev.map(i => i.id === rec.id ? { ...i, quantity: val } : i))} /> },
                        { title: '小计', render: (_, rec) => ((rec.unitPrice || 0) * (rec.quantity || 0)).toFixed(2) }
                    ]} 
                />
            </Card>
          </Col>
        </Row>
        <Divider />
        <Row justify="end" gutter={32}>
            <Col><Text>退回金额: ¥{(totals.retTotal || 0).toFixed(2)}</Text></Col>
            <Col><Text>换出金额: ¥{(totals.excTotal || 0).toFixed(2)}</Text></Col>
            <Col><Text strong type={totals.diff !== 0 ? 'danger' : 'success'}>换货差额: ¥{(totals.diff || 0).toFixed(2)}</Text></Col>
        </Row>
      </Form>
      <OrderSourceSelectModal open={orderModalOpen} onCancel={() => setOrderModalOpen(false)} onConfirm={handleSourceConfirm} />
    </Modal>
  );
};

export default ExchangeFormModal;
