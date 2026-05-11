import React from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Descriptions, 
  Select,
  message 
} from 'antd';
import { employees } from '../mock';

const { TextArea } = Input;

const RechargeModal = ({ open, customer, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = (values) => {
    // Simulate recharge order creation
    onSuccess(values.amount);
    form.resetFields();
  };

  return (
    <Modal forceRender
      title="充值预存金"
      width={900}
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="确认充值"
      cancelText="取消"
      centered
      
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ salesperson: '管理员' }}
      >
        {customer && (
          <>
            <div className="bg-gray-50 p-4 rounded mb-6">
              <Descriptions size="small" column={2}>
                <Descriptions.Item label="客户编码">{customer.code}</Descriptions.Item>
                <Descriptions.Item label="客户名称">{customer.name}</Descriptions.Item>
                <Descriptions.Item label="客户类型">{customer.type}</Descriptions.Item>
                <Descriptions.Item label="联系人">{customer.contactName}</Descriptions.Item>
                <Descriptions.Item label="联系电话" span={2}>{customer.contactPhone}</Descriptions.Item>
              </Descriptions>
            </div>

            <div className="grid grid-cols-2 gap-x-8">
              <Form.Item
                name="amount"
                label="充值金额"
                rules={[
                  { required: true, message: '请输入充值金额' },
                  { type: 'number', min: 0.01, message: '金额必须大于0' }
                ]}
              >
                <InputNumber
                  className="w-full"
                  precision={2}
                  prefix="¥"
                  placeholder="0.00"
                />
              </Form.Item>

              <Form.Item
                name="salesperson"
                label="业务员"
                rules={[{ required: true, message: '请选择业务员' }]}
              >
                <Select placeholder="请选择业务员">
                  {employees.filter(e => e.status === '在职').map(e => (
                    <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <Form.Item
              name="remark"
              label="备注"
              rules={[{ max: 250, message: '最大250字符' }]}
              className="mb-0"
            >
              <TextArea rows={4} placeholder="请输入充值备注" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  );
};

export default RechargeModal;
