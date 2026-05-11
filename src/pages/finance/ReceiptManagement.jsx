import React, { useState, useMemo, useEffect } from 'react';
import { 
  Table, 
  Card, 
  Tabs, 
  Input, 
  InputNumber, 
  DatePicker, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Typography,
  Row,
  Col,
  Form,
  message
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  ImportOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatCurrency } from '../../utils/helpers';
import { initialBankFlows } from '../../mock';
import ImportFlowModal from '../../components/finance/ImportFlowModal';
import ClaimFlowModal from '../../components/finance/ClaimFlowModal';
import FlowDetailDrawer from '../../components/finance/FlowDetailDrawer';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const ReceiptManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();
  
  const [flows, setFlows] = useState(initialBankFlows);
  const [activeTab, setActiveTab] = useState('全部');
  const [searchParams, setSearchParams] = useState({});
  
  // Modals state
  const [importVisible, setImportVisible] = useState(false);
  const [claimVisible, setClaimVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentFlow, setCurrentFlow] = useState(null);

  // Handle incoming navigation
  useEffect(() => {
    if (location.state?.flowNo) {
      const flow = flows.find(f => f.flowNo === location.state.flowNo);
      if (flow) {
        setCurrentFlow(flow);
        setDetailVisible(true);
      }
    }
  }, [location.state, flows]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    if (key !== '全部') {
      form.setFieldsValue({ claimStatus: key });
      setSearchParams(prev => ({ ...prev, claimStatus: key }));
    } else {
      form.setFieldsValue({ claimStatus: undefined });
      setSearchParams(prev => ({ ...prev, claimStatus: undefined }));
    }
  };

  const handleSearch = (values) => {
    setSearchParams(values);
  };

  const handleReset = () => {
    form.resetFields();
    if (activeTab !== '全部') {
      form.setFieldsValue({ claimStatus: activeTab });
      setSearchParams({ claimStatus: activeTab });
    } else {
      setSearchParams({});
    }
  };

  const filteredFlows = useMemo(() => {
    let result = flows;
    
    if (searchParams.flowNo) {
      result = result.filter(f => f.flowNo?.includes(searchParams.flowNo));
    }
    if (searchParams.payerName) {
      result = result.filter(f => f.payerName?.includes(searchParams.payerName) || f.payer?.includes(searchParams.payerName));
    }
    if (searchParams.minAmount !== undefined) {
      result = result.filter(f => f.amount >= searchParams.minAmount);
    }
    if (searchParams.maxAmount !== undefined) {
      result = result.filter(f => f.amount <= searchParams.maxAmount);
    }
    if (searchParams.claimStatus) {
      result = result.filter(f => (f.claimStatus || f.status) === searchParams.claimStatus);
    } else if (activeTab !== '全部') {
      result = result.filter(f => (f.claimStatus || f.status) === activeTab);
    }
    if (searchParams.batchNo) {
      result = result.filter(f => f.batchNo === searchParams.batchNo);
    }
    // Simple date filter omit
    
    return result;
  }, [flows, searchParams, activeTab]);

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60, fixed: 'left' },
    { title: '流水号', dataIndex: 'flowNo', key: 'flowNo', width: 180, fixed: 'left' },
    { title: '交易时间', dataIndex: 'transTime', key: 'transTime', width: 160, render: (val, record) => val || record.date },
    { 
      title: '交易金额', 
      dataIndex: 'amount', 
      key: 'amount', 
      align: 'right', 
      width: 120,
      render: val => formatCurrency(val) 
    },
    { 
      title: '交易方名称', 
      dataIndex: 'payerName', 
      key: 'payerName', 
      width: 180, 
      ellipsis: true,
      render: (text, record) => {
        const val = text || record.payer;
        if (!val) return '-';
        return val;
      }
    },
    { title: '交易方账号', dataIndex: 'payerAccount', key: 'payerAccount', width: 180, ellipsis: true },
    { title: '交易摘要', dataIndex: 'summary', key: 'summary', width: 150, ellipsis: true },
    { 
      title: '认领状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 100,
      render: (_, record) => {
        const status = record.claimStatus || record.status;
        const statusConfig = {
          '未认领': { color: 'default' },
          '部分认领': { color: 'orange' },
          '待审批': { color: 'processing' },
          '已认领': { color: 'success' },
        };
        const config = statusConfig[status] || { color: 'default' };
        return <Tag color={config.color}>{status}</Tag>;
      }
    },
    { 
      title: '关联订单号', 
      dataIndex: 'claims', 
      key: 'claims', 
      width: 200,
      render: (claims) => claims && claims.length > 0 ? (
        <Space wrap split=",">
          {claims.map(c => (
            <Link 
              key={c.id} 
              onClick={(e) => {
                e.stopPropagation();
                if (c.type === '销售订单') {
                  navigate('/sales/normal', { state: { openDetail: c.orderNo } });
                } else {
                  navigate('/recharge-ledger', { state: { openDetail: c.orderNo || c.customerCode } });
                }
              }}
            >
              {c.orderNo || c.customerCode}
            </Link>
          ))}
        </Space>
      ) : '-'
    },
    { 
      title: '认领人', 
      dataIndex: 'claims', 
      key: 'claimant', 
      width: 120, 
      ellipsis: true,
      render: (claims, record) => {
        if (!claims || claims.length === 0) return record.claimUser || '-';
        const claimants = Array.from(new Set(claims.map(c => c.claimant).filter(Boolean)));
        return claimants.join(', ') || record.claimUser || '-';
      } 
    },
    { 
      title: '操作', 
      key: 'action', 
      fixed: 'right', 
      width: 150,
      render: (_, record) => {
        const status = record.claimStatus || record.status;
        return (
          <Space>
            {(status === '未认领' || status === '部分认领') && (
              <Button 
                type="link" 
                size="small" 
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentFlow(record);
                  setClaimVisible(true);
                }}
              >
                认领
              </Button>
            )}
            {status === '待审批' && (
              <Button 
                type="link" 
                size="small"
                onClick={(e) => { e.stopPropagation(); setCurrentFlow(record); setDetailVisible(true); }}
              >
                审核
              </Button>
            )}
            {(status === '已认领' || status === '已审批' || status === '审批完成') && (
              <Button 
                type="link" 
                size="small"
                onClick={(e) => { e.stopPropagation(); setCurrentFlow(record); setDetailVisible(true); }}
              >
                查看
              </Button>
            )}
          </Space>
        );
      }
    },
  ];

  const handleClaim = (claims, type) => {
    // Mock logic: add claims to flow
    setFlows(prev => prev.map(f => {
      if (f.id === currentFlow.id) {
        const newClaims = [
          ...(f.claims || []), 
          ...claims.map((c, i) => ({ 
            ...c,
            id: `new-${Date.now()}-${i}`, 
            type: type === 'sales' ? '销售订单' : '充值订单',
            amount: c.claimAmount,
            status: '待审批',
            orderTotalAmount: c.totalDue,
            orderReceivedAmount: c.receivedAmount,
            orderPendingAmount: c.remainingDue,
          }))
        ];
        
        let newStatus = '已认领';
        const totalClaimed = newClaims.reduce((s, c) => s + (c.amount || 0), 0);
        if (totalClaimed < f.amount) {
          newStatus = '部分认领';
        }

        return {
          ...f,
          claimStatus: newStatus,
          claimUser: '当前用户',
          claims: newClaims
        };
      }
      return f;
    }));
  };

  const batches = Array.from(new Set(flows.map(f => f.batchNo).filter(Boolean)));

  return (
    <div className="space-y-4">
      <Card size="small" className="shadow-sm">
        <Form form={form} onFinish={handleSearch} layout="inline" className="mb-4 gap-y-4">
          <Row gutter={[16, 16]} className="w-full">
            <Col span={6}>
              <Form.Item name="flowNo" label="流水号" className="mb-0">
                <Input placeholder="支持模糊查询" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="payerName" label="交易方名称" className="mb-0">
                <Input placeholder="支持模糊查询" allowClear />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="金额范围" className="mb-0">
                <Space>
                  <Form.Item name="minAmount" noStyle>
                    <InputNumber placeholder="最小金额" className="w-[100px]" />
                  </Form.Item>
                  <span>-</span>
                  <Form.Item name="maxAmount" noStyle>
                    <InputNumber placeholder="最大金额" className="w-[100px]" />
                  </Form.Item>
                </Space>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="dateRange" label="交易日期" className="mb-0">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="claimStatus" label="认领状态" className="mb-0">
                <Select placeholder="请选择" allowClear>
                  <Select.Option value="未认领">未认领</Select.Option>
                  <Select.Option value="部分认领">部分认领</Select.Option>
                  <Select.Option value="待审批">待审批</Select.Option>
                  <Select.Option value="已审批">已审批</Select.Option>
                  <Select.Option value="已认领">已认领</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item name="batchNo" label="导入批次" className="mb-0">
                 <Select placeholder="请选择" allowClear>
                   {batches.map(b => (
                     <Select.Option key={b} value={b}>{b}</Select.Option>
                   ))}
                 </Select>
              </Form.Item>
            </Col>
            <Col span={12} className="text-right">
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
              </Space>
            </Col>
          </Row>
        </Form>
        <div className="flex justify-between items-center bg-gray-50 px-4 pt-2 -mx-4 border-t border-b border-gray-100">
          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            items={[
              { key: '全部', label: '全部' },
              { key: '未认领', label: '未认领' },
              { key: '部分认领', label: '部分认领' },
              { key: '已认领', label: '已认领' },
            ]}
            className="mb-[-1px]"
          />
          <Button type="primary" icon={<ImportOutlined />} onClick={() => setImportVisible(true)} className="mb-2">导入流水</Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredFlows} 
          rowKey={(record) => record.id || record.flowNo} 
          size="middle"
          scroll={{ x: 1500 }}
          className="mt-4"
          rowSelection={{
            type: 'checkbox'
          }}
          onRow={(record) => ({
            onClick: () => {
              setCurrentFlow(record);
              setDetailVisible(true);
            },
            className: 'cursor-pointer hover:bg-gray-50'
          })}
          pagination={{
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            showTotal: total => `共 ${total} 条`,
            defaultPageSize: 10
          }}
        />
      </Card>

      <ImportFlowModal 
        open={importVisible} 
        onCancel={() => setImportVisible(false)} 
        onImport={(flows) => {
          setFlows(prev => [...flows, ...prev])
        }} 
      />

      <ClaimFlowModal 
        open={claimVisible} 
        flow={currentFlow} 
        onCancel={() => setClaimVisible(false)} 
        onClaim={handleClaim}
      />

      <FlowDetailDrawer 
        open={detailVisible} 
        flow={currentFlow} 
        onClose={() => setDetailVisible(false)} 
        onAudit={(flow, isPass) => {
          setFlows(prev => prev.map(f => {
            if (f.id === flow.id) {
              const updatedStatus = isPass ? '已认领' : '未认领';
              return { 
                ...f, 
                status: updatedStatus, 
                claimStatus: updatedStatus,
                claims: isPass ? f.claims : [] 
              };
            }
            return f;
          }));
          message.success(`审核已${isPass ? '通过' : '拒绝'}`);
          setDetailVisible(false);
        }}
      />
    </div>
  );
};

export default ReceiptManagement;

