
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Space, Radio } from 'antd';

const PropertySelectModal = ({ open, onCancel, onConfirm, productCode }) => {
  const [form] = Form.useForm();
  
  // Mock data for Material Application Property Group (物料应用属性组)
  // In a real app, this would be fetched based on the productCode or category
  const mockPropertyGroups = [
    { id: 'g1', name: '真皮材质组', options: ['头层牛皮', '二层牛皮', '磨砂皮', '纳帕皮'] },
    { id: 'g2', name: '实木材质组', options: ['胡桃木', '红橡木', '白蜡木', '樱桃木'] },
    { id: 'g3', name: '五金配置组', options: ['不锈钢', '铝合金', '黄铜', '锌合金'] },
  ];

  // Pick a group based on productCode or just pick one for demo
  const [selectedGroup, setSelectedGroup] = useState(mockPropertyGroups[0]);

  useEffect(() => {
    if (open) {
      // Logic to find group based on productCode
      if (productCode === 'PROD001') setSelectedGroup(mockPropertyGroups[0]);
      else if (productCode === 'PROD002') setSelectedGroup(mockPropertyGroups[1]);
      else setSelectedGroup(mockPropertyGroups[2]);
      
      form.setFieldsValue({
        groupName: (productCode === 'PROD001' ? mockPropertyGroups[0] : (productCode === 'PROD002' ? mockPropertyGroups[1] : mockPropertyGroups[2])).name
      });
    }
  }, [open, productCode, form]);

  const handleOk = () => {
    form.validateFields().then(values => {
      onConfirm(values.selectedProperty);
      onCancel();
    });
  };

  return (
    <Modal forceRender
      title="选择属性"
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      centered
      
    >
      <Form form={form} layout="vertical">
        <Form.Item label="物料应用属性组" name="groupName">
          <Input readOnly />
        </Form.Item>
        <Form.Item label="选择属性" name="selectedProperty" rules={[{ required: true, message: '请选择一个属性' }]}>
          <Radio.Group style={{ width: '100%' }}>
            <Space orientation="vertical">
              {selectedGroup.options.map(opt => (
                <Radio key={opt} value={opt}>
                  {opt}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default PropertySelectModal;
