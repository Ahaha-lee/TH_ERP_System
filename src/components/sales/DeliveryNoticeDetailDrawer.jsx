
import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Divider, Typography } from 'antd';
import { formatCurrency } from '../../utils/helpers';
import dayjs from 'dayjs';

const { Text, Title } = Typography;

const DeliveryNoticeDetailDrawer = ({ open, notice, onClose }) => {
    if (!notice) return null;

    const basicItems = [
        { label: '发货通知单号', children: notice.noticeNo },
        { label: '销售订单号', children: <Typography.Link onClick={() => window.open(`/sales-orders/normal?orderNo=${notice.orderNo}`)}>{notice.orderNo}</Typography.Link> },
        { label: '客户名称', children: notice.customerName },
        { label: '结算方式', children: <Tag color="blue">{notice.settlementMethod}</Tag> },
        { label: '期望发货日期', children: notice.expectDeliveryDate || '-' },
        { label: '发货方式', children: notice.deliveryMethod || '物流' },
        { label: '业务员', children: notice.salesperson },
        { label: '状态', children: <Tag color={notice.status === '已审批' ? 'green' : 'blue'}>{notice.status}</Tag> },
        { label: '创建时间', children: notice.createdAt },
        { label: '总金额', children: <Text type="danger" strong>{formatCurrency(notice.totalAmount)}</Text> },
        { label: '备注', children: notice.remark || '-', span: 2 },
    ];

    const productColumns = [
        { title: '产品编码', dataIndex: 'productCode' },
        { title: '产品名称', dataIndex: 'productName' },
        { title: '规格', dataIndex: 'spec' },
        { title: '订单量', dataIndex: 'orderQty' },
        { title: '已发量', dataIndex: 'shippedQty' },
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
                            <Descriptions bordered size="small" items={basicItems} column={2} className="mb-6" />
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
        </Drawer>
    );
};

export default DeliveryNoticeDetailDrawer;
