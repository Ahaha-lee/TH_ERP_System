import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Row, Col, Input, DatePicker, Select, Button, Space, Table, InputNumber, Divider, message, Typography } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import OrderSourceSelectModal from './OrderSourceSelectModal';
import { employees } from '../../mock';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ReturnFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [sourceOrder, setSourceOrder] = useState(null);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          orderDate: dayjs(editingRecord.orderDate)
        });
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
    form.setFieldsValue({
        customerName: order.customerName,
        customerType: order.customerType,
        settlementMethod: order.settlementMethod
    });
    // Set items from order
    const returnItems = order.items.map(item => ({
        ...item,
        originalQuantity: item.quantity,
        canReturnQuantity: item.quantity,
        returnQuantity: 0,
        amount: 0
    }));
    setItems(returnItems);
  };

  const handleItemChange = (id, field, value) => {
      setItems(prev => prev.map(item => {
          if (item.id === id) {
              const updated = { ...item, [field]: value };
              if (field === 'returnQuantity') {
                  updated.amount = updated.unitPrice * value;
              }
              return updated;
          }
          return item;
      }));
  };

  const totalAmount = useMemo(() => items.reduce((acc, curr) => acc + curr.amount, 0), [items]);

  const handleSave = (isSubmit = false) => {
    form.validateFields().then(values => {
      if (!sourceOrder) return message.warning('请选择原销售订单');
      const hasReturn = items.some(i => i.returnQuantity > 0);
      if (!hasReturn) return message.warning('请至少输入一个退货数量');

      const data = {
        ...values,
        id: editingRecord?.id,
        orderNo: sourceOrder.orderNo,
        items: items.filter(i => i.returnQuantity > 0),
        returnAmount: totalAmount,
        status: isSubmit ? '待收货' : '草稿',
        orderDate: values.orderDate.format('YYYY-MM-DD')
      };
      onSave(data);
    });
  };

  const columns = [
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '原单数量', dataIndex: 'originalQuantity', width: 100 },
    { title: '可退数量', dataIndex: 'canReturnQuantity', width: 100 },
    { 
      title: '本次退货数量', 
      width: 120,
      render: (_, record) => (
        <InputNumber 
            min={0} 
            max={record.canReturnQuantity} 
            value={record.returnQuantity} 
            onChange={v => handleItemChange(record.id, 'returnQuantity', v)} 
        />
      )
    },
    { title: '退货单价', dataIndex: 'unitPrice', render: v => `¥${v}` },
    { title: '退货金额', dataIndex: 'amount', render: v => `¥${v}` }
  ];

  return (
    <Modal forceRender
      title={editingRecord ? `编辑退货单 - ${editingRecord.returnNo}` : '新建退货单'}
      open={open}
      onCancel={onCancel}
      width={900}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleSave(false)}>保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleSave(true)}>保存并提交</Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}><Form.Item name="returnNo" label="退货单号"><Input disabled /></Form.Item></Col>
          <Col span={12}>
            <Form.Item label="原销售订单" required>
              <Space.Compact style={{ width: '100%' }}>
                <Input value={sourceOrder?.orderNo} disabled placeholder="点击选择" />
                <Button type="primary" icon={<SearchOutlined />} onClick={() => setOrderModalOpen(true)} />
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={12}><Form.Item name="customerName" label="客户"><Input disabled /></Form.Item></Col>
          <Col span={12}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={12}><Form.Item name="salesperson" label="业务员"><Select options={employees.map(e => ({ value: e.name, label: e.name }))} /></Form.Item></Col>
          <Col span={12}><Form.Item name="returnReason" label="退货原因"><Input placeholder="请输入退货原因" /></Form.Item></Col>
          <Col span={24}><Form.Item name="remark" label="备注" className="mb-0"><TextArea rows={2} /></Form.Item></Col>
        </Row>
        <Divider titlePlacement="left">产品明细</Divider>
        <Table dataSource={items} columns={columns} rowKey="id" pagination={false} size="small" />
        <div style={{ textAlign: 'right', marginTop: 16 }}>
          <Title level={5}>退货总额: <span style={{ color: '#f5222d' }}>¥{(totalAmount || 0).toFixed(2)}</span></Title>
        </div>
      </Form>
      <OrderSourceSelectModal open={orderModalOpen} onCancel={() => setOrderModalOpen(false)} onConfirm={handleSourceConfirm} />
    </Modal>
  );
};

export default ReturnFormModal;
