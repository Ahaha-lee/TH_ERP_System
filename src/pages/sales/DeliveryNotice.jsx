import React, { useState } from 'react';
import { 
  Table, 
  Card, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  Modal, 
  message,
  Row,
  Col
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { useMockData, employees } from '../../mock';
import { formatCurrency } from '../../utils/helpers';
import DeliveryNoticeFormModal from '../../components/sales/DeliveryNoticeFormModal';
import DeliveryNoticeDetailDrawer from '../../components/sales/DeliveryNoticeDetailDrawer';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import FinanceAuditModal from '../../components/sales/FinanceAuditModal';
import WarehouseAuditModal from '../../components/sales/WarehouseAuditModal';
import NormalOrderDetailDrawer from '../../components/sales/NormalOrderDetailDrawer';

const { Link, Text } = Typography;

const DeliveryNotice = () => {
  const [dataSource, setDataSource] = useMockData('deliveryNotices');
  const [normalOrders] = useMockData('normalOrders');
  const [loading, setLoading] = useState(false);
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });
  const [auditDrawer, setAuditDrawer] = useState({ open: false, record: null });
  const [financeAuditOpen, setFinanceAuditOpen] = useState(false);
  const [warehouseAuditOpen, setWarehouseAuditOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);
  
  const [orderDrawerOpen, setOrderDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60, fixed: 'left' },
    { 
      title: '发货通知单号', 
      dataIndex: 'noticeNo', 
      key: 'noticeNo', 
      width: 160,
      render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, data: record })}>{text}</Link>
    },
    { 
      title: '审批详情', 
      key: 'auditDetail', 
      width: 100,
      render: (_, record) => <Link onClick={() => setAuditDrawer({ open: true, record })}>查看审批详情</Link>
    },
    { 
      title: '销售订单号', 
      dataIndex: 'orderNo', 
      width: 160,
      render: (text) => (
        <Link 
          onClick={() => {
            const found = (normalOrders || []).find(o => o.orderNo === text);
            if (found) {
              setSelectedOrder(found);
              setOrderDrawerOpen(true);
            } else {
              setSelectedOrder({
                id: 'temp-' + text,
                orderNo: text,
                orderDate: '2026-05-22',
                salesperson: '业务员',
                customerName: '关联客户',
                status: '已审核',
                totalAmount: 0,
                items: []
              });
              setOrderDrawerOpen(true);
            }
          }}
        >
          {text}
        </Link>
      )
    },
    { title: '客户名称', dataIndex: 'customerName', width: 180, ellipsis: true },
    { 
      title: '发货产品/数量', 
      dataIndex: 'items', 
      width: 250, 
      ellipsis: true,
      render: (items) => items?.map(i => `${i.productName}/${i.currentQty}`).join(', ') 
    },
    { title: '创建日期', dataIndex: 'createdAt', width: 120 },
    { title: '业务员', dataIndex: 'salesperson', width: 100 },
    { 
      title: '审批状态', 
      dataIndex: 'approvalStatus', 
      width: 120,
      render: (val, record) => {
        const approvalStatusMap = {
          '草稿': { text: '草稿', color: 'default' },
          '审批中': { text: '审批中', color: 'orange' },
          '审批退回': { text: '审批退回', color: 'warning' },
          '审批拒绝': { text: '审批拒绝', color: 'error' },
          '审批通过': { text: '审批通过', color: 'success' },
        };
        const currentApproval = val || record.approvalStatus || '草稿';
        const config = approvalStatusMap[currentApproval] || { text: currentApproval, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    { 
      title: '订单状态', 
      dataIndex: 'status', 
      width: 120,
      render: (val) => {
        const statusMap = {
          '草稿': { text: '草稿', color: 'default' },
          '财务审批': { text: '财务审批', color: 'blue' },
          '仓库审批': { text: '仓库审批', color: 'cyan' },
          '已拒绝': { text: '已拒绝', color: 'red' },
          '备货中': { text: '备货中', color: 'orange' },
          '已完成': { text: '已完成', color: 'green' },
        };
        const currentStatus = val || '草稿';
        const config = statusMap[currentStatus] || { text: currentStatus, color: 'default' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 160, 
      fixed: 'right',
      render: (_, record) => {
          const { status, approvalStatus } = record;
          const isDraft = status === '草稿';
          const isReturned = (status === '财务审批' || status === '仓库审批') && approvalStatus === '审批退回';
          return (
            <Space size="small">
              <Button type="link" size="small" onClick={() => setDetailDrawer({ open: true, data: record })}>查看</Button>
              {isDraft && (
                <>
                  <Button type="link" size="small" onClick={() => setFormModal({ open: true, data: record })}>编辑</Button>
                  <Button type="link" danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
                </>
              )}
              {isReturned && (
                <Button type="link" size="small" onClick={() => setFormModal({ open: true, data: record })}>编辑</Button>
              )}
            </Space>
          );
      }
    }
  ];



  const handleSearch = (values) => {
      setLoading(true);
      setTimeout(() => {
          let filtered = [...deliveryNotices];
          // Filter logic here
          setDataSource(filtered);
          setLoading(false);
      }, 500);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确认删除该发货通知单吗？删除后不可恢复。',
      onOk: () => {
        setDataSource(dataSource.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleFormSuccess = (newData) => {
    if (formModal.data) {
      setDataSource(dataSource.map(o => o.id === formModal.data.id ? { ...o, ...newData } : o));
      message.success('操作成功');
    } else {
      setDataSource([{ ...newData, id: Date.now().toString() }, ...dataSource]);
      message.success('新增成功');
    }
    setFormModal({ open: false, data: null });
  };

  return (
    <div className="p-4 space-y-4">
      <Card size="small">
        <Row gutter={[16, 16]}>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">发货通知单号</div>
            <Input placeholder="模糊查询" allowClear />
          </Col>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">销售订单号</div>
            <Input placeholder="模糊查询" allowClear />
          </Col>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">客户名称</div>
            <Input placeholder="模糊查询" allowClear />
          </Col>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">创建日期</div>
            <DatePicker className="w-full" />
          </Col>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">订单状态</div>
            <Select placeholder="选择状态" className="w-full" allowClear>
              {['草稿', '财务审批', '仓库审批', '已拒绝', '备货中', '已完成'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">业务员</div>
            <Select placeholder="搜索业务员" className="w-full" allowClear showSearch>
                {employees.map(e => <Select.Option key={e.id} value={e.name}>{e.name}</Select.Option>)}
            </Select>
          </Col>
          <Col span={6} className="flex items-end">
            <Space>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                <Button icon={<ReloadOutlined />}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card 
        size="small" 
        title="发货通知单列表" 
        className="shadow-sm"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, data: null })}>新增</Button>}
      >
        <Table 
          columns={columns} 
          dataSource={dataSource} 
          rowKey="id" 
          size="small"
          scroll={{ x: 1800 }}
          loading={loading}
          pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            total: dataSource.length,
            showTotal: (total) => `共 ${total} 条`
          }}
          onRow={(record) => ({
             onClick: (e) => {
                if (e.target.tagName !== 'A' && !e.target.closest('button')) {
                    setDetailDrawer({ open: true, data: record });
                }
             }
          })}
        />
      </Card>

      <DeliveryNoticeFormModal 
        open={formModal.open} 
        onClose={() => setFormModal({ open: false, data: null })}
        onSuccess={handleFormSuccess}
        initialData={formModal.data}
      />

      <DeliveryNoticeDetailDrawer 
        open={detailDrawer.open} 
        notice={dataSource.find(item => item.id === detailDrawer.data?.id)}
        onClose={() => setDetailDrawer({ open: false, data: null })}
        onUpdate={(updatedRecord) => {
            setDataSource(dataSource.map(o => o.id === updatedRecord.id ? updatedRecord : o));
        }}
      />

      <NormalOrderDetailDrawer 
        open={orderDrawerOpen}
        order={selectedOrder}
        onClose={() => { setOrderDrawerOpen(false); setSelectedOrder(null); }}
      />

      <AuditDetailDrawer 
        open={auditDrawer.open} 
        record={dataSource.find(item => item.id === auditDrawer.record?.id)} 
        onClose={() => setAuditDrawer({ open: false, record: null })} 
        onUpdate={(updatedRecord) => {
            setDataSource(dataSource.map(o => o.id === updatedRecord.id ? updatedRecord : o));
        }}
      />
    </div>
  );
};

export default DeliveryNotice;
