
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message, Upload } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import ConsignmentOrderSelectModal from './modals/ConsignmentOrderSelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const ConsignmentInboundFormModal = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialValues) {
        const initialImages = initialValues.image 
          ? (Array.isArray(initialValues.image) ? initialValues.image : [{ uid: '-1', name: 'consignment_voucher.png', status: 'done', url: initialValues.image }])
          : (initialValues.images && initialValues.images.length > 0 
              ? initialValues.images.map((img, index) => ({ uid: `-${index}`, name: `voucher_${index}.png`, status: 'done', url: img }))
              : [{ uid: '-1', name: 'consignment_voucher.png', status: 'done', url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80' }]);

        form.setFieldsValue({
          ...initialValues,
          batchNo: initialValues.batchNo || `B-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`,
          image: initialImages
        });
        setItems(initialValues.items.map((it, idx) => {
          const oQty = it.orderQty !== undefined && it.orderQty !== null ? it.orderQty : (it.quantity + (it.receivedQty || 0));
          const rQty = it.receivedQty !== undefined && it.receivedQty !== null ? it.receivedQty : 0;
          const remQty = it.remainQty !== undefined && it.remainQty !== null ? it.remainQty : (oQty - rQty);
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
          type: '受托入库',
          inboundDate: dayjs().format('YYYY-MM-DD'),
          operator: '管理员',
          batchNo: `B-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`,
          image: [
            {
              uid: '-1',
              name: 'consignment_voucher.png',
              status: 'done',
              url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=400&q=80',
            }
          ]
        });
        setItems([]);
      }
    }
  }, [open, initialValues, form]);

  const handleSelectOrder = (order) => {
    form.setFieldsValue({
      relOrderNo: order.orderNo,
      partnerName: order.customerName,
    });
    const newItems = order.items.map((it, idx) => {
      const q = it.quantity || 100;
      return {
        id: idx,
        productCode: it.productCode || 'PROD-CS',
        productName: it.productName || '受托材料',
        spec: it.spec || '常规',
        unit: it.unit || '个',
        model: it.model || 'M-2026',
        orderQty: q,
        receivedQty: 0,
        remainQty: q,
        quantity: q,
        warehouseName: warehouses[0]?.name || '珠海分仓',
        bin: 'R-01-01'
      };
    });
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
    { title: '订单数量', dataIndex: 'orderQty', width: 100, align: 'right', render: (v) => v !== undefined && v !== null ? v : '-' },
    { title: '已入库数量', dataIndex: 'receivedQty', width: 100, align: 'right', render: (v) => v !== undefined && v !== null ? v : 0 },
    { title: '待入库数量', dataIndex: 'remainQty', width: 100, align: 'right', render: (v, record) => v !== undefined && v !== null ? v : ((record.orderQty || 0) - (record.receivedQty || 0)) },
    { 
      title: '本次入库数量', 
      dataIndex: 'quantity', 
      width: 120,
      render: (val, record) => {
        const allowedMax = record.remainQty !== undefined && record.remainQty !== null ? record.remainQty : ((record.orderQty || record.quantity) - (record.receivedQty || 0));
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
          <Select.Option value="R-01-01">R-01-01</Select.Option>
          <Select.Option value="R-01-02">R-01-02</Select.Option>
        </Select>
      )
    }
  ];

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.error('请关联受托加工订单');
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
          images: imageUrls,
          batchNo: values.batchNo || `B-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000)}`
        });
      });
    });
  };

  return (
    <Modal forceRender
      title={initialValues ? '编辑受托入库单' : '新增受托入库单'}
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
            <Form.Item name="relOrderNo" label="关联受托销售单" rules={[{ required: true, message: '请选择订单' }]}>
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
            <Form.Item name="batchNo" label="批次号" rules={[{ required: true, message: '请输入由系统生成或自定义的批次号' }]}>
              <Input placeholder="请输入批次号" />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="remark" label="备注">
              <Input placeholder="请输入备注" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item 
              name="image" 
              label="凭证/图片" 
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) return e;
                return e?.fileList || [];
              }}
              className="mb-3"
            >
              <Upload 
                name="files" 
                maxCount={5} 
                multiple
                accept="image/*" 
                listType="picture-card"
                beforeUpload={() => false}
              >
                <div>
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}>上传凭证</div>
                </div>
              </Upload>
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

      <ConsignmentOrderSelectModal 
        open={selectModalOpen}
        onCancel={() => setSelectModalOpen(false)}
        onSelect={handleSelectOrder}
      />
    </Modal>
  );
};

export default ConsignmentInboundFormModal;
