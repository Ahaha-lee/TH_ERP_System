import React from 'react';
import { Modal, Table, Tag } from 'antd';

const ProductionPlanModal = ({ open, onCancel, orderNo }) => {
  const columns = [
    { title: '工序序号', dataIndex: 'seq', width: 80 },
    { title: '工序名称', dataIndex: 'name' },
    { title: '关联岗位', dataIndex: 'post' },
    { title: '计划开始', dataIndex: 'startDate' },
    { title: '计划结束', dataIndex: 'endDate' },
    { title: '计划数量', dataIndex: 'qty' },
    { title: '状态', dataIndex: 'status', render: (val) => <Tag>{val}</Tag> }
  ];

  const data = [
    { id: '1', seq: 1, name: '备料工序', post: '开料岗', startDate: '2025-04-23', endDate: '2025-04-24', qty: 10, status: '完成' },
    { id: '2', seq: 2, name: '组装工序', post: '组装岗', startDate: '2025-04-25', endDate: '2025-04-26', qty: 10, status: '计划中' }
  ];

  return (
    <Modal forceRender
      title={`排产计划 - ${orderNo}`}
      open={open}
      onCancel={onCancel}
      footer={null}
      width={900}
    >
      <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={false} />
    </Modal>
  );
};

export default ProductionPlanModal;
