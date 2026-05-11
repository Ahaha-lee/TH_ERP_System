import React from 'react';
import { Modal, Form, Table, InputNumber, Button, Space, message } from 'antd';

const DeliveryNoticeModal = ({ open, onCancel, order }) => {
  const handleConfirm = () => {
    message.success('已发起发货通知');
    onCancel();
  };

  const columns = [
    { title: '产品名称', dataIndex: 'productName' },
    { title: '规格', dataIndex: 'spec' },
    { title: '未发数量', dataIndex: 'quantity' },
    { title: '本次发货数量', render: (_, rec) => <InputNumber min={0} max={rec.quantity} defaultValue={rec.quantity} /> }
  ];

  return (
    <Modal forceRender
      title={`发起发货通知 - ${order?.orderNo}`}
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={800}
    >
      <Table dataSource={order?.items || []} columns={columns} rowKey="id" size="small" pagination={false} />
    </Modal>
  );
};

export default DeliveryNoticeModal;
