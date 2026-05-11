
import React, { useMemo } from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Divider, Row, Col, Space, Empty } from 'antd';
import { mockAuditRecords } from '../../../mock/data';

const { Text, Link } = Typography;

const TrusteeOrderDetailDrawer = ({ open, record, onClose }) => {
    const auditRecords = useMemo(() => {
        if (!record) return [];
        return mockAuditRecords[record.id] || [];
    }, [record]);

    if (!record) return null;

    const auditColumns = [
        { title: '审核时间', dataIndex: 'time', width: 180 },
        { title: '审核人', dataIndex: 'operator', width: 120 },
        { 
          title: '审核动作', 
          dataIndex: 'action', 
          width: 120,
          render: (action) => {
            let color = 'default';
            if (action.includes('通过')) color = 'success';
            if (action.includes('拒绝')) color = 'error';
            if (action.includes('提交')) color = 'blue';
            return <Tag color={color}>{action}</Tag>;
          }
        },
        { title: '审核建议', dataIndex: 'opinion' }
    ];

    const tabItems = [
        {
            key: '1',
            label: '基本信息',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="受托订单号">{record.orderNo}</Descriptions.Item>
                        <Descriptions.Item label="来源报价单">{record.quotationNo || '-'}</Descriptions.Item>
                        <Descriptions.Item label="角色状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="客户">{typeof record.customerName === 'object' ? record.customerName?.name : record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{typeof record.salesperson === 'object' ? record.salesperson?.name : record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="生产备注" span={3}>{record.productionRemark || '-'}</Descriptions.Item>
                        <Descriptions.Item label="客户备注" span={3}>{record.customerRemark || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left">客户来料清单</Divider>
                    <Table 
                        rowKey="id"
                        size="small" pagination={false} dataSource={record.materials || []}
                        columns={[
                            { title: '物料编码', dataIndex: 'materialCode' },
                            { title: '物料名称', dataIndex: 'materialName' },
                            { title: '规格', dataIndex: 'spec' },
                            { title: '数量', dataIndex: 'quantity' },
                        ]}
                    />

                    <Divider titlePlacement="left">加工费明细</Divider>
                    <Table 
                        rowKey="id"
                        size="small" pagination={false} dataSource={record.items || []}
                        columns={[
                            { title: '产品名称', dataIndex: 'productName' },
                            { title: '加工备注', dataIndex: 'processRemark' },
                            { title: '加工数量', dataIndex: 'quantity' },
                            { title: '折后最终价', dataIndex: 'unitPrice', render: (v) => `¥${(v || 0).toFixed(2)}` },
                            { title: '金额', dataIndex: 'amount', render: (v) => <Text strong>¥{(v || 0).toFixed(2)}</Text> },
                        ]}
                    />

                    <Divider titlePlacement="left">费用汇总</Divider>
                    <div className="bg-gray-50 p-4 rounded text-right space-y-2">
                        <Row justify="end"><Col span={4}>加工费总计:</Col><Col span={4}>¥{(record.totalAmount || 0).toFixed(2)}</Col></Row>
                        <Row justify="end" className="text-xl font-bold text-red-600">
                            <Col span={4}>订单总额:</Col><Col span={4}>¥{(record.totalAmount || 0).toFixed(2)}</Col>
                        </Row>
                        <Row justify="end"><Col span={4}>收款状态:</Col><Col span={4}><Tag color={record.paymentStatus === '已结清' ? 'green' : 'red'}>{record.paymentStatus}</Tag></Col></Row>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: '生产工单',
            children: (
                <Table 
                    rowKey="id"
                    size="small" 
                    dataSource={record.productionOrders || []} 
                    columns={[
                        { title: '生产工单号', dataIndex: 'orderNo', render: (t) => <Link>{t}</Link> },
                        { title: '产品信息', dataIndex: 'products', render: (products) => products?.map(p => p.productName).join(', ') || '-' },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> }
                    ]}
                    locale={{ emptyText: '暂无生产工单' }} 
                />
            )
        },
        {
            key: '3',
            label: '入库单',
            children: (
                <Table 
                    rowKey="id"
                    size="small" 
                    dataSource={record.inboundOrders || []}
                    columns={[
                        { title: '入库单号', dataIndex: 'orderNo', render: (t) => <Link>{t}</Link> },
                        { 
                            title: '产品信息', 
                            key: 'products',
                            render: (_, r) => {
                                const prefix = r.type === '来料入库' ? '（来料）' : '';
                                return r.products?.map(p => `${prefix}${p.productName} * ${p.quantity}`).join(', ') || '-';
                            }
                        },
                        { title: '入库时间', dataIndex: 'time' },
                        { title: '仓管员', dataIndex: 'warehouseManager', render: (v) => typeof v === 'object' ? v?.name || '-' : v },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> }
                    ]}
                    locale={{ emptyText: '暂无入库单' }}
                />
            )
        },
        {
            key: '4',
            label: '发货通知单',
            children: (
                <Table 
                    rowKey="id"
                    size="small" 
                    dataSource={record.deliveryNotices || []}
                    columns={[
                        { title: '发货通知单号', dataIndex: 'noticeNo', render: (t) => <Link>{t}</Link> },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> },
                        { title: '产品信息', dataIndex: 'products', render: (products) => products?.map(p => `${p.productName} * ${p.quantity}`).join(', ') || '-' },
                        { title: '创建日期', dataIndex: 'createDate' },
                        { title: '业务员', dataIndex: 'salesperson', render: (v) => typeof v === 'object' ? v?.name || '-' : v }
                    ]}
                    locale={{ emptyText: '暂无发货通知单' }}
                />
            )
        },
        {
            key: '5',
            label: '出库单',
            children: (
                <Table 
                    rowKey="id"
                    size="small" 
                    dataSource={record.outboundOrders || []}
                    columns={[
                        { title: '出库单号', dataIndex: 'orderNo', render: (t) => <Link>{t}</Link> },
                        { title: '产品信息', dataIndex: 'products', render: (products) => products?.map(p => `${p.productName} * ${p.quantity}`).join(', ') || '-' },
                        { title: '出库时间', dataIndex: 'time' },
                        { title: '仓管员', dataIndex: 'warehouseManager', render: (v) => typeof v === 'object' ? v?.name || '-' : v },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag>{s}</Tag> }
                    ]}
                    locale={{ emptyText: '暂无出库单' }}
                />
            )
        },
        {
            key: '6',
            label: '收款记录',
            children: (
                <Table 
                    rowKey="id"
                    size="small" 
                    dataSource={record.collectionRecords || []}
                    columns={[
                        { title: '流水号', dataIndex: 'flowNo' },
                        { title: '交易时间', dataIndex: 'transactionTime' },
                        { title: '交易金额', dataIndex: 'amount', render: (v) => `¥${(v || 0).toFixed(2)}` },
                        { title: '交易方名称', dataIndex: 'partyName' },
                        { title: '交易方账号', dataIndex: 'partyAccount' },
                        { title: '交易摘要', dataIndex: 'summary' },
                        { title: '认领记录号', dataIndex: 'claimNo' },
                        { title: '认领比例', dataIndex: 'claimRatio', render: (v) => `${(v || 0).toFixed(2)}%` },
                        { title: '认领金额', dataIndex: 'claimAmount', render: (v) => `¥${(v || 0).toFixed(2)}` },
                        { title: '认领人', dataIndex: 'claimer', render: (v) => typeof v === 'object' ? v?.name || '-' : v },
                        { title: '认领时间', dataIndex: 'claimTime' },
                        { title: '审核状态', dataIndex: 'auditStatus', render: (s) => <Tag>{s}</Tag> }
                    ]}
                    locale={{ emptyText: '暂无收款记录' }}
                />
            )
        },
        {
            key: '7',
            label: '售后记录',
            children: (
                <Table 
                    rowKey="id"
                    size="small" 
                    dataSource={record.afterSaleRecords || []}
                    columns={[
                        { title: '售后订单号', dataIndex: 'orderNo', render: (t) => <Link>{t}</Link> },
                        { title: '售后类型', dataIndex: 'type', render: (type) => <Tag color={type==='退货'?'red':type==='换货'?'orange':'blue'}>{type}</Tag> }
                    ]}
                    locale={{ emptyText: '暂无售后记录' }}
                />
            )
        },
        {
            key: '8',
            label: '审核详情',
            children: (
                <div style={{ padding: '8px' }}>
                    <Table 
                        rowKey="key"
                        size="small" 
                        dataSource={auditRecords.map((r, i) => ({ ...r, key: i }))} 
                        columns={auditColumns}
                        pagination={false}
                    />
                </div>
            )
        }
    ];

    return (
        <Drawer forceRender 
            title={
                <Space>
                    {`受托加工订单详情 - ${record.orderNo}`}
                    <Tag>{record.status}</Tag>
                </Space>
            } 
            open={open} 
            onClose={onClose} 
            size="large"
        >
            <Tabs items={tabItems} />
        </Drawer>
    );
};

export default TrusteeOrderDetailDrawer;
