
import React, { useState } from 'react';
import { 
  Table, Card, Form, Input, Select, DatePicker, Button, 
  Space, Tag, Typography, Modal, message, Row, Col, Statistic, Divider, Drawer, Descriptions, Badge
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  SendOutlined,
  SwapOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, mockData } from '../../mock/data';
import QuotationFormModal from '../../components/quotation/QuotationFormModal';
import QuotationDetailDrawer from './QuotationDetailDrawer';
import AuditDetailDrawer from '../../components/quotation/AuditDetailDrawer';
import QuotationAuditModal from '../../components/quotation/QuotationAuditModal';

const { RangePicker } = DatePicker;
const { Text, Link } = Typography;

const QuotationList = () => {
  const [form] = Form.useForm();
  const [allData] = useMockData('quotations');
  const [employees] = useMockData('employees');
  const [displayData, setDisplayData] = useState(null);
  
  const data = displayData || allData;

  const [modalOpen, setModalOpen] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [auditOpen, setAuditOpen] = useState(false);
  const [auditHistoryOpen, setAuditHistoryOpen] = useState(false);
  const [approvalDetailOpen, setApprovalDetailOpen] = useState(false);

  // Stats
  const stats = {
    total: data.length,
    pending: data.filter(q => q.status === '待审核').length,
    approved: data.filter(q => q.status === '已审核').length,
    ordered: data.filter(q => q.status === '已转订单').length,
  };

  const handleSearch = (values) => {
    let filtered = [...allData];
    if (values.quotationNo) {
      filtered = filtered.filter(q => q.quotationNo.includes(values.quotationNo));
    }
    if (values.customerName) {
      filtered = filtered.filter(q => q.customerName.includes(values.customerName));
    }
    if (values.status) {
      filtered = filtered.filter(q => q.status === values.status);
    }
    if (values.salesperson) {
      filtered = filtered.filter(q => q.salesperson === values.salesperson);
    }
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(q => {
        const qDate = dayjs(q.quotationDate);
        return qDate.isAfter(start.startOf('day')) && qDate.isBefore(end.endOf('day'));
      });
    }
    setDisplayData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setDisplayData(null);
  };

  const updateStatus = (id, newStatus, extra = {}) => {
    const record = allData.find(item => item.id === id);
    if (record) {
      mockData.upsert('quotations', { ...record, status: newStatus, ...extra });
      message.success(`状态已更新为：${newStatus}`);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除报价单',
      content: '确定要删除这张报价单吗？该操作不可恢复。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        mockData.remove('quotations', id);
        message.success('已成功删除');
      }
    });
  };

  const handleConvertToOrder = (record) => {
    Modal.confirm({
        title: '确认转销售订单',
        content: `确定将报价单 [${record.quotationNo}] 转为正式销售订单吗？此操作不可逆。`,
        onOk: () => {
            const orderNo = `SOD-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
            updateStatus(record.id, '已转订单', { relatedOrderNo: orderNo });
            
            // Add NEW order to shared store
            const newOrder = {
              id: Date.now().toString(),
              orderNo: orderNo,
              quotationNo: record.quotationNo,
              customerId: record.customerId,
              customerName: record.customerName,
              orderDate: dayjs().format('YYYY-MM-DD'),
              totalAmount: record.totalAmount,
              status: '待审核',
              salesperson: record.salesperson
            };
            mockData.upsert('normalOrders', newOrder);
            message.info(`已生成销售订单：${orderNo}`);
        }
    });
  };

  const statusTags = {
    '草稿': <Tag color="default">草稿</Tag>,
    '待审核': <Tag color="orange">待审核</Tag>,
    '已审核': <Tag color="success">已审核</Tag>,
    '已转订单': <Tag color="blue">已转订单</Tag>
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    {
      title: '报价单号', 
      dataIndex: 'quotationNo', 
      width: 150,
      render: (text, record) => (
        <Link onClick={() => { setCurrentRecord(record); setDetailOpen(true); }}>{text}</Link>
      )
    },
    { title: '客户名称', dataIndex: 'customerName', ellipsis: true },
    { title: '报价日期', dataIndex: 'quotationDate', width: 110 },
    { 
      title: '报价总额', 
      dataIndex: 'totalAmount', 
      width: 140, 
      align: 'right',
      render: (val) => `¥${val.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    },
    { title: '业务员', dataIndex: 'salesperson', width: 100 },
    {
      title: '审核结果',
      dataIndex: 'auditResult',
      width: 100,
      render: (val) => val ? <Tag color={val === '审核通过' ? 'green' : 'red'}>{val}</Tag> : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => statusTags[status] || <Tag>{status}</Tag>
    },
    { 
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const { status, id, auditResult } = record;
        const actions = [];
        // Allow editing if draft or if it was audited but rejected
        if (status === '草稿' || (status === '已审核' && auditResult === '审核拒绝')) {
          actions.push(<Button type="link" size="small" onClick={() => { setCurrentRecord(record); setModalOpen(true); }}>编辑</Button>);
        }
        if (status === '草稿' || status === '审核拒绝') {
          actions.push(<Button type="link" size="small" danger onClick={() => handleDelete(id)}>删除</Button>);
        }
        if (status === '待审核') {
          actions.push(<Button type="link" size="small" onClick={() => { setCurrentRecord(record); setAuditOpen(true); }}>审核</Button>);
        }
        if (status === '已审核' && auditResult !== '审核拒绝') {
          actions.push(<Button type="link" size="small" icon={<SwapOutlined />} onClick={() => handleConvertToOrder(record)}>转订单</Button>);
        }
        return <Space size={0}>{actions}</Space>;
      }
    }
  ];

  return (
    <div style={{ padding: '16px' }}>
      <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
        {/* Stats Row */}
        <Row gutter={16}>
          {[
            { title: '总报价单', value: stats.total, color: 'blue', icon: <FileTextOutlined className="text-blue-500" /> },
            { title: '待审核', value: stats.pending, color: 'orange', icon: <ClockCircleOutlined className="text-orange-500" /> },
            { title: '已审核', value: stats.approved, color: 'green', icon: <CheckCircleOutlined className="text-green-500" /> },
            { title: '已转订单', value: stats.ordered, color: 'cyan', icon: <SendOutlined className="text-cyan-500" /> },
          ].map((item, index) => (
            <Col key={index} style={{ width: '25%' }}>
              <Card size="small" variant="borderless" className={`bg-${item.color}-50`}>
                  <Statistic title={item.title} value={item.value} prefix={item.icon} />
              </Card>
            </Col>
          ))}
        </Row>

        <Card size="small">
          <Form form={form} layout="inline" onFinish={handleSearch}>
            <Form.Item name="quotationNo" label="报价单号">
              <Input placeholder="输入单号" allowClear style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="customerName" label="客户">
              <Input placeholder="输入客户名称" allowClear style={{ width: 160 }} />
            </Form.Item>
            <Form.Item name="dateRange" label="报价日期">
              <RangePicker style={{ width: 240 }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
                <Select.Option value="草稿">草稿</Select.Option>
                <Select.Option value="待审核">待审核</Select.Option>
                <Select.Option value="已审核">已审核</Select.Option>
                <Select.Option value="已转订单">已转订单</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="salesperson" label="业务员">
              <Select placeholder="选择人员" style={{ width: 120 }} allowClear>
              {employees.map(e => <Select.Option key={e.name} value={e.name}>{e.name}</Select.Option>)}
            </Select>
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

        <Card 
          size="small" 
          title="报价单列表" 
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => { setCurrentRecord(null); setModalOpen(true); }}>
              新增报价单
            </Button>
          }
        >
          <Table
            columns={columns}
            dataSource={data}
            rowKey="id"
            size="small"
            scroll={{ x: 1300 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
              pageSizeOptions: ['10', '20', '50', '100'],
              defaultPageSize: 10,
            }}
          />
        </Card>
      </Space>

      <QuotationFormModal 
        open={modalOpen} 
        onCancel={() => { setModalOpen(false); setCurrentRecord(null); }} 
        editingRecord={currentRecord}
        onSave={(record) => {
            mockData.upsert('quotations', record);
            message.success('保存成功');
        }}
      />

      <QuotationDetailDrawer 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        quotationNo={currentRecord?.quotationNo} 
      />

      <QuotationAuditModal
        open={auditOpen}
        quotation={currentRecord}
        onCancel={() => setAuditOpen(false)}
        onConfirm={(values) => {
          const finalStatus = '已审核';
          updateStatus(currentRecord.id, finalStatus, { 
            auditResult: values.auditResult,
            auditOpinion: values.opinion 
          });
          setAuditOpen(false);
        }}
      />

      <AuditDetailDrawer 
        open={auditHistoryOpen} 
        onClose={() => setAuditHistoryOpen(false)} 
        quotationId={currentRecord?.id}
        quotationNo={currentRecord?.quotationNo}
      />

      {/* Approval Detail Drawer */}
      <Drawer forceRender
        title="报价单审核及明细"
        placement="right"
        size="large"
        onClose={() => setApprovalDetailOpen(false)}
        open={approvalDetailOpen}
      >
        {currentRecord && (
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <Descriptions title="基本信息" bordered column={2} size="small">
              <Descriptions.Item label="报价标题" span={2}>{currentRecord.title || '-'}</Descriptions.Item>
              <Descriptions.Item label="报价单号">{currentRecord.quotationNo}</Descriptions.Item>
              <Descriptions.Item label="审核状态">
                <Badge status={
                  currentRecord.status === '已审核' ? 'success' : 
                  currentRecord.status === '待审核' ? 'processing' : 
                  currentRecord.status === '审核拒绝' ? 'error' : 'default'
                } text={currentRecord.status} />
              </Descriptions.Item>
              <Descriptions.Item label="客户名称">{currentRecord.customerName}</Descriptions.Item>
              <Descriptions.Item label="业务员">{currentRecord.salesperson}</Descriptions.Item>
              <Descriptions.Item label="是否收取定金">{currentRecord.isDeposit ? '是' : '否'}</Descriptions.Item>
              {currentRecord.isDeposit && (
                <>
                  <Descriptions.Item label="定金比例">{((currentRecord.depositRate || 0) * 100).toFixed(0)}%</Descriptions.Item>
                  <Descriptions.Item label="定金应收">
                    {`¥${(currentRecord.depositAmount || (currentRecord.totalAmount * (currentRecord.depositRate || 0))).toLocaleString()}`}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>

            <Divider titlePlacement="left">产品明细</Divider>
            <Table
              dataSource={currentRecord.items || []}
              rowKey="id"
              size="small"
              pagination={false}
              columns={[
                { title: '产品编码', dataIndex: 'productCode', width: 120 },
                { title: '产品名称', dataIndex: 'productName' },
                { title: '规格', dataIndex: 'spec', ellipsis: true },
                { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
                { 
                  title: '报价单价', 
                  dataIndex: 'price', 
                  width: 100, 
                  align: 'right',
                  render: (val) => `¥${val.toLocaleString()}`
                },
                { 
                  title: '折后总价', 
                  dataIndex: 'discountPrice', 
                  width: 120, 
                  align: 'right',
                  render: (val, record) => `¥${((val || record.price) * record.quantity).toLocaleString()}`
                },
              ]}
            />
          </Space>
        )}
      </Drawer>
    </div>
  );
};

export default QuotationList;
