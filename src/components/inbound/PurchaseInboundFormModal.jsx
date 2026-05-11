
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PurchaseOrderSelectModal from './modals/PurchaseOrderSelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const PurchaseInboundFormModal = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          ...initialValues,
          inboundDate: dayjs(initialValues.inboundDate)
        });
        setItems(initialValues.items.map((it, idx) => ({ ...it, id: idx, remainQty: it.quantity }))); // Simplified for edit
      } else { form.setFieldsValue({ inboundNo: `IN-${dayjs().format("YYYYMMDD")}`,
          type: '采购入库',
          inboundDate: dayjs(),
          operator: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, initialValues, form]);

  const handleSelectPurchaseOrder = (order) => {
    form.setFieldsValue({
      relOrderNo: order.orderNo,
      partnerName: order.supplierName,
    });
    const newItems = order.items.map((it, idx) => ({
      id: idx,
      productCode: it.productCode,
      productName: it.productName,
      spec: it.spec,
      unit: it.unit,
      purchasePrice: it.price,
      price: it.price,
      remainQty: it.quantity - (it.receivedQty || 0),
      quantity: it.quantity - (it.receivedQty || 0),
      warehouseName: '原材料仓库',
      bin: 'R-01-01'
    }));
    setItems(newItems);
    setSelectModalOpen(false);
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150, ellipsis: true },
    { title: '规格', dataIndex: 'spec', width: 120, ellipsis: true },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '待入库', dataIndex: 'remainQty', width: 90, align: 'right' },
    { 
      title: '本次入库', 
      dataIndex: 'quantity', 
      width: 100,
      render: (val, record) => (
        <InputNumber 
          min={0.01} 
          max={record.remainQty} 
          value={val} 
          size="small"
          onChange={(newVal) => {
            const nextItems = items.map(it => it.id === record.id ? { ...it, quantity: newVal } : it);
            setItems(nextItems);
          }}
        />
      )
    },
    { 
      title: '采购单价', 
      dataIndex: 'price', 
      width: 100,
      render: (val) => `¥${Number(val || 0).toFixed(2)}`
    },
    {
      title: '入库仓库',
      dataIndex: 'warehouseName',
      width: 140,
      render: (val, record) => (
        <Select 
          value={val} 
          placeholder="选择仓库"
          size="small" 
          style={{ width: '100%' }}
          onChange={(newVal) => {
            const nextItems = items.map(it => it.id === record.id ? { ...it, warehouseName: newVal } : it);
            setItems(nextItems);
          }}
        >
          {warehouses.map(w => <Select.Option key={w.id} value={w.name}>{w.name}</Select.Option>)}
        </Select>
      )
    },
    {
      title: '货位',
      dataIndex: 'bin',
      width: 120,
      render: (val, record) => (
        <Select 
          value={val} 
          placeholder="选择货位"
          size="small" 
          allowClear
          style={{ width: '100%' }}
          onChange={(newVal) => {
            const nextItems = items.map(it => it.id === record.id ? { ...it, bin: newVal } : it);
            setItems(nextItems);
          }}
        >
          <Select.Option value="A-01-01">A-01-01</Select.Option>
          <Select.Option value="A-01-02">A-01-02</Select.Option>
          <Select.Option value="R-01-01">R-01-01</Select.Option>
          <Select.Option value="R-01-02">R-01-02</Select.Option>
        </Select>
      )
    },
    {
      title: '操作',
      width: 60,
      render: (_, record) => (
        <Button type="link" danger size="small" onClick={() => setItems(items.filter(it => it.id !== record.id))}>删除</Button>
      )
    }
  ];

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.error('请添加物料明细');
        return;
      }
      onSave({ ...values, status, items, inboundDate: values.inboundDate.format('YYYY-MM-DD') });
    });
  };

  return (
    <Modal forceRender
      title={initialValues ? '编辑采购入库单' : '新增采购入库单'}
      open={open}
      onCancel={onCancel}
      width={900}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleFinish('草稿')}>保存草稿</Button>,
        <Button key="submit" type="primary" onClick={() => handleFinish('待审批')}>保存并提交</Button>,
      ]}
      
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="orderNo" label="入库单号">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label="入库类型">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="relOrderNo" label="关联采购单" rules={[{ required: true, message: '请选择采购单' }]}>
              <Input 
                readOnly 
                suffix={<SearchOutlined className="cursor-pointer" onClick={() => setSelectModalOpen(true)} />} 
                placeholder="点击搜索"
                onClick={() => setSelectModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="partnerName" label="供应商">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="operator" label="仓管员">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="inboundDate" label="创建日期">
              <Input disabled value={dayjs().format('YYYY-MM-DD')} />
            </Form.Item>
          </Col>
          <Col span={12}></Col>
          <Col span={24}>
            <Form.Item name="remark" label="备注" className="mb-0">
              <TextArea rows={2} placeholder="请输入备注信息" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <div className="mb-2 flex justify-between items-center">
        <Text strong>物料明细</Text>
        <Text type="secondary">总计: {items.length} 种物料</Text>
      </div>
      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        size="small"
        pagination={false}
        scroll={{ y: 300 }}
      />

      <PurchaseOrderSelectModal 
        open={selectModalOpen}
        onCancel={() => setSelectModalOpen(false)}
        onSelect={handleSelectPurchaseOrder}
      />
    </Modal>
  );
};

export default PurchaseInboundFormModal;
