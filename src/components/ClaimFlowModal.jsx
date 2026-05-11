import React, { useState } from 'react';
import { 
  Modal, 
  Table, 
  Form, 
  Input, 
  InputNumber, 
  DatePicker, 
  Space, 
  Button,
  message,
  Typography,
  Divider
} from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { mockClaimFlows } from '../mock/claimFlowMock';
import { formatCurrency } from '../utils/helpers';

const { RangePicker } = DatePicker;
const { Text } = Typography;

// --- Flow Selection Modal Component ---
const FlowSelectModal = ({ open, onCancel, onConfirm }) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(mockClaimFlows);
  const [selectedRow, setSelectedRow] = useState(null);

  const handleSearch = (values) => {
    let filtered = [...mockClaimFlows];
    if (values.flowNo) {
      filtered = filtered.filter(f => f.flowNo.includes(values.flowNo));
    }
    if (values.project) {
      filtered = filtered.filter(f => f.project.includes(values.project));
    }
    if (values.amountMin !== undefined) {
      filtered = filtered.filter(f => f.amount >= values.amountMin);
    }
    if (values.amountMax !== undefined) {
      filtered = filtered.filter(f => f.amount <= values.amountMax);
    }
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(f => {
        const d = new Date(f.date);
        return d >= start.startOf('day').toDate() && d <= end.endOf('day').toDate();
      });
    }
    setData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setData(mockClaimFlows);
    setSelectedRow(null);
  };

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
    { title: '流水号', dataIndex: 'flowNo' },
    { title: '项目（子公司）', dataIndex: 'project' },
    { title: '金额', dataIndex: 'amount', render: (v) => formatCurrency(v) },
    { title: '发生时间', dataIndex: 'date' },
  ];

  const rowSelection = {
    type: 'radio',
    onChange: (_, selectedRows) => {
      setSelectedRow(selectedRows[0]);
    },
  };

  return (
    <Modal
      title="选择流水"
      open={open}
      onCancel={onCancel}
      width={1000}
      onOk={() => {
        if (!selectedRow) {
          message.warning('请选择一条流水');
          return;
        }
        onConfirm(selectedRow);
        handleReset();
      }}
      
      forceRender
    >
      <Form form={form} layout="inline" className="mb-4 gap-y-2" onFinish={handleSearch}>
        <Form.Item name="flowNo" label="流水号">
          <Input placeholder="流水号" allowClear />
        </Form.Item>
        <Form.Item name="project" label="项目（子公司）">
          <Input placeholder="项目名称" allowClear />
        </Form.Item>
        <Form.Item label="金额范围">
          <Space>
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
          <Space>
            <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
          </Space>
        </Form.Item>
      </Form>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={data}
        rowKey="id"
        size="small"
        pagination={{ pageSize: 5 }}
      />
    </Modal>
  );
};

// --- Main Claim Modal Component ---
const ClaimFlowModal = ({ open, record, order, onCancel, onClose, onSuccess }) => {
  const activeRecord = record || order;

  const handleClose = () => {
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const handleSelectConfirm = (selectedFlow) => {
    Modal.confirm({
      title: '确认认领该流水？',
      content: (
        <div>
          <p>您正在为订单 <Text strong>{activeRecord?.orderNo}</Text> 认领以下流水：</p>
          <Divider style={{ margin: '12px 0' }} />
          <p>流水号：<Text strong>{selectedFlow.flowNo}</Text></p>
          <p>项目：<Text strong>{selectedFlow.project}</Text></p>
          <p>发生时间：<Text strong>{selectedFlow.date}</Text></p>
          <p>认领金额：<Text strong type="danger">{formatCurrency(selectedFlow.amount)}</Text></p>
        </div>
      ),
      okText: '确认认领',
      cancelText: '取消',
      onOk: () => {
        message.success('认领流水成功');
        if (onSuccess) onSuccess([selectedFlow]);
        handleClose();
      }
    });
  };

  return (
    <FlowSelectModal
      open={open}
      onCancel={handleClose}
      onConfirm={handleSelectConfirm}
    />
  );
};

export default ClaimFlowModal;

