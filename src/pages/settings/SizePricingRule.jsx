import React, { useState, useMemo } from 'react';
import { Table, Card, Input, Button, Space, Tag, Switch, Modal, message, Typography } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useMockData, mockData } from '../../mock/data';
import SizeRuleFormModal from '../../components/settings/SizeRuleFormModal';
import SizeRuleDetailDrawer from '../../components/settings/SizeRuleDetailDrawer';

const { Text } = Typography;

const SizePricingRule = () => {
  const [rules] = useMockData('sizeRules');
  const [searchText, setSearchText] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });

  const filteredRules = useMemo(() => {
    return (rules || []).filter(r => 
      (r.productCode && r.productCode.includes(searchText)) || 
      (r.productName && r.productName.includes(searchText))
    );
  }, [rules, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除该规则吗？删除后不可恢复。',
      onOk: () => {
        mockData.remove('sizeRules', id);
        message.success('删除成功');
      }
    });
  };

  const handleToggleActive = (record, checked) => {
    mockData.upsert('sizeRules', { ...record, isActive: checked });
    message.success(checked ? '已启用' : '已禁用');
  };

  const handleSave = (values) => {
    if (editingRule) {
      mockData.upsert('sizeRules', { ...editingRule, ...values, status: '审批通过' });
      message.success('编辑成功');
    } else {
      const newRule = {
        ...values,
        id: `rule_sr_${Date.now()}`,
        productCode: 'NEW_P',
        productName: '新产品',
        productSpec: '尺寸待定',
        baseSize: values.baseSize || { length: values.lengthStep.base, width: values.widthStep.base, height: values.heightStep.base },
        status: '审批通过',
        isActive: true
      };
      mockData.upsert('sizeRules', newRule);
      message.success('新增成功');
    }
    setIsModalOpen(false);
    setEditingRule(null);
  };

  const formatSteps = (stepConfig) => {
    if (!stepConfig.enabled || !stepConfig.steps || stepConfig.steps.length === 0) return '未启用';
    return stepConfig.steps.map(s => `${s.start}-${s.end === 999999 ? '∞' : s.end}:${s.price}`).join(', ');
  };

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60, fixed: 'left' },
    { title: '产品编码', dataIndex: 'productCode', key: 'productCode', width: 120 },
    { title: '产品名称', dataIndex: 'productName', key: 'productName', width: 150 },
    { title: '产品规格', dataIndex: 'productSpec', key: 'productSpec', width: 120 },
    { 
      title: '基准尺寸', 
      key: 'baseSize', 
      width: 150,
      render: (_, r) => `${r.baseSize.length}×${r.baseSize.width}×${r.baseSize.height}`
    },
    { title: '长度阶梯', key: 'lengthStep', width: 220, render: (_, r) => formatSteps(r.lengthStep) },
    { title: '宽度阶梯', key: 'widthStep', width: 220, render: (_, r) => formatSteps(r.widthStep) },
    { title: '高度阶梯', key: 'heightStep', width: 220, render: (_, r) => formatSteps(r.heightStep) },
    { title: '默认系数', dataIndex: 'coefficient', key: 'coefficient', width: 80, align: 'center' },
    { 
      title: '启用状态', 
      dataIndex: 'isActive', 
      key: 'isActive', 
      width: 100,
      render: (active, record) => (
        <Switch checked={active} onChange={(checked) => handleToggleActive(record, checked)} />
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => setDetailDrawer({ open: true, data: record })} />
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => { setEditingRule(record); setIsModalOpen(true); }} />
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)} />
        </Space>
      )
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <Card size="small" className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Space>
            <Input 
              placeholder="产品编码/名称" 
              prefix={<SearchOutlined />} 
              style={{ width: 250 }} 
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
            />
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => setSearchText('')}>重置</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>新增规则</Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredRules} 
          rowKey="id" 
          size="small" 
          scroll={{ x: 1600 }}
          pagination={{ showSizeChanger: true }}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.ant-switch')) return;
              setDetailDrawer({ open: true, data: record });
            },
            className: 'cursor-pointer'
          })}
        />
      </Card>

      <SizeRuleFormModal
        open={isModalOpen}
        initialValues={editingRule}
        onCancel={() => { setIsModalOpen(false); setEditingRule(null); }}
        onSave={handleSave}
      />

      <SizeRuleDetailDrawer
        open={detailDrawer.open}
        data={detailDrawer.data}
        onClose={() => setDetailDrawer({ open: false, data: null })}
      />
    </div>
  );
};

export default SizePricingRule;
