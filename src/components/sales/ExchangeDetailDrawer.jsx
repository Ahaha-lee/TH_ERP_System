import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Empty, Space } from 'antd';

const { Title, Text } = Typography;

const ExchangeDetailDrawer = ({ open, onClose, record }) => {
  if (!record) return null;

  const infoTab = (
    <Space orientation="vertical" style={{ width: '100%' }} size="large">
      <Descriptions title="基本信息" bordered column={3}>
        <Descriptions.Item label="换货单号">{record.exchangeNo}</Descriptions.Item>
        <Descriptions.Item label="原销售订单">{record.orderNo}</Descriptions.Item>
        <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="退货状态"><Tag>{record.returnStatus}</Tag></Descriptions.Item>
        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
        <Descriptions.Item label="换货原因" span={3}>{record.reason || '-'}</Descriptions.Item>
      </Descriptions>
      <div className="flex gap-4">
        <div className="flex-1">
            <Descriptions title="退回旧货" size="small" />
            <Table 
                dataSource={record.returnItems || []} 
                rowKey="productName"
                columns={[{ title: '产品名称', dataIndex: 'productName' }, { title: '数量', dataIndex: 'quantity' || 'returnQuantity' }]} 
                pagination={false} size="small" 
            />
        </div>
        <div className="flex-1">
            <Descriptions title="换出新货" size="small" />
            <Table 
                dataSource={record.exchangeItems || []} 
                rowKey="productName"
                columns={[{ title: '产品名称', dataIndex: 'productName' }, { title: '数量', dataIndex: 'quantity' }]} 
                pagination={false} size="small" 
            />
        </div>
      </div>
    </Space>
  );

  return (
    <Drawer forceRender title={`换货单详情 - ${record.exchangeNo}`} size="large" open={open} onClose={onClose}>
      <Tabs defaultActiveKey="1" items={[
          { key: '1', label: '基本信息', children: infoTab },
          { key: '2', label: '退货明细', children: <Empty description="相关退货单记录" /> },
          { key: '3', label: '换货明细', children: <Empty description="相关新货出库记录" /> }
      ]} />
    </Drawer>
  );
};

export default ExchangeDetailDrawer;
