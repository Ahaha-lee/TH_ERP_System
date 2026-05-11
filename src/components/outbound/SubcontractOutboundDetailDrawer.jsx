
import React, { useMemo } from 'react';
import { Drawer, Typography, Table, Descriptions, Tag, Divider, Empty, Space, Button, Tabs } from 'antd';
import { useMockData, mockAuditRecords } from '../../mock/data';

const { Title, Text } = Typography;

const SubcontractOutboundDetailDrawer = ({ open, onClose, orderId }) => {
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
      <Drawer forceRender title="委外出库详情" size="large" onClose={onClose} open={open}>
        <Empty description="未找到单据信息" />
      </Drawer>
    );
  }

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
    { title: '物料编码', dataIndex: 'productCode' },
    { title: '物料名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '单位', dataIndex: 'unit' },
    { title: '出库数量', dataIndex: 'quantity', align: 'right' },
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
          <Tag color="orange">{order.type}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="关联单号">{order.relOrderNo}</Descriptions.Item>
        <Descriptions.Item label="供应商">{order.partnerName}</Descriptions.Item>
        <Descriptions.Item label="仓库">{order.warehouseName}</Descriptions.Item>
        <Descriptions.Item label="出库日期">{order.outboundDate}</Descriptions.Item>
        <Descriptions.Item label="状态">
          <Tag color={order.status === '草稿' ? 'default' : 'processing'}>{order.status}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={2}>{order.remark}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">发料物料明细</Divider>
      <Table 
        dataSource={order.items || []} 
        columns={columns} 
        pagination={false} 
        rowKey="productCode" 
      />
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
      title={`委外出库单详情 - ${orderId}`}
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

export default SubcontractOutboundDetailDrawer;
