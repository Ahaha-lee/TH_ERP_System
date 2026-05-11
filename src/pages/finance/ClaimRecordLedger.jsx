import React, { useState, useMemo } from 'react';
import {
  Table,
  Card,
  Input,
  DatePicker,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Tooltip,
  message,
  Pagination
} from 'antd';
import {
  SearchOutlined,
  ReloadOutlined,
  ExportOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { formatCurrency } from '../../utils/helpers';
import { useMockData } from '../../mock/data';
import FlowDetailDrawer from '../../components/finance/FlowDetailDrawer';
import NormalOrderDetailDrawer from '../../components/sales/NormalOrderDetailDrawer';
import RechargeAuditDetailDrawer from '../../components/RechargeAuditDetailDrawer';
import CustomerDetailDrawer from '../../components/CustomerDetailDrawer';

const { RangePicker } = DatePicker;
const { Text, Link } = Typography;

const ClaimRecordLedger = () => {
  const [records] = useMockData('claimRecords');
  const [employees] = useMockData('employees');
  const [allCustomers] = useMockData('customers');
  const [allOrders] = useMockData('normalOrders');
  const [allRecharges] = useMockData('recharges');
  const [allFlows] = useMockData('flows');

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Search state
  const [recordNo, setRecordNo] = useState('');
  const [flowNo, setFlowNo] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [status, setStatus] = useState(null);
  const [orderType, setOrderType] = useState(null);
  const [claimUser, setClaimUser] = useState(null);

  // Drawer states
  const [flowDetailVisible, setFlowDetailVisible] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState(null);
  const [orderDetailVisible, setOrderDetailVisible] = useState(false);
  const [selectedOrderNo, setSelectedOrderNo] = useState(null);
  const [rechargeDetailVisible, setRechargeDetailVisible] = useState(false);
  const [selectedRecharge, setSelectedRecharge] = useState(null);
  const [customerDetailVisible, setCustomerDetailVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const filteredData = useMemo(() => {
    return (records || []).filter(item => {
      const matchRecordNo = !recordNo || item.recordNo.includes(recordNo);
      const matchFlowNo = !flowNo || item.flowNo.includes(flowNo);
      const matchOrderNo = !orderNo || (item.orderNo && item.orderNo.includes(orderNo));
      const matchCustomer = !customerName || item.customerName.includes(customerName);
      const matchStatus = !status || item.status === status;
      const matchOrderType = !orderType || item.orderType === orderType;
      const matchUser = !claimUser || item.claimUser === claimUser;
      
      let matchDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = dayjs(item.claimTime);
        matchDate = itemDate.isAfter(dateRange[0].startOf('day')) && itemDate.isBefore(dateRange[1].endOf('day'));
      }

      return matchRecordNo && matchFlowNo && matchOrderNo && matchCustomer && matchStatus && matchOrderType && matchUser && matchDate;
    });
  }, [records, recordNo, flowNo, orderNo, customerName, dateRange, status, orderType, claimUser]);

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleReset = () => {
    setRecordNo('');
    setFlowNo('');
    setOrderNo('');
    setCustomerName('');
    setDateRange(null);
    setStatus(null);
    setOrderType(null);
    setClaimUser(null);
    setCurrentPage(1);
  };

  const handleExport = () => {
    message.info('功能开发中');
  };

  const columns = [
    {
      title: '序号',
      width: 60,
      fixed: 'left',
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1
    },
    {
      title: '认领记录号',
      dataIndex: 'recordNo',
      key: 'recordNo',
      width: 160,
      fixed: 'left',
    },
    {
      title: '流水号',
      dataIndex: 'flowNo',
      key: 'flowNo',
      width: 160,
      render: (text) => (
        <Link onClick={() => {
          setSelectedFlow({ flowNo: text });
          setFlowDetailVisible(true);
        }}>
          {text}
        </Link>
      )
    },
    {
      title: '订单类型',
      dataIndex: 'orderType',
      key: 'orderType',
      width: 100,
      render: (type) => (
        <Tag color={type === '销售订单' ? 'blue' : 'green'}>
          {type}
        </Tag>
      )
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
      render: (no, record) => (
        <Link onClick={() => {
          if (record.orderType === '销售订单') {
            setSelectedOrderNo(no);
            setOrderDetailVisible(true);
          } else {
            const recharge = allRecharges.find(r => r.orderNo === no);
            setSelectedRecharge(recharge);
            setRechargeDetailVisible(true);
          }
        }}>
          {no}
        </Link>
      )
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 150,
      render: (text) => <Link onClick={() => {
        const customer = allCustomers.find(c => c.name === text);
        if (customer) {
          setSelectedCustomer(customer);
          setCustomerDetailVisible(true);
        } else {
          message.warning('未找到客户！');
        }
      }}>{text}</Link>
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
      key: 'customerType',
      width: 120,
    },
    {
      title: '业务员',
      dataIndex: 'salesman',
      key: 'salesman',
      width: 100,
    },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      width: 140,
      align: 'right',
      render: (val) => formatCurrency(val)
    },
    {
      title: '已收/已用金额',
      dataIndex: 'receivedAmount',
      key: 'receivedAmount',
      width: 140,
      align: 'right',
      render: (val) => formatCurrency(val)
    },
    {
      title: '本次认领金额',
      dataIndex: 'claimAmount',
      key: 'claimAmount',
      width: 140,
      align: 'right',
      render: (val) => (
        <Text strong className="text-red-500">
          {formatCurrency(val)}
        </Text>
      )
    },
    {
      title: '认领人',
      dataIndex: 'claimUser',
      key: 'claimUser',
      width: 100,
    },
    {
      title: '认领时间',
      dataIndex: 'claimTime',
      key: 'claimTime',
      width: 160,
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status) => {
        let color = 'default';
        let label = status;
        
        if (status === '待审批' || status === '待结算' || status === '待处理') {
          color = 'orange';
          label = '待审核';
        } else if (status === '审批通过' || status === '已认领') {
          color = 'green';
          label = '审核通过';
        } else if (status === '审批拒绝' || status === '已驳回') {
          color = 'red';
          label = '审核拒绝';
        }
        
        return <Tag color={color}>{label}</Tag>;
      }
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 150,
      render: (text) => (
        <Tooltip title={text}>
          <div className="truncate max-w-[150px]">{text}</div>
        </Tooltip>
      )
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <Card size="small" title="认领记录查询">
        <Space orientation="vertical" className="w-full" size="middle">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">认领记录号:</span>
              <Input 
                placeholder="请输入认领记录号" 
                value={recordNo} 
                onChange={e => setRecordNo(e.target.value)} 
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">流水号:</span>
              <Input 
                placeholder="请输入流水号" 
                value={flowNo} 
                onChange={e => setFlowNo(e.target.value)} 
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">订单号:</span>
              <Input 
                placeholder="请输入订单号" 
                value={orderNo} 
                onChange={e => setOrderNo(e.target.value)} 
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">客户名称:</span>
              <Input 
                placeholder="请输入客户名称" 
                value={customerName} 
                onChange={e => setCustomerName(e.target.value)} 
                className="flex-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">认领日期:</span>
              <RangePicker 
                value={dateRange} 
                onChange={setDateRange} 
                className="flex-1"
                placeholder={['开始日期', '结束日期']}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">审核状态:</span>
              <Select
                placeholder="直接选择状态"
                className="flex-1"
                allowClear
                value={status}
                onChange={setStatus}
                options={[
                  { label: '审核通过', value: '审批通过' },
                  { label: '审核拒绝', value: '审批拒绝' },
                  { label: '待审核', value: '待审批' }
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">订单类型:</span>
              <Select
                placeholder="选择类型"
                className="flex-1"
                allowClear
                value={orderType}
                onChange={setOrderType}
                options={[
                  { label: '销售订单', value: '销售订单' },
                  { label: '充值订单', value: '充值订单' }
                ]}
              />
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-24 text-right">认领人:</span>
              <Select
                placeholder="选择认领人"
                className="flex-1"
                showSearch
                allowClear
                value={claimUser}
                onChange={setClaimUser}
                options={(employees || []).map(emp => ({ label: emp.name, value: emp.name }))}
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
            <Button icon={<ExportOutlined />} onClick={handleExport}>导出</Button>
          </div>
        </Space>
      </Card>

      <Card size="small" styles={{ body: { padding: 0 } }}>
        <Table
          columns={columns}
          dataSource={filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          rowKey="id"
          scroll={{ x: 1400 }}
          size="small"
          pagination={false}
        />
        <div className="p-4 flex justify-end">
          <Pagination
            total={filteredData.length}
            current={currentPage}
            pageSize={pageSize}
            showSizeChanger
            showQuickJumper
            showTotal={total => `共 ${total} 条记录`}
            onChange={(page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            }}
          />
        </div>
      </Card>

      {/* Detail Drawers */}
      <FlowDetailDrawer 
        open={flowDetailVisible} 
        flow={selectedFlow} 
        onClose={() => setFlowDetailVisible(false)} 
      />
      
      <NormalOrderDetailDrawer 
        open={orderDetailVisible} 
        orderNo={selectedOrderNo} 
        onClose={() => setOrderDetailVisible(false)} 
      />

      <RechargeAuditDetailDrawer 
        open={rechargeDetailVisible} 
        order={selectedRecharge} 
        onClose={() => setRechargeDetailVisible(false)} 
      />

      <CustomerDetailDrawer 
        open={customerDetailVisible} 
        customer={selectedCustomer} 
        onClose={() => setCustomerDetailVisible(false)} 
      />
    </div>
  );
};

export default ClaimRecordLedger;
