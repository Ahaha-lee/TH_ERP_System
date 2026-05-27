
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message, Upload } from 'antd';
import { SearchOutlined, InboxOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AfterSaleOrderSelectModal from './modals/AfterSaleOrderSelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const ReturnInboundFormModal = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        const initialImages = initialValues.images ? initialValues.images.map((url, index) => ({
          uid: `-img-${index}`,
          name: `voucher-${index + 1}.png`,
          status: 'done',
          url: url,
          thumbUrl: url
        })) : [];
        form.setFieldsValue({
          ...initialValues,
          image: initialImages
        });
        setItems(initialValues.items.map((it, idx) => ({ ...it, id: idx, model: it.model || 'M-2026' })));
      } else { 
        form.setFieldsValue({ 
          inboundNo: `IN-${dayjs().format("YYYYMMDD")}`,
          type: '退货入库',
          inboundDate: dayjs().format('YYYY-MM-DD'),
          operator: '管理员',
          image: []
        });
        setItems([]);
      }
    }
  }, [open, initialValues, form]);

  const handleSelectAfterSaleOrder = (order) => {
    form.setFieldsValue({
      relOrderNo: order.orderNo,
      partnerName: order.customerName,
    });
    const newItems = order.items.map((it, idx) => ({
      id: idx,
      productCode: it.productCode,
      productName: it.productName,
      spec: it.spec,
      model: it.model || (it.productCode === 'PROD001' ? 'M-2026' : it.productCode === 'PROD002' ? 'M-26' : 'M-2026'),
      unit: it.unit,
      returnQty: it.quantity,
      quantity: it.quantity,
      warehouseName: warehouses[0]?.name || '主成品仓库',
      bin: 'A-01-01'
    }));
    setItems(newItems);
    setSelectModalOpen(false);
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '型号', dataIndex: 'model', width: 110, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '退货数量', dataIndex: 'returnQty', width: 100, align: 'right' },
    { 
      title: '本次入库', 
      dataIndex: 'quantity', 
      width: 120,
      render: (val, record) => (
        <InputNumber 
          min={0.01} 
          max={record.returnQty} 
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
        message.error('请关联售后订单');
        return;
      }
      
      const fileList = values.image || [];
      const promises = fileList.map(file => {
        if (file.url) {
          return Promise.resolve(file.url);
        }
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve(e.target.result);
          };
          if (file.originFileObj) {
            reader.readAsDataURL(file.originFileObj);
          } else {
            resolve('https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80');
          }
        });
      });

      Promise.all(promises).then(imageUrls => {
        const { image, ...restValues } = values;
        onSave({ 
          ...restValues, 
          status, 
          items, 
          images: imageUrls 
        });
      });
    });
  };

  return (
    <Modal forceRender
      title={initialValues ? '编辑退货入库单' : '新增退货入库单'}
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
            <Form.Item name="relOrderNo" label="关联售后单" rules={[{ required: true, message: '请选择售后单' }]}>
              <Input 
                readOnly 
                suffix={<SearchOutlined className="cursor-pointer" onClick={() => setSelectModalOpen(true)} />} 
                placeholder="点击搜索"
                onClick={() => setSelectModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="partnerName" label="客户">
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
          <Col span={6}>
            <Form.Item name="remark" label="备注">
              <TextArea rows={1} placeholder="备注" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item 
              name="image" 
              label="凭证/图片上传" 
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e?.fileList || [];
              }}
              rules={[{ required: true, message: '请上传凭证或实物图片' }]}
              className="mb-0"
            >
              <Upload.Dragger 
                name="files" 
                maxCount={5} 
                multiple
                accept="image/*" 
                listType="picture" 
                beforeUpload={() => false}
              >
                <div className="py-4">
                  <p className="ant-upload-drag-icon text-center mb-1">
                    <InboxOutlined className="text-3xl text-blue-500" />
                  </p>
                  <p className="ant-upload-text text-sm font-semibold text-slate-700">点击选择或将图片拖放至此处</p>
                  <p className="ant-upload-hint text-xs text-slate-400 mt-1">支持上传最多 5 张图片（必需字段）</p>
                </div>
              </Upload.Dragger>
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

      <AfterSaleOrderSelectModal 
        open={selectModalOpen}
        onCancel={() => setSelectModalOpen(false)}
        onSelect={handleSelectAfterSaleOrder}
      />
    </Modal>
  );
};

export default ReturnInboundFormModal;
