
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
    InputNumber,
    Space
} from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

const ReturnFinanceAuditModal = ({ open, record, onCancel, onSuccess, readonly }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        if (!record) return;
        if (readonly) {
            onCancel();
            return;
        }
        form.validateFields().then(values => {
            const auditResult = values.action === 'pass' ? '审批通过' : '审批拒绝';
            message.success(`财务审批：${auditResult}`);
            onSuccess({
                ...record,
                auditResult: auditResult,
                auditRemark: values.remark,
                financeAuditTime: new Date().toLocaleString(),
                financeAuditor: '财务主管',
                otherFee: values.otherFee,
                returnSettlementAmount: (record.returnAmount || 0) + (values.otherFee || 0)
            });
            form.resetFields();
        });
    };

    const columns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '属性', dataIndex: 'property', width: 100 },
        { 
            title: '单价', 
            dataIndex: 'unitPrice', 
            width: 100, 
            align: 'right',
            render: (v) => `¥${(v || 0).toFixed(2)}`
        },
        { 
            title: '原单价', 
            dataIndex: 'originalPrice', 
            width: 100, 
            align: 'right',
            render: (v, r) => `¥${(v || r.unitPrice || 0).toFixed(2)}`
        },
        { title: '原单数量', dataIndex: 'originalQuantity', width: 90, align: 'right' },
        { title: '已发货数量', dataIndex: 'shippedQuantity', width: 100, align: 'right' },
        { title: '已退货数量', dataIndex: 'returnedQuantity', width: 100, align: 'right' },
        { 
            title: '可退数量', 
            key: 'available',
            width: 90, 
            align: 'right',
            render: (_, r) => (r.shippedQuantity - r.returnedQuantity) || 0
        },
        { 
            title: '本次退货数量', 
            dataIndex: 'returnQuantity', 
            width: 100, 
            align: 'right',
            render: (v) => <Text strong>{v}</Text>
        },
        { 
            title: '退货单价', 
            dataIndex: 'returnUnitPrice', 
            width: 100, 
            align: 'right',
            render: (v, r) => `¥${(v || r.unitPrice || 0).toFixed(2)}`
        },
        { 
            title: '退货金额', 
            dataIndex: 'amount', 
            width: 110, 
            align: 'right',
            render: (v) => <Text type="danger">¥{(v || 0).toFixed(2)}</Text>
        },
        { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    ];

    return (
        <Modal 
            forceRender
            title={record ? `财务审批 - ${record.returnNo}` : '财务审批'}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1400}
            centered
            okText={readonly ? '关闭' : '确认'}
            cancelText="取消"
            cancelButtonProps={readonly ? { style: { display: 'none' } } : {}}
        >
            <Form form={form} layout="vertical" initialValues={{ action: 'pass', otherFee: 0 }}>
                {record ? (
                    <div style={{ maxHeight: '75vh', overflowY: 'auto', paddingRight: 8 }}>
                        <Descriptions bordered size="small" column={3}>
                            <Descriptions.Item label="退货单号">{record.returnNo}</Descriptions.Item>
                            <Descriptions.Item label="原销售订单号">{record.sourceOrderNo}</Descriptions.Item>
                            <Descriptions.Item label="客户名称">{record.customerName}</Descriptions.Item>
                            <Descriptions.Item label="申请日期">{record.date || record.orderDate}</Descriptions.Item>
                            <Descriptions.Item label="项目（子公司）">{record.subsidiary || '默认子公司'}</Descriptions.Item>
                            <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                            <Descriptions.Item label="退货原因" span={3}>{record.returnReason}</Descriptions.Item>
                            <Descriptions.Item label="客户备注" span={3}>{record.customerRemark || record.remark || '-'}</Descriptions.Item>
                        </Descriptions>

                        <Divider titlePlacement="left" style={{ margin: '16px 0' }}>退货产品明细</Divider>
                        <Table 
                            dataSource={record.items || []} 
                            columns={columns} 
                            pagination={false} 
                            size="small" 
                            bordered
                            scroll={{ x: 1600 }}
                            rowKey="id"
                        />

                        <Divider titlePlacement="left" style={{ margin: '24px 0 16px 0' }}>费用汇总</Divider>
                        
                        <div style={{ background: '#fafafa', padding: '16px', borderRadius: '4px', marginBottom: 24 }}>
                            <Row gutter={48} align="middle">
                                <Col span={8}>
                                    <Statistic title="退货产品总额" prefix="¥" value={record.returnAmount || 0} precision={2} />
                                </Col>
                                <Col span={8}>
                                    {readonly ? (
                                        <Statistic title="其他费用" prefix="¥" value={record.otherFee || 0} precision={2} />
                                    ) : (
                                        <Form.Item name="otherFee" label="其他费用" style={{ marginBottom: 0 }}>
                                            <InputNumber 
                                                prefix="¥" 
                                                style={{ width: '100%' }} 
                                                onChange={() => {
                                                    form.setFieldsValue({ _refresh: Date.now() });
                                                }}
                                            />
                                        </Form.Item>
                                    )}
                                </Col>
                                <Col span={8}>
                                    {readonly ? (
                                        <Statistic 
                                            title="退货结算金额" 
                                            prefix="¥" 
                                            value={record.returnSettlementAmount || (record.returnAmount + (record.otherFee || 0))} 
                                            precision={2} 
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    ) : (
                                        <Form.Item shouldUpdate={(prev, curr) => prev.otherFee !== curr.otherFee} noStyle>
                                            {() => {
                                                const otherFee = form.getFieldValue('otherFee') || 0;
                                                const settlement = (record.returnAmount || 0) + parseFloat(otherFee);
                                                return (
                                                    <Statistic 
                                                        title="退货结算金额" 
                                                        prefix="¥" 
                                                        value={settlement} 
                                                        precision={2} 
                                                        valueStyle={{ color: '#cf1322' }}
                                                    />
                                                );
                                            }}
                                        </Form.Item>
                                    )}
                                </Col>
                            </Row>
                        </div>

                        {!readonly && (
                            <>
                                <Divider style={{ margin: '24px 0 16px 0' }} />

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
                                    time: record.createdAt || record.date || '2025-04-29 09:00:00', 
                                    result: '提交', 
                                    remark: '退货申请提交' 
                                },
                                record.warehouseAuditTime ? { 
                                    node: '仓库审核', 
                                    operator: record.warehouseAuditor || '仓库主管', 
                                    time: record.warehouseAuditTime, 
                                    result: record.warehouseAuditResult || '审核通过', 
                                    remark: record.warehouseAuditRemark || '库存确认无误' 
                                } : null,
                                record.financeAuditTime ? { 
                                    node: '财务审核', 
                                    operator: record.financeAuditor || '财务主管', 
                                    time: record.financeAuditTime, 
                                    result: record.financeAuditResult || '审核通过', 
                                    remark: record.financeAuditRemark || '费项确认无误' 
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
                ) : null}
            </Form>
        </Modal>
    );
};

// Internal mini-component for cleaner layout
const Statistic = ({ title, value, precision, prefix, valueStyle }) => (
    <div>
        <div style={{ color: 'rgba(0, 0, 0, 0.45)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 24, fontWeight: 'bold', ...valueStyle }}>
            {prefix} {value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision })}
        </div>
    </div>
);

export default ReturnFinanceAuditModal;
