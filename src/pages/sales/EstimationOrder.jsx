import React, { useState, useMemo } from 'react';
import { Table, Card, Input, Button, Space, Tag, Modal, DatePicker, Select, Typography, message } from 'antd';
import { SearchOutlined, ReloadOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SyncOutlined } from '@ant-design/icons';
import { useMockData, mockData } from '../../mock/data';
import { formatCurrency } from '../../utils/helpers';
import EstimationFormModal from '../../components/estimation/EstimationFormModal';
import EstimationDetailDrawer from '../../components/estimation/EstimationDetailDrawer';

const { RangePicker } = DatePicker;
const { Text, Link } = Typography;

const EstimationOrder = () => {
  const [allData] = useMockData('estimations');
  const [employees] = useMockData('employees');
  const data = allData || [];
  const [searchText, setSearchText] = useState('');
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });

  const filteredData = useMemo(() => {
    return data.filter(item => 
      (item.orderNo || '').includes(searchText) || 
      (item.customerName || '').includes(searchText) || 
      (item.productName || '').includes(searchText)
    );
  }, [data, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确认删除该预估单吗？删除后不可恢复。',
      onOk: () => {
        mockData.remove('estimations', id);
        message.success('删除成功');
      }
    });
  };

  const handleConvertToQuote = (record) => {
    Modal.confirm({
      title: '转报价单确认',
      content: `确认将预估单 [${record.orderNo}] 转为正式报价单吗？转换后不可撤销。`,
      onOk: () => {
        mockData.upsert('estimations', { ...record, status: '已转报价单', relQuoteNo: `BJ${Date.now().toString().slice(-8)}` });
        message.success('转化成功，已转为正式报价单');
      }
    });
  };

  const handleSave = (values) => {
    if (formModal.data) {
      mockData.upsert('estimations', { ...formModal.data, ...values });
      message.success('预估单更新成功');
    } else {
      const newEstimation = {
        ...values,
        id: `est_${Date.now()}`,
        orderNo: `YJ20250426${Math.floor(Math.random() * 9000 + 1000)}`,
        status: '草稿'
      };
      mockData.upsert('estimations', newEstimation);
      message.success('新增预估单成功');
    }
    setFormModal({ open: false, data: null });
  };

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60, fixed: 'left' },
    { title: '预估单号', dataIndex: 'orderNo', key: 'orderNo', width: 160, render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, data: record })}>{text}</Link> },
    { title: '客户名称', dataIndex: 'customerName', key: 'customerName', width: 140 },
    { title: '产品', dataIndex: 'productName', key: 'productName', width: 150 },
    { 
      title: '定制尺寸', 
      key: 'customSize', 
      width: 160,
      render: (_, r) => `${r.customSize.length}×${r.customSize.width}×${r.customSize.height}mm`
    },
    { title: '标准价格', dataIndex: 'basePrice', key: 'basePrice', width: 120, align: 'right', render: v => formatCurrency(v) },
    { title: '尺寸加价', dataIndex: 'sizeAddon', key: 'sizeAddon', width: 120, align: 'right', render: v => formatCurrency(v) },
    { title: '系数', dataIndex: 'coefficient', key: 'coefficient', width: 80, align: 'center' },
    { 
      title: '预估总额', 
      dataIndex: 'totalAmount', 
      key: 'totalAmount', 
      width: 130, 
      align: 'right',
      render: (v) => <Text strong className="text-red-500">{formatCurrency(v)}</Text>
    },
    { title: '预估日期', dataIndex: 'estimationDate', key: 'estimationDate', width: 110 },
    { title: '业务员', dataIndex: 'salesman', key: 'salesman', width: 100 },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status', 
      width: 120,
      render: (status) => (
        <Tag color={status === '已转报价单' ? 'green' : 'blue'}>{status}</Tag>
      )
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === '草稿' && (
            <>
              <Button type="link" size="small" icon={<EditOutlined />} onClick={() => setFormModal({ open: true, data: record })}>编辑</Button>
              <Button type="link" size="small" icon={<SyncOutlined />} onClick={() => handleConvertToQuote(record)}>转报价单</Button>
              <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>删除</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="p-4 space-y-4">
      <Card size="small" className="shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <Space wrap>
            <Space align="center" size={4}>
              <Text>关键字:</Text>
              <Input 
                placeholder="预估单号/客户/产品" 
                prefix={<SearchOutlined />} 
                style={{ width: 250 }} 
                value={searchText}
                onChange={e => setSearchText(e.target.value)}
              />
            </Space>
            <Space align="center" size={4}>
              <Text>预估日期:</Text>
              <RangePicker style={{ width: 250 }} />
            </Space>
            <Space align="center" size={4}>
              <Text>状态:</Text>
              <Select placeholder="状态" allowClear style={{ width: 120 }}>
                <Select.Option value="草稿">草稿</Select.Option>
                <Select.Option value="已转报价单">已转报价单</Select.Option>
              </Select>
            </Space>
            <Space align="center" size={4}>
              <Text>业务员:</Text>
              <Select placeholder="业务员" showSearch allowClear style={{ width: 120 }}>
                {employees.map(e => <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>)}
              </Select>
            </Space>
            <Button type="primary" icon={<SearchOutlined />}>查询</Button>
            <Button icon={<ReloadOutlined />} onClick={() => setSearchText('')}>重置</Button>
          </Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, data: null })}>新增预估</Button>
        </div>

        <Table 
          columns={columns} 
          dataSource={filteredData} 
          rowKey="id" 
          size="small" 
          scroll={{ x: 1500 }}
          pagination={{ showSizeChanger: true }}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.target.closest('button') || e.target.closest('a')) return;
              setDetailDrawer({ open: true, data: record });
            },
            className: 'cursor-pointer'
          })}
        />
      </Card>

      <EstimationFormModal
        open={formModal.open}
        initialValues={formModal.data}
        onCancel={() => setFormModal({ open: false, data: null })}
        onSave={handleSave}
      />

      <EstimationDetailDrawer
        open={detailDrawer.open}
        data={detailDrawer.data}
        onClose={() => setDetailDrawer({ open: false, data: null })}
      />
    </div>
  );
};

export default EstimationOrder;
