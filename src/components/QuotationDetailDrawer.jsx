import React from 'react';
import { Drawer, Descriptions, Table, Tag, Typography, Divider, Space } from 'antd';
import { formatCurrency } from '../utils/helpers';

const { Text, Title, Link } = Typography;

const QuotationDetailDrawer = ({ open, quotation, onClose }) => {
  if (!quotation) return null;

  const productTotal = (quotation.items || []).reduce((sum, item) => sum + (item.amount || 0), 0);
  const discountedTotal = productTotal * (1 - (quotation.discountRate || 0) / 100);
  
  // Handle depositRate as either decimal (0.3) or percentage (30) for backward compatibility
  const normalizedDepositRate = (quotation.depositRate !== undefined && quotation.depositRate <= 1) 
    ? quotation.depositRate 
    : (quotation.depositRate || 30) / 100;
    
  const depositRequired = quotation.isDeposit ? discountedTotal * normalizedDepositRate : 0;

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60 },
    { title: '产品编码', dataIndex: 'code', width: 120 },
    { title: '产品名称', dataIndex: 'name', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 150 },
    { title: '数量', dataIndex: 'quantity', width: 80 },
    { title: '标准单价', dataIndex: 'standardPrice', width: 120, render: val => formatCurrency(val) },
    { title: '总单价', dataIndex: 'unitPrice', width: 120, render: val => formatCurrency(val) },
    { title: '金额', dataIndex: 'amount', width: 120, render: val => formatCurrency(val) },
    { title: '备注', dataIndex: 'remark' },
  ];

  const statusColors = {
    '草稿': 'default',
    '待审批': 'orange',
    '审批通过': 'green',
    '审批拒绝': 'red',
    '已转订单': 'blue'
  };

  return (
    <Drawer forceRender
      title={`报价单详情 - ${quotation.quotationNo}`}
      size="large"
      open={open}
      onClose={onClose}
    >
      <div className="mb-6 flex justify-between items-start">
        <Space orientation="vertical" size={0}>
          <Title level={4} className="!mb-1">{quotation.title || '无标题'}</Title>
          <Text type="secondary">报价单号：{quotation.quotationNo}</Text>
        </Space>
        <Tag color={statusColors[quotation.status]} className="px-3 py-1 text-sm">
          {quotation.status}
        </Tag>
      </div>

      {quotation.status === '已转订单' && (
        <div className="bg-blue-50 border border-blue-100 p-3 rounded mb-4 flex items-center">
          <Text strong className="mr-2">关联销售订单号：</Text>
          <Link onClick={() => alert(`跳转到销售订单：${quotation.relatedOrderNo}`)}>
            {quotation.relatedOrderNo}
          </Link>
        </div>
      )}

      <Descriptions bordered column={3} size="small">
        <Descriptions.Item label="客户名称" span={2}>{quotation.customerName}</Descriptions.Item>
        <Descriptions.Item label="客户类型">{quotation.customerType}</Descriptions.Item>
        <Descriptions.Item label="报价日期">{quotation.date}</Descriptions.Item>
        <Descriptions.Item label="业务员">{quotation.salesperson}</Descriptions.Item>
        <Descriptions.Item label="折扣率">{quotation.discountRate}%</Descriptions.Item>
        <Descriptions.Item label="收款信息" span={3}>{quotation.paymentInfo || '-'}</Descriptions.Item>
        <Descriptions.Item label="是否收定金">{quotation.isDeposit ? '是' : '否'}</Descriptions.Item>
        {quotation.isDeposit && (
          <Descriptions.Item label="定金比例">
            {(normalizedDepositRate * 100).toFixed(0)}%
          </Descriptions.Item>
        )}
        <Descriptions.Item label="备注" span={quotation.isDeposit ? 1 : 2}>{quotation.remark || '-'}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left" plain>产品明细</Divider>
      <Table 
        columns={columns} 
        dataSource={quotation.items || []} 
        pagination={false} 
        size="small" 
        scroll={{ x: 'max-content' }} 
        rowKey={(record) => record?.id || record?.key}
      />

      <div className="mt-8 flex justify-end">
        <div className="bg-gray-50 p-4 rounded w-80">
          <div className="flex justify-between mb-2">
            <Text type="secondary">产品总额</Text>
            <Text>{formatCurrency(productTotal)}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text type="secondary">客户折扣 ({quotation.discountRate}%)</Text>
            <Text type="danger">-{formatCurrency(productTotal - discountedTotal)}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text type="secondary">折后产品总额</Text>
            <Text>{formatCurrency(discountedTotal)}</Text>
          </div>
          <div className="flex justify-between mb-2">
            <Text type="secondary">其他费用</Text>
            <Text>{formatCurrency(quotation.otherFee || 0)}</Text>
          </div>
          {quotation.isDeposit && (
            <div className="flex justify-between mb-2">
              <Text type="secondary">定金应收</Text>
              <Text>{formatCurrency(depositRequired)}</Text>
            </div>
          )}
          <Divider className="my-2" />
          <div className="flex justify-between items-center">
            <Text strong className="text-lg">报价总额</Text>
            <Title level={3} className="!mb-0 !text-blue-600">
              {formatCurrency(quotation.amount)}
            </Title>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default QuotationDetailDrawer;
