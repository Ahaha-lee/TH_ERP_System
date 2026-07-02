import React, { useState, useEffect } from 'react';
import { 
  Drawer, 
  Tabs, 
  Descriptions, 
  Table, 
  Tag, 
  Typography,
  Space,
  Button,
  Modal,
  Form,
  Input,
  message
} from 'antd';
import dayjs from 'dayjs';
import { 
  salesOrders as mockSalesOrders, 
  rechargeOrders as mockRechargeOrders, 
  consumptionRecords as mockConsumptionRecords,
  auditLogs as mockAuditLogs,
  salespersonHistory as mockSalespersonHistory,
  customerCategories,
  priceVersions,
  useMockData
} from '../mock';
import { getDiscountRate, formatCurrency } from '../utils/helpers';

const { Text, Link } = Typography;

const CustomerDetailDrawer = ({ open, customer, onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [allPriceStrategies] = useMockData('priceStrategiesLedger');
  const [form] = Form.useForm();

  useEffect(() => {
    if (customer) {
      setFeedbacks(customer.feedbacks || []);
    }
  }, [customer]);

  if (!customer) return (
    <Drawer open={open} onClose={onClose} title="客户详情" forceRender>
       <div className="p-8 text-center text-gray-400">加载中...</div>
       <div style={{ display: 'none' }}><Form form={form} /></div>
    </Drawer>
  );

  const handleAddFeedback = (values) => {
    const newFeedback = {
      id: Date.now(),
      time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      content: values.content
    };
    setFeedbacks([newFeedback, ...feedbacks]);
    setFeedbackVisible(false);
    form.resetFields();
    message.success('反馈记录添加成功');
  };

  const discountRate = getDiscountRate(customer.type, priceVersions, customerCategories);

  // Filter mock data for this customer
  const salesOrders = mockSalesOrders.filter(o => o.customerId === customer.id);
  const rechargeOrders = mockRechargeOrders.filter(o => o.customerId === customer.id);
  const consumptionRecordsFiltered = mockConsumptionRecords.filter(r => r.customerId === customer.id);
  const auditLogs = mockAuditLogs.filter(l => l.customerId === customer.id);
  const salespersonHistory = mockSalespersonHistory.filter(h => h.customerId === customer.id);
  const sortedHistoryAsc = [...salespersonHistory].sort((a, b) => {
    return dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix();
  });
  const salespersonHistoryDisplay = sortedHistoryAsc.map((item, idx) => {
    const nextItem = sortedHistoryAsc[idx + 1];
    return {
      ...item,
      expiryTime: nextItem ? nextItem.createdAt : '-'
    };
  });

  const accumulatedRecharge = rechargeOrders.reduce((sum, r) => sum + (r.status === '生效' ? r.amount : 0), 0);
  const accumulatedConsumption = consumptionRecordsFiltered.reduce((sum, r) => sum + r.amount, 0);

  const rechargeColumns = [
    { title: '序号', dataIndex: 'index', align: 'center', width: 60, render: (_, __, i) => i + 1 },
    { title: '充值流水号', dataIndex: 'orderNo', align: 'center' },
    { title: '充值金额', dataIndex: 'amount', align: 'center', render: (val) => <Text className="text-green-600 font-medium">{formatCurrency(val)}</Text> },
    { title: '充值时间', dataIndex: 'date', align: 'center' },
    { title: '业务员', dataIndex: 'operator', align: 'center' },
    { 
      title: '状态', 
      dataIndex: 'status', 
      align: 'center',
      render: (status) => (
        <Tag color={status === '生效' ? 'green' : 'default'}>
          {status === '生效' ? '生效' : '未生效'}
        </Tag>
      )
    },
    { title: '备注', dataIndex: 'remark', align: 'center', ellipsis: true },
  ];

  const consumptionColumns = [
    { title: '序号', dataIndex: 'index', align: 'center', width: 60, render: (_, __, i) => i + 1 },
    { title: '关联订单号', dataIndex: 'orderNo', align: 'center' },
    { title: '消费金额', dataIndex: 'amount', align: 'center', render: (val) => <Text className="text-red-600 font-medium">{formatCurrency(val)}</Text> },
    { title: '消费类型', dataIndex: 'type', align: 'center' },
    { title: '消费时间', dataIndex: 'time', align: 'center' },
  ];

  const filteredStrategies = (allPriceStrategies || []).filter(s => {
    if (s.customerCategory && s.customerCategory === customer.type) return true;
    if (s.customerLevel && s.customerLevel === customer.level) return true;
    if (s.customerRegion && (s.customerRegion === customer.region || s.customerRegion.split('/').some(r => r.trim() === customer.region))) return true;
    if (s.customerName === customer.name || s.customerCode === customer.code) return true;
    return false;
  });

  const strategyColumns = [
    {
      title: '价格策略编号',
      dataIndex: 'code',
      key: 'code',
      width: 130,
    },
    {
      title: '策略维度',
      key: 'strategyDimension',
      width: 110,
      render: (_, record) => {
        if (record.strategyDimension) {
          return record.strategyDimension === '产品' ? '客户+产品' : record.strategyDimension;
        }
        if (record.customerCategory) return '客户类型';
        if (record.customerLevel) return '客户等级';
        if (record.customerRegion) return '客户区域';
        if (record.productInfo) return '客户+产品';
        return '-';
      }
    },
    {
      title: '维度值',
      key: 'dimensionValue',
      render: (_, record) => {
        if (record.customerCategory) return record.customerCategory;
        if (record.customerLevel) return record.customerLevel;
        if (record.customerRegion) return record.customerRegion;
        if (record.productInfo) return record.productInfo;
        const val = record.dimensionValue;
        if (Array.isArray(val)) return val.join(', ');
        return val || '-';
      }
    },
    {
      title: '优惠折扣率',
      dataIndex: 'discountRate',
      key: 'discountRate',
      width: 110,
      align: 'center',
      render: (val) => val !== undefined && val !== null ? `${Math.round((1 - val) * 100)}%` : '-',
    },
    {
      title: '生效日期',
      dataIndex: 'effectiveDate',
      key: 'effectiveDate',
      width: 110,
    },
    {
      title: '失效日期',
      dataIndex: 'expiryDate',
      key: 'expiryDate',
      width: 110,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      align: 'center',
      render: (status) => {
        let color = 'default';
        if (status === '生效') color = 'green';
        if (status === '待生效') color = 'blue';
        if (status === '失效') color = 'red';
        return <Tag color={color}>{status || '未知'}</Tag>;
      }
    }
  ];

  const items = [
    {
      key: '1',
      label: '基本信息',
      children: (
        <div className="space-y-6">
          <Descriptions bordered size="small" column={2}>
            <Descriptions.Item label="客户编码">{customer.code}</Descriptions.Item>
            <Descriptions.Item label="客户名称">{customer.name}</Descriptions.Item>
            <Descriptions.Item label="客户类型">{customer.type}</Descriptions.Item>
            <Descriptions.Item label="客户等级">{customer.level || '-'}</Descriptions.Item>
            <Descriptions.Item label="结算方式">{customer.settlementMethod}</Descriptions.Item>
            {customer.settlementMethod === '月结' && (
              <Descriptions.Item label="月结周期" span={2}>{customer.monthlyCycle}</Descriptions.Item>
            )}
            {customer.settlementMethod === '预存' && (
              <Descriptions.Item label="预存余额" span={2}>{formatCurrency(customer.prepaidBalance)}</Descriptions.Item>
            )}
            <Descriptions.Item label="客户区域" span={2}>
              {customer.region ? (Array.isArray(customer.region) ? customer.region.join('/') : customer.region) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="详细地址">{customer.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="业务员">{customer.salesperson}</Descriptions.Item>
            <Descriptions.Item label="联系人">{customer.contactName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{customer.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="物流联系人">{customer.logisticsContact || '-'}</Descriptions.Item>
            <Descriptions.Item label="物流联系人电话">{customer.logisticsContactPhone || '-'}</Descriptions.Item>
            <Descriptions.Item label="物流地址" span={2}>{customer.logisticsAddress || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{customer.remark || '-'}</Descriptions.Item>
          </Descriptions>

          <CardTitle title="价格策略" />
          <Table rowKey="id"
            columns={strategyColumns}
            dataSource={filteredStrategies}
            pagination={false}
            size="small"
            locale={{ emptyText: '暂无适用的价格策略' }}
          />

          <div className="flex justify-between items-center mb-4 mt-8">
            <CardTitle title="反馈记录" noMargin />
            <Button type="link" onClick={() => setFeedbackVisible(true)}>添加反馈</Button>
          </div>
          <Table rowKey={(record) => record?.id || record?.key}
            columns={[{ title: '反馈内容', dataIndex: 'content' }, { title: '反馈时间', dataIndex: 'time' }]}
            dataSource={feedbacks}
            pagination={false}
            size="small"
            locale={{ emptyText: '暂无反馈记录' }}
          />

          <Modal forceRender
            title="新增反馈信息"
            open={feedbackVisible}
            onCancel={() => {
              form.resetFields();
              setFeedbackVisible(false);
            }}
            onOk={() => form.submit()}
            centered
          >
            <Form form={form} layout="vertical" onFinish={handleAddFeedback}>
              <Form.Item
                name="content"
                label="反馈内容"
                rules={[{ required: true, message: '请输入反馈内容' }]}
              >
                <Input.TextArea rows={4} placeholder="请输入客户反馈的具体信息..." />
              </Form.Item>
            </Form>
          </Modal>
        </div>
      ),
    },
    {
      key: '2',
      label: '业务员历史',
      children: (
        <Table 
          dataSource={salespersonHistoryDisplay}
          columns={[
            { title: '原业务员', dataIndex: 'oldSalesperson', render: text => text || '-' },
            { title: '新业务员', dataIndex: 'newSalesperson', render: text => text || '-' },
            { title: '操作人', dataIndex: 'operator' },
            { title: '创建（生效）时间', dataIndex: 'createdAt' },
            { title: '失效时间', dataIndex: 'expiryTime' },
          ]}
          size="small"
          rowKey={(record) => record?.id || record?.key || record?.operator + record?.createdAt}
        />
      ),
    },
    {
      key: '3',
      label: '关联销售订单',
      children: (
        <Table 
          dataSource={salesOrders}
          columns={[
            { 
              title: '订单号', 
              dataIndex: 'orderNo',
              render: (text) => <Link onClick={() => alert(`跳转到订单详情: ${text}`)}>{text}</Link>
            },
            { title: '订单日期', dataIndex: 'date' },
            { title: '金额', dataIndex: 'amount', render: (val) => formatCurrency(val) },
            { title: '业务员', dataIndex: 'salesperson' },
            { 
              title: '订单状态', 
              dataIndex: 'status',
              render: (status) => <Tag color={status === '已完成' ? 'green' : 'blue'}>{status}</Tag>
            },
          ]}
          size="small"
          rowKey={(record) => record?.id || record?.key || record?.orderNo}
        />
      ),
    },
    {
      key: '4',
      label: '账户流水记录',
      disabled: customer.settlementMethod !== '预存',
      children: (
        <div className="bg-gray-50 p-6 -m-4 min-h-[600px]">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <Typography.Title level={5} className="mb-6 !mt-0 flex items-center">
              <div className="w-1 h-4 bg-blue-600 mr-2 rounded-full" />
              账户流水记录
            </Typography.Title>

            {/* Assets Stats */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <Text className="text-gray-400 text-xs mb-1">累计充值金额</Text>
                <Text className="text-xl font-bold text-green-600">{formatCurrency(accumulatedRecharge)}</Text>
              </div>
              <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <Text className="text-gray-400 text-xs mb-1">累计消费金额</Text>
                <Text className="text-xl font-bold text-red-500">{formatCurrency(accumulatedConsumption)}</Text>
              </div>
              <div className="bg-white p-4 rounded border border-gray-100 shadow-sm flex flex-col items-center justify-center">
                <Text className="text-gray-400 text-xs mb-1">当前账户余额</Text>
                <Text className="text-xl font-bold text-blue-600">{formatCurrency(customer.prepaidBalance)}</Text>
              </div>
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex items-center mb-3">
                  <Text strong className="text-gray-600">充值记录</Text>
                </div>
                <Table 
                  dataSource={rechargeOrders}
                  columns={rechargeColumns}
                  pagination={false}
                  size="small"
                  bordered
                  rowKey="id"
                  className="custom-white-table"
                  rowClassName="text-center"
                />
              </div>

              <div>
                <div className="flex items-center mb-3">
                  <Text strong className="text-gray-600">消费记录</Text>
                </div>
                <Table 
                  dataSource={consumptionRecordsFiltered}
                  columns={consumptionColumns}
                  pagination={false}
                  size="small"
                  bordered
                  rowKey="id"
                  className="custom-white-table"
                  rowClassName="text-center"
                />
              </div>
            </div>
          </div>
          <style>{`
            .custom-white-table .ant-table-thead > tr > th {
              background-color: #f5f5f5 !important;
              text-align: center !important;
              font-weight: 500 !important;
            }
            .custom-white-table .ant-table-tbody > tr > td {
              text-align: center !important;
            }
          `}</style>
        </div>
      ),
    },
    {
      key: '5',
      label: '操作日志',
      children: (
        <Table 
          dataSource={auditLogs}
          columns={[
            { title: '操作时间', dataIndex: 'time' },
            { title: '操作人', dataIndex: 'operator' },
            { title: '动作', dataIndex: 'action' },
            { title: '说明', dataIndex: 'details', ellipsis: true },
          ]}
          size="small"
          rowKey={(record) => record?.id || record?.key || record?.time + record?.operator}
        />
      ),
    },
  ].filter(item => {
    if (item.key === '4') return customer.settlementMethod === '预存';
    return true;
  });

  return (
    <Drawer forceRender
      title={`客户详情 - ${customer.name}`}
      size="large"
      open={open}
      onClose={onClose}
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Drawer>
  );
};

const CardTitle = ({ title, noMargin }) => (
  <div className={`flex items-center ${noMargin ? 'mb-0 mt-0' : 'mb-4 mt-8'}`}>
    <div className="w-1 h-4 bg-blue-500 mr-2 rounded-full" />
    <Text strong>{title}</Text>
  </div>
);

export default CustomerDetailDrawer;
