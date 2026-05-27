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
            name="level"
            label="客户等级"
            rules={[{ required: true, message: '请选择客户等级' }]}
          >
            <Select placeholder="请选择客户等级">
              <Select.Option value="S级">S级</Select.Option>
              <Select.Option value="A级">A级</Select.Option>
              <Select.Option value="B级">B级</Select.Option>
              <Select.Option value="C级">C级</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="region"
            label="客户区域"
            rules={[{ required: true, message: '请选择客户区域' }]}
          >
            <Select placeholder="请选择客户区域">
              <Select.Option value="华东">华东</Select.Option>
              <Select.Option value="华南">华南</Select.Option>
              <Select.Option value="华北">华北</Select.Option>
              <Select.Option value="西南">西南</Select.Option>
              <Select.Option value="西北">西北</Select.Option>
              <Select.Option value="东北">东北</Select.Option>
              <Select.Option value="华中">华中</Select.Option>
              <Select.Option value="全国">全国</Select.Option>
            </Select>
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
            name="logisticsAddress"
            label="物流地址"
            rules={[{ required: true, message: '请输入物流地址' }]}
          >
            <Input placeholder="请输入物流地址" />
          </Form.Item>

          <Form.Item
            name="logisticsContact"
            label="物流联系人"
            rules={[{ required: true, message: '请输入物流联系人' }]}
          >
            <Input placeholder="请输入物流联系人" />
          </Form.Item>

          <Form.Item
            name="logisticsContactPhone"
            label="物流联系人电话"
            rules={[
              { required: true, message: '请输入物流联系人电话' },
              { pattern: /^1[3-9]\d{9}$|^\d{3,4}-\d{7,8}$/, message: '请输入正确的手机号或座机号' }
            ]}
          >
            <Input placeholder="请输入物流联系人电话" />
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
