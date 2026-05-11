
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
    Progress
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
import { mockTrusteeOrders } from '../../mock/trusteeOrderMock';
import { mockData } from '../../mock/data';
import TrusteeOrderFormModal from '../../components/sales/trustee/TrusteeOrderFormModal';
import TrusteeOrderDetailDrawer from '../../components/sales/trustee/TrusteeOrderDetailDrawer';
import TrusteeMaterialReceiptModal from '../../components/sales/trustee/TrusteeMaterialReceiptModal';
import TrusteeProductionProgressModal from '../../components/sales/trustee/TrusteeProductionProgressModal';
import DeliveryProgressModal from '../../components/sales/DeliveryProgressModal';
import TrusteeClaimFlowModal from '../../components/sales/trustee/TrusteeClaimFlowModal';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import TrusteeAuditModal from '../../components/sales/trustee/TrusteeAuditModal';

const { Link } = Typography;

const TrusteeOrderList = () => {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [data, setData] = useState(mockTrusteeOrders.filter(i => i.status !== '确认发运'));
    const [loading, setLoading] = useState(false);
    
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [auditDrawer, setAuditDrawer] = useState({ open: false, record: null });
    const [auditModal, setAuditModal] = useState({ open: false, record: null });
    const [materialReceiptModal, setMaterialReceiptModal] = useState({ open: false, record: null });
    const [productionProgressModal, setProductionProgressModal] = useState({ open: false, record: null });
    const [deliveryProgressModal, setDeliveryProgressModal] = useState({ open: false, record: null });
    const [claimModal, setClaimModal] = useState({ open: false, record: null });

    const handleSearch = (values) => {
        setLoading(true);
        setTimeout(() => {
            let filtered = mockTrusteeOrders.filter(i => i.status !== '确认发运');
            if (values.orderNo) filtered = filtered.filter(item => item.orderNo.includes(values.orderNo));
            if (values.customerName) filtered = filtered.filter(item => {
                const cName = typeof item.customerName === 'object' ? item.customerName.name : item.customerName;
                return cName.includes(values.customerName);
            });
            if (values.status) filtered = filtered.filter(item => item.status === values.status);
            setData(filtered);
            setLoading(false);
        }, 500);
    };

    const handleDelete = (id) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该受托加工单吗？',
            onOk: () => {
                setData(data.filter(item => item.id !== id));
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
        { title: '客户名称', dataIndex: 'customerName', render: (v) => typeof v === 'object' ? v?.name || '-' : v },
        { title: '订单日期', dataIndex: 'orderDate' },
        { title: '期望发货日期', dataIndex: 'expectDeliveryDate' },
        { title: '加工费总额', dataIndex: 'totalAmount', align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        { 
            title: '加工进度', 
            dataIndex: 'processingProgress', 
            render: (p) => <Progress percent={p} size="small" /> 
        },
        { title: '发货进度', dataIndex: 'deliveryProgressText' },
        { title: '业务员', dataIndex: 'salesperson', render: (v) => typeof v === 'object' ? v?.name || '-' : v },
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
                    '待审核': 'processing', 
                    '审核拒绝': 'error', 
                    '已审核': 'blue', 
                    '生产中': 'orange', 
                    '已完工': 'cyan', 
                    '发货中': 'purple', 
                    '已完成': 'green', 
                    '已关闭': 'red' 
                };
                return <Tag color={colors[displayStatus] || 'default'}>{displayStatus}</Tag>;
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
                return <Tag color={color}>{displayStatus}</Tag>;
            }
        },
        { 
            title: '操作', 
            fixed: 'right', 
            width: 280,
            render: (_, record) => {
                const { status, auditResult } = record;
                
                // Draft
                if (status === '草稿') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => {
                                message.success('已提交审核');
                                setData(data.map(i => i.id === record.id ? { ...i, status: '待审核' } : i));
                            }}>提交审核</Button>
                            <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
                        </Space>
                    );
                }

                // Pending Audit (including Rejected)
                if (status === '待审核' || auditResult === '审核拒绝') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                            <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                        </Space>
                    );
                }

                // Audited
                if (status === '已审核') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" onClick={() => {
                                const inboundNo = `CI-${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
                                setData(data.map(i => i.id === record.id ? { ...i, receiptStatus: '已收来料', status: '生产中' } : i));
                                
                                // Also create the inbound order in mockData
                                mockData.upsert('inboundOrders', {
                                    id: Date.now(),
                                    orderNo: inboundNo,
                                    relOrderNo: record.orderNo,
                                    type: '受托入库',
                                    warehouseName: '主仓库',
                                    status: '待审核',
                                    inboundDate: dayjs().format('YYYY-MM-DD'),
                                    partnerName: record.customerName?.name || record.customerName,
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
                        </Space>
                    );
                }

                // In Production
                if (status === '生产中') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" onClick={() => setMaterialReceiptModal({ open: true, record })}>查看来料入库进度</Button>
                            <Button type="link" size="small" onClick={() => setProductionProgressModal({ open: true, record })}>查看生产进度</Button>
                        </Space>
                    );
                }

                // Completed Production
                if (status === '已完工') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" onClick={() => setMaterialReceiptModal({ open: true, record })}>查看来料入库进度</Button>
                            <Button type="link" size="small" onClick={() => setProductionProgressModal({ open: true, record })}>查看生产进度</Button>
                            <Button type="link" size="small" onClick={() => message.success('发货通知已提交')}>发起发货通知</Button>
                        </Space>
                    );
                }

                // Awaiting Shipment (displayed as "发货中")
                if (status === '待发货') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" onClick={() => setMaterialReceiptModal({ open: true, record })}>查看来料入库进度</Button>
                            <Button type="link" size="small" onClick={() => setProductionProgressModal({ open: true, record })}>查看生产进度</Button>
                            <Button type="link" size="small" onClick={() => setDeliveryProgressModal({ open: true, orderId: record.id })}>查看发货进度</Button>
                            <Button type="link" size="small" onClick={() => message.success('发货通知已提交')}>发起发货通知</Button>
                        </Space>
                    );
                }

                // Confirmed Shipment
                if (status === '确认发运') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" onClick={() => setMaterialReceiptModal({ open: true, record })}>查看来料入库进度</Button>
                            <Button type="link" size="small" onClick={() => setProductionProgressModal({ open: true, record })}>查看生产进度</Button>
                            <Button type="link" size="small" onClick={() => setDeliveryProgressModal({ open: true, orderId: record.id })}>查看发货进度</Button>
                        </Space>
                    );
                }

                // Finished
                if (status === '已完成' || status === '完成') {
                    return (
                        <Space size="small">
                            <Button type="link" size="small" onClick={() => setMaterialReceiptModal({ open: true, record })}>查看来料入库进度</Button>
                            <Button type="link" size="small" onClick={() => setProductionProgressModal({ open: true, record })}>查看生产进度</Button>
                            <Button type="link" size="small" onClick={() => setDeliveryProgressModal({ open: true, orderId: record.id })}>查看发货进度</Button>
                            <Button type="link" size="small" onClick={() => setClaimModal({ open: true, record: record })}>认领流水</Button>
                        </Space>
                    );
                }

                // Closed
                if (status === '已关闭') {
                    return null;
                }

                return null;
            }
        },
    ];

    return (
        <div className="p-4">
            <Form form={form} onFinish={handleSearch} className="mb-4 bg-white p-4 rounded shadow-sm">
                <Row gutter={16}>
                    <Col span={6}><Form.Item name="orderNo" label="受托单号"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="customerName" label="客户名称"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100% '}} /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="status" label="订单状态">
                            <Select placeholder="选择状态" allowClear>
                                {['草稿', '待审核', '审核拒绝', '已审核', '生产中', '已完工', '待发货', '已完成', '已关闭'].map(s => (
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

            <TrusteeOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    setData(formModal.record ? data.map(i => i.id === newData.id ? newData : i) : [...data, { ...newData, id: Date.now() }]);
                    setFormModal({ open: false, record: null });
                }}
            />

            <TrusteeOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />

            <TrusteeMaterialReceiptModal
                open={materialReceiptModal.open}
                record={materialReceiptModal.record}
                onCancel={() => setMaterialReceiptModal({ open: false, record: null })}
            />

            <TrusteeProductionProgressModal
                open={productionProgressModal.open}
                record={productionProgressModal.record}
                onCancel={() => setProductionProgressModal({ open: false, record: null })}
            />

            <DeliveryProgressModal
                open={deliveryProgressModal.open}
                orderId={deliveryProgressModal.orderId}
                onCancel={() => setDeliveryProgressModal({ open: false, orderId: null })}
            />

            <TrusteeClaimFlowModal
                open={claimModal.open}
                record={claimModal.record}
                onCancel={() => setClaimModal({ open: false, record: null })}
                onSuccess={() => {
                    message.success('认领流水成功');
                    setClaimModal({ open: false, record: null });
                }}
            />

            <AuditDetailDrawer open={auditDrawer.open} record={auditDrawer.record} onClose={() => setAuditDrawer({ open: false, record: null })} />

            <TrusteeAuditModal 
                open={auditModal.open} 
                record={auditModal.record} 
                onCancel={() => setAuditModal({ open: false, record: null })}
                onSuccess={(audited) => {
                    setData(data.map(i => i.id === audited.id ? { ...audited, status: audited.auditResult === '审核通过' ? '已审核' : i.status } : i));
                    setAuditModal({ open: false, record: null });
                }}
            />
        </div>
    );
};

export default TrusteeOrderList;
