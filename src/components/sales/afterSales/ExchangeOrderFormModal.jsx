
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
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { products, employees } from '../../../mock/masterData';
import OriginalOrderSelectModal from '../OriginalOrderSelectModal';
import PropertySelectModal from '../../quotation/PropertySelectModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ExchangeOrderFormModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [orderSelectOpen, setOrderSelectOpen] = useState(false);
    const [propertyModalOpen, setPropertyModalOpen] = useState({ open: false, index: null, isExchange: false });
    const [returnItems, setReturnItems] = useState([]);
    const [exchangeItems, setExchangeItems] = useState([]);
    const [selectedReturnKeys, setSelectedReturnKeys] = useState([]);

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({ ...record, orderDate: dayjs(record.orderDate) });
                // In record, we split items by some flag if they are return or exchange
                setReturnItems(record.items?.filter(i => i.action === '退回') || []);
                setExchangeItems(record.items?.filter(i => i.action === '换出') || []);
            } else { form.setFieldsValue({ orderNo: `ORDER-预览`, orderDate: dayjs(), salesperson: '管理员' });
                setReturnItems([]);
                setExchangeItems([]);
                setSelectedReturnKeys([]);
            }
        }
    }, [open, record, form]);

    const handleOrderConfirm = (order) => {
        form.setFieldsValue({
            orderNo: order.orderNo,
            customerName: order.customerName,
            customerType: order.customerType,
            settlementMethod: order.settlementMethod,
            subsidiary: order.subsidiary || '总部'
        });

        const newItems = (order.items || []).map(item => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            originalUnitPrice: item.unitPrice,
            shippedQuantity: item.quantity,
            returnedQuantity: 0,
            availableQuantity: item.quantity,
            currentReturnQuantity: 0,
            amount: 0,
        }));

        setReturnItems(newItems.map(i => ({ ...i, action: '退回' })));
        setExchangeItems(newItems.map(i => ({ 
            ...i, 
            linkedReturnId: i.id, 
            quantity: 0, 
            action: '换出' 
        })));
        setOrderSelectOpen(false);
    };

    const handleReturnFieldChange = (field, val, index) => {
        const update = [...returnItems];
        update[index][field] = val;
        
        if (field === 'currentReturnQuantity') {
            update[index].amount = val * update[index].originalUnitPrice;
            
            // Sync with exchange items
            const returnId = update[index].id;
            const newExchangeItems = exchangeItems.map(ei => 
                ei.linkedReturnId === returnId ? { ...ei, quantity: val } : ei
            );
            setExchangeItems(newExchangeItems);
        }
        setReturnItems(update);
    };

    const handleExchangeFieldChange = (field, val, index) => {
        const update = [...exchangeItems];
        update[index][field] = val;
        setExchangeItems(update);
    };

    const handlePropertyConfirm = (property) => {
        const { index, isExchange } = propertyModalOpen;
        if (isExchange) {
            const update = [...exchangeItems];
            update[index] = { ...update[index], property };
            setExchangeItems(update);
        } else {
            const update = [...returnItems];
            update[index] = { ...update[index], property };
            setReturnItems(update);
        }
        setPropertyModalOpen({ open: false, index: null, isExchange: false });
    };

    const totals = useMemo(() => {
        const returnTotal = returnItems.reduce((sum, i) => sum + (i.originalUnitPrice * (i.currentReturnQuantity || 0)), 0);
        const exchangeTotal = exchangeItems.reduce((sum, i) => sum + (i.unitPrice * (i.quantity || 0)), 0);
        return {
            returnTotal,
            exchangeTotal,
            diff: exchangeTotal - returnTotal
        };
    }, [returnItems, exchangeItems]);

    const returnColumns = [
        { title: '序号', width: 60, align: 'center', render: (_, __, index) => index + 1 },
        { title: '产品名称', dataIndex: 'productName', width: 120 },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 120,
            render: (val, record, index) => (
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setPropertyModalOpen({ open: true, index, isExchange: false })}
                    disabled={!record.productCode}
                >
                    {val || '选择属性'}
                </Button>
            )
        },
        { title: '可退数量', dataIndex: 'availableQuantity', width: 90 },
        { 
            title: '本次退回数量', 
            dataIndex: 'currentReturnQuantity', 
            width: 100,
            render: (val, record, index) => (
                <InputNumber 
                    min={0} 
                    max={record.availableQuantity} 
                    value={val} 
                    onChange={(v) => handleReturnFieldChange('currentReturnQuantity', v, index)} 
                />
            )
        },
        { title: '单价', dataIndex: 'originalUnitPrice', width: 90 },
        { title: '金额', render: (_, r) => Number(r.originalUnitPrice * (r.currentReturnQuantity || 0)).toFixed(2), width: 90 }
    ];

    const exchangeColumns = [
        { title: '序号', width: 60, align: 'center', render: (_, __, index) => index + 1 },
        { 
            title: '产品名称', 
            dataIndex: 'productName',
            render: (val) => <Text>{val}</Text>
        },
        { 
            title: '属性', 
            dataIndex: 'property', 
            width: 120,
            render: (val, record, index) => (
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => setPropertyModalOpen({ open: true, index, isExchange: true })}
                    disabled={!record.productCode}
                >
                    {val || '选择属性'}
                </Button>
            )
        },
        { 
            title: '数量', 
            dataIndex: 'quantity', 
            width: 90,
            render: (val) => <Text strong>{val}</Text>
        },
        { 
            title: '单价', 
            dataIndex: 'unitPrice', 
            width: 110,
            render: (val) => `¥${Number(val || 0).toFixed(2)}`
        },
        { title: '金额', render: (_, r) => Number(r.unitPrice * (r.quantity || 0)).toFixed(2), width: 100 }
    ];

    const handleSave = (isSubmit = false) => {
        form.validateFields().then(values => {
            const hasReturn = returnItems.some(i => i.currentReturnQuantity > 0);
            if (!hasReturn) return message.error('请至少选一个退回项的数量');
            if (Math.abs(totals.diff) > 0.01) return message.error('换货差额必须为零');

            const allItems = [
                ...returnItems.filter(i => i.currentReturnQuantity > 0).map(i => ({ ...i, action: '退回' })),
                ...exchangeItems.filter(i => i.quantity > 0).map(i => ({ ...i, action: '换出' }))
            ];

            const data = { ...values, items: allItems, status: isSubmit ? '待发货' : '草稿', orderDate: values.orderDate.format('YYYY-MM-DD') };
            onSuccess(data);
        });
    };

    return (
        <Modal forceRender
            title={record ? `编辑换货单 - ${record.exchangeNo}` : '新增换货单'}
            open={open}
            onCancel={onCancel}
            width={1200}
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="save" onClick={() => handleSave(false)}>保存草稿</Button>,
                <Button key="submit" type="primary" onClick={() => handleSave(true)}>提交审批</Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={6}><Form.Item name="exchangeNo" label="换货单号"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="orderNo" label="原销售订单号" rules={[{ required: true }]}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input readOnly placeholder="选择关联订单" />
                                <Button type="primary" icon={<SearchOutlined />} onClick={() => setOrderSelectOpen(true)} />
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="customerName" label="客户"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                </Row>

                <div className="mb-4">
                    <div className="mb-2 flex justify-between font-bold">退回旧货区 <Text type="secondary" size="small">录入退回数量</Text></div>
                    <Table columns={returnColumns} dataSource={returnItems} rowKey="id" pagination={false} size="small" scroll={{ y: 240 }} />
                    <div className="mt-2 text-right border-b pb-2">退回总额: <Text strong>¥{Number(totals.returnTotal || 0).toFixed(2)}</Text></div>
                </div>

                <div className="mb-4">
                    <div className="mb-2 font-bold">换出新货区</div>
                    <Table columns={exchangeColumns} dataSource={exchangeItems} rowKey="id" pagination={false} size="small" scroll={{ y: 240 }} />
                    <div className="mt-2 text-right border-b pb-2">换出总额: <Text strong>¥{Number(totals.exchangeTotal || 0).toFixed(2)}</Text></div>
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded flex justify-between items-center border border-dashed border-gray-300">
                    <div>
                        <Text strong>换货差额 (新 - 旧): </Text>
                        <Text strong style={{ fontSize: 20, color: Math.abs(totals.diff) < 0.01 ? 'green' : 'red' }}>
                            ¥{Number(totals.diff || 0).toFixed(2)}
                        </Text>
                    </div>
                    <Text type="secondary">换货差额必须为零，请调整单价。</Text>
                </div>
            </Form>
            <OriginalOrderSelectModal open={orderSelectOpen} onCancel={() => setOrderSelectOpen(false)} onConfirm={handleOrderConfirm} />
            <PropertySelectModal
                open={propertyModalOpen.open}
                onCancel={() => setPropertyModalOpen({ open: false, index: null, isExchange: false })}
                onConfirm={handlePropertyConfirm}
                productCode={
                    propertyModalOpen.isExchange 
                    ? exchangeItems[propertyModalOpen.index]?.productCode 
                    : returnItems[propertyModalOpen.index]?.productCode
                }
            />
        </Modal>
    );
};

export default ExchangeOrderFormModal;
