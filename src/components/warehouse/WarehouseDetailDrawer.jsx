
import React from 'react';
import { Drawer, Descriptions, Table, Tag, Button, Space } from 'antd';

const WarehouseDetailDrawer = ({ open, onClose, data }) => {
  if (!data) return null;

  const locationColumns = [
    { title: '货位编码', dataIndex: 'code', width: 220 },
    { title: '名称', dataIndex: 'name' },
    { 
      title: '类型', 
      dataIndex: 'type',
      render: (type) => {
        const colors = { '常规': 'blue', '暂存': 'orange', '待检': 'cyan', '退货区': 'red' };
        return <Tag color={colors[type]}>{type}</Tag>;
      }
    },
    { title: '规格', dataIndex: 'spec' },
  ];

  return (
    <Drawer forceRender
      title={`${data.code} - 仓库详情`}
      placement="right"
      onClose={onClose}
      open={open}
      size="large"
      extra={
        <Button onClick={onClose}>关闭</Button>
      }
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="large">
        <Descriptions title="基本信息" bordered column={2}>
          <Descriptions.Item label="仓库编码">{data.code}</Descriptions.Item>
          <Descriptions.Item label="仓库名称">{data.name}</Descriptions.Item>
          <Descriptions.Item label="仓库类型">{data.type}</Descriptions.Item>
          <Descriptions.Item label="所属子公司">{data.subsidiaryName}</Descriptions.Item>
          <Descriptions.Item label="仓库位置" span={2}>{data.location || '-'}</Descriptions.Item>
          <Descriptions.Item label="仓管员">{data.managerName}</Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={data.enabled ? 'success' : 'error'}>
              {data.enabled ? '已启用' : '已禁用'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="备注" span={2}>{data.remark || '-'}</Descriptions.Item>
        </Descriptions>

        <div>
          <div className="text-base font-bold mb-3">货位信息</div>
          <Table
            dataSource={data.locations}
            columns={locationColumns}
            rowKey="id"
            pagination={false}
            size="small"
            bordered
          />
        </div>
      </Space>
    </Drawer>
  );
};

export default WarehouseDetailDrawer;
