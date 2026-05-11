
import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Progress, 
  message, 
  Modal, 
  Row, 
  Col,
  Cascader
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useMockData, mockData } from '../../mock/data';
import NormalOrderFormModal from '../../components/sales/NormalOrderFormModal';
import NormalOrderDetailDrawer from '../../components/sales/NormalOrderDetailDrawer';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import ClaimFlowModal from '../../components/sales/ClaimFlowModal';
import DeliveryProgressModal from '../../components/sales/DeliveryProgressModal';
import ProductionProgressModal from '../../components/sales/ProductionProgressModal';
import DeliveryNoticeFormModal from '../../components/sales/DeliveryNoticeFormModal';
import AuditModal from '../../components/sales/AuditModal';
import QuotationDetailDrawer from '../../components/QuotationDetailDrawer';
import DeliveryNoticeDetailDrawer from '../../components/sales/DeliveryNoticeDetailDrawer';
import FlowDetailDrawer from '../../components/finance/FlowDetailDrawer';

const { Link } = Typography;

const NormalOrderList = () => {
    const [form] = Form.useForm();
    const [allData, setAllData] = useMockData('normalOrders');
    const [employees] = useMockData('employees');
    const [quotations] = useMockData('quotations');
    const [displayData, setDisplayData] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const data = (displayData || allData).filter(item => item.status !== '完成');

    // UI Visibility States
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [auditDrawer, setAuditDrawer] = useState({ open: false, record: null });
    const [auditModal, setAuditModal] = useState({ open: false, record: null });
    const [claimModal, setClaimModal] = useState({ open: false, record: null });
    const [deliveryModal, setDeliveryModal] = useState({ open: false, record: null });
    const [productionModal, setProductionModal] = useState({ open: false, record: null });
    const [deliveryNoticeModal, setDeliveryNoticeModal] = useState({ open: false, record: null });
    
    // Additional Drawers for cross-referencing
    const [quotationDetail, setQuotationDetail] = useState({ open: false, quotationNo: null });
    const [noticeDetail, setNoticeDetail] = useState({ open: false, noticeNo: null });
    const [flowDetail, setFlowDetail] = useState({ open: false, flowNo: null });

    const handleSearch = (values) => {
        setLoading(true);
        setTimeout(() => {
            let filtered = [...allData];
            if (values.orderNo) filtered = filtered.filter(f => f.orderNo.toLowerCase().includes(values.orderNo.toLowerCase()));
            if (values.customerName) filtered = filtered.filter(f => f.customerName.includes(values.customerName));
            if (values.status) filtered = filtered.filter(f => f.status === values.status);
            if (values.salesperson) filtered = filtered.filter(f => f.salesperson === values.salesperson);
            if (values.settlementMethod) filtered = filtered.filter(f => f.settlementMethod === values.settlementMethod);
            setDisplayData(filtered);
            setLoading(false);
        }, 500);
    };

    const handleReset = () => {
        form.resetFields();
        setDisplayData(null);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined />,
            content: `确定要删除订单 ${record.orderNo} 吗？此操作不可撤销。`,
            okText: '确定',
            okType: 'danger',
            cancelText: '取消',
            onOk() {
                mockData.remove('normalOrders', record.id);
                message.success('删除成功');
            },
        });
    };

    const columns = [
        { title: '序号', render: (_, __, i) => i + 1, width: 60, fixed: 'left' },
        { 
            title: '销售订单号', 
            dataIndex: 'orderNo', 
            width: 180, 
            render: (text, record) => (
                <Link onClick={() => setDetailDrawer({ open: true, record })}>{text}</Link>
            )
        },
        { 
            title: '来源报价单号', 
            dataIndex: 'quotationNo', 
            width: 150,
            render: (text) => text ? <Link onClick={() => setQuotationDetail({ open: true, quotationNo: text })}>{text}</Link> : '-'
        },
        { title: '客户名称', dataIndex: 'customerName', width: 140, render: (v) => typeof v === 'object' ? v?.name || '-' : v },
        { title: '订单日期', dataIndex: 'orderDate', width: 110 },
        { title: '期望发货日期', dataIndex: 'expectDeliveryDate', width: 120 },
        { 
            title: '订单总额', 
            dataIndex: 'totalAmount', 
            width: 120, 
            align: 'right',
            render: (val) => `¥${val ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}`
        },
        { 
            title: '实收金额', 
            dataIndex: 'paidAmount', 
            width: 120, 
            align: 'right',
            render: (val) => `¥${val ? val.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'}`
        },
        { title: '业务员', dataIndex: 'salesperson', width: 100, render: (v) => typeof v === 'object' ? v?.name || '-' : v },
        { 
            title: '纳入备货计划', 
            dataIndex: 'includeInStockingPlan', 
            width: 110,
            render: (val) => val ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>
        },
        { title: '结算方式', dataIndex: 'settlementMethod', width: 100 },
        { 
            title: '生产进度', 
            dataIndex: 'productionProgress', 
            width: 150,
            render: (val) => <Progress percent={val || 0} size="small" />
        },
        { title: '发货进度', dataIndex: 'deliveryProgressText', width: 220, render: (val) => val || '未开始发货' },
        { 
            title: '关联发货通知单', 
            dataIndex: 'deliveryNotices', 
            width: 180,
            render: (val) => val ? val.split(',').map((id, i) => (
                <Link key={i} style={{ display: 'block' }} onClick={() => setNoticeDetail({ open: true, noticeNo: id.trim() })}>{id}</Link>
            )) : '-'
        },
        { 
            title: '关联流水记录', 
            dataIndex: 'claimRecords', 
            width: 180,
            render: (val) => val ? val.split(',').map((id, i) => (
                <Link key={i} style={{ display: 'block' }} onClick={() => setFlowDetail({ open: true, flowNo: id.trim() })}>{id}</Link>
            )) : '-'
        },
        { 
            title: '审核结果', 
            dataIndex: 'auditResult', 
            width: 100,
            render: (val) => val ? (
                <Tag color={val === '审核通过' ? 'success' : 'error'}>{val}</Tag>
            ) : '-'
        },
        { 
            title: '订单状态', 
            dataIndex: 'status', 
            width: 100,
            render: (val) => {
                const colors = {
                    '草稿': 'default',
                    '待审核': 'processing',
                    '已审核': 'success',
                    '已排产': 'cyan',
                    '生产中': 'blue',
                    '已完工': 'green',
                    '发货中': 'orange',
                    '完成': 'gold',
                    '已完成': 'gold',
                    '已关闭': 'magenta'
                };
                return <Tag color={colors[val] || 'default'}>{val}</Tag>;
            }
        },
        { 
            title: '收款状态', 
            dataIndex: 'paymentStatus', 
            width: 100,
            render: (val) => {
                const colors = {
                    '未收款': 'red',
                    '部分结清': 'blue',
                    '已结清': 'green'
                };
                return <Tag color={colors[val] || 'default'}>{val || '未收款'}</Tag>;
            }
        },
        { 
            title: '操作', 
            key: 'action', 
            fixed: 'right', 
            width: 250,
            render: (_, record) => {
                const { status, auditResult, paymentStatus } = record;
                return (
                    <Space size="small">
                        {status === '草稿' && (
                            <>
                                <Button type="link" size="small" onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" size="small" onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                                <Button type="link" size="small" danger onClick={() => handleDelete(record)}>删除</Button>
                            </>
                        )}
                        {status === '待审核' && (
                            <Button type="link" size="small" onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                        )}
                        {auditResult === '审核拒绝' && status !== '草稿' && (
                            <>
                                <Button type="link" size="small" onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" size="small" onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                            </>
                        )}
                        {status === '已审核' && null}
                        {status === '已排产' && null}
                        {status === '生产中' && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                <Button type="link" size="small" danger onClick={() => message.info('订单已手动关闭')}>手动关闭</Button>
                            </>
                        )}
                        {status === '已完工' && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryNoticeModal({ open: true, record })}>发起发货通知</Button>
                            </>
                        )}
                        {status === '发货中' && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryModal({ open: true, record })}>查看发货进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryNoticeModal({ open: true, record })}>发起发货通知</Button>
                            </>
                        )}
                        {(status === '完成' || status === '已完成') && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>查看生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryModal({ open: true, record })}>查看发货进度</Button>
                                {paymentStatus !== '已结清' && (
                                    <Button type="link" size="small" onClick={() => setClaimModal({ open: true, record })}>认领流水</Button>
                                )}
                            </>
                        )}
                        {status === '已关闭' && null}
                    </Space>
                );
            }
        },
    ];

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Card size="small" className="mb-4">
                <Form form={form} layout="horizontal" onFinish={handleSearch}>
                    <Row gutter={16}>
                        <Col span={6}>
                            <Form.Item name="orderNo" label="销售订单号">
                                <Input placeholder="模糊查询" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="customerName" label="客户名称">
                                <Input placeholder="模糊查询" allowClear />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="orderDate" label="订单日期">
                                <DatePicker style={{ width: '100%' }} placeholder="单日" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="expectDeliveryDate" label="期望发货日期">
                                <DatePicker style={{ width: '100%' }} placeholder="单日" />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="status" label="订单状态">
                                <Select placeholder="选择状态" allowClear>
                                    {['草稿', '待审核', '已审核', '已排产', '生产中', '已完工', '发货中', '已完成', '已关闭'].map(s => (
                                        <Select.Option key={s} value={s}>{s}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="salesperson" label="业务员">
                                <Select 
                                    placeholder="姓名搜索" 
                                    showSearch 
                                    allowClear
                                    options={(employees || []).map(e => ({ label: e.name, value: e.name }))} 
                                />
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="settlementMethod" label="结算方式">
                                <Select placeholder="选择结算方式" allowClear>
                                    {['月结', '现结', '预存', '现金'].map(s => (
                                        <Select.Option key={s} value={s}>{s}</Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={6}>
                            <Form.Item name="region" label="客户地区">
                                <Cascader options={[]} placeholder="省市区三级" />
                            </Form.Item>
                        </Col>
                        <Col span={24} className="text-right">
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                            </Space>
                        </Col>
                    </Row>
                </Form>
            </Card>

            <Card 
                size="small" 
                title="销售订单列表" 
                extra={
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, record: null })}>新增</Button>
                }
            >
                <Table 
                    columns={columns} 
                    dataSource={data} 
                    rowKey="id" 
                    size="small" 
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                        pageSizeOptions: ['10', '20', '50', '100']
                    }}
                    scroll={{ x: 2500 }}
                    loading={loading}
                    onRow={(record) => ({
                        onClick: (e) => {
                            if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && !e.target.closest('button') && !e.target.closest('a')) {
                                setDetailDrawer({ open: true, record });
                            }
                        }
                    })}
                />
            </Card>

            {/* Modals & Drawers */}
            <NormalOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    mockData.upsert('normalOrders', newData);
                    setFormModal({ open: false, record: null });
                    message.success('保存成功');
                }}
            />
            
            <NormalOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />
            
            <AuditDetailDrawer 
                open={auditDrawer.open} 
                record={auditDrawer.record} 
                onClose={() => setAuditDrawer({ open: false, record: null })}
                onSuccess={(updatedRecord) => {
                    mockData.upsert('normalOrders', updatedRecord);
                }}
            />

            <AuditModal 
                open={auditModal.open} 
                record={auditModal.record} 
                onCancel={() => setAuditModal({ open: false, record: null })}
                onSuccess={(updatedRecord) => {
                    mockData.upsert('normalOrders', updatedRecord);
                    setAuditModal({ open: false, record: null });
                }}
            />
            
            <ClaimFlowModal 
                open={claimModal.open} 
                record={claimModal.record} 
                onCancel={() => setClaimModal({ open: false, record: null })}
            />
            
            <DeliveryProgressModal 
                open={deliveryModal.open} 
                record={deliveryModal.record} 
                onCancel={() => setDeliveryModal({ open: false, record: null })}
            />
            
            <ProductionProgressModal 
                open={productionModal.open} 
                record={productionModal.record} 
                onCancel={() => setProductionModal({ open: false, record: null })}
            />

            <DeliveryNoticeFormModal 
                open={deliveryNoticeModal.open} 
                initialOrder={deliveryNoticeModal.record} 
                onClose={() => setDeliveryNoticeModal({ open: false, record: null })}
                onSuccess={() => {
                    message.success('发货通知已发起');
                    setDeliveryNoticeModal({ open: false, record: null });
                }}
            />

            {/* New Referencing Drawers */}
            <QuotationDetailDrawer 
                open={quotationDetail.open}
                quotationNo={quotationDetail.quotationNo}
                onClose={() => setQuotationDetail({ open: false, quotationNo: null })}
            />

            <DeliveryNoticeDetailDrawer 
                open={noticeDetail.open}
                record={{ noticeNo: noticeDetail.noticeNo }}
                onClose={() => setNoticeDetail({ open: false, noticeNo: null })}
            />

            <FlowDetailDrawer 
                open={flowDetail.open}
                record={{ flowNo: flowDetail.flowNo }}
                onClose={() => setFlowDetail({ open: false, flowNo: null })}
            />
        </div>
    );
};

export default NormalOrderList;
