import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Table, Card, Row, Col, Statistic, Form, Input, Select, DatePicker, Button, Space, Tag, Typography, message, Dropdown, Drawer, Descriptions, Divider, Popconfirm } from 'antd';
import { useLocation } from 'react-router-dom';
import { SearchOutlined, ReloadOutlined, FileTextOutlined, AppstoreOutlined, DollarOutlined, ClockCircleOutlined, PlusOutlined, DownOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, mockData } from '../../mock/data';
import { formatCurrency } from '../../utils/helpers';

// Import Drawers
import PurchaseInboundDetailDrawer from '../../components/inbound/PurchaseInboundDetailDrawer';
import ProductionInboundDetailDrawer from '../../components/inbound/ProductionInboundDetailDrawer';
import ReturnInboundDetailDrawer from '../../components/inbound/ReturnInboundDetailDrawer';
import ConsignmentInboundDetailDrawer from '../../components/inbound/ConsignmentInboundDetailDrawer';
import SubcontractInboundDetailDrawer from '../../components/inbound/SubcontractInboundDetailDrawer';

// Import Form Modals
import PurchaseInboundFormModal from '../../components/inbound/PurchaseInboundFormModal';
import ProductionInboundFormModal from '../../components/inbound/ProductionInboundFormModal';
import ReturnInboundFormModal from '../../components/inbound/ReturnInboundFormModal';
import ConsignmentInboundFormModal from '../../components/inbound/ConsignmentInboundFormModal';
import SubcontractInboundFormModal from '../../components/inbound/SubcontractInboundFormModal';
import InboundAuditModal from '../../components/inbound/modals/InboundAuditModal';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Link } = Typography;

