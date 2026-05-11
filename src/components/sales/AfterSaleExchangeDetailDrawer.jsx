import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Steps, Typography, Progress, Empty, Space, Divider } from 'antd';
import { formatCurrency } from '../../utils/helpers';

const { Text, Link, Title } = Typography;

const AfterSaleExchangeDetailDrawer = ({ open, order, onClose }) => {
  if (!order) return null;

  const returnColumns = [
    { title: '序号', render: (_, __, idx) => idx + 1, width: 60 },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '退回数量', dataIndex: 'currentReturnQty' },
    { title: '单价', dataIndex: 'unitPrice', render: val => formatCurrency(val) },
    { title: '退回金额', dataIndex: 'returnAmount', render: val => formatCurrency(val) }
  ];

  const exchangeColumns = [
    { title: '序号', render: (_, __, idx) => idx + 1, width: 60 },
    { title: '参数名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '数量', dataIndex: 'quantity' },
    { title: '单价', dataIndex: 'unitPrice', render: val => formatCurrency(val) },
    { title: '金额', dataIndex: 'amount', render: val => formatCurrency(val) }
  ];

  const OverviewTab = () => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 rounded">
        <Steps 
          current={order.status === '已审批' ? 2 : 0} 
          size="small"
          items={[
            { title: '创建' },
            { title: '提交审批' },
            { title: '已审批' },
          ]}
        />
      </div>

      <Descriptions title="换货基本信息" bordered size="small" column={3}>
        <Descriptions.Item label="换货单号">{order.orderNo}</Descriptions.Item>
        <Descriptions.Item label="原销售订单号"><Link>{order.relOrderNo}</Link></Descriptions.Item>
        <Descriptions.Item label="换货状态"><Tag color="processing">{order.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="客户名称" span={2}>{order.customerName}</Descriptions.Item>
        <Descriptions.Item label="订单日期">{order.orderDate}</Descriptions.Item>
        <Descriptions.Item label="业务员" span={3}>{order.salesman}</Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{order.remark || '-'}</Descriptions.Item>
      </Descriptions>

      <div className="p-4 border rounded bg-gray-50">
          <Title level={5}>费用汇总</Title>
          <div className="flex justify-around">
              <Space orientation="vertical" align="center">
                  <Text type="secondary">退回旧货总额</Text>
                  <Text strong className="text-lg">{formatCurrency(order.totalReturn || 0)}</Text>
              </Space>
              <Divider orientation="vertical" className="h-10" />
              <Space orientation="vertical" align="center">
                  <Text type="secondary">换出新货总额</Text>
                  <Text strong className="text-lg">{formatCurrency(order.totalExchange || 0)}</Text>
              </Space>
              <Divider orientation="vertical" className="h-10" />
              <Space orientation="vertical" align="center">
                  <Text type="secondary">换货差额</Text>
                  <Text strong className={`text-lg ${order.diff >= 0 ? 'text-green-600' : 'text-red-500'}`}>{formatCurrency(order.diff || 0)}</Text>
              </Space>
          </div>
      </div>
    </div>
  );

  const tabs = [
    { key: 'overview', label: '换货总览', children: <OverviewTab /> },
    { 
        key: 'return', 
        label: '退回旧货详情', 
        children: (
            <div className="space-y-4">
                <Descriptions size="small" column={2}>
                    <Descriptions.Item label="关联退货单号"><Link>RET-20250424001</Link></Descriptions.Item>
                    <Descriptions.Item label="收货状态"><Tag color="orange">收货中</Tag></Descriptions.Item>
                </Descriptions>
                <Table dataSource={order.returnItems} columns={returnColumns} rowKey="id" size="small" pagination={false} />
            </div>
        ) 
    },
    { 
        key: 'exchange', 
        label: '换出新货详情', 
        children: (
            <div className="space-y-4">
                <Descriptions size="small" column={2}>
                    <Descriptions.Item label="关联销售单号"><Link>SOD-20250424002</Link></Descriptions.Item>
                    <Descriptions.Item label="发货状态"><Tag color="blue">待发货</Tag></Descriptions.Item>
                </Descriptions>
                <Table dataSource={order.exchangeItems} columns={exchangeColumns} rowKey="id" size="small" pagination={false} />
            </div>
        ) 
    },
  ];

  return (
    <Drawer forceRender title={`换货单详情 - ${order.orderNo}`} open={open} onClose={onClose} size="large">
      <Tabs items={tabs} defaultActiveKey="overview" />
    </Drawer>
  );
};

export default AfterSaleExchangeDetailDrawer;
