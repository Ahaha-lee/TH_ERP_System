
import React, { useState } from 'react';
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
    CheckCircleOutlined
} from '@ant-design/icons';
import { useMockData, mockData } from '../../../mock/data';
import ExchangeOrderFormModal from '../../../components/sales/afterSales/ExchangeOrderFormModal';
import ExchangeOrderDetailDrawer from '../../../components/sales/afterSales/ExchangeOrderDetailDrawer';
import AuditModal from '../../../components/sales/AuditModal';
import InboundProgressModal from '../../../components/sales/afterSales/InboundProgressModal';
import OutboundProgressModal from '../../../components/sales/afterSales/OutboundProgressModal';
import ExchangeWarehouseAuditModal from '../../../components/sales/afterSales/ExchangeWarehouseAuditModal';
import WarehouseAuditModal from '../../../components/sales/WarehouseAuditModal';

const { Link } = Typography;

const ExchangeOrderList = () => {
    const [form] = Form.useForm();
    const [allData] = useMockData('exchanges');
    const [displayData, setDisplayData] = useState(null);
    const data = displayData || allData;
    const [loading, setLoading] = useState(false);
    
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [viewAuditModal, setViewAuditModal] = useState({ open: false, record: null });
    const [auditModal, setAuditModal] = useState({ open: false, record: null });
    const [warehouseAuditModal, setWarehouseAuditModal] = useState({ open: false, record: null });
    const [inboundModal, setInboundModal] = useState({ open: false, record: null });
    const [outboundModal, setOutboundModal] = useState({ open: false, record: null });

    const handleSearch = (values) => {
        setLoading(true);
        setTimeout(() => {
            let filtered = [...allData];
            if (values.exchangeNo) filtered = filtered.filter(item => item.exchangeNo.includes(values.exchangeNo));
            setDisplayData(filtered);
            setLoading(false);
        }, 500);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该换货单吗？',
            onOk: () => {
                mockData.remove('exchanges', record.id);
                message.success('删除成功');
            }
        });
    };

    const columns = [
        { title: '序号', width: 60, render: (_, __, i) => i + 1 },
        { 
            title: '换货单号', 
            dataIndex: 'exchangeNo', 
            render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, record })}>{text}</Link> 
        },
        { 
            title: '审批详情', 
            width: 120,
            render: (_, record) => <Link onClick={() => setViewAuditModal({ open: true, record })}>查看审批详情</Link> 
        },
        { 
            title: '原销售订单号', 
            dataIndex: 'orderNo', 
            render: (text) => <Link>{text}</Link> 
        },
        { title: '客户名称', dataIndex: 'customerName' },
        { title: '订单日期', dataIndex: 'orderDate' },
        { title: '业务员', dataIndex: 'salesperson' },
        { 
            title: '审批结果', 
            dataIndex: 'auditResult',
            width: 100,
            render: (res) => {
                if (res === '审批拒绝') return <Tag color="red">审批拒绝</Tag>;
                return null;
            }
        },
        { 
            title: '换货订单状态', 
            dataIndex: 'status',
            render: (status) => {
                const colors = { '草稿': 'default', '待发货': 'orange', '已发货': 'blue', '已完成': 'green' };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        },
        { 
            title: '退货状态', 
            dataIndex: 'returnStatus',
            render: (status) => {
                const colors = { '待收货': 'orange', '已收货': 'green' };
                return <Tag color={colors[status] || 'default'}>{status || '-'}</Tag>;
            }
        },
        { 
            title: '操作', 
            fixed: 'right', 
            width: 180,
            render: (_, record) => {
                const { status, auditResult } = record;
                const isRejected = auditResult === '审批拒绝' && status === '待发货';
                const isPendingNoAudit = !auditResult && status === '待发货';
                
                return (
                    <Space size="small">
                        {status === '草稿' && (
                            <>
                                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
                            </>
                        )}
                        {isPendingNoAudit && (
                            <>
                                <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => setWarehouseAuditModal({ open: true, record })}>仓库审批</Button>
                                <Button type="link" size="small" onClick={() => setInboundModal({ open: true, record })}>查看入库进度</Button>
                                <Button type="link" size="small" onClick={() => setOutboundModal({ open: true, record })}>查看出库进度</Button>
                            </>
                        )}
                        {isRejected && (
                            <>
                                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => setWarehouseAuditModal({ open: true, record })}>仓库审批</Button>
                            </>
                        )}
                        {status === '已发货' && (
                            <>
                                <Button type="link" size="small" onClick={() => setInboundModal({ open: true, record })}>查看入库进度</Button>
                                <Button type="link" size="small" onClick={() => setOutboundModal({ open: true, record })}>查看出库进度</Button>
                            </>
                        )}
                        {status === '已完成' && (
                            <>
                                <Button type="link" size="small" onClick={() => setInboundModal({ open: true, record })}>查看入库进度</Button>
                                <Button type="link" size="small" onClick={() => setOutboundModal({ open: true, record })}>查看出库进度</Button>
                            </>
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
                    <Col span={6}><Form.Item name="exchangeNo" label="换货单号"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="orderNo" label="原销售单号"><Input placeholder="原单号" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="customerName" label="客户名称"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="status" label="订单状态">
                            <Select placeholder="选择状态" allowClear>
                                {['草稿', '待发货', '已发货', '已完成'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Form.Item name="returnStatus" label="退货状态">
                            <Select placeholder="选择状态" allowClear>
                                {['待收货', '已收货'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={6}>
                        <Space>
                            <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                            <Button icon={<ReloadOutlined />} onClick={() => form.resetFields()}>重置</Button>
                        </Space>
                    </Col>
                </Row>
            </Form>

            <div className="flex justify-end mb-4">
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, record: null })}>新增换货单</Button>
            </div>

            <Table 
                columns={columns} 
                dataSource={data} 
                rowKey="id" 
                loading={loading}
                pagination={{ showTotal: (total) => `共 ${total} 条` }}
                scroll={{ x: 1500 }}
            />

            <ExchangeOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    mockData.upsert('exchanges', newData);
                    setFormModal({ open: false, record: null });
                }}
            />

            <ExchangeOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />

            <ExchangeWarehouseAuditModal 
                open={viewAuditModal.open} 
                record={viewAuditModal.record} 
                onCancel={() => setViewAuditModal({ open: false, record: null })} 
                readonly={true}
            />

            <AuditModal 
                open={auditModal.open} 
                record={auditModal.record} 
                onCancel={() => setAuditModal({ open: false, record: null })}
                onSuccess={(audited) => {
                    mockData.upsert('exchanges', { 
                        ...audited, 
                        status: audited.auditResult === '审批通过' ? '待发货' : audited.status, 
                        returnStatus: audited.auditResult === '审批通过' ? '待收货' : audited.returnStatus 
                    });
                    setAuditModal({ open: false, record: null });
                }}
            />

            <InboundProgressModal 
                open={inboundModal.open} 
                record={inboundModal.record} 
                onCancel={() => setInboundModal({ open: false, record: null })} 
            />

            <OutboundProgressModal 
                open={outboundModal.open} 
                record={outboundModal.record} 
                onCancel={() => setOutboundModal({ open: false, record: null })} 
            />

            <ExchangeWarehouseAuditModal 
                open={warehouseAuditModal.open}
                record={warehouseAuditModal.record}
                onCancel={() => setWarehouseAuditModal({ open: false, record: null })}
                onSuccess={(audited) => {
                    mockData.upsert('exchanges', { 
                        ...audited, 
                        status: audited.warehouseAuditResult === '通过' ? '已审核' : audited.status
                    });
                    setWarehouseAuditModal({ open: false, record: null });
                }}
            />
        </div>
    );
};

export default ExchangeOrderList;
