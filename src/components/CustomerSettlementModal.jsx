import React, { useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Select, 
  message 
} from 'antd';
import { employees, customerCategories } from '../mock';

const CustomerSettlementModal = ({ open, customer, onClose, onSuccess }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (customer) {
      form.setFieldsValue({
        type: customer.type,
        settlementMethod: customer.settlementMethod,
        salesperson: customer.salesperson
      });
    }
  }, [customer, form]);

  const handleSubmit = (values) => {
    onSuccess({ ...customer, ...values });
    message.success('结算信息变更成功');
  };

  return (
    <Modal forceRender
      title="变更结算信息"
      open={open}
      onCancel={onClose}
      onOk={() => form.submit()}
      okText="确定"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="type"
          label="客户类型"
          rules={[{ required: true, message: '请选择客户类型' }]}
        >
          <Select>
            {customerCategories.filter(c => c.enabled).map(c => (
              <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="settlementMethod"
          label="结算方式"
          rules={[{ required: true, message: '请选择结算方式' }]}
        >
          <Select>
            <Select.Option value="月结">月结</Select.Option>
            <Select.Option value="现结">现结</Select.Option>
            <Select.Option value="预存">预存</Select.Option>
            <Select.Option value="现金">现金</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="salesperson"
          label="业务员"
          rules={[{ required: true, message: '请选择业务员' }]}
        >
          <Select>
            {employees.filter(e => e.status === '在职').map(e => (
              <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
            ))}
          </Select>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default CustomerSettlementModal;
