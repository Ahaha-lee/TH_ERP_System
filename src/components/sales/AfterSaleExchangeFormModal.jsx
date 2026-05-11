import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Select, 
  Table, 
  Button, 
  Divider, 
  Typography,
  message,
  Checkbox
} from 'antd';
import dayjs from 'dayjs';
import { generateExchangeOrderNo, formatCurrency } from '../../utils/helpers';
import OrderSourceSelectModal from './OrderSourceSelectModal';
import { products } from '../../mock';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;

const AfterSaleExchangeFormModal = ({ open, onClose, onSuccess, initialData }) => {
  const [form] = Form.useForm();
  const [returnItems, setReturnItems] = useState([]);
  const [exchangeItems, setExchangeItems] = useState([]);
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({ ...initialData, orderDate: dayjs(initialData.orderDate) });
        setReturnItems(initialData.returnItems || []);
        setExchangeItems(initialData.exchangeItems || []);
      }
    }
  }, [open, initialData, form]);

  const onConfirmSource = (order) => {
    form.setFieldsValue({
      relOrderNo: order.orderNo,
      customerName: order.customerName,
      customerType: order.customerType
    });
    const items = order.items.map(item => ({
      ...item,
      checked: false,
      canReturnQty: item.quantity,
      currentReturnQty: 0,
      amount: 0
    }));
    setReturnItems(items);
    setSourceSelectOpen(false);
  };

  const handleUpdateReturn = (id, field, value) => {
    const newItems = returnItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = (updated.currentReturnQty || 0) * (updated.unitPrice || 0);
        return updated;
      }
      return item;
    });
    setReturnItems(newItems);
  };

  const handleAddExchange = () => {
    setExchangeItems([...exchangeItems, { id: Date.now().toString(), productCode: '', productName: '', spec: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleUpdateExchange = (id, field, value) => {
    const newItems = exchangeItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'productCode' || field === 'productName') {
           const prod = products.find(p => p.code === value || p.name === value);
           if (prod) { updated.productCode = prod.code; updated.productName = prod.name; updated.spec = prod.spec; updated.unitPrice = prod.standardPrice; }
        }
        updated.amount = (updated.quantity || 0) * (updated.unitPrice || 0);
        return updated;
      }
      return item;
    });
    setExchangeItems(newItems);
  };

  const returnTotal = returnItems.filter(i => i.checked).reduce((sum, item) => sum + (item.amount || 0), 0);
  const exchangeTotal = exchangeItems.reduce((sum, item) => sum + (item.amount || 0), 0);
  const diff = exchangeTotal - returnTotal;

  const returnColumns = [
    { 
      title: '勾选', 
      dataIndex: 'checked', 
      width: 50, 
      render: (val, record) => <Checkbox checked={val} onChange={e => handleUpdateReturn(record.id, 'checked', e.target.checked)} /> 
    },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '退回数', dataIndex: 'currentReturnQty', width: 100, render: (val, record) => <InputNumber min={0} max={record.canReturnQty} value={val} onChange={val => handleUpdateReturn(record.id, 'currentReturnQty', val)} disabled={!record.checked} /> },
    { title: '退回金额', dataIndex: 'amount', width: 100, render: val => formatCurrency(val) }
  ];

  const exchangeColumns = [
    { title: '产品名称', dataIndex: 'productName', render: (text, record) => (
      <Select showSearch value={text} onChange={val => handleUpdateExchange(record.id, 'productName', val)} className="w-full">
        {products.filter(p => p.isSaleable).map(p => <Select.Option key={p.id} value={p.name}>{p.name}</Select.Option>)}
      </Select>
    )},
    { title: '数量', dataIndex: 'quantity', width: 80, render: (val, record) => <InputNumber min={1} value={val} onChange={val => handleUpdateExchange(record.id, 'quantity', val)} /> },
    { title: '金额', dataIndex: 'amount', width: 100, render: val => formatCurrency(val) },
    { title: '', width: 50, render: (_, record) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setExchangeItems(exchangeItems.filter(i => i.id !== record.id))} /> }
  ];

  return (
    <Modal forceRender
      title="新增/编辑换货单"
      open={open}
      onCancel={onClose}
      width="1000px"
      onOk={() => {
        form.validateFields().then(values => {
          onSuccess({ ...values, returnItems: returnItems.filter(i => i.checked), exchangeItems, diffAmount: diff });
        });
      }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-3 gap-4">
          <Form.Item label="换货单号" name="orderNo"><Input disabled /></Form.Item>
          <Form.Item label="原订单号" name="relOrderNo" rules={[{ required: true }]}>
             <Input readOnly onClick={() => setSourceSelectOpen(true)} suffix={<Button size="small" type="link" onClick={() => setSourceSelectOpen(true)}>选择</Button>} />
          </Form.Item>
          <Form.Item label="客户" name="customerName"><Input disabled /></Form.Item>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
             <Divider titlePlacement="left" plain>退回旧货区</Divider>
             <Table dataSource={returnItems} columns={returnColumns} rowKey="id" size="small" pagination={false} />
          </div>
          <div className="flex-1">
             <Divider titlePlacement="left" plain>换出新货区</Divider>
             <div className="mb-2 text-right"><Button type="primary" size="small" onClick={handleAddExchange}>添加新货</Button></div>
             <Table dataSource={exchangeItems} columns={exchangeColumns} rowKey="id" size="small" pagination={false} />
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded flex justify-end items-center gap-8">
           <div><Text type="secondary">退回总额: </Text><Text strong>{formatCurrency(returnTotal)}</Text></div>
           <div><Text type="secondary">换出总额: </Text><Text strong>{formatCurrency(exchangeTotal)}</Text></div>
           <div>
             <Text type="secondary">换货差额: </Text>
             <Text strong className={diff > 0 ? 'text-green-600' : 'text-red-500'}>{formatCurrency(diff)}</Text>
           </div>
           <div>
             <Text strong>
               {diff > 0 ? `需客户补款 ${formatCurrency(diff)}` : diff < 0 ? `需退还客户 ${formatCurrency(Math.abs(diff))}` : '平换'}
             </Text>
           </div>
        </div>
      </Form>
      <OrderSourceSelectModal open={sourceSelectOpen} onCancel={() => setSourceSelectOpen(false)} onConfirm={onConfirmSource} />
    </Modal>
  );
};

export default AfterSaleExchangeFormModal;
