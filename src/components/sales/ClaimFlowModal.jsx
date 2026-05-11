
import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Table, 
  Select, 
  Input, 
  InputNumber, 
  Button, 
  Space, 
  Typography, 
  Row, 
  Col, 
  message,
  Popconfirm,
  Divider,
  DatePicker,
  Form
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockClaimFlows } from '../../mock/claimFlowMock';
import { formatCurrency } from '../../utils/helpers';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// --- Flow Selection Modal ---
const FlowSelectModal = ({ open, onCancel, onConfirm }) => {
  const [searchValues, setSearchValues] = useState({});
  const [filteredData, setFilteredData] = useState(mockClaimFlows);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSearch = () => {
    let filtered = [...mockClaimFlows];
    if (searchValues.flowNo) {
      filtered = filtered.filter(f => f.flowNo.includes(searchValues.flowNo));
    }
    if (searchValues.project) {
      filtered = filtered.filter(f => f.project.includes(searchValues.project));
    }
    if (searchValues.amountMin !== undefined) {
      filtered = filtered.filter(f => f.amount >= searchValues.amountMin);
    }
    if (searchValues.amountMax !== undefined) {
      filtered = filtered.filter(f => f.amount <= searchValues.amountMax);
    }
    if (searchValues.dateRange?.[0] && searchValues.dateRange?.[1]) {
      const start = searchValues.dateRange[0];
      const end = searchValues.dateRange[1];
      filtered = filtered.filter(f => {
        const d = new Date(f.date);
        return d >= start.startOf('day').toDate() && d <= end.endOf('day').toDate();
      });
    }
    setFilteredData(filtered);
  };

  const handleReset = () => {
    setSearchValues({});
    setFilteredData(mockClaimFlows);
    setSelectedRow(null);
  };

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
    { title: '流水号', dataIndex: 'flowNo' },
    { title: '项目（子公司）', dataIndex: 'project' },
    { title: '金额', dataIndex: 'amount', render: (v) => formatCurrency(v) },
    { title: '发生时间', dataIndex: 'date' },
  ];

  return (
    <Modal forceRender
      title="选择流水"
      open={open}
      onCancel={onCancel}
      width={1100}
      onOk={() => {
        if (!selectedRows || selectedRows.length === 0) {
          message.warning('请至少选择一条流水');
          return;
        }
        onConfirm(selectedRows);
        handleReset();
        setSelectedRows([]);
      }}
      destroyOnHidden
    >
      <div className="mb-4">
        <Form layout="inline" className="gap-y-4">
          <Form.Item label="流水号">
            <Input 
              placeholder="流水号" 
              value={searchValues.flowNo} 
              onChange={e => setSearchValues({...searchValues, flowNo: e.target.value})} 
              allowClear 
              style={{ width: 150 }}
            />
          </Form.Item>
          <Form.Item label="项目（子公司）">
            <Input 
              placeholder="项目名称" 
              value={searchValues.project} 
              onChange={e => setSearchValues({...searchValues, project: e.target.value})} 
              allowClear 
              style={{ width: 160 }}
            />
          </Form.Item>
          <Form.Item label="金额范围">
            <Space orientation="horizontal">
              <InputNumber 
                placeholder="最小" 
                value={searchValues.amountMin} 
                onChange={val => setSearchValues({...searchValues, amountMin: val})} 
                style={{ width: 100 }}
              />
              <span>-</span>
              <InputNumber 
                placeholder="最大" 
                value={searchValues.amountMax} 
                onChange={val => setSearchValues({...searchValues, amountMax: val})} 
                style={{ width: 100 }}
              />
            </Space>
          </Form.Item>
          <Form.Item label="发生日期">
            <RangePicker 
              value={searchValues.dateRange} 
              onChange={val => setSearchValues({...searchValues, dateRange: val})} 
              style={{ width: 260 }}
            />
          </Form.Item>
          <Form.Item>
            <Space orientation="horizontal">
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </div>
      <Table
        rowSelection={{
          type: 'checkbox',
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

const ClaimFlowModal = ({ open, record, onCancel, onSuccess }) => {
  const [claimItems, setClaimItems] = useState([{ id: `init-${Date.now()}` }]);
  const [loading, setLoading] = useState(false);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);

  // Read-only info calculation
  const productInfoStr = record?.items?.map(item => `${item.name} / ${item.quantity} ${item.unit || '套'}`).join('，') || '无';
  const unclaimedAmount = record?.unclaimedAmount !== undefined ? record.unclaimedAmount : (record?.totalAmount || 0);
  const claimedAmount = (record?.totalAmount || 0) - unclaimedAmount;

  const currentUser = "管理员"; 
  const currentTime = new Date().toLocaleString();

  useEffect(() => {
    if (open) {
      setClaimItems([{ id: `open-${Date.now()}` }]);
    }
  }, [open]);

  const addRow = () => {
    setClaimItems([...claimItems, { id: `item-${Date.now()}-${Math.random()}` }]);
  };

  const removeRow = (id) => {
    if (claimItems.length <= 1) {
      message.warning('列表至少保留一行');
      return;
    }
    setClaimItems(claimItems.filter(item => item.id !== id));
  };

  const openSelectModal = (id) => {
    setCurrentRowId(id);
    setSelectModalVisible(true);
  };

  const handleFlowConfirm = (selectedFlows) => {
    if (!selectedFlows || selectedFlows.length === 0) return;
    
    let newItems = [...claimItems];
    const targetIdx = newItems.findIndex(i => i.id === currentRowId);
    
    if (targetIdx !== -1) {
      const firstFlow = selectedFlows[0];
      const defaultAmount1 = Math.min(unclaimedAmount, firstFlow.remainingAmount || 0);
      const defaultRate1 = firstFlow.amount ? (defaultAmount1 / firstFlow.amount) * 100 : 0;

      newItems[targetIdx] = {
        ...newItems[targetIdx],
        flowNo: firstFlow.flowNo,
        date: firstFlow.date,
        amount: firstFlow.amount || 0,
        counterparty: firstFlow.counterparty,
        summary: firstFlow.summary,
        project: firstFlow.project,
        claimedAmount: firstFlow.claimedAmount || 0,
        remainingAmount: firstFlow.remainingAmount || 0,
        claimAmount: defaultAmount1,
        claimRate: defaultRate1
      };

      for (let i = 1; i < selectedFlows.length; i++) {
        const flow = selectedFlows[i];
        const defaultAmount = Math.min(unclaimedAmount, flow.remainingAmount || 0);
        const defaultRate = flow.amount ? (defaultAmount / flow.amount) * 100 : 0;

        newItems.splice(targetIdx + i, 0, {
          id: `item-${Date.now()}-${i}`,
          flowNo: flow.flowNo,
          date: flow.date,
          amount: flow.amount || 0,
          counterparty: flow.counterparty,
          summary: flow.summary,
          project: flow.project,
          claimedAmount: flow.claimedAmount || 0,
          remainingAmount: flow.remainingAmount || 0,
          claimAmount: defaultAmount,
          claimRate: defaultRate
        });
      }
    }
    setClaimItems(newItems);
    setSelectModalVisible(false);
  };

  const handleRateChange = (rate, itemId) => {
    if (rate === null || rate === undefined) return;
    setClaimItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const claimAmount = (item.amount * rate) / 100;
        return { ...item, claimRate: rate, claimAmount };
      }
      return item;
    }));
  };

  const handleAmountChange = (val, itemId) => {
    if (val === null || val === undefined) return;
    setClaimItems(prev => prev.map(item => {
      if (item.id === itemId) {
        const claimRate = item.amount ? (val / item.amount) * 100 : 0;
        return { ...item, claimAmount: val, claimRate };
      }
      return item;
    }));
  };

  const totalClaimAmount = claimItems.reduce((acc, curr) => acc + (curr.claimAmount || 0), 0);
  const isOverLimit = totalClaimAmount > (record?.totalAmount || 0);

  const handleSubmit = async () => {
    if (isOverLimit) {
      message.error('认领总额超过订单金额，无法提交');
      return;
    }

    const hasIncomplete = claimItems.some(item => !item.flowNo || !item.claimAmount || item.claimAmount <= 0);
    if (hasIncomplete) {
      message.error('请填写完整的认领信息且金额必须大于0');
      return;
    }

    const hasExceededFlow = claimItems.some(item => item.claimAmount > item.remainingAmount);
    if (hasExceededFlow) {
      message.error('某行认领金额超过该流水待认领金额');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('认领记录提交成功，已触发财务审核流程');
      if (onSuccess) onSuccess();
      onCancel();
    }, 1000);
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      render: (_, __, idx) => idx + 1,
      width: 50,
      fixed: 'left',
    },
    {
      title: '流水号',
      dataIndex: 'flowNo',
      width: 180,
      fixed: 'left',
      render: (text, record) => (
        <Input 
          placeholder="点击选择流水" 
          value={text} 
          readOnly 
          onClick={() => openSelectModal(record.id)}
          className="cursor-pointer"
        />
      ),
    },
    {
      title: '项目（子公司）',
      dataIndex: 'project',
      width: 180,
      render: (text) => text || '-',
    },
    {
      title: '发生时间',
      dataIndex: 'date',
      width: 160,
    },
    {
      title: '交易金额',
      dataIndex: 'amount',
      width: 120,
      render: (val) => val ? formatCurrency(val) : '-',
    },
    {
      title: '流水已认领金额',
      dataIndex: 'claimedAmount',
      width: 130,
      render: (val) => val !== undefined ? formatCurrency(val) : '-',
    },
    {
      title: '流水待认领金额',
      dataIndex: 'remainingAmount',
      width: 130,
      render: (val) => val !== undefined ? formatCurrency(val) : '-',
    },
    {
      title: '本次认领比例',
      dataIndex: 'claimRate',
      width: 120,
      render: (_, record) => (
        <InputNumber
          min={0.0001}
          max={100}
          formatter={value => `${value}%`}
          parser={value => value.replace('%', '')}
          value={record.claimRate}
          onChange={(val) => handleRateChange(val, record.id)}
          className="w-full"
        />
      ),
    },
    {
      title: '本次认领金额',
      dataIndex: 'claimAmount',
      width: 150,
      render: (_, record) => (
        <InputNumber
          min={0.01}
          max={record.remainingAmount}
          style={{ width: '100%' }}
          formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={value => value.replace(/\¥\s?|(,*)/g, '')}
          value={record.claimAmount}
          onChange={(val) => handleAmountChange(val, record.id)}
        />
      ),
    },
    {
      title: '认领人',
      dataIndex: 'claimant',
      width: 100,
      render: () => currentUser,
    },
    {
      title: '认领时间',
      dataIndex: 'claimTime',
      width: 160,
      render: () => currentTime,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 200,
      render: (_, record) => (
        <Input 
          placeholder="手动输入补充说明" 
          value={record.remark} 
          onChange={(e) => setClaimItems(prev => prev.map(item => item.id === record.id ? { ...item, remark: e.target.value } : item))}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 60,
      fixed: 'right',
      render: (_, record) => (
        <Button 
          type="text" 
          danger 
          icon={<DeleteOutlined />} 
          onClick={() => removeRow(record.id)} 
        />
      ),
    },
  ];

  return (
    <>
      <Modal forceRender
        title="认领流水"
        open={open}
        onCancel={onCancel}
        width={1300}
        centered
        footer={[
          <Button key="cancel" onClick={onCancel}>取消</Button>,
          <Popconfirm
            key="submit-confirm"
            title="确认提交认领记录？"
            description="提交后将进入财务审核环节，无法再修改。"
            onConfirm={handleSubmit}
            okText="确定"
            cancelText="取消"
            disabled={isOverLimit}
          >
            <Button type="primary" loading={loading} disabled={isOverLimit}>提交</Button>
          </Popconfirm>
        ]}
      >
        <div className="space-y-6">
          {/* Info Section */}
          <div className="bg-gray-50 p-4 rounded-lg border">
            <Row gutter={[24, 16]}>
              <Col span={8}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">销售订单号</Text>
                  <Text strong>{record?.orderNo || '-'}</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">销售订单类型</Text>
                  <Text strong>{record?.type || '普通销售订单'}</Text>
                </Space>
              </Col>
              <Col span={8}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">订单时间</Text>
                  <Text strong>{record?.orderDate || '-'}</Text>
                </Space>
              </Col>
              <Col span={24}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">产品信息</Text>
                  <Text strong>{productInfoStr}</Text>
                </Space>
              </Col>
              <Col span={4}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">客户名称</Text>
                  <Text strong>{record?.customerName || '-'}</Text>
                </Space>
              </Col>
              <Col span={4}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">业务员</Text>
                  <Text strong>{record?.salesperson || '-'}</Text>
                </Space>
              </Col>
              <Col span={5}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">订单总额</Text>
                  <Text strong>{formatCurrency(record?.totalAmount)}</Text>
                </Space>
              </Col>
              <Col span={5}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">订单已认领金额</Text>
                  <Text strong type="success">{formatCurrency(claimedAmount)}</Text>
                </Space>
              </Col>
              <Col span={6}>
                <Space orientation="vertical" size={2}>
                  <Text type="secondary">订单未认领金额</Text>
                  <Text strong type="danger">{formatCurrency(unclaimedAmount)}</Text>
                </Space>
              </Col>
            </Row>
          </div>

          {/* Claim Section */}
          <div>
            <div className="flex justify-between items-center mb-2 px-1">
              <Text strong>认领列表</Text>
              <Button type="primary" ghost size="small" icon={<PlusOutlined />} onClick={addRow}>添加流水</Button>
            </div>
            <Table
              columns={columns}
              dataSource={claimItems}
              rowKey="id"
              pagination={false}
              size="small"
              scroll={{ x: 1800, y: 400 }}
              summary={() => (
                <Table.Summary fixed>
                  <Table.Summary.Row key="total-row">
                    <Table.Summary.Cell index={0} colSpan={8} align="right">
                      <Text strong>本次认领合计：</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1}>
                      <Text strong type={isOverLimit ? 'danger' : 'success'}>
                        {formatCurrency(totalClaimAmount)}
                      </Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2} colSpan={4}>
                      {isOverLimit && <Text type="danger" className="ml-2">认领总额超过订单金额，无法提交</Text>}
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              )}
              bordered
            />
          </div>
        </div>
      </Modal>

      <FlowSelectModal 
        open={selectModalVisible}
        onCancel={() => setSelectModalVisible(false)}
        onConfirm={handleFlowConfirm}
      />
    </>
  );
};

export default ClaimFlowModal;


