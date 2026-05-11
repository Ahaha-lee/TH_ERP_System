import React, { useState, useEffect, useMemo } from 'react';
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
  Upload, 
  message, 
  Tag 
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { generateDeliveryNoticeNo, formatCurrency } from '../../utils/helpers';
import { employees, customers } from '../../mock';
import SalesOrderSelectModal from './SalesOrderSelectModal';
import CustomerSelectModal from '../quotation/CustomerSelectModal';

const { TextArea } = Input;
const { Text } = Typography;

const DeliveryNoticeFormModal = ({ open, onClose, onSuccess, initialData, initialOrder }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [orderSelectOpen, setOrderSelectOpen] = useState(false);
  const [customerSelectOpen, setCustomerSelectOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [attachmentList, setAttachmentList] = useState([]);

  const onConfirmOrder = (order) => {
    if (!order) return;
    setSelectedOrder(order);
    const customer = customers.find(c => c.id === order.customerId);
    
    form.setFieldsValue({
      orderNo: order.orderNo,
      customerName: order.customerName,
      settlementMethod: order.settlementMethod || '月结',
      monthlyCycle: order.monthlyCycle || '30天',
      prepaidBalance: customer?.prepaidBalance || (order.settlementMethod === '预存' ? 50000 : 0),
      hasOverdue: customer?.hasOverdue || false,
      expectDeliveryDate: order.expectDeliveryDate ? dayjs(order.expectDeliveryDate) : null
    });
    
    const rawItems = order.items || order.processedItems || [];
    const noticeItems = rawItems.map(item => ({
      ...item,
      id: `notice-${item.id || Math.random()}`,
      productCode: item.productCode || item.materialCode || '-',
      productName: item.productName || item.materialName || '-',
      orderQty: item.quantity,
      shippedQty: item.shippedQty || 0,
      stock: item.stock || Math.floor(Math.random() * 500) + 50, 
      pendingQty: item.quantity - (item.shippedQty || 0),
      currentQty: item.quantity - (item.shippedQty || 0),
      remark: ''
    }));
    setItems(noticeItems.filter(i => i.pendingQty > 0));
    setOrderSelectOpen(false);
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          expectDeliveryDate: initialData.expectDeliveryDate ? dayjs(initialData.expectDeliveryDate) : null,
          createdAt: dayjs(initialData.createdAt)
        });
        setItems(initialData.items || []);
        if (initialData.paymentImages) {
            setFileList(initialData.paymentImages.map((img, i) => ({ uid: i, url: img.url, name: 'image.png', status: 'done' })));
        }
      } else if (initialOrder) {
        form.resetFields();
        form.setFieldValue('noticeNo', `FH-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 9000 + 1000)}`);
        form.setFieldValue('createdAt', dayjs());
        onConfirmOrder(initialOrder);
      } else { form.setFieldsValue({ noticeNo: `FH-${Math.floor(Math.random() * 9000 + 1000)}` });
        form.setFieldValue('createdAt', dayjs());
        setItems([]);
        setSelectedOrder(null);
        setFileList([]);
        setAttachmentList([]);
      }
    }
  }, [open, initialData, initialOrder, form]);

  const settlementMethod = Form.useWatch('settlementMethod', form);
  const hasOverdue = Form.useWatch('hasOverdue', form);
  const prepaidBalance = Form.useWatch('prepaidBalance', form);

  const totalAmount = useMemo(() => {
      return items.reduce((sum, i) => sum + (i.currentQty * (i.unitPrice || 0)), 0);
  }, [items]);

  const handleSubmit = (submitType) => {
    form.validateFields().then(values => {
      if (items.length === 0) return message.warning('无法发货：产品明细为空');
      if (items.every(i => i.currentQty <= 0)) return message.warning('本次发货数量必须大于0');

      if (submitType === 'submit') {
          // Validation 1: Payment screenshot for cash/spot
          if (['现结', '现金'].includes(settlementMethod) && fileList.length === 0) {
              return message.error('现金/现结客户必须上传付款截图才能提交');
          }

          // Validation 2: Overdue for monthly
          if (settlementMethod === '月结' && hasOverdue) {
              return message.error('客户存在逾期未付账单，仅可保存草稿');
          }

          // Validation 3: Balance for prepaid
          if (settlementMethod === '预存' && prepaidBalance < totalAmount) {
              return message.error('余额不足，仅可保存草稿');
          }

          // Determine Status
          let nextStatus = '';
          if (['现结', '现金'].includes(settlementMethod)) {
              nextStatus = '待财务审批';
          } else {
              nextStatus = '待仓库审批';
          }

          onSuccess({
            ...values,
            createdAt: values.createdAt.format('YYYY-MM-DD'),
            expectDeliveryDate: values.expectDeliveryDate.format('YYYY-MM-DD'),
            items,
            status: nextStatus,
            approvalStatus: '待审批',
            auditResult: '-',
            totalAmount,
            paymentImages: fileList.map(f => ({ url: f.url || f.thumbUrl || 'https://placehold.co/100x100?text=Image' })),
            attachments: attachmentList.map(f => ({ name: f.name, url: f.url || f.thumbUrl || 'file_url', status: 'done' }))
          });
      } else {
          // Save as draft
          onSuccess({
            ...values,
            createdAt: values.createdAt.format('YYYY-MM-DD'),
            expectDeliveryDate: values.expectDeliveryDate.format('YYYY-MM-DD'),
            items,
            status: '草稿',
            approvalStatus: '-',
            auditResult: '-',
            totalAmount,
            paymentImages: fileList.map(f => ({ url: f.url || f.thumbUrl || 'https://placehold.co/100x100?text=Image' })),
            attachments: attachmentList.map(f => ({ name: f.name, url: f.url || f.thumbUrl || 'file_url', status: 'done' }))
          });
      }
    });
  };

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60 },
    { title: '产品编码', dataIndex: 'productCode' },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '当前库存', dataIndex: 'stock', width: 90, render: (v) => <Text type="secondary">{v}</Text> },
    { title: '订单数量', dataIndex: 'orderQty', width: 90 },
    { title: '已发货数量', dataIndex: 'shippedQty', width: 100 },
    { title: '未发货数量', dataIndex: 'pendingQty', width: 100 },
    { 
      title: '本次发货数量', 
      dataIndex: 'currentQty', 
      width: 120,
      render: (val, record) => (
        <InputNumber 
          min={1} 
          max={record.pendingQty} 
          value={val} 
          style={{ width: '100% '}}
          onChange={val => setItems(items.map(item => item.id === record.id ? { ...item, currentQty: val } : item))} 
        />
      )
    },
    { 
      title: '备注', 
      dataIndex: 'remark',
      render: (text, record) => (
        <Input value={text} placeholder="行备注" onChange={e => setItems(items.map(item => item.id === record.id ? { ...item, remark: e.target.value } : item))} />
      )
    }
  ];

  return (
    <Modal
      title={initialData ? `编辑发货通知单 - ${initialData.noticeNo}` : '新建发货通知单'}
      open={open}
      onCancel={onClose}
      width={900}
      centered
      forceRender
      footer={[
        <Button key="cancel" onClick={onClose}>取消</Button>,
        <Button key="draft" onClick={() => handleSubmit('draft')}>保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleSubmit('submit')}>保存并提交</Button>
      ]}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-x-8">
          <Form.Item label="发货通知单号" name="noticeNo"><Input disabled /></Form.Item>
          <Form.Item label="销售订单号" name="orderNo" rules={[{ required: true, message: '请选择销售订单' }]}>
            <Input 
              readOnly 
              onClick={() => setOrderSelectOpen(true)} 
              placeholder="选择备货中的订单"
              suffix={<Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setOrderSelectOpen(true); }}>选择</Button>} 
            />
          </Form.Item>
          <Form.Item label="客户名称" name="customerName" rules={[{ required: true, message: '请选择客户' }]}>
            <Input 
              readOnly 
              placeholder="请选择客户"
              onClick={() => setCustomerSelectOpen(true)}
              suffix={<Button type="link" size="small" onClick={(e) => { e.stopPropagation(); setCustomerSelectOpen(true); }}>选择</Button>}
            />
          </Form.Item>
          <Form.Item label="结算方式" name="settlementMethod">
            <div className="flex items-center gap-2 mt-1">
                <Tag color={settlementMethod === '月结' ? 'blue' : settlementMethod === '现结' ? 'orange' : settlementMethod === '预存' ? 'green' : 'gray'}>
                    {settlementMethod || '-'}
                </Tag>
                {hasOverdue && <Tag color="red">存在逾期</Tag>}
            </div>
          </Form.Item>
          
          {settlementMethod === '月结' && (
            <Form.Item label="月结周期" name="monthlyCycle"><Input disabled /></Form.Item>
          )}
          {settlementMethod === '预存' && (
            <Form.Item label="预存余额" name="prepaidBalance">
              <InputNumber className="w-full" disabled formatter={val => formatCurrency(val)} />
            </Form.Item>
          )}
          
          <Form.Item label="期望发货日期" name="expectDeliveryDate" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker className="w-full" disabled />
          </Form.Item>
          <Form.Item label="业务员" name="salesperson" initialValue="管理员">
            <Select>{employees?.map(e => <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>)}</Select>
          </Form.Item>
          <Form.Item label="发货方式" name="deliveryMethod" rules={[{ required: true, message: '请选择方式' }]}>
            <Select>
              <Select.Option value="物流">物流</Select.Option>
              <Select.Option value="自提">自提</Select.Option>
              <Select.Option value="其他">其他</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="创建日期" name="createdAt"><DatePicker className="w-full" disabled /></Form.Item>
        </div>

        {['现结', '现金'].includes(settlementMethod) && (
          <Form.Item label="付款凭证 (必填)" required extra="请上传至少一张支付核销截图">
            <Upload 
                listType="picture-card" 
                fileList={fileList}
                onChange={({ fileList: fl }) => setFileList(fl)}
                beforeUpload={() => false}
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
              </div>
            </Upload>
          </Form.Item>
        )}

        <Form.Item label="备注" name="remark">
          <TextArea rows={2} maxLength={250} showCount placeholder="输入通知单备注" />
        </Form.Item>

        <Form.Item label="附件" extra="支持本地上传附件（如：特殊装箱要求、签收底单等）">
          <Upload
            fileList={attachmentList}
            onChange={({ fileList: fl }) => setAttachmentList(fl)}
            beforeUpload={() => false}
          >
            <Button icon={<UploadOutlined />}>上传本地附件</Button>
          </Upload>
        </Form.Item>

        <Divider titlePlacement="left" plain>发货产品明细</Divider>
        <Table dataSource={items} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 1000 }} />
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-right">
            <Text type="secondary">本次发货总额预估：</Text>
            <Text strong className="text-lg text-blue-600">{formatCurrency(totalAmount)}</Text>
        </div>
      </Form>

      <SalesOrderSelectModal open={orderSelectOpen} onCancel={() => setOrderSelectOpen(false)} onConfirm={onConfirmOrder} />
      
      <CustomerSelectModal 
        open={customerSelectOpen} 
        onCancel={() => setCustomerSelectOpen(false)} 
        onConfirm={(customer) => {
          form.setFieldsValue({
            customerName: customer.name,
            settlementMethod: customer.settlementMethod || '月结'
          });
          setCustomerSelectOpen(false);
        }} 
      />
    </Modal>
  );
};

export default DeliveryNoticeFormModal;
