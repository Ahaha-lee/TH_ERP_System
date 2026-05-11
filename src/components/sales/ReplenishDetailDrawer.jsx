import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Empty, Space } from 'antd';

const ReplenishDetailDrawer = ({ open, onClose, record }) => {
  if (!record) return null;

  const infoTab = (
    <Space orientation="vertical" style={{ width: '100%' }} size="large">
      <Descriptions title="基本信息" bordered column={3}>
        <Descriptions.Item label="补货单号">{record.replenishNo}</Descriptions.Item>
        <Descriptions.Item label="原销售订单">{record.orderNo}</Descriptions.Item>
        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
        <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
      </Descriptions>
      <Table 
        dataSource={record.items || []} 
        rowKey="productName"
        columns={[
            { title: '产品名称', dataIndex: 'productName' },
            { title: '数量', dataIndex: 'quantity' },
            { title: '备注', dataIndex: 'remark' }
        ]} 
        pagination={false} 
        size="small" 
      />
    </Space>
  );

  return (
    <Drawer forceRender title={`补货单详情 - ${record.replenishNo}`} size="large" open={open} onClose={onClose}>
      <Tabs defaultActiveKey="1" items={[
          { key: '1', label: '基本信息', children: infoTab },
          { key: '2', label: '出库记录', children: <Empty description="相关补货出库记录" /> }
      ]} />
    </Drawer>
  );
};

export default ReplenishDetailDrawer;
