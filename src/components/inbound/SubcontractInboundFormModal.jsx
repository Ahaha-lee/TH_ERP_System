
import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Input, Select, Button, Table, Space, InputNumber, Typography, message, Upload } from 'antd';
import { SearchOutlined, InboxOutlined, ReloadOutlined, PlusOutlined, DeleteOutlined, BarcodeOutlined } from '@ant-design/icons';
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

  // Secondary adjust modal states
  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [adjustTableData, setAdjustTableData] = useState([]);
  const [scanValue, setScanValue] = useState('');

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
            model: it.model || 'M-2026',
            adjustments: (it.adjustments || [
              {
                key: `${idx}-adj-0`,
                serialNo: it.serialNo || '',
                isProductCode: it.isProductCode || false,
                warehouseName: it.warehouseName || (warehouses[0]?.name || ''),
                bin: it.bin || '',
                quantity: it.quantity || 0
              }
            ]).map((adj, i_adj) => ({
              ...adj,
              key: adj.key || `${idx}-adj-${i_adj}`,
              serialNo: adj.serialNo || '',
              isProductCode: adj.isProductCode || false
            }))
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

  const handleOpenAdjustModal = (recordItem) => {
    setSelectedItemId(recordItem.id);
    const parentRemainQty = recordItem.remainQty !== undefined && recordItem.remainQty !== null ? recordItem.remainQty : (recordItem.orderQty - recordItem.receivedQty);
    if (recordItem.adjustments && recordItem.adjustments.length > 0) {
      setAdjustTableData(recordItem.adjustments.map((adj, idx) => ({
        key: adj.key || `${recordItem.id}-adj-${idx}`,
        serialNo: adj.serialNo || '',
        isProductCode: adj.isProductCode || false,
        warehouseName: adj.warehouseName,
        bin: adj.bin,
        quantity: adj.quantity
      })));
    } else {
      setAdjustTableData([
        {
          key: `${recordItem.id}-adj-0`,
          serialNo: '',
          isProductCode: false,
          warehouseName: recordItem.warehouseName || (warehouses[0]?.name || ''),
          bin: recordItem.bin || '',
          quantity: parentRemainQty || 0
        }
      ]);
    }
    setAdjustModalVisible(true);
  };

  const handleAddWarehouseRow = () => {
    const newKey = `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setAdjustTableData(prev => [
      ...prev,
      {
        key: newKey,
        serialNo: '',
        isProductCode: false,
        warehouseName: warehouses[0]?.name || '',
        bin: '',
        quantity: 0
      }
    ]);
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

    const currentItem = items.find(item => item.id === selectedItemId);
    const totalCurrentInbound = adjustTableData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const maxQty = currentItem ? (currentItem.orderQty - currentItem.receivedQty) : 0;

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
      warehouseName: warehouses[0]?.name || '原材料仓库',
      bin: 'A-01-01',
      quantity: 1
    };

    setAdjustTableData(prev => [...prev, newRow]);
    setScanValue('');
    message.success('录入成功');
  };

  const handleSaveAdjust = () => {
    const selectedItem = items.find(item => item.id === selectedItemId);
    const parentRemainQty = selectedItem ? (selectedItem.remainQty !== undefined && selectedItem.remainQty !== null ? selectedItem.remainQty : (selectedItem.orderQty - selectedItem.receivedQty)) : 0;
    
    const totalAdjusted = adjustTableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
    if (totalAdjusted > parentRemainQty) {
      message.error(`所有实入数量之和（${totalAdjusted}）不能超过待入库数量（${parentRemainQty}）`);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === selectedItemId) {
        const firstAdj = adjustTableData[0] || {};
        return {
          ...item,
          warehouseName: firstAdj.warehouseName,
          bin: firstAdj.bin,
          quantity: totalAdjusted,
          adjustments: adjustTableData
        };
      }
      return item;
    }));
    setAdjustModalVisible(false);
    message.success('调整仓库成功');
  };

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
    const newItems = order.items.map((it, idx) => {
      const remain = it.quantity - (it.receivedQty || 0);
      return {
        id: idx,
        productCode: it.productCode,
        productName: it.productName,
        spec: it.spec,
        model: it.model || (it.productCode === 'ACC001' ? 'M-Hinge-110' : it.productCode === 'PROD001' ? 'M-2026' : 'M-2026'),
        unit: it.unit,
        orderQty: it.quantity,
        receivedQty: it.receivedQty || 0,
        remainQty: remain,
        quantity: remain,
        price: it.price,
        warehouseName: warehouses[0]?.name || '原材料仓库',
        bin: 'A-01-01',
        adjustments: [
          {
            key: `adj-${idx}-0`,
            warehouseName: warehouses[0]?.name || '原材料仓库',
            bin: '',
            quantity: remain
          }
        ]
      };
    });
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
    { 
      title: '已入库数量', 
      dataIndex: 'receivedQty', 
      width: 100, 
      align: 'right',
      render: (_, r) => r.receivedQty !== undefined ? r.receivedQty : 0
    },
    { 
      title: '待入库数量', 
      dataIndex: 'remainQty', 
      width: 100, 
      align: 'right', 
      render: (_, r) => (r.orderQty || 0) - (r.receivedQty || 0)
    },
    {
      title: '本次入库数量',
      dataIndex: 'quantity',
      width: 110,
      align: 'right',
      render: (v) => <span className="font-semibold text-blue-600">{v || 0}</span>
    },
    { 
      title: '加工费单价', 
      dataIndex: 'price', 
      width: 100, 
      align: 'right',
      render: (val) => <Text>¥{Number(val || 0).toFixed(2)}</Text>
    },
    {
      title: '操作',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Space size={0}>
          <Button 
            type="link" 
            size="small" 
            onClick={() => handleOpenAdjustModal(record)}
          >
            调整仓库
          </Button>
          <Button 
            type="link" 
            danger 
            size="small" 
            onClick={() => setItems(items.filter(it => it.id !== record.id))}
          >
            删除
          </Button>
        </Space>
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

  const selectedItem = items.find(item => item.id === selectedItemId);
  const parentRemainQty = selectedItem ? (selectedItem.remainQty !== undefined && selectedItem.remainQty !== null ? selectedItem.remainQty : (selectedItem.orderQty - selectedItem.receivedQty)) : 0;
  const totalAdjusted = adjustTableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);

  return (
    <>
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

    <Modal
      title="调整仓库"
      open={adjustModalVisible}
      onCancel={() => setAdjustModalVisible(false)}
      onOk={handleSaveAdjust}
      width={780}
      destroyOnHidden
      centered
    >
      <div style={{ marginBottom: 16 }}>
        <Space size="large">
          <span>
            <Text strong>物料名称: </Text>
            <Text type="secondary">
              {selectedItem?.productName || '未选物料'}
            </Text>
          </span>
          <span>
            <Text strong>待入库数量: </Text>
            <Text className="font-semibold text-blue-600">
              {parentRemainQty || 0} {selectedItem?.unit || '个'}
            </Text>
          </span>
          <span>
            <Text strong>已分配总量: </Text>
            <Text strong className={totalAdjusted > parentRemainQty ? "text-red-500" : "text-green-600"}>
              {totalAdjusted} / {parentRemainQty || 0}
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
          onClick={handleAddWarehouseRow}
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
            render: (_, __, idx) => idx + 1
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
            dataIndex: 'warehouseName',
            key: 'warehouseName',
            width: 180,
            render: (text, recordItem) => (
              <Select
                placeholder="请选择仓库"
                value={text}
                style={{ width: '100%' }}
                onChange={(val) => {
                  const newData = adjustTableData.map(item => {
                    if (item.key === recordItem.key) {
                      return { ...item, warehouseName: val, bin: undefined };
                    }
                    return item;
                  });
                  setAdjustTableData(newData);
                }}
              >
                {warehouses.map(wh => (
                  <Select.Option key={wh.id} value={wh.name}>{wh.name}</Select.Option>
                ))}
              </Select>
            )
          },
          {
            title: '货位',
            dataIndex: 'bin',
            key: 'bin',
            width: 180,
            render: (text, recordItem) => {
              const wh = warehouses.find(h => h.name === recordItem.warehouseName);
              const bins = wh ? (wh.locations || []) : [];
              return (
                <Select
                  placeholder="请选择货位"
                  value={text}
                  style={{ width: '100%' }}
                  disabled={!recordItem.warehouseName}
                  onChange={(val) => {
                    const newData = adjustTableData.map(item => {
                      if (item.key === recordItem.key) {
                        return { ...item, bin: val };
                      }
                      return item;
                    });
                    setAdjustTableData(newData);
                  }}
                >
                  {bins.map(loc => (
                    <Select.Option key={loc.id} value={loc.name}>{loc.name}</Select.Option>
                  ))}
                </Select>
              );
            }
          },
          {
            title: '实入数量',
            dataIndex: 'quantity',
            key: 'quantity',
            width: 120,
            align: 'right',
            render: (val, recordItem) => {
              if (recordItem.serialNo && !recordItem.isProductCode) {
                return <Text strong className="text-green-600">1</Text>;
              }
              return (
                <InputNumber
                  min={0.01}
                  value={val}
                  style={{ width: '100%' }}
                  onChange={(v) => {
                    const newData = adjustTableData.map(item => {
                      if (item.key === recordItem.key) {
                        return { ...item, quantity: v || 0 };
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
            render: (_, recordItem) => (
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={adjustTableData.length <= 1}
                onClick={() => {
                  setAdjustTableData(prev => prev.filter(item => item.key !== recordItem.key));
                }}
              />
            )
          }
        ]}
      />
    </Modal>
    </>
  );
};

export default SubcontractInboundFormModal;
