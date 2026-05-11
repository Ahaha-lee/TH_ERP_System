
import React from 'react';
import { Modal, Table, Tag } from 'antd';
import { mockMaterialReceipts } from '../../mock';

const MaterialReceiptProgressModal = ({ open, onCancel, orderNo }) => {
  const data = mockMaterialReceipts.filter(r => r.orderNo === orderNo);

  const columns = [
    { title: '入库单号', dataIndex: 'receiptNo' },
    { title: '物料名称', dataIndex: 'materialName' },
    { title: '应收数量', dataIndex: 'expectQuantity' },
    { title: '已收数量', dataIndex: 'receivedQuantity' },
    { title: '仓库', dataIndex: 'warehouse' },
    { title: '状态', dataIndex: 'status', render: s => <Tag color="green">{s}</Tag> },
    { title: '业务员', dataIndex: 'operator' }
  ];

  return (
    <Modal forceRender title={`来料入库进度 - ${orderNo}`} open={open} onCancel={onCancel} width={900} footer={null}>
      <Table dataSource={data} columns={columns} rowKey="id" size="small" pagination={false} />
    </Modal>
  );
};

export default MaterialReceiptProgressModal;
