
import React, { useState, useEffect } from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Divider, Typography, Button, Input, Card, message } from 'antd';
import { formatCurrency } from '../../utils/helpers';
import dayjs from 'dayjs';
import { useMockData } from '../../mock';
import NormalOrderDetailDrawer from './NormalOrderDetailDrawer';

const { Text, Title, Link } = Typography;

const DeliveryNoticeDetailDrawer = ({ open, notice, onClose, onUpdate }) => {
    const [normalOrders] = useMockData('normalOrders');
    const [orderDetailOpen, setOrderDetailOpen] = useState(false);
    const [activeOrder, setActiveOrder] = useState(null);

    const handleViewOrder = (orderNo) => {
        if (!orderNo || orderNo === '-') return;
        const found = (normalOrders || []).find(o => o.orderNo === orderNo);
        if (found) {
            setActiveOrder(found);
            setOrderDetailOpen(true);
        } else {
            setActiveOrder({
                id: 'temp-' + orderNo,
                orderNo: orderNo,
                orderDate: notice ? notice.createdAt : dayjs().format('YYYY-MM-DD'),
                salesperson: notice ? notice.salesperson : '业务员',
                customerName: notice ? notice.customerName : '关联客户',
                status: '已审核',
                totalAmount: notice ? notice.totalAmount : 0,
                items: notice ? notice.items : []
            });
            setOrderDetailOpen(true);
        }
    };

    if (!notice) return null;

    const isStocking = notice.status === '备货中';

    const handleOutbound = () => {
        if (!onUpdate) return;
        const updated = {
            ...notice,
            status: '已完成',
            approvalStatus: '审批通过',
            outboundOrderNo: `CK-${notice.noticeNo.replace('FH', '')}`
        };
        onUpdate(updated);
        message.success('已确认备货，流转至已完成！');
    };

    const renderApprovalCard = () => {
        if (isStocking) {
            return (
                <Card 
                    size="small" 
                    title="🚚 备货及出库确认" 
                    className="mb-6 bg-blue-50/50 border border-blue-200 shadow-sm"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <Text type="secondary">当前发货单已由财务和仓库完成审批，现在可以进行备货确认与实际出库发货操作。</Text>
                        </div>
                        <Button 
                            type="primary" 
                            className="bg-blue-600 hover:bg-blue-500"
                            onClick={handleOutbound}
                        >
                            确认备货并出库
                        </Button>
                    </div>
                </Card>
            );
        }
        
        return null;
    };

    const basicItems = [
        { label: '发货通知单号', children: notice.noticeNo },
        { 
            label: '销售订单号', 
            children: notice.orderNo ? (
                <Link onClick={() => handleViewOrder(notice.orderNo)}>
                    {notice.orderNo}
                </Link>
            ) : '-' 
        },
        { label: '业务员', children: notice.salesperson },
        { 
            label: '订单状态', 
            children: (
                <Tag color={
                    notice.status === '草稿' ? 'default' :
                    notice.status === '财务审批' ? 'blue' :
                    notice.status === '仓库审批' ? 'cyan' :
                    notice.status === '已拒绝' ? 'red' :
                    notice.status === '备货中' ? 'orange' :
                    notice.status === '已完成' ? 'green' : 'default'
                }>
                    {notice.status}
                </Tag>
            )
        },
        { 
            label: '审批状态', 
            children: (
                <Tag color={
                    notice.approvalStatus === '草稿' ? 'default' :
                    notice.approvalStatus === '审批中' ? 'orange' :
                    notice.approvalStatus === '审批退回' ? 'warning' :
                    notice.approvalStatus === '审批拒绝' ? 'error' :
                    notice.approvalStatus === '审批通过' ? 'success' : 'default'
                }>
                    {notice.approvalStatus || '-'}
                </Tag>
            )
        },
        { label: '结算方式', children: notice.settlementMethod || '月结' },
        { label: '创建时间', children: notice.createdAt },
        { label: '总金额', children: <Text type="danger" strong>{formatCurrency(notice.totalAmount)}</Text>, span: 2 },
        { label: '备注', children: notice.remark || '-', span: 3 },
    ];

    const productColumns = [
        { 
            title: '销售订单号', 
            dataIndex: 'sourceOrderNo', 
            render: (v, rec) => {
                const orderNo = v || notice.orderNo;
                if (!orderNo || orderNo === '-') return '-';
                return (
                    <Link onClick={() => handleViewOrder(orderNo)}>
                        {orderNo}
                    </Link>
                );
            }
        },
        { 
            title: '客户名称（编码/名称）', 
            dataIndex: 'customerName', 
            render: (v, rec) => {
                const name = v || notice.customerName || '-';
                const code = rec.customerCode || notice.customerCode || 'CUST-001';
                return `${code}/${name}`;
            }
        },
        { title: '产品编码', dataIndex: 'productCode' },
        { title: '产品名称', dataIndex: 'productName' },
        { title: '规格', dataIndex: 'spec' },
        { title: '库存数量', dataIndex: 'stock', render: (v) => <Text type="secondary">{v !== undefined ? v : 120}</Text> },
        { title: '可用数量', dataIndex: 'availableQty', render: (v, rec) => <span className="text-emerald-600 font-semibold">{v !== undefined ? v : Math.floor((rec.stock !== undefined ? rec.stock : 120) * 0.85)}</span> },
        { title: '占用数量', dataIndex: 'allocatedQty', render: (v, rec) => <span className="text-amber-600">{v !== undefined ? v : Math.floor((rec.stock !== undefined ? rec.stock : 120) * 0.15)}</span> },
        { 
            title: '在制数量', 
            dataIndex: 'wipQty', 
            width: 90, 
            align: 'right',
            render: (v, rec) => {
                const val = rec.wipQty ?? (rec.property?.includes('定制') ? 15 : 35);
                return <span className="font-mono text-gray-500">{val}</span>;
            }
        },
        { title: '订单量', dataIndex: 'orderQty' },
        { 
            title: '已发量', 
            dataIndex: 'shippedQty',
            render: (v, rec) => {
                if (notice.status === '已完成(备货取消)' && rec.shippedQtyChange !== undefined) {
                    return (
                        <div className="flex items-center gap-1">
                            <Text>{v}</Text>
                            <Tag color="error" className="font-mono text-xs border-0 px-1 py-0 m-0 leading-none">-{rec.shippedQtyChange}</Tag>
                        </div>
                    );
                }
                return v;
            }
        },
        { 
            title: '未发货数量', 
            dataIndex: 'pendingQty',
            render: (v, rec) => {
                const pendingValue = v !== undefined ? v : (rec.orderQty - (rec.shippedQty || 0));
                if (notice.status === '已完成(备货取消)' && rec.pendingQtyChange !== undefined) {
                    return (
                        <div className="flex items-center gap-1">
                            <Text>{pendingValue}</Text>
                            <Tag color="success" className="font-mono text-xs border-0 px-1 py-0 m-0 leading-none">+{rec.pendingQtyChange}</Tag>
                        </div>
                    );
                }
                return pendingValue;
            }
        },
        { title: '本次发货量', dataIndex: 'currentQty', render: (v) => <Text strong>{v}</Text> },
        { title: '单位', dataIndex: 'unit', render: v => v || '套' },
        { title: '行备注', dataIndex: 'remark' },
    ];

    const outboundColumns = [
        { title: '出库单号', dataIndex: 'orderNo', render: (t) => <Typography.Link>{t}</Typography.Link> },
        { title: '状态', dataIndex: 'status', render: (s) => <Tag color={s === '已出库' ? 'green' : 'orange'}>{s}</Tag> },
        { title: '发货人', dataIndex: 'operator' },
        { title: '物流公司', dataIndex: 'logisticsCompany' },
        { title: '物流单号', dataIndex: 'trackingNo' },
        { title: '发货明细', dataIndex: 'productDetail', ellipsis: true },
        { title: '预计发货', dataIndex: 'expectDate' },
        { title: '实际出库时间', dataIndex: 'actualDate' },
    ];

    const mockOutboundRecords = (notice.status !== '草稿') ? [
        { 
            key: '1', 
            orderNo: notice.outboundOrderNo || `CK-${notice.noticeNo.replace('FH', '')}`, 
            status: notice.status === '已出库' ? '已出库' : '待处理', 
            operator: notice.status === '已出库' ? '李出库员' : '-', 
            logisticsCompany: notice.status === '已出库' ? (notice.deliveryMethod === '自提' ? '自提车' : '顺丰速运') : '-',
            trackingNo: notice.status === '已出库' ? 'SF1234567890' : '-',
            plateNo: notice.status === '已出库' ? '粤B·12345' : '-',
            productDetail: notice.items?.map(i => `${i.productName}x${i.quantity}`).join(', ') || '-',
            expectDate: notice.expectDate || dayjs(notice.date).add(1, 'day').format('YYYY-MM-DD'),
            actualDate: notice.status === '已出库' ? dayjs(notice.date).add(1, 'day').format('YYYY-MM-DD HH:mm') : '-'
        }
    ] : [];

    return (
        <Drawer forceRender
            title={`发货通知单详情 - ${notice.noticeNo}`}
            size="large"
            onClose={onClose}
            open={open}
        >
            <Tabs defaultActiveKey="basic" items={[
                {
                    key: 'basic',
                    label: '基本信息',
                    children: (
                        <>
                            {renderApprovalCard()}
                            <Descriptions bordered size="small" items={basicItems} column={3} className="mb-6" />
                            <Title level={5}>发货产品明细</Title>
                            <Table 
                                dataSource={notice.items || []} 
                                columns={productColumns} 
                                rowKey="id" 
                                size="small" 
                                pagination={false} 
                                bordered
                            />
                            {notice.paymentImages && notice.paymentImages.length > 0 && (
                                <div className="mt-6">
                                    <Title level={5}>付款凭证</Title>
                                    <div className="flex gap-4 overflow-auto pb-4">
                                        {notice.paymentImages.map((img, i) => (
                                            <img key={i} src={img.url} alt="Proof" width={128} height={128} className="object-cover border rounded cursor-pointer" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )
                },
                {
                    key: 'outbound',
                    label: '关联出库单',
                    children: (
                        <>
                            <div className="mb-4 bg-gray-50 p-4 rounded border">
                                <Title level={5} className="!mb-0">发货进度汇总</Title>
                                <Divider titlePlacement="left" className="my-2" />
                                <div className="grid grid-cols-3 gap-4">
                                    {notice.items?.map(i => (
                                        <div key={i.id} className="text-center">
                                            <div className="text-xs text-gray-400">{i.productName}</div>
                                            <div className="text-sm">
                                                已发 <Text strong type="success">{(i.shippedQty || 0) + (notice.status === '已出库' ? (i.currentQty || 0) : 0)}</Text> 
                                                / 待发 <Text strong type="warning">{(i.pendingQty || 0) - (notice.status === '已出库' ? (i.currentQty || 0) : 0)}</Text>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <Table 
                                dataSource={mockOutboundRecords} 
                                columns={outboundColumns} 
                                rowKey="key" 
                                size="small" 
                                pagination={false} 
                                bordered
                            />
                        </>
                    )
                }
            ]} />
            <NormalOrderDetailDrawer 
                open={orderDetailOpen}
                order={activeOrder}
                onClose={() => { setOrderDetailOpen(false); setActiveOrder(null); }}
            />
        </Drawer>
    );
};

export default DeliveryNoticeDetailDrawer;
