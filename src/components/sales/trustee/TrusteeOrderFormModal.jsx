
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
    Checkbox
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { products, employees, customers } from '../../../mock/masterData';

const { TextArea } = Input;
const { Text, Title } = Typography;

const TrusteeOrderFormModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [materials, setMaterials] = useState([]);
    const [processingItems, setProcessingItems] = useState([]);

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({ ...record, orderDate: dayjs(record.orderDate), expectDeliveryDate: record.expectDeliveryDate ? dayjs(record.expectDeliveryDate) : null });
                setMaterials(record.materials || []);
                setProcessingItems(record.items || []);
            } else { form.setFieldsValue({ orderNo: `ORDER-预览`, orderDate: dayjs(), depositRate: 30, salesperson: '管理员' });
                setMaterials([]);
                setProcessingItems([]);
            }
        }
    }, [open, record, form]);

    const addMaterial = () => {
        setMaterials([...materials, { id: Math.random().toString(36).substr(2, 9), materialCode: '', materialName: '', spec: '', quantity: 1 }]);
    };

    const addProcessingItem = () => {
        setProcessingItems([...processingItems, { id: Math.random().toString(36).substr(2, 9), productCode: '', productName: '', processRemark: '', quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const handleProcessingChange = (field, val, index) => {
        const update = [...processingItems];
        update[index][field] = val;
        if (field === 'quantity' || field === 'unitPrice') {
            update[index].amount = update[index].quantity * update[index].unitPrice;
        }
        setProcessingItems(update);
    };

    const totals = useMemo(() => {
        const productTotal = processingItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const discountRate = 5.0; // Mock
        const discountedTotal = productTotal * (1 - discountRate / 100);
        const otherFee = form.getFieldValue('otherFee') || 0;
        return {
            productTotal,
            discountedTotal,
            orderTotal: discountedTotal + otherFee
        };
    }, [processingItems, form.getFieldValue('otherFee')]);

    const materialColumns = [
        { title: '物料名称', dataIndex: 'materialName', render: (v, _, i) => (
            <Select showSearch style={{ width: '100% '}} value={v} onChange={(val) => {
                const update = [...materials];
                update[i] = { ...update[i], materialName: val, materialCode: 'MAT' + i, spec: '规格' + i };
                setMaterials(update);
            }} options={[{ label: '密度板', value: '密度板' }, { label: '颗粒板', value: '颗粒板' }]} />
        )},
        { title: '规格', dataIndex: 'spec' },
        { title: '数量', dataIndex: 'quantity', width: 120, render: (v, _, i) => <InputNumber min={1} value={v} onChange={(val) => {
            const update = [...materials];
            update[i].quantity = val;
            setMaterials(update);
        }} /> },
        { title: '操作', width: 50, render: (_, __, i) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setMaterials(materials.filter((_, idx) => idx !== i))} /> }
    ];

    const processingColumns = [
        { title: '成品名称', dataIndex: 'productName', render: (v, _, i) => (
            <Select showSearch style={{ width: '100% '}} value={v} onChange={(val) => {
                const product = products.find(p => p.name === val);
                const update = [...processingItems];
                update[i] = { 
                    ...update[i], 
                    productName: val, 
                    productCode: product?.code || ('PROD' + i), 
                    spec: product?.spec || '加工后规格',
                    unitPrice: product?.price || 0,
                    amount: (update[i].quantity || 0) * (product?.price || 0)
                };
                setProcessingItems(update);
            }} options={products.map(p => ({ label: p.name, value: p.name }))} />
        )},
        { title: '加工备注', dataIndex: 'processRemark', render: (v, _, i) => (
            <Input placeholder="输入备注" value={v} onChange={(e) => handleProcessingChange('processRemark', e.target.value, i)} />
        )},
        { title: '加工数量', dataIndex: 'quantity', width: 110, render: (v, _, i) => <InputNumber min={1} value={v} onChange={(val) => handleProcessingChange('quantity', val, i)} /> },
        { title: '加工单价', dataIndex: 'unitPrice', width: 110, render: (v, _, i) => <InputNumber min={0} precision={2} value={v} readOnly style={{ backgroundColor: '#f5f5f5' }} /> },
        { title: '金额', render: (_, r) => `¥${(r.amount || 0).toFixed(2)}`, width: 100 },
        { title: '操作', width: 50, render: (_, __, i) => <Button type="link" danger icon={<DeleteOutlined />} onClick={() => setProcessingItems(processingItems.filter((_, idx) => idx !== i))} /> }
    ];

    const handleSave = (isSubmit = false) => {
        form.validateFields().then(values => {
            if (materials.length === 0) return message.error('请添加来料清单');
            if (processingItems.length === 0) return message.error('请添加加工明细');
            const data = { ...values, materials, items: processingItems, totalAmount: totals.orderTotal, status: isSubmit ? '待审核' : '草稿', orderDate: values.orderDate.format('YYYY-MM-DD') };
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
