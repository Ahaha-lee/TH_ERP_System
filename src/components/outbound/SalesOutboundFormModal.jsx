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
  Typography,
  Divider
} from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DeliveryNoticeSelectModal from './modals/DeliveryNoticeSelectModal';
import BatchSelectModal from './modals/BatchSelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const SalesOutboundFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [dnModalOpen, setDnModalOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState({ open: false, index: null });
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
          type: '销售出库',
          createDate: dayjs(),
          handler: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, editingRecord, form]);

  const handleDnSelect = (dn) => {
    form.setFieldsValue({
      relNoticeNo: dn.orderNo,
      partnerName: dn.customerName,
      settlementMethod: dn.settlementMethod
    });
    // Map items from DN
    const newItems = dn.items.map(item => ({
      ...item,
      outboundQty: item.quantity, // Default to notice quantity
      batchNo: '',
      warehouseName: '',
      location: '',
      remark: ''
    }));
    setItems(newItems);
  };

  const handleBatchSelect = (batch) => {
    const newItems = [...items];
    const index = batchModalOpen.index;
    newItems[index] = {
      ...newItems[index],
      batchNo: batch.batchNo,
      warehouseName: batch.warehouseName,
      location: batch.location,
      outboundQty: Math.min(newItems[index].quantity, batch.stockQty)
    };
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.warning('请至少添加一行物料明细');
        return;
      }
      // Check quantities
      for (let i = 0; i < items.length; i++) {
        if (!items[i].outboundQty || items[i].outboundQty <= 0) {
          message.warning(`第 ${i+1} 行出库数量必须大于0`);
          return;
        }
        if (items[i].outboundQty > items[i].quantity) {
          message.warning(`第 ${i+1} 行出库数量不能超过通知数量`);
          return;
        }
      }
      onSave({ ...values, items, status, id: editingRecord?.id || Math.random().toString(36).substr(2, 9) });
      onCancel();
    });
  };

  const columns = [
    { title: '序号', dataIndex: 'index', width: 50, render: (_, __, i) => i + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '通知数量', dataIndex: 'quantity', width: 100, align: 'right' },
    { 
      title: '本次出库数量', 
      dataIndex: 'outboundQty', 
      width: 120,
      render: (val, record, i) => (
        <InputNumber 
          min={0.01} 
          max={record.quantity} 
          value={val} 
          onChange={(v) => updateItem(i, 'outboundQty', v)} 
          style={{ width: '100%' }}
        />
      )
    },
    { 
      title: '批次号', 
      dataIndex: 'batchNo', 
      width: 150,
      render: (val, record, i) => (
        <Input 
          value={val} 
          readOnly 
          placeholder="点击选择" 
          onClick={() => setBatchModalOpen({ open: true, index: i })}
          suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={() => setBatchModalOpen({ open: true, index: i })} />}
        />
      )
    },
    { 
      title: '仓库', 
      dataIndex: 'warehouseName', 
      width: 150,
      render: (val, record, i) => (
        <Select 
          value={val} 
          onChange={(v) => updateItem(i, 'warehouseName', v)} 
          placeholder="请选择"
          style={{ width: '100%' }}
        >
          {warehouses.map(w => <Select.Option key={w.name} value={w.name}>{w.name}</Select.Option>)}
        </Select>
      )
    },
    { 
      title: '货位', 
      dataIndex: 'location', 
      width: 120,
      render: (val, record, i) => (
        <Input 
          value={val} 
          onChange={(e) => updateItem(i, 'location', e.target.value)} 
          placeholder="请输入"
        />
      )
    },
    { 
      title: '备注', 
      dataIndex: 'remark', 
      width: 150,
      render: (val, record, i) => (
        <Input 
          value={val} 
          onChange={(e) => updateItem(i, 'remark', e.target.value)} 
          placeholder="备注"
        />
      )
    },
  ];

  return (
    <Modal forceRender
      title={editingRecord ? '编辑销售出库单' : '新增销售出库单'}
      open={open}
      onCancel={onCancel}
      width={900}
      centered
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleFinish('草稿')}>保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleFinish('待审批')}>保存并提交</Button>,
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="orderNo" label="出库单号">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="type" label="出库类型">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="relNoticeNo" label="关联发货通知单" rules={[{ required: true }]}>
              <Input 
                readOnly 
                placeholder="点击选择" 
                suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={() => setDnModalOpen(true)} />}
                onClick={() => setDnModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="partnerName" label="客户">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="settlementMethod" label="结算方式">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="logisticsNo" label="物流单号">
              <Input placeholder="非必填" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="handler" label="仓管员">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="createDate" label="创建日期">
              <DatePicker disabled style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="remark" label="备注" className="mb-0">
          <TextArea rows={2} placeholder="请输入备注信息" />
        </Form.Item>
      </Form>

      <Divider titlePlacement="left">物料明细</Divider>
      <Table 
        columns={columns} 
        dataSource={items} 
        rowKey="productCode" 
        pagination={false} 
        scroll={{ x: 1300, y: 300 }}
        size="small"
      />

      <DeliveryNoticeSelectModal 
        open={dnModalOpen} 
        onCancel={() => setDnModalOpen(false)} 
        onSelect={handleDnSelect} 
      />
      <BatchSelectModal 
        open={batchModalOpen.open} 
        onCancel={() => setBatchModalOpen({ open: false, index: null })} 
        onSelect={handleBatchSelect}
      />
    </Modal>
  );
};

export default SalesOutboundFormModal;
