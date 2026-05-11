
import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  message,
  Tooltip,
  Divider,
  Dropdown,
  Menu,
  Drawer,
  Descriptions,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  FileTextOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined,
  ShoppingOutlined,
  InboxOutlined,
  SendOutlined,
  ExclamationCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, mockData } from '../../mock/data';

// Import drawers
import SalesOutboundDetailDrawer from '../../components/outbound/SalesOutboundDetailDrawer';
import PickOutboundDetailDrawer from '../../components/outbound/PickOutboundDetailDrawer';
import SubcontractOutboundDetailDrawer from '../../components/outbound/SubcontractOutboundDetailDrawer';
import OtherOutboundDetailDrawer from '../../components/outbound/OtherOutboundDetailDrawer';

// Import Form Modals
import SalesOutboundFormModal from '../../components/outbound/SalesOutboundFormModal';
import PickOutboundFormModal from '../../components/outbound/PickOutboundFormModal';
import SubcontractOutboundFormModal from '../../components/outbound/SubcontractOutboundFormModal';
import OtherOutboundFormModal from '../../components/outbound/OtherOutboundFormModal';
import OutboundAuditModal from '../../components/outbound/modals/OutboundAuditModal';

const { RangePicker } = DatePicker;
const { Text, Link } = Typography;

