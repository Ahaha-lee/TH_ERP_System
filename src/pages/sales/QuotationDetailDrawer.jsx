
import React, { useMemo } from 'react';
import { Drawer, Descriptions, Table, Typography, Space, Tag, Empty, Divider, Row, Col, Tabs } from 'antd';
import { useMockData, mockAuditRecords } from '../../mock/data';
import { formatCurrency } from '../../utils/helpers';

const { Title, Text } = Typography;

const QuotationDetailDrawer = ({ open, onClose, quotationNo }) => {
  const [quotations] = useMockData('quotations');
  const quotation = useMemo(() => {
    return (quotations || []).find(q => q.quotationNo === quotationNo);
  }, [quotationNo, quotations]);

  const auditRecords = useMemo(() => {
    return quotation ? (mockAuditRecords[quotation.id] || []) : [];
  }, [quotation]);

  if (!quotation) return (
    <Drawer forceRender title="报价单详情" size="large" onClose={onClose} open={open}>
      <Empty description="未找到报价单数据" />
    </Drawer>
  );

  const statusColors = {
    '草稿': 'default',
    '待审核': 'orange',
    '已审核': 'success',
    '已转订单': 'blue'
  };

  const itemColumns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '产品编码', dataIndex: 'productCode', width: 120 },
    { title: '产品名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120, ellipsis: true },
    { title: '计划单价', dataIndex: 'unitPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '折扣率', width: 80, align: 'center', render: () => `${((quotation.discountRate || 0) * 100).toFixed(0)}%` },
    { title: '折后单价', dataIndex: 'finalPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
    { title: '金额', dataIndex: 'amount', width: 120, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '备注', dataIndex: 'remark', ellipsis: true }
  ];

  const auditColumns = [
    { title: '操作时间', dataIndex: 'time', width: 180 },
    { title: '操作人', dataIndex: 'operator', width: 120 },
    { 
      title: '审核动作', 
      dataIndex: 'action', 
      width: 120,
      render: (action) => {
        let color = 'default';
        let label = action;
        if (action === '提交审批') label = '提交审核';
        if (action.includes('通过')) color = 'success';
        if (action.includes('拒绝')) color = 'error';
        if (action.includes('提交')) color = 'blue';
        return <Tag color={color}>{label}</Tag>;
      }
    },
    { title: '审核建议', dataIndex: 'opinion' }
  ];

  const renderBasicInfo = () => (
    <Space orientation="vertical" style={{ width: '100%' }} size="large">
      <Descriptions title="基本信息" bordered column={3}>
        <Descriptions.Item label="报价单号">{quotation.quotationNo}</Descriptions.Item>
        <Descriptions.Item label="报价日期">{quotation.quotationDate}</Descriptions.Item>
        <Descriptions.Item label="业务员">{quotation.salesperson}</Descriptions.Item>
        <Descriptions.Item label="客户名称" span={2}>{quotation.customerName}</Descriptions.Item>
        <Descriptions.Item label="客户类型">{quotation.customerType || '-'}</Descriptions.Item>
        <Descriptions.Item label="来源预估单号">{quotation.sourceEstimationNo || '-'}</Descriptions.Item>
        <Descriptions.Item label="报价标题" span={2}>{quotation.title || '-'}</Descriptions.Item>
        <Descriptions.Item label="是否收取定金">{quotation.isDeposit ? '是' : '否'}</Descriptions.Item>
        {quotation.isDeposit && (
          <>
            <Descriptions.Item label="定金比例">{((quotation.depositRate || 0) * 100).toFixed(0)}%</Descriptions.Item>
            <Descriptions.Item label="定金应收">
              {formatCurrency(quotation.depositAmount || (quotation.totalAmount * (quotation.depositRate || 0)))}
            </Descriptions.Item>
          </>
        )}
        <Descriptions.Item label="收款信息" span={quotation.isDeposit ? 3 : 2}>{quotation.paymentInfo || '-'}</Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{quotation.remark || '-'}</Descriptions.Item>
        {quotation.relatedOrderNo && (
          <Descriptions.Item label="关联销售订单" span={3}>
            <Text type="success" style={{ fontWeight: 'bold' }}>{quotation.relatedOrderNo}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>

      <Divider titlePlacement="left">报价产品明细</Divider>
      <Table
        dataSource={quotation.items}
        columns={itemColumns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 1000 }}
      />

      <Divider />
      
      <Row justify="end">
        <Col span={8}>
          <div style={{ textAlign: 'right' }}>
            <Space orientation="vertical" style={{ width: '100%' }}>
              <Row><Col span={14}>合计金额:</Col><Col span={10}>¥{((quotation.totalAmount || 0) / (1 - (quotation.discountRate || 0))).toFixed(2)}</Col></Row>
              <Row><Col span={14}>客户折扣 ({((quotation.discountRate || 0) * 100).toFixed(0)}%):</Col><Col span={10}>- ¥{(((quotation.totalAmount || 0) / (1 - (quotation.discountRate || 0))) * (quotation.discountRate || 0)).toFixed(2)}</Col></Row>
              <Row><Col span={14}>其他费用:</Col><Col span={10}>¥{(quotation.otherFees || 0).toFixed(2)}</Col></Row>
              <Row style={{ marginTop: 8 }}>
                <Col span={14}><Title level={4}>报价总额:</Title></Col>
                <Col span={10}><Title level={4} style={{ color: '#ff4d4f' }}>¥{(quotation.totalAmount || 0).toFixed(2)}</Title></Col>
              </Row>
              {quotation.isDeposit && (
                <Row><Col span={14}><Text type="warning">定金应收:</Text></Col><Col span={10}><Text type="warning">¥{(quotation.depositAmount || (quotation.totalAmount * (quotation.depositRate || 0))).toFixed(2)}</Text></Col></Row>
              )}
              {quotation.depositAmount > 0 && (
                <Row><Col span={14}><Text type="secondary">预收定金:</Text></Col><Col span={10}><Text type="secondary">¥{(quotation.depositAmount || 0).toFixed(2)}</Text></Col></Row>
              )}
            </Space>
          </div>
        </Col>
      </Row>
    </Space>
  );

  const renderAuditHistory = () => (
    <div style={{ padding: '8px' }}>
      {auditRecords.length > 0 ? (
        <Table
          dataSource={auditRecords}
          columns={auditColumns}
          rowKey={(r) => r.time + r.operator}
          size="small"
          pagination={false}
        />
      ) : (
        <Empty description="暂无审批记录" />
      )}
    </div>
  );

  const tabItems = [
    { key: 'basic', label: '基本信息', children: renderBasicInfo() },
    { key: 'audit', label: '审核详情', children: renderAuditHistory() }
  ];

  return (
    <Drawer forceRender
      title={`报价单详情 - ${quotation.quotationNo}`}
      size="large"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Tag color={statusColors[quotation.status]}>{quotation.status}</Tag>
        </Space>
      }
    >
      <Tabs defaultActiveKey="basic" items={tabItems} />
    </Drawer>
  );
};

export default QuotationDetailDrawer;
