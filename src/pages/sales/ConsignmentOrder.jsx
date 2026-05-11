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
  Progress,
  Modal,
  message
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { consignmentOrders } from '../../mock';
import { formatCurrency } from '../../utils/helpers';

import ConsignmentFormModal from '../../components/sales/ConsignmentFormModal';
import ConsignmentDetailDrawer from '../../components/sales/ConsignmentDetailDrawer';
import DeliveryProgressModal from '../../components/sales/DeliveryProgressModal';
import ProductionProgressModal from '../../components/sales/ProductionProgressModal';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import TrusteeAuditModal from '../../components/sales/trustee/TrusteeAuditModal';
import MaterialReceiptProgressModal from '../../components/sales/MaterialReceiptProgressModal';
import DeliveryNoticeModal from '../../components/sales/DeliveryNoticeModal';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const ConsignmentOrder = () => {
  const [data, setData] = useState(consignmentOrders);
  const [loading, setLoading] = useState(false);
  
  // Modals visibility
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });
  const [deliveryModal, setDeliveryModal] = useState({ open: false, orderNo: '' });
  const [receiptModal, setReceiptModal] = useState({ open: false, orderNo: '' });
  const [prodProgressModal, setProdProgressModal] = useState({ open: false, orderNo: '' });
  const [auditDrawer, setAuditDrawer] = useState({ open: false, orderNo: '' });
  const [auditModal, setAuditModal] = useState({ open: false, record: null });
  const [deliveryNoticeModal, setDeliveryNoticeModal] = useState({ open: false, order: null });

  const columns = [
    { title: '序号', render: (_, __, index) => index + 1, width: 60, fixed: 'left' },
    { 
      title: '受托加工订单号', 
      dataIndex: 'orderNo', 
      width: 160,
      render: (text, record) => <Link onClick={() => setDetailDrawer({ open: true, data: record })}>{text}</Link>
    },
    { 
      title: '来源报价单号', 
      dataIndex: 'sourceQuoteNo', 
      width: 160,
      render: (text) => text ? <Link>{text}</Link> : '-'
    },
    { title: '客户名称', dataIndex: 'customerName', width: 200, ellipsis: true },
    { title: '订单日期', dataIndex: 'orderDate', width: 120 },
    { title: '期望发货日期', dataIndex: 'expectedDate', width: 120 },
    { 
      title: '加工费总额', 
      dataIndex: 'totalAmount', 
      width: 120, 
      align: 'right', 
      render: val => formatCurrency(val) 
    },
    { 
      title: '加工进度', 
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
      render: (text, record) => <Link onClick={() => setDeliveryModal({ open: true, orderNo: record.orderNo })}>{text}</Link>
    },
    { title: '业务员', dataIndex: 'salesman', width: 100 },
    { 
      title: '审核结果', 
      dataIndex: 'approvalResult', 
      width: 100,
      render: (val) => <Tag color={val === '审核通过' ? 'green' : 'default'}>{val}</Tag>
    },
    { 
      title: '订单状态', 
      dataIndex: 'status', 
      width: 120,
      render: (val) => <Tag color="cyan">{val}</Tag>
    },
    { 
      title: '收款状态', 
      dataIndex: 'collectionStatus', 
      width: 100,
      render: (val) => <Tag color={val === '已结清' ? 'green' : 'orange'}>{val}</Tag>
    },
    { 
      title: '操作', 
      key: 'action', 
      fixed: 'right', 
      width: 180,
      render: (_, record) => {
        const { status } = record;
        return (
          <Space size="small">
             {status === '草稿' && (
                <>
                   <Link onClick={() => setFormModal({ open: true, data: record })}>编辑</Link>
                   <Link onClick={() => setAuditModal({ open: true, record })}>审核</Link>
                   <Link danger onClick={() => handleDelete(record.id)}>删除</Link>
                </>
             )}
             {(status === '已审批' || status === '已审核') && (
                <Link onClick={() => message.info('模拟已生成入库单')}>生成入库单</Link>
             )}
             {['来料待收', '来料已收', '生产中', '已完工', '待发货'].includes(status) && (
                <Link onClick={() => setReceiptModal({ open: true, orderNo: record.orderNo })}>入库进度</Link>
             )}
             {['已完工', '待发货'].includes(status) && (
                <Link onClick={() => setDeliveryNoticeModal({ open: true, order: record })}>发起发货</Link>
             )}
          </Space>
        );
      }
    }
  ];

  const handleDelete = (id) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这条受托加工订单吗？',
      onOk() {
        setData(data.filter(i => i.id !== id));
        message.success('删除成功');
      }
    });
  };

  const handleFormSuccess = (newData) => {
     if (formModal.data) {
        setData(data.map(i => i.id === newData.id ? newData : i));
     } else {
        setData([newData, ...data]);
     }
     setFormModal({ open: false, data: null });
  };

  return (
    <div className="space-y-4">
      <Card size="small">
        <Space wrap>
          <Input placeholder="受托加工订单号" style={{ width: 160 }} />
          <Input placeholder="客户名称" style={{ width: 160 }} />
          <RangePicker style={{ width: 250 }} />
          <Select placeholder="订单状态" style={{ width: 120 }} allowClear>
             <Select.Option value="草稿">草稿</Select.Option>
             <Select.Option value="已审核">已审核</Select.Option>
             <Select.Option value="完成">完成</Select.Option>
          </Select>
          <Select placeholder="结算方式" style={{ width: 120 }} allowClear>
              <Select.Option value="月结">月结</Select.Option>
              <Select.Option value="现结">现结</Select.Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />}>查询</Button>
          <Button icon={<ReloadOutlined />}>重置</Button>
        </Space>
      </Card>

      <Card 
        size="small" 
        title="受托加工销售订单列表" 
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setFormModal({ open: true, data: null })}>新增</Button>}
      >
        <Table columns={columns} dataSource={data} rowKey="id" size="small" scroll={{ x: 2000 }} pagination={{ showSizeChanger: true }} />
      </Card>

      <ConsignmentFormModal open={formModal.open} onClose={() => setFormModal({ open: false, data: null })} onSuccess={handleFormSuccess} initialData={formModal.data} />
      <ConsignmentDetailDrawer open={detailDrawer.open} order={detailDrawer.data} onClose={() => setDetailDrawer({ open: false, data: null })} />
      <DeliveryProgressModal open={deliveryModal.open} onCancel={() => setDeliveryModal({ open: false, orderNo: '' })} orderNo={deliveryModal.orderNo} />
      <ProductionProgressModal open={prodProgressModal.open} onCancel={() => setProdProgressModal({ open: false, orderNo: '' })} orderNo={prodProgressModal.orderNo} />
      <MaterialReceiptProgressModal open={receiptModal.open} onCancel={() => setReceiptModal({ open: false, orderNo: '' })} orderNo={receiptModal.orderNo} />
      <AuditDetailDrawer open={auditDrawer.open} orderNo={auditDrawer.orderNo} onClose={() => setAuditDrawer({ open: false, orderNo: '' })} />
      <TrusteeAuditModal 
        open={auditModal.open} 
        record={auditModal.record} 
        onCancel={() => setAuditModal({ open: false, record: null })}
        onSuccess={(updatedRecord) => {
            setData(data.map(i => i.id === updatedRecord.id ? { 
                ...i, 
                status: updatedRecord.auditResult === '审核通过' ? '已审核' : i.status,
                approvalResult: updatedRecord.auditResult
            } : i));
            setAuditModal({ open: false, record: null });
        }}
      />
      <DeliveryNoticeModal open={deliveryNoticeModal.open} order={deliveryNoticeModal.order} onCancel={() => setDeliveryNoticeModal({ open: false, order: null })} />
    </div>
  );
};

export default ConsignmentOrder;
