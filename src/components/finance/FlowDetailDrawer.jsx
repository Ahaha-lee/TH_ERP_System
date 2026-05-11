import React from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Space, Empty, Divider, Button } from 'antd';
import { formatCurrency } from '../../utils/helpers';

const { Text, Link } = Typography;

const FlowDetailDrawer = ({ open, flow, onClose, onAudit }) => {
  if (!flow) return null;

  const claimColumns = [
    { 
      title: '销售订单号 / 充值客户编号', 
      dataIndex: 'orderNo', 
      key: 'orderNo',
      width: 180,
      fixed: 'left',
      render: (text, record) => <Link>{record.orderNo || record.customerCode || '-'}</Link>
    },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 150 },
    { title: '业务员', dataIndex: 'salesman', key: 'salesman', width: 100 },
    { 
      title: '订单应收金额 / 充值金额', 
      dataIndex: 'orderTotalAmount', 
      key: 'orderTotalAmount',
      width: 170,
      align: 'right',
      render: (val, record) => record.type === '充值订单' ? formatCurrency(record.amount || 0) : formatCurrency(val || 0)
    },
    { 
      title: '订单已收金额', 
      dataIndex: 'orderReceivedAmount', 
      key: 'orderReceivedAmount',
      width: 120,
      align: 'right',
      render: (val, record) => record.type === '充值订单' ? '-' : formatCurrency(val || 0)
    },
    { 
      title: '订单待收金额', 
      dataIndex: 'orderPendingAmount', 
      key: 'orderPendingAmount',
      width: 120,
      align: 'right',
      render: (val, record) => record.type === '充值订单' ? '-' : formatCurrency(val || 0)
    },
    { 
      title: '本次认领金额', 
      dataIndex: 'amount', 
      key: 'amount',
      width: 120,
      align: 'right',
      render: (val) => formatCurrency(val || 0)
    },
    { 
      title: '本次认领比例', 
      dataIndex: 'claimRatio', 
      key: 'claimRatio',
      width: 110,
      align: 'right',
      render: (val, record) => record.type === '充值订单' ? '-' : (val ? `${val}%` : '-')
    },
    { title: '认领人', dataIndex: 'claimant', key: 'claimant', width: 100 },
    { title: '认领时间', dataIndex: 'claimTime', key: 'claimTime', width: 160 },
    { title: '备注', dataIndex: 'remark', key: 'remark', width: 150, ellipsis: true },
    { 
      title: '审批状态', 
      dataIndex: 'status', 
      key: 'status',
      width: 100,
      fixed: 'right',
      render: (val) => (
        <Tag color={val === '审批通过' ? 'green' : val === '审批拒绝' ? 'red' : 'blue'}>
          {val || '待审批'}
        </Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {(!record.status || record.status === '待审批') && (
            <Button type="link" size="small">撤回</Button>
          )}
          {record.status === '审批拒绝' && (
            <>
              <Button type="link" size="small">重新认领</Button>
            </>
          )}
          {record.status === '审批通过' && (
            <Button type="link" size="small" danger>取消认领</Button>
          )}
        </Space>
      )
    },
  ];

  const BasicInfo = () => (
    <div className="space-y-6">
      <Descriptions title="流水完整信息" bordered column={2}>
        <Descriptions.Item label="流水号">{flow.flowNo}</Descriptions.Item>
        <Descriptions.Item label="交易时间">{flow.transTime}</Descriptions.Item>
        <Descriptions.Item label="交易金额">
          <Text strong className="text-lg text-red-500">{formatCurrency(flow.amount)}</Text>
        </Descriptions.Item>
        <Descriptions.Item label="导入批次">{flow.batchNo}</Descriptions.Item>
        <Descriptions.Item label="交易方名称">{flow.payerName}</Descriptions.Item>
        <Descriptions.Item label="交易方账号">{flow.payerAccount}</Descriptions.Item>
        <Descriptions.Item label="认领状态">
          <Tag color={flow.claimStatus === '已认领' ? 'green' : flow.claimStatus === '部分认领' ? 'orange' : 'default'}>
            {flow.claimStatus}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="交易摘要">{flow.summary}</Descriptions.Item>
      </Descriptions>
    </div>
  );

  const tabsItems = [
    {
      key: 'info',
      label: '基本信息',
      children: <BasicInfo />,
    },
    {
      key: 'claims',
      label: '认领订单',
      children: flow.claims && flow.claims.length > 0 ? (
        <Table 
          columns={claimColumns} 
          dataSource={flow.claims} 
          rowKey="id" 
          pagination={false} 
          size="small"
          scroll={{ x: 1500 }}
        />
      ) : (
        <Empty description="暂无认领历史" />
      ),
    },
  ];

  return (
    <Drawer forceRender
      title={`流水详情 - ${flow.flowNo}`}
      size="large"
      onClose={onClose}
      open={open}
      destroyOnHidden
      extra={
        (flow.status === '待审批' || flow.claimStatus === '待审批') && (
          <Space>
            <Button danger onClick={() => onAudit && onAudit(flow, false)}>审核拒绝</Button>
            <Button type="primary" onClick={() => onAudit && onAudit(flow, true)}>审核通过</Button>
          </Space>
        )
      }
    >
      <Tabs items={tabsItems} defaultActiveKey="info" />
    </Drawer>
  );
};

export default FlowDetailDrawer;
