import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Table, 
  Input, 
  InputNumber, 
  Button, 
  Space, 
  Typography, 
  Descriptions,
  message,
  Popconfirm,
  DatePicker,
  Form
} from 'antd';
import { DeleteOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockClaimFlows } from '../../../mock/claimFlowMock';
import { formatCurrency } from '../../../utils/helpers';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

// --- Flow Selection Modal (Multi-Select) ---
const FlowSelectModal = ({ open, onCancel, onConfirm }) => {
  const [form] = Form.useForm();
  const [filteredData, setFilteredData] = useState(mockClaimFlows);
  const [selectedRows, setSelectedRows] = useState([]);

  const handleSearch = (values) => {
    let filtered = [...mockClaimFlows];
    if (values.flowNo) {
      filtered = filtered.filter(f => f.flowNo.includes(values.flowNo));
    }
    if (values.project) {
      filtered = filtered.filter(f => f.project.includes(values.project));
    }
    if (values.amountMin !== undefined && values.amountMin !== null) {
      filtered = filtered.filter(f => f.amount >= values.amountMin);
    }
    if (values.amountMax !== undefined && values.amountMax !== null) {
      filtered = filtered.filter(f => f.amount <= values.amountMax);
    }
    if (values.dateRange && values.dateRange.length === 2) {
      const start = values.dateRange[0];
      const end = values.dateRange[1];
      filtered = filtered.filter(f => {
        const d = new Date(f.date);
        return d >= start.startOf('day').toDate() && d <= end.endOf('day').toDate();
      });
    }
    setFilteredData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setFilteredData(mockClaimFlows);
  };

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
    { title: '流水号', dataIndex: 'flowNo' },
    { title: '金额', dataIndex: 'amount', render: (v) => formatCurrency(v) },
    { title: '发生日期', dataIndex: 'date' },
    { title: '项目（子公司）', dataIndex: 'project' },
  ];

  return (
    <Modal
      title="选择流水"
      open={open}
      onCancel={onCancel}
      width={900}
      okText="去认领"
      onOk={() => {
        if (!selectedRows || selectedRows.length === 0) {
          message.warning('请至少选择一条流水');
          return;
        }
        onConfirm(selectedRows);
        handleReset();
        setSelectedRows([]);
      }}
      
      forceRender
    >
      <div className="mb-4">
        <Form form={form} layout="inline" className="gap-y-4" onFinish={handleSearch}>
          <Form.Item name="flowNo" label="流水号">
            <Input placeholder="流水号" allowClear style={{ width: 150 }} />
          </Form.Item>
          <Form.Item label="金额范围">
            <Space orientation="horizontal">
              <Form.Item name="amountMin" noStyle>
                <InputNumber placeholder="最小" style={{ width: 100 }} />
              </Form.Item>
              <span>-</span>
              <Form.Item name="amountMax" noStyle>
                <InputNumber placeholder="最大" style={{ width: 100 }} />
              </Form.Item>
            </Space>
          </Form.Item>
          <Form.Item name="dateRange" label="发生日期">
            <RangePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item>
            <Space orientation="horizontal">
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
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

// --- Trustee Claim Modal Component ---
const TrusteeClaimFlowModal = ({ open, record, onCancel, onSuccess }) => {
  const [claimItems, setClaimItems] = useState([
    { id: `init-${Date.now()}` }
  ]);
  const [loading, setLoading] = useState(false);
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [currentRowId, setCurrentRowId] = useState(null);

  const currentUser = "管理员"; 
  const currentTime = dayjs().format('YYYY-MM-DD HH:mm:ss');

  useEffect(() => {
    if (open) {
      setClaimItems([{ id: `open-${Date.now()}` }]);
    }
  }, [open]);

  // Extract info from record
  const customerName = record?.customerName || '-';
  const quotationNo = record?.quotationNo || '-';
  const expectDeliveryDate = record?.expectDeliveryDate || '-';
  const salesperson = record?.salesperson || '-';
  const productionRemark = record?.summary || '-'; // Assuming 'summary' is production remark
  const customerRemark = record?.remark || '-'; // Assuming 'remark' is customer remark
  const materialsNames = record?.materials?.map(m => m.materialName).join(', ') || '-';
  const processNames = record?.items?.map(i => i.processName || i.productName).join(', ') || '-';

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
    // If selecting multiple, we replace the currentRowId with the first one, and append the rest
    if (selectedFlows.length === 0) return;
    
    let newItems = [...claimItems];
    const targetIdx = newItems.findIndex(i => i.id === currentRowId);
    
    if (targetIdx !== -1) {
      // replace the placeholder
      const firstFlow = selectedFlows[0];
      newItems[targetIdx] = {
        ...newItems[targetIdx],
        flowNo: firstFlow.flowNo,
        date: firstFlow.date,
        amount: firstFlow.amount || 0,
        claimedAmount: firstFlow.claimedAmount || 0, // 流水已认领金额, 假设0或取值
        project: firstFlow.project,
        ratio: 100, // 本次认领比例 默认100%
        claimAmount: (firstFlow.amount || 0) * 1, // 本次认领金额
        claimer: currentUser,
        claimTime: currentTime,
        remark: ''
      };

      // if multiple, insert the rest after
      for (let i = 1; i < selectedFlows.length; i++) {
        const flow = selectedFlows[i];
        newItems.splice(targetIdx + i, 0, {
          id: `item-${Date.now()}-${i}`,
          flowNo: flow.flowNo,
          date: flow.date,
          amount: flow.amount || 0,
          claimedAmount: flow.claimedAmount || 0,
          project: flow.project,
          ratio: 100,
          claimAmount: (flow.amount || 0) * 1,
          claimer: currentUser,
          claimTime: currentTime,
          remark: ''
        });
      }
    }
    setClaimItems(newItems);
    setSelectModalVisible(false);
  };

  // When ratio changes, update claim amount
  const handleRatioChange = (val, id) => {
    const ratio = typeof val === 'number' ? val : 0;
    setClaimItems(prev => prev.map(item => {
      if (item.id === id) {
        const unClaimed = (item.amount || 0) - (item.claimedAmount || 0);
        return {
          ...item,
          ratio,
          claimAmount: Number(((unClaimed * ratio) / 100).toFixed(2))
        };
      }
      return item;
    }));
  };

  // When claim amount changes, update ratio
  const handleAmountChange = (val, id) => {
    const amount = typeof val === 'number' ? val : 0;
    setClaimItems(prev => prev.map(item => {
      if (item.id === id) {
        const unClaimed = (item.amount || 0) - (item.claimedAmount || 0);
        return {
          ...item,
          claimAmount: amount,
          ratio: unClaimed > 0 ? Number(((amount / unClaimed) * 100).toFixed(2)) : 0
        };
      }
      return item;
    }));
  };

  const handleRemarkChange = (e, id) => {
    const text = e.target.value;
    setClaimItems(prev => prev.map(item => item.id === id ? { ...item, remark: text } : item));
  };
  
  const handleAddBlankRow = () => {
      setClaimItems([...claimItems, { id: `item-blank-${Date.now()}` }]);
  }

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60, fixed: 'left' },
    { 
      title: '流水号', 
      dataIndex: 'flowNo', 
      width: 150, 
      fixed: 'left',
      render: (text, row) => (
        <Input 
          readOnly 
          placeholder="点击选择流水"
          value={text}
          onClick={() => openSelectModal(row.id)}
          className="cursor-pointer bg-gray-50"
        />
      )
    },
    { title: '项目（子公司）', dataIndex: 'project', width: 120, render: t => t || '-' },
    { title: '发生时间', dataIndex: 'date', width: 120, render: t => t || '-' },
    { title: '交易金额', dataIndex: 'amount', width: 120, render: t => (t ? formatCurrency(t) : '-') },
    { title: '流水已认领金额', dataIndex: 'claimedAmount', width: 120, render: t => (t ? formatCurrency(t) : '-') },
    { 
      title: '本次认领比例(%)', 
      dataIndex: 'ratio', 
      width: 120,
      render: (val, row) => (
        <InputNumber 
          min={0} max={100} 
          value={val} 
          disabled={!row.flowNo}
          onChange={v => handleRatioChange(v, row.id)} 
          style={{ width: '100%' }}
        />
      ) 
    },
    { 
      title: '本次认领金额', 
      dataIndex: 'claimAmount', 
      width: 120,
      render: (val, row) => (
        <InputNumber 
          min={0} 
          value={val} 
          disabled={!row.flowNo}
          onChange={v => handleAmountChange(v, row.id)} 
          style={{ width: '100%' }}
        />
      ) 
    },
    { title: '认领人', dataIndex: 'claimer', width: 100, render: t => t || currentUser },
    { title: '认领时间', dataIndex: 'claimTime', width: 150, render: t => t || currentTime },
    { 
      title: '备注', 
      dataIndex: 'remark', 
      width: 150,
      render: (val, row) => (
        <Input 
          value={val} 
          disabled={!row.flowNo}
          onChange={(e) => handleRemarkChange(e, row.id)} 
        />
      ) 
    },
    {
      title: '操作',
      width: 80,
      fixed: 'right',
      render: (_, row) => (
        <Popconfirm title="确定删除此行？" onConfirm={() => removeRow(row.id)}>
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      )
    }
  ];

  const handleOk = () => {
    // 校验
    const validItems = claimItems.filter(i => i.flowNo);
    if (validItems.length === 0) {
      message.warning('请至少认领一条流水记录');
      return;
    }
    const hasZeroAmount = validItems.some(i => !i.claimAmount || i.claimAmount <= 0);
    if (hasZeroAmount) {
      message.warning('本次认领金额必填且不能为0');
      return;
    }
    
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      message.success('认领提交成功');
      console.log('提交的数据: ', validItems);
      if (onSuccess) onSuccess(validItems);
      onCancel();
    }, 600);
  };

  return (
    <>
      <Modal
        title="认领流水"
        open={open}
        onCancel={onCancel}
        width={1200}
        onOk={handleOk}
        confirmLoading={loading}
        
      >
        <div style={{ marginBottom: 16 }}>
          <Descriptions bordered size="small" column={3} className="bg-gray-50">
            <Descriptions.Item label="客户名称">{customerName}</Descriptions.Item>
            <Descriptions.Item label="来源报价单">{quotationNo}</Descriptions.Item>
            <Descriptions.Item label="期望发货日期">{expectDeliveryDate}</Descriptions.Item>
            <Descriptions.Item label="业务员">{salesperson}</Descriptions.Item>
            <Descriptions.Item label="生产备注">{productionRemark}</Descriptions.Item>
            <Descriptions.Item label="客户备注">{customerRemark}</Descriptions.Item>
            <Descriptions.Item label="客户来料物料名称" span={3}>{materialsNames}</Descriptions.Item>
            <Descriptions.Item label="加工产品名称" span={3}>{processNames}</Descriptions.Item>
          </Descriptions>
        </div>

        <div>
          <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text strong>认领流水列表</Text>
            <Button type="dashed" size="small" onClick={handleAddBlankRow}>新增一行</Button>
          </div>
          <Table 
            columns={columns} 
            dataSource={claimItems} 
            rowKey="id" 
            pagination={false} 
            size="small"
            scroll={{ x: 1300, y: 300 }}
          />
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

export default TrusteeClaimFlowModal;
