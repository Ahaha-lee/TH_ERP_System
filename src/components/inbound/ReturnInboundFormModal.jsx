
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message, Upload, Tag } from 'antd';
import { SearchOutlined, InboxOutlined, PlusOutlined, DeleteOutlined, BarcodeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import AfterSaleOrderSelectModal from './modals/AfterSaleOrderSelectModal';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const ReturnInboundFormModal = ({ open, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);
  const [selectModalOpen, setSelectModalOpen] = useState(false);

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustItemIndex, setAdjustItemIndex] = useState(-1);
  const [adjustTableData, setAdjustTableData] = useState([]);
  const [scanValue, setScanValue] = useState('');

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
        setItems((initialValues.items || []).map((it, idx) => {
          const allocations = it.warehouseAllocations || (it.warehouseName ? [{
            key: `alloc-${idx}-init`,
            warehouse: it.warehouseName,
            location: it.bin || 'A-01-01',
            inboundQty: it.quantity || 0
          }] : []);
          return {
            ...it,
            id: idx,
            model: it.model || 'M-2026',
            warehouseAllocations: allocations,
            quantity: allocations.reduce((sum, item) => sum + (item.inboundQty || 0), 0)
          };
        }));
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
      quantity: 0,
      warehouseName: '',
      bin: '',
      warehouseAllocations: []
    }));
    setItems(newItems);
    setSelectModalOpen(false);
  };

  const handleOpenAdjust = (record, index) => {
    setAdjustItemIndex(index);
    let allocations = record.warehouseAllocations;
    if (!allocations || allocations.length === 0) {
      allocations = [];
    }
    setAdjustTableData(allocations);
    setAdjustModalVisible(true);
  };

  const handleAddAdjustRow = () => {
    const newKey = `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRow = {
      key: newKey,
      serialNo: '',
      isProductCode: false,
      warehouse: warehouses[0]?.name || '一厂成品仓',
      location: 'A-01-01',
      inboundQty: 0
    };
    setAdjustTableData(prev => [...prev, newRow]);
  };

  const handleScanAdd = (customValue) => {
    const rawVal = typeof customValue === 'string' ? customValue : scanValue;
    const trimmed = rawVal ? rawVal.trim() : '';
    if (!trimmed) {
      message.warning('请先输入或扫描序列号或产品码！');
      return;
    }
    
    // Check format error simulation
    if (trimmed.startsWith('ERR_INVALID') || trimmed === 'INVALID_BARCODE') {
      message.error('条码格式无效！');
      return;
    }

    // Check mismatch simulation
    if (trimmed.startsWith('SN-MISMATCH') || trimmed === 'SN_MISMATCH_888') {
      message.error('该序列号对应的商品并非本次待出库商品，无法录入');
      return;
    }

    // Check occupied simulation
    if (trimmed.startsWith('SN-OCCUPIED') || trimmed === 'SN_OCCUPIED_999') {
      message.error(`该序列号[${trimmed}]已存在于其他入库单中，不可入库`);
      return;
    }

    const currentItem = items[adjustItemIndex];
    const totalCurrentInbound = adjustTableData.reduce((sum, item) => sum + (item.inboundQty || 0), 0);
    const maxQty = currentItem ? currentItem.returnQty : 0;

    // Check duplicate scanning
    const exists = adjustTableData.some(item => item.serialNo === trimmed && trimmed);
    if (exists) {
      message.error(`该条码 [${trimmed}] 已在本次录入列表中，请勿重复扫码！`);
      return;
    }

    // Check if total scanned would exceed the max allowed quantity
    if (totalCurrentInbound + 1 > maxQty) {
      message.error(`❌ 扫码异常：本次入库总数已达到待入库数量上限（${maxQty} 个），无法继续录入！`);
      return;
    }

    const isProductCode = !trimmed.toUpperCase().startsWith('SN');
    const newRow = {
      key: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      serialNo: isProductCode ? '' : trimmed,
      isProductCode: isProductCode,
      warehouse: warehouses[0]?.name || '一厂成品仓',
      location: 'A-01-01',
      inboundQty: 1
    };

    setAdjustTableData(prev => [...prev, newRow]);
    setScanValue('');
    message.success('录入成功');
  };

  const handleSaveAdjust = () => {
    if (adjustItemIndex < 0) return;
    const currentItem = items[adjustItemIndex];
    const totalInboundQty = adjustTableData.reduce((sum, it) => sum + (it.inboundQty || 0), 0);
    
    if (totalInboundQty > currentItem.returnQty) {
      message.error(`实入数量之和不能超过退货数量 ${currentItem.returnQty}`);
      return;
    }

    const updatedItems = items.map((it, idx) => {
      if (idx === adjustItemIndex) {
        const firstAlloc = adjustTableData[0] || {};
        return {
          ...it,
          warehouseAllocations: adjustTableData,
          quantity: totalInboundQty,
          warehouseName: firstAlloc.warehouse || '',
          bin: firstAlloc.location || ''
        };
      }
      return it;
    });

    setItems(updatedItems);
    setAdjustModalVisible(false);
    message.success('仓库调整保存成功！');
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
      title: '本次入库总量',
      key: 'quantity',
      width: 120,
      render: (_, record) => {
        const total = (record.warehouseAllocations || []).reduce((sum, item) => sum + (item.inboundQty || 0), 0);
        return <Text strong className="text-blue-600">{total} 个</Text>;
      }
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      align: 'center',
      render: (_, record, index) => (
        <Button 
          type="link" 
          onClick={() => handleOpenAdjust(record, index)}
        >
          调整仓库
        </Button>
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

      <Modal
        title="调整仓库"
        open={adjustModalVisible}
        onOk={handleSaveAdjust}
        onCancel={() => setAdjustModalVisible(false)}
        width={780}
        destroyOnHidden
        okText="确定"
        cancelText="取消"
        centered
      >
        <div style={{ marginBottom: 16 }}>
          <Space size="large">
            <span>
              <Text strong>物料名称: </Text>
              <Text type="secondary">
                {items[adjustItemIndex]?.productName || '未选物料'}
              </Text>
            </span>
            <span>
              <Text strong>退货数量: </Text>
              <Text className="font-semibold text-blue-600">
                {items[adjustItemIndex]?.returnQty || 0} {items[adjustItemIndex]?.unit || '个'}
              </Text>
            </span>
            <span>
              <Text strong>已分配总量: </Text>
              <Text strong className={adjustTableData.reduce((sum, it) => sum + (it.inboundQty || 0), 0) > (items[adjustItemIndex]?.returnQty || 0) ? "text-red-500" : "text-green-600"}>
                {adjustTableData.reduce((sum, it) => sum + (it.inboundQty || 0), 0)} / {items[adjustItemIndex]?.returnQty || 0}
              </Text>
            </span>
          </Space>
        </div>

        {/* 扫码录入的部件占满一行 */}
        <div style={{ marginBottom: 16, padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
          <div style={{ fontWeight: '600', marginBottom: 8, color: '#262626' }}>
            🔍 扫码录入：
          </div>
          <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
            <Space>
              <BarcodeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
              <Input
                placeholder="请输入序列号/产品码或扫描条码并回车"
                value={scanValue}
                onChange={(e) => setScanValue(e.target.value)}
                onPressEnter={() => handleScanAdd()}
                style={{ width: 240 }}
                allowClear
              />
              <Button type="primary" onClick={() => handleScanAdd()}>录入</Button>
            </Space>
          </Space>

          <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
            <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: 4 }}>
              💡 模拟扫码测试工具箱（快捷触发扫码及各种异常检测）：
            </div>
            <Space wrap size="small">
              <Button 
                size="small" 
                onClick={() => handleScanAdd(`SN-2026-06${Math.floor(Math.random() * 9000 + 1000)}`)}
                style={{ color: '#2f54eb', borderColor: '#adc6ff', background: '#f0f5ff', fontSize: '11px' }}
              >
                🟢 扫码序列号
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd(`PROD-WOOD-${Math.floor(Math.random() * 900 + 100)}`)}
                style={{ color: '#096dd9', borderColor: '#91d5ff', background: '#e6f7ff', fontSize: '11px' }}
              >
                🔵 扫码产品码 (可改仓库/数量)
              </Button>
              <Button 
                size="small" 
                onClick={() => {
                  if (adjustTableData.length > 0 && adjustTableData.some(i => i.serialNo)) {
                    const firstScanned = adjustTableData.find(i => i.serialNo);
                    handleScanAdd(firstScanned.serialNo);
                  } else {
                    const dummy = 'SN-2026-069999';
                    handleScanAdd(dummy);
                    setTimeout(() => handleScanAdd(dummy), 300);
                  }
                }}
                style={{ color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6', fontSize: '11px' }}
              >
                ⚠️ 重复扫码
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd('ERR_INVALID_CODE')}
                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
              >
                ❌ 格式错误
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd('SN-OCCUPIED_999')}
                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
              >
                ❌ 被占用
              </Button>
              <Button 
                size="small" 
                onClick={() => handleScanAdd('SN-MISMATCH_888')}
                style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
              >
                ❌ 商品不匹配
              </Button>
            </Space>
          </div>
        </div>

        {/* 按钮在扫码部件下面一行，右侧对齐 */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAddAdjustRow}
          >
            添加仓库分配
          </Button>
        </div>

        {/* 列表字段：序号、序列号、仓库、货位、实入数量、操作（删除） */}
        <Table
          dataSource={adjustTableData}
          pagination={false}
          size="small"
          bordered
          rowKey="key"
          locale={{ emptyText: <Text type="secondary">暂无分配数据，请点击上方“添加仓库分配”或扫码进行分配</Text> }}
          columns={[
            {
              title: '序号',
              key: 'index',
              width: 60,
              align: 'center',
              render: (_, __, index) => index + 1
            },
            {
              title: '序列号',
              dataIndex: 'serialNo',
              key: 'serialNo',
              width: 180,
              render: (value, record) => {
                if (value) {
                  if (record.isProductCode) {
                    return null;
                  }
                  return <Text copyable className="font-mono">{value}</Text>;
                }
                return <Text type="secondary">-</Text>;
              }
            },
            {
              title: '仓库',
              dataIndex: 'warehouse',
              key: 'warehouse',
              width: 180,
              render: (value, record) => (
                <Select
                  value={value}
                  placeholder="请选择仓库"
                  style={{ width: '100%' }}
                  onChange={(val) => {
                    const newData = adjustTableData.map(item => {
                      if (item.key === record.key) {
                        return { ...item, warehouse: val };
                      }
                      return item;
                    });
                    setAdjustTableData(newData);
                  }}
                >
                  {warehouses.map(w => (
                    <Select.Option key={w.id} value={w.name}>
                      {w.name}
                    </Select.Option>
                  ))}
                </Select>
              )
            },
            {
              title: '货位',
              dataIndex: 'location',
              key: 'location',
              width: 180,
              render: (value, record) => (
                <Select
                  value={value}
                  placeholder="请选择货位"
                  disabled={!record.warehouse}
                  style={{ width: '100%' }}
                  onChange={(val) => {
                    const newData = adjustTableData.map(item => {
                      if (item.key === record.key) {
                        return { ...item, location: val };
                      }
                      return item;
                    });
                    setAdjustTableData(newData);
                  }}
                >
                  <Select.Option value="A-01-01">A-01-01</Select.Option>
                  <Select.Option value="A-01-02">A-01-02</Select.Option>
                  <Select.Option value="B-01-01">B-01-01</Select.Option>
                  <Select.Option value="B-02-01">B-02-01</Select.Option>
                  <Select.Option value="C-01-01">C-01-01</Select.Option>
                </Select>
              )
            },
            {
              title: '实入数量',
              dataIndex: 'inboundQty',
              key: 'inboundQty',
              width: 120,
              align: 'right',
              render: (value, record) => {
                if (record.serialNo && !record.isProductCode) {
                  return <Text strong className="text-green-600">1</Text>;
                }
                return (
                  <InputNumber
                    min={0.01}
                    placeholder="请输入数量"
                    value={value}
                    style={{ width: '100%' }}
                    onChange={(val) => {
                      const newData = adjustTableData.map(item => {
                        if (item.key === record.key) {
                          return { ...item, inboundQty: val || 0 };
                        }
                        return item;
                      });
                      setAdjustTableData(newData);
                    }}
                  />
                );
              }
            },
            {
              title: '操作',
              key: 'action',
              width: 80,
              align: 'center',
              render: (_, record) => (
                <Button 
                  type="text" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => {
                    setAdjustTableData(prev => prev.filter(item => item.key !== record.key));
                  }}
                />
              )
            }
          ]}
        />
      </Modal>
    </Modal>
  );
};

export default ReturnInboundFormModal;
