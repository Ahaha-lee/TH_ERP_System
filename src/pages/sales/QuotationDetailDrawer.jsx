
import React, { useMemo } from 'react';
import { Drawer, Descriptions, Table, Typography, Space, Tag, Empty, Divider, Row, Col, Tabs, Tooltip } from 'antd';
import { SwapOutlined } from '@ant-design/icons';
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

  const calculations = useMemo(() => {
    if (!quotation) return {};
    const items = quotation.items || [];
    const productTotal = items.reduce((acc, curr) => acc + ((curr.standardPrice || curr.unitPrice || 0) * (curr.quantity || 0)), 0);
    const discountedTotal = items.reduce((acc, curr) => acc + ((curr.finalPrice || curr.unitPrice || 0) * (curr.quantity || 0)), 0);
    const saving = Math.max(0, productTotal - discountedTotal);
    
    // Parse taxRate
    const activeTaxRateStr = quotation.taxRate ?? '13%';
    const clean = String(activeTaxRateStr).replace('%', '').trim();
    const num = parseFloat(clean);
    const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);

    const taxedProductTotal = discountedTotal * (1 + rate);
    const totalAmount = taxedProductTotal + (quotation.otherFees || 0);
    const depositAmount = quotation.isDeposit ? totalAmount * (quotation.depositRate || 0) : 0;
    return {
      productTotal,
      discountedTotal,
      saving,
      taxedProductTotal,
      totalAmount,
      depositAmount
    };
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

  const standardColumns = [
    { title: '序号', width: 50, align: 'center', fixed: 'left', render: (_, __, i) => i + 1 },
    { title: '产品编码', dataIndex: 'productCode', width: 140, fixed: 'left' },
    { title: '产品名称', dataIndex: 'productName', width: 160 },
    { title: '规格', dataIndex: 'spec', width: 110, ellipsis: true },
    { title: '型号', dataIndex: 'model', width: 90, ellipsis: true },
    { title: '单位', dataIndex: 'unit', width: 70, align: 'center', render: (v) => v || '个' },
    { 
      title: '产品类型', 
      dataIndex: 'category', 
      width: 90, 
      align: 'center', 
      render: (val) => {
        const v = val || '成品';
        const colorMap = {
          '定制成品': 'purple',
          '成品': 'blue',
          '半成品': 'orange',
          '原材料': 'green',
          '配件': 'cyan'
        };
        return (
          <Tag color={colorMap[v] || 'blue'} className="m-0 border-none px-2 py-0.5 rounded font-medium text-[11px]">
            {v}
          </Tag>
        );
      }
    },
    { 
      title: '库存数量', 
      dataIndex: 'stockQty', 
      width: 80, 
      align: 'right',
      render: (v) => <span className="font-mono">{v ?? 0}</span>
    },
    { 
      title: '可售数量', 
      dataIndex: 'availableQty', 
      width: 80, 
      align: 'right',
      render: (v) => <span className="font-mono text-blue-600">{v ?? 0}</span>
    },
    { 
      title: '占用数量', 
      width: 80, 
      align: 'right',
      render: (_, record) => {
        const stock = record.stockQty ?? 0;
        const available = record.availableQty ?? 0;
        return <span className="font-mono text-amber-600">{Math.max(0, stock - available)}</span>;
      }
    },
    { 
      title: '在制数量', 
      dataIndex: 'wipQty', 
      width: 80, 
      align: 'right',
      render: (v, rec) => {
        const val = rec.wipQty ?? (rec.id?.startsWith('std_') || rec.id?.startsWith('new') ? 0 : 35);
        return <span className="font-mono text-gray-500">{val}</span>;
      }
    },
    { 
      title: '标准单价', 
      dataIndex: 'standardPrice', 
      width: 100, 
      align: 'right', 
      render: (v) => `¥${(v || 0).toFixed(2)}` 
    },
    { title: '市场指导价', dataIndex: 'marketPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '底价', dataIndex: 'floorPrice', width: 90, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '优惠折扣率', dataIndex: 'discountRate', width: 100, align: 'center', render: (v) => (v !== undefined ? v.toFixed(2) : '1.00') },
    { title: '价格策略', dataIndex: 'strategyCode', width: 110, align: 'center', render: (v) => v || '-' },
    { title: '折后单价', dataIndex: 'finalPrice', width: 110, align: 'right', render: (v) => <strong className="font-mono text-gray-900">¥{(v || 0).toFixed(2)}</strong> },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
    { title: '标准总金额', width: 110, align: 'right', render: (_, record) => `¥${((record.standardPrice || 0) * (record.quantity || 1)).toFixed(2)}` },
    { title: '折后金额（不含税）', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <strong className="font-mono text-amber-600">¥{(v || 0).toFixed(2)}</strong> },
    {
      title: '折后金额（含税）',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const amt = (record.finalPrice || record.unitPrice || 0) * (record.quantity || 1);
        const activeTaxRateStr = quotation.taxRate ?? '13%';
        const clean = String(activeTaxRateStr).replace('%', '').trim();
        const num = parseFloat(clean);
        const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);
        const taxedAmt = amt * (1 + rate);
        return <strong className="font-mono text-amber-600">¥{taxedAmt.toFixed(2)}</strong>;
      }
    },
    { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true }
  ];

  const customColumns = [
    { title: '序号', width: 50, align: 'center', fixed: 'left', render: (_, __, i) => i + 1 },
    { title: '定制品编码', dataIndex: 'productCode', width: 140, fixed: 'left' },
    { title: '定制品名称', dataIndex: 'productName', width: 160 },
    { title: '规格', dataIndex: 'spec', width: 110, ellipsis: true },
    { title: '型号', dataIndex: 'model', width: 90, ellipsis: true },
    { title: '单位', dataIndex: 'unit', width: 70, align: 'center', render: (v) => v || '个' },
    { 
      title: '产品类型', 
      dataIndex: 'category', 
      width: 90, 
      align: 'center', 
      render: (val) => {
        const v = val || '定制成品';
        const colorMap = {
          '定制成品': 'purple',
          '成品': 'blue',
          '半成品': 'orange',
          '原材料': 'green',
          '配件': 'cyan'
        };
        return (
          <Tag color={colorMap[v] || 'purple'} className="m-0 border-none px-2.5 py-0.5 rounded font-medium text-[11px]">
            {v}
          </Tag>
        );
      }
    },
    {
      title: '替代料明细',
      dataIndex: 'substituteProductCode',
      width: 200,
      render: (val, record) => {
        const hasSubstitute = !!val;
        const codes = val ? val.split(',') : [];
        const names = record.substituteProductName ? record.substituteProductName.split(',') : [];
        return hasSubstitute ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }} className="w-full">
            {codes.map((code, idx) => (
              <div 
                key={code} 
                className="flex flex-col gap-0.5 px-2 py-1 bg-amber-50/65 border border-amber-100 rounded text-[10px] text-amber-700 font-medium leading-tight"
                style={{ borderLeft: '3px solid #d97706' }}
              >
                <div className="flex items-center gap-1 w-full justify-between">
                  <span className="font-semibold text-amber-800 flex items-center gap-1">
                    <SwapOutlined style={{ fontSize: '10px' }} className="text-amber-600 shrink-0" />
                    {names[idx] || '替代项'}
                  </span>
                  <span className="font-mono text-gray-400 scale-90">({code})</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <span className="text-gray-400 text-xs">无替代配置</span>
        );
      }
    },
    { 
      title: '库存数量', 
      dataIndex: 'stockQty', 
      width: 80, 
      align: 'right',
      render: (v) => <span className="font-mono">{v ?? 0}</span>
    },
    { 
      title: '可售数量', 
      dataIndex: 'availableQty', 
      width: 80, 
      align: 'right',
      render: (v) => <span className="font-mono text-blue-600">{v ?? 0}</span>
    },
    { 
      title: '占用数量', 
      width: 80, 
      align: 'right',
      render: (_, record) => {
        const stock = record.stockQty ?? 0;
        const available = record.availableQty ?? 0;
        return <span className="font-mono text-amber-600">{Math.max(0, stock - available)}</span>;
      }
    },
    { 
      title: '在制数量', 
      dataIndex: 'wipQty', 
      width: 80, 
      align: 'right',
      render: (v, rec) => {
        const val = rec.wipQty ?? (rec.id?.startsWith('cust_') || rec.id?.startsWith('new') ? 0 : 15);
        return <span className="font-mono text-gray-500">{val}</span>;
      }
    },
    { 
      title: '标准单价', 
      dataIndex: 'standardPrice', 
      width: 100, 
      align: 'right', 
      render: (v) => `¥${(v || 0).toFixed(2)}` 
    },
    { title: '市场指导价', dataIndex: 'marketPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '底价', dataIndex: 'floorPrice', width: 90, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '优惠折扣率', dataIndex: 'discountRate', width: 100, align: 'center', render: (v) => (v !== undefined ? v.toFixed(2) : '1.00') },
    { title: '价格策略', dataIndex: 'strategyCode', width: 110, align: 'center', render: (v) => v || '-' },
    { title: '折后单价', dataIndex: 'finalPrice', width: 110, align: 'right', render: (v) => <strong className="font-mono text-gray-900">¥{(v || 0).toFixed(2)}</strong> },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
    { title: '标准总金额', width: 110, align: 'right', render: (_, record) => `¥${((record.standardPrice || 0) * (record.quantity || 1)).toFixed(2)}` },
    { title: '折后金额（不含税）', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <strong className="font-mono text-amber-600">¥{(v || 0).toFixed(2)}</strong> },
    {
      title: '折后金额（含税）',
      width: 120,
      align: 'right',
      render: (_, record) => {
        const amt = (record.finalPrice || record.unitPrice || 0) * (record.quantity || 1);
        const activeTaxRateStr = quotation.taxRate ?? '13%';
        const clean = String(activeTaxRateStr).replace('%', '').trim();
        const num = parseFloat(clean);
        const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);
        const taxedAmt = amt * (1 + rate);
        return <strong className="font-mono text-amber-600">¥{taxedAmt.toFixed(2)}</strong>;
      }
    },
    { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true }
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
        <Descriptions.Item label="预计交期">{quotation.expectedDeliveryDate || '-'}</Descriptions.Item>
        <Descriptions.Item label="报价有效期" span={2}>
          {quotation.validityRange ? `${quotation.validityRange[0]} 至 ${quotation.validityRange[1]}` : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="客户类型">{quotation.customerType || '-'}</Descriptions.Item>
        <Descriptions.Item label="来源预估单号">{quotation.sourceEstimationNo || '-'}</Descriptions.Item>
        <Descriptions.Item label="税率">{quotation.taxRate || '13%'}</Descriptions.Item>
        <Descriptions.Item label="客户名称" span={2}>{quotation.customerName}</Descriptions.Item>
        <Descriptions.Item label="是否存在定制产品">
          <Tag color={quotation.items?.some(i => i.isCustom) ? "warning" : "default"}>
            {quotation.items?.some(i => i.isCustom) ? '是' : '否'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="是否收取定金">{quotation.isDeposit ? '是' : '否'}</Descriptions.Item>
        {quotation.isDeposit && (
          <Descriptions.Item label="定金比例" span={2}>{((quotation.depositRate || 0) * 100).toFixed(0)}%</Descriptions.Item>
        )}
        {quotation.isDeposit && (
          <Descriptions.Item label="定金应收" span={3}>
            {formatCurrency(calculations.depositAmount)}
          </Descriptions.Item>
        )}
        {!quotation.isDeposit && (
          <Descriptions.Item label="结算方式" span={2}>全额支付</Descriptions.Item>
        )}
        <Descriptions.Item label="报价标题" span={3}>{quotation.title || '-'}</Descriptions.Item>
        <Descriptions.Item label="收款信息" span={3}>{quotation.paymentInfo || '-'}</Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{quotation.remark || '-'}</Descriptions.Item>
        {quotation.relatedOrderNo && (
          <Descriptions.Item label="关联销售订单" span={3}>
            <Text type="success" style={{ fontWeight: 'bold' }}>{quotation.relatedOrderNo}</Text>
          </Descriptions.Item>
        )}
      </Descriptions>
 
      <Divider titlePlacement="left" style={{ margin: '16px 0 8px 0' }}>标品明细</Divider>
      <Table
        dataSource={(quotation.items || []).filter(i => !i.isCustom)}
        columns={standardColumns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 2000, y: 300 }}
        className="border border-gray-100 rounded mb-4"
        locale={{ emptyText: '暂无标品' }}
      />
 
      <Divider titlePlacement="left" style={{ margin: '16px 0 8px 0' }}>定制品明细</Divider>
      <Table
        dataSource={(quotation.items || []).filter(i => i.isCustom)}
        columns={customColumns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 2200, y: 300 }}
        className="border border-gray-100 rounded"
        locale={{ emptyText: '暂无定制品' }}
      />
 
      <Divider />
      
      <Row justify="end">
        <Col span={8}>
          <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <div className="text-xs font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-1">费用汇总 / Summary</div>
            <Space orientation="vertical" size="small" style={{ width: '100%' }}>
              <Row wrap={false} align="middle">
                <Col span={14} className="text-gray-500 text-xs">订单总额:</Col>
                <Col span={10} className="text-right font-mono text-gray-700">¥{(calculations.productTotal || 0).toFixed(2)}</Col>
              </Row>
              
              <Row wrap={false} align="middle">
                <Col span={14} className="text-gray-500 text-xs">优惠金额:</Col>
                <Col span={10} className="text-right font-mono text-green-600 font-semibold">- ¥{(calculations.saving || 0).toFixed(2)}</Col>
              </Row>
              
              <Row wrap={false} align="middle">
                <Col span={14} className="text-gray-500 text-xs font-semibold">订单不含税折后总额:</Col>
                <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{(calculations.discountedTotal || 0).toFixed(2)}</Col>
              </Row>
              
              <Row wrap={false} align="middle">
                <Col span={14} className="text-gray-500 text-xs font-semibold">订单含税折后总额:</Col>
                <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{(calculations.taxedProductTotal || 0).toFixed(2)}</Col>
              </Row>
              
              <Row wrap={false} align="middle">
                <Col span={14} className="text-gray-500 text-xs font-medium">其他费用:</Col>
                <Col span={10} className="text-right font-mono text-gray-700">¥{(quotation.otherFees || 0).toFixed(2)}</Col>
              </Row>
              
              <Divider style={{ margin: '6px 0' }} />
              
              <Row wrap={false} align="middle">
                <Col span={14} className="text-gray-800 font-semibold text-sm">订单应收总额:</Col>
                <Col span={10} className="text-right font-mono text-red-600 font-bold text-lg">¥{(calculations.totalAmount || 0).toFixed(2)}</Col>
              </Row>
              
              {quotation.isDeposit && (
                <Row wrap={false} align="middle" className="bg-amber-50 p-1 border border-dashed border-amber-200 rounded">
                  <Col span={14} className="text-amber-800 text-xs font-medium">
                    定金应收 ({((quotation.depositRate || 0) * 100).toFixed(0)}%):
                  </Col>
                  <Col span={10} className="text-right font-mono text-amber-600 font-bold">
                    ¥{(calculations.depositAmount || 0).toFixed(2)}
                  </Col>
                </Row>
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
      title={
        <Space>
          <span>报价单详情 - {quotation.quotationNo}</span>
          {quotation.hasCustomProduct && <Tag color="error">存在定制产品</Tag>}
        </Space>
      }
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
