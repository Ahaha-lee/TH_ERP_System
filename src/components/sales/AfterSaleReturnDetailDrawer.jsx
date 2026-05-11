import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Steps, Typography, Progress, Empty, Space } from 'antd';
import { formatCurrency } from '../../utils/helpers';
import { inboundRecords } from '../../mock';

const { Text, Link } = Typography;

const AfterSaleReturnDetailDrawer = ({ open, order, onClose }) => {
  if (!order) return null;

  const orderInbounds = inboundRecords.filter(ib => ib.orderNo === order.returnNo);

  const columns = [
    { title: '序号', render: (_, __, idx) => idx + 1, width: 60 },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '本次退货数量', dataIndex: 'returnQuantity' },
    { title: '单价', dataIndex: 'unitPrice', render: val => formatCurrency(val) },
    { title: '金额', dataIndex: 'amount', render: val => formatCurrency(val) },
    { title: '备注', dataIndex: 'remark' }
  ];

  const BasicInfoTab = () => (
    <div className="space-y-6">
      <Descriptions title="单据基本信息" bordered size="small" column={3}>
        <Descriptions.Item label="退货单号">{order.returnNo}</Descriptions.Item>
        <Descriptions.Item label="原销售订单号">
          <Link>{order.sourceOrderNo}</Link>
        </Descriptions.Item>
        <Descriptions.Item label="单据状态"><Tag color="processing">{order.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="客户名称" span={2}>{order.customerName}</Descriptions.Item>
        <Descriptions.Item label="退货原因">{order.returnReason || '质量问题'}</Descriptions.Item>
        <Descriptions.Item label="订单日期">{order.orderDate || '-'}</Descriptions.Item>
        <Descriptions.Item label="业务员" span={2}>{order.salesperson}</Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{order.remark || '-'}</Descriptions.Item>
      </Descriptions>

      <div>
        <div className="font-semibold mb-2">退货产品明细</div>
        <Table dataSource={order.items} columns={columns} rowKey="id" size="small" pagination={false} />
      </div>

      <div className="flex justify-end pt-4">
        <Space orientation="vertical" align="end" size={0}>
          <Text>产品总额: <Text strong>{formatCurrency(order.totalAmount)}</Text></Text>
          <Text type="danger" className="text-lg">订单金额: <Text strong className="text-xl">{formatCurrency(order.totalAmount)}</Text></Text>
        </Space>
      </div>
    </div>
  );

  const tabs = [
    { key: 'basic', label: '基本信息', children: <BasicInfoTab /> },
    { 
        key: 'receipt', 
        label: '退货入库单', 
        children: orderInbounds.length > 0 ? (
          <Table 
            size="small"
            dataSource={orderInbounds}
            rowKey="id"
            pagination={false}
            columns={[
              { title: '入库单号', dataIndex: 'inboundNo', render: text => <Link>{text}</Link> },
              { title: '日期', dataIndex: 'inboundDate' },
              { title: '产品', dataIndex: 'materialName' },
              { title: '数量', dataIndex: 'quantity' },
              { title: '仓库', dataIndex: 'warehouse' },
              { title: '状态', dataIndex: 'status', render: val => <Tag color="green">{val}</Tag> }
            ]}
          />
        ) : (
            <div className="py-20 text-center">
                <Empty description="暂无关联退货入库单记录" />
            </div>
        ) 
    }
  ];

  return (
    <Drawer forceRender
      title={`退货单详情 - ${order.orderNo}`}
      open={open}
      onClose={onClose}
      size="large"
    >
      <Tabs items={tabs} defaultActiveKey="basic" />
    </Drawer>
  );
};

export default AfterSaleReturnDetailDrawer;
