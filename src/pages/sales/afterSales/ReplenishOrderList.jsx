
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
import ReplenishOrderFormModal from '../../../components/sales/afterSales/ReplenishOrderFormModal';
import ReplenishOrderDetailDrawer from '../../../components/sales/afterSales/ReplenishOrderDetailDrawer';
import AuditModal from '../../../components/sales/AuditModal';
import InboundProgressModal from '../../../components/sales/afterSales/InboundProgressModal';

const { Link } = Typography;

const ReplenishOrderList = () => {
    const [form] = Form.useForm();
    const [allData] = useMockData('replenishments');
    const [displayData, setDisplayData] = useState(null);
    const data = displayData || allData;
    const [loading, setLoading] = useState(false);
    
    const [formModal, setFormModal] = useState({ open: false, record: null });
    const [detailDrawer, setDetailDrawer] = useState({ open: false, record: null });
    const [auditModal, setAuditModal] = useState({ open: false, record: null, readonly: false });
    const [inboundModal, setInboundModal] = useState({ open: false, record: null });

    const handleSearch = (values) => {
        setLoading(true);
        setTimeout(() => {
            let filtered = [...allData];
            if (values.replenishNo) filtered = filtered.filter(item => item.replenishNo.includes(values.replenishNo));
            setDisplayData(filtered);
            setLoading(false);
        }, 500);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            content: '确定要删除该补货单吗？',
            onOk: () => {
                mockData.remove('replenishments', record.id);
                message.success('删除成功');
            }
        });
    };

    const columns = [
        { title: '序号', width: 60, render: (_, __, i) => i + 1 },
        { 
            title: '售后订单号', 
            dataIndex: 'replenishNo', 
            render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, record })}>{text}</Link> 
        },
        { title: '售后类型', render: () => '补货' },
        { title: '审批详情', render: (_, record) => <Link onClick={() => setAuditModal({ open: true, record, readonly: true })}>查看审批详情</Link> },
        { 
            title: '原销售订单号', 
            dataIndex: 'orderNo', 
            render: (text) => <Link>{text}</Link> 
        },
        { title: '客户名称', dataIndex: 'customerName' },
        { title: '订单日期', dataIndex: 'orderDate' },
        { title: '补货金额', render: () => '¥0.00' },
        { 
            title: '补货产品信息', 
            dataIndex: 'items', 
            render: (items) => (items || []).map(item => `${item.productName}/${item.quantity}`).join(', ') 
        },
        { title: '业务员', dataIndex: 'salesperson' },
        { 
            title: '审批结果', 
            dataIndex: 'auditResult',
            render: (res) => res ? <Tag color={res === '审批通过' ? 'green' : 'red'}>{res}</Tag> : null
        },
        { 
            title: '订单状态', 
            key: 'status',
            render: (_, record) => {
                const { status, auditResult } = record;
                const colors = { '草稿': 'default', '待发货': 'orange', '已发货': 'blue', '已完成': 'green' };
                if (status === '待发货' && auditResult === '审批拒绝') {
                    return <Tag color="error">待发货</Tag>;
                }
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
            }
        },
        { 
            title: '操作', 
            fixed: 'right', 
            width: 180,
            render: (_, record) => {
                const { status, auditResult } = record;
                return (
                    <Space size="small">
                        {status === '草稿' && (
                            <>
                                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" danger size="small" icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>删除</Button>
                            </>
                        )}
                        {status === '待发货' && auditResult === '审批拒绝' && (
                            <>
                                <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, record })}>编辑</Button>
                                <Button type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => setAuditModal({ open: true, record, readonly: false })}>审核</Button>
                            </>
                        )}
                        {['已发货', '已完成'].includes(status) && (
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
                    <Col span={6}><Form.Item name="replenishNo" label="补货单号"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="orderNo" label="原销售单号"><Input placeholder="原单号" /></Form.Item></Col>
                    <Col span={6}><Form.Item name="customerName" label="客户名称"><Input placeholder="模糊匹配" /></Form.Item></Col>
                    <Col span={6}>
                        <Form.Item name="status" label="补货状态">
                            <Select placeholder="选择状态" allowClear>
                                {['草稿', '待发货', '已发货', '已完成'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
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
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, record: null })}>新增补货单</Button>
            </div>

            <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ showTotal: (total) => `共 ${total} 条` }} scroll={{ x: 1500 }} />

            <ReplenishOrderFormModal 
                open={formModal.open} 
                record={formModal.record} 
                onCancel={() => setFormModal({ open: false, record: null })}
                onSuccess={(newData) => {
                    mockData.upsert('replenishments', newData);
                    setFormModal({ open: false, record: null });
                }}
            />

            <ReplenishOrderDetailDrawer 
                open={detailDrawer.open} 
                record={detailDrawer.record} 
                onClose={() => setDetailDrawer({ open: false, record: null })}
            />

            <AuditModal 
                open={auditModal.open} 
                record={auditModal.record} 
                readonly={auditModal.readonly}
                onCancel={() => setAuditModal({ open: false, record: null, readonly: false })}
                onSuccess={(audited) => {
                    mockData.upsert('replenishments', { ...audited, status: audited.auditResult === '审批通过' ? '待发货' : audited.status });
                    setAuditModal({ open: false, record: null, readonly: false });
                }}
            />

            <InboundProgressModal 
                open={inboundModal.open} 
                record={inboundModal.record} 
                onCancel={() => setInboundModal({ open: false, record: null })} 
            />
        </div>
    );
};

export default ReplenishOrderList;
