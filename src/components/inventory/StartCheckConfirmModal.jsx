import React from 'react';
import { Modal, Typography, Space } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

const StartCheckConfirmModal = ({ open, onCancel, onConfirm }) => {
  return (
    <Modal forceRender
      title="确认开始盘点"
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认开始"
      cancelText="取消"
      width={500}
    >
      <Space align="start">
        <ExclamationCircleOutlined style={{ color: '#faad14', fontSize: '22px' }} />
        <div>
          <Text strong>开始盘点后，系统将记录当前库存快照作为盘点基准。</Text>
          <br />
          <Text type="secondary">盘点期间仓库建议停止调拨和出入库作业。确认开始？</Text>
        </div>
      </Space>
    </Modal>
  );
};

export default StartCheckConfirmModal;
