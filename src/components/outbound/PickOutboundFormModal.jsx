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
import { SearchOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PickApplySelectModal from './modals/PickApplySelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;

const PickOutboundFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [paModalOpen, setPaModalOpen] = useState(false);
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
          type: '领料出库',
          createDate: dayjs(),
          handler: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, editingRecord, form]);

  const handlePaSelect = (pa) => {
    form.setFieldsValue({
      relApplyNo: pa.orderNo,
      relWorkOrderNo: pa.workOrderNo,
      partnerName: pa.applicant,
      deptName: pa.deptName
    });
    const newItems = pa.items.map(item => ({
      ...item,
      outboundQty: item.applyQty,
      warehouseName: '',
      location: '',
      remark: ''
    }));
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
        message.warning('请选择领料申请单以加载物料');
        return;
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
    { title: '申请数量', dataIndex: 'applyQty', width: 100, align: 'right' },
    { 
      title: '本次出库数量', 
      dataIndex: 'outboundQty', 
      width: 120,
      render: (val, record, i) => (
        <InputNumber 
          min={0.01} 
          max={record.applyQty} 
          value={val} 
          onChange={(v) => updateItem(i, 'outboundQty', v)} 
          style={{ width: '100%' }}
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
    { title: '来源工单', dataIndex: 'sourceWO', width: 150 },
    { title: '备注', dataIndex: 'remark', width: 150, render: (val, record, i) => <Input value={val} onChange={(e) => updateItem(i, 'remark', e.target.value)} /> },
  ];

  return (
    <Modal forceRender
      title={editingRecord ? '编辑领料出库单' : '新增领料出库单'}
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
            <Form.Item name="relApplyNo" label="关联领料申请单" rules={[{ required: true }]}>
              <Input 
                readOnly 
                placeholder="点击选择" 
                suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={() => setPaModalOpen(true)} />}
                onClick={() => setPaModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="relWorkOrderNo" label="关联工单号">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={6}>
            <Form.Item name="partnerName" label="领料人">
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="deptName" label="领料部门">
              <Input disabled />
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

      <Divider titlePlacement="left">物料明细</Divider>
      <Table 
        columns={columns} 
        dataSource={items} 
        rowKey="productCode" 
        pagination={false} 
        scroll={{ x: 1200, y: 300 }}
        size="small"
      />

      <PickApplySelectModal 
        open={paModalOpen} 
        onCancel={() => setPaModalOpen(false)} 
        onSelect={handlePaSelect} 
      />
    </Modal>
  );
};

export default PickOutboundFormModal;
