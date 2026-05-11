
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, 
  Form, 
  Row, 
  Col, 
  Input, 
  DatePicker, 
  Select, 
  InputNumber, 
  Table, 
  Button, 
  Space, 
  Typography, 
  Divider, 
  message,
  Checkbox,
  Tag,
  Switch
} from 'antd';
import { 
  PlusOutlined, 
  DeleteOutlined, 
  UserOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { products, employees, customers } from '../../mock/masterData';
import CustomerSelectModal from '../quotation/CustomerSelectModal';
import QuotationSelectModal from './QuotationSelectModal';
import PropertySelectModal from '../quotation/PropertySelectModal';

const { TextArea } = Input;
const { Text, Title, Link } = Typography;

const NormalOrderFormModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [customerModalOpen, setCustomerModalOpen] = useState(false);
    const [quotationModalOpen, setQuotationModalOpen] = useState(false);
    const [propertyModalOpen, setPropertyModalOpen] = useState({ open: false, index: null, isGift: false });
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [items, setItems] = useState([]);
    const [giftItems, setGiftItems] = useState([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const salableProducts = useMemo(() => products.filter(p => p.category === '成品' || p.category === '原料'), []);

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({
                    ...record,
                    orderDate: dayjs(record.orderDate),
                    expectDeliveryDate: record.expectDeliveryDate ? dayjs(record.expectDeliveryDate) : null,
                });
                const customer = customers.find(c => c.id === record.customerId || c.name === record.customerName);
                if (customer) setSelectedCustomer(customer);
                setItems(record.items?.map(item => ({ ...item, id: item.id || Math.random().toString(36).substr(2, 9) })) || []);
                setGiftItems(record.giftItems?.map(item => ({ ...item, id: item.id || Math.random().toString(36).substr(2, 9) })) || []);
            } else { 
                const tempNo = 'ORD-' + Date.now().toString().substr(-6);
                form.setFieldsValue({
                    orderNo: tempNo,
                    orderDate: dayjs(),
                    isCollectDeposit: true,
                    depositRatio: 30,
                    salesperson: '管理员',
                    subsidiary: '总部',
                    includeInStockingPlan: true
                });
                setSelectedCustomer(null);
                setItems([]);
                setGiftItems([]);
            }
        }
    }, [open, record, form]);

    const handleCustomerConfirm = (customer) => {
        setSelectedCustomer(customer);
        form.setFieldsValue({
            customerName: customer.name,
            customerType: customer.type,
            settlementMethod: customer.settlementMethod,
            monthlyCycle: customer.settlementMethod === '月结' ? '30天' : undefined,
            prepaidBalance: customer.prepaidBalance || 0
        });
        setCustomerModalOpen(false);
    };

    const handleQuotationConfirm = (quotation) => {
        form.setFieldsValue({
            quotationNo: quotation.quotationNo,
            customerName: quotation.customerName,
        });
        const customer = customers.find(c => c.id === quotation.customerId || c.name === quotation.customerName);
        if (customer) {
            handleCustomerConfirm(customer);
        }
        
        if (quotation.items && quotation.items.length > 0) {
            setItems(quotation.items.map(item => ({
                ...item,
                id: Math.random().toString(36).substr(2, 9),
                totalUnitPrice: item.unitPrice || item.finalPrice,
                finalPrice: item.finalPrice,
                amount: item.amount
            })));
        }
        setQuotationModalOpen(false);
    };

    const addItem = (isGift = false) => {
        const newItem = {
            id: Math.random().toString(36).substr(2, 9),
            productCode: undefined,
            productName: undefined,
            spec: '',
            property: '',
            quantity: 1,
            unit: '',
            standardPrice: 0,
            marketPrice: 0,
            floorPrice: 0,
            totalUnitPrice: 0,
            discountRate: 5,
            finalPrice: 0,
            amount: 0,
            remark: ''
        };
        if (isGift) setGiftItems([...giftItems, newItem]);
        else setItems([...items, newItem]);
    };

    const handleProductChange = (val, index, isGift = false) => {
        const product = products.find(p => p.id === val || p.code === val || p.name === val);
        if (!product) return;

        const updateList = isGift ? [...giftItems] : [...items];
        const discountRate = 5; // Default mock discount
        
        updateList[index] = {
            ...updateList[index],
            productCode: product.code,
            productName: product.name,
            spec: product.spec,
            unit: product.unit,
            standardPrice: product.price,
            marketPrice: product.price * 1.2,
            floorPrice: product.cost || product.price * 0.8,
            totalUnitPrice: product.price,
            discountRate: discountRate,
            finalPrice: product.price * (1 - discountRate / 100),
            amount: updateList[index].quantity * (product.price * (1 - discountRate / 100))
        };

        if (isGift) setGiftItems(updateList);
        else setItems(updateList);
    };

    const handleFieldChange = (field, val, index, isGift = false) => {
        const updateList = isGift ? [...giftItems] : [...items];
        const item = updateList[index];

        if (field === 'totalUnitPrice') {
            if (val < item.floorPrice) {
                message.warning(`总单价不能低于底价 ¥${item.floorPrice.toFixed(2)}`);
                updateList[index][field] = item.floorPrice;
            } else {
                updateList[index][field] = val;
            }
        } else {
            updateList[index][field] = val;
        }

        // Recalculate derivative fields
        if (!isGift) {
            const discountRate = updateList[index].discountRate || 5;
            updateList[index].finalPrice = updateList[index].totalUnitPrice * (1 - discountRate / 100);
            updateList[index].amount = updateList[index].quantity * updateList[index].finalPrice;
        }

        if (isGift) setGiftItems(updateList);
        else setItems(updateList);
    };

    const handlePropertyConfirm = (property) => {
        const { index, isGift } = propertyModalOpen;
        const updateList = isGift ? [...giftItems] : [...items];
        updateList[index] = {
            ...updateList[index],
            property
        };
        if (isGift) setGiftItems(updateList);
        else setItems(updateList);
        setPropertyModalOpen({ open: false, index: null, isGift: false });
    };

    const otherFee = Form.useWatch('otherFee', form) || 0;
    const isCollectDeposit = Form.useWatch('isCollectDeposit', form);
    const depositRatio = Form.useWatch('depositRatio', form) || 0;

    const totalSummaries = useMemo(() => {
        const productTotal = items.reduce((sum, item) => sum + (item.totalUnitPrice * item.quantity), 0);
        const discountRate = 5.0;
        const discountedProductTotal = productTotal * (1 - discountRate / 100);
        const totalSaving = productTotal - discountedProductTotal;
        const orderTotal = discountedProductTotal + otherFee;
        const depositReceivable = isCollectDeposit ? discountedProductTotal * (depositRatio / 100) : 0;

        return {
            productTotal,
            discountRate,
            discountedProductTotal,
            totalSaving,
            depositReceivable,
            orderTotal
        };
    }, [items, otherFee, isCollectDeposit, depositRatio]);

    const productColumns = [
        { title: '勾选', width: 40, render: (_, record) => <Checkbox checked={selectedRowKeys.includes(record.id)} onChange={(e) => {
            if (e.target.checked) setSelectedRowKeys([...selectedRowKeys, record.id]);
            else setSelectedRowKeys(selectedRowKeys.filter(k => k !== record.id));
        }} />, fixed: 'left' },
        { title: '序号', width: 50, render: (_, __, i) => i + 1, fixed: 'left' },
        { 
            title: '产品编码', 
            dataIndex: 'productCode', 
            width: 160,
            render: (val, _, index) => (
                <Select 
                    showSearch 
                    placeholder="选择产品" 
                    style={{ width: '100% '}} 
                    value={val}
                    onChange={(v) => handleProductChange(v, index)}
                    options={salableProducts.map(p => ({ label: p.code, value: p.code }))}
                />
            )
        },
        { 
            title: '产品名称', 
            dataIndex: 'productName', 
            width: 160,
            render: (val, _, index) => (
                <Select 
                    showSearch 
                    placeholder="选择产品" 
                    style={{ width: '100% '}} 
                    value={val}
                    onChange={(v) => handleProductChange(v, index)}
                    options={salableProducts.map(p => ({ label: p.name, value: p.name }))}
                />
            )
        },
        { title: '规格', dataIndex: 'spec', width: 140 },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 120,
            render: (val, record, index) => (
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setPropertyModalOpen({ open: true, index, isGift: false })}
                    disabled={!record.productCode}
                >
                    {val || '选择属性'}
                </Button>
            )
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 100,
            render: (val, _, index) => <InputNumber min={1} precision={0} value={val} onChange={(v) => handleFieldChange('quantity', v, index)} />
        },
        { title: '标准单价', dataIndex: 'standardPrice', width: 100, render: (v) => `¥${(v || 0).toFixed(2)}` },
        { title: '市场指导价', dataIndex: 'marketPrice', width: 100, render: (v) => `¥${(v || 0).toFixed(2)}` },
        { title: '底价', dataIndex: 'floorPrice', width: 100, render: (v) => `¥${(v || 0).toFixed(2)}` },
        { 
            title: '客户优惠折扣率', 
            dataIndex: 'discountRate', 
            width: 120,
            render: (val) => `${val || 5}%`
        },
        { title: '折后单价', dataIndex: 'finalPrice', width: 110, render: (v) => <Text strong>¥{(v || 0).toFixed(2)}</Text> },
        { title: '金额', dataIndex: 'amount', width: 120, render: (v) => <Text strong type="danger">¥{(v || 0).toFixed(2)}</Text> },
        { 
            title: '备注', 
            dataIndex: 'remark', 
            width: 150,
            render: (val, _, index) => <Input value={val} onChange={(e) => handleFieldChange('remark', e.target.value, index)} />
        },
        { 
            title: '操作', 
            width: 60, 
            fixed: 'right',
            render: (_, __, i) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setItems(items.filter((_, idx) => idx !== i))} />
        }
    ];

    const giftColumns = [
        { title: '勾选', width: 40, render: () => <Checkbox /> },
        { title: '序号', width: 50, render: (_, __, i) => i + 1 },
        { 
            title: '产品编码', 
            dataIndex: 'productCode', 
            width: 160,
            render: (val, _, index) => (
                <Select 
                    showSearch 
                    style={{ width: '100% '}} 
                    value={val}
                    onChange={(v) => handleProductChange(v, index, true)}
                    options={salableProducts.map(p => ({ label: p.code, value: p.code }))}
                />
            )
        },
        { 
            title: '产品名称', 
            dataIndex: 'productName', 
            width: 160,
            render: (val, _, index) => (
                <Select 
                    showSearch 
                    style={{ width: '100% '}} 
                    value={val}
                    onChange={(v) => handleProductChange(v, index, true)}
                    options={salableProducts.map(p => ({ label: p.name, value: p.name }))}
                />
            )
        },
        { title: '规格', dataIndex: 'spec', width: 140 },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 120,
            render: (val, record, index) => (
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setPropertyModalOpen({ open: true, index, isGift: true })}
                    disabled={!record.productCode}
                >
                    {val || '选择属性'}
                </Button>
            )
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 100,
            render: (val, _, index) => <InputNumber min={1} precision={0} value={val} onChange={(v) => handleFieldChange('quantity', v, index, true)} />
        },
        { 
            title: '备注', 
            dataIndex: 'remark', 
            width: 150,
            render: (val, _, index) => <Input value={val} onChange={(e) => handleFieldChange('remark', e.target.value, index, true)} />
        },
        { 
            title: '操作', 
            width: 60,
            render: (_, __, i) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setGiftItems(giftItems.filter((_, idx) => idx !== i))} />
        }
    ];

    const handleSave = (isSubmit = false) => {
        form.validateFields().then(values => {
            if (items.length === 0) {
                message.error('请至少添加一个产品明细');
                return;
            }
            const orderData = {
                ...values,
                id: record?.id,
                items,
                giftItems,
                totalAmount: totalSummaries.orderTotal,
                paidAmount: record?.paidAmount || 0,
                status: isSubmit ? '待审核' : '草稿',
                orderDate: values.orderDate.format('YYYY-MM-DD'),
                expectDeliveryDate: values.expectDeliveryDate?.format('YYYY-MM-DD'),
                auditResult: isSubmit ? '待审核' : undefined
            };

            if (isSubmit) {
                Modal.confirm({
                    title: '提交审核',
                    content: '确认保存并提交该订单进行审核吗？',
                    onOk: () => onSuccess(orderData)
                });
            } else {
                onSuccess(orderData);
            }
        });
    };

    return (
        <Modal
            title={record ? `编辑普通销售订单 - ${record.orderNo}` : '新增普通销售订单'}
            open={open}
            onCancel={onCancel}
            width={1200}
            centered
            forceRender
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="save" onClick={() => handleSave(false)}>保存</Button>,
                <Button key="submit" type="primary" onClick={() => handleSave(true)}>保存并提交</Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={12}><Form.Item name="orderNo" label="销售订单号" rules={[{ required: true }]}><Input readOnly disabled /></Form.Item></Col>
                    <Col span={12}>
                        <Form.Item name="quotationNo" label="来源报价单号">
                            <Input 
                                readOnly 
                                placeholder="点击选择报价单" 
                                suffix={<Link onClick={() => setQuotationModalOpen(true)}>选择</Link>} 
                                onClick={() => setQuotationModalOpen(true)}
                                className="cursor-pointer"
                            />
                        </Form.Item>
                    </Col>
                    
                    <Col span={12}>
                        <Form.Item label="客户" required>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input readOnly value={selectedCustomer ? `${selectedCustomer.code} / ${selectedCustomer.name}` : ''} />
                                <Button type="primary" icon={<UserOutlined />} onClick={() => setCustomerModalOpen(true)}>选择客户</Button>
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="customerType" label="客户类型"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}><Form.Item name="settlementMethod" label="结算方式"><Input readOnly disabled /></Form.Item></Col>
                    
                    {form.getFieldValue('settlementMethod') === '月结' && (
                        <Col span={6}><Form.Item name="monthlyCycle" label="月结周期"><Input readOnly disabled /></Form.Item></Col>
                    )}
                    {form.getFieldValue('settlementMethod') === '预存' && (
                        <Col span={6}><Form.Item name="prepaidBalance" label="预存余额"><InputNumber readOnly disabled prefix="¥" precision={2} style={{ width: '100%' }} /></Form.Item></Col>
                    )}
                    
                    <Col span={6}><Form.Item name="orderDate" label="订单日期" rules={[{ required: true }]}><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item 
                            name="expectDeliveryDate" 
                            label="期望发货日期" 
                            rules={[{ required: true, message: '请选择期望发货日期' }]}
                        >
                            <DatePicker style={{ width: '100% '}} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="subsidiary" label="项目 (子公司)" rules={[{ required: true }]}>
                            <Select options={[{ label: '总部', value: '总部' }, { label: '分公司A', value: '分公司A' }]} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
                            <Select showSearch options={employees.map(e => ({ label: e.name, value: e.name }))} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="isCollectDeposit" label="是否收取订金" valuePropName="checked">
                            <Switch checkedChildren="是" unCheckedChildren="否" />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="depositRatio" label="订金比例">
                            <InputNumber 
                                min={0} 
                                max={100} 
                                formatter={v => `${v}%`} 
                                parser={v => v.replace('%', '')} 
                                style={{ width: '100%' }} 
                                disabled={!isCollectDeposit}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item 
                            name="includeInStockingPlan" 
                            label="纳入备货计划" 
                            valuePropName="checked"
                            tooltip="纳入备货计划表示生产备货需求的计算会计入该笔销量"
                        >
                            <Switch checkedChildren="是" unCheckedChildren="否" />
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <Title level={5} className="!m-0">产品明细 (非赠品)</Title>
                        <Space>
                            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => addItem(false)}>添加产品</Button>
                            <Button danger size="small" icon={<DeleteOutlined />} onClick={() => setItems(items.filter(i => !selectedRowKeys.includes(i.id)))}>批量删除</Button>
                        </Space>
                    </div>
                    <Table 
                        columns={productColumns} 
                        dataSource={items} 
                        rowKey="id" 
                        size="small" 
                        pagination={false} 
                        scroll={{ x: 1800 }} 
                    />
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <Title level={5} className="!m-0">赠品明细</Title>
                        <Text type="secondary">赠品不参与金额计算，单价默认为0</Text>
                        <Button type="dashed" size="small" icon={<PlusOutlined />} onClick={() => addItem(true)}>添加赠品</Button>
                    </div>
                    <Table 
                        columns={giftColumns} 
                        dataSource={giftItems} 
                        rowKey="id" 
                        size="small" 
                        pagination={false} 
                        scroll={{ x: 1000 }} 
                    />
                </div>

                <Row gutter={24} className="mt-6">
                    <Col span={14}>
                        <Form.Item name="productionRemark" label="生产备注">
                            <TextArea rows={2} placeholder="给生产车间的特殊说明" />
                        </Form.Item>
                        <Form.Item name="customerRemark" label="客户备注">
                            <TextArea rows={2} placeholder="显示在送货单上的客户备注" />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <div className="bg-gray-50 p-4 rounded text-right space-y-2 border border-gray-100">
                            <div>产品总额: <Text strong>¥{totalSummaries.productTotal.toFixed(2)}</Text></div>
                            <div>客户优惠折扣率: <Tag color="blue">{totalSummaries.discountRate}%</Tag></div>
                            <div>折后产品总额: <Text strong>¥{totalSummaries.discountedProductTotal.toFixed(2)}</Text></div>
                            <div>优惠总额度: <Text type="secondary">¥{totalSummaries.totalSaving.toFixed(2)}</Text></div>
                            <div>订金应收: <Text strong type="warning">¥{totalSummaries.depositReceivable.toFixed(2)}</Text></div>
                            <div className="flex justify-end items-center">
                                <span className="mr-2">其他费用:</span>
                                <Form.Item name="otherFee" noStyle><InputNumber precision={2} style={{ width: 120 }} onChange={() => {}} /></Form.Item>
                            </div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="text-2xl font-bold text-red-600">
                                订单总额: ¥{totalSummaries.orderTotal.toFixed(2)}
                            </div>
                            <div className="flex justify-end gap-4 text-gray-500">
                                <div>已收金额: ¥{(record?.paidAmount || 0).toFixed(2)}</div>
                                <div>待收金额: ¥{(totalSummaries.orderTotal - (record?.paidAmount || 0)).toFixed(2)}</div>
                            </div>
                        </div>
                    </Col>
                </Row>
            </Form>

            <CustomerSelectModal 
                open={customerModalOpen} 
                onCancel={() => setCustomerModalOpen(false)} 
                onConfirm={handleCustomerConfirm} 
            />

            <QuotationSelectModal
                open={quotationModalOpen}
                onCancel={() => setQuotationModalOpen(false)}
                onConfirm={handleQuotationConfirm}
            />

            <PropertySelectModal
                open={propertyModalOpen.open}
                onCancel={() => setPropertyModalOpen({ open: false, index: null, isGift: false })}
                onConfirm={handlePropertyConfirm}
                productCode={
                    propertyModalOpen.isGift 
                    ? giftItems[propertyModalOpen.index]?.productCode 
                    : items[propertyModalOpen.index]?.productCode
                }
            />
        </Modal>
    );
};

export default NormalOrderFormModal;
