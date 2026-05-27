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
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { generateDeliveryNoticeNo, formatCurrency } from '../../utils/helpers';
import { employees, customers } from '../../mock';
import SalesOrderSelectModal from './SalesOrderSelectModal';

const { TextArea } = Input;
const { Text } = Typography;

const DeliveryNoticeFormModal = ({ open, onClose, onSuccess, initialData, initialOrder }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [orderSelectOpen, setOrderSelectOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [attachmentList, setAttachmentList] = useState([]);

  const onConfirmOrder = (incoming) => {
    if (!incoming) return;
    const orders = Array.isArray(incoming) ? incoming : [incoming];
    if (orders.length === 0) return;
    setSelectedOrders(orders);
    
    const combinedOrderNos = orders.map(o => o.orderNo).join(', ');

    form.setFieldsValue({
      orderNo: combinedOrderNos
    });
    
    const allNoticeItems = [];
    orders.forEach(order => {
      const rawItems = order.items || order.processedItems || [];
      rawItems.forEach(item => {
        const stockQty = item.stock || Math.floor(Math.random() * 500) + 50;
        const allocated = Math.floor(stockQty * 0.15);
        const available = stockQty - allocated;
        allNoticeItems.push({
          ...item,
          id: `notice-${order.orderNo}-${item.id || Math.random()}`,
          sourceOrderNo: order.orderNo,
          customerName: order.customerName || order.customer || '未知客户',
          expectDeliveryDate: order.expectDeliveryDate || '-',
          deliveryMethod: order.deliveryMethod || '物流',
          productCode: item.productCode || item.materialCode || '-',
          productName: item.productName || item.materialName || '-',
          model: item.model || 'M-2026',
          property: item.property || '标准属性',
          orderQty: item.quantity,
          shippedQty: item.shippedQty || 0,
          stock: stockQty,
          availableQty: available,
          allocatedQty: allocated,
          pendingQty: item.quantity - (item.shippedQty || 0),
          currentQty: item.quantity - (item.shippedQty || 0),
          remark: ''
        });
      });
    });
    setItems(allNoticeItems.filter(i => i.pendingQty > 0));
    setOrderSelectOpen(false);
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          ...initialData,
          createdAt: dayjs(initialData.createdAt)
        });
        setItems(initialData.items || []);
        if (initialData.orderNo) {
          setSelectedOrders([{ orderNo: initialData.orderNo, customerName: initialData.customerName || '未知客户' }]);
        }
      } else if (initialOrder) {
        form.resetFields();
        form.setFieldValue('noticeNo', `FH-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 9000 + 1000)}`);
        form.setFieldValue('createdAt', dayjs());
        onConfirmOrder(initialOrder);
      } else { 
        form.setFieldsValue({ noticeNo: `FH-${Math.floor(Math.random() * 9000 + 1000)}` });
        form.setFieldValue('createdAt', dayjs());
        setItems([]);
        setSelectedOrders([]);
        setAttachmentList([]);
      }
    }
  }, [open, initialData, initialOrder, form]);

  const totalAmount = useMemo(() => {
      return items.reduce((sum, i) => sum + (i.currentQty * (i.unitPrice || 0)), 0);
  }, [items]);

  const handleSubmit = (submitType) => {
    form.validateFields().then(values => {
      if (items.length === 0) return message.warning('无法发货：产品明细为空');
      if (items.every(i => i.currentQty <= 0)) return message.warning('本次发货数量必须大于0');

      if (submitType === 'submit') {
          // Default to 待仓库审批 as there are no customer/payment-based conditional validation requirements
          const nextStatus = '待仓库审批';

          onSuccess({
            ...values,
            createdAt: values.createdAt.format('YYYY-MM-DD'),
            items,
            status: nextStatus,
            approvalStatus: '待审批',
            auditResult: '-',
            totalAmount,
            paymentImages: [],
            attachments: attachmentList.map(f => ({ name: f.name, url: f.url || f.thumbUrl || 'file_url', status: 'done' }))
          });
      } else {
          // Save as draft
          onSuccess({
            ...values,
            createdAt: values.createdAt.format('YYYY-MM-DD'),
            items,
            status: '草稿',
            approvalStatus: '-',
            auditResult: '-',
            totalAmount,
            paymentImages: [],
            attachments: attachmentList.map(f => ({ name: f.name, url: f.url || f.thumbUrl || 'file_url', status: 'done' }))
          });
      }
    });
  };

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60 },
    { title: '销售订单号', dataIndex: 'sourceOrderNo', width: 145, render: (v) => v || form.getFieldValue('orderNo') || '-' },
    { 
      title: '客户名称（编码/名称）', 
      dataIndex: 'customerName', 
      width: 180,
      render: (v, rec) => {
        const custName = v || form.getFieldValue('customerName') || '未知客户';
        const custCode = rec?.customerCode || 'CUST-001';
        return `${custCode}/${custName}`;
      }
    },
    { title: '期望发货日期', dataIndex: 'expectDeliveryDate', width: 110, render: (v) => <span className="font-mono text-xs text-amber-600">{v}</span> },
    { 
      title: '发货方式', 
      dataIndex: 'deliveryMethod', 
      width: 110, 
      render: (text, record) => (
        <Select 
          value={text || '物流'} 
          style={{ width: '100%', fontSize: '12px' }}
          onChange={val => setItems(items.map(item => item.id === record.id ? { ...item, deliveryMethod: val } : item))}
          options={[
            { label: '物流', value: '物流' },
            { label: '快递', value: '快递' },
            { label: '自提', value: '自提' },
            { label: '送货', value: '送货' }
          ]}
        />
      )
    },
    { title: '产品编码', dataIndex: 'productCode' },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '型号', dataIndex: 'model', width: 100, render: (v) => <span className="text-gray-600">{v || '-'}</span> },
    { title: '属性', dataIndex: 'property', width: 100, render: (v) => <span className="text-gray-600">{v || '-'}</span> },
    { title: '库存数量', dataIndex: 'stock', width: 90, render: (v) => <Text type="secondary">{v !== undefined ? v : 0}</Text> },
    { title: '可用数量', dataIndex: 'availableQty', width: 90, render: (v, rec) => <span className="text-emerald-600 font-semibold">{v !== undefined ? v : Math.floor((rec.stock || 0) * 0.85)}</span> },
    { title: '占用数量', dataIndex: 'allocatedQty', width: 90, render: (v, rec) => <span className="text-amber-600">{v !== undefined ? v : Math.floor((rec.stock || 0) * 0.15)}</span> },
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
          
          <Form.Item label="业务员" name="salesperson" initialValue="管理员">
            <Select>{employees?.map(e => <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>)}</Select>
          </Form.Item>
          
          <Form.Item label="创建日期" name="createdAt"><DatePicker className="w-full" disabled /></Form.Item>
          <Form.Item name="orderNo" style={{ display: 'none' }} rules={[{ required: true, message: '请点击右侧按钮选择销售订单并加载明细' }]}><Input /></Form.Item>
        </div>

        <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-dashed flex items-center justify-between">
            <div>
                <div className="text-sm font-semibold text-gray-800">关联销售订单</div>
                <div className="text-xs text-gray-500 mt-1">
                    {selectedOrders.length > 0 ? `已关联订单: ${selectedOrders.map(o => o.orderNo).join(', ')} (${selectedOrders.map(o => o.customerName || '未知客户').join(', ')})` : '尚未选择销售订单（请先选择订单以自动加载待发货产品明细）'}
                </div>
            </div>
            <Button type="primary" onClick={() => setOrderSelectOpen(true)}>
                {selectedOrders.length > 0 ? '更换销售订单' : '选择销售订单'}
            </Button>
        </div>

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
        <Table dataSource={items} columns={columns} rowKey="id" size="small" pagination={false} scroll={{ x: 1300 }} />
        
        <div className="mt-4 p-3 bg-blue-50 rounded text-right">
            <Text type="secondary">本次发货总额预估：</Text>
            <Text strong className="text-lg text-blue-600">{formatCurrency(totalAmount)}</Text>
        </div>
      </Form>

      <SalesOrderSelectModal open={orderSelectOpen} onCancel={() => setOrderSelectOpen(false)} onConfirm={onConfirmOrder} multiple={true} />
    </Modal>
  );
};

export default DeliveryNoticeFormModal;
