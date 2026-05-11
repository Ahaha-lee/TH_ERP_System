
import React, { useState, useEffect } from 'react';
import { 
  Modal, Form, Input, Select, Switch, Table, Button, 
  Space, Row, Col, InputNumber, Popconfirm, message, Typography, Alert
} from 'antd';
import { PlusOutlined, ImportOutlined, DeleteOutlined } from '@ant-design/icons';
import { subsidiaries, employees } from '../../mock/warehouseMock';
import ImportLocationModal from './ImportLocationModal';

const { TextArea } = Input;
const { Text } = Typography;

const WarehouseFormModal = ({ open, onCancel, onSave, editingData }) => {
  const [form] = Form.useForm();
  const [locations, setLocations] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [importModalVisible, setImportModalVisible] = useState(false);

  const syncLocationCodes = (whCode, locs) => {
    return locs.map((loc, index) => {
      const seq = (index + 1).toString().padStart(3, '0');
      return { ...loc, code: `LOC-${whCode}-${seq}` };
    });
  };

  useEffect(() => {
    if (open) {
      if (editingData) {
        form.setFieldsValue({
          ...editingData,
        });
        setLocations(editingData.locations || []);
      } else { const initialWhCode = "WH-00" + Math.floor(Math.random()*1000); 
        form.setFieldsValue({
          code: initialWhCode,
          type: '实体仓库',
          enabled: true,
          managerId: 'emp-1' // Default "仓管员"
        });
        const initialLocs = [{ 
          id: `tmp-${Date.now()}`, 
          code: '', 
          name: '默认货位', 
          type: '常规', 
          spec: '', 
          maxCapacity: 100 
        }];
        setLocations(syncLocationCodes(initialWhCode, initialLocs));
      }
    }
  }, [open, editingData, form]);

  const generateWhCode = (subId) => {
    const sub = subsidiaries.find(s => s.id === subId);
    const prefix = sub ? sub.shortName : 'UNK';
    const random = Math.floor(1000 + Math.random() * 9000);
    return `WH-${prefix}-${random}`;
  };

  const handleSubsidiaryChange = (val) => {
    if (!editingData) {
      const newWhCode = generateWhCode(val);
      form.setFieldValue('code', newWhCode);
      setLocations(syncLocationCodes(newWhCode, locations));
    }
  };

  const addLocation = () => {
    const whCode = form.getFieldValue('code');
    const newLoc = {
      id: `tmp-${Date.now()}`,
      code: '',
      name: '',
      type: '常规',
      spec: '',
      maxCapacity: 1
    };
    const newLocs = [...locations, newLoc];
    setLocations(syncLocationCodes(whCode, newLocs));
  };

  const removeLocation = (id) => {
    if (locations.length <= 1) {
      message.warning('仓库至少需要保留一个货位');
      return;
    }
    const whCode = form.getFieldValue('code');
    const filtered = locations.filter(loc => loc.id !== id);
    setLocations(syncLocationCodes(whCode, filtered));
  };

  const batchDelete = () => {
    if (selectedRowKeys.length === 0) return;
    if (locations.length - selectedRowKeys.length < 1) {
      message.warning('无法执行批量删除，仓库至少需要保留一个货位');
      return;
    }
    const whCode = form.getFieldValue('code');
    const filtered = locations.filter(loc => !selectedRowKeys.includes(loc.id));
    setLocations(syncLocationCodes(whCode, filtered));
    setSelectedRowKeys([]);
  };

  const handleLocationUpdate = (id, field, value) => {
    setLocations(locations.map(loc => loc.id === id ? { ...loc, [field]: value } : loc));
  };

  const handleImport = (importedData) => {
    const whCode = form.getFieldValue('code');
    const newItems = importedData.map(item => ({
      ...item,
      id: `tmp-import-${Math.random().toString(36).substr(2, 9)}`,
      code: ''
    }));
    setLocations(syncLocationCodes(whCode, [...locations, ...newItems]));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Basic location validation
      for (const loc of locations) {
        if (!loc.name) {
          message.error('请填写所有货位名称');
          return;
        }
      }

      const subsidiaryName = subsidiaries.find(s => s.id === values.subsidiaryId)?.name;
      const managerName = employees.find(e => e.id === values.managerId)?.name;

      // Final processing of IDs (keep generated codes)
      const finalLocations = locations.map((loc) => ({
        ...loc,
        id: loc.id.startsWith('tmp') ? Math.random().toString(36).substr(2, 9) : loc.id
      }));

      onSave({
        ...editingData,
        ...values,
        subsidiaryName,
        managerName,
        locations: finalLocations
      });
      message.success('保存成功');
    } catch (error) {
      console.error(error);
    }
  };

  const locationColumns = [
    { 
      title: '货位编码', 
      dataIndex: 'code', 
      width: 180,
      render: (text) => <Text type="secondary" style={{ fontFamily: 'monospace' }}>{text}</Text>
    },
    { 
      title: '名称', 
      dataIndex: 'name',
      render: (text, record) => (
        <Input 
          value={text} 
          maxLength={50}
          placeholder="如：A-01-01"
          onChange={e => handleLocationUpdate(record.id, 'name', e.target.value)} 
        />
      )
    },
    { 
      title: '类型', 
      dataIndex: 'type',
      width: 120,
      render: (text, record) => (
        <Select 
          value={text} 
          style={{ width: '100%' }}
          onChange={val => handleLocationUpdate(record.id, 'type', val)}
          options={[
            { label: '常规', value: '常规' },
            { label: '暂存', value: '暂存' },
            { label: '待检', value: '待检' },
            { label: '退货区', value: '退货区' },
          ]}
        />
      )
    },
    { 
      title: '规格', 
      dataIndex: 'spec',
      render: (text, record) => (
        <Input 
          value={text} 
          placeholder="如：2x2x2m"
          onChange={e => handleLocationUpdate(record.id, 'spec', e.target.value)} 
        />
      )
    },
    { 
      title: '操作', 
      width: 60, 
      align: 'center',
      render: (_, record) => (
        <Popconfirm title="确定删除该货位？" onConfirm={() => removeLocation(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      )
    }
  ];

  return (
    <Modal forceRender
      title={editingData ? `编辑仓库 - ${editingData.code}` : '新增仓库'}
      open={open}
      onCancel={onCancel}
      width={900}
      onOk={handleSubmit}
      
      mask={{ closable: false }}
    >
      <Form form={form} layout="vertical">
        <div className="text-base font-bold mb-4">基本信息</div>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="仓库编码" name="code" rules={[{ required: true }]}>
              <Input disabled />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="仓库名称" name="name" rules={[{ required: true, message: '请输入摘要名称' }, { max: 50 }]}>
              <Input placeholder="请输入仓库名称" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="仓库类型" name="type" rules={[{ required: true }]}>
              <Select options={[{label: '实体仓库', value: '实体仓库'}, {label: '虚拟仓库', value: '虚拟仓库'}]} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="所属子公司" name="subsidiaryId" rules={[{ required: true }]}>
              <Select 
                options={subsidiaries.map(s => ({ label: s.name, value: s.id }))} 
                onChange={handleSubsidiaryChange}
                placeholder="请选择所属子公司"
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="仓库位置" name="location">
              <Input placeholder="实体仓库建议填写具体地址" maxLength={100} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="仓管员" name="managerId" rules={[{ required: true }]}>
              <Select options={employees.map(e => ({ label: e.name, value: e.id }))} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="状态" name="enabled" valuePropName="checked">
              <Switch checkedChildren="启用" unCheckedChildren="禁用" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="备注" name="remark">
              <TextArea rows={2} maxLength={250} showCount placeholder="请输入备注信息" />
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-between items-center mb-4 mt-6">
          <Space orientation="vertical" size={0}>
            <div className="text-base font-bold">货位信息</div>
            <Text type="secondary" size="small">可在入库、出库时指定货位</Text>
          </Space>
          <Space>
            <Button icon={<ImportOutlined />} onClick={() => setImportModalVisible(true)}>导入</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={addLocation}>添加货位</Button>
          </Space>
        </div>

        <Table
          dataSource={locations}
          columns={locationColumns}
          rowKey="id"
          pagination={false}
          size="small"
          bordered
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys
          }}
          footer={() => (
            <Button 
              danger 
              disabled={selectedRowKeys.length === 0} 
              onClick={batchDelete}
              icon={<DeleteOutlined />}
            >
              批量删除
            </Button>
          )}
        />
      </Form>

      <ImportLocationModal 
        open={importModalVisible} 
        onCancel={() => setImportModalVisible(false)}
        existingNames={locations.map(l => l.name)}
        onImport={handleImport}
      />
    </Modal>
  );
};

export default WarehouseFormModal;
