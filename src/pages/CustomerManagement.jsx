import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Tag, 
  Switch, 
  Card, 
  Form, 
  message,
  Typography,
  Tabs
} from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useMockData, mockData } from '../mock/data';
import { useLocation } from 'react-router-dom';
import AddCustomerDrawer from '../components/AddCustomerDrawer';
import CustomerDetailDrawer from '../components/CustomerDetailDrawer';
import CustomerEditModal from '../components/CustomerEditModal';
import CustomerSettlementModal from '../components/CustomerSettlementModal';
import RechargeModal from '../components/RechargeModal';
import AuditDetailDrawer from '../components/AuditDetailDrawer';

const { Link } = Typography;

const CustomerManagement = () => {
  const location = useLocation();
  const [allCustomers] = useMockData('customers');
  const [employees] = useMockData('employees');
  const [activeTab, setActiveTab] = useState('全部');
  const [displayCustomers, setDisplayCustomers] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const customers = useMemo(() => {
    let base = displayCustomers || allCustomers;
    if (activeTab !== '全部') {
      base = base.filter(c => c.type === activeTab);
    }
    return base;
  }, [allCustomers, displayCustomers, activeTab]);

  const [detailVisible, setDetailVisible] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [editVisible, setEditVisible] = useState(false);
  const [settlementVisible, setSettlementVisible] = useState(false);
  const [rechargeVisible, setRechargeVisible] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);
  const [auditTarget, setAuditTarget] = useState(null);

  const customerCategories = [
    { id: 'all', name: '全部', enabled: true },
    { id: 'cat1', name: '独立店', enabled: true },
    { id: 'cat2', name: '分销商', enabled: true },
    { id: 'cat3', name: '合伙人', enabled: true },
    { id: 'cat4', name: '直营店', enabled: true },
    { id: 'cat5', name: '企业客户', enabled: true },
    { id: 'cat6', name: '经销商', enabled: true },
    { id: 'cat7', name: '零售', enabled: true }
  ];

  const tabItems = customerCategories.map(c => ({
    key: c.name,
    label: c.name,
  }));

  // Handle incoming navigation
  React.useEffect(() => {
    if (location.state?.customerCode || location.state?.customerName) {
      const customer = allCustomers.find(c => 
        c.code === location.state.customerCode || 
        c.name === location.state.customerName
      );
      if (customer) {
        setSelectedCustomer(customer);
        setDetailVisible(true);
      }
    }
  }, [location.state, allCustomers]);
  
  const [form] = Form.useForm();

  const handleSearch = (values) => {
    let filtered = [...allCustomers];
    if (values.code) filtered = filtered.filter(c => c.code.includes(values.code));
    if (values.name) filtered = filtered.filter(c => c.name.includes(values.name));
    if (values.type) filtered = filtered.filter(c => c.type === values.type);
    if (values.salesperson) filtered = filtered.filter(c => c.salesperson === values.salesperson);
    if (values.status) filtered = filtered.filter(c => c.status === values.status);
    if (values.settlementMethod) filtered = filtered.filter(c => c.settlementMethod === values.settlementMethod);
    setDisplayCustomers(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setDisplayCustomers(null);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      render: (_, __, index) => index + 1,
      width: 60,
    },
    {
      title: '客户编码',
      dataIndex: 'code',
      render: (text, record) => (
        <Link onClick={() => { setSelectedCustomer(record); setDetailVisible(true); }}>{text}</Link>
      ),
    },
    {
      title: '客户名称',
      dataIndex: 'name',
      render: (text, record) => (
        <Link onClick={() => { setSelectedCustomer(record); setDetailVisible(true); }}>{text}</Link>
      ),
    },
    {
      title: '客户类型',
      dataIndex: 'type',
    },
    {
      title: '客户行政区划',
      dataIndex: 'region',
      render: (region) => region ? (Array.isArray(region) ? region.join('/') : region) : '-',
    },
    {
      title: '客户详细地址',
      dataIndex: 'address',
      ellipsis: true,
    },
    {
      title: '结算方式',
      dataIndex: 'settlementMethod',
    },
    {
      title: '业务员',
      dataIndex: 'salesperson',
    },
    {
      title: '启用/禁用',
      dataIndex: 'status',
      render: (status, record) => (
        <Switch 
          checked={status === '启用'} 
          onChange={(checked) => {
            const updated = { ...record, status: checked ? '启用' : '禁用' };
            mockData.upsert('customers', updated);
            message.success(`${checked ? '启用' : '禁用'}成功`);
          }} 
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size="middle">
          <Link onClick={() => { setSelectedCustomer(record); setEditVisible(true); }}>编辑</Link>
          <Link onClick={() => { setSelectedCustomer(record); setSettlementVisible(true); }}>变更结算信息</Link>
          {record.settlementMethod === '预存' && (
            <Link onClick={() => { setSelectedCustomer(record); setRechargeVisible(true); }}>充值预存金</Link>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="bg-white rounded-t-lg px-4 pt-2 shadow-sm border-b">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={tabItems}
        />
      </div>

      {/* Search Area */}
      <Card size="small" className="rounded-none border-x-0 border-y shadow-none">
        <Form form={form} layout="inline" onFinish={handleSearch} className="gap-y-2">
          <Form.Item name="code" label="客户编码">
            <Input placeholder="模糊查询" allowClear className="w-32" />
          </Form.Item>
          <Form.Item name="name" label="客户名称">
            <Input placeholder="模糊查询" allowClear className="w-32" />
          </Form.Item>
          <Form.Item name="type" label="客户类型">
            <Select placeholder="全部" className="w-32" allowClear>
              {customerCategories.filter(c => c.enabled && c.id !== 'all').map(c => (
                <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="salesperson" label="业务员">
            <Select placeholder="全部" className="w-32" allowClear>
              {(employees || []).filter(e => e.status === '在职').map(e => (
                <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="全部" className="w-32" allowClear>
              <Select.Option value="启用">启用</Select.Option>
              <Select.Option value="禁用">禁用</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="settlementMethod" label="结算方式">
            <Select placeholder="全部" className="w-32" allowClear>
              <Select.Option value="月结">月结</Select.Option>
              <Select.Option value="现结">现结</Select.Option>
              <Select.Option value="预存">预存</Select.Option>
              <Select.Option value="现金">现金</Select.Option>
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

      <div className="bg-white rounded-b-lg p-2 shadow-sm">
        <div className="flex justify-end mb-4 pr-2">
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddVisible(true)}>新增</Button>
            <Button icon={<UploadOutlined />} onClick={() => message.info('功能开发中')}>导入</Button>
          </Space>
        </div>
        <Table 
          columns={columns} 
          dataSource={customers} 
          rowKey={(record) => record?.id || record?.key}
          size="small"
          scroll={{ x: 1200 }}
          onRow={(record) => ({
            onClick: (e) => {
               if (e.target.tagName !== 'SPAN' && e.target.tagName !== 'A' && !e.target.closest('.ant-switch')) {
                setSelectedCustomer(record);
                setDetailVisible(true);
               }
            }
          })}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `总记录数: ${total}`,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
          }}
        />
      </div>

      <AddCustomerDrawer 
        open={addVisible} 
        onClose={() => setAddVisible(false)} 
        onSuccess={(newCustomer) => {
          mockData.upsert('customers', newCustomer);
          setAddVisible(false);
        }}
      />
      
      <CustomerDetailDrawer 
        open={detailVisible} 
        customer={selectedCustomer} 
        onClose={() => setDetailVisible(false)} 
      />

      <CustomerEditModal 
        open={editVisible} 
        customer={selectedCustomer} 
        onClose={() => setEditVisible(false)}
        onSuccess={(updatedCustomer) => {
          mockData.upsert('customers', updatedCustomer);
          setEditVisible(false);
          message.success('编辑成功');
        }}
      />

      <CustomerSettlementModal
        open={settlementVisible}
        customer={selectedCustomer}
        onClose={() => setSettlementVisible(false)}
        onSuccess={(updatedCustomer) => {
          mockData.upsert('customers', updatedCustomer);
          setSettlementVisible(false);
        }}
      />

      <RechargeModal 
        open={rechargeVisible} 
        customer={selectedCustomer} 
        onClose={() => setRechargeVisible(false)}
        onSuccess={(rechargeAmount) => {
          const updated = { ...selectedCustomer, prepaidBalance: (selectedCustomer.prepaidBalance || 0) + rechargeAmount };
          mockData.upsert('customers', updated);
          setRechargeVisible(false);
          message.success('充值成功');
        }}
      />

      <AuditDetailDrawer 
        open={auditVisible} 
        target={auditTarget} 
        onClose={() => setAuditVisible(false)} 
      />
    </div>
  );
};

export default CustomerManagement;
