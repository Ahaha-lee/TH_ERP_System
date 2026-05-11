import React from 'react';
import { Drawer, Descriptions, Table, Tag, Steps, Empty, Typography } from 'antd';
import { deliveryNotices } from '../../mock';

const { Link } = Typography;

const AfterSaleReplenishDetailDrawer = ({ open, order, onClose }) => {
  if (!order) return null;

  const orderNotices = deliveryNotices.filter(dn => dn.orderNo === order.orderNo);

  const columns = [
    { title: '序号', render: (_, __, idx) => idx + 1, width: 60 },
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '补货数量', dataIndex: 'currentQty' },
    { title: '备注', dataIndex: 'remark' }
  ];

  return (
    <Drawer forceRender title={`补货单详情 - ${order.orderNo}`} open={open} onClose={onClose} size="large">
      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded">
          <Steps 
            current={order.status === '已审批' ? 2 : 0} 
            size="small"
            items={[{ title: '创建' }, { title: '提交审批' }, { title: '已审批' }, { title: '已完成' }]}
          />
        </div>

        <Descriptions title="补货基本信息" bordered size="small" column={3}>
          <Descriptions.Item label="补货单号">{order.orderNo}</Descriptions.Item>
          <Descriptions.Item label="原销售订单号"><a>{order.relOrderNo}</a></Descriptions.Item>
          <Descriptions.Item label="单据状态"><Tag>{order.status}</Tag></Descriptions.Item>
          <Descriptions.Item label="客户名称" span={2}>{order.customerName}</Descriptions.Item>
          <Descriptions.Item label="订单日期">{order.orderDate}</Descriptions.Item>
          <Descriptions.Item label="业务员" span={3}>{order.salesman}</Descriptions.Item>
          <Descriptions.Item label="备注" span={3}>{order.remark || '-'}</Descriptions.Item>
        </Descriptions>

        <div>
          <div className="font-semibold mb-2">补货产品明细</div>
          <Table dataSource={order.items} columns={columns} rowKey="id" size="small" pagination={false} />
        </div>

        <div>
          <div className="font-semibold mb-2">关联发货通知单</div>
          {orderNotices.length > 0 ? (
            <Table 
              size="small"
              dataSource={orderNotices}
              rowKey="id"
              pagination={false}
              columns={[
                { title: '发货单号', dataIndex: 'noticeNo', render: text => <Link>{text}</Link> },
                { title: '状态', dataIndex: 'status', render: val => <Tag color="blue">{val}</Tag> },
                { title: '创建日期', dataIndex: 'createDate' },
                { title: '业务员', dataIndex: 'salesperson' }
              ]}
            />
          ) : (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无发货通知单" />
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default AfterSaleReplenishDetailDrawer;
