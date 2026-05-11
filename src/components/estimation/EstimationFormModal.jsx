import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Select, InputNumber, DatePicker, Input, Descriptions, Typography, Divider, Space, Card, Tag, Alert, Button, Table } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData } from '../../mock/data';
import CustomerSelectModal from '../quotation/CustomerSelectModal';
import SizePricingDisplay from './SizePricingDisplay';
import { formatCurrency } from '../../utils/helpers';

const { TextArea } = Input;
const { Text, Title } = Typography;

const DimensionTable = ({ title, dimName, custom, config, dimSurcharge }) => {
  if (!config || !config.enabled) {
    return (
      <Card size="small" title={title} className="bg-gray-50 border-dashed">
        <div className="text-center py-4 text-gray-400">该维度未启用阶梯计价</div>
      </Card>
    );
  }

  const excess = Math.max(custom - config.base, 0);
  
  const columns = [
    { 
      title: '定制尺寸', 
      dataIndex: 'custom', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center'
    },
    { 
      title: '基准尺寸', 
      dataIndex: 'base', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center'
    },
    { 
      title: '超出基准', 
      dataIndex: 'excess', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center',
      render: (val) => <Text type={val > 0 ? "danger" : "secondary"}>{val}mm</Text>
    },
    { 
      title: '阶梯区间', 
      dataIndex: 'range',
      render: (val, record) => (
        <span className={record.matched ? "font-bold text-blue-600" : ""}>{val}</span>
      )
    },
    { 
      title: '加价金额', 
      dataIndex: 'price',
      render: (val, record) => (
        <span className={record.matched ? "font-bold text-blue-600" : ""}>¥{val}</span>
      )
    },
    { 
      title: '维度加价', 
      dataIndex: 'dimSurcharge', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center',
      render: (val) => <Text strong className="text-lg">¥{val}</Text>
    },
  ];

  const dataSource = config.steps.map((step, idx) => {
    const isMatched = excess >= step.start && excess < step.end;
    return {
      key: idx,
      custom: `${custom}mm`,
      base: `${config.base}mm`,
      excess,
      range: `${step.start}-${step.end === 999999 ? '∞' : step.end}mm: ${step.price}元`,
      price: step.price,
      matched: isMatched,
      dimSurcharge
    };
  });

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <Text strong className="text-gray-600">{title}</Text>
      </div>
      <Table 
        size="small" 
        pagination={false} 
        bordered 
        columns={columns} 
        dataSource={dataSource} 
        rowKey="key"
      />
    </div>
  );
};

