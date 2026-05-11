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
  auditLogs as mockAuditLogs,
  salespersonHistory as mockSalespersonHistory,
  customerCategories,
  priceVersions
} from '../mock';
import { getDiscountRate, formatCurrency } from '../utils/helpers';

const { Text, Link } = Typography;

const CustomerDetailDrawer = ({ open, customer, onClose }) => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackVisible, setFeedbackVisible] = useState(false);
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
  const auditLogs = mockAuditLogs.filter(l => l.customerId === customer.id);
  const salespersonHistory = mockSalespersonHistory.filter(h => h.customerId === customer.id);

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
            <Descriptions.Item label="当前适用折扣率">
              <Text type="danger" strong>{discountRate}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="结算方式">{customer.settlementMethod}</Descriptions.Item>
            {customer.settlementMethod === '月结' && (
              <Descriptions.Item label="月结周期">{customer.monthlyCycle}</Descriptions.Item>
            )}
            {customer.settlementMethod === '预存' && (
              <Descriptions.Item label="预存余额">{formatCurrency(customer.prepaidBalance)}</Descriptions.Item>
            )}
            <Descriptions.Item label="行政区划" span={2}>{customer.region?.join('/') || '-'}</Descriptions.Item>
            <Descriptions.Item label="详细地址">{customer.address || '-'}</Descriptions.Item>
            <Descriptions.Item label="业务员">{customer.salesperson}</Descriptions.Item>
            <Descriptions.Item label="联系人">{customer.contactName}</Descriptions.Item>
            <Descriptions.Item label="联系电话">{customer.contactPhone}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{customer.remark || '-'}</Descriptions.Item>
          </Descriptions>

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
          dataSource={salespersonHistory}
          columns={[
            { title: '原业务员', dataIndex: 'oldSalesperson', render: text => text || '-' },
            { title: '新业务员', dataIndex: 'newSalesperson', render: text => text || '-' },
            { title: '操作人', dataIndex: 'operator' },
            { title: '创建时间', dataIndex: 'createdAt' },
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
      label: '充值订单',
      disabled: customer.settlementMethod !== '预存',
      children: (
        <div>
          <div className="mb-4 text-right">
            <Text>合计预存余额：</Text>
            <Text type="danger" strong className="text-lg">{formatCurrency(customer.prepaidBalance)}</Text>
          </div>
          <Table 
            dataSource={rechargeOrders}
            columns={[
              { title: '充值单号', dataIndex: 'orderNo' },
              { title: '日期', dataIndex: 'date' },
              { title: '金额', dataIndex: 'amount', render: (val) => formatCurrency(val) },
              { 
                title: '状态', 
                dataIndex: 'status',
                render: (status) => {
                  let color = 'orange';
                  if (status === '审批通过') color = 'green';
                  if (status === '审批拒绝') color = 'red';
                  return <Tag color={color}>{status}</Tag>;
                }
              },
              { title: '业务员', dataIndex: 'salesperson' },
              { title: '备注', dataIndex: 'remark', ellipsis: true },
            ]}
            size="small"
            rowKey={(record) => record?.id || record?.key || record?.orderNo}
          />
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
  ];

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
