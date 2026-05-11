
import React, { useState, useMemo } from 'react';
import { Table, Card, Form, Input, Select, Button, Space, Tag, Row, Col, Statistic, Typography, message, Tabs } from 'antd';
import { SearchOutlined, ReloadOutlined, DatabaseOutlined, AlertOutlined, SafetyOutlined, DollarOutlined } from '@ant-design/icons';
import { mockStockLedger } from '../../mock';
import MaterialStockDetailDrawer from '../../components/inventory/MaterialStockDetailDrawer';
import { formatCurrency } from '../../utils/helpers';

const { Option } = Select;
const { Link, Text } = Typography;

const MaterialStockLedger = () => {
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('生产物料');
  const [data, setData] = useState(mockStockLedger);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedMaterialCode, setSelectedMaterialCode] = useState(null);

  // Filtered data based on active tab and search
  const filteredData = useMemo(() => {
    return data.filter(item => item.materialCategory === activeTab);
  }, [data, activeTab]);

  // Statistics Calculation (Summarizing all materials)
  const stats = useMemo(() => {
    const allData = mockStockLedger;
    const uniqueMaterials = new Set(allData.map(item => item.materialCode)).size;
    const totalQty = allData.reduce((sum, item) => sum + item.currentQty, 0);
    const totalAmount = allData.reduce((sum, item) => sum + (item.currentQty * (item.standardPrice || 0)), 0);
    const lowStockCount = allData.filter(item => item.currentQty < item.safeQty && item.currentQty > 0).length;
    
    return { uniqueMaterials, totalQty, totalAmount, lowStockCount };
  }, []);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...mockStockLedger];

    if (values.materialCode) {
      filtered = filtered.filter(item => item.materialCode.toLowerCase().includes(values.materialCode.toLowerCase()));
    }
    if (values.materialName) {
      filtered = filtered.filter(item => item.materialName.includes(values.materialName));
    }
    if (values.category && values.category !== '全部') {
      filtered = filtered.filter(item => item.category === values.category);
    }

    setData(filtered);
    message.success('查询成功');
  };

  const handleReset = () => {
    form.resetFields();
    setData(mockStockLedger);
  };

  const showDetail = (code) => {
    setSelectedMaterialCode(code);
    setDetailOpen(true);
  };

  // 生产物料 Columns
  const productionColumns = [
    {
      title: '序号',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      width: 120,
      render: (text) => <Link onClick={() => showDetail(text)}>{text}</Link>
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '规格型号',
      dataIndex: 'spec',
      width: 150,
      ellipsis: true,
    },
    {
      title: '单位',
      dataIndex: 'unit',
      width: 80,
    },
    {
      title: '物料分类',
      dataIndex: 'category',
      width: 100,
      render: (cat, record) => {
        const config = {
          '原料': 'orange',
          '原材料': 'orange',
          '半成品': 'blue',
          '成品': 'green',
          '五金': 'purple'
        };
        return <Tag color={config[cat] || 'default'}>{cat}</Tag>;
      },
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      width: 140,
      render: (text) => text || '-',
    },
    {
      title: '当前库存',
      dataIndex: 'currentQty',
      width: 100,
      align: 'right',
      render: (val) => (
        <Text strong>
          {val}
        </Text>
      )
    },
    {
      title: '最近盘点日期',
      dataIndex: 'lastCheckDate',
      width: 120,
    },
  ];

  // 低值易耗品 Columns
  const lowValueColumns = [
    {
      title: '序号',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      width: 120,
      render: (text) => <Link onClick={() => showDetail(text)}>{text}</Link>
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '规格型号',
      dataIndex: 'spec',
      width: 150,
      ellipsis: true,
    },
    {
      title: '计量单位',
      dataIndex: 'unit',
      width: 100,
    },
    {
      title: '库存数量',
      dataIndex: 'currentQty',
      width: 100,
      align: 'right',
      render: (val) => <Text strong>{val}</Text>
    },
    {
      title: '最近盘点日期',
      dataIndex: 'lastCheckDate',
      width: 120,
    },
  ];

  // 固定资产 Columns
  const assetColumns = [
    {
      title: '序号',
      width: 60,
      render: (_, __, index) => index + 1,
    },
    {
      title: '物料编码',
      dataIndex: 'materialCode',
      width: 120,
      render: (text) => <Link onClick={() => showDetail(text)}>{text}</Link>
    },
    {
      title: '资产编码',
      dataIndex: 'assetCode',
      width: 120,
    },
    {
      title: '物料名称',
      dataIndex: 'materialName',
      width: 150,
      ellipsis: true,
    },
    {
      title: '规格型号',
      dataIndex: 'spec',
      width: 150,
      ellipsis: true,
    },
    {
      title: '使用部门',
      dataIndex: 'department',
      width: 120,
      render: (text) => text || '-',
    },
    {
      title: '使用人',
      dataIndex: 'user',
      width: 100,
      render: (text) => text || '-',
    },
    {
      title: '最近盘点日期',
      dataIndex: 'lastCheckDate',
      width: 120,
    },
  ];

  const getColumns = () => {
    switch (activeTab) {
      case '低值易耗品': return lowValueColumns;
      case '固定资产': return assetColumns;
      case '生产物料':
      default:
        return productionColumns;
    }
  };

  const items = [
    { key: '生产物料', label: '生产物料' },
    { key: '低值易耗品', label: '低值易耗品' },
    { key: '固定资产', label: '固定资产' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless" className="bg-blue-50 border-blue-200">
            <Statistic 
              title={<span className="text-blue-700">物料种类数</span>} 
              value={stats.uniqueMaterials} 
              prefix={<DatabaseOutlined className="text-blue-500" />}
              styles={{ content: { color: '#1d4ed8' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-green-50 border-green-200">
            <Statistic 
              title={<span className="text-green-700">库存总量</span>} 
              value={stats.totalQty} 
              prefix={<SafetyOutlined className="text-green-500" />}
              styles={{ content: { color: '#15803d' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-teal-50 border-teal-200">
            <Statistic 
              title={<span className="text-teal-700">库存总金额</span>} 
              value={stats.totalAmount} 
              precision={2}
              prefix={<DollarOutlined className="text-teal-500" />}
              styles={{ content: { color: '#0f766e' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-orange-50 border-orange-200">
            <Statistic 
              title={<span className="text-orange-700">低库存物料数</span>} 
              value={stats.lowStockCount} 
              prefix={<AlertOutlined className="text-orange-500" />}
              styles={{ content: { color: '#c2410c' } }}
            />
          </Card>
        </Col>
      </Row>

      {/* Tabs at Category Level */}
      <div className="bg-white rounded-t-lg px-4 pt-2 shadow-sm border-b">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          items={items}
        />
      </div>

      {/* Search Area */}
      <Card size="small" className="rounded-none border-x-0 border-y shadow-none">
        <Form form={form} layout="inline">
          <Form.Item name="materialCode" label="物料编码">
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          <Form.Item name="materialName" label="物料名称">
            <Input placeholder="请输入" allowClear />
          </Form.Item>
          {activeTab === '生产物料' && (
            <>
              <Form.Item name="category" label="物料分类" initialValue="全部">
                <Select style={{ width: 120 }}>
                  <Option value="全部">全部</Option>
                  <Option value="原材料">原材料</Option>
                  <Option value="半成品">半成品</Option>
                  <Option value="成品">成品</Option>
                </Select>
              </Form.Item>
            </>
          )}
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* Table Area */}
      <div className="bg-white rounded-b-lg p-2 shadow-sm">
        <Table
          size="small"
          columns={getColumns()}
          dataSource={filteredData}
          rowKey={(record) => `${record.materialCode}-${record.warehouse || ''}-${record.location || ''}-${record.batchNo || ''}`}
          scroll={{ x: activeTab === '生产物料' ? 1200 : 800 }}
          onRow={(record) => ({
            onClick: () => showDetail(record.materialCode),
            className: 'cursor-pointer'
          })}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            total: filteredData.length,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </div>

      <MaterialStockDetailDrawer 
        open={detailOpen} 
        onClose={() => setDetailOpen(false)} 
        materialCode={selectedMaterialCode} 
      />
    </div>
  );
};

export default MaterialStockLedger;
