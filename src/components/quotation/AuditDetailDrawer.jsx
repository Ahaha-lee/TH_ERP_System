
import React, { useMemo } from 'react';
import { Drawer, Table, Empty, Tag, Space, Typography } from 'antd';
import { mockAuditRecords } from '../../mock';

const { Text } = Typography;

const AuditDetailDrawer = ({ open, onClose, quotationId, quotationNo }) => {
  const records = useMemo(() => {
    return mockAuditRecords[quotationId] || [];
  }, [quotationId]);

  const columns = [
    { title: '操作时间', dataIndex: 'time', width: 180 },
    { title: '操作人', dataIndex: 'operator', width: 120 },
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

  return (
    <Drawer forceRender
      title={`审核详情 - ${quotationNo}`}
      styles={{ wrapper: { width: 700 } }}
      onClose={onClose}
      open={open}
    >
      {records.length > 0 ? (
        <Table
          dataSource={records}
          columns={columns}
          rowKey={(r) => r.time + r.operator}
          size="small"
          pagination={false}
        />
      ) : (
        <Empty description="暂无审批记录" />
      )}
    </Drawer>
  );
};

export default AuditDetailDrawer;
