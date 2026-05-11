
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
    { title: '物料编码', dataIndex: 'productCode' },
    { title: '物料名称', dataIndex: 'productName' },
    { title: '数量', dataIndex: 'quantity', align: 'right' },
    { title: '单价', dataIndex: 'price', align: 'right', render: (v) => `￥${(v || 0).toFixed(2)}` },
    { title: '金额', key: 'amount', align: 'right', render: (_, r) => `￥${((r.quantity || 0) * (r.price || 0)).toFixed(2)}` },
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
        <Descriptions.Item label="客户">{order.partnerName}</Descriptions.Item>
        <Descriptions.Item label="仓库">{order.warehouseName}</Descriptions.Item>
        <Descriptions.Item label="出库日期">{order.outboundDate}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={order.status === '已出库' ? 'success' : 'processing'}>{order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={2}>{order.remark}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">物料明细</Divider>
      <Table 
        dataSource={order.items || []} 
        columns={columns} 
        pagination={false} 
        rowKey="productCode" 
      />

      <div style={{ marginTop: 24, textAlign: 'right' }}>
        <Space orientation="vertical" align="end">
          <Text>合计数量: <Title level={5} style={{ display: 'inline' }}>{order.items?.reduce((acc, i) => acc + (i.quantity || 0), 0)}</Title></Text>
          <Text>估算总额: <Title level={4} style={{ display: 'inline', color: '#f5222d' }}>￥{(order.items?.reduce((acc, i) => acc + (i.quantity || 0) * (i.price || 0), 0) || 0).toFixed(2)}</Title></Text>
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
