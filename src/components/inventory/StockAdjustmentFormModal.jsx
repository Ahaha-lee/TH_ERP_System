import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Row, 
  Col, 
  Table, 
  Select, 
  Button, 
  Typography, 
  InputNumber, 
  Space,
  message,
  Popconfirm,
  Divider,
  Tooltip
} from 'antd';
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { Text } = Typography;

const StockAdjustmentFormModal = ({ open, onCancel, onFinish, initialData }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);

  // 模拟仓库数据
  const warehouses = [
    { value: 'w1', label: '主原材料仓库' },
    { value: 'w2', label: '半成品仓库' },
    { value: 'w3', label: '主成品仓库' },
  ];

  // 模拟产品数据
  const mockProducts = [
    { code: 'PROD001', name: '皮沙发', spec: '真皮/咖啡色', stock: 50 },
    { code: 'PROD002', name: '实木餐桌', spec: '1.6m圆形', stock: 120 },
    { code: 'MAT001', name: '红橡木板材', spec: '2000*200*20', stock: 800 },
    { code: 'ACC001', name: '不锈钢铰链', spec: '110度/自卸', stock: 1500 },
  ];

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.setFieldsValue({
          orderNo: initialData.orderNo,
          operator: initialData.operator,
          createTime: initialData.createTime,
        });
        // In a real app, items would be fetched or passed in. 
        // Mocking items based on the products summary for now.
        const mockItems = initialData.products.map(pName => {
          const p = mockProducts.find(prod => prod.name === pName) || mockProducts[0];
          return {
            id: Math.random(),
            productCode: p.code,
            productName: p.name,
            spec: p.spec,
            batchNo: '',
            warehouse: 'w1',
            location: '',
            stockQty: p.stock,
            adjustmentQty: '+0',
            reason: '编辑数据'
          };
        });
        setItems(mockItems.length > 0 ? mockItems : [{ 
          id: Date.now(), 
          productCode: '', 
          productName: '', 
          spec: '', 
          batchNo: '', 
          warehouse: 'w1', 
          location: '', 
          stockQty: 0, 
          adjustmentQty: '+0', 
          reason: '' 
        }]);
      } else {
        const generatedNo = `SAJ${dayjs().format('YYYYMMDDHHmmss')}`;
        form.setFieldsValue({
          orderNo: generatedNo,
          operator: '管理员',
          createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        });
        setItems([{ 
          id: Date.now(), 
          productCode: '', 
          productName: '', 
          spec: '', 
          batchNo: '', 
          warehouse: 'w1', 
          location: '', 
          stockQty: 0, 
          adjustmentQty: '+0', 
          reason: '' 
        }]);
      }
    } else {
      form.resetFields();
      setItems([]);
    }
  }, [open, form, initialData]);

  const addItem = () => {
    setItems([...items, { 
      id: Date.now() + Math.random(), 
      productCode: '', 
      productName: '', 
      spec: '', 
      batchNo: '', 
      warehouse: 'w1', 
      location: '', 
      stockQty: 0, 
      adjustmentQty: 0, 
      reason: '' 
    }]);
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id, key, value) => {
    const newItems = items.map(item => {
      if (item.id === id) {
        let update = { [key]: value };
        // 联动逻辑
        if (key === 'productCode' || key === 'productName') {
          const product = mockProducts.find(p => (key === 'productCode' ? p.code === value : p.name === value));
          if (product) {
            update = { 
              ...update, 
              productCode: product.code, 
              productName: product.name, 
              spec: product.spec,
              stockQty: product.stock
            };
          }
        }
        return { ...item, ...update };
      }
      return item;
    });
    setItems(newItems);
  };

  const columns = [
    {
      title: (
        <span>
          <Text type="danger" className="mr-1">*</Text>
          产品编码
        </span>
      ),
      dataIndex: 'productCode',
      width: 160,
      render: (val, record) => (
        <Select
          showSearch
          value={val || undefined}
          placeholder="请选择产品编码"
          style={{ width: '100%' }}
          onChange={(v) => updateItem(record.id, 'productCode', v)}
          options={mockProducts.map(p => ({ value: p.code, label: p.code }))}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        />
      ),
    },
    {
      title: (
        <span>
          <Text type="danger" className="mr-1">*</Text>
          产品名称
        </span>
      ),
      dataIndex: 'productName',
      width: 160,
      render: (val, record) => (
        <Select
          showSearch
          value={val || undefined}
          placeholder="请选择产品名称"
          style={{ width: '100%' }}
          onChange={(v) => updateItem(record.id, 'productName', v)}
          options={mockProducts.map(p => ({ value: p.name, label: p.name }))}
          filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
        />
      ),
    },
    { 
      title: (
        <span>
          <Text type="danger" className="mr-1">*</Text>
          规格型号
        </span>
      ), 
      dataIndex: 'spec', 
      width: 120, 
      ellipsis: true 
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      width: 120,
      render: (val, record) => (
        <Input value={val} placeholder="" onChange={(e) => updateItem(record.id, 'batchNo', e.target.value)} />
      ),
    },
    {
      title: (
        <span>
          <Text type="danger" className="mr-1">*</Text>
          仓库
        </span>
      ),
      dataIndex: 'warehouse',
      width: 150,
      render: (val, record) => (
        <Select
          value={val}
          style={{ width: '100%' }}
          options={warehouses}
          onChange={(v) => updateItem(record.id, 'warehouse', v)}
        />
      ),
    },
    {
      title: '货位',
      dataIndex: 'location',
      width: 120,
      render: (val, record) => (
        <Input value={val} placeholder="" onChange={(e) => updateItem(record.id, 'location', e.target.value)} />
      ),
    },
    {
      title: '库存数量',
      dataIndex: 'stockQty',
      width: 100,
      align: 'right',
    },
    {
      title: (
        <span>
          <Text type="danger" className="mr-1">*</Text>
          调整数量
        </span>
      ),
      dataIndex: 'adjustmentQty',
      width: 160,
      render: (val, record) => (
        <Input
          value={val}
          placeholder="带符号,如 +10, -5"
          style={{ width: '100%' }}
          onChange={(e) => updateItem(record.id, 'adjustmentQty', e.target.value)}
          suffix={
            <Tooltip title="+ 表示增加库存，- 表示减少库存">
              <InfoCircleOutlined className="text-gray-400" />
            </Tooltip>
          }
        />
      ),
    },
    {
      title: (
        <span>
          <Text type="danger" className="mr-1">*</Text>
          调整原因
        </span>
      ),
      dataIndex: 'reason',
      width: 150,
      render: (val, record) => (
        <Input value={val} placeholder="请输入调整原因" onChange={(e) => updateItem(record.id, 'reason', e.target.value)} />
      ),
    },
    {
      title: '操作',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm title="确定删除此行？" onConfirm={() => removeItem(record.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} disabled={items.length === 1} />
        </Popconfirm>
      ),
    },
  ];

  const handleSubmit = (isSubmit) => {
    form.validateFields().then(values => {
      const invalidItems = items.filter(item => 
        !item.productCode || 
        !item.productName || 
        item.adjustmentQty === 0 || 
        item.adjustmentQty === null ||
        !item.reason
      );

      if (items.length === 0 || (items.length === 1 && !items[0].productCode)) {
        message.error('请至少添加一个产品信息');
        return;
      }

      if (invalidItems.length > 0) {
        message.error('请填写完整的必填产品明细信息（包括产品、调整数量和原因）');
        return;
      }
      
      onFinish({ ...values, items, isSubmit });
    }).catch(info => {
      console.log('Validate Failed:', info);
    });
  };

  return (
    <Modal
      title="新增库存调整单"
      open={open}
      onCancel={onCancel}
      width={1200}
      id="stock-adjustment-modal"
      footer={[
        <Button key="cancel" onClick={onCancel} id="modal-btn-cancel">取消</Button>,
        <Button key="save" onClick={() => handleSubmit(false)} id="modal-btn-save">保存</Button>,
        <Button key="submit" type="primary" onClick={() => handleSubmit(true)} id="modal-btn-submit">保存并提交</Button>,
      ]}
    >
      <Form form={form} layout="vertical" id="modal-form">
        <Row gutter={24}>
          <Col span={8}>
            <Form.Item name="orderNo" label="库存调整单号" id="modal-form-item-orderNo">
              <Input disabled id="modal-input-orderNo" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="operator" label="操作人" id="modal-form-item-operator">
              <Input disabled id="modal-input-operator" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="createTime" label="操作时间" id="modal-form-item-createTime">
              <Input disabled id="modal-input-createTime" />
            </Form.Item>
          </Col>
        </Row>
      </Form>

      <Divider titlePlacement="left" style={{ margin: '12px 0' }}>产品明细</Divider>
      
      <div className="mb-2">
        <Button 
          type="dashed" 
          onClick={addItem} 
          block 
          icon={<PlusOutlined />}
          id="modal-btn-add-item"
        >
          添加产品行
        </Button>
      </div>

      <Table
        id="modal-table"
        dataSource={items}
        columns={columns}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 1300, y: 400 }}
      />
    </Modal>
  );
};

export default StockAdjustmentFormModal;
