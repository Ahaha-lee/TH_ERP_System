
import React, { useMemo } from 'react';
import { Drawer, Typography, Table, Descriptions, Tag, Divider, Empty, Space, Button, Tabs } from 'antd';
import { useMockData, mockAuditRecords } from '../../mock/data';

const { Title, Text } = Typography;

const SalesOutboundDetailDrawer = ({ open, onClose, orderId }) => {
  const [outboundOrders] = useMockData('outboundOrders');
  const order = useMemo(() => {
    return (outboundOrders || []).find(o => o.orderNo === orderId);
  }, [orderId, outboundOrders]);

  const auditRecords = useMemo(() => {
    if (!order) return [];
    return mockAuditRecords[order.id] || [];
  }, [order]);

  if (!order) {
    return (
      <Drawer forceRender title="销售出库详情" size="large" onClose={onClose} open={open}>
        <Empty description="未找到单据信息" />
      </Drawer>
    );
  }

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
    { title: '销售订单号/工单号', key: 'salesOrderNo', width: 150, render: (_, r) => r.salesOrderNo || r.workOrderNo || order.relOrderNo || '-' },
    { title: '工序名称', key: 'processName', width: 110, render: (_, r, i) => r.processName || (i % 3 === 0 ? '开料工序' : (i % 3 === 1 ? '封边工序' : '包装工序')) },
    { title: '物料编码', dataIndex: 'productCode' },
    { title: '物料名称', dataIndex: 'productName' },
    { title: '本次出库数量', dataIndex: 'quantity', align: 'right' },
    { title: '单价', dataIndex: 'price', align: 'right', render: (v) => `￥${Number(v || 0).toFixed(2)}` },
    { title: '金额', key: 'amount', align: 'right', render: (_, r) => `￥${(Number(r.quantity || 0) * Number(r.price || 0)).toFixed(2)}` },
    { title: '出库仓库', dataIndex: 'warehouseName', width: 150, render: (v) => v || order.warehouseName || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: (v) => v || order.batchNo || 'B20250425PD001' },
    { title: '序列号', dataIndex: 'serialNo', width: 150, render: (v, r, i) => v || `SN-SL-${(r.productCode || 'PROD').slice(-4)}-${String(i + 1).padStart(3, '0')}` },
    { title: '货位', dataIndex: 'bin', width: 100, render: (v) => v || order.bin || 'A-01-01' },
  ];

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

  const renderBasicInfo = () => (
    <>
      <Descriptions title="基本信息" bordered column={3}>
        <Descriptions.Item label="出库单号">{order.orderNo}</Descriptions.Item>
        <Descriptions.Item label="出库类型">
          <Tag color="blue">{order.type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="关联单号">{order.relOrderNo}</Descriptions.Item>
        <Descriptions.Item label="出库日期">{order.outboundDate}</Descriptions.Item>
        <Descriptions.Item label="状态" span={2}>
          <Tag color={order.status === '已出库' ? 'success' : 'processing'}>{order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{order.remark || '-'}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">物料明细</Divider>
      <Table 
        dataSource={order.items || []} 
        columns={columns} 
        pagination={false} 
        rowKey="productCode" 
        scroll={{ x: 1200 }}
      />

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space orientation="vertical" align="end">
          <Text>合计数量: <Title level={5} style={{ display: 'inline' }}>{order.items?.reduce((acc, i) => acc + (i.quantity || 0), 0)}</Title></Text>
        </Space>
      </div>
    </>
  );

  const renderAuditHistory = () => (
    <div style={{ padding: '8px' }}>
      <Table
        dataSource={auditRecords.map((r, i) => ({ ...r, key: i }))}
        columns={auditColumns}
        rowKey="key"
        size="small"
        pagination={false}
      />
    </div>
  );

  const tabItems = [
    { key: 'basic', label: '基本信息', children: renderBasicInfo() },
    { key: 'audit', label: '审核详情', children: renderAuditHistory() }
  ];

  return (
    <Drawer forceRender
      title={`销售出库单详情 - ${orderId}`}
      size="large"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          <Button type="primary">打印</Button>
        </Space>
      }
    >
      <Tabs defaultActiveKey="basic" items={tabItems} />
    </Drawer>
  );
};

export default SalesOutboundDetailDrawer;
