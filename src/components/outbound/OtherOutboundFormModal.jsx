import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Table, 
  Space, 
  Button, 
  Row, 
  Col, 
  Select, 
  DatePicker, 
  InputNumber, 
  message,
  Divider,
  AutoComplete
} from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ApplyOrderSelectModal from './modals/ApplyOrderSelectModal';
import { warehouses } from '../../mock';
import { products } from '../../mock';

const { TextArea } = Input;

const OtherOutboundFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [aoModalOpen, setAoModalOpen] = useState(false);
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          createDate: dayjs(editingRecord.createDate || editingRecord.outboundDate),
        });
        setItems(editingRecord.items || []);
      } else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
          type: '其他出库',
          createDate: dayjs(),
          handler: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, editingRecord, form]);

  const handleAoSelect = (ao) => {
    form.setFieldsValue({
      relApplyNo: ao.orderNo,
      partnerName: ao.applicant,
      deptName: ao.deptName,
      usageType: ao.type === '请购' ? '领料' : '其他'
    });
    const newItems = ao.items.map(item => ({
      ...item,
      outboundQty: item.applyQty,
      warehouseName: '',
      location: '',
      remark: ''
    }));
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([...items, { productCode: '', productName: '', spec: '', unit: '', applyQty: 0, outboundQty: 0, warehouseName: '', location: '', remark: '' }]);
  };

  const removeItemRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    if (field === 'productCode') {
        const found = products.find(p => p.productCode === value);
        if (found) {
            newItems[index] = { ...newItems[index], ...found };
        } else {
            newItems[index][field] = value;
        }
    } else {
        newItems[index][field] = value;
    }
    setItems(newItems);
  };

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.warning('请添加物料明细');
        return;
      }

      // Check if all items have warehouse and outboundQty
      const invalidItem = items.find(item => !item.warehouseName || !item.outboundQty);
      if (invalidItem) {
        message.error(`物料 ${invalidItem.productName || '未选编码'} 的仓库和本次出库数量为必填项`);
        return;
      }

      onSave({ ...values, items, status, id: editingRecord?.id || Math.random().toString(36).substr(2, 9) });
      onCancel();
    });
  };

  const columns = [
    { title: '序号', dataIndex: 'index', width: 50, render: (_, __, i) => i + 1 },
    { 
        title: '物料编码', 
        dataIndex: 'productCode', 
        width: 150,
        render: (val, record, i) => (
            <AutoComplete
                value={val}
                options={products.map(p => ({ value: p.productCode, label: `${p.productCode} (${p.productName})` }))}
                onSelect={(v) => updateItem(i, 'productCode', v)}
                onChange={(v) => updateItem(i, 'productCode', v)}
                placeholder="搜索编码"
                style={{ width: '100%' }}
            />
        )
    },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { 
      title: '申请数量', 
      dataIndex: 'applyQty', 
      width: 100,
      render: (val, record, i) => <InputNumber value={val} onChange={(v) => updateItem(i, 'applyQty', v)} />
    },
    { 
      title: <span className="text-red-500 before:content-['*'] before:mr-1">本次出库数量</span>, 
      dataIndex: 'outboundQty', 
      width: 120,
      render: (val, record, i) => (
        <InputNumber 
          value={val} 
          onChange={(v) => updateItem(i, 'outboundQty', v)} 
          status={!val ? 'error' : ''}
          style={{ width: '100%' }}
        />
      )
    },
    { 
      title: <span className="text-red-500 before:content-['*'] before:mr-1">仓库</span>, 
      dataIndex: 'warehouseName', 
      width: 150,
      render: (val, record, i) => (
        <Select 
          value={val} 
          onChange={(v) => updateItem(i, 'warehouseName', v)} 
          style={{ width: '100%' }}
          status={!val ? 'error' : ''}
          placeholder="请选择"
        >
          {warehouses.map(w => <Select.Option key={w.name} value={w.name}>{w.name}</Select.Option>)}
        </Select>
      )
    },
    { title: '备注', dataIndex: 'remark', width: 150, render: (val, record, i) => <Input value={val} onChange={(e) => updateItem(i, 'remark', e.target.value)} /> },
    { 
        title: '操作', 
        key: 'action', 
        width: 60, 
        render: (_, __, i) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeItemRow(i)} /> 
    },
  ];

  return (
    <Modal forceRender
      title={editingRecord ? '编辑其他出库单' : '新增其他出库单'}
      open={open}
      onCancel={onCancel}
      width={1000}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleFinish('草稿')}>保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleFinish('待审批')}>保存并提交</Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="orderNo" label="出库单号">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="type" label="出库类型">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="usageType" label="其他出库类型">
              <Select placeholder="请选择">
                <Select.Option value="领用">领用</Select.Option>
                <Select.Option value="报废">报废</Select.Option>
                <Select.Option value="样品">样品</Select.Option>
                <Select.Option value="其他">其他</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="relApplyNo" label="关联申请单">
              <Input 
                readOnly 
                placeholder="可选选择" 
                suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={() => setAoModalOpen(true)} />}
                onClick={() => setAoModalOpen(true)}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="partnerName" label="申请人">
              <Input placeholder="请输入姓名" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="deptName" label="申请部门">
              <Input placeholder="请输入部门" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="handler" label="仓管员">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="createDate" label="创建日期">
              <DatePicker disabled style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="remark" label="备注">
          <TextArea rows={2} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>

      <Divider titlePlacement="left">物料明细 
        <Button type="link" size="small" icon={<PlusOutlined />} onClick={addItemRow}>新增一行</Button>
      </Divider>
      <Table 
        columns={columns} 
        dataSource={items.map((item, index) => ({ ...item, _reactKey: item.id || item.productCode || index }))} 
        rowKey="_reactKey" 
        pagination={false} 
        scroll={{ x: 1200, y: 300 }}
        size="small"
      />

      <ApplyOrderSelectModal 
        open={aoModalOpen} 
        onCancel={() => setAoModalOpen(false)} 
        onSelect={handleAoSelect} 
      />
    </Modal>
  );
};

export default OtherOutboundFormModal;
