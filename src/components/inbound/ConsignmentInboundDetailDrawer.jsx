import React, { useMemo } from 'react';
import { Drawer, Descriptions, Table, Tag, Typography, Divider, Tabs, Empty } from 'antd';
import { useMockData, mockAuditRecords } from '../../mock/data';

const { Text } = Typography;

const ConsignmentInboundDetailDrawer = ({ open, onClose, orderNo }) => {
  const [inboundOrders] = useMockData('inboundOrders');
  const order = useMemo(() => (inboundOrders || []).find(o => o.orderNo === orderNo), [orderNo, inboundOrders]);
  
  const auditRecords = useMemo(() => {
    if (!order) return [];
    return mockAuditRecords[order.id] || [];
  }, [order]);

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '受托来料数量', dataIndex: 'quantity', width: 120, align: 'right' },
    { title: '货位', dataIndex: 'bin', width: 100 },
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
      <Descriptions bordered column={3} size="small" className="mb-6">
        <Descriptions.Item label="入库单号">{order?.orderNo}</Descriptions.Item>
        <Descriptions.Item label="入库类型">{order?.type}</Descriptions.Item>
        <Descriptions.Item label="关联销售单">{order?.relOrderNo}</Descriptions.Item>
        <Descriptions.Item label="客户">{order?.partnerName}</Descriptions.Item>
        <Descriptions.Item label="存放仓库">{order?.warehouseName}</Descriptions.Item>
        <Descriptions.Item label="入库日期">{order?.inboundDate}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color="cyan">{order?.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="备注" span={2}>{order?.remark || '-'}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">来料明细</Divider>
      <Table
        rowKey="productCode"
        columns={columns}
        dataSource={order?.items || []}
        pagination={false}
        size="small"
        summary={(pageData) => {
          let totalQty = pageData.reduce((s, it) => s + (it.quantity || 0), 0);
          return (
            <Table.Summary.Row key="total">
              <Table.Summary.Cell index={0} colSpan={5}>合计</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right"><Text strong>{totalQty}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
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
      title={`受托入库单详情 - ${orderNo}`}
      size="large"
      open={open}
      onClose={onClose}
    >
      <Tabs defaultActiveKey="basic" items={tabItems} />
    </Drawer>
  );
};

export default ConsignmentInboundDetailDrawer;
