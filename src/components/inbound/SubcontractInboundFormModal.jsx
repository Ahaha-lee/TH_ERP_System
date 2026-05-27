
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message, Upload } from 'antd';
import { SearchOutlined, InboxOutlined, ReloadOutlined } from '@ant-design/icons';
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
  const [searchForm] = Form.useForm();
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    if (selectModalOpen) {
      searchForm.resetFields();
      setFilteredOrders(subcontractPurchaseOrders || []);
      setSelectedOrder(null);
    }
  }, [selectModalOpen]);

  const handleSearchSubcontract = () => {
    const vals = searchForm.getFieldsValue();
    let res = [...subcontractPurchaseOrders];
    if (vals.orderNo) {
      res = res.filter(o => o.orderNo.toLowerCase().includes(vals.orderNo.toLowerCase().trim()));
    }
    if (vals.supplierName) {
      res = res.filter(o => o.supplierName.toLowerCase().includes(vals.supplierName.toLowerCase().trim()));
    }
    setFilteredOrders(res);
  };

  const handleResetSubcontract = () => {
    searchForm.resetFields();
    setFilteredOrders(subcontractPurchaseOrders || []);
  };

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
          batchNo: initialValues.batchNo || 'B20250425PD001',
          image: initialImages
        });
        setItems(initialValues.items.map((it, idx) => {
          const oQty = it.orderQty !== undefined && it.orderQty !== null ? it.orderQty : (it.processQty !== undefined ? it.processQty : (it.quantity + (it.receivedQty || it.finishedQty || 0)));
          const rQty = it.receivedQty !== undefined && it.receivedQty !== null ? it.receivedQty : (it.finishedQty || 0);
          const remQty = it.remainQty !== undefined && it.remainQty !== null ? it.remainQty : (it.pendingQty !== undefined ? it.pendingQty : (oQty - rQty));
          return {
            ...it,
            id: idx,
            orderQty: oQty,
            receivedQty: rQty,
            remainQty: remQty,
            model: it.model || 'M-2026'
          };
        }));
      } else { 
        form.setFieldsValue({ 
          inboundNo: `IN-${dayjs().format("YYYYMMDD")}`,
          orderNo: `IN-${dayjs().format("YYYYMMDD")}-${Math.floor(Math.random() * 1000)}`,
          type: '委外入库',
          inboundDate: dayjs().format('YYYY-MM-DD'),
          operator: '管理员',
          batchNo: `B-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`,
          image: []
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
      model: it.model || (it.productCode === 'ACC001' ? 'M-Hinge-110' : it.productCode === 'PROD001' ? 'M-2026' : 'M-2026'),
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
    { title: '型号', dataIndex: 'model', width: 110, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '委外数量', dataIndex: 'orderQty', width: 100, align: 'right' },
    { title: '已入库数量', dataIndex: 'receivedQty', width: 100, align: 'right' },
    { title: '待入库数量', dataIndex: 'remainQty', width: 100, align: 'right', render: (v, r) => v !== undefined && v !== null ? v : (r.orderQty - r.receivedQty) },
    { 
      title: '本次入库', 
      dataIndex: 'quantity', 
      width: 120,
      render: (val, record) => {
        const allowedMax = record.remainQty !== undefined && record.remainQty !== null ? record.remainQty : (record.orderQty - record.receivedQty);
        return (
          <InputNumber 
            min={0} 
            max={allowedMax > 0 ? allowedMax : undefined} 
            value={val} 
            size="small"
            onChange={(newVal) => {
              const nextItems = items.map(it => it.id === record.id ? { ...it, quantity: newVal } : it);
              setItems(nextItems);
            }}
          />
        );
      }
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
        if (status === '待审批') {
          message.info('审核通过后，加工件入库，虚拟仓原料自动扣减 (模拟提示)');
        }
      });
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
          <Col span={6}>
            <Form.Item name="batchNo" label="批次号" rules={[{ required: true, message: '请输入或生成批次号' }]}>
              <Input placeholder="请输入批次号" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item name="remark" label="备注" className="mb-3">
              <TextArea rows={2} placeholder="请输入备注信息" />
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
        <Form form={searchForm} layout="inline" className="mb-4">
          <Form.Item name="orderNo" label="采购单">
            <Input placeholder="请输入采购单号" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item name="supplierName" label="供应商">
            <Input placeholder="请输入供应商名称" allowClear style={{ width: 180 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearchSubcontract}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleResetSubcontract}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
        <Table 
          dataSource={filteredOrders} 
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
