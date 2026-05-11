
import React, { useState } from 'react';
import { Drawer, Tabs, Descriptions, Table, Tag, Statistic, Row, Col, Card, Space, message } from 'antd';
import { materialBasicInfo } from '../../mock';
import { mockStockFlow } from '../../mock';
import { mockStockLedger } from '../../mock';
import { formatCurrency } from '../../utils/helpers';

const MaterialStockDetailDrawer = ({ open, onClose, materialCode }) => {
  const basicInfo = materialBasicInfo[materialCode];
  const flows = mockStockFlow[materialCode] || [];
  const stockDistribution = mockStockLedger.filter(item => item.materialCode === materialCode);

  const totalQty = stockDistribution.reduce((sum, item) => sum + item.currentQty, 0);
  const warehouseCount = new Set(stockDistribution.map(item => item.warehouse)).size;
  const batchCount = new Set(stockDistribution.map(item => item.batchNo)).size;

  const distributionColumns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '仓库', dataIndex: 'warehouse', width: 150 },
    { title: '货位', dataIndex: 'location', width: 120 },
    ...(basicInfo?.materialCategory === '生产物料' ? [
      { title: '批次号', dataIndex: 'batchNo', width: 160, render: (text) => text || '-' },
      { 
        title: '使用部门', 
        dataIndex: 'department', 
        width: 120,
        render: (val, record) => record.materialCategory === '固定资产' ? val : '-'
      },
      { 
        title: '使用人', 
        dataIndex: 'user', 
        width: 100,
        render: (val, record) => record.materialCategory === '固定资产' ? val : '-'
      }
    ] : []),
    { title: '当前库存', dataIndex: 'currentQty', width: 100, align: 'right' },
  ];

  const flowColumns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '时间', dataIndex: 'time', width: 160 },
    { title: '单据类型', dataIndex: 'docType', width: 120 },
    { 
      title: '单据号', 
      dataIndex: 'docNo', 
      width: 160,
      render: (text) => (
        <a onClick={() => message.info(`正在跳转至单据：${text}`)}>{text}</a>
      )
    },
    { title: '仓库', dataIndex: 'warehouse', width: 120 },
    { title: '变动类型', dataIndex: 'changeType', width: 100, render: (type) => (
      <Tag color={type === '入库' ? 'blue' : 'volcano'}>{type}</Tag>
    )},
    { 
      title: '变动数量', 
      dataIndex: 'changeQty', 
      width: 100, 
      align: 'right',
      render: (qty) => <span className={qty > 0 ? 'text-green-600' : 'text-red-600'}>{qty > 0 ? `+${qty}` : qty}</span>
    },
    { title: '结存数量', dataIndex: 'balanceQty', width: 100, align: 'right' },
    { title: '操作人', dataIndex: 'operator', width: 100 },
  ];

  const items = [
    {
      key: 'basic',
      label: '基本信息',
      children: (
        <Descriptions bordered column={2} size="small" className="mt-4">
          <Descriptions.Item label="物料编码">
            {basicInfo?.materialCode}
          </Descriptions.Item>
          {basicInfo?.materialCategory === '固定资产' && (
            <Descriptions.Item label="资产编码">{basicInfo?.assetCode || '-'}</Descriptions.Item>
          )}
          <Descriptions.Item label="物料名称">{basicInfo?.materialName}</Descriptions.Item>
          <Descriptions.Item label="物料大类">
            <Tag color={
              basicInfo?.materialCategory === '生产物料' ? 'blue' : 
              basicInfo?.materialCategory === '低值易耗品' ? 'cyan' : 'orange'
            }>
              {basicInfo?.materialCategory}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="规格型号">{basicInfo?.spec}</Descriptions.Item>
          
          {basicInfo?.materialCategory === '生产物料' ? (
            <>
              <Descriptions.Item label="计量单位">{basicInfo?.unit}</Descriptions.Item>
              <Descriptions.Item label="物料分类">
                <Tag color={
                  basicInfo?.category === '成品' ? 'green' : 
                  basicInfo?.category === '半成品' ? 'blue' : 'orange'
                }>
                  {basicInfo?.category}
                </Tag>
              </Descriptions.Item>
            </>
          ) : basicInfo?.materialCategory === '固定资产' ? (
            <>
              <Descriptions.Item label="使用部门">{basicInfo?.department || '-'}</Descriptions.Item>
              <Descriptions.Item label="使用人">{basicInfo?.user || '-'}</Descriptions.Item>
            </>
          ) : (
            <>
              <Descriptions.Item label="计量单位">{basicInfo?.unit}</Descriptions.Item>
              <Descriptions.Item label="库存数量">{totalQty} {basicInfo?.unit}</Descriptions.Item>
            </>
          )}
          
          <Descriptions.Item label="标准单价">{formatCurrency(basicInfo?.standardPrice)}</Descriptions.Item>
          <Descriptions.Item label="最近盘点日期">{basicInfo?.lastCheckDate || '-'}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{basicInfo?.createTime}</Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'distribution',
      label: '库存分布',
      children: (
        <div className="space-y-4 mt-4">
          <Row gutter={16}>
            <Col span={basicInfo?.materialCategory === '生产物料' ? 8 : 12}>
              <Card size="small" className="bg-blue-50">
                <Statistic title="涉及仓库数" value={warehouseCount} />
              </Card>
            </Col>
            {basicInfo?.materialCategory === '生产物料' && (
              <Col span={8}>
                <Card size="small" className="bg-purple-50">
                  <Statistic title="批次种类数" value={batchCount} />
                </Card>
              </Col>
            )}
            <Col span={basicInfo?.materialCategory === '生产物料' ? 8 : 12}>
              <Card size="small" className="bg-green-50">
                <Statistic title="库存总量" value={totalQty} suffix={basicInfo?.unit} />
              </Card>
            </Col>
          </Row>
          <Table 
            columns={distributionColumns} 
            dataSource={stockDistribution} 
            rowKey="id" 
            size="small" 
            pagination={false}
          />
        </div>
      ),
    },
    {
      key: 'flow',
      label: '出入库记录',
      children: (
        <div className="space-y-4 mt-4">
          <div className="flex justify-end">
            <Space>
              <Tag color="blue">入库合计: {flows.filter(f => f.changeQty > 0).reduce((s, f) => s + f.changeQty, 0)}</Tag>
              <Tag color="red">出库合计: {Math.abs(flows.filter(f => f.changeQty < 0).reduce((s, f) => s + f.changeQty, 0))}</Tag>
            </Space>
          </div>
          <Table 
            columns={flowColumns} 
            dataSource={flows} 
            rowKey="id" 
            size="small"
            scroll={{ x: 1000 }}
            pagination={{ pageSize: 10 }}
          />
        </div>
      ),
    },
  ];

  return (
    <Drawer forceRender
      title={`【${basicInfo?.materialName || '未知'}】-【${materialCode}】库存详情`}
      size="large"
      onClose={onClose}
      open={open}
      destroyOnHidden
    >
      <Tabs defaultActiveKey="distribution" items={items} />
    </Drawer>
  );
};

export default MaterialStockDetailDrawer;
