import React from 'react';
import { Drawer, Descriptions, Divider, Table, Tag, Typography, Space } from 'antd';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/helpers';
import SizePricingDisplay from './SizePricingDisplay';
import { useMockData } from '../../mock/data';

const { Text, Title, Link } = Typography;

const EstimationDetailDrawer = ({ open, data, onClose }) => {
  const [sizeRules] = useMockData('sizeRules');

  if (!data) return null;

  const productRule = sizeRules.find(r => r.productName === data.productName && r.isActive);

  return (
    <Drawer forceRender
      title={`报价预估详情 - ${data.orderNo}`}
      size="large"
      open={open}
      onClose={onClose}
    >
      <div className="space-y-6">
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="预估单号">{data.orderNo}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={data.status === '已转报价单' ? 'green' : 'blue'}>{data.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="客户名称">{data.customerName}</Descriptions.Item>
          <Descriptions.Item label="业务员">{data.salesman}</Descriptions.Item>
          <Descriptions.Item label="预估日期">{data.estimationDate}</Descriptions.Item>
          <Descriptions.Item label="预估发货日期">{data.expectedDeliveryDate}</Descriptions.Item>
          {data.relQuoteNo && (
            <Descriptions.Item label="关联报价单号" span={2}>
              <Link>{data.relQuoteNo}</Link>
            </Descriptions.Item>
          )}
          <Descriptions.Item label="备注" span={2}>{data.remark || '-'}</Descriptions.Item>
        </Descriptions>

        <Divider titlePlacement="left">产品与尺寸信息</Divider>
        <Descriptions column={3} size="small" className="mb-4">
          <Descriptions.Item label="产品名称">{data.productName}</Descriptions.Item>
          <Descriptions.Item label="基准价格">{formatCurrency(data.basePrice)}</Descriptions.Item>
          <Descriptions.Item label="系数">{data.coefficient}</Descriptions.Item>
        </Descriptions>

        <SizePricingDisplay customSize={data.customSize} rule={productRule} />

        <div className="flex justify-end mt-6">
          <div className="bg-gray-50 p-6 rounded-md border border-gray-200 text-right min-w-[300px]">
            <Space orientation="vertical" align="end" size={0}>
              <Text type="secondary">标准价格：{formatCurrency(data.basePrice)}</Text>
              <Text type="secondary">尺寸加价：{formatCurrency(data.sizeAddon)}</Text>
              <Text type="secondary">小计：{formatCurrency(data.basePrice + data.sizeAddon)} × {data.coefficient}</Text>
              <Title level={2} className="!mt-2 !mb-0 text-red-500">{formatCurrency(data.totalAmount)}</Title>
            </Space>
          </div>
        </div>
      </div>
    </Drawer>
  );
};

export default EstimationDetailDrawer;
