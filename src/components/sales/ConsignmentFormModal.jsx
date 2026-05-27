
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Modal, Form, Row, Col, Input, DatePicker, Select, 
  InputNumber, Table, Button, Space, Typography, message, Divider, Tabs
} from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { employees } from '../../mock';
import { getDiscountRate } from '../../mock';
import { products } from '../../mock/masterData';
import CustomerSelectModal from '../quotation/CustomerSelectModal';

const { TextArea } = Input;
const { Title, Text } = Typography;

const ConsignmentFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [processItems, setProcessItems] = useState([]);
  const [otherFees, setOtherFees] = useState(0);

  const [searching, setSearching] = useState(false);
  const [searchOptions, setSearchOptions] = useState([]);

  useEffect(() => {
    if (open) {
      setSearchOptions(products);
    }
  }, [open]);

  const handleMaterialSearch = (newValue) => {
    setSearching(true);
    // Simulate real remote latency
    setTimeout(() => {
      if (newValue) {
        const val = newValue.toLowerCase();
        const filtered = products.filter(
          p => p.code.toLowerCase().includes(val) || p.name.toLowerCase().includes(val)
        );
        setSearchOptions(filtered);
      } else {
        setSearchOptions(products);
      }
      setSearching(false);
    }, 250);
  };

  const handleSelectMaterialCode = (rowId, code) => {
    const selected = products.find(p => p.code === code);
    if (selected) {
      setMaterials(materials.map(item => item.id === rowId ? {
        ...item,
        materialCode: selected.code,
        materialName: selected.name,
        spec: selected.spec,
        unit: selected.unit
      } : item));
      message.success(`已联动回填物料: ${selected.name}`);
    }
  };

  const handleSelectMaterialName = (rowId, name) => {
    const selected = products.find(p => p.name === name);
    if (selected) {
      setMaterials(materials.map(item => item.id === rowId ? {
        ...item,
        materialCode: selected.code,
        materialName: selected.name,
        spec: selected.spec,
        unit: selected.unit
      } : item));
      message.success(`已联动回填物料编码: ${selected.code}`);
    }
  };

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          orderDate: dayjs(editingRecord.orderDate),
          expectDeliveryDate: editingRecord.expectDeliveryDate ? dayjs(editingRecord.expectDeliveryDate) : null
        });
        setSelectedCustomer({
          id: editingRecord.customerId,
          customerName: editingRecord.customerName,
          customerType: editingRecord.customerType
        });
        setMaterials(editingRecord.materials || []);
        setProcessItems(editingRecord.items || []);
        setOtherFees(editingRecord.otherFees || 0);
      } else {
        const nextNo = `CON-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
        form.setFieldsValue({
          orderNo: nextNo,
          orderDate: dayjs(),
          salesperson: '当前用户'
        });
        setMaterials([]);
        setProcessItems([]);
        setSelectedCustomer(null);
        setOtherFees(0);
      }
    }
  }, [open, editingRecord, form]);

  const calculations = useMemo(() => {
    const discountRate = selectedCustomer ? getDiscountRate(selectedCustomer.customerType) : 0;
    const processTotal = processItems.reduce((acc, curr) => acc + (curr.unitPrice * curr.quantity), 0);
    const discountedTotal = processTotal * (1 - discountRate);
    const totalAmount = discountedTotal + otherFees;

    return {
      processTotal,
      discountRate,
      discountedTotal,
      totalAmount
    };
  }, [processItems, selectedCustomer, otherFees]);

  const handleAddMaterial = () => {
    setMaterials([...materials, { id: Date.now(), materialCode: '', materialName: '', spec: '', unit: '', quantity: 1, remark: '' }]);
  };

  const handleAddProcess = () => {
    setProcessItems([...processItems, { id: Date.now(), processName: '', processSpec: '', unit: '', quantity: 1, unitPrice: 0, amount: 0 }]);
  };

  const handleItemChange = (source, setSource, id, field, value) => {
    setSource(source.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleSave = (isSubmit = false) => {
    form.validateFields().then(values => {
      if (!selectedCustomer) return message.warning('请选择客户');
      if (processItems.length === 0) return message.warning('请添加加工费明细');

      onSave({
        ...values,
        id: editingRecord?.id,
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.customerName,
        customerType: selectedCustomer.customerType,
        materials,
        items: processItems,
        totalAmount: calculations.totalAmount,
        discountRate: calculations.discountRate,
        status: isSubmit ? '待审批' : '草稿',
        materialStatus: '待收来料',
        orderDate: values.orderDate.format('YYYY-MM-DD'),
        expectDeliveryDate: values.expectDeliveryDate?.format('YYYY-MM-DD')
      });
    });
  };

  const materialColumns = [
    { 
      title: '物料编码', 
      render: (_, rec) => {
        const opts = [...searchOptions];
        if (rec.materialCode && !opts.some(o => o.code === rec.materialCode)) {
          opts.unshift({ code: rec.materialCode, name: rec.materialName || rec.materialCode, spec: rec.spec, unit: rec.unit });
        }
        return (
          <Select 
            showSearch
            placeholder="轻触检索编码"
            value={rec.materialCode || undefined}
            filterOption={false}
            onSearch={handleMaterialSearch}
            onChange={val => handleSelectMaterialCode(rec.id, val)}
            loading={searching}
            style={{ width: '100%', minWidth: '150px' }}
            options={opts.map(o => ({ value: o.code, label: `${o.code} (${o.name})` }))}
          />
        );
      }
    },
    { 
      title: '物料名称', 
      render: (_, rec) => {
        const opts = [...searchOptions];
        if (rec.materialName && !opts.some(o => o.name === rec.materialName)) {
          opts.unshift({ code: rec.materialCode, name: rec.materialName, spec: rec.spec, unit: rec.unit });
        }
        return (
          <Select 
            showSearch
            placeholder="轻触检索名称"
            value={rec.materialName || undefined}
            filterOption={false}
            onSearch={handleMaterialSearch}
            onChange={val => handleSelectMaterialName(rec.id, val)}
            loading={searching}
            style={{ width: '100%', minWidth: '150px' }}
            options={opts.map(o => ({ value: o.name, label: `${o.name} [${o.code}]` }))}
          />
        );
      }
    },
    { title: '规格', render: (_, rec) => <Input value={rec.spec} onChange={e => handleItemChange(materials, setMaterials, rec.id, 'spec', e.target.value)} /> },
    { title: '单位', width: 80, render: (_, rec) => <Input value={rec.unit} onChange={e => handleItemChange(materials, setMaterials, rec.id, 'unit', e.target.value)} /> },
    { title: '来料数量', width: 100, render: (_, rec) => <InputNumber min={1} value={rec.quantity} onChange={v => handleItemChange(materials, setMaterials, rec.id, 'quantity', v)} /> },
    { title: '操作', width: 60, render: (_, rec) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setMaterials(materials.filter(i => i.id !== rec.id))} /> }
  ];

  const processColumns = [
    { title: '加工工序', render: (_, rec) => <Input value={rec.processName} onChange={e => handleItemChange(processItems, setProcessItems, rec.id, 'processName', e.target.value)} /> },
    { title: '加工后规格', render: (_, rec) => <Input value={rec.processSpec} onChange={e => handleItemChange(processItems, setProcessItems, rec.id, 'processSpec', e.target.value)} /> },
    { title: '加工数量', width: 100, render: (_, rec) => <InputNumber min={1} value={rec.quantity} onChange={v => handleItemChange(processItems, setProcessItems, rec.id, 'quantity', v)} /> },
    { title: '加工单价', width: 120, render: (_, rec) => <InputNumber min={0} value={rec.unitPrice} onChange={v => handleItemChange(processItems, setProcessItems, rec.id, 'unitPrice', v)} /> },
    { title: '金额', width: 120, render: (_, rec) => ((rec.unitPrice || 0) * (rec.quantity || 0)).toFixed(2) },
    { title: '操作', width: 60, render: (_, rec) => <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setProcessItems(processItems.filter(i => i.id !== rec.id))} /> }
  ];

  return (
    <Modal forceRender
      title={editingRecord ? `编辑受托加工单 - ${editingRecord.orderNo}` : '新建受托加工单'}
      open={open}
      onCancel={onCancel}
      width={900}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleSave(false)}>保存草稿</Button>,
        <Button key="submit" type="primary" onClick={() => handleSave(true)}>保存并提交</Button>
      ]}
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={6}><Form.Item name="orderNo" label="受托加工订单号"><Input disabled /></Form.Item></Col>
          <Col span={6}>
            <Form.Item label="客户" required>
              <Space.Compact style={{ width: '100%' }}>
                <Input value={selectedCustomer?.customerName} disabled placeholder="点击选择" />
                <Button type="primary" icon={<UserOutlined />} onClick={() => setCustomerModalOpen(true)} />
              </Space.Compact>
            </Form.Item>
          </Col>
          <Col span={6}><Form.Item name="orderDate" label="订单日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item name="expectDeliveryDate" label="期望发货日期"><DatePicker style={{ width: '100%' }} /></Form.Item></Col>
          <Col span={6}><Form.Item name="salesperson" label="业务员"><Select options={employees.map(e => ({ value: e.name, label: e.name }))} /></Form.Item></Col>
          <Col span={18}><Form.Item name="remark" label="备注"><TextArea rows={1} /></Form.Item></Col>
        </Row>

        <Tabs items={[
          {
            key: '1',
            label: '客户来料清单',
            children: (
              <>
                <Button icon={<PlusOutlined />} onClick={handleAddMaterial} style={{ marginBottom: 8 }}>添加来料</Button>
                <Table dataSource={materials} columns={materialColumns} rowKey="id" size="small" pagination={false} />
              </>
            )
          },
          {
            key: '2',
            label: '加工费明细',
            children: (
              <>
                <Button icon={<PlusOutlined />} onClick={handleAddProcess} style={{ marginBottom: 8 }}>添加加工项</Button>
                <Table dataSource={processItems} columns={processColumns} rowKey="id" size="small" pagination={false} />
              </>
            )
          }
        ]} />

        <Divider />
        <Row justify="end">
          <Col span={10}>
            <div style={{ textAlign: 'right' }}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Row><Col span={14}>加工费总计:</Col><Col span={10}>¥{(calculations.processTotal || 0).toFixed(2)}</Col></Row>
                <Row><Col span={14}>客户折扣 ({(calculations.discountRate * 100).toFixed(0)}%):</Col><Col span={10}>- ¥{(calculations.processTotal - calculations.discountedTotal || 0).toFixed(2)}</Col></Row>
                <Row><Col span={14}>其他费用:</Col><Col span={10}><InputNumber size="small" value={otherFees} onChange={setOtherFees} style={{ width: 100 }} /></Col></Row>
                <Row style={{ marginTop: 8 }}><Col span={14}><Title level={4}>订单总额:</Title></Col><Col span={10}><Title level={4} style={{ color: '#f5222d' }}>¥{(calculations.totalAmount || 0).toFixed(2)}</Title></Col></Row>
              </Space>
            </div>
          </Col>
        </Row>
      </Form>
      <CustomerSelectModal open={customerModalOpen} onCancel={() => setCustomerModalOpen(false)} onConfirm={setSelectedCustomer} />
    </Modal>
  );
};

export default ConsignmentFormModal;
