import React, { useState } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Card, 
  Form, 
  message,
  DatePicker,
  Row,
  Col,
  Typography
} from 'antd';
import { SearchOutlined, ReloadOutlined, DownloadOutlined } from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { useMockData, mockData } from '../mock/data';
import { formatCurrency } from '../utils/helpers';
import RechargeAuditDetailDrawer from '../components/RechargeAuditDetailDrawer';
import CustomerDetailDrawer from '../components/CustomerDetailDrawer';
import ClaimFlowModal from '../components/ClaimFlowModal';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const RechargeLedger = () => {
  const location = useLocation();
  const [allOrders] = useMockData('recharges');
  const [employees] = useMockData('employees');
  const [allCustomers] = useMockData('customers');
  const [displayOrders, setDisplayOrders] = useState(null);
  
  const orders = displayOrders || allOrders;
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [auditVisible, setAuditVisible] = useState(false);
  const [customerVisible, setCustomerVisible] = useState(false);
  const [claimVisible, setClaimVisible] = useState(false);

  // Handle incoming navigation
  React.useEffect(() => {
    if (location.state?.openDetail) {
      const order = orders.find(o => o.orderNo === location.state.openDetail);
      if (order) {
        setSelectedOrder(order);
        setAuditVisible(true);
      }
    }
  }, [location.state, orders]);
  
  const [form] = Form.useForm();

  const handleSearch = (values) => {
    let filtered = [...allOrders];
    if (values.orderNo) filtered = filtered.filter(o => o.orderNo.includes(values.orderNo));
    if (values.customerName) filtered = filtered.filter(o => o.customerName.includes(values.customerName));
    if (values.customerCode) filtered = filtered.filter(o => o.customerCode === values.customerCode);
    if (values.status) filtered = filtered.filter(o => o.status === values.status);
    if (values.salesperson) filtered = filtered.filter(o => o.salesperson === values.salesperson);
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(o => {
        const d = dayjs(o.date);
        return d.isAfter(start.startOf('day')) && d.isBefore(end.endOf('day'));
      });
    }
    setDisplayOrders(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setDisplayOrders(null);
  };


  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: '充值订单号',
      dataIndex: 'orderNo',
    },
    {
      title: '客户名称',
      dataIndex: 'customerName',
      render: (text) => (
        <Link onClick={() => {
          const customer = allCustomers.find(c => c.name === text);
          if (customer) {
            setSelectedCustomer(customer);
            setCustomerVisible(true);
          } else {
            message.warning('未找到对应客户详情');
          }
        }}>{text}</Link>
      ),
    },
    {
      title: '客户编码',
      dataIndex: 'customerCode',
    },
    {
      title: '客户类型',
      dataIndex: 'customerType',
    },
    {
      title: '充值日期',
      dataIndex: 'date',
    },
    {
      title: '充值金额',
      dataIndex: 'amount',
      render: (val) => formatCurrency(val),
    },
    {
      title: '业务员',
      dataIndex: 'salesperson',
    },
    {
      title: '审核状态',
      dataIndex: 'status',
      render: (status, record) => {
        // Use status or fallback to auditResult if available
        const s = status || record.auditResult;
        if (!s) return null;
        let color = 'orange';
        if (s === '审核通过') color = 'green';
        if (s === '审核拒绝' || s === '审核未通过') color = 'red';
        return <Tag color={color}>{s}</Tag>;
      },
    },
    {
      title: '备注',
      dataIndex: 'remark',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Link onClick={() => { setSelectedOrder(record); setClaimVisible(true); }}>认领流水</Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Search Header */}
      <Card size="small">
        <Form form={form} layout="inline" onFinish={handleSearch} className="gap-y-2">
          <Form.Item name="orderNo" label="充值订单号">
            <Input placeholder="模糊查询" allowClear className="w-40" />
          </Form.Item>
          <Form.Item name="customerName" label="客户名称">
            <Input placeholder="模糊匹配" allowClear className="w-40" />
          </Form.Item>
          <Form.Item name="customerCode" label="客户编码">
            <Input placeholder="精确匹配" allowClear className="w-40" />
          </Form.Item>
          <Form.Item name="dateRange" label="充值日期">
            <RangePicker className="w-64" />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="全部" className="w-32" allowClear>
              <Select.Option value="待审核">待审核</Select.Option>
              <Select.Option value="审核通过">审核通过</Select.Option>
              <Select.Option value="审核拒绝">审核拒绝</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="salesperson" label="业务员">
            <Select placeholder="全部" className="w-32" allowClear>
              {employees.filter(e => e.status === '在职').map(e => (
                <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
              ))}
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


      <Card size="small">
        <div className="flex justify-end mb-4">
          <Button icon={<DownloadOutlined />} onClick={() => message.info('导出功能开发中')}>导出</Button>
        </div>
        <Table 
          columns={columns} 
          dataSource={orders} 
          rowKey={(record) => record?.id || record?.key}
          size="small"
          scroll={{ x: 1200 }}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `总记录数: ${total}`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
        />
      </Card>

      <RechargeAuditDetailDrawer 
        open={auditVisible} 
        order={selectedOrder} 
        onClose={() => setAuditVisible(false)} 
      />

      {/* Reuse CustomerDetailDrawer */}
      <CustomerDetailDrawer
        open={customerVisible}
        customer={selectedCustomer}
        onClose={() => setCustomerVisible(false)}
      />

      <ClaimFlowModal
        open={claimVisible}
        record={selectedOrder}
        onCancel={() => setClaimVisible(false)}
        onSuccess={() => {
          if (selectedOrder) {
            // Update the local state or mock data
            const updatedOrder = { ...selectedOrder, status: '待审核' };
            if (displayOrders) {
               setDisplayOrders(displayOrders.map(o => o.orderNo === selectedOrder.orderNo ? updatedOrder : o));
            }
            mockData.upsert('recharges', updatedOrder);
          }
          setClaimVisible(false);
        }}
      />
    </div>
  );
};

export default RechargeLedger;
