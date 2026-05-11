import React from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Cascader, 
  InputNumber, 
  Switch, 
  Button, 
  Space, 
  message 
} from 'antd';
import dayjs from 'dayjs';
import { employees, customerCategories } from '../mock';
import { generateCustomerCode } from '../utils/helpers';

const { TextArea } = Input;

const AddCustomerModal = ({ open, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const settlementMethod = Form.useWatch('settlementMethod', form);

  const handleSubmit = (values) => {
    const newCustomer = {
      ...values,
      id: Date.now().toString(),
      code: generateCustomerCode(Math.floor(Math.random() * 1000)),
      prepaidBalance: values.settlementMethod === '预存' ? (values.prepaidBalance || 0) : 0,
      approvalStatus: '审批通过',
      createdAt: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      status: values.status ? '启用' : '禁用',
    };
    
    onSuccess(newCustomer);
    message.success('新增成功');
    form.resetFields();
  };

  return (
    <Modal
      title="新增客户"
      width={900}
      centered
      open={open}
      onCancel={onClose}
      forceRender
      onOk={() => form.submit()}
      okText="保存"
      cancelText="取消"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ status: true, prepaidBalance: 0 }}
        className="mt-4"
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Form.Item
            name="name"
            label="客户名称"
            rules={[{ required: true, message: '请输入客户名称' }, { max: 50, message: '最大50字符' }]}
          >
            <Input placeholder="请输入客户名称" />
          </Form.Item>
          
          <Form.Item
            name="type"
            label="客户类型"
            rules={[{ required: true, message: '请选择客户类型' }]}
          >
            <Select placeholder="请选择客户类型">
              {customerCategories.filter(c => c.enabled).map(c => (
                <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="region"
            label="客户行政区划"
          >
            <Cascader
              placeholder="请选择省/市/区"
              options={[
                {
                  value: '广东',
                  label: '广东',
                  children: [
                    { value: '广州', label: '广州', children: [{ value: '天河区', label: '天河区' }] },
                    { value: '深圳', label: '深圳', children: [{ value: '南山区', label: '南山区' }] },
                  ]
                },
                {
                  value: '北京',
                  label: '北京',
                  children: [{ value: '北京市', label: '北京市', children: [{ value: '朝阳区', label: '朝阳区' }] }]
                }
              ]}
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="客户详细地址"
            rules={[{ max: 100, message: '最大100字符' }]}
          >
            <Input placeholder="请输入客户详细地址" />
          </Form.Item>

          <Form.Item
            name="settlementMethod"
            label="结算方式"
            rules={[{ required: true, message: '请选择结算方式' }]}
          >
            <Select placeholder="请选择结算方式">
              <Select.Option value="月结">月结</Select.Option>
              <Select.Option value="现结">现结</Select.Option>
              <Select.Option value="预存">预存</Select.Option>
              <Select.Option value="现金">现金</Select.Option>
            </Select>
          </Form.Item>

          {settlementMethod === '月结' && (
            <Form.Item
              name="monthlyCycle"
              label="月结周期"
              rules={[{ required: true, message: '请输入月结周期' }]}
            >
              <Input placeholder="例如：30天" />
            </Form.Item>
          )}

          {settlementMethod === '预存' && (
            <Form.Item
              name="prepaidBalance"
              label="预存余额"
            >
              <InputNumber
                className="w-full"
                precision={2}
                prefix="¥"
                placeholder="0.00"
              />
            </Form.Item>
          )}

          <Form.Item
            name="salesperson"
            label="业务员"
            rules={[{ required: true, message: '请选择业务员' }]}
          >
            <Select placeholder="请选择在职员工">
              {employees.filter(e => e.status === '在职').map(e => (
                <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="contactName"
            label="联系人名称"
            rules={[{ required: true, message: '请输入联系人名称' }, { max: 20, message: '最大20字符' }]}
          >
            <Input placeholder="请输入联系人名称" />
          </Form.Item>

          <Form.Item
            name="contactPhone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$/, message: '请输入正确的手机号或座机号' }
            ]}
          >
            <Input placeholder="请输入手机或座机" />
          </Form.Item>

          <Form.Item
            name="status"
            label="是否启用"
            valuePropName="checked"
          >
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </div>

        <Form.Item
          name="remark"
          label="备注"
          rules={[{ max: 250, message: '最大250字符' }]}
        >
          <TextArea rows={4} placeholder="请输入备注内容" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AddCustomerModal;
