
import React, { useMemo } from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Divider, message } from 'antd';

const { Text } = Typography;

const ReplenishOrderDetailDrawer = ({ open, record, onClose }) => {
    if (!record) return null;

    const mockOutbounds = useMemo(() => {
        if (!record || ['草稿', '待发货'].includes(record.status)) return [];
        return [
            {
                id: 'out-1',
                outboundNo: `OUT-REP-${record.replenishNo || '20260522'}-01`,
                stockingPlanNo: `SP-REP-${record.replenishNo || '20260522'}`,
                status: record.status === '已完成' ? '已出库' : '待出库',
                operator: '李出库员',
                time: record.orderDate || '2026-05-22'
            }
        ];
    }, [record]);

    const tabItems = [
        {
            key: '1',
            label: '补货信息总览',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="补货单号">{record.replenishNo}</Descriptions.Item>
                        <Descriptions.Item label="来源销售订单">{record.orderNo}</Descriptions.Item>
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
                        <Descriptions.Item label="补货原因" span={2}>{record.reason || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left">补货产品明细</Divider>
                    <Table 
                        rowKey="id"
                        size="small" pagination={false} dataSource={record.items || []}
                        columns={[
                            { title: '产品', dataIndex: 'productName' },
                            { title: '规格', dataIndex: 'spec', render: (v) => v || '-' },
                            { title: '原单数量', dataIndex: 'originalQuantity', render: (v, r) => v !== undefined && v !== null ? v : (r.quantity ? r.quantity * 2 : 10) },
                            { 
                                title: '已发货', 
                                dataIndex: 'shippedQuantity', 
                                render: (v, r) => {
                                    const val = v !== undefined && v !== null ? v : Math.floor((r.quantity || 4) * 0.8);
                                    return val;
                                } 
                            },
                            { 
                                title: '可补货', 
                                dataIndex: 'availableQuantity', 
                                render: (v, r) => {
                                    const val = v !== undefined && v !== null ? v : Math.floor((r.quantity || 4) * 0.2);
                                    return val;
                                } 
                            },
                            { 
                                title: '本次补货数量', 
                                dataIndex: 'quantity', 
                                render: (v, r) => {
                                    return <Text strong>{v}</Text>;
                                } 
                            },
                            { title: '单价', render: () => '¥0.00' },
                            { title: '备注', dataIndex: 'remark', render: (v) => v || '-' }
                        ]}
                    />
                </div>
            )
        },
        {
            key: '2',
            label: '补出新货详情',
            children: (
                <div className="p-2">
                    <Table 
                        rowKey="id" 
                        size="small" 
                        dataSource={mockOutbounds}
                        columns={[
                            { title: '序号', width: 60, render: (_, __, i) => i + 1 },
                            { 
                                title: '出库单号', 
                                dataIndex: 'outboundNo',
                                render: (val) => <a onClick={() => message.info(`正在跳转至出库详情: ${val}`)}>{val}</a> 
                            },
                            { 
                                title: '备货单号', 
                                dataIndex: 'stockingPlanNo',
                                render: (val) => <a onClick={() => message.info(`正在跳转至备货计划: ${val}`)}>{val}</a> 
                            },
                            { 
                                title: '状态', 
                                dataIndex: 'status', 
                                render: (val) => <Tag color={val === '已出库' ? 'green' : 'blue'}>{val}</Tag> 
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
                    <span>补货单详情 - {record.replenishNo}</span>
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

export default ReplenishOrderDetailDrawer;
