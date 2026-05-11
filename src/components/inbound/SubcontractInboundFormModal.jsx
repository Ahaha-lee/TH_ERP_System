
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PurchaseOrderSelectModal from './modals/PurchaseOrderSelectModal'; // We can reuse or specialize
import { warehouses } from '../../mock';
import { subcontractPurchaseOrders } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const SubcontractInboundFormModal = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue(initialValues);
        setItems(initialValues.items.map((it, idx) => ({ ...it, id: idx })));
      } else { form.setFieldsValue({ inboundNo: `IN-${dayjs().format("YYYYMMDD")}`,
          type: '委外入库',
          inboundDate: dayjs().format('YYYY-MM-DD'),
          operator: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, initialValues, form]);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const handleSelectSubcontract = (order) => {
    if (!order) {
      message.warning('请选择委外采购单');
      return;
    }
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
      orderQty: it.quantity,
      receivedQty: it.receivedQty || 0,
      quantity: it.quantity - (it.receivedQty || 0),
      price: it.price,
      warehouseName: warehouses[0]?.name || '原材料仓库',
      bin: 'A-01-01'
    }));
    setItems(newItems);
    setSelectModalOpen(false);
    setSelectedOrder(null);
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '委外数量', dataIndex: 'orderQty', width: 100, align: 'right' },
    { title: '已入库', dataIndex: 'receivedQty', width: 100, align: 'right' },
    { 
      title: '本次入库', 
      dataIndex: 'quantity', 
      width: 120,
      render: (val, record) => (
        <InputNumber 
          min={0.01} 
          max={record.orderQty - record.receivedQty} 
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
      title: '加工费单价', 
      dataIndex: 'price', 
      width: 100, 
      align: 'right',
      render: (val) => <Text>¥{Number(val || 0).toFixed(2)}</Text>
    },
    {
      title: '入库仓库',
      dataIndex: 'warehouseName',
      width: 150,
      render: (val, record) => (
        <Select 
          value={val} 
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
        message.error('请选择委外采购单');
        return;
      }
      onSave({ ...values, status, items });
      if (status === '待审批') {
        message.info('审核通过后，加工件入库，虚拟仓原料自动扣减 (模拟提示)');
      }
    });
  };

  return (
    <Modal forceRender
      title={initialValues ? '编辑委外入库单' : '新增委外入库单'}
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
            <Form.Item name="relOrderNo" label="关联委外采购单" rules={[{ required: true, message: '请选择订单' }]}>
              <Input 
                readOnly 
                suffix={<SearchOutlined className="cursor-pointer" onClick={() => setSelectModalOpen(true)} />} 
                placeholder="点击搜索"
                onClick={() => setSelectModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="partnerName" label="供应商">
              <Input disabled />
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
        </Row>
      </Form>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={items}
        size="small"
        pagination={false}
      />

      <Modal forceRender
        title="选择委外采购单"
        open={selectModalOpen}
        onCancel={() => setSelectModalOpen(false)}
        width={800}
        footer={[
          <Button key="close" onClick={() => setSelectModalOpen(false)}>取消</Button>,
          <Button key="confirm" type="primary" onClick={() => handleSelectSubcontract(selectedOrder)}>确认</Button>
        ]}
      >
        <Table 
          dataSource={subcontractPurchaseOrders} 
          rowKey="orderNo"
          size="small"
          rowSelection={{
            type: 'radio',
            selectedRowKeys: selectedOrder ? [selectedOrder.orderNo] : [],
            onChange: (_, selectedRows) => {
              setSelectedOrder(selectedRows[0]);
            }
          }}
          onRow={(record) => ({
            onClick: () => setSelectedOrder(record)
          })}
          columns={[
            { title: '采购单号', dataIndex: 'orderNo' },
            { title: '供应商', dataIndex: 'supplierName' },
            { title: '物料信息', dataIndex: 'summary' },
            { title: '日期', dataIndex: 'orderDate' }
          ]}
        />
      </Modal>
    </Modal>
  );
};

export default SubcontractInboundFormModal;
