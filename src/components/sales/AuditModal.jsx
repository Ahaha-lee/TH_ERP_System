
import React from 'react';
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
    Tag 
} from 'antd';

const { TextArea } = Input;
const { Text, Title } = Typography;

const AuditModal = ({ open, record, onCancel, onSuccess, readonly }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        if (!record) return;
        if (readonly) {
            onCancel();
            return;
        }
        form.validateFields().then(values => {
            message.success('审批处理成功');
            onSuccess({
                ...record,
                status: values.action === 'pass' ? '已审批' : record.status, 
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                auditRemark: values.remark,
                auditTime: new Date().toLocaleString(),
                auditor: '当前管理员'
            });
            form.resetFields();
        });
    };

    // Financial calculations (mirroring NormalOrderFormModal)
    const items = record?.items || [];
    const productTotal = items.reduce((sum, item) => sum + ((item.standardPrice || item.price || 0) * (item.quantity || 0)), 0);
    const discountedProductTotal = items.reduce((sum, item) => sum + (item.amount || ((item.finalPrice || item.unitPrice || item.price || 0) * (item.quantity || 0))), 0);
    const totalSaving = productTotal - discountedProductTotal;

    const activeTaxRateStr = record?.taxRate ?? '13%';
    const clean = String(activeTaxRateStr).replace('%', '').trim();
    const num = parseFloat(clean);
    const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);

    const taxedProductTotal = discountedProductTotal * (1 + rate);
    const otherFee = record?.otherFee || 0;
    const orderTotal = taxedProductTotal + otherFee;
    const depositRatio = record?.depositRatio || 0;
    const depositReceivable = record?.isCollectDeposit ? orderTotal * (depositRatio / 100) : 0;

    const isReplenish = !!record?.replenishNo;

    const productColumns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '属性', dataIndex: 'property', width: 100 },
        { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
        { title: '标准单价', dataIndex: 'standardPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        !isReplenish && { title: '市场指导价', dataIndex: 'marketPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        !isReplenish && { title: '底价', dataIndex: 'floorPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        !isReplenish && { title: '客户优惠折扣率', width: 120, align: 'right', render: () => {
            const hasDiscounts = items.some(item => (item.discountRate !== undefined && item.discountRate !== 5));
            return hasDiscounts ? '多档' : '5%';
        } },
        { title: '折后单价', dataIndex: 'finalPrice', width: 100, align: 'right', render: (v, rec) => `¥${(v || rec.unitPrice || rec.price || 0).toFixed(2)}` },
        { title: '金额', dataIndex: 'amount', width: 120, align: 'right', render: (v, rec) => <Text strong type="danger">¥{(v || ((rec.finalPrice || rec.unitPrice || rec.price || 0) * (rec.quantity || 0))).toFixed(2)}</Text> },
        {
            title: '含税总额',
            width: 120,
            align: 'right',
            render: (_, rec) => {
                const amt = rec.amount || ((rec.finalPrice || rec.unitPrice || rec.price || 0) * (rec.quantity || 0));
                const taxedAmt = amt * (1 + rate);
                return <Text strong style={{ color: '#d97706' }} className="font-mono">¥{taxedAmt.toFixed(2)}</Text>;
            }
        },
        { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    ].filter(Boolean);

    const giftColumns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '属性', dataIndex: 'property', width: 100 },
        { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
        { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    ];

    const descItems = [];
    if (record) {
        if (isReplenish) {
            descItems.push(
                { key: 'replenishNo', label: '补货单号', children: record.replenishNo },
                { key: 'orderNo', label: '来源销售订单', children: record.orderNo },
                { key: 'customerName', label: '客户名称', children: record.customerName },
                { key: 'salesperson', label: '业务员', children: record.salesperson },
                { key: 'urgency', label: '紧急程度', children: <Tag color={(record.urgency === '紧急' || record.isUrgent) ? 'red' : 'default'}>{record.urgency || (record.isUrgent ? '紧急' : '一般')}</Tag>, span: 2 }
            );
        } else {
            descItems.push(
                { key: 'quotationNo', label: '来源报价', children: record.quotationNo || '-' },
                { key: 'customerName', label: '客户名称', children: record.customerName },
                { key: 'expectDeliveryDate', label: '期望发货日期', children: record.expectDeliveryDate || '-' },
                { key: 'subsidiary', label: '项目', children: record.subsidiary || '-' },
                { key: 'salesperson', label: '业务员', children: record.salesperson },
                { key: 'isCollectDeposit', label: '是否收取定金', children: record.isCollectDeposit ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag> },
                { key: 'depositRatio', label: '定金比例', children: `${record.depositRatio || 0}%` },
                { key: 'includeInStockingPlan', label: '纳入备货计划', children: record.includeInStockingPlan ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag> },
                { key: 'urgency', label: '紧急程度', children: <Tag color={(record.urgency === '紧急' || record.isUrgent) ? 'red' : 'default'}>{record.urgency || (record.isUrgent ? '紧急' : '一般')}</Tag>, span: 2 }
            );
        }
    }

    return (
        <Modal forceRender
            title={isReplenish ? `仓库审批补货单 - ${record?.replenishNo || ''}` : `审批销售订单 - ${record?.orderNo || ''}`}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1200}
            centered
            okText={readonly ? '关闭' : '确认'}
            cancelText="取消"
            cancelButtonProps={readonly ? { style: { display: 'none' } } : {}}
        >
            <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                {record ? (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                        <Descriptions bordered size="small" column={3} styles={{ label: { width: 120 } }} items={descItems} />

                        <Divider titlePlacement="left" style={{ margin: '16px 0' }}>产品明细</Divider>
                        <Table 
                            dataSource={record.items || []} 
                            columns={productColumns} 
                            pagination={false} 
                            size="small" 
                            bordered
                            scroll={{ x: 1400 }}
                            rowKey="id"
                        />

                        {record.giftItems && record.giftItems.length > 0 && (
                            <>
                                <Divider titlePlacement="left" style={{ margin: '16px 0' }}>赠品明细</Divider>
                                <Table 
                                    dataSource={record.giftItems} 
                                    columns={giftColumns} 
                                    pagination={false} 
                                    size="small" 
                                    bordered
                                    rowKey="id"
                                />
                            </>
                        )}

                        <Row gutter={24} style={{ marginTop: 16 }}>
                            <Col span={isReplenish ? 24 : 12}>
                                <div className="bg-gray-50 p-3 rounded h-full space-y-4">
                                    {!record.returnNo && !isReplenish && (
                                        <div>
                                            <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>生产备注</Title>
                                            <div className="bg-white p-2 border rounded border-gray-200 min-h-[40px]">
                                                {record.productionRemark || <Text type="secondary">无</Text>}
                                            </div>
                                        </div>
                                    )}
                                    <div>
                                        <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>备注</Title>
                                        <div className="bg-white p-2 border rounded border-gray-200 min-h-[40px]">
                                            {record.customerRemark || <Text type="secondary">无</Text>}
                                        </div>
                                    </div>
                                </div>
                            </Col>
                            {!isReplenish && (
                                <Col span={12}>
                                    <div className="bg-gray-50 p-3 rounded text-right space-y-1">
                                        <Title level={5} style={{ margin: '0 0 10px 0', textAlign: 'left' }}>价格汇总</Title>
                                        <div>订单总额: <Text strong>¥{productTotal.toFixed(2)}</Text></div>
                                        <div>折后订单总额: <Text strong>¥{discountedProductTotal.toFixed(2)}</Text></div>
                                        <div>优惠总额度: <Text type="secondary">¥{totalSaving.toFixed(2)}</Text></div>
                                        <div>订单含税总额: <Text strong className="font-mono">¥{taxedProductTotal.toFixed(2)}</Text></div>
                                        <div>定金应收: <Text strong type="warning">¥{depositReceivable.toFixed(2)}</Text></div>
                                        <div>其他费用: <Text strong>¥{otherFee.toFixed(2)}</Text></div>
                                        <Divider style={{ margin: '8px 0' }} />
                                        <div className="text-xl font-bold text-red-600">
                                            订单总额: ¥{orderTotal.toFixed(2)}
                                        </div>
                                    </div>
                                </Col>
                            )}
                        </Row>

                        {!readonly && (
                            <>
                                <Divider style={{ margin: '24px 0 16px 0' }} />
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <Form.Item name="action" label="审批结果" rules={[{ required: true }]}>
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
                            </>
                        )}

                        <Divider titlePlacement="left" style={{ margin: '24px 0 16px 0' }}>审批历史</Divider>
                        <Table 
                            size="small"
                            bordered
                            pagination={false}
                            dataSource={record.status === '草稿' ? [] : [
                                { 
                                    node: '提交申请', 
                                    operator: record.salesperson || '业务员', 
                                    time: record.createdAt || record.date || record.orderDate || '2025-04-29 09:00:00', 
                                    result: '提交', 
                                    remark: '申请已提交' 
                                },
                                record.auditTime ? { 
                                    node: '审批环节', 
                                    operator: record.auditor || '当前管理员', 
                                    time: record.auditTime, 
                                    result: record.auditResult || '审批通过', 
                                    remark: record.auditRemark || '无意见' 
                                } : null
                            ].filter(Boolean)}
                            columns={[
                                { title: '审批环节', dataIndex: 'node', width: 120 },
                                { title: '操作人', dataIndex: 'operator', width: 120 },
                                { title: '操作时间', dataIndex: 'time', width: 160 },
                                { title: '审批结果', dataIndex: 'result', width: 120 },
                                { title: '审批意见', dataIndex: 'remark' },
                            ]}
                            rowKey="node"
                        />
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">加载中...</div>
                )}
            </Form>
        </Modal>
    );
};

export default AuditModal;
