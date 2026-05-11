
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Card, Table, Button, Input, Select, Space, Row, Col, Form,
  Switch, Tag, Popconfirm, message, Typography, Breadcrumb, Divider
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, ReloadOutlined, 
  EditOutlined, DeleteOutlined
} from '@ant-design/icons';
import { warehouseService, subsidiaries } from '../../mock/warehouseMock';
import WarehouseFormModal from '../../components/warehouse/WarehouseFormModal';
import WarehouseDetailDrawer from '../../components/warehouse/WarehouseDetailDrawer';

const { Title, Text } = Typography;

const WarehouseList = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [displayData, setDisplayData] = useState(null);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  useEffect(() => {
    fetchData();
  }, [pagination.current, pagination.pageSize]);

  const fetchData = () => {
    setLoading(true);
    // Simulated fetch
    setTimeout(() => {
      const warehouses = warehouseService.getWarehouses();
      setData(warehouses);
      setPagination(prev => ({ ...prev, total: warehouses.length }));
      setLoading(false);
    }, 500);
  };

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = warehouseService.getWarehouses();
    
    if (values.name) {
      filtered = filtered.filter(w => w.name.includes(values.name));
    }
    if (values.type) {
      filtered = filtered.filter(w => w.type === values.type);
    }
    if (values.code) {
      filtered = filtered.filter(w => w.code.includes(values.code));
    }
    if (values.subsidiaryId) {
      filtered = filtered.filter(w => w.subsidiaryId === values.subsidiaryId);
    }

    setDisplayData(filtered);
    setPagination(prev => ({ ...prev, total: filtered.length, current: 1 }));
    message.success('查询成功');
  };

  const handleReset = () => {
    form.resetFields();
    setDisplayData(null);
    setPagination(prev => ({ ...prev, current: 1 }));
  };

  const currentData = useMemo(() => {
    const baseData = displayData || data;
    const startIndex = (pagination.current - 1) * pagination.pageSize;
    return baseData.slice(startIndex, startIndex + pagination.pageSize);
  }, [displayData, data, pagination.current, pagination.pageSize]);

  const handleStatusChange = (record, checked) => {
    Modal.confirm({
      title: '确认切换状态',
      content: checked ? '是否启用该仓库？' : '禁用后该仓库将无法进行出入库操作，确认禁用？',
      onOk: () => {
        warehouseService.saveWarehouse({ ...record, enabled: checked });
        message.success(`${checked ? '启用' : '禁用'}成功`);
        fetchData();
      }
    });
  };

  const handleDelete = (record) => {
    const success = warehouseService.deleteWarehouse(record.id);
    if (success) {
      message.success('删除成功');
      fetchData();
    } else {
      message.error('该仓库存在出入库记录，无法删除');
    }
  };

  const columns = [
    {
      title: '序号',
      width: 60,
      align: 'center',
      render: (_, __, i) => (pagination.current - 1) * pagination.pageSize + i + 1,
    },
    {
      title: '仓库编码',
      dataIndex: 'code',
      width: 150,
      render: (text, record) => (
        <Button 
          type="link" 
          onClick={() => { setDetailData(record); setDrawerOpen(true); }}
          className="p-0 h-auto"
        >
          {text}
        </Button>
      )
    },
    { title: '仓库名称', dataIndex: 'name', width: 180 },
    { 
      title: '仓库类型', 
      dataIndex: 'type', 
      width: 110,
      render: (type) => <Tag color={type === '实体仓库' ? 'blue' : 'purple'}>{type}</Tag>
    },
    { title: '所属子公司', dataIndex: 'subsidiaryName', width: 180 },
    { title: '仓库位置', dataIndex: 'location', ellipsis: true },
    { title: '仓管员', dataIndex: 'managerName', width: 100 },
    {
      title: '启用/禁用',
      dataIndex: 'enabled',
      width: 100,
      align: 'center',
      render: (enabled, record) => (
        <Switch 
          checked={enabled} 
          size="small"
          onChange={(checked) => handleStatusChange(record, checked)} 
        />
      ),
    },
    { title: '备注', dataIndex: 'remark', ellipsis: true },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 130,
      align: 'center',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => { setEditingWarehouse(record); setModalOpen(true); }}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认执行删除？"
            description="删除操作无法撤回，请确认该库已无业务关联。"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />} size="small">
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* Search Section */}
      <Card size="small" className="shadow-sm">
        <Form form={form} layout="inline">
          <div className="w-full flex justify-between items-start">
            <div className="flex flex-wrap gap-y-4">
              <Form.Item name="name" label="仓库名称">
                <Input placeholder="支持模糊查询" allowClear />
              </Form.Item>
              <Form.Item name="type" label="仓库类型">
                <Select 
                  placeholder="请选择"
                  style={{ width: 130 }}
                  allowClear
                  options={[
                    { label: '实体仓库', value: '实体仓库' },
                    { label: '虚拟仓库', value: '虚拟仓库' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="code" label="仓库编码">
                <Input placeholder="模糊查询" allowClear />
              </Form.Item>
              <Form.Item name="subsidiaryId" label="所属子公司">
                <Select 
                  placeholder="请选择"
                  style={{ width: 180 }}
                  allowClear
                  options={subsidiaries.map(s => ({ label: s.name, value: s.id }))}
                />
              </Form.Item>
            </div>
            <div className="flex-shrink-0 ml-4">
              <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                <Button 
                  type="primary" 
                  ghost
                  icon={<PlusOutlined />} 
                  onClick={() => { setEditingWarehouse(null); setModalOpen(true); }}
                >
                  新增仓库
                </Button>
              </Space>
            </div>
          </div>
        </Form>
      </Card>

      <Card size="small" className="shadow-sm" title="仓库列表">
        <Table
          columns={columns}
          dataSource={currentData}
          loading={loading}
          rowKey="id"
          size="small"
          scroll={{ x: 1500 }}
          onRow={(record) => ({
            onClick: (e) => {
              if (e.target.tagName !== 'BUTTON' && e.target.tagName !== 'A' && !e.target.closest('button') && !e.target.closest('a')) {
                setDetailData(record); 
                setDrawerOpen(true);
              }
            },
            className: 'cursor-pointer'
          })}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: total => `共 ${total} 条记录`,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            }
          }}
        />
      </Card>

      <WarehouseFormModal
        open={modalOpen}
        editingData={editingWarehouse}
        onCancel={() => setModalOpen(false)}
        onSave={(updated) => {
          warehouseService.saveWarehouse(updated);
          setModalOpen(false);
          fetchData();
        }}
      />

      <WarehouseDetailDrawer
        open={drawerOpen}
        data={detailData}
        onClose={() => setDrawerOpen(false)}
      />
    </div>
  );
};

export default WarehouseList;
