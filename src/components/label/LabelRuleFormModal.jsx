import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, Switch, Checkbox, Space, message, Divider, Typography } from 'antd';
import { materialFields } from '../../mock';

const { Text } = Typography;

const LabelRuleFormModal = ({ open, onCancel, onSave, editingRecord, existingNames }) => {
  const [form] = Form.useForm();
  const [selectedFields, setSelectedFields] = useState([]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          status: editingRecord.status === '启用',
        });
        setSelectedFields(editingRecord.fields || []);
} else {
  form.setFieldsValue({ isActive: true });
        setSelectedFields([]);
      }
    }
  }, [open, editingRecord, form]);

  const handleFinish = () => {
    form.validateFields().then((values) => {
      // Name uniqueness check
      if (existingNames.includes(values.ruleName) && (!editingRecord || editingRecord.ruleName !== values.ruleName)) {
        message.error('规则名称已存在，请重新输入');
        return;
      }

      if (!values.fields || values.fields.length === 0) {
        message.warning('请至少勾选一个字段');
        return;
      }

      onSave({
        ...values,
        id: editingRecord ? editingRecord.id : undefined,
        status: values.status ? '启用' : '禁用',
      });
      onCancel();
    });
  };

  const generatePreview = () => {
    if (selectedFields.length === 0) return '尚未选择字段';
    return selectedFields
      .map((f) => {
        const fieldInfo = materialFields.find((mf) => mf.value === f);
        const name = fieldInfo ? fieldInfo.label : f;
        let exampleValue = '示例数据';
        if (f === 'materialCode') exampleValue = 'MT001';
        if (f === 'productionDate') exampleValue = '2025-04-27';
        if (f === 'quantity') exampleValue = '100';
        return `${name}: ${exampleValue}`;
      })
      .join(' | ');
  };

  return (
    <Modal forceRender
      title={editingRecord ? '编辑标签规则' : '新增标签规则'}
      open={open}
      onCancel={onCancel}
      onOk={handleFinish}
      width={900}
      centered
      okText="保存"
      cancelText="取消"
      
    >
      <Form form={form} layout="vertical">
        <div className="grid grid-cols-2 gap-x-8">
          <Form.Item
            name="ruleName"
            label="规则名称"
            rules={[
              { required: true, message: '请输入规则名称' },
              { max: 50, message: '最多50个字符' },
            ]}
          >
            <Input placeholder="请输入规则名称" maxLength={50} />
          </Form.Item>

          <Form.Item name="category" label="物料分类" rules={[{ required: true, message: '请选择物料分类' }]}>
            <Select placeholder="请选择物料分类">
              <Select.Option value="成品">成品</Select.Option>
              <Select.Option value="半成品">半成品</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item name="status" label="状态" valuePropName="checked">
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </div>

        <Form.Item
          name="fields"
          label="包含字段"
          rules={[{ required: true, message: '请至少勾选一个字段' }]}
        >
          <Checkbox.Group
            options={materialFields}
            value={selectedFields}
            onChange={(checkedValues) => setSelectedFields(checkedValues)}
          />
        </Form.Item>

        <Divider titlePlacement="left">标签预览示例</Divider>
        <div style={{ padding: '12px', background: '#f5f5f5', borderRadius: '4px', wordBreak: 'break-all' }}>
          <Text type="secondary">{generatePreview()}</Text>
        </div>
      </Form>
    </Modal>
  );
};

export default LabelRuleFormModal;
