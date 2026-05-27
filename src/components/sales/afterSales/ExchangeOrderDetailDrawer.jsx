
import React, { useMemo } from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Row, Col, Divider, message } from 'antd';

const { Text } = Typography;

const ExchangeOrderDetailDrawer = ({ open, record, onClose }) => {
    if (!record) return null;

    const returnItems = record.items?.filter(i => i.action === '退回') || [];
    const exchangeItems = record.items?.filter(i => i.action === '换出') || [];

    const mockOutbounds = useMemo(() => {
        if (!record || ['草稿'].includes(record.status)) return [];
        return [
            {
                id: 'out-1',
                outboundNo: `OUT-EXC-${record.exchangeNo || '20260522'}-01`,
                stockingPlanNo: `SP-EXC-${record.exchangeNo || '20260522'}`,
                status: record.status === '已完成' || record.status === '已出库' ? '已出库' : '待出库',
                operator: '李出库员',
                time: record.orderDate || '2026-05-22'
            }
        ];
    }, [record]);

    const mockInbounds = useMemo(() => {
        if (!record || ['草稿'].includes(record.status)) return [];
        return [
            {
                id: 'in-1',
                inboundNo: `RET-EXC-${record.exchangeNo || '20260522'}-01`,
                status: record.status === '已完成' || record.status === '已入库' ? '已入库' : '待入库',
                operator: '王入库员',
                time: record.orderDate || '2026-05-22'
            }
        ];
    }, [record]);

    const tabItems = [
        {
            key: '1',
            label: '换货信息总览',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="换货单号">{record.exchangeNo}</Descriptions.Item>
                        <Descriptions.Item label="原销售单">{record.orderNo}</Descriptions.Item>
                        <Descriptions.Item label="状态">
                            <Tag color={
                                record.status === '草稿' ? 'default' :
                                record.status === '待发货' ? 'orange' :
                                record.status === '备货中' ? 'purple' :
                                record.status === '已发货' ? 'blue' :
                                record.status === '已完成' ? 'green' : 'default'
                            }>
                                {record.status}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="紧急程度">
                            <Tag color={(record.urgency === '紧急' || record.isUrgent) ? "error" : "default"}>
                                {record.urgency || (record.isUrgent ? '紧急' : '一般')}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="换货原因" span={2}>{record.reason || '-'}</Descriptions.Item>
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
                                    { 
                                        title: '退回数量', 
                                        dataIndex: 'currentReturnQuantity', 
                                        render: (v, r) => {
                                            const qty = v !== undefined && v !== null ? v : r.quantity;
                                            return qty;
                                        }
                                    },
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
                    <Table 
                        size="small" 
                        rowKey="id" 
                        dataSource={mockInbounds}
                        columns={[
                            { title: '序号', width: 60, render: (_, __, idx) => idx + 1 },
                            { 
                                title: '入库单号', 
                                dataIndex: 'inboundNo',
                                render: (v) => <a onClick={() => message.info(`正在跳转至入库详情: ${v}`)}>{v}</a> 
                            },
                            { 
                                title: '状态', 
                                dataIndex: 'status',
                                render: (v) => <Tag color={(v === '已入库' || v === '已完成') ? 'green' : 'blue'}>{v}</Tag>
                            },
                            { title: '仓管员', dataIndex: 'operator' },
                            { title: '操作时间', dataIndex: 'time' }
                        ]} 
                        locale={{emptyText:'暂无入库单'}} 
                    />
                </div>
            )
        },
        {
            key: '3',
            label: '换出新货详情',
            children: (
                <div className="p-2">
                    <Table 
                        size="small" 
                        rowKey="id" 
                        dataSource={mockOutbounds}
                        columns={[
                            { title: '序号', width: 60, render: (_, __, idx) => idx + 1 },
                            { 
                                title: '出库单号', 
                                dataIndex: 'outboundNo',
                                render: (v) => <a onClick={() => message.info(`正在跳转至出库详情: ${v}`)}>{v}</a> 
                            },
                            { 
                                title: '备货单号', 
                                dataIndex: 'stockingPlanNo',
                                render: (v) => <a onClick={() => message.info(`正在跳转至备货计划: ${v}`)}>{v}</a> 
                            },
                            { 
                                title: '状态', 
                                dataIndex: 'status',
                                render: (v) => <Tag color={(v === '已出库' || v === '已完成') ? 'green' : 'blue'}>{v}</Tag>
                            },
                            { title: '仓管员', dataIndex: 'operator' },
                            { title: '操作时间', dataIndex: 'time' }
                        ]} 
                        locale={{emptyText:'暂无出库单'}} 
                    />
                </div>
            )
        }
    ];

    return (
        <Drawer 
            forceRender 
            title={
                <div className="flex items-center gap-2">
                    <span>换货单详情 - {record.exchangeNo}</span>
                    {(record.urgency === '紧急' || record.isUrgent) && <Tag color="red">加急单</Tag>}
                </div>
            } 
            open={open} 
            onClose={onClose} 
            size="large"
        >
            <Tabs items={tabItems} />
        </Drawer>
    );
};

export default ExchangeOrderDetailDrawer;
