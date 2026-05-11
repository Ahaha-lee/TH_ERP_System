
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import WorkOrderSelectModal from './modals/WorkOrderSelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const ProductionInboundFormModal = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setItems(initialValues.items.map((it, idx) => ({ ...it, id: idx, remainQty: it.quantity })));
      } else {
        form.setFieldsValue({
          inboundNo: `IN-WO-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`,
          type: '生产入库',
          inboundDate: dayjs().format('YYYY-MM-DD'),
          operator: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, initialValues, form]);

  const handleSelectWorkOrder = (order) => {
    form.setFieldsValue({
      relOrderNo: order.orderNo,
    });
    const newItems = [{
      id: 0,
      productCode: order.productCode,
      productName: order.productName,
      spec: order.spec,
      unit: order.unit,
      planQty: order.planQty,
      receivedQty: order.receivedQty,
      remainQty: order.planQty - order.receivedQty,
      quantity: order.planQty - order.receivedQty,
      batchNo: `B-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`,
      bin: 'A-01-01'
    }];
    setItems(newItems);
    setSelectModalOpen(false);
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '计划数量', dataIndex: 'planQty', width: 90, align: 'right' },
    { title: '已入库', dataIndex: 'receivedQty', width: 90, align: 'right' },
    { 
      title: '本次入库', 
      dataIndex: 'quantity', 
      width: 120,
      render: (val, record) => (
        <InputNumber 
          min={0.01} 
          value={val} 
          size="small"
          onChange={(newVal) => {
            if (newVal + record.receivedQty > record.planQty) {
              message.warning('本次入库数量已超过计划剩余数量');
            }
            const nextItems = items.map(it => it.id === record.id ? { ...it, quantity: newVal } : it);
            setItems(nextItems);
          }}
        />
      )
    },
    { title: '批次号', dataIndex: 'batchNo', width: 150 },
    {
      title: '货位',
      dataIndex: 'bin',
      width: 120,
      render: (val, record) => (
        <Select 
          value={val} 
          size="small" 
          style={{ width: '100%' }}
          onChange={(newVal) => {
            const nextItems = items.map(it => it.id === record.id ? { ...it, bin: newVal } : it);
            setItems(nextItems);
          }}
        >
          <Select.Option value="A-01-01">A-01-01</Select.Option>
          <Select.Option value="A-01-02">A-01-02</Select.Option>
        </Select>
      )
    }
  ];

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.error('请关联生产工单');
        return;
      }
      onSave({ ...values, status, items });
    });
  };

  return (
    <Modal forceRender
      title={initialValues ? '编辑生产入库单' : '新增生产入库单'}
      open={open}
      onCancel={onCancel}
      width={950}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleFinish('草稿')}>保存草稿</Button>,
        <Button key="submit" type="primary" onClick={() => handleFinish('待审批')}>保存并提交</Button>,
      ]}
      
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="orderNo" label="入库单号">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="type" label="入库类型">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="relOrderNo" label="关联工单号" rules={[{ required: true, message: '请选择工单' }]}>
              <Input 
                readOnly 
                suffix={<SearchOutlined className="cursor-pointer" onClick={() => setSelectModalOpen(true)} />} 
                placeholder="点击搜索"
                onClick={() => setSelectModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="warehouseName" label="入库仓库" rules={[{ required: true, message: '请选择仓库' }]}>
              <Select placeholder="请选择">
                {warehouses.map(w => <Select.Option key={w.id} value={w.name}>{w.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="operator" label="仓管员">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="inboundDate" label="创建日期">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="remark" label="备注">
              <TextArea rows={1} placeholder="请输入备注信息" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        size="small"
        pagination={false}
      />

      <WorkOrderSelectModal 
        open={selectModalOpen}
        onCancel={() => setSelectModalOpen(false)}
        onSelect={handleSelectWorkOrder}
      />
    </Modal>
  );
};

export default ProductionInboundFormModal;
