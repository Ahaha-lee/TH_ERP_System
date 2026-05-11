import React, { useState } from 'react';
import { Drawer, Descriptions, Divider, Table, Tag, Typography, Space, Tabs, Button } from 'antd';

const { Text } = Typography;

const SizeRuleDetailDrawer = ({ open, data, onClose }) => {
  const [activeTab, setActiveTab] = useState('basic');
  const [historyDetail, setHistoryDetail] = useState(null);

  if (!data) return null;

  // Mock version history if not present
  const historyData = data.history || [
    { 
      version: 'V2', 
      updateContent: '调整高度阶梯加价金额', 
      updater: '张三', 
      updateTime: '2024-05-01 10:00:00',
      data: { ...data, version: 'V2' } 
    },
    { 
      version: 'V1', 
      updateContent: '初始版本', 
      updater: '李四', 
      updateTime: '2024-04-15 14:30:00',
      data: { ...data, version: 'V1' } 
    },
  ];

  const StepTable = ({ title, config }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <Text strong>{title}阶梯价格</Text>
        <Space>
          <Tag color={config.enabled ? 'green' : 'red'}>{config.enabled ? '已启用' : '已禁用'}</Tag>
          <Text type="secondary">基准：{config.base}mm</Text>
        </Space>
      </div>
      <Table
        size="small"
        pagination={false}
        dataSource={config.steps}
        rowKey="start"
        columns={[
          { title: '起始值(mm)', dataIndex: 'start' },
          { title: '结束值(mm)', dataIndex: 'end', render: (val) => val === 999999 ? '∞' : val },
          { title: '加价金额(元)', dataIndex: 'price', render: (val) => `¥${val}` },
        ]}
      />
    </div>
  );

  const renderBasicInfo = (displayData) => (
    <div className="space-y-6">
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="产品名称">{displayData.productName}</Descriptions.Item>
        <Descriptions.Item label="产品编码">{displayData.productCode}</Descriptions.Item>
        <Descriptions.Item label="版本号">
          <Tag color="blue">{displayData.version || 'V3'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="默认系数">{displayData.coefficient}</Descriptions.Item>
        <Descriptions.Item label="启用状态">
          <Tag color={displayData.isActive ? 'green' : 'red'}>{displayData.isActive ? '启用' : '禁用'}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="基准尺寸" span={2}>
          {displayData.baseSize ? `${displayData.baseSize.length}×${displayData.baseSize.width}×${displayData.baseSize.height}mm` : '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">各维度阶梯详情</Divider>
      <StepTable title="长度" config={displayData.lengthStep} />
      <StepTable title="宽度" config={displayData.widthStep} />
      <StepTable title="高度" config={displayData.heightStep} />
    </div>
  );

  const historyColumns = [
    { title: '版本号', dataIndex: 'version', key: 'version', width: 100 },
    { title: '修改内容', dataIndex: 'updateContent', key: 'updateContent' },
    { title: '操作人', dataIndex: 'updater', key: 'updater', width: 100 },
    { title: '修改时间', dataIndex: 'updateTime', key: 'updateTime', width: 180 },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        <Button type="link" onClick={() => setHistoryDetail(record.data)}>查看详情</Button>
      )
    }
  ];

  return (
    <>
      <Drawer forceRender
        title={`阶梯计价规则详情 - ${data.productName}`}
        size="large"
        open={open}
        onClose={() => {
          setActiveTab('basic');
          onClose();
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'basic',
              label: '基本信息',
              children: renderBasicInfo(data),
            },
            {
              key: 'history',
              label: '版本记录',
              children: (
                <Table
                  dataSource={historyData}
                  columns={historyColumns}
                  rowKey="version"
                  size="small"
                  pagination={false}
                />
              ),
            },
          ]}
        />
      </Drawer>

      <Drawer forceRender
        title={`历史版本详情 - ${historyDetail?.version}`}
        size="large"
        open={!!historyDetail}
        onClose={() => setHistoryDetail(null)}
      >
        {historyDetail && renderBasicInfo(historyDetail)}
      </Drawer>
    </>
  );
};

export default SizeRuleDetailDrawer;
