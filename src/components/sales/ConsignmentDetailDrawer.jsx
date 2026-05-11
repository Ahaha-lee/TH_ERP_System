
import React, { useMemo } from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Typography, Empty, Space, Row, Col, Divider, Progress } from 'antd';
import { productionOrders, outboundRecords, paymentRecords, inboundRecords } from '../../mock';
import { mockAuditRecords } from '../../mock/data';

const { Title, Text } = Typography;

const ConsignmentDetailDrawer = ({ open, onClose, record, order }) => {
  const activeRecord = record || order;
  if (!activeRecord) return null;

  const auditRecords = useMemo(() => {
    return mockAuditRecords[activeRecord.id] || [];
  }, [activeRecord.id]);

  const statusColors = {
    '草稿': 'default',
    '待审批': 'orange',
    '待审核': 'orange',
    '已审核': 'blue',
    '审核通过': 'blue',
    '已审批': 'success',
    '生产中': 'blue',
    '已完工': 'purple',
    '完成': 'green',
    '已完成': 'green',
    '已关闭': 'error'
  };

  const auditColumns = [
    { title: '审核时间', dataIndex: 'time', width: 180 },
    { title: '审核人', dataIndex: 'operator', width: 120 },
    { 
      title: '审核动作', 
      dataIndex: 'action', 
      width: 120,
      render: (action) => {
        let color = 'default';
        if (action.includes('通过')) color = 'success';
        if (action.includes('拒绝')) color = 'error';
        if (action.includes('提交')) color = 'blue';
        return <Tag color={color}>{action}</Tag>;
      }
    },
    { title: '审核建议', dataIndex: 'opinion' }
  ];

  const infoTab = (
    <Space orientation="vertical" style={{ width: '100%' }} size="large">
      <Descriptions title="基本信息" bordered column={3}>
        <Descriptions.Item label="订单号">{activeRecord.orderNo}</Descriptions.Item>
        <Descriptions.Item label="报价单号">{activeRecord.quotationNo || activeRecord.sourceQuoteNo || '-'}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color={statusColors[activeRecord.status]}>{activeRecord.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="客户">{activeRecord.customerName}</Descriptions.Item>
        <Descriptions.Item label="订单日期">{activeRecord.orderDate}</Descriptions.Item>
        <Descriptions.Item label="业务员">{activeRecord.salesperson || activeRecord.salesman}</Descriptions.Item>
        <Descriptions.Item label="来料状态"><Tag>{activeRecord.materialStatus || activeRecord.receiptStatus || '-'}</Tag></Descriptions.Item>
        <Divider />
        <Descriptions.Item label="加工进度" span={2}>
           <Progress percent={activeRecord.productionProgress || activeRecord.processingProgress} size="small" />
        </Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{activeRecord.remark || activeRecord.productionRemark || '-'}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">客户来料清单</Divider>
      <Table 
        dataSource={activeRecord.materials || []} 
        rowKey="materialCode"
        size="small" 
        pagination={false}
        columns={[
          { title: '物料编码', dataIndex: 'materialCode' },
          { title: '名称', dataIndex: 'materialName' },
          { title: '规格', dataIndex: 'spec' },
          { title: '单位', dataIndex: 'unit' },
          { title: '来料数量', dataIndex: 'quantity' }
        ]}
      />

      <Divider titlePlacement="left">加工费明细</Divider>
      <Table 
        dataSource={(activeRecord.items || []).map((r, i) => ({ ...r, _key: i }))} 
        rowKey="_key"
        size="small" 
        pagination={false}
        columns={[
          { title: '加工工序/产品', dataIndex: 'processName', render: (v, r) => v || r.productName },
          { title: '规格', dataIndex: 'processSpec', render: (v, r) => v || r.spec },
          { title: '数量', dataIndex: 'quantity' },
          { title: '折后最终价', dataIndex: 'unitPrice', render: v => `¥${(v || 0).toFixed(2)}` },
          { title: '金额', dataIndex: 'amount', render: v => `¥${(v || 0).toFixed(2)}` }
        ]}
      />

      <Row justify="end" style={{ marginTop: 16 }}>
        <Col span={8}>
          <div style={{ textAlign: 'right' }}>
            <Title level={5}>订单总额: <span style={{ color: '#f5222d' }}>¥{(activeRecord.totalAmount || 0).toFixed(2)}</span></Title>
          </div>
        </Col>
      </Row>
    </Space>
  );

  const items = [
    { key: '1', label: '基本信息', children: infoTab },
    { 
      key: '2', 
      label: '来料入库记录', 
      children: (
        <Table 
          dataSource={inboundRecords.filter(r => r.orderNo === activeRecord.orderNo || r.relOrderNo === activeRecord.orderNo)} 
          rowKey="入库单号"
          columns={[{ title: '单号', dataIndex: '入库单号', render: (v, r) => v || r.orderNo }, { title: '状态', dataIndex: '状态', render: (v, r) => v || r.status }, { title: '时间', dataIndex: '时间', render: (v, r) => v || r.inboundDate }]}
          size="small" pagination={false}
        />
      )
    },
    { 
      key: '3', 
      label: '生产工单', 
      children: (
        <Table 
          dataSource={productionOrders.filter(r => r.orderNo === activeRecord.orderNo)} 
          rowKey="工单号"
          columns={[{ title: '工单号', dataIndex: '工单号' }, { title: '产品', dataIndex: '产品' }, { title: '状态', dataIndex: '状态' }]}
          size="small" pagination={false}
        />
      )
    },
    { key: '4', label: '发货通知单', children: <Empty description="暂无发货通知" /> },
    { 
      key: '5', 
      label: '收款记录', 
      children: (
        <Table 
          dataSource={paymentRecords.filter(r => r.orderNo === activeRecord.orderNo)} 
          rowKey="凭证号"
          columns={[{ title: '凭证号', dataIndex: '凭证号' }, { title: '金额', dataIndex: '金额' }, { title: '时间', dataIndex: '时间' }]}
          size="small" pagination={false}
        />
      )
    },
    {
      key: '6',
      label: '审核详情',
      children: (
        <div style={{ padding: '8px' }}>
          <Table 
            rowKey="key"
            size="small" 
            dataSource={auditRecords.map((r, i) => ({ ...r, key: i }))} 
            columns={auditColumns}
            pagination={false}
          />
        </div>
      )
    }
  ];

  return (
    <Drawer forceRender title={`受托加工单详情 - ${activeRecord.orderNo}`} size="large" open={open} onClose={onClose}>
      <Tabs defaultActiveKey="1" items={items} />
    </Drawer>
  );
};

export default ConsignmentDetailDrawer;
