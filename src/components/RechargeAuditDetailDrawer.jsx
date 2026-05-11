import React from 'react';
import { Drawer, Table, Tag, Empty } from 'antd';

const RechargeAuditDetailDrawer = ({ open, order, onClose }) => {
  const columns = [
    { title: '操作时间', dataIndex: 'time', key: 'time' },
    { title: '操作人', dataIndex: 'operator', key: 'operator' },
    { 
      title: '操作类型', 
      dataIndex: 'type', 
      key: 'type',
      render: (type) => {
        let color = 'blue';
        if (type === '审核通过') color = 'green';
        if (type === '审核拒绝') color = 'red';
        return <Tag color={color}>{type}</Tag>;
      }
    },
    { title: '审核意见', dataIndex: 'opinion', key: 'opinion' },
  ];

  // Simplified mock audit trail
  const data = order ? [
    { key: '1', time: order.date + ' 10:00:00', operator: order.salesperson, type: '提交', opinion: '申请充值' },
    order.status !== '待审核' ? { 
        key: '2', 
        time: order.date + ' 14:00:00', 
        operator: '财务主管', 
        type: order.status, 
        opinion: order.status === '审核通过' ? '核对无误，通过' : '金额未至' 
    } : null
  ].filter(Boolean) : [];

  return (
    <Drawer forceRender
      title={`审核详情 - ${order?.orderNo || ''}`}
      styles={{ wrapper: { width: 1000 } }}
      open={open}
      onClose={onClose}
    >
      <Table rowKey={(record) => record?.id || record?.key} 
        columns={columns} 
        dataSource={data} 
        pagination={false}
        size="small"
        locale={{ emptyText: <Empty description="暂无审核记录" /> }}
      />
    </Drawer>
  );
};

export default RechargeAuditDetailDrawer;
