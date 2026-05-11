import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, Form, Input, DatePicker, Select, Switch, InputNumber, 
  Table, Button, Space, Typography, Divider, message 
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { projectMaterials, quotations } from '../mock';
import { formatCurrency, generateQuotationNo } from '../utils/helpers';
import CustomerSelectModal from './CustomerSelectModal';

const { Text, Title } = Typography;
const { TextArea } = Input;

const QuotationFormModal = ({ open, mode = 'add', quotation, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  
  // Watch fields for real-time calculation
  const otherFee = Form.useWatch('otherFee', form) || 0;
  const isDeposit = Form.useWatch('isDeposit', form);
  const depositRate = Form.useWatch('depositRate', form) || 30;

  useEffect(() => {
    if (open) {
      if (mode === 'edit' && quotation) {
        form.setFieldsValue({
          ...quotation,
          date: dayjs(quotation.date)
        });
        setSelectedCustomer({
          id: quotation.customerId,
          name: quotation.customerName,
          type: quotation.customerType,
          discountRate: quotation.discountRate
        });
        setItems(quotation.items || []);
      } else {
        form.setFieldsValue({
          quotationNo: generateQuotationNo(quotations.length + 1),
          date: dayjs(),
          salesperson: '管理员',
          isDeposit: false,
          depositRate: 30,
          otherFee: 0
        });
        setSelectedCustomer(null);
        setItems([]);
      }
    }
  }, [open, mode, quotation, form]);

  const totals = useMemo(() => {
    const productTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discountRate = selectedCustomer?.discountRate || 0;
    const discountedTotal = productTotal * (1 - discountRate / 100);
    const discountAmount = productTotal - discountedTotal;
    const finalAmount = discountedTotal + otherFee;
    const depositRequired = isDeposit ? discountedTotal * (depositRate / 100) : 0;

    return {
      productTotal,
      discountRate,
      discountedTotal,
      discountAmount,
      finalAmount,
      depositRequired
    };
  }, [items, selectedCustomer, otherFee, isDeposit, depositRate]);

  const handleAddItem = () => {
    const newItem = {
      id: `new-${Date.now()}`,
      quantity: 1,
      unitPrice: 0,
      amount: 0
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItems = () => {
    setItems(items.filter(item => !selectedRowKeys.includes(item.id)));
    setSelectedRowKeys([]);
  };

  const updateItem = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'materialId') {
          const material = projectMaterials.find(m => m.id === value);
          if (material) {
            updatedItem.code = material.code;
            updatedItem.name = material.name;
            updatedItem.spec = material.spec;
            updatedItem.standardPrice = material.standardPrice;
            updatedItem.unitPrice = material.standardPrice;
            updatedItem.amount = updatedItem.quantity * material.standardPrice;
          }
        } else if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.amount = updatedItem.quantity * updatedItem.unitPrice;
        }
        return updatedItem;
      }
      return item;
    });
    setItems(newItems);
  };

  const handleSubmit = (submitForAudit = false) => {
    form.validateFields().then(values => {
      if (!selectedCustomer) {
        message.warning('请选择客户');
        return;
      }
      if (items.length === 0) {
        message.warning('请至少添加一个产品');
        return;
      }

      const newQuotation = {
        ...values,
        id: mode === 'edit' ? quotation.id : `q-${Date.now()}`,
        status: submitForAudit ? '待审批' : '草稿',
        date: values.date.format('YYYY-MM-DD'),
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerType: selectedCustomer.type,
        discountRate: selectedCustomer.discountRate,
        amount: totals.finalAmount,
        items: items
      };
      
      onSuccess(newQuotation);
    });
  };

  const columns = [
    {
      title: '产品编码',
      dataIndex: 'materialId',
      width: 180,
      render: (val, record) => (
        <Select
          showSearch
          placeholder="搜索编码"
          className="w-full"
          value={val}
          onChange={(v) => updateItem(record.id, 'materialId', v)}
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        >
          {projectMaterials.filter(m => m.isSaleable).map(m => (
            <Select.Option key={m.id} value={m.id}>{m.code}</Select.Option>
          ))}
        </Select>
      )
    },
    {
      title: '产品名称',
      dataIndex: 'materialId',
      width: 180,
      render: (val, record) => (
        <Select
          showSearch
          placeholder="搜索名称"
          className="w-full"
          value={val}
          onChange={(v) => updateItem(record.id, 'materialId', v)}
          filterOption={(input, option) => option.children.toLowerCase().includes(input.toLowerCase())}
        >
          {projectMaterials.filter(m => m.isSaleable).map(m => (
            <Select.Option key={m.id} value={m.id}>{m.name}</Select.Option>
          ))}
        </Select>
      )
    },
    { title: '规格', dataIndex: 'spec', width: 150 },
    {
      title: '数量',
      dataIndex: 'quantity',
      width: 100,
      render: (val, record) => (
        <InputNumber
          min={1}
          precision={0}
          value={val}
          onChange={(v) => updateItem(record.id, 'quantity', v)}
        />
      )
    },
    {
      title: '标准单价',
      dataIndex: 'standardPrice',
      width: 120,
      render: (val) => formatCurrency(val)
    },
    {
      title: '总单价',
      dataIndex: 'unitPrice',
      width: 120,
      render: (val, record) => (
        <InputNumber
          min={0}
          precision={2}
          value={val}
          onChange={(v) => updateItem(record.id, 'unitPrice', v)}
        />
      )
    },
    {
      title: '金额',
      dataIndex: 'amount',
      width: 120,
      render: (val) => formatCurrency(val)
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 150,
      render: (val, record) => (
        <Input
          placeholder="备注"
          value={val}
          onChange={(e) => updateItem(record.id, 'remark', e.target.value)}
        />
      )
    },
    {
      title: '操作',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => setItems(items.filter(i => i.id !== record.id))}
        />
      )
    }
  ];

  return (
    <Modal
      title={mode === 'add' ? '新建报价单' : '编辑报价单'}
      open={open}
      onCancel={onCancel}
      width={900}
      centered
      forceRender
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleSubmit(false)}>保存</Button>,
        <Button key="audit" type="primary" onClick={() => handleSubmit(true)}>保存并提交</Button>
      ]}
      style={{ top: 20 }}
    >
      <Form form={form} layout="vertical">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-x-8">
            <Form.Item label="报价单号" name="quotationNo">
              <Text strong className="block pt-1">{form.getFieldValue('quotationNo')}</Text>
            </Form.Item>
            <Form.Item label="客户" required>
              <Input 
                placeholder="点击选择客户" 
                readOnly 
                value={selectedCustomer ? `${selectedCustomer.code} / ${selectedCustomer.name}` : ''}
                onClick={() => setCustomerModalOpen(true)}
                suffix={<UserOutlined className="text-gray-400" />}
                className="cursor-pointer"
              />
            </Form.Item>
            <Form.Item label="报价日期" name="date" rules={[{ required: true, message: '请选择日期' }]}>
              <DatePicker className="w-full" />
            </Form.Item>
            <Form.Item label="业务员" name="salesperson" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="管理员">管理员</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label="标题" name="title" rules={[{ max: 50 }]}>
              <Input placeholder="报价单标题，最大50字符" />
            </Form.Item>
            <Form.Item label="是否收定金" name="isDeposit" valuePropName="checked">
              <Switch checkedChildren="收定金" unCheckedChildren="不收" />
            </Form.Item>
            {isDeposit && (
              <Form.Item label="定金比例" name="depositRate" rules={[{ required: true }]}>
                <InputNumber min={0} max={100} addonAfter="%" className="w-full" />
              </Form.Item>
            )}
          </div>

          <Form.Item label="收款信息" name="paymentInfo" rules={[{ max: 200 }]} className="mb-0">
            <TextArea placeholder="收款方式、账号等信息" rows={2} />
          </Form.Item>

          <Form.Item label="备注" name="remark" rules={[{ max: 250 }]} className="mb-0">
            <TextArea placeholder="其他备注信息" rows={2} />
          </Form.Item>
        </div>

        <Divider titlePlacement="left" plain>产品明细</Divider>
        
        <Space className="mb-2">
          <Button type="primary" size="small" icon={<PlusOutlined />} onClick={handleAddItem}>添加产品</Button>
          <Button 
            size="small" 
            danger 
            disabled={selectedRowKeys.length === 0} 
            icon={<DeleteOutlined />} 
            onClick={handleRemoveItems}
          >
            批量删除
          </Button>
        </Space>

        <Table 
          columns={columns} 
          dataSource={items} 
          pagination={false} 
          size="small" 
          scroll={{ x: 'max-content' }} 
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          rowKey={(record) => record?.id || record?.key || record?.code || record?.orderNo}
        />

        <div className="mt-6 flex justify-end">
          <div className="bg-gray-50 p-4 rounded w-80">
            <div className="flex justify-between mb-2">
              <Text type="secondary">产品总额</Text>
              <Text>{formatCurrency(totals.productTotal)}</Text>
            </div>
            <div className="flex justify-between mb-2">
              <Text type="secondary">客户分类折扣率</Text>
              <Text>{totals.discountRate}%</Text>
            </div>
            <div className="flex justify-between mb-2">
              <Text type="secondary">优惠总金额</Text>
              <Text type="danger">-{formatCurrency(totals.discountAmount)}</Text>
            </div>
            <div className="flex justify-between mb-2">
              <Text type="secondary">折后产品总额</Text>
              <Text>{formatCurrency(totals.discountedTotal)}</Text>
            </div>
            <div className="flex items-center justify-between mb-2">
              <Text type="secondary">其他费用</Text>
              <Form.Item name="otherFee" noStyle>
                <InputNumber size="small" precision={2} className="w-24" />
              </Form.Item>
            </div>
            {isDeposit && (
              <div className="flex justify-between mb-2">
                <Text type="secondary">定金应收</Text>
                <Text>{formatCurrency(totals.depositRequired)}</Text>
              </div>
            )}
            <Divider className="my-2" />
            <div className="flex justify-between items-center">
              <Title level={5} className="!mb-0">报价总额</Title>
              <Title level={4} type="primary" className="!mb-0 !text-blue-600">
                {formatCurrency(totals.finalAmount)}
              </Title>
            </div>
          </div>
        </div>
      </Form>

      <CustomerSelectModal 
        open={customerModalOpen}
        onCancel={() => setCustomerModalOpen(false)}
        onConfirm={(cust) => {
          setSelectedCustomer(cust);
          setCustomerModalOpen(false);
          message.success(`已选择客户：${cust.name}，适用折扣：${cust.discountRate}%`);
        }}
      />
    </Modal>
  );
};

export default QuotationFormModal;
