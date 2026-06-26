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
import { SearchOutlined, PlusOutlined, DeleteOutlined, BarcodeOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import SubcontractPurchaseSelectModal from './modals/SubcontractPurchaseSelectModal';
import { warehouses, batches } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;

const SubcontractOutboundFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [poModalOpen, setPoModalOpen] = useState(false);
  const [items, setItems] = useState([]);

  const [adjustModalVisible, setAdjustModalVisible] = useState(false);
  const [adjustItemIndex, setAdjustItemIndex] = useState(-1);
  const [adjustTableData, setAdjustTableData] = useState([]);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          createDate: dayjs(editingRecord.createDate || editingRecord.outboundDate),
        });
        const mappedItems = (editingRecord.items || []).map(item => {
          return {
            ...item,
            applyQty: item.applyQty || (item.quantity ? item.quantity * 2 : 10),
            baseShippedQty: item.baseShippedQty || 0,
            outboundQty: item.outboundQty !== undefined ? item.outboundQty : (item.quantity || 0),
            batchAllocations: item.batchAllocations || []
          };
        });
        setItems(mappedItems);
      } else {
        form.setFieldsValue({
          orderNo: `ORDER-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
          type: '委外出库',
          createDate: dayjs(),
          handler: '管理员'
        });
        setItems([]);
      }
    }
  }, [open, editingRecord, form]);

  const handlePoSelect = (po) => {
    form.setFieldsValue({
      relNoticeNo: po.orderNo,
      partnerName: po.supplierName,
    });
    // Map items from BOM
    const newItems = po.bomMaterials.map(item => {
      return {
        ...item,
        productCode: item.materialCode,
        productName: item.materialName || item.productName,
        applyQty: item.totalQty,
        baseShippedQty: 0,
        outboundQty: 0, // initially 0 or wait for user to allocate
        warehouseName: '',
        batchNo: '',
        location: '',
        remark: '',
        batchAllocations: []
      };
    });
    setItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const [scanValue, setScanValue] = useState('');

  const handleScanAdd = (customValue) => {
    const rawVal = typeof customValue === 'string' ? customValue : scanValue;
    const trimmed = rawVal ? rawVal.trim() : '';
    if (!trimmed) {
      message.warning('请先输入或扫描序列号或产品码！');
      return;
    }
    
    // 1. Check duplicate
    const exists = adjustTableData.some(item => item.serialNo === trimmed);
    if (exists) {
      message.error(`该条码 [${trimmed}] 已在本次录入列表中，请勿重复扫码！`);
      return;
    }

    // 2. Format check simulation
    if (trimmed.startsWith('ERR_INVALID') || trimmed === 'INVALID_BARCODE') {
      message.error('条码格式无效！');
      return;
    }

    // 3. Occupied check simulation
    if (trimmed.startsWith('SN-OCCUPIED') || trimmed === 'SN_OCCUPIED_999') {
      message.error(`该序列号[${trimmed}]已存在于[OUT20260625008（出库单号）]中，不可出库`);
      return;
    }

    // 4. Mismatch check simulation
    if (trimmed.startsWith('SN-MISMATCH') || trimmed === 'SN_MISMATCH_888') {
      message.error('该序列号对应的商品并非本次待出库商品，无法录入');
      return;
    }
    
    const currentItem = items[adjustItemIndex];
    if (!currentItem) return;
    
    const totalCurrentOutbound = adjustTableData.reduce((sum, item) => sum + (item.outboundQty || 0), 0);
    const maxAllowed = Math.max(0, (currentItem.applyQty || 0) - (currentItem.baseShippedQty || 0));
    
    if (totalCurrentOutbound + 1 > maxAllowed) {
      message.error(`❌ 扫码异常：本次出库总数已达到待出库数量上限（${maxAllowed} 个），无法继续录入！`);
      return;
    }

    const isProductCode = !trimmed.toUpperCase().startsWith('SN');

    const newRow = {
      key: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      serialNo: trimmed,
      isProductCode: isProductCode,
      warehouse: warehouses[0]?.name || '原材料仓库',
      batchNo: batches[0]?.batchNo || 'B20250501001',
      location: 'A-01-01',
      stockQty: isProductCode ? 200 : 1,
      outboundQty: 1
    };
    
    setAdjustTableData(prev => [...prev, newRow]);
    setScanValue('');
    message.success('录入成功');
  };

  const handleManualAddRow = () => {
    const newKey = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newRow = {
      key: newKey,
      warehouse: warehouses[0]?.name || '原材料仓库',
      batchNo: batches[0]?.batchNo || 'B20250501001',
      location: 'A-01-01',
      stockQty: 200,
      outboundQty: 0
    };
    setAdjustTableData(prev => [...prev, newRow]);
  };

  const handleOpenAdjustModal = (index) => {
    setAdjustItemIndex(index);
    const item = items[index];
    let allocations = item.batchAllocations;
    
    if (!allocations || allocations.length === 0) {
      const maxAllowed = Math.max(0, (item.applyQty || 0) - (item.baseShippedQty || 0));
      allocations = [
        {
          key: `alloc-1-${Date.now()}`,
          warehouse: item.warehouseName || warehouses[0]?.name || '原材料仓库',
          batchNo: item.batchNo || batches[0]?.batchNo || 'B20250501001',
          location: item.location || 'A-01-01',
          stockQty: 200,
          outboundQty: maxAllowed
        }
      ];
    } else {
      allocations = allocations.map(alloc => ({
        ...alloc,
        location: alloc.location || 'A-01-01',
        stockQty: alloc.stockQty !== undefined ? alloc.stockQty : 200
      }));
    }
    
    setAdjustTableData(allocations);
    setScanValue('');
    setAdjustModalVisible(true);
  };

  const handleSaveAdjust = () => {
    if (adjustItemIndex < 0) return;
    const currentItem = items[adjustItemIndex];
    if (!currentItem) return;

    const totalOutboundQty = adjustTableData.reduce((sum, it) => sum + (it.outboundQty || 0), 0);
    const maxAllowed = Math.max(0, (currentItem.applyQty || 0) - (currentItem.baseShippedQty || 0));

    if (totalOutboundQty > maxAllowed) {
      message.error(`❌ 保存失败：实出数量总和（${totalOutboundQty} 个）已超过待出库数量上限（${maxAllowed} 个）！`);
      return;
    }

    // Check if any row's outboundQty > stockQty
    for (const row of adjustTableData) {
      if (!row.serialNo) {
        const limit = row.stockQty !== undefined ? row.stockQty : 200;
        if ((row.outboundQty || 0) > limit) {
          message.error(`❌ 保存失败：在仓库 ${row.warehouse || ''} 中分配的实出数量（${row.outboundQty || 0} 个）不能大于其库存数量（${limit} 个）！`);
          return;
        }
      }
    }

    const newItems = [...items];
    newItems[adjustItemIndex] = {
      ...currentItem,
      outboundQty: totalOutboundQty,
      batchAllocations: adjustTableData,
    };
    setItems(newItems);
    setAdjustModalVisible(false);
    message.success('仓库/批次调整保存成功！');
  };

  const getAdjustColumns = () => {
    const cols = [
      {
        title: '序号',
        key: 'index',
        width: 60,
        render: (_, __, idx) => idx + 1,
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
            return <Text copyable style={{ fontFamily: 'monospace' }}>{value} (序列号)</Text>;
          }
          return <Text type="secondary">- (手动新增)</Text>;
        }
      },
    ];

    cols.push(
      {
        title: '仓库',
        dataIndex: 'warehouse',
        key: 'warehouse',
        width: 150,
        render: (value, record) => (
          <Select
            value={value}
            placeholder="请选择仓库"
            disabled={record.serialNo && !record.isProductCode}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, warehouse: val };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          >
            {warehouses.map(w => (
              <Select.Option key={w.name} value={w.name}>{w.name}</Select.Option>
            ))}
          </Select>
        )
      },
      {
        title: '批次号',
        dataIndex: 'batchNo',
        key: 'batchNo',
        width: 150,
        render: (value, record) => (
          <Select
            value={value}
            placeholder="请选择批次"
            disabled={!!record.serialNo}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, batchNo: val };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          >
            {batches.map(b => (
              <Select.Option key={b.id || b.batchNo} value={b.batchNo}>{b.batchNo}</Select.Option>
            ))}
          </Select>
        )
      },
      {
        title: '货位',
        dataIndex: 'location',
        key: 'location',
        width: 140,
        render: (value, record) => (
          <Select
            value={value || 'A-01-01'}
            placeholder="请选择货位"
            disabled={record.serialNo && !record.isProductCode}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, location: val };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          >
            {['A-01-01', 'A-01-02', 'B-02-01', 'B-02-02', 'C-03-01', 'C-03-02'].map(loc => (
              <Select.Option key={loc} value={loc}>{loc}</Select.Option>
            ))}
          </Select>
        )
      }
    );

    cols.push({
      title: '库存数量',
      dataIndex: 'stockQty',
      key: 'stockQty',
      width: 110,
      render: (value, record) => {
        if (record.serialNo && !record.isProductCode) {
          return <Text type="secondary">- (序列号唯一)</Text>;
        }
        return value !== undefined ? <Text className="font-semibold text-blue-600">{value} 个</Text> : <Text type="secondary">200 个</Text>;
      }
    });

    cols.push({
      title: '实出数量',
      dataIndex: 'outboundQty',
      key: 'outboundQty',
      width: 130,
      render: (value, record) => {
        if (record.serialNo && !record.isProductCode) {
          return <Text strong style={{ color: '#52c41a' }}>1 个</Text>;
        }
        const limit = record.stockQty !== undefined ? record.stockQty : 200;
        const isError = (value || 0) > limit;
        return (
          <InputNumber
            min={0}
            value={value}
            status={isError ? 'error' : ''}
            onChange={(val) => {
              const newData = adjustTableData.map(item => {
                if (item.key === record.key) {
                  return { ...item, outboundQty: val || 0 };
                }
                return item;
              });
              setAdjustTableData(newData);
            }}
            style={{ width: '100%' }}
          />
        );
      }
    });

    cols.push({
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
    });

    return cols;
  };

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      if (items.length === 0) {
        message.warning('请选择委外采购单以加载物料明细');
        return;
      }

      // Check if all items have outboundQty
      const invalidItem = items.find(item => !item.outboundQty || item.outboundQty <= 0);
      if (invalidItem) {
        message.error(`物料 ${invalidItem.productName} 的本次出库数量必须大于 0，请通过“调整仓库/批次”设置`);
        return;
      }

      const preparedItems = items.map(item => {
        const activeAlloc = (item.batchAllocations || []).find(alloc => (alloc.outboundQty || 0) > 0) || (item.batchAllocations || [])[0];
        return {
          ...item,
          warehouseName: activeAlloc ? activeAlloc.warehouse : (item.warehouseName || '主成品仓库'),
          batchNo: activeAlloc ? activeAlloc.batchNo : (item.batchNo || 'B20250425PD001'),
          location: activeAlloc ? activeAlloc.location : (item.location || 'A-01-01'),
        };
      });

      onSave({ ...values, items: preparedItems, status, id: editingRecord?.id || Math.random().toString(36).substr(2, 9) });
      onCancel();
      if (status === '待审批') {
          message.info('模拟：已更新委外采购单发料状态，并更新虚拟仓库库存');
      }
    });
  };

  const columns = [
    { title: '序号', dataIndex: 'index', width: 60, fixed: 'left', render: (_, __, i) => i + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120, fixed: 'left' },
    { title: '物料名称', dataIndex: 'productName', width: 150, fixed: 'left' },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '应发数量', dataIndex: 'applyQty', width: 100, align: 'right' },
    { 
      title: '已出库数量', 
      key: 'shippedQty',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const shippedQty = record.baseShippedQty || 0;
        return <span className="font-semibold text-green-600">{shippedQty}</span>;
      }
    },
    { 
      title: '待出库数量', 
      key: 'pendingQty',
      width: 100,
      align: 'right',
      render: (_, record) => {
        const baseShipped = record.baseShippedQty || 0;
        const pendingQty = Math.max(0, (record.applyQty || 0) - baseShipped);
        return <span className="font-semibold text-amber-600">{pendingQty}</span>;
      }
    },
    {
      title: '本次出库数量',
      dataIndex: 'outboundQty',
      width: 110,
      align: 'right',
      render: (v) => <span className="font-semibold text-blue-600">{v || 0}</span>
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 150, 
      align: 'center',
      fixed: 'right',
      render: (_, record, i) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => handleOpenAdjustModal(i)}
        >
          调整仓库/批次
        </Button>
      )
    },
  ];

  return (
    <Modal forceRender
      title={editingRecord ? '编辑委外出库单' : '新增委外出库单'}
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
            <Form.Item name="relNoticeNo" label="关联委外采购单" rules={[{ required: true }]}>
              <Input 
                readOnly 
                placeholder="点击选择" 
                suffix={<SearchOutlined style={{ cursor: 'pointer' }} onClick={() => setPoModalOpen(true)} />}
                onClick={() => setPoModalOpen(true)}
              />
            </Form.Item>
          </Col>
          <Col span={6}>
            <Form.Item name="partnerName" label="供应商">
              <Input disabled />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
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

      <Divider titlePlacement="left">发料明细 (BOM 原料)</Divider>
      <Table 
        columns={columns} 
        dataSource={items} 
        rowKey="productCode" 
        pagination={false} 
        scroll={{ x: 1200, y: 300 }}
        size="small"
      />

      <SubcontractPurchaseSelectModal 
        open={poModalOpen} 
        onCancel={() => setPoModalOpen(false)} 
        onSelect={handlePoSelect} 
      />

      {/* 二级页面：调整仓库/批次 */}
      <Modal
        title="调整仓库/批次"
        open={adjustModalVisible}
        onOk={handleSaveAdjust}
        onCancel={() => setAdjustModalVisible(false)}
        width={750}
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
                {adjustItemIndex >= 0 ? items[adjustItemIndex]?.productName : ''}
              </Text>
            </span>
            <span>
              <Text strong>应发数量: </Text>
              <Text type="secondary">
                {adjustItemIndex >= 0 ? items[adjustItemIndex]?.applyQty : ''}
              </Text>
            </span>
            <span>
              <Text strong>当前调整后总数: </Text>
              <Text className="font-semibold text-green-600">
                {adjustTableData.reduce((sum, item) => sum + (item.outboundQty || 0), 0)} 个
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
                onClick={() => handleScanAdd(`SN-SC-${(items[adjustItemIndex]?.productCode || 'PROD').slice(-4)}-${Math.floor(Math.random() * 900 + 100)}`)}
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
                    const dummy = 'SN-SC-9999-001';
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

        {/* 下一行的右边 放 手动分配数量按钮 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleManualAddRow}
          >
            手动分配数量
          </Button>
        </div>

        <Table
          dataSource={adjustTableData}
          pagination={false}
          size="small"
          bordered
          rowKey="key"
          locale={{ emptyText: <Text type="secondary">暂无数据，请点击右上角“手动分配数量”进行仓库分配</Text> }}
          columns={getAdjustColumns()}
        />
      </Modal>
    </Modal>
  );
};

export default SubcontractOutboundFormModal;
