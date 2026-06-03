
import React, { useMemo } from 'react';
import { Modal, Form, Radio, Input, Typography, Descriptions, Table, Divider, Row, Col, Space, Tag, Tooltip } from 'antd';
import { InfoCircleOutlined, SwapOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Text, Title } = Typography;

const QuotationAuditModal = ({ open, onCancel, onConfirm, quotation }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    if (!quotation) return;
    form.validateFields().then(values => {
      onConfirm(values);
      form.resetFields();
    });
  };

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
    <Modal open={open} onCancel={onCancel} title="报价单审核" footer={null} forceRender>
        <div className="p-8 text-center text-gray-400">加载中...</div>
        <div style={{ display: 'none' }}><Form form={form} /></div>
    </Modal>
  );

  const standardColumns = [
    { title: '序号', width: 50, align: 'center', fixed: 'left', render: (_, __, i) => i + 1 },
    { title: '产品编码', dataIndex: 'productCode', width: 140, fixed: 'left' },
    { title: '产品名称', dataIndex: 'productName', width: 160 },
    { title: '规格', dataIndex: 'spec', width: 110, ellipsis: true },
    { title: '型号', dataIndex: 'model', width: 90, ellipsis: true },
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
      title: '可用数量', 
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
    { title: '标准单价', dataIndex: 'standardPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '市场指导价', dataIndex: 'marketPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '底价', dataIndex: 'floorPrice', width: 90, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '优惠折扣率', dataIndex: 'discountRate', width: 100, align: 'center', render: (v) => (v !== undefined ? v.toFixed(2) : '1.00') },
    { title: '价格策略', dataIndex: 'strategyCode', width: 110, align: 'center', render: (v) => v || '-' },
    { 
      title: (
        <Space size={4}>
          <span>折后单价</span>
          <Tooltip title="折后单价=标准单价（1-优惠折扣率）">
            <InfoCircleOutlined className="text-gray-400" style={{ cursor: 'pointer' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'finalPrice', 
      width: 120, 
      align: 'right', 
      render: (v) => <strong className="font-mono text-gray-900">¥{(v || 0).toFixed(2)}</strong> 
    },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
    { title: '金额', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <strong className="font-mono text-amber-600">¥{(v || 0).toFixed(2)}</strong> },
    {
      title: '含税总额',
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
      title: '可用数量', 
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
    { title: '标准单价', dataIndex: 'standardPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '市场指导价', dataIndex: 'marketPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '底价', dataIndex: 'floorPrice', width: 90, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '优惠折扣率', dataIndex: 'discountRate', width: 100, align: 'center', render: (v) => (v !== undefined ? v.toFixed(2) : '1.00') },
    { title: '价格策略', dataIndex: 'strategyCode', width: 110, align: 'center', render: (v) => v || '-' },
    { 
      title: (
        <Space size={4}>
          <span>折后单价</span>
          <Tooltip title="折后单价=标准单价（1-优惠折扣率）">
            <InfoCircleOutlined className="text-gray-400" style={{ cursor: 'pointer' }} />
          </Tooltip>
        </Space>
      ),
      dataIndex: 'finalPrice', 
      width: 120, 
      align: 'right', 
      render: (v) => <strong className="font-mono text-gray-900">¥{(v || 0).toFixed(2)}</strong> 
    },
    { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
    { title: '金额', dataIndex: 'amount', width: 110, align: 'right', render: (v) => <strong className="font-mono text-amber-600">¥{(v || 0).toFixed(2)}</strong> },
    {
      title: '含税总额',
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

  return (
    <Modal forceRender
      title={`报价单审核 - ${quotation.quotationNo}`}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="确认审核"
      cancelText="关闭"
      width={1250}
    >
      <div style={{ maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' }}>
        <Descriptions title="基本信息" bordered size="small" column={3} style={{ marginBottom: 16 }}>
          <Descriptions.Item label="报价单号">{quotation.quotationNo}</Descriptions.Item>
          <Descriptions.Item label="报价日期">{quotation.quotationDate}</Descriptions.Item>
          <Descriptions.Item label="业务员">{quotation.salesperson}</Descriptions.Item>
          <Descriptions.Item label="客户名称" span={2}>{quotation.customerName}</Descriptions.Item>
          <Descriptions.Item label="客户类型">{quotation.customerType || '-'}</Descriptions.Item>
          <Descriptions.Item label="来源预估单号">{quotation.sourceEstimationNo || '-'}</Descriptions.Item>
          <Descriptions.Item label="是否存在定制产品">
            <Tag color={quotation.items?.some(i => i.isCustom) ? "warning" : "default"}>
              {quotation.items?.some(i => i.isCustom) ? '是' : '否'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="是否收取定金">{quotation.isDeposit ? '是' : '否'}</Descriptions.Item>
          <Descriptions.Item label="报价标题" span={3}>{quotation.title || '-'}</Descriptions.Item>
          {quotation.isDeposit && (
            <Descriptions.Item label="定金比例">{((quotation.depositRate || 0) * 100).toFixed(0)}%</Descriptions.Item>
          )}
          {quotation.isDeposit && (
            <Descriptions.Item label="定金应收" span={2}>
              ¥{(calculations.depositAmount || 0).toFixed(2)}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="收款信息" span={3}>{quotation.paymentInfo || '-'}</Descriptions.Item>
          {quotation.remark && (
            <Descriptions.Item label="备注" span={3}>
              {quotation.remark}
            </Descriptions.Item>
          )}
        </Descriptions>

        <Divider titlePlacement="left" style={{ margin: '14px 0 8px 0' }}>标品明细</Divider>
        <Table
          columns={standardColumns}
          dataSource={(quotation.items || []).filter(i => !i.isCustom)}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 2000, y: 180 }}
          className="border border-gray-100 rounded mb-4"
          locale={{ emptyText: '暂无标品' }}
        />

        <Divider titlePlacement="left" style={{ margin: '14px 0 8px 0' }}>定制品明细</Divider>
        <Table
          columns={customColumns}
          dataSource={(quotation.items || []).filter(i => i.isCustom)}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ x: 2200, y: 180 }}
          className="border border-gray-100 rounded"
          locale={{ emptyText: '暂无定制品' }}
        />

        <Divider titlePlacement="left" style={{ margin: '18px 0 10px 0' }}>费用汇总 & 审核操作</Divider>
        
        <Row gap={16} gutter={16}>
          <Col span={10}>
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
          
          <Col span={14}>
            <div className="bg-white p-4 border border-gray-200 rounded-lg">
              <Form
                form={form}
                layout="vertical"
                initialValues={{ auditResult: '审核通过' }}
              >
                <Form.Item
                  name="auditResult"
                  label={<span className="font-semibold text-gray-700">审核操作</span>}
                  rules={[{ required: true, message: '请选择审核操作' }]}
                  style={{ marginBottom: 12 }}
                >
                  <Radio.Group buttonStyle="solid">
                    <Radio.Button value="审核通过" className="px-6">审核通过</Radio.Button>
                    <Radio.Button value="审核拒绝" className="px-6">审核拒绝</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="opinion"
                  label={<span className="font-semibold text-gray-700">审核意见</span>}
                  rules={[{ required: true, message: '请输入审批意见' }]}
                >
                  <TextArea rows={4} placeholder="请输入详尽的审核决定与指导意见..." />
                </Form.Item>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </Modal>
  );
};

export default QuotationAuditModal;
