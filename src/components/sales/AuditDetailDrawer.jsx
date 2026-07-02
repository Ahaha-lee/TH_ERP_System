import React, { useState, useEffect } from 'react';
import { 
    Drawer, 
    Table, 
    Tag, 
    Typography, 
    Space, 
    Descriptions, 
    Divider, 
    Row, 
    Col, 
    Button,
    Card,
    Input,
    message
} from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const AuditDetailDrawer = ({ open, record, onClose, onUpdate }) => {
    const [remark, setRemark] = useState('');

    useEffect(() => {
        if (record) {
            setRemark('');
        }
    }, [record?.id]);

    if (!record) return null;

    const isFinanceAudit = record.status === '财务审批' && record.approvalStatus === '审批中';
    const isWarehouseAudit = record.status === '仓库审批' && record.approvalStatus === '审批中';

    const handleAction = (actionType) => {
        if (!onUpdate) return;

        let nextStatus = record.status;
        let nextApprovalStatus = record.approvalStatus;
        let auditResultStr = '-';
        let actionText = '';
        const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

        const updatePayload = { ...record };

        if (isFinanceAudit) {
            if (actionType === 'pass') {
                nextStatus = '仓库审批';
                nextApprovalStatus = '审批中';
                auditResultStr = '-';
                actionText = '财务审批通过';
                updatePayload.financeAuditResult = '通过';
                updatePayload.financeAuditor = '财务审批员';
                updatePayload.financeAuditTime = currentTime;
                updatePayload.financeAuditRemark = remark || '同意发货';
            } else if (actionType === 'return') {
                nextStatus = '财务审批';
                nextApprovalStatus = '审批退回';
                auditResultStr = '退回';
                actionText = '财务审批退回';
                updatePayload.financeAuditResult = '退回';
                updatePayload.financeAuditor = '财务审批员';
                updatePayload.financeAuditTime = currentTime;
                updatePayload.financeAuditRemark = remark || '核对不通过，退回修改';
            } else if (actionType === 'reject') {
                nextStatus = '已拒绝';
                nextApprovalStatus = '审批拒绝';
                auditResultStr = '拒绝';
                actionText = '财务审批拒绝';
                updatePayload.financeAuditResult = '拒绝';
                updatePayload.financeAuditor = '财务审批员';
                updatePayload.financeAuditTime = currentTime;
                updatePayload.financeAuditRemark = remark || '审批拒绝';
            }
        } else if (isWarehouseAudit) {
            if (actionType === 'pass') {
                nextStatus = '备货中';
                nextApprovalStatus = '审批通过';
                auditResultStr = '通过';
                actionText = '仓库审批通过';
                updatePayload.warehouseAuditResult = '通过';
                updatePayload.warehouseAuditor = '仓库审批员';
                updatePayload.warehouseAuditTime = currentTime;
                updatePayload.warehouseAuditRemark = remark || '物位核对无误，同意发货';
            } else if (actionType === 'return') {
                nextStatus = '仓库审批';
                nextApprovalStatus = '审批退回';
                auditResultStr = '退回';
                actionText = '仓库审批退回';
                updatePayload.warehouseAuditResult = '退回';
                updatePayload.warehouseAuditor = '仓库审批员';
                updatePayload.warehouseAuditTime = currentTime;
                updatePayload.warehouseAuditRemark = remark || '库存不足，退回修改';
            } else if (actionType === 'reject') {
                nextStatus = '已拒绝';
                nextApprovalStatus = '审批拒绝';
                auditResultStr = '拒绝';
                actionText = '仓库审批拒绝';
                updatePayload.warehouseAuditResult = '拒绝';
                updatePayload.warehouseAuditor = '仓库审批员';
                updatePayload.warehouseAuditTime = currentTime;
                updatePayload.warehouseAuditRemark = remark || '审批拒绝';
            }
        }

        const finalUpdated = {
            ...updatePayload,
            status: nextStatus,
            approvalStatus: nextApprovalStatus,
            auditResult: auditResultStr,
        };

        onUpdate(finalUpdated);
        message.success(`${actionText}成功`);
        setRemark('');
        onClose();
    };

    // Detect if it's a Delivery Notice (has noticeNo)
    const isDeliveryNotice = !!record.noticeNo;

    // Mock audit logs
    const mockLogs = record.status === '草稿' ? [] : [
        { key: '0', time: record.createdAt || '2025-04-28 09:00:00', operator: record.salesperson || '业务员', action: '创建单据', remark: '系统自动生成' },
        ...(record.status !== '草稿' ? [{ key: '1', time: record.createdAt || '2025-04-28 10:00:00', operator: record.salesperson || '业务员', action: '提交审批', remark: '申请发货' }] : []),
        ...(record.financeAuditResult ? [
            { key: '2', time: record.financeAuditTime || '2025-04-28 14:00:00', operator: record.financeAuditor || '财务主管', action: `财务审核${record.financeAuditResult}`, remark: record.financeAuditRemark || '核实无误' }
        ] : []),
        ...(record.warehouseAuditResult ? [
            { key: '3', time: record.warehouseAuditTime || '2025-04-29 09:30:00', operator: record.warehouseAuditor || '仓库主管', action: `仓库审核${record.warehouseAuditResult}`, remark: record.warehouseAuditRemark || '物位核对无误' }
        ] : []),
    ];

    const logColumns = [
        { title: '审核时间', dataIndex: 'time', key: 'time', width: 180 },
        { title: '审核人', dataIndex: 'operator', key: 'operator', width: 120 },
        { 
            title: '审核动作', 
            dataIndex: 'action', 
            key: 'action',
            render: (action) => {
                if (action === '通过' || action.endsWith('通过')) {
                    return <Text>{action}</Text>;
                }
                return (
                    <Tag color={action.includes('拒绝') ? 'red' : 'blue'}>
                        {action}
                    </Tag>
                );
            }
        },
        { title: '审核建议', dataIndex: 'remark', key: 'remark' },
    ];

    // Delivery Notice Specific Content
    const renderDeliveryNoticeContent = () => {
        const items = record.items || [];
        const productTotal = record.totalAmount || 0;
        const discountRate = 5; 
        const discountedProductTotal = productTotal * (1 - discountRate / 100);
        const otherFee = record.otherFee || 0;
        const orderTotal = discountedProductTotal + otherFee;

        const currentShipmentAmount = items.reduce((sum, item) => {
            const discountedUnitPrice = (item.unitPrice || 0) * (1 - discountRate / 100);
            return sum + ((item.currentQty || 0) * discountedUnitPrice);
        }, 0);

        const columns = [
            { title: '销售订单号', dataIndex: 'sourceOrderNo', width: 140, render: (v, rec) => v || record?.orderNo || '-' },
            { 
                title: '客户名称（编码/名称）',   
                dataIndex: 'customerName', 
                width: 180,
                render: (v, rec) => {
                    const name = v || record?.customerName || '-';
                    const code = rec.customerCode || record?.customerCode || 'CUST-001';
                    return `${code}/${name}`;
                }
            },
            { title: '产品编码', dataIndex: 'productCode', width: 120 },
            { title: '产品名称', dataIndex: 'productName', width: 150 },
            { title: '规格', dataIndex: 'spec', width: 100 },
            { title: '库存数量', dataIndex: 'stock', width: 95, align: 'right', render: (v) => <Text type="secondary">{v !== undefined ? v : 120}</Text> },
            { title: '可用数量', dataIndex: 'availableQty', width: 95, align: 'right', render: (v, rec) => <span className="text-emerald-600 font-semibold">{v !== undefined ? v : Math.floor((rec.stock !== undefined ? rec.stock : 120) * 0.85)}</span> },
            { title: '占用数量', dataIndex: 'allocatedQty', width: 95, align: 'right', render: (v, rec) => <span className="text-amber-600">{v !== undefined ? v : Math.floor((rec.stock !== undefined ? rec.stock : 120) * 0.15)}</span> },
            { 
                title: '在制数量', 
                dataIndex: 'wipQty', 
                width: 95, 
                align: 'right',
                render: (v, rec) => {
                    const val = rec.wipQty ?? (rec.property?.includes('定制') ? 15 : 35);
                    return <span className="font-mono text-gray-500">{val}</span>;
                }
            },
            { title: '订单数量', dataIndex: 'orderQty', width: 90, align: 'right' },
            { title: '已发货数量', dataIndex: 'shippedQty', width: 100, align: 'right' },
            { title: '本次发货数量', dataIndex: 'currentQty', width: 110, align: 'right', render: (v) => <Text strong type="danger">{v}</Text> },
        ];

        // Removed warehouse columns as requested
        const renderApprovalCard = () => {
            if (isFinanceAudit || isWarehouseAudit) {
                return (
                    <Card 
                        size="small" 
                        title={isFinanceAudit ? "💼 财务审批处理" : "📦 仓库审批处理"} 
                        className="mb-4 bg-amber-50/50 border border-amber-200 shadow-sm"
                    >
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-500 mb-1">审批意见 / 原因：</div>
                                <Input.TextArea 
                                    placeholder="请输入审批意见、退回原因或拒绝原因" 
                                    rows={2} 
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button 
                                    type="primary" 
                                    className="bg-emerald-600 hover:bg-emerald-500 border-none text-white"
                                    onClick={() => handleAction('pass')}
                                >
                                    审批通过
                                </Button>
                                <Button 
                                    danger 
                                    onClick={() => handleAction('return')}
                                >
                                    审批退回
                                </Button>
                                <Button 
                                    danger 
                                    type="primary"
                                    onClick={() => handleAction('reject')}
                                >
                                    审批拒绝
                                </Button>
                            </div>
                        </div>
                    </Card>
                );
            }
            return null;
        };

        return (
            <div className="space-y-6">
                {renderApprovalCard()}
                <Descriptions bordered size="small" column={2} styles={{ label: { width: 120 } }}>
                    <Descriptions.Item label="单据号">{record.noticeNo}</Descriptions.Item>
                    <Descriptions.Item label="状态">
                        <Tag color={
                            record.status === '草稿' ? 'default' :
                            record.status === '财务审批' ? 'blue' :
                            record.status === '仓库审批' ? 'cyan' :
                            record.status === '已拒绝' ? 'red' :
                            record.status === '备货中' ? 'orange' :
                            record.status === '已完成' ? 'green' : 'default'
                        }>{record.status}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="客户名称">{record.customerName}</Descriptions.Item>
                    <Descriptions.Item label="销售订单号">{record.orderNo}</Descriptions.Item>
                    <Descriptions.Item label="结算方式">{record.settlementMethod}</Descriptions.Item>
                    <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                    <Descriptions.Item label="备注" span={2}>{record.remark || '-'}</Descriptions.Item>
                </Descriptions>

                <div>
                    <Divider titlePlacement="left" style={{ margin: '16px 0' }}>发货明细</Divider>
                    <Table 
                        dataSource={items} 
                        columns={columns} 
                        pagination={false} 
                        size="small" 
                        bordered
                        rowKey="id"
                        scroll={{ x: columns.length > 6 ? 1000 : undefined }}
                    />
                </div>

                <Row gutter={24}>
                    <Col span={12}>
                        <div className="bg-gray-50 p-4 rounded h-full">
                            <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>附件及凭证</Title>
                            <Space orientation="vertical" className="w-full">
                                {record.attachments && record.attachments.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 p-2 bg-white border rounded">
                                        <PaperClipOutlined className="text-gray-400" />
                                        <Text ellipsis style={{ maxWidth: 200 }}>{file.name}</Text>
                                        <Button type="link" size="small">查看</Button>
                                    </div>
                                ))}
                                {(!record.attachments || record.attachments.length === 0) && <Text type="secondary">无附件</Text>}
                                
                                {record.paymentImages && record.paymentImages.length > 0 && (
                                    <div className="mt-4">
                                        <Text strong>付款凭证:</Text>
                                        <Space size="small" wrap className="mt-2">
                                            {record.paymentImages.map((img, i) => (
                                                <img key={i} src={img.url} alt="voucher" className="w-16 h-16 object-cover border rounded" />
                                            ))}
                                        </Space>
                                    </div>
                                )}
                            </Space>
                        </div>
                    </Col>
                    <Col span={12}>
                        <div className="bg-gray-50 p-4 rounded text-right space-y-1">
                            <Title level={5} style={{ margin: '0 0 10px 0', textAlign: 'left' }}>费用汇总</Title>
                            <div>订单总额: <Text strong>¥{(productTotal).toFixed(2)}</Text></div>
                            <div>折后金额: <Text strong type="danger">¥{discountedProductTotal.toFixed(2)}</Text></div>
                            <div>其他费用: <Text strong>¥{otherFee.toFixed(2)}</Text></div>
                            <Divider style={{ margin: '8px 0' }} />
                            <div className="text-base font-bold">
                                订单总额: ¥{orderTotal.toFixed(2)}
                            </div>
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="text-blue-600 font-bold">
                                    本次发货产品金额: ¥{(currentShipmentAmount || 0).toFixed(2)}
                                </div>
                                <Text type="secondary" style={{ fontSize: '12px' }}>(折后金额汇总)</Text>
                            </div>
                        </div>
                    </Col>
                </Row>

                {(record.financeAuditResult || record.warehouseAuditResult) && (
                    <div className="space-y-4">
                        <Divider titlePlacement="left">审批结果</Divider>
                        {record.financeAuditResult && (
                            <div className="bg-blue-50 p-4 rounded border border-blue-100">
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <div className="text-xs text-gray-500 mb-1">财务审批</div>
                                        {record.financeAuditResult === '通过' ? (
                                            <Text strong className="text-green-600">{record.financeAuditResult}</Text>
                                        ) : (
                                            <Tag color="red">{record.financeAuditResult}</Tag>
                                        )}
                                        <div className="mt-2 text-xs text-gray-400">{record.financeAuditor} | {record.financeAuditTime}</div>
                                    </Col>
                                    <Col span={16}>
                                        <div className="text-xs text-gray-500 mb-1">财务建议</div>
                                        <div className="text-sm">{record.financeAuditRemark || '-'}</div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                        {record.warehouseAuditResult && (
                            <div className="bg-green-50 p-4 rounded border border-green-100">
                                <Row gutter={24}>
                                    <Col span={8}>
                                        <div className="text-xs text-gray-500 mb-1">仓库审批</div>
                                        {record.warehouseAuditResult === '通过' ? (
                                            <Text strong className="text-green-600">{record.warehouseAuditResult}</Text>
                                        ) : (
                                            <Tag color="red">{record.warehouseAuditResult}</Tag>
                                        )}
                                        <div className="mt-2 text-xs text-gray-400">{record.warehouseAuditor} | {record.warehouseAuditTime}</div>
                                    </Col>
                                    <Col span={16}>
                                        <div className="text-xs text-gray-500 mb-1">仓库建议</div>
                                        <div className="text-sm">{record.warehouseAuditRemark || '-'}</div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </div>
                )}

                <section>
                    <Divider titlePlacement="left">审批流程记录</Divider>
                    <Table
                        dataSource={mockLogs}
                        columns={logColumns}
                        pagination={false}
                        size="small"
                        bordered
                        rowKey="key"
                    />
                </section>
            </div>
        );
    };

    return (
        <Drawer forceRender
            title={`${isDeliveryNotice ? '发货通知单' : ''}审批详情 - ${record.noticeNo || record.orderNo || ''}`}
            placement="right"
            size={isDeliveryNotice ? "large" : "default"}
            onClose={onClose}
            open={open}
            extra={<Button onClick={onClose}>关闭</Button>}
        >
            {isDeliveryNotice ? renderDeliveryNoticeContent() : (
                <Space orientation="vertical" size="large" style={{ width: '100%' }}>
                    <Descriptions bordered size="small" column={2}>
                        <Descriptions.Item label="单据号">{record.orderNo || record.quotationNo}</Descriptions.Item>
                        <Descriptions.Item label="状态">{record.status}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="订单日期" span={(record.isCollectDeposit || record.isDeposit) ? 1 : 2}>{record.orderDate || record.quotationDate || '-'}</Descriptions.Item>
                        {(record.isCollectDeposit || record.isDeposit) && (
                            <Descriptions.Item label="定金应收">
                                {formatCurrency(
                                    record.deposit || 
                                    record.depositAmount || 
                                    (record.totalAmount * (record.isDeposit ? (record.depositRate || 0) : (record.depositRatio || 0) / 100))
                                )}
                            </Descriptions.Item>
                        )}
                        <Descriptions.Item label="订单金额" span={2}>
                            <Text type="danger" strong>{formatCurrency(record.totalAmount)}</Text>
                        </Descriptions.Item>
                    </Descriptions>
                    <section>
                        <Divider titlePlacement="left">审批流程记录</Divider>
                        <Table
                            dataSource={mockLogs}
                            columns={logColumns}
                            pagination={false}
                            size="small"
                            bordered
                            rowKey="key"
                        />
                    </section>
                </Space>
            )}
        </Drawer>
    );
};

export default AuditDetailDrawer;
