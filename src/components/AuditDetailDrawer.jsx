import React from 'react';
import { Drawer, Table, Empty } from 'antd';

const AuditDetailDrawer = ({ open, target, onClose }) => {
  const columns = [
    { title: '操作时间', dataIndex: 'time', key: 'time' },
    { title: '审核人', dataIndex: 'operator', key: 'operator' },
    { title: '审核动作', dataIndex: 'type', key: 'type' },
    { title: '审核意见', dataIndex: 'content', key: 'content' },
  ];

  // Simplified: using the same log data for now
  const dataSource = target ? [] : []; // In real app, fetch by target.id

  return (
    <Drawer forceRender
      title={`审核详情 - ${target?.code || ''}`}
      styles={{ wrapper: { width: 1000 } }}
      open={open}
      onClose={onClose}
    >
      <Table rowKey={(record) => record?.id || record?.key} 
        columns={columns} 
        dataSource={dataSource} 
        pagination={false}
        locale={{ emptyText: <Empty description="暂无审核记录" /> }}
      />
    </Drawer>
  );
};

export default AuditDetailDrawer;
