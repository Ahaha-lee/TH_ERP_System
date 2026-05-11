
import React, { useMemo } from 'react';
import { 
  Drawer, 
  Tabs, 
  Descriptions, 
  Table, 
  Tag, 
  Typography, 
  Divider, 
  Space,
  Row,
  Col,
  Empty
} from 'antd';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/helpers';
import { mockAuditRecords } from '../../mock/data';

const { Text, Title } = Typography;

const NormalOrderDetailDrawer = ({ open, order, record, onClose }) => {
    const activeRecord = record || order;
    
    const auditRecords = useMemo(() => {
        if (!activeRecord) return [];
        return mockAuditRecords[activeRecord.id] || [];
    }, [activeRecord]);

    if (!activeRecord) return null;

    const auditColumns = [
        { title: '操作时间', dataIndex: 'time', width: 180 },
        { title: '操作人', dataIndex: 'operator', width: 120 },
        { 
          title: '审核动作', 
          dataIndex: 'action', 
          width: 120,
          render: (action) => {
            let color = 'default';
            let label = action;
            if (action === '提交审批') label = '提交审核';
            if (action.includes('通过')) color = 'success';
            if (action.includes('拒绝')) color = 'error';
            if (action.includes('提交')) color = 'blue';
            return <Tag color={color}>{label}</Tag>;
          }
        },
        { title: '审核建议', dataIndex: 'opinion' }
    ];

    const items = [
        {
            key: '1',
            label: '基本信息',
            children: (
                <div className="p-2">
                    <Descriptions bordered size="small" column={3} className="mb-4">
                        <Descriptions.Item label="销售订单号">{activeRecord.orderNo}</Descriptions.Item>
                        <Descriptions.Item label="来源报价单">{activeRecord.quotationNo || '-'}</Descriptions.Item>
                        <Descriptions.Item label="状态"><Tag color="blue">{activeRecord.status}</Tag></Descriptions.Item>
                        <Descriptions.Item label="客户">{activeRecord.customerName}</Descriptions.Item>
                        <Descriptions.Item label="客户类型">{activeRecord.customerType || '-'}</Descriptions.Item>
                        <Descriptions.Item label="结算方式">{activeRecord.settlementMethod}</Descriptions.Item>
                        <Descriptions.Item label="订单日期">{activeRecord.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="期望发货日期">{activeRecord.expectDeliveryDate || '-'}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{activeRecord.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="是否收取订金">{activeRecord.isCollectDeposit ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>}</Descriptions.Item>
                        <Descriptions.Item label="订金比例">{activeRecord.depositRatio ? `${activeRecord.depositRatio}%` : '0%'}</Descriptions.Item>
                        <Descriptions.Item label="订金应收">
                            {activeRecord.isCollectDeposit 
                                ? formatCurrency(activeRecord.deposit || (activeRecord.totalAmount * (activeRecord.depositRatio / 100))) 
                                : '-'}
                        </Descriptions.Item>
                        <Descriptions.Item label="纳入备货计划">{activeRecord.includeInStockingPlan ? <Tag color="green">是</Tag> : <Tag color="default">否</Tag>}</Descriptions.Item>
                        <Descriptions.Item label="项目" span={2}>{activeRecord.subsidiary || '总部'}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left">产品明细</Divider>
                    <Table 
                        size="small"
                        pagination={false}
                        dataSource={activeRecord.items || []}
                        rowKey={(rec) => rec.id || rec.productCode}
                        columns={[
                            { title: '序号', render: (_, __, i) => i + 1, width: 60 },
                            { title: '产品编码', dataIndex: 'productCode' },
                            { title: '产品名称', dataIndex: 'productName' },
                            { title: '规格', dataIndex: 'spec' },
                            { title: '数量', dataIndex: 'quantity' },
                            { title: '折后最终价', dataIndex: 'unitPrice', render: (v) => `¥${(v || 0).toFixed(2)}` },
                            { title: '金额', dataIndex: 'amount', render: (v) => `¥${(v || 0).toFixed(2)}` },
                            { title: '备注', dataIndex: 'remark' },
                        ]}
                    />

                    {activeRecord.giftItems && activeRecord.giftItems.length > 0 && (
                        <>
                            <Divider titlePlacement="left">赠品明细</Divider>
                            <Table 
                                size="small"
                                pagination={false}
                                dataSource={activeRecord.giftItems}
                                rowKey={(rec) => rec.id || rec.productCode}
                                columns={[
                                    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
                                    { title: '产品编码', dataIndex: 'productCode' },
                                    { title: '产品名称', dataIndex: 'productName' },
                                    { title: '规格', dataIndex: 'spec' },
                                    { title: '数量', dataIndex: 'quantity' },
                                    { title: '备注', dataIndex: 'remark' },
                                ]}
                            />
                        </>
                    )}

                    <Divider titlePlacement="left">费用汇总</Divider>
                    <div className="bg-gray-50 p-4 rounded text-right space-y-2">
                        <Row justify="end"><Col span={4}>产品总额:</Col><Col span={4}>¥{(activeRecord.totalAmount || 0).toFixed(2)}</Col></Row>
                        <Row justify="end"><Col span={4}>折后金额:</Col><Col span={4}>¥{(activeRecord.totalAmount * 0.95).toFixed(2)}</Col></Row>
                        <Row justify="end" className="text-xl font-bold text-red-600">
                            <Col span={4}>订单总额:</Col><Col span={4}>¥{(activeRecord.totalAmount || 0).toFixed(2)}</Col>
                        </Row>
                        {activeRecord.isCollectDeposit && (
                            <Row justify="end" className="text-orange-600">
                                <Col span={4}>订金应收:</Col>
                                <Col span={4}>¥{(activeRecord.deposit || (activeRecord.totalAmount * (activeRecord.depositRatio / 100))).toFixed(2)}</Col>
                            </Row>
                        )}
                        <Row justify="end"><Col span={4}>已收金额:</Col><Col span={4}>¥{(activeRecord.paidAmount || 0).toFixed(2)}</Col></Row>
                        <Row justify="end"><Col span={4}>待收金额:</Col><Col span={4}>¥{((activeRecord.totalAmount || 0) - (activeRecord.paidAmount || 0)).toFixed(2)}</Col></Row>
                    </div>
                </div>
            )
        },
        {
            key: '2',
            label: '生产工单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '工单号', dataIndex: 'id', render: (t) => <a>{t}</a> },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '状态', dataIndex: 'status' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无生产工单" /> }}
                />
            )
        },
        {
            key: '3',
            label: '入库单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '入库单号', dataIndex: 'id' },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '入库时间', dataIndex: 'time' },
                        { title: '仓管员', dataIndex: 'operator' },
                        { title: '状态', dataIndex: 'status' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无入库单" /> }}
                />
            )
        },
        {
            key: '4',
            label: '发货通知单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '发货通知单号', dataIndex: 'id' },
                        { title: '状态', dataIndex: 'status' },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '创建日期', dataIndex: 'date' },
                        { title: '业务员', dataIndex: 'operator' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无发货通知单" /> }}
                />
            )
        },
        {
            key: '5',
            label: '出库单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '出库单号', dataIndex: 'id' },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '出库时间', dataIndex: 'time' },
                        { title: '仓管员', dataIndex: 'operator' },
                        { title: '状态', dataIndex: 'status' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无出库单" /> }}
                />
            )
        },
        {
            key: '6',
            label: '收款记录',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="flowNo"
                    columns={[
                        { title: '流水号', dataIndex: 'flowNo' },
                        { title: '项目（子公司）', dataIndex: 'project' },
                        { title: '发生时间', dataIndex: 'time' },
                        { title: '交易金额', dataIndex: 'totalAmount', render: (v) => formatCurrency(v) },
                        { title: '认领记录号', dataIndex: 'claimNo' },
                        { title: '认领比例', dataIndex: 'ratio', render: (v) => v ? `${v}%` : '-' },
                        { title: '认领金额', dataIndex: 'amount', render: (v) => formatCurrency(v) },
                        { title: '认领人', dataIndex: 'operator' },
                        { title: '审核状态', dataIndex: 'status', render: (s) => <Tag color="blue">{s || '已完成'}</Tag> },
                    ]}
                    locale={{ emptyText: <Empty description="暂无收款记录" /> }}
                />
            )
        },
        {
            key: '7',
            label: '售后记录',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '售后订单号', dataIndex: 'id', render: (t) => <a>{t}</a> },
                        { title: '售后类型', dataIndex: 'type' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无售后记录" /> }}
                />
            )
        },
        {
            key: 'audit',
            label: '审核详情',
            children: (
                <div style={{ padding: '8px' }}>
                    {auditRecords.length > 0 ? (
                        <Table
                            dataSource={auditRecords}
                            columns={auditColumns}
                            rowKey={(r) => r.time + r.operator}
                            size="small"
                            pagination={false}
                        />
                    ) : (
                        <Empty description="暂无审批记录" />
                    )}
                </div>
            )
        }
    ];

    return (
        <Drawer forceRender
            title={
                <Space>
                    <span>销售订单详情 - {record.orderNo}</span>
                    <Tag color="blue">{record.status}</Tag>
                </Space>
            }
            open={open}
            onClose={onClose}
            size="large"
        >
            <Tabs defaultActiveKey="1" items={items} />
        </Drawer>
    );
};

export default NormalOrderDetailDrawer;
