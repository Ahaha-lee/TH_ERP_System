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
  Alert
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { generateReplenishOrderNo, formatCurrency } from '../../utils/helpers';
import OrderSourceSelectModal from './OrderSourceSelectModal';

const { TextArea } = Input;

const AfterSaleReplenishFormModal = ({ open, onClose, onSuccess, initialData }) => {
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
      project: order.project || '深圳总公司'
    });
    
    const replenishItems = (order.items || []).map(item => ({
      ...item,
      currentQty: 0,
      remark: ''
    }));
    setItems(replenishItems);
    setSourceSelectOpen(false);
  };

  const updateItem = (id, field, value) => {
    setItems(items => items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const columns = [
    { title: '序号', render: (_, __, idx) => idx + 1, width: 50 },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '原订单数量', dataIndex: 'quantity' },
    { 
      title: '本次补货数量', 
      dataIndex: 'currentQty', 
      width: 150,
      render: (val, record) => <InputNumber min={0} value={val} onChange={(v) => updateItem(record.id, 'currentQty', v)} />
    },
    { title: '备注', dataIndex: 'remark', render: (val, record) => <Input value={val} onChange={(e) => updateItem(record.id, 'remark', e.target.value)} /> }
  ];

  return (
    <Modal forceRender
      title={initialData ? "编辑补货单" : "新增补货单"}
      open={open}
      onCancel={onClose}
      width={900}
      onOk={() => {
        form.validateFields().then(values => {
          if (items.some(i => i.currentQty > 0)) {
            onSuccess({ ...values, items: items.filter(i => i.currentQty > 0) });
          } else {
            message.warning('请填写补货数量');
          }
        });
      }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-3 gap-4">
          <Form.Item label="补货单号" name="orderNo"><Input disabled /></Form.Item>
          <Form.Item label="原销售订单号" name="relOrderNo" rules={[{ required: true }]}>
             <Input readOnly onClick={() => setSourceSelectOpen(true)} />
          </Form.Item>
          <Form.Item label="客户" name="customerName"><Input disabled /></Form.Item>
          <Form.Item label="订单日期" name="orderDate"><DatePicker className="w-full" /></Form.Item>
          <Form.Item label="业务员" name="salesman" initialValue="管理员">
            <Select>
                <Select.Option value="管理员">管理员</Select.Option>
                <Select.Option value="张三">张三</Select.Option>
            </Select>
          </Form.Item>
        </div>
        <Form.Item label="备注" name="remark"><TextArea rows={2} /></Form.Item>

        <Divider titlePlacement="left" plain>补货产品明细</Divider>
        <Alert title="补货不产生应收账款，补货出库按原订单成本快照计算" type="warning" showIcon className="mb-4" />
        <Table dataSource={items} columns={columns} rowKey="id" size="small" pagination={false} />
      </Form>
      <OrderSourceSelectModal open={sourceSelectOpen} onCancel={() => setSourceSelectOpen(false)} onConfirm={onConfirmSource} />
    </Modal>
  );
};

export default AfterSaleReplenishFormModal;
