import React from 'react';
import { Modal } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

const ApprovalModal = ({ open, onCancel, onConfirm }) => {
  return (
    <Modal forceRender
      title="审批确认"
      width={500}
      open={open}
      onCancel={onCancel}
      onOk={onConfirm}
      okText="确认通过"
    >
      <div className="flex gap-4">
        <QuestionCircleOutlined className="text-orange-500 text-2xl mt-1" />
        <p className="text-base">确认审批通过该盘点任务吗？审批通过后即可进行“确认完成”操作。</p>
      </div>
    </Modal>
  );
};

export default ApprovalModal;
