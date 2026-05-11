import React from 'react';
import { Table, Typography, Card } from 'antd';

const { Text } = Typography;

const DimensionTable = ({ title, dimName, custom, config }) => {
  if (!config || !config.enabled) {
    return (
      <Card size="small" title={title} className="bg-gray-50 border-dashed mb-4">
        <div className="text-center py-4 text-gray-400">该维度未启用阶梯计价</div>
      </Card>
    );
  }

  const excess = Math.max(custom - config.base, 0);
  const matchedStep = config.steps.find(s => excess >= s.start && excess < s.end);
  const dimSurcharge = matchedStep ? matchedStep.price : 0;
  
  const columns = [
    { 
      title: '定制尺寸', 
      dataIndex: 'custom', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center'
    },
    { 
      title: '基准尺寸', 
      dataIndex: 'base', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center'
    },
    { 
      title: '超出基准', 
      dataIndex: 'excess', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center',
      render: (val) => <Text type={val > 0 ? "danger" : "secondary"}>{val}mm</Text>
    },
    { 
      title: '阶梯区间', 
      dataIndex: 'range',
      render: (val, record) => (
        <span className={record.matched ? "font-bold text-blue-600" : ""}>{val}</span>
      )
    },
    { 
      title: '加价金额', 
      dataIndex: 'price',
      render: (val, record) => (
        <span className={record.matched ? "font-bold text-blue-600" : ""}>¥{val}</span>
      )
    },
    { 
      title: '维度加价', 
      dataIndex: 'dimSurcharge', 
      onCell: (_, index) => ({ rowSpan: index === 0 ? config.steps.length : 0 }),
      align: 'center',
      render: (val) => <Text strong className="text-lg">¥{val}</Text>
    },
  ];

  const dataSource = config.steps.map((step, idx) => {
    const isMatched = excess >= step.start && excess < step.end;
    return {
      key: idx,
      custom: `${custom}mm`,
      base: `${config.base}mm`,
      excess,
      range: `${step.start}-${step.end === 999999 ? '∞' : step.end}mm: ${step.price}元`,
      price: step.price,
      matched: isMatched,
      dimSurcharge
    };
  });

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <Text strong className="text-gray-600">{title}</Text>
      </div>
      <Table 
        size="small" 
        pagination={false} 
        bordered 
        columns={columns} 
        dataSource={dataSource} 
        rowKey="key"
      />
    </div>
  );
};

const SizePricingDisplay = ({ customSize, rule }) => {
  if (!rule) return <Text type="secondary">未配置阶梯规则</Text>;

  return (
    <div className="bg-white rounded border p-4 mb-4">
      <Text strong className="text-lg block mb-4">产品对应阶梯尺寸信息</Text>
      <DimensionTable title="长度维度" custom={customSize.length} config={rule.lengthStep} />
      <DimensionTable title="宽度维度" custom={customSize.width} config={rule.widthStep} />
      <DimensionTable title="高度维度" custom={customSize.height} config={rule.heightStep} />
    </div>
  );
};

export default SizePricingDisplay;
