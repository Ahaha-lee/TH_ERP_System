import React, { useState } from 'react';
import { 
  Card, Table, Form, Input, Select, DatePicker, Button, Space, 
  Tag, Typography, Modal, message, Divider, Tooltip 
} from 'antd';
import { 
  SearchOutlined, ReloadOutlined, PlusOutlined, 
  EditOutlined, DeleteOutlined, CheckCircleOutlined,
  SwapOutlined, InfoCircleOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { quotations as initialQuotations, quotationAuditLogs, projectMaterials } from '../mock';
import { formatCurrency } from '../utils/helpers';
import QuotationFormModal from '../components/QuotationFormModal';
import QuotationDetailDrawer from '../components/QuotationDetailDrawer';
import QuotationAuditDetailDrawer from '../components/QuotationAuditDetailDrawer';

const { RangePicker } = DatePicker;
const { Link, Text } = Typography;

const QuotationManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [quotations, setQuotations] = useState(initialQuotations);
  const [form] = Form.useForm();
  
  // Modal & Drawer visibility
  const [formModal, setFormModal] = useState({ open: false, mode: 'add', quotation: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, quotation: null });
  const [auditDrawer, setAuditDrawer] = useState({ open: false, quotation: null });

  // Handle incoming navigation
  React.useEffect(() => {
    if (location.state?.openDetail) {
      const quotation = quotations.find(q => q.quotationNo === location.state.openDetail);
      if (quotation) {
        setDetailDrawer({ open: true, quotation });
      }
    }
  }, [location.state, quotations]);
  
  // Search
  const handleSearch = (values) => {
    let filtered = initialQuotations;
    if (values.quotationNo) filtered = filtered.filter(q => q.quotationNo.includes(values.quotationNo));
    if (values.customerName) filtered = filtered.filter(q => q.customerName.includes(values.customerName));
    if (values.status) filtered = filtered.filter(q => q.status === values.status);
    if (values.salesperson) filtered = filtered.filter(q => q.salesperson === values.salesperson);
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(q => {
        const d = dayjs(q.date);
        return d.isAfter(start.startOf('day')) && d.isBefore(end.endOf('day'));
      });
    }
    setQuotations(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setQuotations(initialQuotations);
  };

  // Actions
  const handleDelete = (id) => {
    Modal.confirm({
      title: '删除确认',
      content: '确定要删除这条报价单吗？删除后不可恢复。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        setQuotations(quotations.filter(q => q.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleAudit = (quotation, pass) => {
    Modal.confirm({
      title: `审批报价单 - ${quotation.quotationNo}`,
      content: (
        <div className="mt-4">
          <Text strong>审批意见:</Text>
          <Input.TextArea id="audit-opinion" rows={3} placeholder="请输入审批意见" className="mt-2" />
        </div>
      ),
      onOk: () => {
        const opinion = document.getElementById('audit-opinion').value;
        if (!opinion && !pass) {
          message.error('审批拒绝必须填写意见');
          return Promise.reject();
        }
        
        const updated = quotations.map(q => {
          if (q.id === quotation.id) {
            return { 
              ...q, 
              status: pass ? '审批通过' : '审批拒绝',
              auditResult: pass ? '通过' : '拒绝'
            };
          }
          return q;
        });
        
        setQuotations(updated);
        
        // Add log
        const log = {
          id: `log-${Date.now()}`,
          quotationNo: quotation.quotationNo,
          time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          operator: '主管',
          action: pass ? '通过' : '拒绝',
          opinion: opinion || '无'
        };
        quotationAuditLogs.unshift(log);
        
        message.success(`审批已${pass ? '通过' : '拒绝'}`);
      }
    });
  };

  const handleToOrder = (quotation) => {
    Modal.confirm({
      title: '转销售订单确认',
      content: `是否确认将报价单 [${quotation.quotationNo}] 转为销售订单？转换后不可撤销。`,
      onOk: () => {
        // Check if materials are still saleable
        const allSaleable = quotation.items.every(item => {
          const material = projectMaterials.find(m => m.id === item.materialId);
          return material ? material.isSaleable : false;
        });

        if (!allSaleable) {
          message.error('转单失败：部分产品已标记为不可销售');
          return;
        }

        const orderNo = `SOD${dayjs().format('YYYYMMDD')}0001`;
        const updated = quotations.map(q => {
          if (q.id === quotation.id) {
            return { 
              ...q, 
              status: '已转订单',
              relatedOrderNo: orderNo
            };
          }
          return q;
        });
        
        setQuotations(updated);
        message.success(`已成功转为销售订单，订单号：${orderNo}`);
        alert(`跳转到销售订单详情页：${orderNo}`);
      }
    });
  };

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60 },
    { 
      title: '报价单号', 
      dataIndex: 'quotationNo',
      render: (text, record) => (
        <Link onClick={() => setDetailDrawer({ open: true, quotation: record })}>{text}</Link>
      )
    },
    {
      title: '审核详情',
      render: (_, record) => (
        <Link onClick={() => setAuditDrawer({ open: true, quotation: record })}>查看审核详情</Link>
      )
    },
    { 
      title: '客户名称', 
      dataIndex: 'customerName',
      render: (text) => (
        <Link onClick={() => navigate('/customers', { state: { customerName: text } })}>{text}</Link>
      )
    },
    { title: '报价日期', dataIndex: 'date' },
    { 
      title: '报价总额', 
      dataIndex: 'amount',
      render: (val) => <Text strong>{formatCurrency(val)}</Text>
    },
    { title: '业务员', dataIndex: 'salesperson' },
    {
      title: '关联销售订单号',
      dataIndex: 'relatedOrderNo',
      render: (val) => val ? (
        <Link onClick={() => navigate('/sales/normal', { state: { openDetail: val } })}>{val}</Link>
      ) : '-'
    },
    {
      title: '审批结果',
      dataIndex: 'auditResult',
      render: (val) => val === '通过' ? <Tag color="success">通过</Tag> : val === '拒绝' ? <Tag color="error">拒绝</Tag> : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status) => {
        const colors = {
          '草稿': 'default',
          '待审批': 'orange',
          '审批通过': 'green',
          '审批拒绝': 'red',
          '已转订单': 'blue'
        };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 220,
      render: (_, record) => (
        <Space size="middle">
          {(record.status === '草稿' || record.status === '审批拒绝') && (
            <>
              <Tooltip title="编辑">
                <Button 
                  type="text" 
                  size="small" 
                  icon={<EditOutlined />} 
                  onClick={() => setFormModal({ open: true, mode: 'edit', quotation: record })}
                />
              </Tooltip>
              <Tooltip title="审批">
                <Button 
                  type="text" 
                  size="small" 
                  className="text-orange-500"
                  icon={<CheckCircleOutlined />} 
                  onClick={() => handleAudit(record, true)}
                />
              </Tooltip>
              <Tooltip title="删除">
                <Button 
                  type="text" 
                  size="small" 
                  danger 
                  icon={<DeleteOutlined />} 
                  onClick={() => handleDelete(record.id)}
                />
              </Tooltip>
            </>
          )}
          {record.status === '审批通过' && (
            <Button 
              type="primary" 
              size="small" 
              icon={<SwapOutlined />}
              onClick={() => handleToOrder(record)}
            >
              转销售订单
            </Button>
          )}
        </Space>
      )
    },
  ];

  return (
    <div className="space-y-4">
      <Card size="small">
        <Form form={form} layout="inline" onFinish={handleSearch}>
          <Form.Item name="quotationNo" label="报价单号">
            <Input placeholder="模糊查询" allowClear className="w-40" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="模糊查询" allowClear className="w-40" />
          </Form.Item>
          <Form.Item name="dateRange" label="报价日期">
            <RangePicker className="w-64" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="请选择" allowClear className="w-32">
              <Select.Option value="草稿">草稿</Select.Option>
              <Select.Option value="待审批">待审批</Select.Option>
              <Select.Option value="审批通过">审批通过</Select.Option>
              <Select.Option value="审批拒绝">审批拒绝</Select.Option>
              <Select.Option value="已转订单">已转订单</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="salesperson" label="业务员">
            <Select placeholder="请选择" allowClear className="w-32">
              <Select.Option value="管理员">管理员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card 
        size="small" 
        title={<Text strong>报价单列表</Text>}
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setFormModal({ open: true, mode: 'add', quotation: null })}
          >
            新增
          </Button>
        }
      >
        <Table 
          columns={columns} 
          dataSource={quotations} 
          size="small" 
          scroll={{ x: 'max-content' }} 
          rowKey={(record) => record?.id || record?.key}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            pageSizeOptions: ['10', '20', '50', '100'],
            defaultPageSize: 10
          }}
          onRow={(record) => ({
            onClick: (e) => {
              // Don't open detail if clicking on a link or button
              if (e.target.tagName !== 'A' && !e.target.closest('button')) {
                setDetailDrawer({ open: true, quotation: record });
              }
            }
          })}
          className="cursor-pointer"
        />
      </Card>

      <QuotationFormModal 
        open={formModal.open}
        mode={formModal.mode}
        quotation={formModal.quotation}
        onCancel={() => setFormModal({ ...formModal, open: false })}
        onSuccess={(newVal) => {
          if (formModal.mode === 'add') {
            setQuotations([newVal, ...quotations]);
            message.success('报价单已保存');
          } else {
            setQuotations(quotations.map(q => q.id === newVal.id ? newVal : q));
            message.success('更新成功');
          }
          setFormModal({ ...formModal, open: false });
        }}
      />

      <QuotationDetailDrawer 
        open={detailDrawer.open}
        quotation={detailDrawer.quotation}
        onClose={() => setDetailDrawer({ ...detailDrawer, open: false })}
      />

      <QuotationAuditDetailDrawer 
        open={auditDrawer.open}
        quotation={auditDrawer.quotation}
        onClose={() => setAuditDrawer({ ...auditDrawer, open: false })}
      />
    </div>
  );
};

export default QuotationManagement;
