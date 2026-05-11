import React from 'react';
import { 
  Modal, 
  Form, 
  InputNumber, 
  DatePicker, 
  Input, 
  Typography,
  message 
} from 'antd';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

const PriceVersionModal = ({ open, category, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    const newVersion = {
      id: `ver-${Date.now()}`,
      categoryId: category.id,
      categoryName: category.name,
      discountRate: values.discountRate,
      startDate: values.startDate.format('YYYY-MM-DD'),
      status: '生效',
      reason: values.reason,
      applicant: '管理员',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss')
    };
    onSuccess(newVersion);
    form.resetFields();
  };

  const disabledDate = (current) => {
    // 只能选择今天及以后的日期
    return current && current < dayjs().startOf('day');
  };

  return (
    <Modal
      title="新增折扣版本"
      width={900}
      open={open && !!category}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="保存"
      cancelText="取消"
      forceRender
    >
      {category ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ startDate: dayjs() }}
        >
          <div className="grid grid-cols-2 gap-x-8">
            <Form.Item label="客户分类">
              <Text strong>{category.name}</Text>
            </Form.Item>
            
            <Form.Item
              name="discountRate"
              label="折扣率(%)"
              tooltip="折扣率代表优惠力度，填写 5% 即该类客户享受 95 折优惠。"
              rules={[
                { required: true, message: '请输入折扣率' },
                { type: 'number', min: 0, max: 100, message: '范围0-100' }
              ]}
            >
              <InputNumber
                className="w-full"
                precision={1}
                suffix="%"
                placeholder="请输入"
              />
            </Form.Item>
 
            <Form.Item
              name="startDate"
              label="生效日期"
              rules={[{ required: true, message: '请选择生效日期' }]}
            >
              <DatePicker className="w-full" disabledDate={disabledDate} />
            </Form.Item>
 
            <Form.Item label="操作人">
              <Text>管理员</Text>
            </Form.Item>
          </div>

          <Form.Item
            name="reason"
            label="变更原因"
            rules={[{ required: true, message: '请输入变更原因' }, { max: 250, message: '最大250字符' }]}
          >
            <TextArea rows={4} placeholder="请输入变更原因" />
          </Form.Item>
        </Form>
      ) : (
        <div className="py-10 text-center text-gray-400">正在加载...</div>
      )}
    </Modal>
  );
};

export default PriceVersionModal;