const InboundOrderList = () => {
  const location = useLocation();
  const [form] = Form.useForm();
  const [allData] = useMockData('inboundOrders');
  const [warehouses] = useMockData('warehouses');
  const [suppliers] = useMockData('suppliers');
  const [displayData, setDisplayData] = useState(null);
  
  const processedData = useMemo(() => {
    if (!allData) return [];
    return allData.filter(o => {
      // 过滤掉特定单号
      if (['SI-202505090001', 'RI-202505100003'].includes(o.orderNo)) {
        return false;
      }
      // 生产入库类型的只有 已入库类型的数据
      if (o.type === '生产入库') {
        return o.status === '已入库' || o.status === '已完成';
      }
      // 受托入库、退货入库类型的显示 草稿、待审核、已审核、已入库
      if (['受托入库', '退货入库'].includes(o.type)) {
        return ['草稿', '待审核', '已审核', '已入库', '已完成'].includes(o.status);
      }
      return true;
    });
  }, [allData]);

  const data = displayData || processedData;
  
  // Drawer visibility states
  const [currentDrawer, setCurrentDrawer] = useState({ type: null, open: false, orderNo: null });
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Form Modal states
  const [purchaseModalOpen, setPurchaseModalOpen] = useState(false);
  const [productionModalOpen, setProductionModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [consignmentModalOpen, setConsignmentModalOpen] = useState(false);
  const [subcontractModalOpen, setSubcontractModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = data.length;
    const totalQty = data.reduce((sum, order) => 
      sum + (order.items || []).reduce((itemSum, item) => itemSum + (item.quantity || 0), 0), 0);
    const totalAmount = data.filter(o => o.type === '采购入库').reduce((sum, order) => 
      sum + (order.items || []).reduce((itemSum, item) => itemSum + ((item.price || 0) * (item.quantity || 0)), 0), 0);
    const pendingCount = data.filter(o => o.status === '草稿').length;

    return { totalCount, totalQty, totalAmount, pendingCount };
  }, [data]);

  const handleSearch = useCallback((optionalValues) => {
    const values = optionalValues || form.getFieldsValue();
    let filtered = [...processedData];

    if (values.orderNo) {
      filtered = filtered.filter(o => (o.orderNo || '').toLowerCase().includes(values.orderNo.toLowerCase()));
    }
    if (values.type) {
      filtered = filtered.filter(o => o.type === values.type);
    }
    if (values.relOrderNo) {
      filtered = filtered.filter(o => (o.relOrderNo || '').toLowerCase().includes(values.relOrderNo.toLowerCase()));
    }
    if (values.partnerName) {
      filtered = filtered.filter(o => 
        (o.partnerName || o.supplier || o.customerName || '').includes(values.partnerName)
      );
    }
    if (values.warehouseName) {
      filtered = filtered.filter(o => (o.warehouseName || o.warehouse) === values.warehouseName);
    }
    if (values.status) {
      filtered = filtered.filter(o => o.status === values.status);
    }
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(o => dayjs(o.inboundDate || o.date).isBetween(start, end, 'day', '[]'));
    }
    
    // Material Filter (Nested)
    if (values.materialKeyword) {
      const keyword = values.materialKeyword.toLowerCase();
      filtered = filtered.filter(o => 
        (o.items || []).some(item => 
          (item.productCode && item.productCode.toLowerCase().includes(keyword)) ||
          (item.productName && item.productName.toLowerCase().includes(keyword)) ||
          (item.materialCode && item.materialCode.toLowerCase().includes(keyword)) ||
          (item.materialName && item.materialName.toLowerCase().includes(keyword))
        )
      );
    }

    setDisplayData(filtered);
    message.success('查询成功');
  }, [form, processedData]);

  useEffect(() => {
    if (location.state?.searchOrderNo) {
      const orderNo = location.state.searchOrderNo;
      form.setFieldsValue({ orderNo });
      handleSearch({ orderNo });
    }
  }, [location.state, processedData, handleSearch]);

  const handleReset = () => {
    form.resetFields();
    setDisplayData(null);
  };

  const openDrawer = (order) => {
    setCurrentDrawer({ type: order.type, open: true, orderNo: order.orderNo });
  };

  const closeDrawer = () => {
    setCurrentDrawer({ ...currentDrawer, open: false });
  };

  const handleEdit = (record) => {
    setEditingRecord(record);
    if (record.type === '采购入库') setPurchaseModalOpen(true);
    else if (record.type === '生产入库') setProductionModalOpen(true);
    else if (record.type === '退货入库') setReturnModalOpen(true);
    else if (record.type === '受托入库') setConsignmentModalOpen(true);
    else if (record.type === '委外入库') setSubcontractModalOpen(true);
  };

  const handleSave = (values) => {
    if (editingRecord) {
      mockData.upsert('inboundOrders', { ...editingRecord, ...values });
      message.success('修改成功');
    } else {
      const newOrder = {
        ...values,
        id: `in${Date.now()}`,
        orderNo: `IN${dayjs().format('YYYYMMDD')}${Math.floor(Math.random() * 9000 + 1000)}`,
        status: '草稿',
        inboundDate: dayjs().format('YYYY-MM-DD'),
        materialTypeCount: values.items?.length || 0,
      };
      mockData.upsert('inboundOrders', newOrder);
      message.success('新增成功');
    }
    setPurchaseModalOpen(false);
    setProductionModalOpen(false);
    setReturnModalOpen(false);
    setConsignmentModalOpen(false);
    setSubcontractModalOpen(false);
    setEditingRecord(null);
  };

  const addMenuItems = [
    { key: '采购入库', label: '采购入库', onClick: () => { setEditingRecord(null); setPurchaseModalOpen(true); } },
    { key: '退货入库', label: '退货入库', onClick: () => { setEditingRecord(null); setReturnModalOpen(true); } },
    { key: '委外入库', label: '委外入库', onClick: () => { setEditingRecord(null); setSubcontractModalOpen(true); } },
  ];

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { 
      title: '入库单号', 
      dataIndex: 'orderNo', 
      width: 160,
      render: (text, record) => <Link onClick={() => openDrawer(record)}>{text}</Link>
    },
    { 
      title: '入库类型', 
      dataIndex: 'type', 
      width: 120,
      render: (type) => {
        const colors = {
          '采购入库': 'blue',
          '生产入库': 'green',
          '退货入库': 'red',
          '受托入库': 'purple',
          '委外入库': 'orange'
        };
        return <Tag color={colors[type]}>{type}</Tag>;
      }
    },
    { 
      title: '关联单号', 
      dataIndex: 'relOrderNo', 
      width: 160,
      render: (text) => text ? <Link onClick={() => message.info(`跳转至关联单据: ${text}`)}>{text}</Link> : '-'
    },
    { 
      title: '供应商/客户/委外厂', 
      dataIndex: 'partnerName', 
      width: 180, 
      ellipsis: true,
      render: (text, record) => text || record.supplier || record.customerName || '-'
    },
    { 
      title: '仓库', 
      dataIndex: 'warehouseName', 
      width: 120,
      render: (text, record) => {
        if (record.type === '采购入库' && (!text || text === '-') && record.items?.length > 0) {
          const whs = [...new Set(record.items.map(it => it.warehouseName).filter(Boolean))];
          if (whs.length > 1) return <Tag>多仓库</Tag>;
          if (whs.length === 1) return whs[0];
        }
        return text || record.warehouse || '-'
      }
    },
    { 
      title: '物料种数', 
      dataIndex: 'materialTypeCount', 
      width: 100, 
      align: 'right',
      render: (text, record) => text || (record.items ? record.items.length : 0)
    },
    { 
      title: '入库日期', 
      dataIndex: 'inboundDate', 
      width: 120,
      render: (text, record) => text || record.date || '-'
    },
    { 
      title: '审核结果', 
      dataIndex: 'auditResult', 
      width: 100,
      render: (res, record) => {
        if (record.status === '已入库') return null;
        if (res === '通过') return <Tag color="success">审核通过</Tag>;
        if (res === '拒绝') return <Tag color="error">审核拒绝</Tag>;
        return <Tag color="default">-</Tag>;
      }
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 100,
      render: (status) => {
        const colors = { 
          '草稿': 'default', 
          '待审核': 'processing', 
          '待审批': 'processing', 
          '已审核': 'success', 
          '已审批': 'success', 
          '已入库': 'cyan', 
          '已完成': 'cyan' 
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      }
    },
    { 
      title: '操作', 
      fixed: 'right', 
      width: 150,
      render: (_, record) => {
        const { status, auditResult } = record;
        const isDraft = status === '草稿';
        const isAuditedRejected = (status === '已审核' || status === '已审批') && auditResult === '拒绝';

        return (
          <Space size="small">
            {isDraft && (
              <>
                <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
                <Popconfirm
                  title="您确定要删除该入库单吗？"
                  onConfirm={(e) => {
                    e.stopPropagation();
                    mockData.remove('inboundOrders', record.id);
                    message.success('删除成功');
                  }}
                  onCancel={(e) => e.stopPropagation()}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger onClick={(e) => e.stopPropagation()}>删除</Button>
                </Popconfirm>
              </>
            )}
            {status === '待审核' && (
              <Button type="link" size="small" onClick={() => {
                setCurrentRecord(record);
                setAuditModalOpen(true);
              }}>审核</Button>
            )}
            {isAuditedRejected && (
              <>
                <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
                <Button type="link" size="small" onClick={() => {
                  setCurrentRecord(record);
                  setAuditModalOpen(true);
                }}>审核</Button>
              </>
            )}
          </Space>
        );
      }
    }
  ];

  const renderDrawer = () => {
    const { type, open, orderNo } = currentDrawer;
    if (!open) return null;
    
    switch (type) {
      case '采购入库': return <PurchaseInboundDetailDrawer open={open} onClose={closeDrawer} orderNo={orderNo} />;
      case '生产入库': return <ProductionInboundDetailDrawer open={open} onClose={closeDrawer} orderNo={orderNo} />;
      case '退货入库': return <ReturnInboundDetailDrawer open={open} onClose={closeDrawer} orderNo={orderNo} />;
      case '受托入库': return <ConsignmentInboundDetailDrawer open={open} onClose={closeDrawer} orderNo={orderNo} />;
      case '委外入库': return <SubcontractInboundDetailDrawer open={open} onClose={closeDrawer} orderNo={orderNo} />;
      default: return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Stats Section */}
      <Row gutter={16}>
        <Col span={6}>
            <Card variant="borderless" className="bg-blue-50 border-blue-200">
            <Statistic 
              title={<span className="text-blue-700">入库总笔数</span>} 
              value={stats.totalCount} 
              prefix={<FileTextOutlined className="text-blue-500" />}
              styles={{ content: { color: '#1d4ed8' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-green-50 border-green-200">
            <Statistic 
              title={<span className="text-green-700">入库总数量</span>} 
              value={stats.totalQty} 
              prefix={<AppstoreOutlined className="text-green-500" />}
              styles={{ content: { color: '#15803d' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-teal-50 border-teal-200">
            <Statistic 
              title={<span className="text-teal-700">入库总金额 (采购)</span>} 
              value={stats.totalAmount} 
              precision={2}
              prefix={<DollarOutlined className="text-teal-500" />}
              styles={{ content: { color: '#0f766e' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-orange-50 border-orange-200">
            <Statistic 
              title={<span className="text-orange-700">待审核笔数</span>} 
              value={stats.pendingCount} 
              prefix={<ClockCircleOutlined className="text-orange-500" />}
              styles={{ content: { color: '#c2410c' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Search Section */}
      <Card size="small">
        <Form form={form} layout="inline">
          <Row gutter={[16, 16]} className="w-full">
            <Col>
              <Form.Item name="orderNo" label="入库单号">
                <Input placeholder="请输入" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="type" label="入库类型">
                <Select placeholder="请选择" style={{ width: 130 }} allowClear>
                  <Option value="采购入库">采购入库</Option>
                  <Option value="生产入库">生产入库</Option>
                  <Option value="退货入库">退货入库</Option>
                  <Option value="受托入库">受托入库</Option>
                  <Option value="委外入库">委外入库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="partnerName" label="供应商/客户">
                <Select placeholder="请选择" style={{ width: 180 }} allowClear showSearch>
                  {suppliers.map(s => <Option key={s.id} value={s.name}>{s.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="warehouseName" label="仓库">
                <Select placeholder="请选择" style={{ width: 130 }} allowClear>
                  {warehouses.map(w => <Option key={w.id} value={w.name}>{w.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="materialKeyword" label="物料编码/名称">
                <Input placeholder="支持模糊搜索" allowClear />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="status" label="状态">
                <Select placeholder="请选择" style={{ width: 110 }} allowClear>
                  <Option value="草稿">草稿</Option>
                  <Option value="待审核">待审核</Option>
                  <Option value="已入库">已入库</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              <Form.Item name="dateRange" label="入库日期">
                <RangePicker style={{ width: 250 }} />
              </Form.Item>
            </Col>
            <Col>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                <Dropdown menu={{ items: addMenuItems }} trigger={['click']}>
                  <Button type="primary" icon={<PlusOutlined />}>
                    新增入库 <DownOutlined />
                  </Button>
                </Dropdown>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Table Section */}
      <Card size="small" title="入库单列表">
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          size="small" 
          scroll={{ x: 1300 }}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && !e.target.closest('button') && !e.target.closest('a')) {
                openDrawer(record);
              }
            },
            className: 'cursor-pointer'
          })}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            total: data.length,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000']
          }}
        />
      </Card>

      {/* Detail Drawers */}
      {renderDrawer()}

      {/* Form Modals */}
      <PurchaseInboundFormModal 
        open={purchaseModalOpen} 
        onCancel={() => { setPurchaseModalOpen(false); setEditingRecord(null); }}
        onSave={handleSave}
        initialValues={editingRecord}
      />
      <ProductionInboundFormModal 
        open={productionModalOpen}
        onCancel={() => { setProductionModalOpen(false); setEditingRecord(null); }}
        onSave={handleSave}
        initialValues={editingRecord}
      />
      <ReturnInboundFormModal 
        open={returnModalOpen}
        onCancel={() => { setReturnModalOpen(false); setEditingRecord(null); }}
        onSave={handleSave}
        initialValues={editingRecord}
      />
      <ConsignmentInboundFormModal
        open={consignmentModalOpen}
        onCancel={() => { setConsignmentModalOpen(false); setEditingRecord(null); }}
        onSave={handleSave}
        initialValues={editingRecord}
      />
      <SubcontractInboundFormModal
        open={subcontractModalOpen}
        onCancel={() => { setSubcontractModalOpen(false); setEditingRecord(null); }}
        onSave={handleSave}
        initialValues={editingRecord}
      />
      <InboundAuditModal 
        open={auditModalOpen}
        record={currentRecord}
        onCancel={() => { setAuditModalOpen(false); setCurrentRecord(null); }}
        onSuccess={(updatedRecord) => {
          mockData.upsert('inboundOrders', updatedRecord);
          setAuditModalOpen(false);
          setCurrentRecord(null);
        }}
      />
    </div>
  );
};

export default InboundOrderList;
