
import React, { useState } from 'react';
import { 
    Modal, 
    Form, 
    Radio, 
    Input, 
    message, 
    Typography, 
    Descriptions, 
    Divider, 
    Table, 
    Row, 
    Col, 
    Tag,
    Select
} from 'antd';
import { warehouses } from '../../../mock/data';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const TrusteeAuditModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    const calculations = React.useMemo(() => {
        if (!record) return { productTotal: 0, discountedTotal: 0, totalSaving: 0, taxedProductTotal: 0, orderTotal: 0, rateVal: 0.13 };
        const itemsList = record.items || [];
        const productTotal = itemsList.reduce((sum, item) => sum + (item.unitPrice || 0) * (item.quantity || 0), 0);
        const discountedTotal = productTotal * 0.95; // 5% discount
        const totalSaving = productTotal - discountedTotal;

        const activeTaxRateStr = record.taxRate ?? 13;
        const clean = String(activeTaxRateStr).replace('%', '').trim();
        const num = parseFloat(clean);
        const rateVal = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);

        const taxedProductTotal = discountedTotal * (1 + rateVal);
        const otherFee = record.otherFee ?? record.otherFees ?? 0;
        const orderTotal = taxedProductTotal + otherFee;

        return {
            productTotal,
            discountedTotal,
            totalSaving,
            taxedProductTotal,
            orderTotal,
            rateVal
        };
    }, [record]);

    React.useEffect(() => {
        if (record && record.items) {
            setItems(record.items.map(item => ({
                ...item,
                warehouse: item.warehouse || '成品仓',
                location: item.location || 'A-01-01'
            })));
        }
    }, [record]);

    const handleOk = () => {
        if (!record) return;
        form.validateFields().then(values => {
            message.success('审批处理成功');
            onSuccess({
                ...record,
                items: items,
                status: values.action === 'pass' ? '已审核' : record.status, 
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                auditRemark: values.remark,
                auditTime: new Date().toLocaleString(),
                auditor: '当前管理员'
            });
            form.resetFields();
        });
    };

    if (!record) return null;

    const productColumns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
        { title: '加工单价', dataIndex: 'unitPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        { title: '金额', dataIndex: 'amount', width: 110, align: 'right', render: (_, rec) => {
            const amt = (rec.unitPrice || 0) * (rec.quantity || 0);
            return <strong className="font-mono text-gray-900">¥{amt.toFixed(2)}</strong>;
        } },
        {
            title: '含税总额',
            width: 120,
            align: 'right',
            render: (_, rec) => {
                const amt = (rec.unitPrice || 0) * (rec.quantity || 0);
                const taxedAmt = amt * (1 + calculations.rateVal);
                return <strong className="font-mono text-amber-600">¥{taxedAmt.toFixed(2)}</strong>;
            }
        },
    ];

    return (
        <Modal forceRender
            title={`审批受托加工订单 - ${record.orderNo}`}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1200}
            centered
            okText="确认"
            cancelText="取消"
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                <Descriptions bordered size="small" column={3}>
                    <Descriptions.Item label="来源报价">{record.quotationNo || '-'}</Descriptions.Item>
                    <Descriptions.Item label="客户名称">{record.customerName}</Descriptions.Item>
                    <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                    <Descriptions.Item label="期望发货日期">{record.expectDeliveryDate || '-'}</Descriptions.Item>
                    <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                    <Descriptions.Item label="当前状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
                    <Descriptions.Item label="紧急程度" span={3}>
                        <Tag color={(record.urgency === '紧急' || record.isUrgent) ? "red" : "default"}>
                            {record.urgency || (record.isUrgent ? '紧急' : '一般')}
                        </Tag>
                    </Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="left" style={{ margin: '16px 0' }}>产品明细</Divider>
                <Table 
                    dataSource={items} 
                    columns={productColumns} 
                    pagination={false} 
                    size="small" 
                    bordered
                    rowKey="id"
                />

                {record.productionRemark && (
                    <div style={{ marginTop: 16 }}>
                        <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>生产备注</Title>
                        <div className="bg-gray-50 p-2 border rounded border-gray-200">
                            {record.productionRemark}
                        </div>
                    </div>
                )}

                <div className="bg-gray-50 p-4 rounded text-right space-y-1 mt-4 border">
                    <div>加工费总计: <Text strong>¥{calculations.productTotal.toFixed(2)}</Text></div>
                    <div>折后加工费: <Text strong>¥{calculations.discountedTotal.toFixed(2)}</Text> (5%折扣)</div>
                    <div>优惠总金额: <Text type="secondary">¥{calculations.totalSaving.toFixed(2)}</Text></div>
                    <div>订单含税总额: <Text strong className="font-mono">¥{calculations.taxedProductTotal.toFixed(2)}</Text></div>
                    <div>其他费用: <Text strong>¥{(record.otherFee || record.otherFees || 0).toFixed(2)}</Text></div>
                    <Divider style={{ margin: '8px 0' }} />
                    <div className="text-xl font-bold text-red-600">订单总额: ¥{calculations.orderTotal.toFixed(2)}</div>
                </div>

                <Divider style={{ margin: '24px 0 16px 0' }} />

                <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="action" label="审批操作" rules={[{ required: true }]}>
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value="pass">审批通过</Radio.Button>
                                    <Radio.Button value="reject">审批拒绝</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="remark" label="审批意见" rules={[{ required: true, message: '请填写审批意见' }]}>
                                <TextArea rows={2} placeholder="请输入审批意见" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
};

export default TrusteeAuditModal;
