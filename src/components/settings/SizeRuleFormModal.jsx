import React, { useState } from 'react';
import { Modal, Form, Select, InputNumber, Switch, Table, Button, Space, Typography, Card, Divider } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { products } from '../../mock';

const { Text, Title } = Typography;

const SizeRuleFormModal = ({ open, initialValues, onCancel, onSave }) => {
  const [form] = Form.useForm();
  const [selectedProductId, setSelectedProductId] = useState(initialValues?.productId);

  const saleableProducts = products.filter(p => p.saleable);

  const handleFinish = (values) => {
    // Validate continuity
    const validateSteps = (steps) => {
      if (!steps || steps.length === 0) return true;
      let prevEnd = 0;
      for (let i = 0; i < steps.length; i++) {
        if (steps[i].start !== prevEnd) return false;
        if (steps[i].end <= steps[i].start) return false;
        prevEnd = steps[i].end;
      }
      return true;
    };

    if (!validateSteps(values.lengthSteps) || !validateSteps(values.widthSteps) || !validateSteps(values.heightSteps)) {
      // Logic for reporting continuity error can be added
    }

    onSave({ ...values, productId: selectedProductId });
    form.resetFields();
  };

  const StepTable = ({ name, label }) => (
    <Card size="small" title={`${label}阶梯配置`} className="mb-4">
      <Space className="mb-2">
        <Form.Item name={[name, 'enabled']} label="启用" valuePropName="checked" noStyle>
          <Switch size="small" />
        </Form.Item>
        <Form.Item name={[name, 'base']} label="基准尺寸(mm)" rules={[{ required: true, message: '必填' }]} noStyle>
          <InputNumber placeholder="基准" size="small" />
        </Form.Item>
      </Space>
      <Form.List name={[name, 'steps']}>
        {(fields, { add, remove }) => (
          <>
            <Table
              size="small"
              dataSource={fields}
              pagination={false}
              columns={[
                {
                  title: '起始值(mm)',
                  dataIndex: 'start',
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'start']}
                      rules={[{ required: true }]}
                      noStyle
                    >
                      <InputNumber placeholder="起始" className="w-full" />
                    </Form.Item>
                  )
                },
                {
                  title: '结束值(mm)',
                  dataIndex: 'end',
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'end']}
                      rules={[{ required: true }]}
                      noStyle
                    >
                      <InputNumber placeholder="结束" className="w-full" />
                    </Form.Item>
                  )
                },
                {
                  title: '加价金额(元)',
                  dataIndex: 'price',
                  render: (_, field) => (
                    <Form.Item
                      {...field}
                      name={[field.name, 'price']}
                      rules={[{ required: true }]}
                      noStyle
                    >
                      <InputNumber placeholder="金额" className="w-full" />
                    </Form.Item>
                  )
                },
                {
                  title: '操作',
                  width: 60,
                  render: (_, field) => (
                    <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(field.name)} />
                  )
                }
              ]}
            />
            <Button
              type="dashed"
              onClick={() => add({ start: 0, end: 0, price: 0 })}
              block
              icon={<PlusOutlined />}
              className="mt-2"
            >
              添加阶梯
            </Button>
          </>
        )}
      </Form.List>
    </Card>
  );

  return (
    <Modal forceRender
      title={initialValues ? '编辑阶梯计价规则' : '新增阶梯计价规则'}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      width={900}
      centered
      
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues || {
          coefficient: 1.0,
          isActive: true,
          lengthStep: { enabled: true, steps: [] },
          widthStep: { enabled: true, steps: [] },
          heightStep: { enabled: true, steps: [] }
        }}
        onFinish={handleFinish}
      >
        <div className="grid grid-cols-2 gap-x-8">
          <Form.Item name="productId" label="选择产品" rules={[{ required: true }]}>
            <Select
              showSearch
              placeholder="选择产品"
              options={saleableProducts.map(p => ({ label: p.name, value: p.id }))}
              onChange={v => setSelectedProductId(v)}
            />
          </Form.Item>
          <Form.Item 
            name="coefficient" 
            label="默认系数" 
            rules={[{ required: true }]}
            tooltip="定制产品调整长宽高后的价格*默认系数=定制产品的预估价格"
          >
            <InputNumber min={0.5} max={3.0} step={0.01} className="w-full" />
          </Form.Item>
          <Form.Item name="isActive" label="启用状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </div>

        <Divider titlePlacement="left">阶梯定价明细</Divider>
        <div className="grid grid-cols-1 gap-2">
          <StepTable name="lengthStep" label="长度" />
          <StepTable name="widthStep" label="宽度" />
          <StepTable name="heightStep" label="高度" />
        </div>
      </Form>
    </Modal>
  );
};

export default SizeRuleFormModal;
