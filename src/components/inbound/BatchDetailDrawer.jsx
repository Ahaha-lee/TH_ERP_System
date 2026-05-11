
import React from 'react';
import { Drawer, Descriptions, Divider, Table, Tag, Typography, Space } from 'antd';

const { Text, Title } = Typography;

const BatchDetailDrawer = ({ open, data, onClose }) => {
  if (!data) return null;

  const records = [
    { time: '2025-04-25 10:00:00', type: '生产入库', orderNo: 'PD-202504250001', qty: 10, balance: 10 },
    { time: '2025-04-27 14:30:00', type: '销售出库', orderNo: 'SO-20250427-0005', qty: -5, balance: 5 },
  ];

  const columns = [
    { title: '交易时间', dataIndex: 'time', width: 180 },
    { title: '单据类型', dataIndex: 'type', width: 120 },
    { title: '单据号', dataIndex: 'orderNo', width: 180, render: (t) => <a>{t}</a> },
    { title: '变动数量', dataIndex: 'qty', width: 100, render: (v) => <Text type={v > 0 ? 'success' : 'danger'}>{v > 0 ? `+${v}` : v}</Text> },
    { title: '结存数量', dataIndex: 'balance', width: 100 },
  ];

  return (
    <Drawer forceRender title={`批次详情 - ${data.batchNo}`} size="large" open={open} onClose={onClose}>
      <div className="space-y-6">
        <Descriptions title="基本信息" bordered column={3} size="small">
          <Descriptions.Item label="物料编码">{data.productCode}</Descriptions.Item>
          <Descriptions.Item label="物料名称">{data.productName}</Descriptions.Item>
          <Descriptions.Item label="规格型号">{data.spec}</Descriptions.Item>
          <Descriptions.Item label="批次号">{data.batchNo}</Descriptions.Item>
          <Descriptions.Item label="生产日期">{data.productionDate}</Descriptions.Item>
          <Descriptions.Item label="有效期至">{data.expiryDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="状态"><Tag color={data.status === '有效' ? 'green' : 'default'}>{data.status}</Tag></Descriptions.Item>
        </Descriptions>

        <Descriptions title="库存信息" bordered column={3} size="small">
          <Descriptions.Item label="所在仓库">{data.warehouseName}</Descriptions.Item>
          <Descriptions.Item label="存放货位">{data.binName}</Descriptions.Item>
          <Descriptions.Item label="当前库存"><Text strong size="large">{data.currentStock}</Text></Descriptions.Item>
        </Descriptions>

        <Divider titlePlacement="left">出入库变动汇总</Divider>
        <Table dataSource={records} columns={columns} rowKey="time" size="small" pagination={false} />
      </div>
    </Drawer>
  );
};

export default BatchDetailDrawer;
