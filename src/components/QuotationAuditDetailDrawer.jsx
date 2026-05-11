import React from 'react';
import { Drawer, Table, Empty, Typography } from 'antd';
import { quotationAuditLogs } from '../mock';

const { Text } = Typography;

const QuotationAuditDetailDrawer = ({ open, quotation, onClose }) => {
  const filteredLogs = quotationAuditLogs.filter(log => log.quotationNo === quotation?.quotationNo);

  const columns = [
    { title: '操作时间', dataIndex: 'time', key: 'time', width: 200 },
    { title: '操作人', dataIndex: 'operator', key: 'operator', width: 120 },
    { title: '审核动作', dataIndex: 'action', key: 'action', width: 120 },
    { title: '审核意见', dataIndex: 'opinion', key: 'opinion' },
  ];

  return (
    <Drawer forceRender
      title={`审核详情 - ${quotation?.quotationNo || ''}`}
      size="large"
      open={open}
      onClose={onClose}
    >
      {filteredLogs.length > 0 ? (
        <Table 
          dataSource={filteredLogs} 
          columns={columns} 
          rowKey={(record) => record?.id || record?.key}
          pagination={false}
          size="small"
        />
      ) : (
        <Empty description="暂无审批记录" style={{ marginTop: 100 }} />
      )}
    </Drawer>
  );
};

export default QuotationAuditDetailDrawer;
