
import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Divider } from 'antd';

const { Text } = Typography;

const ReplenishOrderDetailDrawer = ({ open, record, onClose }) => {
    if (!record) return null;

    const tabItems = [
        {
            key: '1',
            label: '补货信息总览',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="售后订单号">{record.replenishNo}</Descriptions.Item>
                        <Descriptions.Item label="原销售单">{record.orderNo}</Descriptions.Item>
                        <Descriptions.Item label="状态"><Tag color="orange">{record.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="补货原因" span={3}>{record.reason || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left">补货产品明细</Divider>
                    <Table 
                        rowKey="id"
                        size="small" pagination={false} dataSource={record.items || []}
                        columns={[
                            { title: '产品', dataIndex: 'productName' },
                            { title: '规格', dataIndex: 'spec' },
                            { title: '补货数量', dataIndex: 'quantity' },
                            { title: '单价', render: () => '¥0.00' },
                            { title: '备注', dataIndex: 'remark' }
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
                    <Descriptions size="small" className="mb-4" column={2}>
                        <Descriptions.Item label="关联出库单"><a>OUT-20250428-301</a></Descriptions.Item>
                    </Descriptions>
                    <Table rowKey="id" size="small" columns={[{title:'单号', dataIndex:'id'}, {title:'状态', dataIndex:'status'}]} dataSource={[]} locale={{emptyText:'暂无出库单'}} />
                </div>
            )
        }
    ];

    return (
        <Drawer forceRender title={`补货单详情 - ${record.replenishNo}`} open={open} onClose={onClose} size="large">
            <Tabs items={tabItems} />
        </Drawer>
    );
};

export default ReplenishOrderDetailDrawer;
