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
  Space, 
  message,
  Card
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { generateReturnOrderNo, formatCurrency } from '../../utils/helpers';
import OrderSourceSelectModal from './OrderSourceSelectModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

const AfterSaleReturnFormModal = ({ open, onClose, onSuccess, initialData }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [sourceSelectOpen, setSourceSelectOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          orderDate: dayjs(initialData.orderDate)
        });
        setItems(initialData.items || []);
      } else {
        setItems([]);
      }
    }
  }, [open, initialData, form]);

  const onConfirmSource = (order) => {
    form.setFieldsValue({
      relOrderNo: order.orderNo,
      customerName: order.customerName,
      customerType: order.customerType,
      settlementMethod: order.settlementMethod,
      monthlyCycle: order.monthlyCycle || '30天',
      prepaidBalance: order.prepaidBalance || (order.settlementMethod === '预存' ? 50000 : 0),
      project: order.project || '深圳总公司',
      receivedAmount: order.receivedAmount || 0
    });
    
    const returnItems = (order.items || []).map(item => ({
      ...item,
      returnedQty: 0, // Mock: assuming 0 returned before
      canReturnQty: item.quantity,
      currentReturnQty: 0,
      returnUnitPrice: item.unitPrice,
      amount: 0
    }));
    setItems(returnItems);
    setSourceSelectOpen(false);
  };

  const handleUpdateItem = (id, field, value) => {
    const newList = items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        updated.amount = (updated.currentReturnQty || 0) * (updated.returnUnitPrice || 0);
        return updated;
      }
      return item;
    });
    setItems(newList);
  };

  const productTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const otherFee = Form.useWatch('otherFee', form) || 0;
  const receivedAmount = Form.useWatch('receivedAmount', form) || 0;
  const finalTotal = productTotal + otherFee;

  const columns = [
    { title: '序号', render: (_, __, idx) => idx + 1, width: 50 },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '原单价', dataIndex: 'unitPrice', render: val => formatCurrency(val) },
    { title: '可退数量', dataIndex: 'canReturnQty' },
    { 
      title: '本次退货数量', 
      dataIndex: 'currentReturnQty', 
      width: 120,
      render: (val, record) => (
        <InputNumber 
          min={0} 
          max={record.canReturnQty} 
          value={val} 
          onChange={(v) => handleUpdateItem(record.id, 'currentReturnQty', v)} 
        />
      )
    },
    { 
      title: '退货单价', 
      dataIndex: 'returnUnitPrice', 
      width: 120,
      render: (val, record) => (
        <InputNumber 
          min={0} 
          value={val} 
          onChange={(v) => handleUpdateItem(record.id, 'returnUnitPrice', v)} 
        />
      )
    },
    { title: '退货金额', dataIndex: 'amount', render: val => formatCurrency(val) },
    { title: '备注', dataIndex: 'remark', render: (val, record) => <Input value={val} onChange={(e) => handleUpdateItem(record.id, 'remark', e.target.value)} /> }
  ];

  return (
    <Modal
      title={initialData ? "编辑退货单" : "新增退货单"}
      open={open}
      onCancel={onClose}
      width={900}
      forceRender
      onOk={() => {
        form.validateFields().then(values => {
          if (items.some(i => i.currentReturnQty > 0)) {
            onSuccess({ ...values, items: items.filter(i => i.currentReturnQty > 0), totalAmount: finalTotal });
          } else {
            message.warning('请填写退货数量');
          }
        });
      }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-3 gap-4">
          <Form.Item label="退货单号" name="orderNo"><Input disabled /></Form.Item>
          <Form.Item label="原销售订单号" name="relOrderNo" rules={[{ required: true, message: '请选择原单' }]}>
            <Input 
              readOnly 
              onClick={() => setSourceSelectOpen(true)} 
              suffix={<Button size="small" type="link" onClick={() => setSourceSelectOpen(true)}>选择</Button>} 
            />
          </Form.Item>
          <Form.Item label="客户" name="customerName"><Input disabled /></Form.Item>
          <Form.Item label="客户类型" name="customerType"><Input disabled /></Form.Item>
          <Form.Item label="结算方式" name="settlementMethod"><Input disabled /></Form.Item>
          <Form.Item label="订单日期" name="orderDate"><DatePicker className="w-full" /></Form.Item>
          <Form.Item label="业务员" name="salesman" initialValue="管理员">
            <Select>
                <Select.Option value="管理员">管理员</Select.Option>
                <Select.Option value="张三">张三</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="退货原因" name="reason" rules={[{ required: true }]}>
             <Select>
                <Select.Option value="质量问题">质量问题</Select.Option>
                <Select.Option value="运输损坏">运输损坏</Select.Option>
                <Select.Option value="错发">错发</Select.Option>
                <Select.Option value="客户原因">客户原因</Select.Option>
                <Select.Option value="其他">其他</Select.Option>
             </Select>
          </Form.Item>
        </div>

        <Divider titlePlacement="left" plain>退货产品明细</Divider>
        <Alert title="仅显示原订单产品，数量不超过'可退数量'" type="info" showIcon className="mb-4" />
        <Table dataSource={items} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 1000 }} />

        <div className="mt-8 flex justify-end">
           <Card size="small" className="w-80 shadow-sm bg-gray-50 border-none">
              <div className="space-y-2">
                 <div className="flex justify-between"><span>退货产品总额:</span><span>{formatCurrency(productTotal)}</span></div>
                 <div className="flex justify-between items-center">
                    <span>其他应收费用:</span>
                    <Form.Item name="otherFee" noStyle initialValue={0}>
                       <InputNumber size="small" min={0} className="w-24" />
                    </Form.Item>
                 </div>
                 <Divider className="my-2" />
                 <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">订单金额:</span>
                    <span className="text-2xl font-bold text-red-500">{formatCurrency(finalTotal)}</span>
                 </div>
                 <div className="mt-4 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-orange-600">
                    {finalTotal <= receivedAmount ? (
                        `本次退货冲抵应收账款 ${formatCurrency(finalTotal)}，无需退款`
                    ) : (
                        `退货金额超过原单已收款，差额 ${formatCurrency(finalTotal - receivedAmount)} 需退款客户`
                    )}
                 </div>
              </div>
           </Card>
        </div>
      </Form>
      <OrderSourceSelectModal open={sourceSelectOpen} onCancel={() => setSourceSelectOpen(false)} onConfirm={onConfirmSource} />
    </Modal>
  );
};

// Alert is from antd
import { Alert } from 'antd';

export default AfterSaleReturnFormModal;
