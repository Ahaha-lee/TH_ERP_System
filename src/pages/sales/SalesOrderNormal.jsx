
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  DatePicker, 
  Cascader, 
  Tag, 
  Progress, 
  Modal, 
  message, 
  Typography 
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, mockData } from '../../mock/data';
import SalesOrderFormModal from '../../components/sales/SalesOrderFormModal';
import SalesOrderDetailDrawer from '../../components/sales/SalesOrderDetailDrawer';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import AuditModal from '../../components/sales/AuditModal';
import ClaimFlowModal from '../../components/sales/ClaimFlowModal';
import DeliveryProgressModal from '../../components/sales/DeliveryProgressModal';
import ProductionProgressModal from '../../components/sales/ProductionProgressModal';

const { Link } = Typography;
const { RangePicker } = DatePicker;

const SalesOrderNormal = () => {
    const [form] = Form.useForm();
    const [allData] = useMockData('normalOrders');
    const [employees] = useMockData('employees');
    const [displayData, setDisplayData] = useState(null);
    const data = displayData || allData;
    const [loading, setLoading] = useState(false);
    
    // Visibility States
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [auditDrawer, setAuditDrawer] = useState({ open: false, record: null });
    const [auditModal, setAuditModal] = useState({ open: false, record: null });
    const [claimModal, setClaimModal] = useState({ open: false, record: null });
    const [deliveryModal, setDeliveryModal] = useState({ open: false, record: null });
    const [productionModal, setProductionModal] = useState({ open: false, record: null });

    const handleSearch = (values) => {
        setLoading(true);
        // Simulation of search logic
        setTimeout(() => {
            let filtered = [...allData];
            if (values.orderNo) filtered = filtered.filter(f => f.orderNo.includes(values.orderNo));
            if (values.customerName) filtered = filtered.filter(f => f.customerName.includes(values.customerName));
            if (values.status) filtered = filtered.filter(f => f.status === values.status);
            if (values.salesperson) filtered = filtered.filter(f => f.salesperson === values.salesperson);
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
            render: (text) => text ? <Link>{text}</Link> : '-'
        },
        { 
            title: '审核详情', 
            width: 120,
            render: (_, record) => (
                <Link onClick={() => setAuditDrawer({ open: true, record })}>查看审核详情</Link>
            )
        },
        { title: '客户名称', dataIndex: 'customerName', width: 140 },
        { title: '订单日期', dataIndex: 'orderDate', width: 110 },
        { title: '期望发货日期', dataIndex: 'expectDeliveryDate', width: 120 },
        { 
            title: '订单总额', 
            dataIndex: 'totalAmount', 
            width: 120, 
            align: 'right',
            render: (val) => `¥${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        },
        { 
            title: '实收金额', 
            dataIndex: 'paidAmount', 
            width: 120, 
            align: 'right',
            render: (val) => `¥${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
        },
        { title: '业务员', dataIndex: 'salesperson', width: 100 },
        { title: '结算方式', dataIndex: 'settlementMethod', width: 100 },
        { 
            title: '生产进度', 
            dataIndex: 'productionProgress', 
            width: 150,
            render: (val) => <Progress percent={val} size="small" />
        },
        { title: '发货进度', dataIndex: 'deliveryProgress', width: 220 },
        { 
            title: '关联发货通知单', 
            dataIndex: 'deliveryNotices', 
            width: 180,
            render: (val) => val ? val.split(',').map((id, i) => (
                <Link key={i} style={{ display: 'block' }}>{id}</Link>
            )) : '-'
        },
        { 
            title: '关联流水记录', 
            dataIndex: 'claimRecords', 
            width: 180,
            render: (val) => val ? val.split(',').map((id, i) => (
                <Link key={i} style={{ display: 'block' }} onClick={() => setClaimModal({ open: true, record: { orderNo: id } })}>{id}</Link>
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
                    '已关闭': 'magenta'
                };
                return <Tag color={colors[val] || 'default'}>{val}</Tag>;
            }
        },
        { 
            title: '收款状态', 
            dataIndex: 'paymentStatus', 
            width: 100 
        },
        { 
            title: '操作', 
            key: 'action', 
            fixed: 'right', 
            width: 250,
            render: (_, record) => {
                const { status, paymentStatus } = record;
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
                        {record.auditResult === '审核拒绝' && status !== '草稿' && (
                            <>
                                <Button type="link" size="small" onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" size="small" onClick={() => setAuditModal({ open: true, record })}>审核</Button>
                            </>
                        )}
                        {status === '已完工' && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryModal({ open: true, record })}>发货通知</Button>
                            </>
                        )}
                        {status === '发货中' && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryModal({ open: true, record })}>发货进度</Button>
                                <Button type="link" size="small">发货通知</Button>
                            </>
                        )}
                        {status === '完成' && (
                            <>
                                <Button type="link" size="small" onClick={() => setProductionModal({ open: true, record })}>生产进度</Button>
                                <Button type="link" size="small" onClick={() => setDeliveryModal({ open: true, record })}>发货进度</Button>
                                <Button type="link" size="small" onClick={() => setClaimModal({ open: true, record })}>认领流水</Button>
                            </>
                        )}
                    </Space>
                );
            }
        },
    ];

    return (
        <div className="p-4">
            <Card size="small" className="mb-4">
                <Form form={form} layout="inline" onFinish={handleSearch}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                        <Form.Item name="orderNo" label="销售订单号">
                            <Input placeholder="输入单号" allowClear />
                        </Form.Item>
                        <Form.Item name="customerName" label="客户名称">
                            <Input placeholder="输入名称" allowClear />
                        </Form.Item>
                        <Form.Item name="orderDate" label="订单日期">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="expectDeliveryDate" label="期望发货日期">
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="status" label="订单状态">
                            <Select placeholder="选择状态" allowClear>
                                {['草稿', '待审核', '已审核', '已排产', '生产中', '已完工', '发货中', '完成', '已关闭'].map(s => (
                                    <Select.Option key={s} value={s}>{s}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="salesperson" label="业务员">
                            <Select placeholder="选择业务员" allowClear>
                                {employees.map(e => (
                                    <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="settlementMethod" label="结算方式">
                            <Select placeholder="选择方式" allowClear>
                                {['月结', '现结', '预存', '现金'].map(s => (
                                    <Select.Option key={s} value={s}>{s}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>
                        <Form.Item name="region" label="客户地区">
                            <Cascader options={[]} placeholder="请选择" />
                        </Form.Item>
                        <div className="flex justify-end lg:col-span-4">
                            <Space>
                                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                            </Space>
                        </div>
                    </div>
                </Form>
            </Card>

            <Card size="small">
                <div className="flex justify-between items-center mb-4">
                    <Typography.Title level={5} className="!m-0">普通销售订单列表</Typography.Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, record: null })}>新增</Button>
                </div>
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
                    scroll={{ x: 2200 }}
                    loading={loading}
                    onRow={(record) => ({
                        onClick: (e) => {
                            if (e.target.tagName !== 'A' && e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                                setDetailDrawer({ open: true, record });
                            }
                        }
                    })}
                />
            </Card>

            {/* Modals & Drawers */}
            <SalesOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    mockData.upsert('normalOrders', newData);
                    setFormModal({ open: false, record: null });
                }}
            />
            
            <SalesOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />
            
            <AuditDetailDrawer 
                open={auditDrawer.open} 
                record={auditDrawer.record} 
                onClose={() => setAuditDrawer({ open: false, record: null })}
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
        </div>
    );
};

export default SalesOrderNormal;
