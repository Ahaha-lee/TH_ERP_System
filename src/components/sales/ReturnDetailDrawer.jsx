import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Empty, Space, Divider } from 'antd';

const { Title } = Typography;

const ReturnDetailDrawer = ({ open, onClose, record }) => {
  if (!record) return null;

  const infoTab = (
    <Space orientation="vertical" style={{ width: '100%' }} size="large">
      <Descriptions title="基本信息" bordered column={3}>
        <Descriptions.Item label="售后订单号">{record.returnNo}</Descriptions.Item>
        <Descriptions.Item label="原销售订单">{record.orderNo}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
        <Descriptions.Item label="退货原因" span={3}>{record.returnReason}</Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{record.remark || '-'}</Descriptions.Item>
      </Descriptions>
      <Divider titlePlacement="left">退货产品明细</Divider>
      <Table 
        dataSource={record.items || []} 
        columns={[
            { title: '产品名称', dataIndex: 'productName' },
            { title: '规格', dataIndex: 'spec' },
            { title: '退货数量', dataIndex: 'returnQuantity' },
            { title: '退货金额', dataIndex: 'amount', render: v => `¥${(v || 0).toFixed(2)}` }
        ]} 
        rowKey="id" 
        size="small" 
        pagination={false} 
      />
      <div style={{ textAlign: 'right' }}>
        <Title level={5}>退货总计: <span style={{ color: '#f5222d' }}>¥{(record.returnAmount || 0).toFixed(2)}</span></Title>
      </div>
    </Space>
  );

  return (
    <Drawer forceRender title={`退货单详情 - ${record.returnNo}`} size="large" open={open} onClose={onClose}>
      <Tabs defaultActiveKey="1" items={[
          { key: '1', label: '基本信息', children: infoTab },
          { key: '2', label: '退货入库单', children: <Empty description="暂无关联入库单" /> }
      ]} />
    </Drawer>
  );
};

export default ReturnDetailDrawer;
