
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
    Alert
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { employees } from '../../../mock/masterData';
import OriginalOrderSelectModal from '../OriginalOrderSelectModal';
import PropertySelectModal from '../../quotation/PropertySelectModal';

const { TextArea } = Input;
const { Text, Title } = Typography;

const ReturnOrderFormModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [orderSelectOpen, setOrderSelectOpen] = useState(false);
    const [propertyModalOpen, setPropertyModalOpen] = useState({ open: false, index: null });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (open) {
            if (record) {
                form.setFieldsValue({
                    ...record,
                    orderDate: dayjs(record.orderDate),
                });
                setItems(record.items || []);
                // If it's edit, we'd ideally load the original order context too
            } else { form.setFieldsValue({ orderNo: `ORDER-预览` });
                const tempNo = 'RTN-' + Date.now().toString().substr(-6);
                form.setFieldsValue({
                    returnNo: tempNo,
                    orderDate: dayjs(),
                    salesperson: '管理员'
                });
                setItems([]);
                setSelectedOrder(null);
            }
        }
    }, [open, record, form]);

    const handleOrderConfirm = (order) => {
        setSelectedOrder(order);
        form.setFieldsValue({
            sourceOrderNo: order.orderNo,
            customerName: order.customerName,
            customerType: order.customerType,
            settlementMethod: order.settlementMethod,
            monthlyCycle: order.settlementMethod === '月结' ? '30天' : undefined,
            prepaidBalance: order.prepaidBalance || (order.settlementMethod === '预存' ? 50000 : 0),
            subsidiary: order.subsidiary || '总部'
        });

        // Map items from original order
        // Mocking delivered and returned quantities
        const newItems = (order.items || []).map(item => ({
            ...item,
            id: Math.random().toString(36).substr(2, 9),
            originalUnitPrice: item.unitPrice,
            originalQuantity: item.quantity,
            shippedQuantity: item.quantity, // Assume fully shipped for demo
            returnedQuantity: 0,
            availableQuantity: item.quantity,
            returnQuantity: 0,
            returnUnitPrice: item.unitPrice,
            amount: 0,
            remark: ''
        }));
        setItems(newItems);
        setOrderSelectOpen(false);
    };

    const handleFieldChange = (field, val, index) => {
        const updateList = [...items];
        updateList[index][field] = val;

        if (field === 'returnQuantity' || field === 'returnUnitPrice') {
            updateList[index].amount = updateList[index].returnQuantity * updateList[index].returnUnitPrice;
        }

        setItems(updateList);
    };

    const handlePropertyConfirm = (property) => {
        const { index } = propertyModalOpen;
        const updateList = [...items];
        updateList[index] = {
            ...updateList[index],
            property
        };
        setItems(updateList);
        setPropertyModalOpen({ open: false, index: null });
    };

    const totalSummaries = useMemo(() => {
        const productTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
        const originalPaid = selectedOrder?.paidAmount || (record?.originalPaid || 0);
        const otherFee = form.getFieldValue('otherFee') || 0;
        const orderTotal = productTotal + otherFee;

        return {
            productTotal,
            originalPaid,
            orderTotal
        };
    }, [items, selectedOrder, record, form.getFieldValue('otherFee')]);

    const columns = [
        { title: '序号', width: 50, render: (_, __, i) => i + 1 },
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
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
        { title: '单位', dataIndex: 'unit', width: 60, render: () => '套' },
        { title: '原单价', dataIndex: 'originalUnitPrice', width: 100, render: (v) => `¥${Number(v || 0).toFixed(2)}` },
        { title: '原单数量', dataIndex: 'originalQuantity', width: 90 },
        { title: '已发货数量', dataIndex: 'shippedQuantity', width: 100 },
        { title: '已退货数量', dataIndex: 'returnedQuantity', width: 100 },
        { title: '可退数量', dataIndex: 'availableQuantity', width: 90, render: (v) => <Text strong>{v}</Text> },
        { 
            title: '本次退货数量', 
            dataIndex: 'returnQuantity', 
            width: 120,
            render: (val, record, index) => (
                <InputNumber 
                    min={0} 
                    max={record.availableQuantity} 
                    value={val} 
                    onChange={(v) => handleFieldChange('returnQuantity', v, index)} 
                />
            )
        },
        { 
            title: '退货单价', 
            dataIndex: 'returnUnitPrice', 
            width: 120,
            render: (val, _, index) => (
                <InputNumber 
                    min={0} 
                    precision={2} 
                    value={val}
                    disabled 
                    onChange={(v) => handleFieldChange('returnUnitPrice', v, index)} 
                />
            )
        },
        { title: '退货金额', dataIndex: 'amount', width: 120, render: (v) => <Text strong type="danger">¥{(v || 0).toFixed(2)}</Text> },
        { 
            title: '备注', 
            dataIndex: 'remark', 
            width: 150,
            render: (val, _, index) => <Input value={val} onChange={(e) => handleFieldChange('remark', e.target.value, index)} />
        }
    ];

    const handleSubmit = (isSubmit = false) => {
        form.validateFields().then(values => {
            const hasReturn = items.some(i => i.returnQuantity > 0);
            if (!hasReturn) {
                message.error('请至少输入一个退货项的数量');
                return;
            }

            const returnData = {
                ...values,
                items: items.filter(i => i.returnQuantity > 0),
                returnAmount: totalSummaries.orderTotal,
                status: isSubmit ? '待收货' : '草稿',
                orderDate: values.orderDate.format('YYYY-MM-DD'),
            };

            if (isSubmit) {
                Modal.confirm({
                    title: '确认提交',
                    content: '提交后将进入仓库收货环节，确认吗？',
                    onOk: () => onSuccess(returnData)
                });
            } else {
                onSuccess(returnData);
            }
        });
    };

    const otherFee = Form.useWatch('otherFee', form) || 0;

    return (
        <Modal
            title={record ? `编辑退货单 - ${record.returnNo}` : '新增退货单'}
            open={open}
            onCancel={onCancel}
            width={1200}
            centered
            forceRender
            footer={[
                <Button key="cancel" onClick={onCancel}>取消</Button>,
                <Button key="save" onClick={() => handleSubmit(false)}>保存草稿</Button>,
                <Button key="submit" type="primary" onClick={() => handleSubmit(true)}>保存并提交</Button>
            ]}
        >
            <Form form={form} layout="vertical">
                <Row gutter={24}>
                    <Col span={6}><Form.Item name="returnNo" label="退货单号" rules={[{ required: true }]}><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="sourceOrderNo" label="原销售订单号" rules={[{ required: true }]}>
                            <Space.Compact style={{ width: '100%' }}>
                                <Input readOnly placeholder="选择关联订单" />
                                <Button type="primary" icon={<SearchOutlined />} onClick={() => setOrderSelectOpen(true)} />
                            </Space.Compact>
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="customerName" label="客户"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}><Form.Item name="customerType" label="客户类型"><Input readOnly disabled /></Form.Item></Col>
                    
                    <Col span={6}><Form.Item name="settlementMethod" label="结算方式"><Input readOnly disabled /></Form.Item></Col>
                    {form.getFieldValue('settlementMethod') === '月结' && (
                        <Col span={6}><Form.Item name="monthlyCycle" label="月结周期"><Input readOnly disabled /></Form.Item></Col>
                    )}
                    {form.getFieldValue('settlementMethod') === '预存' && (
                        <Col span={6}><Form.Item name="prepaidBalance" label="预存余额"><InputNumber readOnly disabled prefix="¥" precision={2} style={{ width: '100% '}} /></Form.Item></Col>
                    )}
                    <Col span={6}><Form.Item name="orderDate" label="申请日期" rules={[{ required: true }]}><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}><Form.Item name="subsidiary" label="项目 (子公司)"><Input readOnly disabled /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="salesperson" label="业务员" rules={[{ required: true }]}>
                            <Select showSearch options={employees.map(e => ({ label: e.name, value: e.name }))} />
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="returnReason" label="退货原因">
                            <Select options={[
                                { label: '质量问题', value: '质量问题' },
                                { label: '运输损坏', value: '运输损坏' },
                                { label: '错发', value: '错发' },
                                { label: '客户原因', value: '客户原因' },
                                { label: '其他', value: '其他' }
                            ]} />
                        </Form.Item>
                    </Col>
                </Row>

                <Alert 
                    title="产品选择提示" 
                    description="仅显示原订单中已发货且未退货完的产品，退货数量不能超过可退数量。" 
                    type="info" 
                    showIcon 
                    className="mb-4"
                />

                <Table 
                    columns={columns} 
                    dataSource={items} 
                    rowKey="id" 
                    size="small" 
                    pagination={false} 
                    scroll={{ x: 1500 }} 
                />

                <Row gutter={24} className="mt-6">
                    <Col span={14}>
                        <Form.Item name="customerRemark" label="客户备注">
                            <TextArea rows={2} placeholder="退款单显示备注" />
                        </Form.Item>
                    </Col>
                    <Col span={10}>
                        <div className="bg-gray-50 p-4 rounded text-right space-y-2 border border-gray-100">
                            <div>退货产品总额: <Text strong>¥{totalSummaries.productTotal.toFixed(2)}</Text></div>
                            <div className="flex justify-end items-center">
                                <span className="mr-2">其他应收费用:</span>
                                <Form.Item name="otherFee" noStyle><InputNumber precision={2} style={{ width: 120 }} /></Form.Item>
                            </div>
                            <div>原单已收金额: <Text type="secondary">¥{totalSummaries.originalPaid.toFixed(2)}</Text></div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="text-2xl font-bold text-green-600">
                                结算金额: ¥{totalSummaries.orderTotal.toFixed(2)}
                            </div>
                            <div className="mt-4 p-2 bg-blue-50 border border-blue-100 rounded text-left">
                                {totalSummaries.productTotal <= totalSummaries.originalPaid ? (
                                    <Text type="success">本次退货冲抵应收账款 ¥{totalSummaries.productTotal.toFixed(2)}，无需退款</Text>
                                ) : (
                                    <Text type="danger">退货金额超过原单已收款，差额 ¥{(totalSummaries.productTotal - totalSummaries.originalPaid).toFixed(2)} 需退款客户（财务审批后生成退款单）</Text>
                                )}
                            </div>
                        </div>
                    </Col>
                </Row>
            </Form>

            <OriginalOrderSelectModal 
                open={orderSelectOpen} 
                onCancel={() => setOrderSelectOpen(false)} 
                onConfirm={handleOrderConfirm} 
            />

            <PropertySelectModal
                open={propertyModalOpen.open}
                onCancel={() => setPropertyModalOpen({ open: false, index: null })}
                onConfirm={handlePropertyConfirm}
                productCode={items[propertyModalOpen.index]?.productCode}
            />
        </Modal>
    );
};

export default ReturnOrderFormModal;
