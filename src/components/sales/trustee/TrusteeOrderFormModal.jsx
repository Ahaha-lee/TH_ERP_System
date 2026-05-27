
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
    Switch
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { products, employees, customers } from '../../../mock/masterData';

const { TextArea } = Input;
const { Text, Title } = Typography;

const mockIncomingMaterials = [
    { code: 'MDF001', name: '密度板', spec: '1220*2440*15mm', model: 'E1级' },
    { code: 'PB002', name: '颗粒板', spec: '1220*2440*18mm', model: 'E0级' },
    { code: 'PLY003', name: '多层板', spec: '1220*2440*9mm', model: 'F4星' },
    { code: 'ST004', name: '钢材配件', spec: '40*40*2mm', model: 'Q235' },
    { code: 'AL005', name: '铝合金型材', spec: '6063-T5', model: '国标1.4mm' },
    { code: 'GLS006', name: '钢化玻璃', spec: '8mm单玻', model: '白玻' },
    { code: 'WOD007', name: '实木多层板', spec: '1220*2440*18mm', model: 'E0级' }
];

const TrusteeOrderFormModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [materials, setMaterials] = useState([]);
    const [processingItems, setProcessingItems] = useState([]);

    const taxRate = Form.useWatch('taxRate', form) ?? 13;
    const otherFee = Form.useWatch('otherFee', form) ?? 0;

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({ 
                    ...record, 
                    urgency: record.urgency || (record.isUrgent ? '紧急' : '一般'), 
                    taxRate: record.taxRate ?? 13,
                    orderDate: dayjs(record.orderDate), 
                    expectDeliveryDate: record.expectDeliveryDate ? dayjs(record.expectDeliveryDate) : null 
                });
                setMaterials(record.materials || []);
                setProcessingItems(record.items || []);
            } else { 
                form.setFieldsValue({ 
                    orderNo: `ORDER-预览`, 
                    orderDate: dayjs(), 
                    depositRate: 30, 
                    salesperson: '管理员', 
                    urgency: '一般',
                    taxRate: 13
                });
                setMaterials([]);
                setProcessingItems([]);
            }
        }
    }, [open, record, form]);

    const addMaterial = () => {
        setMaterials([...materials, { id: Math.random().toString(36).substr(2, 9), materialCode: '', materialName: '', spec: '', model: '', quantity: 1 }]);
    };

    const addProcessingItem = () => {
        setProcessingItems([...processingItems, { 
            id: Math.random().toString(36).substr(2, 9), 
            productCode: '', 
            productName: '', 
            processRemark: '', 
            quantity: 1, 
            unitPrice: 0, 
            discountRate: 5, 
            strategyCode: 'DEFAULT' 
        }]);
    };

    const handleProcessingChange = (field, val, index) => {
        const update = [...processingItems];
        update[index][field] = val;
        setProcessingItems(update);
    };

    const totals = useMemo(() => {
        const productTotal = processingItems.reduce((sum, item) => {
            const uPrice = item.unitPrice || 0;
            return sum + uPrice * (item.quantity || 0);
        }, 0);
        const discountedTotal = processingItems.reduce((sum, item) => {
            const uPrice = item.unitPrice || 0;
            const itemDiscount = item.discountRate !== undefined ? item.discountRate : 5.0;
            const discountedPrice = uPrice * (1 - itemDiscount / 100);
            return sum + discountedPrice * (item.quantity || 0);
        }, 0);
        const totalSaving = productTotal - discountedTotal;
        const taxedProductTotal = discountedTotal * (1 + taxRate / 100);
        return {
            productTotal,
            discountedTotal,
            totalSaving,
            taxedProductTotal,
            orderTotal: taxedProductTotal + otherFee
        };
    }, [processingItems, taxRate, otherFee]);

    const materialColumns = [
        { 
            title: '物料编码', 
            dataIndex: 'materialCode', 
            render: (v, _, i) => (
                <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="搜编码"
                    optionFilterProp="children"
                    value={v || undefined}
                    onChange={(val) => {
                        const item = mockIncomingMaterials.find(m => m.code === val);
                        const update = [...materials];
                        if (item) {
                            update[i] = {
                                ...update[i],
                                materialCode: item.code,
                                materialName: item.name,
                                spec: item.spec,
                                model: item.model
                            };
                        } else {
                            update[i].materialCode = val;
                        }
                        setMaterials(update);
                    }}
                    options={mockIncomingMaterials.map(m => ({ label: m.code, value: m.code }))}
                />
            ) 
        },
        { 
            title: '物料名称', 
            dataIndex: 'materialName', 
            render: (v, _, i) => (
                <Select 
                    showSearch 
                    style={{ width: '100%' }} 
                    placeholder="选择/搜索物料"
                    optionFilterProp="children"
                    value={v || undefined} 
                    onChange={(val) => {
                        const item = mockIncomingMaterials.find(m => m.name === val);
                        const update = [...materials];
                        if (item) {
                            update[i] = { 
                                ...update[i], 
                                materialCode: item.code, 
                                materialName: item.name, 
                                spec: item.spec, 
                                model: item.model 
                            };
                        } else {
                            update[i].materialName = val;
                        }
                        setMaterials(update);
                    }} 
                    options={mockIncomingMaterials.map(m => ({ label: `${m.name} (${m.code})`, value: m.name }))} 
                />
            )
        },
        { 
            title: '规格', 
            dataIndex: 'spec', 
            render: (v, _, i) => (
                <Input 
                    value={v} 
                    onChange={(e) => {
                        const update = [...materials];
                        update[i].spec = e.target.value;
                        setMaterials(update);
                    }} 
                    placeholder="规格" 
                />
            ) 
        },
        { 
            title: '型号', 
            dataIndex: 'model', 
            render: (v, _, i) => (
                <Input 
                    value={v} 
                    onChange={(e) => {
                        const update = [...materials];
                        update[i].model = e.target.value;
                        setMaterials(update);
                    }} 
                    placeholder="型号" 
                />
            ) 
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 120, 
            render: (v, _, i) => (
                <InputNumber 
                    min={1} 
                    value={v} 
                    onChange={(val) => {
                        const update = [...materials];
                        update[i].quantity = val || 1;
                        setMaterials(update);
                    }} 
                />
            ) 
        },
        { 
            title: '操作', 
            width: 50, 
            render: (_, __, i) => (
                <Button 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))} 
                />
            ) 
        }
    ];

    const processingColumns = [
        { 
            title: '产品编码', 
            dataIndex: 'productCode',
            width: 130,
            render: (v) => <span className="font-mono text-gray-500">{v || '自动生成'}</span>
        },
        { 
            title: '产品名称', 
            dataIndex: 'productName', 
            width: 170,
            render: (v, _, i) => (
                <Select 
                    showSearch 
                    style={{ width: '100%' }} 
                    value={v || undefined} 
                    placeholder="请选择产品"
                    onChange={(val) => {
                        const product = products.find(p => p.name === val);
                        const update = [...processingItems];
                        const uPrice = product?.price || 0;
                        update[i] = { 
                            ...update[i], 
                            productName: val, 
                            productCode: product?.code || ('PROD' + i), 
                            unitPrice: uPrice,
                            discountRate: update[i].discountRate ?? 5,
                            strategyCode: update[i].strategyCode ?? 'DEFAULT'
                        };
                        setProcessingItems(update);
                    }} 
                    options={products.map(p => ({ label: p.name, value: p.name }))} 
                />
            )
        },
        { 
            title: '加工备注', 
            dataIndex: 'processRemark', 
            width: 130,
            render: (v, _, i) => (
                <Input 
                    placeholder="输入备注" 
                    value={v} 
                    onChange={(e) => handleProcessingChange('processRemark', e.target.value, i)} 
                />
            )
        },
        { 
            title: '加工单价', 
            dataIndex: 'unitPrice', 
            width: 110,
            render: (v, _, i) => (
                <InputNumber 
                    min={0}
                    precision={2}
                    value={v}
                    style={{ width: '100%' }}
                    onChange={(val) => handleProcessingChange('unitPrice', val || 0, i)}
                />
            )
        },
        { 
            title: '优惠折扣率', 
            dataIndex: 'discountRate', 
            width: 105, 
            render: (v, _, i) => (
                <InputNumber 
                    min={0} 
                    max={100} 
                    precision={1}
                    formatter={val => `${val}%`}
                    parser={val => val.replace('%', '')}
                    value={v !== undefined ? v : 5}
                    style={{ width: '100%' }}
                    onChange={(val) => handleProcessingChange('discountRate', val !== null ? val : 5, i)}
                />
            )
        },
        {
            title: '价格策略',
            dataIndex: 'strategyCode',
            width: 110,
            render: (v) => (
                <Button 
                    type="link" 
                    size="small" 
                    style={{ padding: 0 }}
                    onClick={() => {
                        message.success(`已跳转至 [${v || 'DEFAULT'}] 价格策略配置页面`);
                    }}
                >
                    {v || 'DEFAULT'}
                </Button>
            )
        },
        {
            title: '折后加工单价',
            width: 110,
            align: 'right',
            render: (_, r) => {
                const uPrice = r.unitPrice || 0;
                const dRate = r.discountRate !== undefined ? r.discountRate : 5.0;
                const finalUnitPrice = uPrice * (1 - dRate / 100);
                return <span className="font-mono text-gray-700">¥{finalUnitPrice.toFixed(2)}</span>;
            }
        },
        { 
            title: '加工数量', 
            dataIndex: 'quantity', 
            width: 90, 
            render: (v, _, i) => (
                <InputNumber 
                    min={1} 
                    value={v} 
                    style={{ width: '100%' }}
                    onChange={(val) => handleProcessingChange('quantity', val || 1, i)} 
                />
            ) 
        },
        {
            title: '标准总金额',
            width: 110,
            align: 'right',
            render: (_, r) => {
                const uPrice = r.unitPrice || 0;
                const qty = r.quantity || 1;
                return <span className="font-mono text-gray-600">¥{(uPrice * qty).toFixed(2)}</span>;
            }
        },
        {
            title: '折后总金额（含税）',
            width: 140,
            align: 'right',
            render: (_, r) => {
                const uPrice = r.unitPrice || 0;
                const dRate = r.discountRate !== undefined ? r.discountRate : 5.0;
                const qty = r.quantity || 1;
                const finalUnitPrice = uPrice * (1 - dRate / 100);
                const taxedAmount = finalUnitPrice * qty * (1 + taxRate / 100);
                return <span className="font-mono text-amber-600 font-semibold">¥{taxedAmount.toFixed(2)}</span>;
            }
        },
        {
            title: '折后总金额（不含税）',
            width: 140,
            align: 'right',
            render: (_, r) => {
                const uPrice = r.unitPrice || 0;
                const dRate = r.discountRate !== undefined ? r.discountRate : 5.0;
                const qty = r.quantity || 1;
                const finalUnitPrice = uPrice * (1 - dRate / 100);
                const untaxedAmount = finalUnitPrice * qty;
                return <span className="font-mono text-gray-800 font-semibold">¥{untaxedAmount.toFixed(2)}</span>;
            }
        },
        { 
            title: '操作', 
            width: 60, 
            align: 'center',
            render: (_, __, i) => (
                <Button 
                    type="link" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => setProcessingItems(processingItems.filter((_, idx) => idx !== i))} 
                />
            ) 
        }
    ];

    const handleSave = (isSubmit = false) => {
        form.validateFields().then(values => {
            if (materials.length === 0) return message.error('请添加来料清单');
            if (processingItems.length === 0) return message.error('请添加加工明细');
            
            // Enrich details with computed tax figures for storage/success callback
            const enrichedItems = processingItems.map(item => {
                const uPrice = item.unitPrice || 0;
                const dRate = item.discountRate !== undefined ? item.discountRate : 5.0;
                const finalPrice = uPrice * (1 - dRate / 100);
                const incPrice = finalPrice * (1 + (values.taxRate || 13) / 100);
                return {
                    ...item,
                    discountRate: dRate,
                    strategyCode: item.strategyCode || 'DEFAULT',
                    taxInclusivePrice: incPrice,
                    amount: finalPrice * (item.quantity || 0),
                    taxedAmount: incPrice * (item.quantity || 0)
                };
            });

            const data = { 
                ...values, 
                materials, 
                items: enrichedItems, 
                totalAmount: totals.orderTotal, 
                status: isSubmit ? '待审核' : '草稿', 
                orderDate: values.orderDate.format('YYYY-MM-DD'),
                expectDeliveryDate: values.expectDeliveryDate ? values.expectDeliveryDate.format('YYYY-MM-DD') : null
            };
            onSuccess(data);
        });
    };

    return (
        <Modal forceRender
            title={record ? `编辑受托加工单 - ${record.orderNo}` : '新增受托加工单'}
            open={open}
            onCancel={onCancel}
            width={1200}
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="save" onClick={() => handleSave(false)}>保存草稿</Button>,
                <Button key="submit" type="primary" onClick={() => handleSave(true)}>保存并提交</Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={6}><Form.Item name="orderNo" label="受托加工订单号"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="customerName" label="客户" rules={[{ required: true }]}>
                            <Select showSearch options={customers.map(c => ({ label: c.name, value: c.name }))} />
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}><Form.Item name="expectDeliveryDate" label="期望发货日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
                            <Select options={employees.map(e => ({ label: e.name, value: e.name }))} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="taxRate" label="税率(%)" rules={[{ required: true, message: '请输入税率' }]}>
                            <InputNumber min={0} max={100} formatter={v => `${v}%`} parser={v => v.replace('%', '')} style={{ width: '100%' }} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="urgency" label="紧急程度" rules={[{ required: true, message: '请选择紧急程度' }]}>
                            <Select placeholder="选择紧急程度">
                                <Select.Option value="紧急">紧急</Select.Option>
                                <Select.Option value="一般">一般</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <div className="mt-4">
                    <div className="flex justify-between items-center mb-2">
                        <Title level={5} className="!m-0">客户来料清单</Title>
                        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addMaterial}>添加来料</Button>
                    </div>
                    <Table columns={materialColumns} dataSource={materials} rowKey="id" pagination={false} size="small" />
                </div>

                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <Title level={5} className="!m-0">加工费明细</Title>
                        <Button type="primary" size="small" icon={<PlusOutlined />} onClick={addProcessingItem}>添加加工项</Button>
                    </div>
                    <Table columns={processingColumns} dataSource={processingItems} rowKey="id" pagination={false} size="small" />
                </div>

                <Row gutter={24} className="mt-6">
                    <Col span={14}>
                        <Row gutter={12}>
                            <Col span={12}>
                                <Form.Item name="productionRemark" label="生产备注">
                                    <TextArea rows={4} placeholder="生产工艺说明、排产具体要求等" />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item name="customerRemark" label="客户备注">
                                    <TextArea rows={4} placeholder="客户特殊要求、包装要求、送货备注等" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={10}>
                        <div className="bg-gray-50 p-4 rounded text-right space-y-2 border">
                            <div>加工费总额: <Text strong>¥{totals.productTotal.toFixed(2)}</Text></div>
                            <div>折后加工费: <Text strong>¥{totals.discountedTotal.toFixed(2)}</Text> (5%折扣)</div>
                            <div>优惠总金额: <Text type="secondary">¥{totals.totalSaving.toFixed(2)}</Text></div>
                            <div>订单含税总额: <Text strong className="font-mono">¥{totals.taxedProductTotal.toFixed(2)}</Text></div>
                            <div className="flex justify-end items-center">
                                <span className="mr-2">其他费用:</span>
                                <Form.Item name="otherFee" noStyle initialValue={0}><InputNumber precision={2} /></Form.Item>
                            </div>
                            <Divider />
                            <div className="text-2xl font-bold text-red-600">订单总额: ¥{totals.orderTotal.toFixed(2)}</div>
                        </div>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default TrusteeOrderFormModal;
