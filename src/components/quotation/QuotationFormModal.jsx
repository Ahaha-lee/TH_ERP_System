
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, Form, Row, Col, Input, DatePicker, Select, Switch, 
  InputNumber, Table, Button, Space, Typography, message, Divider 
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, getDiscountRate } from '../../mock/data';
import CustomerSelectModal from './CustomerSelectModal';
import EstimationSelectModal from './EstimationSelectModal';
import PropertySelectModal from './PropertySelectModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

const QuotationFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [products] = useMockData('products');
  const [employees] = useMockData('employees');
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [estimationModalOpen, setEstimationModalOpen] = useState(false);
  const [propertyModalOpen, setPropertyModalOpen] = useState(false);
  const [currentEditingItem, setCurrentEditingItem] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [items, setItems] = useState([]);
  const [otherFees, setOtherFees] = useState(0);
  const [depositRate, setDepositRate] = useState(30);
  const [useDeposit, setUseDeposit] = useState(false);

  // Filter salable products
  const salableProducts = useMemo(() => products.filter(p => p.isSalable), [products]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          quotationDate: dayjs(editingRecord.quotationDate),
          depositRate: (editingRecord.depositRate || 0.3) * 100,
          isDeposit: !!editingRecord.isDeposit
        });
        setSelectedCustomer({
            id: editingRecord.customerId,
            code: editingRecord.customerCode,
            name: editingRecord.customerName,
            type: editingRecord.customerType || '经销商',
            discountRate: editingRecord.discountRate || 0
        });
        setItems(editingRecord.items || []);
        setOtherFees(editingRecord.otherFees || 0);
        setUseDeposit(!!editingRecord.isDeposit);
        setDepositRate((editingRecord.depositRate || 0.3) * 100);
      } else {
        const nextNo = `BJ-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        form.setFieldsValue({
          quotationNo: nextNo,
          quotationDate: dayjs(),
          salesperson: '当前用户',
          depositRate: 30,
          isDeposit: false
        });
        setSelectedCustomer(null);
        setItems([]);
        setOtherFees(0);
        setUseDeposit(false);
        setDepositRate(30);
      }
    }
  }, [open, editingRecord, form]);

  // Calculations
  const calculations = useMemo(() => {
    const discountRate = selectedCustomer ? getDiscountRate(selectedCustomer.type) : 0;
    const productTotal = items.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    const discountedTotal = items.reduce((acc, curr) => {
        const finalPrice = curr.unitPrice * (1 - discountRate);
        return acc + (finalPrice * curr.quantity);
    }, 0);
    const totalAmount = discountedTotal + otherFees;
    const depositAmount = useDeposit ? discountedTotal * (depositRate / 100) : 0;

    return {
        productTotal,
        discountRate,
        discountedTotal,
        saving: productTotal - discountedTotal,
        totalAmount,
        depositAmount
    };
  }, [items, selectedCustomer, otherFees, useDeposit, depositRate]);

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      productCode: '',
      productName: '',
      spec: '',
      quantity: 1,
      standardPrice: 0,
      marketPrice: 0,
      floorPrice: 0,
      unitPrice: 0,
      finalPrice: 0,
      amount: 0,
      remark: ''
    };
    setItems([...items, newItem]);
  };

  const handleRemoveItem = (id) => {
    setItems(items.filter(i => i.id !== id));
  };

  const handleItemChange = (id, field, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        
        if (field === 'productCode' || field === 'productName') {
          const product = salableProducts.find(p => p.productCode === value || p.productName === value);
          if (product) {
            updated = {
              ...updated,
              productCode: product.productCode,
              productName: product.productName,
              spec: product.spec,
              standardPrice: product.standardPrice,
              marketPrice: product.marketPrice,
              floorPrice: product.floorPrice,
              unitPrice: product.standardPrice,
            };
          }
        }
        
        // Final Price and Amount depend on customer discount (calculated in useMemo for display, but stored here for record)
        const discountRate = selectedCustomer ? getDiscountRate(selectedCustomer.type) : 0;
        updated.finalPrice = updated.unitPrice * (1 - discountRate);
        updated.amount = updated.finalPrice * updated.quantity;
        
        return updated;
      }
      return item;
    });
    setItems(newItems);
  };

  const handleSaveDraft = (isSubmit = false) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.warning('请至少添加一个产品');
        return;
      }
      
      const invalidItem = items.find(i => i.unitPrice < i.floorPrice);
      if (invalidItem) {
        message.error(`产品 [${invalidItem.productName}] 的总单价不能低于底价 ¥${invalidItem.floorPrice}`);
        return;
      }

      const quotationData = {
        ...values,
        id: editingRecord?.id,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        customerCode: selectedCustomer.code,
        customerType: selectedCustomer.type,
        discountRate: calculations.discountRate,
        items,
        totalAmount: calculations.totalAmount,
        otherFees,
        depositAmount: calculations.depositAmount,
        isDeposit: values.isDeposit,
        depositRate: values.isDeposit ? (values.depositRate / 100) : 0,
        status: isSubmit ? '待审批' : '草稿',
        quotationDate: values.quotationDate.format('YYYY-MM-DD')
      };
      
      onSave(quotationData);
      onCancel();
    });
  };

  const itemColumns = [
    { title: '序号', width: 50, render: (_, __, i) => i + 1 },
    {
      title: '产品编码',
      width: 150,
      render: (_, record) => (
        <Select
          showSearch
          placeholder="搜索编码"
          style={{ width: '100%' }}
          value={record.productCode}
          onChange={(val) => handleItemChange(record.id, 'productCode', val)}
          options={salableProducts.map(p => ({ value: p.productCode, label: p.productCode }))}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      )
    },
    {
      title: '产品名称',
      width: 180,
      render: (_, record) => (
        <Select
          showSearch
          placeholder="搜索名称"
          style={{ width: '100%' }}
          value={record.productCode}
          onChange={(val) => handleItemChange(record.id, 'productCode', val)}
          options={salableProducts.map(p => ({ value: p.productCode, label: p.productName }))}
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
        />
      )
    },
    { title: '规格', dataIndex: 'spec', width: 120, ellipsis: true },
    {
      title: '属性',
      width: 100,
      render: (_, record) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => {
            setCurrentEditingItem(record);
            setPropertyModalOpen(true);
          }}
        >
          {record.property ? record.property : '选择属性'}
        </Button>
      )
    },
    {
      title: '数量',
      width: 100,
      render: (_, record) => (
        <InputNumber 
          min={1} 
          value={record.quantity} 
          onChange={(val) => handleItemChange(record.id, 'quantity', val)} 
        />
      )
    },
    { title: '标准单价', width: 100, dataIndex: 'standardPrice', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '底价', width: 100, dataIndex: 'floorPrice', render: (v) => `¥${(v || 0).toFixed(2)}` },
    {
      title: '报价单价',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0}
          status={record.unitPrice < record.floorPrice ? 'error' : ''}
          value={record.unitPrice}
          style={{ width: '100%' }}
          onChange={(val) => handleItemChange(record.id, 'unitPrice', val)}
          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\¥\s?|(,*)/g, '')}
        />
      )
    },
    { 
      title: '折后单价', 
      width: 100, 
      render: (_, record) => `¥${((record.unitPrice || 0) * (1 - calculations.discountRate)).toFixed(2)}` 
    },
    { 
      title: '金额', 
      width: 120, 
      render: (_, record) => `¥${((record.unitPrice || 0) * (1 - calculations.discountRate) * (record.quantity || 0)).toFixed(2)}` 
    },
    {
      title: '备注',
      width: 150,
      render: (_, record) => (
        <Input 
          placeholder="备注" 
          value={record.remark} 
          onChange={(e) => handleItemChange(record.id, 'remark', e.target.value)} 
        />
      )
    },
    {
      title: '操作',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => handleRemoveItem(record.id)} />
      )
    }
  ];

  return (
    <Modal forceRender
      title={editingRecord ? `编辑报价单 - ${editingRecord.quotationNo}` : '新建报价单'}
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="draft" onClick={() => handleSaveDraft(false)}>保存草稿</Button>,
        <Button key="submit" type="primary" onClick={() => handleSaveDraft(true)}>保存并提交</Button>
      ]}
      
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="quotationNo" label="报价单号">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="客户" required>
              <Space.Compact style={{ width: '100%' }}>
                <Input 
                  placeholder="请选择客户" 
                  value={selectedCustomer ? `${selectedCustomer.code} - ${selectedCustomer.name}` : ''} 
                  disabled 
                />
                <Button type="primary" icon={<UserOutlined />} onClick={() => setCustomerModalOpen(true)}>选择</Button>
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="quotationDate" label="报价日期" rules={[{ required: true }]}>
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
              <Select>
                {employees.map(e => <Select.Option key={e.name} value={e.name}>{e.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="sourceEstimationNo" label="来源预估单号">
              <Input 
                placeholder="点击选择来源预估单" 
                readOnly 
                onClick={() => setEstimationModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="title" label="报价标题">
              <Input placeholder="输入标题，如：XX项目办公家具配套报价" maxLength={50} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="paymentInfo" label="收款信息">
              <TextArea rows={2} placeholder="若有特殊付款约定请在此说明" maxLength={200} />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="isDeposit" label="收订金" valuePropName="checked">
              <Switch onChange={setUseDeposit} />
            </Form.Item>
          </Col>
          {useDeposit && (
            <Col span={6}>
              <Form.Item name="depositRate" label="订金比例(%)">
                <InputNumber min={0} max={100} style={{ width: '100%' }} onChange={setDepositRate} />
              </Form.Item>
            </Col>
          )}
          <Col span={24}>
            <Form.Item name="remark" label="备注">
              <TextArea rows={2} placeholder="内部说明" maxLength={250} />
            </Form.Item>
          </Col>
        </Row>

        <Divider titlePlacement="left">产品明细</Divider>
        <Space style={{ marginBottom: 8 }}>
            <Button icon={<PlusOutlined />} onClick={handleAddItem}>添加产品</Button>
            <Text type="secondary">（最终价格 = 报价单价 × (1 - 客户折扣率)）</Text>
        </Space>
        
        <Table
          dataSource={items}
          columns={itemColumns}
          rowKey="id"
          size="small"
          scroll={{ x: 1200 }}
          pagination={false}
        />

        <Divider />
        
        <Row justify="end">
          <Col span={10}>
            <div style={{ textAlign: 'right' }}>
              <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                <Row><Col span={14}>产品总额:</Col><Col span={10}>¥{(calculations.productTotal || 0).toFixed(2)}</Col></Row>
                <Row><Col span={14}>客户类型折扣 ({selectedCustomer?.type || '-'}):</Col><Col span={10}>{(calculations.discountRate * 100).toFixed(0)}%</Col></Row>
                <Row><Col span={14}>优惠金额:</Col><Col span={10}>- ¥{(calculations.saving || 0).toFixed(2)}</Col></Row>
                <Row>
                    <Col span={14}>其他费用:</Col>
                    <Col span={10}>
                        <InputNumber 
                            size="small" 
                            min={0} 
                            value={otherFees} 
                            onChange={setOtherFees}
                            style={{ width: 100 }} 
                        />
                    </Col>
                </Row>
                <Row style={{ marginTop: 8 }}>
                    <Col span={14}><Title level={4}>报价总额:</Title></Col>
                    <Col span={10}><Title level={4} style={{ color: '#ff4d4f' }}>¥{(calculations.totalAmount || 0).toFixed(2)}</Title></Col>
                </Row>
                {useDeposit && (
                    <Row><Col span={14}><Text type="secondary">订金预收 ({(depositRate).toFixed(0)}%):</Text></Col><Col span={10}><Text type="secondary">¥{(calculations.depositAmount || 0).toFixed(2)}</Text></Col></Row>
                )}
              </Space>
            </div>
          </Col>
        </Row>
      </Form>

      <CustomerSelectModal 
        open={customerModalOpen} 
        onCancel={() => setCustomerModalOpen(false)} 
        onConfirm={setSelectedCustomer} 
      />
      <EstimationSelectModal
        open={estimationModalOpen}
        onCancel={() => setEstimationModalOpen(false)}
        onSelect={(record) => {
           form.setFieldsValue({ sourceEstimationNo: record.orderNo });
        }}
      />
      <PropertySelectModal
        open={propertyModalOpen}
        onCancel={() => {
          setPropertyModalOpen(false);
          setCurrentEditingItem(null);
        }}
        productCode={currentEditingItem?.productCode}
        onConfirm={(property) => {
          handleItemChange(currentEditingItem.id, 'property', property);
        }}
      />
    </Modal>
  );
};

export default QuotationFormModal;
