
import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Row, Col, Divider } from 'antd';

const { Text } = Typography;

const ExchangeOrderDetailDrawer = ({ open, record, onClose }) => {
    if (!record) return null;

    const returnItems = record.items?.filter(i => i.action === '退回') || [];
    const exchangeItems = record.items?.filter(i => i.action === '换出') || [];

    const tabItems = [
        {
            key: '1',
            label: '换货信息总览',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="换货单号">{record.exchangeNo}</Descriptions.Item>
                        <Descriptions.Item label="原销售单">{record.orderNo}</Descriptions.Item>
                        <Descriptions.Item label="状态"><Tag color="orange">{record.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="换货原因" span={3}>{record.reason || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Row gutter={[0, 24]} className="mt-6">
                        <Col span={24}>
                            <Divider titlePlacement="left">退回旧货</Divider>
                            <Table 
                                size="small" pagination={false} dataSource={returnItems}
                                rowKey={(r) => r.productName + r.action}
                                columns={[
                                    { title: '序号', width: 60, align: 'center', render: (_, __, index) => index + 1 },
                                    { title: '产品名称', dataIndex: 'productName' },
                                    { title: '属性', dataIndex: 'property' },
                                    { title: '退回数量', dataIndex: 'currentReturnQuantity', render: (v, r) => v || r.quantity },
                                    { title: '单价', dataIndex: 'originalUnitPrice', render: (v, r) => `¥${Number(v || r.unitPrice || 0).toFixed(2)}` },
                                    { title: '金额', render: (_, r) => `¥${Number((r.currentReturnQuantity || r.quantity || 0) * (r.originalUnitPrice || r.unitPrice || 0) || 0).toFixed(2)}` }
                                ]}
                            />
                        </Col>
                        <Col span={24}>
                            <Divider titlePlacement="left">换出新货</Divider>
                            <Table 
                                size="small" pagination={false} dataSource={exchangeItems}
                                rowKey={(r) => r.productName + r.action}
                                columns={[
                                    { title: '序号', width: 60, align: 'center', render: (_, __, index) => index + 1 },
                                    { title: '产品名称', dataIndex: 'productName' },
                                    { title: '属性', dataIndex: 'property' },
                                    { title: '发出数量', dataIndex: 'quantity' },
                                    { title: '单价', dataIndex: 'unitPrice', render: (v) => `¥${Number(v || 0).toFixed(2)}` },
                                    { title: '金额', render: (_, r) => `¥${Number((r.quantity || 0) * (r.unitPrice || 0) || 0).toFixed(2)}` }
                                ]}
                            />
                        </Col>
                    </Row>
                </div>
            )
        },
        {
            key: '2',
            label: '退回旧货详情',
            children: (
                <div className="p-2">
                    <Descriptions size="small" className="mb-4" column={2}>
                        <Descriptions.Item label="关联退货单"><a>RET-20250428-102</a></Descriptions.Item>
                        <Descriptions.Item label="退货状态"><Tag color="orange">待收货</Tag></Descriptions.Item>
                    </Descriptions>
                    <Table size="small" rowKey="id" columns={[{title:'单号', dataIndex:'id'}, {title:'状态', dataIndex:'status'}]} dataSource={[]} locale={{emptyText:'暂无入库单'}} />
                </div>
            )
        },
        {
            key: '3',
            label: '换出新货详情',
            children: (
                <div className="p-2">
                    <Descriptions size="small" className="mb-4" column={2}>
                        <Descriptions.Item label="关联出库单"><a>OUT-20250428-201</a></Descriptions.Item>
                    </Descriptions>
                    <Table size="small" rowKey="id" columns={[{title:'单号', dataIndex:'id'}, {title:'状态', dataIndex:'status'}]} dataSource={[]} locale={{emptyText:'暂无出库单'}} />
                </div>
            )
        }
    ];

    return (
        <Drawer forceRender title={`换货单详情 - ${record.exchangeNo}`} open={open} onClose={onClose} size="large">
            <Tabs items={tabItems} />
        </Drawer>
    );
};

export default ExchangeOrderDetailDrawer;
