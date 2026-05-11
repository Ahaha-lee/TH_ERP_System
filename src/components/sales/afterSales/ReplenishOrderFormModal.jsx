
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
    message
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { employees } from '../../../mock/masterData';
import OriginalOrderSelectModal from '../OriginalOrderSelectModal';
import PropertySelectModal from '../../quotation/PropertySelectModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ReplenishOrderFormModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [orderSelectOpen, setOrderSelectOpen] = useState(false);
    const [propertyModalOpen, setPropertyModalOpen] = useState({ open: false, index: null });
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({ ...record, orderDate: dayjs(record.orderDate) });
                setItems(record.items || []);
            } else { form.setFieldsValue({ orderNo: `ORDER-预览`, orderDate: dayjs(), salesperson: '管理员' });
                setItems([]);
            }
        }
    }, [open, record, form]);

    const handleOrderConfirm = (order) => {
        form.setFieldsValue({
            orderNo: order.orderNo,
            customerName: order.customerName,
            customerType: order.customerType,
            settlementMethod: order.settlementMethod
        });

        const newItems = (order.items || []).map(item => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            originalQuantity: item.quantity,
            shippedQuantity: item.quantity,
            replenishedQuantity: 0,
            availableQuantity: item.quantity,
            quantity: 0,
            unitPrice: 0,
            amount: 0
        }));
        setItems(newItems);
        setOrderSelectOpen(false);
    };

    const handleFieldChange = (field, val, index) => {
        const update = [...items];
        update[index][field] = val;
        setItems(update);
    };

    const handlePropertyConfirm = (property) => {
        const { index } = propertyModalOpen;
        const update = [...items];
        update[index] = { ...update[index], property };
        setItems(update);
        setPropertyModalOpen({ open: false, index: null });
    };

    const handleSubmit = (isSubmit = false) => {
        form.validateFields().then(values => {
            if (items.every(i => i.quantity <= 0)) {
                return message.error('请至少输入一个补货项的数量');
            }
            const data = { ...values, items: items.filter(i => i.quantity > 0), status: isSubmit ? '待发货' : '草稿', orderDate: values.orderDate.format('YYYY-MM-DD') };
            onSuccess(data);
        });
    };

    const columns = [
        { title: '产品名称', dataIndex: 'productName' },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 120,
            render: (val, record, index) => (
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setPropertyModalOpen({ open: true, index })}
                    disabled={!record.productCode}
                >
                    {val || '选择属性'}
                </Button>
            )
        },
        { title: '规格', dataIndex: 'spec' },
        { title: '原单数量', dataIndex: 'originalQuantity', width: 90 },
        { title: '已发货', dataIndex: 'shippedQuantity', width: 80 },
        { title: '可补货', dataIndex: 'availableQuantity', width: 80 },
        { 
            title: '本次补货数量', 
            dataIndex: 'quantity', 
            width: 120,
            render: (val, record, index) => <InputNumber min={0} max={record.availableQuantity} value={val} onChange={(v) => handleFieldChange('quantity', v, index)} />
        },
        { title: '补货单价', dataIndex: 'unitPrice', width: 100, render: () => '¥0.00' },
        { title: '备注', dataIndex: 'remark', render: (v, _, i) => <Input value={v} onChange={(e) => handleFieldChange('remark', e.target.value, i)} /> }
    ];

    return (
        <Modal forceRender
            title={record ? `编辑补货单 - ${record.replenishNo}` : '新增补货单'}
            open={open}
            onCancel={onCancel}
            width={1200}
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="save" onClick={() => handleSubmit(false)}>保存草稿</Button>,
                <Button key="submit" type="primary" onClick={() => handleSubmit(true)}>保存并提交</Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={6}><Form.Item name="replenishNo" label="补货单号"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="orderNo" label="原销售订单号" rules={[{ required: true }]}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input readOnly placeholder="选择关联订单" />
                                <Button type="primary" icon={<SearchOutlined />} onClick={() => setOrderSelectOpen(true)} />
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="customerName" label="客户"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}><Form.Item name="orderDate" label="申请日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
                            <Select options={employees.map(e => ({ label: e.name, value: e.name }))} />
                        </Form.Item>
                    </Col>
                </Row>
                <Table columns={columns} dataSource={items} rowKey="id" pagination={false} size="small" />
                <Row gutter={24} className="mt-4">
                    <Col span={14}><Form.Item name="remark" label="备注"><TextArea rows={3} /></Form.Item></Col>
                    <Col span={10}>
                        <div className="bg-gray-50 p-4 rounded text-right space-y-2 border border-dashed">
                            <div>补货产品总额: <Text strong>¥0.00</Text></div>
                            <div className="flex justify-end items-center">
                                <span className="mr-2">其他费用:</span>
                                <Form.Item name="otherFee" noStyle initialValue={0}><InputNumber precision={2} /></Form.Item>
                            </div>
                            <Divider />
                            <div className="text-xl font-bold">订单总额: ¥0.00</div>
                            <Text type="secondary">补货订单金额通常为0，其他费用将计入客户往来。</Text>
                        </div>
                    </Col>
                </Row>
            </Form>
            <OriginalOrderSelectModal open={orderSelectOpen} onCancel={() => setOrderSelectOpen(false)} onConfirm={handleOrderConfirm} />
            <PropertySelectModal
                open={propertyModalOpen.open}
                onCancel={() => setPropertyModalOpen({ open: false, index: null })}
                onConfirm={handlePropertyConfirm}
                productCode={items[propertyModalOpen.index]?.productCode}
            />
        </Modal>
    );
};

export default ReplenishOrderFormModal;
