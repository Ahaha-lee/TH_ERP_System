
import React, { useState, useEffect } from 'react';
import { 
    Form, 
    Row, 
    Col, 
    Input, 
    Button, 
    Select, 
    DatePicker, 
    Table, 
    Space, 
    Tag, 
    Typography, 
    Modal, 
    message 
} from 'antd';
import { 
    SearchOutlined, 
    ReloadOutlined, 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined, 
    CheckCircleOutlined,
    CloseCircleOutlined
} from '@ant-design/icons';
import { useMockData, mockData } from '../../../mock/data';
import ReturnOrderFormModal from '../../../components/sales/afterSales/ReturnOrderFormModal';
import ReturnOrderAuditModal from '../../../components/sales/afterSales/ReturnAuditModal';
import ReturnFinanceAuditModal from '../../../components/sales/afterSales/ReturnFinanceAuditModal';
import ReturnOrderDetailDrawer from '../../../components/sales/afterSales/ReturnOrderDetailDrawer';
import AuditModal from '../../../components/sales/AuditModal';
import InboundProgressModal from '../../../components/sales/afterSales/InboundProgressModal';

const { Text, Link } = Typography;

const ReturnOrderList = () => {
    const [form] = Form.useForm();
    const [allData] = useMockData('returns');
    const [displayData, setDisplayData] = useState(null);
    const data = displayData || allData;
    const [loading, setLoading] = useState(false);
    
    // Status Modals
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [viewAuditModal, setViewAuditModal] = useState({ open: false, type: null, record: null });

    const handleViewAudit = (record) => {
        // Determine which audit modal to show based on status or existing audit fields
        const isFinance = record.financeAuditResult || record.status === '待财务审批' || record.status === '已完成';
        setViewAuditModal({
            open: true,
            type: isFinance ? 'finance' : 'warehouse',
            record
        });
    };
    const [auditModal, setAuditModal] = useState({ open: false, record: null, type: 'warehouse' });
    const [inboundModal, setInboundModal] = useState({ open: false, record: null });

    const handleSearch = (values) => {
        setLoading(true);
        setTimeout(() => {
            let filtered = [...allData];
            if (values.returnNo) filtered = filtered.filter(item => item.returnNo.includes(values.returnNo));
            if (values.customerName) filtered = filtered.filter(item => item.customerName.includes(values.customerName));
            setDisplayData(filtered);
            setLoading(false);
        }, 500);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该退货单吗？该操作不可恢复。',
            onOk: () => {
                mockData.remove('returns', record.id);
                message.success('删除成功');
            }
        });
    };

    const handleClose = (record) => {
        Modal.confirm({
            title: '确认关闭',
            content: '确定要手动关闭该退货单吗？',
            onOk: () => {
                mockData.upsert('returns', { ...record, status: '已关闭' });
                message.success('退货单已关闭');
            }
        });
    };

    const columns = [
        { title: '序号', dataIndex: 'key', width: 60, render: (_, __, i) => i + 1 },
        { 
            title: '售后订单号', 
            dataIndex: 'returnNo', 
            render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, record })}>{text}</Link> 
        },
        { title: '售后类型', dataIndex: 'type', render: () => '退货' },
        { 
            title: '审批详情', 
            render: (_, record) => <Link onClick={() => handleViewAudit(record)}>查看审批详情</Link> 
        },
        { 
            title: '原销售订单号', 
            dataIndex: 'sourceOrderNo', 
            render: (text) => <Link>{text}</Link> 
        },
        { title: '客户名称', dataIndex: 'customerName' },
        { title: '订单日期', dataIndex: 'orderDate' },
        { title: '退货金额', dataIndex: 'returnAmount', align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        { 
            title: '退货产品信息', 
            dataIndex: 'items', 
            render: (items) => (items || []).map(item => `${item.productName}/${item.returnQuantity}`).join(', ') 
        },
        { title: '业务员', dataIndex: 'salesperson' },
        { 
            title: '收货进度', 
            render: (_, record) => (record.items || []).map(item => `【${item.productName}】已收0/${item.returnQuantity}`).join(', ') 
        },
        { 
            title: '审批结果', 
            dataIndex: 'auditResult',
            render: (res) => res ? <Tag color={res === '审批通过' ? 'green' : 'red'}>{res}</Tag> : null
        },
        { 
            title: '订单状态', 
            dataIndex: 'status',
            render: (status) => {
                const colors = { '草稿': 'default', '待收货': 'orange', '待财务审批': 'blue', '已完成': 'green', '已关闭': 'red' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        { 
            title: '操作', 
            fixed: 'right', 
            width: 220,
            render: (_, record) => {
                const { status, auditResult } = record;
                return (
                    <Space size="small">
                        {status === '草稿' && (
                            <>
                                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                            </>
                        )}
                        {status === '待收货' && (
                            <>
                                {auditResult && <Button type="link" size="small" onClick={() => setFormModal({ open: true, record })}>编辑</Button>}
                                {record.returnNo !== 'RT20250429003' && (
                                    <Button type="link" size="small" onClick={() => setAuditModal({ open: true, record, type: 'warehouse' })}>仓库审批</Button>
                                )}
                                {auditResult && <Button type="link" size="small" onClick={() => handleClose(record)}>手动关闭</Button>}
                            </>
                        )}
                        {status === '待财务审批' && (
                            <>
                                {record.returnNo === 'RT20250429005' && (
                                    <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                )}
                                {record.returnNo !== 'RT20250429005' && (
                                    <Button type="link" size="small" onClick={() => setAuditModal({ open: true, record, type: 'finance' })}>财务审批</Button>
                                )}
                                <Button type="link" size="small" onClick={() => setInboundModal({ open: true, record })}>查看入库进度</Button>
                                {auditResult && <Button type="link" size="small" onClick={() => handleClose(record)}>手动关闭</Button>}
                            </>
                        )}
                        {(status === '已完成' || status === '已关闭') && (
                            <Button type="link" size="small" onClick={() => setInboundModal({ open: true, record })}>查看入库进度</Button>
                        )}
                    </Space>
                );
            }
        },
    ];

    return (
        <div>
            <Form form={form} onFinish={handleSearch} className="mb-4 bg-gray-50 p-4 rounded">
                <Row gutter={16}>
                    <Col span={6}><Form.Item name="returnNo" label="退货单号"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="sourceOrderNo" label="销售单号"><Input placeholder="原单号" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="customerName" label="客户名称"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="status" label="订单状态">
                            <Select placeholder="选择状态" allowClear>
                                {['草稿', '待收货', '待财务审批', '已完成', '已关闭'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}><Form.Item name="salesperson" label="业务员"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                            <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>重置</Button>
                        </Space>
                    </Col>
                </Row>
            </Form>

            <div className="flex justify-end mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, record: null })}>新增退货单</Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                loading={loading}
                pagination={{ showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
                scroll={{ x: 1800 }}
            />

            <ReturnOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    mockData.upsert('returns', newData);
                    setFormModal({ open: false, record: null });
                }}
            />

            <ReturnOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />

            <ReturnFinanceAuditModal 
                open={viewAuditModal.open && viewAuditModal.type === 'finance'} 
                record={viewAuditModal.record} 
                onCancel={() => setViewAuditModal({ open: false, type: null, record: null })}
                readonly={true}
            />

            <ReturnOrderAuditModal 
                open={viewAuditModal.open && viewAuditModal.type === 'warehouse'} 
                record={viewAuditModal.record} 
                onCancel={() => setViewAuditModal({ open: false, type: null, record: null })}
                readonly={true}
            />

            {auditModal.type === 'warehouse' ? (
                <ReturnOrderAuditModal 
                    open={auditModal.open} 
                    record={auditModal.record} 
                    onCancel={() => setAuditModal({ ...auditModal, open: false, record: null })}
                    onSuccess={(auditedData) => {
                        let nextStatus = auditedData.status;
                        let nextResult = auditedData.auditResult;
                        if (auditedData.auditResult === '审批通过') {
                            if (auditedData.status === '待收货') {
                                nextStatus = '待财务审批';
                                nextResult = null;
                            }
                        }
                        mockData.upsert('returns', { ...auditedData, status: nextStatus, auditResult: nextResult });
                        setAuditModal({ ...auditModal, open: false, record: null });
                    }}
                />
            ) : (
                <ReturnFinanceAuditModal
                    open={auditModal.open}
                    record={auditModal.record}
                    onCancel={() => setAuditModal({ ...auditModal, open: false, record: null })}
                    onSuccess={(auditedData) => {
                        let nextStatus = auditedData.status;
                        let nextResult = auditedData.auditResult;
                        if (auditedData.auditResult === '审批通过') {
                            nextStatus = '已完成';
                            nextResult = null;
                        }
                        mockData.upsert('returns', { ...auditedData, status: nextStatus, auditResult: nextResult });
                        setAuditModal({ ...auditModal, open: false, record: null });
                    }}
                />
            )}

            <InboundProgressModal 
                open={inboundModal.open} 
                record={inboundModal.record} 
                onCancel={() => setInboundModal({ open: false, record: null })} 
            />
        </div>
    );
};

export default ReturnOrderList;