const OutboundOrderList = () => {
  const [form] = Form.useForm();
  const [allData] = useMockData('outboundOrders');
  const [warehouses] = useMockData('warehouses');
  const [displayData, setDisplayData] = useState(null);
  const data = (displayData || allData || []).filter(order => {
    if (order.orderNo === 'OUT20250502005') return false;
    return order.type !== '领料出库' || ['已审批', '已出库'].includes(order.status);
  });

  const [currentDrawer, setCurrentDrawer] = useState({ type: null, open: false, orderId: null });
  const [currentRecord, setCurrentRecord] = useState(null);
  
  // Modal states
  const [salesModalOpen, setSalesModalOpen] = useState(false);
  const [pickModalOpen, setPickModalOpen] = useState(false);
  const [subModalOpen, setSubModalOpen] = useState(false);
  const [otherModalOpen, setOtherModalOpen] = useState(false);
  const [auditModalOpen, setAuditModalOpen] = useState({ open: false, record: null });
  const [editingRecord, setEditingRecord] = useState(null);

  // Statistics Calculation
  const stats = useMemo(() => {
    const totalCount = data.length;
    let totalQty = 0;
    let totalAmount = 0;
    let pendingApproval = 0;

    data.forEach(order => {
      if (order.status === '待审核' || order.status === '待审批') pendingApproval++;
      order.items?.forEach(item => {
        totalQty += item.quantity || item.outboundQty || 0;
        totalAmount += (item.quantity || item.outboundQty || 0) * (item.price || 0);
      });
    });

    return { totalCount, totalQty, totalAmount, pendingApproval };
  }, [data]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...allData];

    if (values.orderNo) filtered = filtered.filter(o => o.orderNo?.includes(values.orderNo));
    if (values.type) filtered = filtered.filter(o => o.type === values.type);
    if (values.relOrderNo) filtered = filtered.filter(o => o.relOrderNo?.includes(values.relOrderNo));
    if (values.warehouseName) filtered = filtered.filter(o => o.warehouseName === values.warehouseName);
    if (values.status) filtered = filtered.filter(o => o.status === values.status);
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(o => dayjs(o.outboundDate || o.date).isBetween(start, end, 'day', '[]'));
    }
    if (values.partnerName) filtered = filtered.filter(o => (o.partnerName || '').includes(values.partnerName));

    setDisplayData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setDisplayData(null);
  };

  const openDrawer = (type, orderId) => {
    setCurrentDrawer({ type, open: true, orderId });
  };

  const closeDrawer = () => {
    setCurrentDrawer({ ...currentDrawer, open: false });
  };

  const handleSaveOrder = (values) => {
    if (editingRecord) {
        mockData.upsert('outboundOrders', { ...editingRecord, ...values });
        message.success('单据已更新');
    } else {
        const newOrder = {
            ...values,
            id: `out_${Date.now()}`,
            outboundDate: values.createDate?.format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD'),
            materialTotal: values.items?.length || 0,
            status: '草稿'
        };
        mockData.upsert('outboundOrders', newOrder);
        message.success('新出库单已创建');
    }
    setEditingRecord(null);
  };

  const handleAuditConfirm = (auditValues) => {
    const record = auditModalOpen.record;
    const isPass = auditValues.auditResult === '通过';
    
    if (isPass) {
      mockData.upsert('outboundOrders', { 
          ...record, 
          status: '已出库',
          auditResult: auditValues.auditResult,
          auditRemark: auditValues.auditRemark,
          auditTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          outboundDate: dayjs().format('YYYY-MM-DD'),
          items: auditValues.items.map(i => ({ 
            ...i, 
            status: '审核通过'
          }))
      });
      message.success('审核已通过，单据已出库');
    } else {
      mockData.upsert('outboundOrders', { 
          ...record, 
          status: '已审核',
          auditResult: auditValues.auditResult,
          auditRemark: auditValues.auditRemark,
          auditTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          items: auditValues.items.map(i => ({ 
            ...i, 
            status: '审核拒绝'
          }))
      });
      message.warning('审核已拒绝');
    }
    setAuditModalOpen({ open: false, record: null });
  };

  const handleDelete = (id) => {
    mockData.remove('outboundOrders', id);
    message.success(`记录已删除`);
  };

  const handleApprove = (record) => {
    mockData.upsert('outboundOrders', { ...record, status: '待审核' });
    message.success(`已提交审核`);
  };

  const addMenuItems = [
    { key: 'sub', label: '委外出库' },
    { key: 'other', label: '其他出库' },
  ];

  const handleAddMenuClick = ({ key }) => {
    setEditingRecord(null);
    if (key === 'sales') setSalesModalOpen(true);
    if (key === 'pick') setPickModalOpen(true);
    if (key === 'sub') setSubModalOpen(true);
    if (key === 'other') setOtherModalOpen(true);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '出库单号',
      dataIndex: 'orderNo',
      width: 160,
      render: (text, record) => {
        const val = typeof text === 'object' ? text?.name || text?.id : text;
        return <a onClick={(e) => { e.stopPropagation(); openDrawer(record.type, record.orderNo); }}>{val}</a>;
      },
    },
    {
      title: '出库类型',
      dataIndex: 'type',
      width: 120,
      render: (type) => {
        const val = typeof type === 'object' ? type?.name || type?.type || String(type) : type;
        let color = 'blue';
        if (val === '领料出库') color = 'green';
        if (val === '委外出库') color = 'orange';
        if (val === '其他出库') color = 'default';
        return <Tag color={color}>{val}</Tag>;
      },
    },
    {
      title: '关联单号',
      dataIndex: 'relOrderNo',
      width: 160,
      render: (text) => {
        const val = typeof text === 'object' ? text?.name || text?.id || String(text) : text;
        return val && val !== '-' ? (
          <a onClick={(e) => { e.stopPropagation(); alert(`跳转到上游单据: ${val}`); }}>{val}</a>
        ) : '-';
      },
    },
    {
      title: '对象(客户/供应商/部门)',
      dataIndex: 'partnerName',
      width: 180,
      render: (val) => typeof val === 'object' ? val?.name || String(val) : val,
    },
    {
      title: '出库仓库',
      dataIndex: 'warehouseName',
      width: 140,
      render: (val) => typeof val === 'object' ? val?.name || String(val) : val,
    },
    {
      title: '物料种数',
      dataIndex: 'materialTotal',
      width: 100,
      align: 'right',
      render: (val) => typeof val === 'object' ? val?.name || String(val) : val,
    },
    {
      title: '出库日期',
      dataIndex: 'outboundDate',
      width: 120,
      render: (val) => typeof val === 'object' ? val?.name || val?.format?.('YYYY-MM-DD') || String(val) : val,
    },
    {
      title: '审核结果',
      dataIndex: 'auditResult',
      width: 100,
      render: (res, record) => {
        if (record.status === '已出库') return null;
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
        const val = typeof status === 'object' ? status?.name || status?.status || String(status) : status;
        let color = 'default';
        if (val === '待审核' || val === '待审批') color = 'orange';
        if (val === '已审核' || val === '已审批') color = 'processing';
        if (val === '已出库') color = 'success';
        
        // Map labels if they are internal values
        let label = val;
        if (val === '待审批') label = '待审核';
        if (val === '已审批') label = '已审核';
        
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: { showTitle: false },
      render: (remark) => {
        const val = typeof remark === 'object' ? remark?.name || String(remark) : remark;
        return (
          <Tooltip placement="topLeft" title={val}>
            {val}
          </Tooltip>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const { status, auditResult } = record;
        const isDraft = status === '草稿';
        const isPending = status === '待审核' || status === '待审批';
        const isAuditedRejected = (status === '已审核' || status === '已审批') && auditResult === '拒绝';
        const isAuditedPassed = (status === '已审核' || status === '已审批') && auditResult === '通过';
        const isFinished = status === '已出库';
        
        return (
          <Space size="middle" onClick={(e) => e.stopPropagation()}>
            {isDraft && (
              <>
                <a onClick={(e) => { 
                    e.stopPropagation(); 
                    setEditingRecord(record);
                    if (record.type === '销售出库') setSalesModalOpen(true);
                    if (record.type === '领料出库') setPickModalOpen(true);
                    if (record.type === '委外出库') setSubModalOpen(true);
                    if (record.type === '其他出库') setOtherModalOpen(true);
                }}>编辑</a>
                <Divider orientation="vertical" />
                <Popconfirm
                  title="您确定要删除该出库单吗？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleDelete(record.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                  okText="确定"
                  cancelText="取消"
                >
                  <a style={{ color: 'red' }} onClick={(e) => e.stopPropagation()}>删除</a>
                </Popconfirm>
              </>
            )}
            {isPending && (
              <a onClick={(e) => { e.stopPropagation(); setAuditModalOpen({ open: true, record }); }}>审核</a>
            )}
            {isAuditedRejected && (
                <>
                  <a onClick={(e) => { 
                      e.stopPropagation(); 
                      setEditingRecord(record);
                      if (record.type === '销售出库') setSalesModalOpen(true);
                      if (record.type === '领料出库') setPickModalOpen(true);
                      if (record.type === '委外出库') setSubModalOpen(true);
                      if (record.type === '其他出库') setOtherModalOpen(true);
                  }}>编辑</a>
                  <Divider orientation="vertical" />
                  <a onClick={(e) => { e.stopPropagation(); setAuditModalOpen({ open: true, record }); }}>审核</a>
                </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Typography.Title level={4}>出库管理</Typography.Title>
      
      {/* Stats Area */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#e6f7ff' }}>
            <Statistic
              title="出库总笔数"
              value={stats.totalCount}
              prefix={<ShoppingOutlined style={{ color: '#1890ff' }} />}
              styles={{ content: { color: '#1890ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f6ffed' }}>
            <Statistic
              title="出库总数量"
              value={stats.totalQty}
              prefix={<InboxOutlined style={{ color: '#52c41a' }} />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#f6ffed' }}>
            <Statistic
              title="出库总金额(估计)"
              value={stats.totalAmount}
              precision={2}
              prefix={<FileTextOutlined style={{ color: '#52c41a' }} />}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" style={{ background: '#fff7e6' }}>
            <Statistic
              title="待审核笔数"
              value={stats.pendingApproval}
              prefix={<ClockCircleOutlined style={{ color: '#fa8c16' }} />}
              styles={{ content: { color: '#fa8c16' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filter Area */}
      <Card styles={{ body: { paddingBottom: 0 } }} style={{ marginBottom: '16px' }}>
        <Form form={form} layout="inline">
          <Form.Item name="orderNo" label="出库单号">
            <Input placeholder="请输入" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="type" label="出库类型">
            <Select placeholder="请选择" style={{ width: 140 }} allowClear>
              <Select.Option value="销售出库">销售出库</Select.Option>
              <Select.Option value="委外出库">委外出库</Select.Option>
              <Select.Option value="其他出库">其他出库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="relOrderNo" label="关联单号">
            <Input placeholder="请输入" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="partnerName" label="对象">
            <Input placeholder="客户/供应商/部门" style={{ width: 160 }} />
          </Form.Item>
          <Form.Item name="warehouseName" label="出库仓库">
            <Select placeholder="请选择" style={{ width: 160 }} allowClear>
              {warehouses.map(w => <Select.Option key={w.name} value={w.name}>{w.name}</Select.Option>)}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" style={{ width: 120 }} allowClear>
              <Select.Option value="草稿">草稿</Select.Option>
              <Select.Option value="待审核">待审核</Select.Option>
              <Select.Option value="已出库">已出库</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="dateRange" label="出库日期">
            <RangePicker style={{ width: 260 }} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
        <Divider style={{ margin: '16px 0' }} />
        <Space style={{ marginBottom: '16px', justifyContent: 'space-between', display: 'flex', width: '100%' }}>
          <Space>
            <Dropdown menu={{ items: addMenuItems, onClick: handleAddMenuClick }}>
                <Button type="primary" icon={<PlusOutlined />}>新增出库 <DownOutlined /></Button>
            </Dropdown>
            <Button icon={<SendOutlined />} onClick={() => message.info('批量提交功能开发中')}>批量提交</Button>
          </Space>
        </Space>
      </Card>

      {/* Table Area */}
      <Table 
        columns={columns} 
        dataSource={data} 
        rowKey={(record) => record?.id || record?.orderNo}
        onRow={(record) => ({
          onClick: () => openDrawer(record.type, record.orderNo),
          style: { cursor: 'pointer' }
        })}
        pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (total) => `共 ${total} 条`
        }}
        scroll={{ x: 1500 }}
      />

      {/* Drawers */}
      {currentDrawer.type === '销售出库' && (
        <SalesOutboundDetailDrawer 
          open={currentDrawer.open} 
          onClose={closeDrawer} 
          orderId={currentDrawer.orderId} 
        />
      )}
      {currentDrawer.type === '领料出库' && (
        <PickOutboundDetailDrawer 
          open={currentDrawer.open} 
          onClose={closeDrawer} 
          orderId={currentDrawer.orderId} 
        />
      )}
      {currentDrawer.type === '委外出库' && (
        <SubcontractOutboundDetailDrawer 
          open={currentDrawer.open} 
          onClose={closeDrawer} 
          orderId={currentDrawer.orderId} 
        />
      )}
      {currentDrawer.type === '其他出库' && (
        <OtherOutboundDetailDrawer 
          open={currentDrawer.open} 
          onClose={closeDrawer} 
          orderId={currentDrawer.orderId} 
        />
      )}

      {/* Form Modals */}
      <SalesOutboundFormModal 
        open={salesModalOpen} 
        onCancel={() => setSalesModalOpen(false)} 
        onSave={handleSaveOrder}
        editingRecord={editingRecord}
      />
      <PickOutboundFormModal 
        open={pickModalOpen} 
        onCancel={() => setPickModalOpen(false)} 
        onSave={handleSaveOrder}
        editingRecord={editingRecord}
      />
      <OtherOutboundFormModal 
        open={otherModalOpen} 
        onCancel={() => setOtherModalOpen(false)} 
        onSave={handleSaveOrder}
        editingRecord={editingRecord}
      />
      <SubcontractOutboundFormModal 
        open={subModalOpen} 
        onCancel={() => setSubModalOpen(false)} 
        onSave={handleSaveOrder}
        editingRecord={editingRecord}
      />
      <OutboundAuditModal 
        open={auditModalOpen.open} 
        record={auditModalOpen.record}
        onCancel={() => setAuditModalOpen({ open: false, record: null })}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
};

export default OutboundOrderList;
