
import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Divider, Row, Col } from 'antd';

const { Text } = Typography;

const ReturnOrderDetailDrawer = ({ open, record, onClose }) => {
    if (!record) return null;

    const items = [
        {
            key: '1',
            label: '基本信息',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3} className="mb-4">
                        <Descriptions.Item label="售后订单号">{record.returnNo}</Descriptions.Item>
                        <Descriptions.Item label="原销售订单">{record.sourceOrderNo}</Descriptions.Item>
                        <Descriptions.Item label="状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="客户类型">{record.customerType || '-'}</Descriptions.Item>
                        <Descriptions.Item label="结算方式">{record.settlementMethod}</Descriptions.Item>
                        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="申请原因">{record.returnReason || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left">退货产品明细</Divider>
                    <Table 
                        size="small"
                        pagination={false}
                        dataSource={record.items || []}
                        rowKey="productCode"
                        columns={[
                            { title: '序号', render: (_, __, i) => i + 1, width: 60 },
                            { title: '产品编码', dataIndex: 'productCode' },
                            { title: '产品名称', dataIndex: 'productName' },
                            { title: '规格', dataIndex: 'spec' },
                            { title: '退货数量', dataIndex: 'currentReturnQuantity', render: (v, r) => v || r.returnQuantity },
                            { title: '退货单价', dataIndex: 'returnUnitPrice', render: (v, r) => `¥${(v || r.unitPrice || 0).toFixed(2)}` },
                            { title: '金额', dataIndex: 'amount', render: (v) => <Text strong type="danger">¥{(v || 0).toFixed(2)}</Text> },
                            { title: '备注', dataIndex: 'remark' },
                        ]}
                    />

                    <Divider titlePlacement="left">费用汇总</Divider>
                    <div className="bg-gray-50 p-4 rounded text-right space-y-2">
                        <Row justify="end"><Col span={4}>产品总额:</Col><Col span={4}>¥{(record.returnAmount || 0).toFixed(2)}</Col></Row>
                        <Row justify="end" className="text-xl font-bold text-red-600">
                            <Col span={4}>应退金额:</Col><Col span={4}>¥{(record.returnAmount || 0).toFixed(2)}</Col>
                        </Row>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: '退货入库单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '入库单号', dataIndex: 'id', render: (t) => <a>{t}</a> },
                        { title: '入库日期', dataIndex: 'date' },
                        { title: '产品名称', dataIndex: 'product' },
                        { title: '应收数量', dataIndex: 'planned' },
                        { title: '实收数量', dataIndex: 'actual' },
                        { title: '仓库', dataIndex: 'warehouse' },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> },
                    ]}
                    locale={{ emptyText: '暂无关联入库单' }}
                />
            )
        }
    ];

    return (
        <Drawer forceRender
            title={`退货单详情 - ${record.returnNo}`}
            open={open}
            onClose={onClose}
            size="large"
        >
            <Tabs defaultActiveKey="1" items={items} />
        </Drawer>
    );
};

export default ReturnOrderDetailDrawer;
