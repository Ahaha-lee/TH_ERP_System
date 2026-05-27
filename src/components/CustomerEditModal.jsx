import React, { useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  Cascader, 
  Typography, 
  Table,
  message,
  Space,
  Button
} from 'antd';
import { employees, customerCategories, priceVersions } from '../mock';
import { getDiscountRate } from '../utils/helpers';

const { Text } = Typography;
const { TextArea } = Input;

const CustomerEditModal = ({ open, customer, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const customerType = Form.useWatch('type', form);

  useEffect(() => {
    if (customer) {
      form.setFieldsValue(customer);
    }
  }, [customer, form]);

  const handleSubmit = (values) => {
    Modal.confirm({
      title: '确认保存？',
      content: '确认保存修改后的客户信息？',
      onOk: () => {
        onSuccess({ ...customer, ...values });
      }
    });
  };

  const discountRate = getDiscountRate(customerType || customer?.type, priceVersions, customerCategories);

  return (
    <Modal
      title="客户信息编辑"
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
        {customer ? (
          <>
            <div className="grid grid-cols-2 gap-x-8">
              <Form.Item label="客户编码">
                <Text type="secondary">{customer.code}</Text>
              </Form.Item>
              
              <Form.Item label="客户名称">
                <Text type="secondary">{customer.name}</Text>
              </Form.Item>

              <Form.Item label="客户类型">
                <Text type="secondary">{customer.type}</Text>
              </Form.Item>

              <Form.Item label="当前适用折扣率">
                <Text strong type="danger">{discountRate}</Text>
              </Form.Item>

              <Form.Item
                name="level"
                label="客户等级"
                rules={[{ required: true, message: '请选择客户等级' }]}
              >
                <Select disabled placeholder="请选择客户等级">
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
                <Select disabled placeholder="请选择客户区域">
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
              >
                <Input />
              </Form.Item>

              <Form.Item label="结算方式">
                <Text type="secondary">{customer.settlementMethod}</Text>
              </Form.Item>

              <Form.Item label="业务员">
                <Text type="secondary">{customer.salesperson}</Text>
              </Form.Item>

              <Form.Item
                name="contactName"
                label="联系人名称"
                rules={[{ required: true, message: '请输入联系人名称' }]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="contactPhone"
                label="联系电话"
                rules={[{ required: true, message: '请输入联系电话' }]}
              >
                <Input />
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
            </div>

            <Form.Item
              name="remark"
              label="备注"
            >
              <TextArea rows={2} />
            </Form.Item>
          </>
        ) : (
          <div className="py-10 text-center text-gray-400">加载中...</div>
        )}
      </Form>
    </Modal>
  );
};

export default CustomerEditModal;
