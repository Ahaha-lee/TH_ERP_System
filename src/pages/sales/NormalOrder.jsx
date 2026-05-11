import React, { useState, useEffect } from 'react';
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
  Progress,
  Modal,
  message,
  Cascader
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useLocation, useNavigate } from 'react-router-dom';
import { normalOrders } from '../../mock';
import { formatCurrency } from '../../utils/helpers';
import NormalOrderFormModal from '../../components/sales/NormalOrderFormModal';
import NormalOrderDetailDrawer from '../../components/sales/NormalOrderDetailDrawer';
import DeliveryProgressModal from '../../components/sales/DeliveryProgressModal';
import ClaimFlowModal from '../../components/sales/ClaimFlowModal';
import DeliveryNoticeModal from '../../components/sales/DeliveryNoticeModal';
import ProductionProgressModal from '../../components/sales/ProductionProgressModal';
import ProductionPlanModal from '../../components/sales/ProductionPlanModal';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import AuditModal from '../../components/sales/AuditModal';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const NormalOrder = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(normalOrders);
  const [loading, setLoading] = useState(false);
  
  // Modals visibility
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });

  // Handle route state for detail opening
  useEffect(() => {
    if (location.state?.openDetail) {
      const order = data.find(o => o.orderNo === location.state.openDetail);
      if (order) {
        setDetailDrawer({ open: true, data: order });
      }
    }
  }, [location.state, data]);
  const [deliveryModal, setDeliveryModal] = useState({ open: false, orderId: null });
  const [claimModal, setClaimModal] = useState({ open: false, order: null });
  const [deliveryNoticeModal, setDeliveryNoticeModal] = useState({ open: false, order: null });
  const [prodProgressModal, setProdProgressModal] = useState({ open: false, orderNo: '' });
  const [prodPlanModal, setProdPlanModal] = useState({ open: false, orderNo: '' });
  const [auditDrawer, setAuditDrawer] = useState({ open: false, orderNo: '' });
  const [auditModal, setAuditModal] = useState({ open: false, record: null });

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60, fixed: 'left' },
    { 
      title: '销售订单号', 
      dataIndex: 'orderNo', 
      width: 160,
      render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, data: record })}>{text}</Link>
    },
    { 
      title: '来源报价单号', 
      dataIndex: 'sourceQuoteNo', 
      width: 160,
      render: (text) => text ? <Link onClick={() => navigate('/quotations', { state: { openDetail: text } })}>{text}</Link> : '-'
    },
    { 
      title: '审核详情', 
      key: 'audit', 
      width: 120,
      render: (_, record) => <Link onClick={() => setAuditDrawer({ open: true, orderNo: record.orderNo })}>查看审核详情</Link>
    },
    { 
      title: '客户名称', 
      dataIndex: 'customerName', 
      width: 200, 
      ellipsis: true,
      render: (text) => <Link onClick={() => navigate('/customers', { state: { customerName: text } })}>{text}</Link>
    },
    { title: '订单日期', dataIndex: 'orderDate', width: 120 },
    { title: '期望发货日期', dataIndex: 'expectedDate', width: 120 },
    { 
      title: '订单总额', 
      dataIndex: 'totalAmount', 
      width: 120, 
      align: 'right', 
      render: val => formatCurrency(val) 
    },
    { 
      title: '实收金额', 
      dataIndex: 'receivedAmount', 
      width: 120, 
      align: 'right', 
      render: val => formatCurrency(val) 
    },
    { title: '业务员', dataIndex: 'salesman', width: 100 },
    { title: '结算方式', dataIndex: 'settlementMethod', width: 100 },
    { 
      title: '生产进度', 
      dataIndex: 'productionProgress', 
      width: 150,
      render: (val, record) => (
        <div className="cursor-pointer" onClick={() => setProdProgressModal({ open: true, orderNo: record.orderNo })}>
          <Progress percent={val} size="small" />
        </div>
      )
    },
    { 
      title: '发货进度', 
      dataIndex: 'deliveryStatus', 
      width: 100,
      render: (text, record) => <Link onClick={() => setDeliveryModal({ open: true, orderId: record.id })}>{text}</Link>
    },
    { 
      title: '审核结果', 
      dataIndex: 'approvalResult', 
      width: 100,
      render: (val) => <Tag color={val === '审核通过' ? 'green' : val === '审核拒绝' ? 'red' : 'default'}>{val}</Tag>
    },
    { 
      title: '订单状态', 
      dataIndex: 'status', 
      width: 100,
      render: (val) => <Tag color="blue">{val}</Tag>
    },
    { 
      title: '收款状态', 
      dataIndex: 'collectionStatus', 
      width: 100,
      render: (val) => <Tag color={val === '已结清' ? 'green' : val === '未结清' ? 'orange' : 'red'}>{val}</Tag>
    },
    { 
      title: '操作', 
      key: 'action', 
      fixed: 'right', 
      width: 200,
      render: (_, record) => {
        const status = record.status;
        return (
          <Space size="small">
            {status === '草稿' && (
              <>
                <Link onClick={() => setFormModal({ open: true, data: record })}>编辑</Link>
                <Link onClick={() => setAuditModal({ open: true, record: record })}>审核</Link>
                <Link danger onClick={() => handleDelete(record.id)}>删除</Link>
              </>
            )}
            {status === '待审核' && (
              <Link onClick={() => setAuditModal({ open: true, record: record })}>审核</Link>
            )}
            {record.approvalResult === '审核拒绝' && status !== '草稿' && (
              <>
                <Link onClick={() => setFormModal({ open: true, data: record })}>编辑</Link>
                <Link onClick={() => setAuditModal({ open: true, record: record })}>审核</Link>
              </>
            )}
            {['已排产', '生产中', '已完工', '待发货', '备货中', '确认发运', '完成'].includes(record.status) && (
              <Link onClick={() => setProdPlanModal({ open: true, orderNo: record.orderNo })}>排产计划</Link>
            )}
            {['生产中', '已完工', '待发货'].includes(record.status) && (
              <Link onClick={() => setProdProgressModal({ open: true, orderNo: record.orderNo })}>生产进度</Link>
            )}
            {['已完工', '确认发运'].includes(record.status) && (
              <Link onClick={() => setDeliveryNoticeModal({ open: true, order: record })}>发起发货</Link>
            )}
            {record.status === '完成' && (
              <Link onClick={() => setClaimModal({ open: true, order: record })}>认领流水</Link>
            )}
          </Space>
        );
      }
    }
  ];

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      icon: <ExclamationCircleOutlined />,
      content: '确定要删除这条销售订单吗？',
      onOk() {
        setData(data.filter(item => item.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleFormSuccess = (newData) => {
    if (formModal.data) {
      setData(data.map(item => item.id === newData.id ? newData : item));
      message.success('修改成功');
    } else {
      setData([newData, ...data]);
      message.success('新增成功');
    }
    setFormModal({ open: false, data: null });
  };

  return (
    <div className="space-y-4">
      <Card size="small" className="shadow-sm">
        <Space wrap>
          <Input placeholder="销售订单号" style={{ width: 150 }} allowClear />
          <Input placeholder="客户名称" style={{ width: 150 }} allowClear />
          <RangePicker placeholder={['订单号起', '订单号止']} style={{ width: 250 }} />
          <Select placeholder="订单状态" style={{ width: 120 }} allowClear>
            <Select.Option value="草稿">草稿</Select.Option>
            <Select.Option value="待审核">待审核</Select.Option>
            <Select.Option value="已审核">已审核</Select.Option>
            <Select.Option value="完成">完成</Select.Option>
          </Select>
          <Select showSearch placeholder="业务员" style={{ width: 120 }} allowClear>
             <Select.Option value="张三">张三</Select.Option>
             <Select.Option value="李四">李四</Select.Option>
          </Select>
          <Cascader placeholder="客户地区" style={{ width: 150 }} />
          <Button type="primary" icon={<SearchOutlined />}>查询</Button>
          <Button icon={<ReloadOutlined />} onClick={() => {}}>重置</Button>
        </Space>
      </Card>

      <Card 
        size="small" 
        title="普通销售订单列表" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, data: null })}>新增</Button>}
      >
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          size="small"
          scroll={{ x: 2200 }}
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            total: data.length,
            pageSizeOptions: ['10', '20', '50', '100']
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

      <NormalOrderFormModal 
        open={formModal.open} 
        onClose={() => setFormModal({ open: false, data: null })}
        onSuccess={handleFormSuccess}
        initialData={formModal.data}
      />

      <NormalOrderDetailDrawer 
        open={detailDrawer.open} 
        order={detailDrawer.data}
        onClose={() => setDetailDrawer({ open: false, data: null })}
      />

      <DeliveryProgressModal 
        open={deliveryModal.open} 
        onCancel={() => setDeliveryModal({ open: false, orderId: null })}
        orderNo="SOD-XXX"
      />

      <ClaimFlowModal 
        open={claimModal.open} 
        order={claimModal.order}
        onCancel={() => setClaimModal({ open: false, order: null })}
      />

      <DeliveryNoticeModal 
        open={deliveryNoticeModal.open}
        order={deliveryNoticeModal.order}
        onCancel={() => setDeliveryNoticeModal({ open: false, order: null })}
      />

      <ProductionProgressModal 
        open={prodProgressModal.open} 
        onCancel={() => setProdProgressModal({ open: false, orderNo: '' })}
        orderNo={prodProgressModal.orderNo}
      />

      <ProductionPlanModal 
        open={prodPlanModal.open} 
        onCancel={() => setProdPlanModal({ open: false, orderNo: '' })}
        orderNo={prodPlanModal.orderNo}
      />

      <AuditDetailDrawer 
        open={auditDrawer.open} 
        orderNo={auditDrawer.orderNo}
        onClose={() => setAuditDrawer({ open: false, orderNo: '' })}
      />

      <AuditModal 
        open={auditModal.open} 
        record={auditModal.record} 
        onCancel={() => setAuditModal({ open: false, record: null })}
        onSuccess={(updatedRecord) => {
          setData(data.map(o => o.id === updatedRecord.id ? { 
            ...o, 
            status: updatedRecord.auditResult === '审核通过' ? '已审核' : o.status,
            approvalResult: updatedRecord.auditResult
          } : o));
          setAuditModal({ open: false, record: null });
        }}
      />
    </div>
  );
};

export default NormalOrder;