const EstimationFormModal = ({ open, initialValues, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [customers] = useMockData('customers');
  const [products] = useMockData('products');
  const [employees] = useMockData('employees');
  const [sizeRules] = useMockData('sizeRules');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customSize, setCustomSize] = useState({ length: 0, width: 0, height: 0 });
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const saleableProducts = useMemo(() => 
    products.filter(p => sizeRules.some(r => r.productCode === p.code && r.isActive)),
    [products, sizeRules]
  );
  
  const activeEmployees = employees.filter(e => e.status === '在职');

  useEffect(() => {
    if (initialValues && open) {
      const product = products.find(p => p.id === initialValues.productId || p.name === initialValues.productName);
      setSelectedProduct(product);
      
      if (initialValues.customSize) {
        setCustomSize(initialValues.customSize);
      } else if (product) {
        const rule = sizeRules.find(r => r.productCode === product.code && r.isActive);
        if (rule) {
          setCustomSize(rule.baseSize);
        }
      }
      
      const customer = customers.find(c => c.id === initialValues.customerId);
      if (customer) {
        setSelectedCustomer(customer);
      }
      
      form.setFieldsValue({
        ...initialValues,
        customLength: initialValues.customSize?.length,
        customWidth: initialValues.customSize?.width,
        customHeight: initialValues.customSize?.height,
      });
    } else if (open) {
      setSelectedProduct(null);
      setSelectedCustomer(null);
      setCustomSize({ length: 0, width: 0, height: 0 });
      form.resetFields();
      form.setFieldsValue({
        orderNo: `YJ${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 9000 + 1000)}`
      });
    }
  }, [initialValues, open, products, customers, sizeRules, form]);

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    form.setFieldsValue({ customerId: customer.id });
    setCustomerModalOpen(false);
  };

  const productRule = useMemo(() => {
    if (!selectedProduct) return null;
    return sizeRules.find(r => r.productCode === selectedProduct.code && r.isActive);
  }, [selectedProduct, sizeRules]);

  // Calculations
  const calculations = useMemo(() => {
    if (!selectedProduct) return { standardPrice: 0, lSurcharge: 0, wSurcharge: 0, hSurcharge: 0, totalSurcharge: 0, subtotal: 0, coefficient: 1.2, total: 0 };
    
    const standardPrice = selectedProduct.price || 0;
    let lSurcharge = 0, wSurcharge = 0, hSurcharge = 0;

    if (productRule) {
      const calc = (val, config) => {
        if (!config.enabled) return 0;
        const diff = Math.max(val - config.base, 0);
        const step = config.steps.find(s => diff >= s.start && diff < s.end);
        return step ? step.price : 0;
      };
      lSurcharge = calc(customSize.length, productRule.lengthStep);
      wSurcharge = calc(customSize.width, productRule.widthStep);
      hSurcharge = calc(customSize.height, productRule.heightStep);
    }
    
    const totalSurcharge = lSurcharge + wSurcharge + hSurcharge;
    const subtotal = standardPrice + totalSurcharge;
    const coefficient = productRule?.coefficient || 1.2;
    const total = subtotal * coefficient;

    return { standardPrice, lSurcharge, wSurcharge, hSurcharge, totalSurcharge, subtotal, coefficient, total };
  }, [selectedProduct, customSize, productRule]);

  const handleProductChange = (productId) => {
    const p = products.find(p => p.id === productId);
    setSelectedProduct(p);
    const rule = sizeRules.find(r => r.productCode === p.code && r.isActive);
    if (rule) {
      const newSize = { ...rule.baseSize };
      setCustomSize(newSize);
      form.setFieldsValue({
        customLength: newSize.length,
        customWidth: newSize.width,
        customHeight: newSize.height
      });
    }
  };

  const handleSave = () => {
    form.validateFields().then(values => {
      const data = {
        ...values,
        id: initialValues?.id,
        orderNo: initialValues?.orderNo || `YJ${dayjs().format('YYYYMMDD')}001`,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        customSize,
        status: '草稿',
        priceDetails: calculations,
        estimationDate: dayjs().format('YYYY-MM-DD')
      };
      onSave(data);
    });
  };

  const handleConvertToQuotation = () => {
    Modal.confirm({
      title: '转入报价单',
      content: '确定要将当前预估单转为正式报价单吗？',
      onOk: () => {
        // Mock logic
        onSave({ ...initialValues, status: '已转报价' });
      }
    });
  };

  return (
    <Modal forceRender
      title={initialValues ? `编辑报价预估 - ${initialValues.orderNo}` : '新增报价预估'}
      open={open}
      onCancel={onCancel}
      width={1000}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" type="primary" onClick={handleSave}>保存</Button>,
        initialValues?.status === '草稿' && (
          <Button key="convert" type="primary" danger onClick={handleConvertToQuotation}>
            转报价单
          </Button>
        )
      ]}
    >
      <Form
        form={form}
        layout="vertical"
        onValuesChange={(changed) => {
          if ('customLength' in changed) setCustomSize(s => ({ ...s, length: changed.customLength }));
          if ('customWidth' in changed) setCustomSize(s => ({ ...s, width: changed.customWidth }));
          if ('customHeight' in changed) setCustomSize(s => ({ ...s, height: changed.customHeight }));
        }}
      >
        <div className="grid grid-cols-4 gap-x-6 gap-y-2 mb-4">
          <Form.Item name="orderNo" label="报价预估单号">
            <Input disabled placeholder="系统自动生成" />
          </Form.Item>
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Space.Compact style={{ width: '100%' }}>
              <Input 
                placeholder="点击选择客户" 
                value={selectedCustomer ? `${selectedCustomer.code} - ${selectedCustomer.name}` : ''} 
                readOnly
                onClick={() => setCustomerModalOpen(true)}
                style={{ cursor: 'pointer' }}
              />
              <Button type="primary" icon={<UserOutlined />} onClick={() => setCustomerModalOpen(true)}>选择</Button>
            </Space.Compact>
          </Form.Item>
          <Form.Item name="productId" label="产品" rules={[{ required: true }]}>
            <Select 
              showSearch 
              placeholder="选择产品" 
              options={saleableProducts.map(p => ({ label: `${p.code} - ${p.name}`, value: p.id }))} 
              onChange={handleProductChange}
            />
          </Form.Item>
          <Form.Item name="salesman" label="业务员" rules={[{ required: true }]} initialValue="管理员">
            <Select options={activeEmployees.map(e => ({ label: e.name, value: e.name }))} />
          </Form.Item>
        </div>

        {selectedProduct && (
          <Card size="small" title="产品基本信息 (只读)" className="mb-4 bg-gray-50">
            <Descriptions size="small" column={5}>
              <Descriptions.Item label="产品编码">{selectedProduct.code}</Descriptions.Item>
              <Descriptions.Item label="产品名称">{selectedProduct.name}</Descriptions.Item>
              <Descriptions.Item label="规格型号">{selectedProduct.spec}</Descriptions.Item>
              <Descriptions.Item label="单位">{selectedProduct.unit}</Descriptions.Item>
              <Descriptions.Item label="标准价格">
                <Text strong>{formatCurrency(selectedProduct.price)}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        {selectedProduct && (
          <Card size="small" title="尺寸定制" className="mb-4">
            <div className="flex items-center gap-8 mb-4">
              <div>
                <Text type="secondary">基准尺寸：</Text>
                <Text strong>{`${productRule?.baseSize.length}×${productRule?.baseSize.width}×${productRule?.baseSize.height}mm`}</Text>
              </div>
              <div className="flex-1 grid grid-cols-3 gap-4">
                <Form.Item name="customLength" label="定制长度 (mm)" className="!mb-0" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="customWidth" label="定制宽度 (mm)" className="!mb-0" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="customHeight" label="定制高度 (mm)" className="!mb-0" rules={[{ required: true }]}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </div>
            </div>
          </Card>
        )}

        {productRule && (
          <div className="p-4 bg-white rounded border mb-4">
             <Text strong className="text-lg block mb-4">各维度加价明细表（阶梯式展示）</Text>
             <DimensionTable title="长度维度" custom={customSize.length} config={productRule.lengthStep} dimSurcharge={calculations.lSurcharge} />
             <DimensionTable title="宽度维度" custom={customSize.width} config={productRule.widthStep} dimSurcharge={calculations.wSurcharge} />
             <DimensionTable title="高度维度" custom={customSize.height} config={productRule.heightStep} dimSurcharge={calculations.hSurcharge} />
          </div>
        )}

        {selectedProduct && (
          <Card className="bg-gray-50 mb-4 border-2 border-gray-200">
             <div className="grid grid-cols-4 gap-4 items-center">
                <div className="col-span-3 grid grid-cols-4 gap-4 text-center">
                   <div>
                      <div className="text-gray-400 text-xs mb-1">标准价格</div>
                      <div className="font-medium">{formatCurrency(calculations.standardPrice)}</div>
                   </div>
                   <div>
                      <div className="text-gray-400 text-xs mb-1">尺寸加价总额</div>
                      <div className="text-orange-600 font-medium">+ {formatCurrency(calculations.totalSurcharge)}</div>
                   </div>
                   <div>
                      <div className="text-gray-400 text-xs mb-1">小计</div>
                      <div className="font-medium">{formatCurrency(calculations.subtotal)}</div>
                   </div>
                   <div>
                      <div className="text-gray-400 text-xs mb-1">系数</div>
                      <div>{calculations.coefficient.toFixed(1)}</div>
                   </div>
                </div>
                <div className="text-right border-l pl-4">
                   <div className="text-gray-400 text-xs mb-1">预估总额</div>
                   <div className="text-3xl font-bold text-red-600">
                      {formatCurrency(calculations.total)}
                   </div>
                </div>
             </div>
          </Card>
        )}

        <Form.Item name="remark" label="备注">
          <TextArea rows={2} maxLength={250} placeholder="请输入预估方案说明" />
        </Form.Item>
      </Form>

      <CustomerSelectModal 
        open={customerModalOpen}
        onCancel={() => setCustomerModalOpen(false)}
        onConfirm={handleCustomerSelect}
      />
    </Modal>
  );
};

export default EstimationFormModal;
