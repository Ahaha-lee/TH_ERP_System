
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
    message,
    Progress,
    Card
} from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { 
    SearchOutlined, 
    ReloadOutlined, 
    PlusOutlined, 
    EditOutlined, 
    DeleteOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { useMockData, mockData } from '../../mock/data';
import TrusteeOrderFormModal from '../../components/sales/trustee/TrusteeOrderFormModal';
import TrusteeOrderDetailDrawer from '../../components/sales/trustee/TrusteeOrderDetailDrawer';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import TrusteeAuditModal from '../../components/sales/trustee/TrusteeAuditModal';
import TrusteeMaterialReceiptModal from '../../components/sales/trustee/TrusteeMaterialReceiptModal';
import TrusteeProductionProgressModal from '../../components/sales/trustee/TrusteeProductionProgressModal';
import DeliveryProgressModal from '../../components/sales/DeliveryProgressModal';
import DeliveryNoticeFormModal from '../../components/sales/DeliveryNoticeFormModal';
import TrusteeClaimFlowModal from '../../components/sales/trustee/TrusteeClaimFlowModal';

const { Link } = Typography;

const ConsignmentOrderList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [allData] = useMockData('consignmentOrders');
    const filteredData = React.useMemo(() => allData.filter(i => i.status !== '确认发运'), [allData]);
    const [displayData, setDisplayData] = useState(null);
    const data = displayData || filteredData;
    const [loading, setLoading] = useState(false);
    
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [auditDrawer, setAuditDrawer] = useState({ open: false, record: null });
    const [auditModal, setAuditModal] = useState({ open: false, record: null });
    const [materialModal, setMaterialModal] = useState({ open: false, record: null });
    const [productionModal, setProductionModal] = useState({ open: false, record: null });
    const [deliveryProgressModal, setDeliveryProgressModal] = useState({ open: false, orderId: null });
    const [deliveryNoticeModal, setDeliveryNoticeModal] = useState({ open: false, record: null });
    const [claimFlowModal, setClaimFlowModal] = useState({ open: false, record: null });

    const handleSearch = (values) => {
        setLoading(true);
        setTimeout(() => {
            let filtered = allData.filter(i => i.status !== '确认发运');
            if (values.orderNo) filtered = filtered.filter(item => item.orderNo.includes(values.orderNo));
            if (values.customerName) filtered = filtered.filter(item => item.customerName.includes(values.customerName));
            if (values.status) filtered = filtered.filter(item => item.status === values.status);
            setDisplayData(filtered);
            setLoading(false);
        }, 500);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该受托加工单吗？',
            onOk: () => {
                mockData.remove('consignmentOrders', record.id);
                message.success('删除成功');
            }
        });
    };

    const columns = [
        { title: '序号', width: 60, render: (_, __, i) => i + 1 },
        { 
            title: '受托加工订单号', 
            dataIndex: 'orderNo', 
            render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, record })}>{text}</Link> 
        },
        { title: '来源报价单号', dataIndex: 'quotationNo', render: (t) => t || '-' },
        { title: '客户名称', dataIndex: 'customerName' },
        { title: '订单日期', dataIndex: 'orderDate' },
        { title: '期望发货日期', dataIndex: 'expectDeliveryDate' },
        { title: '加工费总额', dataIndex: 'totalAmount', align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        { 
            title: '加工进度', 
            dataIndex: 'processingProgress', 
            render: (p) => <Progress percent={p} size="small" /> 
        },
        { title: '发货进度', dataIndex: 'deliveryProgressText' },
        { title: '业务员', dataIndex: 'salesperson' },
        { 
            title: '审核结果', 
            dataIndex: 'auditResult',
            render: (res, record) => {
                let text = res;
                if (!text && record.status !== '草稿' && record.status !== '待审核') {
                    text = '审核通过';
                }
                return text ? <Tag color={text === '审核通过' ? 'green' : 'red'}>{text}</Tag> : <span>-</span>;
            }
        },
        {
            title: '审核详情',
            width: 120,
            render: (_, record) => <Link onClick={() => setAuditDrawer({ open: true, record })}>查看审核详情</Link>
        },
        { 
            title: '来料状态', 
            dataIndex: 'receiptStatus',
            render: (status) => <Tag color={status === '已收来料' ? 'green' : 'orange'}>{status}</Tag>
        },
        { 
            title: '订单状态', 
            dataIndex: 'status',
            render: (status) => {
                let displayStatus = status === '完成' ? '已完成' : status;
                if (displayStatus === '待发货') displayStatus = '发货中';
                const colors = { 
                    '草稿': 'default', 
                    '待审核': 'orange',
                    '审核通过': 'blue', 
                    '已审核': 'blue', 
                    '待收货': 'purple',
                    '生产中': 'orange', 
                    '已完工': 'cyan', 
                    '发货中': 'purple', 
                    '已完成': 'green', 
                    '已关闭': 'red' 
                };
                return <Tag color={colors[displayStatus] || 'blue'}>{displayStatus}</Tag>;
            }
        },
        { 
            title: '收款状态', 
            dataIndex: 'paymentStatus',
            render: (status) => {
                let displayStatus = status === '未结清' ? '未收款' : status;
                if (displayStatus === '完成') displayStatus = '已完成';
                let color = 'default';
                if (displayStatus === '已结清' || displayStatus === '已完成') color = 'green';
                if (displayStatus === '部分结清') color = 'blue';
                if (displayStatus === '未收款') color = 'red';
                return <Tag color={color}>{displayStatus || '未收款'}</Tag>;
            }
        },
        { 
            title: '操作', 
            fixed: 'right', 
            width: 280,
            render: (_, record) => {
                let { status, receiptStatus, paymentStatus } = record;
                if (status === '完成') status = '已完成';
                return (
                    <Space size="small">
                        {status === '草稿' && (
                            <>
                                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                                <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                            </>
                        )}
                        {status === '待审核' && (
                            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                        )}
                        {(status === '已审核' || status === '审核通过' || status === '待收货') && receiptStatus === '待收来料' && (
                            <Button type="link" size="small" onClick={() => {
                                const inboundNo = `CI-${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                                mockData.upsert('consignmentOrders', { ...record, receiptStatus: '已收来料', status: '生产中' });
                                
                                // Also create the inbound order in mockData
                                mockData.upsert('inboundOrders', {
                                    id: Date.now(),
                                    orderNo: inboundNo,
                                    relOrderNo: record.orderNo,
                                    type: '受托入库',
                                    warehouseName: '主仓库',
                                    status: '待审核',
                                    inboundDate: dayjs().format('YYYY-MM-DD'),
                                    partnerName: record.customerName,
                                    auditResult: '-',
                                    operator: '管理员',
                                    items: record.items?.map(item => ({
                                        ...item,
                                        quantity: item.quantity,
                                        orderQty: item.quantity
                                    })) || []
                                });

                                message.success({
                                    content: (
                                        <span>
                                            已生成受托入库单【
                                            <span 
                                                className="ant-typography" 
                                                style={{ color: '#1890ff', cursor: 'pointer', textDecoration: 'underline' }}
                                                onClick={() => navigate('/inbound', { state: { searchOrderNo: inboundNo } })}
                                            >
                                                {inboundNo}
                                            </span>
                                            】
                                        </span>
                                    ),
                                    duration: 5
                                });
                            }}>生成受托入库单</Button>
                        )}
                        {(status === '生产中' || status === '已完工') && (
                            <>
                                <Button type="link" size="small" onClick={() => setMaterialModal({ open: true, record })}>查看来料进度</Button>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                {status === '已完工' && (
                                    <Button type="link" size="small" onClick={() => setDeliveryNoticeModal({ open: true, record })}>发起发货通知</Button>
                                )}
                            </>
                        )}
                        {status === '待发货' && (
                            <>
                                <Button type="link" size="small" onClick={() => setMaterialModal({ open: true, record })}>查看来料进度</Button>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryProgressModal({ open: true, orderId: record.id })}>查看发货进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryNoticeModal({ open: true, record })}>发起发货通知</Button>
                            </>
                        )}
                        {status === '已完成' && (
                            <>
                                <Button type="link" size="small" onClick={() => setMaterialModal({ open: true, record })}>查看来料进度</Button>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryProgressModal({ open: true, orderId: record.id })}>查看发货进度</Button>
                                <Button type="link" size="small" onClick={() => setClaimFlowModal({ open: true, record })}>认领流水</Button>
                            </>
                        )}
                    </Space>
                );
            }
        },
    ];

    return (
        <div className="p-4">
            <Card>
                <Form form={form} onFinish={handleSearch} className="mb-4 bg-gray-50 p-4 rounded shadow-sm">
                    <Row gutter={16}>
                        <Col span={6}><Form.Item name="orderNo" label="受托单号"><Input placeholder="模糊匹配" /></Form.Item></Col>
                        <Col span={6}><Form.Item name="customerName" label="客户名称"><Input placeholder="模糊匹配" /></Form.Item></Col>
                        <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                        <Col span={6}>
                            <Form.Item name="status" label="订单状态">
                                <Select placeholder="选择状态" allowClear>
                                    {['草稿', '待审核', '已审核', '生产中', '已完工', '待发货', '已完成'].map(s => (
                                        <Select.Option key={s} value={s}>{s === '待发货' ? '发货中' : s}</Select.Option>
                                    ))}
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
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, record: null })}>新增受托加工单</Button>
                </div>

                <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 2200 }} />
            </Card>

            <TrusteeOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    mockData.upsert('consignmentOrders', newData);
                    setFormModal({ open: false, record: null });
                }}
            />

            <TrusteeOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />

            <AuditDetailDrawer open={auditDrawer.open} record={auditDrawer.record} onClose={() => setAuditDrawer({ open: false, record: null })} />

            <TrusteeAuditModal 
                open={auditModal.open} 
                record={auditModal.record} 
                onCancel={() => setAuditModal({ open: false, record: null })}
                onSuccess={(audited) => {
                    mockData.upsert('consignmentOrders', { ...audited, status: audited.auditResult === '审核通过' ? '已审核' : audited.status });
                    setAuditModal({ open: false, record: null });
                }}
            />

            <TrusteeMaterialReceiptModal 
                open={materialModal.open} 
                record={materialModal.record} 
                onCancel={() => setMaterialModal({ open: false, record: null })} 
            />

            <TrusteeProductionProgressModal 
                open={productionModal.open} 
                record={productionModal.record} 
                onCancel={() => setProductionModal({ open: false, record: null })} 
            />

            <DeliveryProgressModal
                open={deliveryProgressModal.open}
                orderId={deliveryProgressModal.orderId}
                onCancel={() => setDeliveryProgressModal({ open: false, orderId: null })}
            />

            <DeliveryNoticeFormModal
                open={deliveryNoticeModal.open}
                initialOrder={deliveryNoticeModal.record}
                onClose={() => setDeliveryNoticeModal({ open: false, record: null })}
                onSuccess={(notice) => {
                    mockData.upsert('deliveryNotices', {
                        ...notice,
                        id: Date.now(),
                        type: '受托加工发货'
                    });
                    message.success('发货通知单已创建');
                    setDeliveryNoticeModal({ open: false, record: null });
                }}
            />

            <TrusteeClaimFlowModal
                open={claimFlowModal.open}
                record={claimFlowModal.record}
                onCancel={() => setClaimFlowModal({ open: false, record: null })}
                onSuccess={() => {
                    mockData.upsert('consignmentOrders', { ...claimFlowModal.record, paymentStatus: '已结清' });
                    setClaimFlowModal({ open: false, record: null });
                }}
            />
        </div>
    );
};

export default ConsignmentOrderList;
