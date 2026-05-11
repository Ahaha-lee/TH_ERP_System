import React from 'react';
import { Modal, Form, Input, message } from 'antd';

const AddCategoryModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const newCategory = {
      id: `cat_${Date.now()}`,
      name: values.name,
      enabled: true,
      isPreset: false
    };
    onSuccess(newCategory);
    form.resetFields();
  };

  return (
    <Modal
      title="新增客户分类"
      width={900}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="保存"
      cancelText="取消"
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="分类名称"
          rules={[
            { required: true, message: '请输入分类名称' },
            { max: 20, message: '最大20字符' }
          ]}
        >
          <Input placeholder="请输入新的分类名称" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCategoryModal;
