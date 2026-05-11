import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { 
  Modal, 
  Card, 
  Descriptions, 
  Typography, 
  Tabs, 
  Button, 
  Table, 
  Select, 
  InputNumber, 
  Input, 
  Space, 
  message,
  Popconfirm
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/helpers';
import { normalOrders } from '../../mock';
import { customers } from '../../mock';

const { Text, Title, Link } = Typography;

const ClaimFlowModal = ({ open, flow, onCancel, onClaim }) => {
  const [activeTab, setActiveTab] = useState('sales');
  const [salesClaims, setSalesClaims] = useState([{ id: Date.now(), orderNo: null, claimAmount: 0, claimRatio: 0, remark: '' }]);
  const [rechargeClaims, setRechargeClaims] = useState([{ id: Date.now(), customerCode: null, claimAmount: 0, remark: '' }]);

  // Filter orders for select (Mock: unpaid or partial paid)
  const availableOrders = normalOrders.filter(o => o.paymentStatus !== '已收全款');
  // Filter customers for deposit
  const depositCustomers = customers.filter(c => c.settlementMethod === '预存');

  const addSalesRow = () => setSalesClaims([...salesClaims, { id: Date.now(), orderNo: null, claimAmount: 0, claimRatio: 0, remark: '' }]);
  const removeSalesRow = (id) => setSalesClaims(salesClaims.filter(row => row.id !== id));

  const addRechargeRow = () => setRechargeClaims([...rechargeClaims, { id: Date.now(), customerCode: null, claimAmount: 0, remark: '' }]);
  const removeRechargeRow = (id) => setRechargeClaims(rechargeClaims.filter(row => row.id !== id));

  const updateSalesRow = (id, field, value) => {
    const updated = salesClaims.map(row => {
      if (row.id === id) {
        const newRow = { ...row, [field]: value };
        if (field === 'orderNo') {
          const order = availableOrders.find(o => o.orderNo === value);
          newRow.customerName = order?.customerName;
          newRow.salesman = order?.salesperson;
          newRow.totalDue = order?.totalAmount || 0;
          newRow.receivedAmount = order?.receivedAmount || 0;
          newRow.remainingDue = (order?.totalAmount || 0) - (order?.receivedAmount || 0);
          newRow.claimAmount = newRow.remainingDue;
          newRow.claimRatio = 100;
          newRow.claimant = '当前用户'; // Mock current user
          newRow.claimTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          newRow.status = '待审批';
        }
        if (field === 'claimAmount' && row.totalDue) {
          newRow.claimRatio = Number(((value / row.remainingDue) * 100).toFixed(2));
        }
        if (field === 'claimRatio' && row.totalDue) {
          newRow.claimAmount = Number(((value / 100) * row.remainingDue).toFixed(2));
        }
        return newRow;
      }
      return row;
    });
    setSalesClaims(updated);
  };

  const updateRechargeRow = (id, field, value) => {
    const updated = rechargeClaims.map(row => {
      if (row.id === id) {
        const newRow = { ...row, [field]: value };
        if (field === 'customerCode') {
          const cust = depositCustomers.find(c => c.code === value);
          newRow.customerName = cust?.name;
          newRow.customerType = cust?.type;
          newRow.balance = cust?.balance || 0;
          newRow.salesman = cust?.salesperson;
          // For recharge, we usually claim the rest of flow amount or a fixed part
          newRow.claimAmount = flow?.amount - (rechargeClaims.filter(r => r.id !== id).reduce((s, r) => s + (r.claimAmount || 0), 0));
          newRow.claimant = '当前用户';
          newRow.claimTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
          newRow.status = '待审批';
        }
        return newRow;
      }
      return row;
    });
    setRechargeClaims(updated);
  };

  const totalSalesClaim = salesClaims.reduce((sum, r) => sum + (r.claimAmount || 0), 0);
  const totalRechargeClaim = rechargeClaims.reduce((sum, r) => sum + (r.claimAmount || 0), 0);
  const currentTotalClaim = activeTab === 'sales' ? totalSalesClaim : totalRechargeClaim;
  const isOverLimit = currentTotalClaim > (flow?.amount || 0);

  const salesColumns = [
    { 
      title: '销售订单号', 
      dataIndex: 'orderNo', 
      width: 180, 
      fixed: 'left',
      render: (val, record) => (
        <Select 
          showSearch 
          className="w-full"
          placeholder="搜索订单/客户"
          value={val}
          onChange={v => updateSalesRow(record.id, 'orderNo', v)}
          options={availableOrders.map(o => ({ label: `${o.orderNo} - ${o.customerName}`, value: o.orderNo }))}
        />
      )
    },
    { title: '客户名称', dataIndex: 'customerName', width: 150, ellipsis: true },
    { title: '业务员', dataIndex: 'salesman', width: 100 },
    { 
      title: '订单应收金额', 
      dataIndex: 'totalDue', 
      width: 110, 
      align: 'right', 
      render: val => formatCurrency(val) 
    },
    { 
      title: '订单已收金额', 
      dataIndex: 'receivedAmount', 
      width: 110, 
      align: 'right', 
      render: val => formatCurrency(val || 0) 
    },
    { 
      title: '订单待收金额', 
      dataIndex: 'remainingDue', 
      width: 110, 
      align: 'right', 
      render: val => <Text type="danger">{formatCurrency(val)}</Text> 
    },
    { 
      title: '本次认领比例', 
      dataIndex: 'claimRatio', 
      width: 110, 
      render: (val, record) => (
        <InputNumber 
          className="w-full" 
          min={0} max={100} 
          formatter={v => `${v}%`} 
          parser={v => v.replace('%', '')}
          value={val}
          onChange={v => updateSalesRow(record.id, 'claimRatio', v)}
        />
      )
    },
    { 
      title: '本次认领金额', 
      dataIndex: 'claimAmount', 
      width: 130, 
      render: (val, record) => (
        <InputNumber 
          className="w-full" 
          min={0}
          value={val} 
          onChange={v => updateSalesRow(record.id, 'claimAmount', v)}
          formatter={v => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={v => v.replace(/\¥\s?|(,*)/g, '')}
        />
      )
    },
    { title: '认领人', dataIndex: 'claimant', width: 100, render: val => val || '-' },
    { title: '认领时间', dataIndex: 'claimTime', width: 160, render: val => val || '-' },
    { title: '备注', dataIndex: 'remark', width: 150, render: (val, record) => <Input value={val} onChange={e => updateSalesRow(record.id, 'remark', e.target.value)} /> },
    { 
      title: '审批状态', 
      dataIndex: 'status', 
      width: 100,
      fixed: 'right',
      render: (val) => (
        <Tag color="cyan">{val || '待提交'}</Tag>
      )
    },
    { 
      title: '操作', 
      width: 60, 
      fixed: 'right',
      render: (_, record) => salesClaims.length > 1 && (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeSalesRow(record.id)} />
      )
    }
  ];

  const rechargeColumns = [
    { title: '客户编号', dataIndex: 'customerCode', width: 220, render: (val, record) => (
      <Select 
        showSearch 
        className="w-full"
        placeholder="搜索客户编码/名称"
        value={val}
        onChange={v => updateRechargeRow(record.id, 'customerCode', v)}
        options={depositCustomers.map(c => ({ label: `${c.code} - ${c.name}`, value: c.code }))}
      />
    )},
    { title: '客户名称', dataIndex: 'customerName', width: 120, ellipsis: true },
    { title: '客户类型', dataIndex: 'customerType', width: 100 },
    { title: '结算方式', dataIndex: 'settlementMethod', width: 100, render: () => '预存' },
    { title: '预存余额', dataIndex: 'balance', width: 120, render: val => formatCurrency(val) },
    { title: '行政区划', dataIndex: 'region', width: 120, ellipsis: true, render: () => '广东省/深圳市' },
    { title: '详细地址', dataIndex: 'address', width: 150, ellipsis: true, render: () => '高新科技园1号' },
    { title: '联系人', dataIndex: 'contact', width: 100, render: () => '张三' },
    { title: '电话号码', dataIndex: 'phone', width: 120, render: () => '13800138000' },
    { title: '业务员', dataIndex: 'salesman', width: 100 },
    { title: '订单充值金额', dataIndex: 'claimAmount', width: 150, render: (val, record) => (
        <InputNumber 
          className="w-full" 
          value={val} 
          onChange={v => updateRechargeRow(record.id, 'claimAmount', v)}
          formatter={v => `¥ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={v => v.replace(/\¥\s?|(,*)/g, '')}
        />
      )
    },
    { title: '本次认领金额', dataIndex: 'claimAmount', width: 120, render: val => formatCurrency(val) },
    { title: '认领人', dataIndex: 'claimant', width: 100, render: val => val || '-' },
    { title: '认领时间', dataIndex: 'claimTime', width: 160, render: val => val || '-' },
    { title: '备注', dataIndex: 'remark', width: 150, render: (val, record) => <Input value={val} onChange={e => updateRechargeRow(record.id, 'remark', e.target.value)} /> },
    { title: '审批状态', dataIndex: 'status', width: 100, fixed: 'right', render: (val) => <Tag color="cyan">{val || '待提交'}</Tag> },
    { title: '操作', width: 60, fixed: 'right', render: (_, record) => rechargeClaims.length > 1 && (
      <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeRechargeRow(record.id)} />
    )}
  ];

  const handleSubmit = () => {
    if (isOverLimit) {
      return message.error('认领总额超过流水金额，无法提交');
    }
    const finalClaims = activeTab === 'sales' ? salesClaims : rechargeClaims;
    if (finalClaims.some(c => !c.orderNo && !c.customerCode)) {
      return message.warning('请补充完整的认领信息');
    }
    message.success('认领提交成功，已进入待审批状态');
    onClaim(finalClaims, activeTab);
    onCancel();
  };

  const tabsItems = [
    { key: 'sales', label: '销售订单认领', children: <Table dataSource={salesClaims} columns={salesColumns} rowKey="id" pagination={false} size="small" scroll={{ x: 2000 }} footer={() => <Button type="dashed" block icon={<PlusOutlined />} onClick={addSalesRow}>添加订单</Button>} /> },
    { key: 'recharge', label: '充值认领', children: <Table dataSource={rechargeClaims} columns={rechargeColumns} rowKey="id" pagination={false} size="small" scroll={{ x: 2000 }} footer={() => <Button type="dashed" block icon={<PlusOutlined />} onClick={addRechargeRow}>添加行</Button>} /> },
  ];

  return (
    <Modal forceRender
      title="认领流水"
      open={open}
      onCancel={onCancel}
      width={900}
      onOk={handleSubmit}
      okButtonProps={{ disabled: isOverLimit }}
      centered
      destroyOnHidden
    >
      <div className="space-y-4">
        <Card size="small" className="bg-gray-50">
          <Descriptions column={3} size="small">
            <Descriptions.Item label="流水号">{flow?.flowNo}</Descriptions.Item>
            <Descriptions.Item label="交易时间">{flow?.transTime}</Descriptions.Item>
            <Descriptions.Item label="交易金额"><Text strong className="text-red-500">{formatCurrency(flow?.amount)}</Text></Descriptions.Item>
            <Descriptions.Item label="交易方">{flow?.payerName}</Descriptions.Item>
            <Descriptions.Item label="账号">{flow?.payerAccount}</Descriptions.Item>
            <Descriptions.Item label="摘要">{flow?.summary}</Descriptions.Item>
          </Descriptions>
        </Card>

        <Tabs items={tabsItems} activeKey={activeTab} onChange={setActiveTab} />

        <div className="flex justify-end p-2 bg-gray-50 border border-dashed rounded">
          <Space>
            <span>流水金额: {formatCurrency(flow?.amount)}</span>
            <span className="text-gray-300">|</span>
            <span>当前已认领: <Text strong className={isOverLimit ? 'text-red-500' : 'text-green-600'}>{formatCurrency(currentTotalClaim)}</Text></span>
            {isOverLimit && <Text type="danger" className="animate-pulse">（超额认领！）</Text>}
          </Space>
        </div>
      </div>
    </Modal>
  );
};

export default ClaimFlowModal;
