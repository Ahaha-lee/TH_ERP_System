import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  message,
  Tooltip,
  Divider,
  Breadcrumb,
  Popconfirm
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  LinkOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData } from '../../mock/data';
import StockAdjustmentFormModal from '../../components/inventory/StockAdjustmentFormModal';
import StockAdjustmentAuditModal from '../../components/inventory/StockAdjustmentAuditModal';
import StockAdjustmentDetailDrawer from '../../components/inventory/StockAdjustmentDetailDrawer';

const { Text } = Typography;

const StockAdjustmentList = () => {
  const [orders, setOrders] = useMockData('stockAdjustmentOrders');
  const [form] = Form.useForm();
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [auditVisible, setAuditVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const handleViewDetail = (record) => {
    setSelectedRecord(record);
    setDetailVisible(true);
  };

  const handleSearch = () => {
    // Search logic would go here
    message.success('搜索中...');
  };

  const handleReset = () => {
    form.resetFields();
  };

  const handleAdd = () => {
    setCurrentRecord(null);
    setModalVisible(true);
  };

  const handleEdit = (record) => {
    setCurrentRecord(record);
    setModalVisible(true);
  };

  const handleAudit = (record) => {
    setCurrentRecord(record);
    setAuditVisible(true);
  };

  const handleDelete = (id) => {
    if (setOrders) {
      setOrders(orders.filter(o => o.id !== id));
      message.success('删除成功');
    }
  };

  const handleModalFinish = (values) => {
    if (currentRecord) {
      // Edit logic
      const updatedOrders = orders.map(o => {
        if (o.id === currentRecord.id) {
          return {
            ...o,
            products: values.items.map(i => i.productName),
            status: values.isSubmit ? '待审核' : '草稿',
            auditResult: '', // Reset audit result on edit
          };
        }
        return o;
      });
      if (setOrders) setOrders(updatedOrders);
      message.success(values.isSubmit ? '提交成功' : '编辑成功');
    } else {
      // Add logic
      const newOrder = {
        id: Date.now().toString(),
        orderNo: values.orderNo,
        type: '手动创建',
        stockType: '成品', // Fixed for mock
        taskNo: '',
        products: values.items.map(i => i.productName),
        status: values.isSubmit ? '待审核' : '草稿',
        auditResult: '',
        operator: values.operator,
        createTime: values.createTime,
      };
      
      if (setOrders) {
        setOrders([newOrder, ...orders]);
      }
      message.success(values.isSubmit ? '提交成功' : '保存成功');
    }
    setModalVisible(false);
  };

  const handleAuditFinish = (values) => {
    const updatedOrders = orders.map(o => {
      if (o.id === values.id) {
        return {
          ...o,
          status: '已审核',
          auditResult: values.auditResult,
          auditTime: dayjs().format('YYYY-MM-DD HH:mm:ss')
        };
      }
      return o;
    });
    if (setOrders) setOrders(updatedOrders);
    setAuditVisible(false);
    message.success('审核完成');
  };

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 70,
      align: 'center',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
    },
    {
      title: '库存调整单号',
      dataIndex: 'orderNo',
      width: 150,
      render: (text, record) => (
        <Typography.Link 
          id={`link-adjustment-${record.id}`} 
          onClick={() => handleViewDetail(record)}
          className="font-semibold"
        >
          {text}
        </Typography.Link>
      ),
    },
    {
      title: '库存调整单类型',
      dataIndex: 'type',
      width: 150,
      render: (type) => (
        <Tag color={type === '盘点任务生成' ? 'orange' : 'blue'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '盘点任务号',
      dataIndex: 'taskNo',
      width: 150,
      render: (taskNo) => taskNo ? (
        <Typography.Link id={`link-task-${taskNo}`} onClick={() => message.info(`跳转到任务: ${taskNo}`)}>
          {taskNo}
        </Typography.Link>
      ) : '-',
    },
    {
      title: '产品信息',
      dataIndex: 'products',
      ellipsis: true,
      render: (products) => Array.isArray(products) ? products.join(', ') : '-',
    },
    {
      title: '审核结果',
      dataIndex: 'auditResult',
      width: 120,
      align: 'center',
      render: (result, record) => {
        if (record.type === '盘点任务生成' || !result) return '-';
        return (
          <Tag id={`tag-audit-${record.id}`} color={result === '审核通过' ? 'success' : 'error'}>
            {result}
          </Tag>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      align: 'center',
      render: (status, record) => {
        if (record.type === '盘点任务生成' || !status) return '-';
        const statusConfig = {
          '草稿': { color: 'default' },
          '待审核': { color: 'processing' },
          '已审核': { color: 'success' },
        };
        return <Tag id={`tag-status-${record.id}`} color={statusConfig[status]?.color || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      width: 120,
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 170,
      fixed: 'right',
      render: (_, record) => {
        const isDraft = record.status === '草稿';
        const isPending = record.status === '待审核';
        const isRejected = record.status === '已审核' && record.auditResult === '审核拒绝';

        return (
          <Space size="small">
            <Button 
              id={`btn-detail-${record.id}`} 
              type="link" 
              size="small" 
              onClick={() => handleViewDetail(record)}
            >
              详情
            </Button>
            {record.type !== '盘点任务生成' && (isDraft || isRejected) && (
              <Button id={`btn-edit-${record.id}`} type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>编辑</Button>
            )}
            {record.type !== '盘点任务生成' && isDraft && (
              <Popconfirm title="确定删除该订单吗？" onConfirm={() => handleDelete(record.id)}>
                <Button id={`btn-delete-${record.id}`} type="link" size="small" danger icon={<DeleteOutlined />}>删除</Button>
              </Popconfirm>
            )}
            {record.type !== '盘点任务生成' && isPending && (
              <Button id={`btn-audit-${record.id}`} type="link" size="small" icon={<CheckCircleOutlined />} onClick={() => handleAudit(record)}>审核</Button>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div className="stock-adjustment-list" id="stock-adjustment-container">
      <Card size="small" className="mb-4" id="search-card">
        <Form
          form={form}
          id="search-form"
          layout="inline"
          onFinish={handleSearch}
        >
          <Form.Item name="orderNo" label="库存调整单" id="form-item-orderNo">
            <Input id="input-orderNo" placeholder="请输入单号" allowClear />
          </Form.Item>
          <Form.Item name="taskNo" label="盘点任务号" id="form-item-taskNo">
            <Input id="input-taskNo" placeholder="请输入盘点任务号" allowClear />
          </Form.Item>
          <Form.Item name="productInfo" label="产品信息" id="form-item-productInfo">
            <Input id="input-productInfo" placeholder="请输入产品名称关键词" allowClear />
          </Form.Item>
          <Form.Item id="form-item-actions">
            <Space>
              <Button id="btn-search" type="primary" icon={<SearchOutlined />} htmlType="submit">查询</Button>
              <Button id="btn-reset" icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      <Card 
        size="small" 
        id="list-card"
        title="库存调整单列表" 
        extra={
          <Button id="btn-create" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增调整单
          </Button>
        }
      >
        <Table
          id="stock-adjustment-table"
          columns={columns}
          dataSource={orders || []}
          rowKey="id"
          size="small"
          pagination={{
            ...pagination,
            total: (orders || []).length,
            showTotal: (total) => `共 ${total} 条数据`,
            showSizeChanger: true,
            showQuickJumper: true,
            onChange: (current, pageSize) => setPagination({ current, pageSize }),
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <StockAdjustmentFormModal 
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onFinish={handleModalFinish}
        initialData={currentRecord}
      />

      <StockAdjustmentAuditModal 
        open={auditVisible}
        onCancel={() => setAuditVisible(false)}
        onFinish={handleAuditFinish}
        record={currentRecord}
      />

      <StockAdjustmentDetailDrawer
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
        record={selectedRecord}
      />
    </div>
  );
};

export default StockAdjustmentList;
