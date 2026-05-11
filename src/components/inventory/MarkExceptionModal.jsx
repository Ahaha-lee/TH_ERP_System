import React, { useState } from 'react';
import { Modal, Checkbox, Input, List, Divider } from 'antd';

const MarkExceptionModal = ({ open, onCancel, onConfirm, items }) => {
  const [selectedKeys, setSelectedKeys] = useState([]);
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (selectedKeys.length === 0) {
      return Modal.warning({ title: '确认', content: '请至少选择一项异常物料' });
    }
    onConfirm(selectedKeys, reason);
  };

  return (
    <Modal forceRender
      title="标记异常"
      width={500}
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      okType="danger"
      okText="标记异常并重新复盘"
    >
      <div className="space-y-4">
        <p className="text-gray-500">标记异常后，该任务状态将变更为“盘点中”，需针对选中物料进行复盘。</p>
        <Divider titlePlacement="left" plain>选择异常物料</Divider>
        <Checkbox.Group className="w-full" value={selectedKeys} onChange={setSelectedKeys}>
          <List
            size="small"
            dataSource={items}
            renderItem={item => (
              <List.Item>
                <Checkbox value={item.productCode}>
                  [{item.productCode}] {item.productName} (差异: {item.diffQty})
                </Checkbox>
              </List.Item>
            )}
          />
        </Checkbox.Group>
        <Divider titlePlacement="left" plain>异常说明</Divider>
        <Input.TextArea 
          rows={3} 
          placeholder="请输入异常说明（非必填）" 
          maxLength={200} 
          showCount
          value={reason}
          onChange={e => setReason(e.target.value)}
        />
      </div>
    </Modal>
  );
};

export default MarkExceptionModal;
