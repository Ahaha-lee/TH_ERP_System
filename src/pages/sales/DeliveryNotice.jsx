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
import { deliveryNotices, employees } from '../../mock';
import { formatCurrency } from '../../utils/helpers';
import DeliveryNoticeFormModal from '../../components/sales/DeliveryNoticeFormModal';
import DeliveryNoticeDetailDrawer from '../../components/sales/DeliveryNoticeDetailDrawer';
import AuditDetailDrawer from '../../components/sales/AuditDetailDrawer';
import FinanceAuditModal from '../../components/sales/FinanceAuditModal';
import WarehouseAuditModal from '../../components/sales/WarehouseAuditModal';

const { Link, Text } = Typography;

const DeliveryNotice = () => {
  const [dataSource, setDataSource] = useState(deliveryNotices);
  const [loading, setLoading] = useState(false);
  const [formModal, setFormModal] = useState({ open: false, data: null });
  const [detailDrawer, setDetailDrawer] = useState({ open: false, data: null });
  const [auditDrawer, setAuditDrawer] = useState({ open: false, record: null });
  const [financeAuditOpen, setFinanceAuditOpen] = useState(false);
  const [warehouseAuditOpen, setWarehouseAuditOpen] = useState(false);
  const [activeRecord, setActiveRecord] = useState(null);

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
      render: (text) => <Link onClick={() => message.info(`跳转到销售订单: ${text}`)}>{text}</Link>
    },
    { title: '客户名称', dataIndex: 'customerName', width: 180, ellipsis: true },
    { 
      title: '结算方式', 
      dataIndex: 'settlementMethod', 
      width: 100,
      render: (val) => {
          const colors = { '月结': 'blue', '现结': 'orange', '预存': 'green', '现金': 'gray' };
          return <Tag color={colors[val]}>{val}</Tag>;
      }
    },
    { 
      title: '发货产品/数量', 
      dataIndex: 'items', 
      width: 250, 
      ellipsis: true,
      render: (items) => items?.map(i => `${i.productName}/${i.currentQty}`).join(', ') 
    },
    { title: '发货总额', dataIndex: 'totalAmount', width: 120, align: 'right', render: val => formatCurrency(val) },
    { title: '创建日期', dataIndex: 'createdAt', width: 120 },
    { title: '业务员', dataIndex: 'salesperson', width: 100 },
    { 
      title: '审批结果', 
      dataIndex: 'auditResult',
      width: 100,
      render: (res) => {
          if (res === '通过' || res === '审核通过') {
              return <Text>{res.replace('通过', '')}</Text>;
          }
          return res && res !== '-' ? <Tag color="red">{res}</Tag> : '-';
      }
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      width: 120,
      render: (val, record) => {
        let displayVal = val;
        // “审批拒绝”对用的状态为“已审批”
        if (record.auditResult === '审核拒绝' || record.auditResult === '审批拒绝') {
          displayVal = '已审批';
        }

        if (displayVal === '已审批') displayVal = '已出库';

        const statusConfig = {
          '草稿': { color: 'default' },
          '待财务审批': { color: 'orange' },
          '待仓库审批': { color: 'blue' },
          '待出库': { color: 'cyan' },
          '已审批': { color: 'green' },
          '已出库': { color: 'purple' }
        };
        const config = statusConfig[displayVal] || { color: 'default' };
        return <Tag color={config.color}>{displayVal}</Tag>;
      }
    },
    { 
      title: '操作', 
      key: 'action', 
      width: 220, 
      fixed: 'right',
      render: (_, record) => {
          const { status, settlementMethod, auditResult } = record;
          return (
            <Space size="small">
              {(status === '草稿' || (status.includes('待') && (auditResult === '审核拒绝' || auditResult === '审批拒绝'))) && (
                <>
                  <Button type="link" size="small" onClick={() => setFormModal({ open: true, data: record })}>编辑</Button>
                  <Button type="link" danger size="small" onClick={() => handleDelete(record.id)}>删除</Button>
                </>
              )}
              {status === '待财务审批' && (
                  <Button type="link" size="small" onClick={() => { setActiveRecord(record); setFinanceAuditOpen(true); }}>财务审批</Button>
              )}
              {status === '待仓库审批' && (
                  <Button type="link" size="small" onClick={() => { setActiveRecord(record); setWarehouseAuditOpen(true); }}>仓库审批</Button>
              )}
              {status === '已出库' && (
                <Button type="link" size="small" onClick={() => message.info('跳转到出库单: CK-20260429-001')}>关联出库单</Button>
              )}
            </Space>
          );
      }
    }
  ];

  const handleSubmit = (record) => {
      const { settlementMethod } = record;
      let nextStatus = '';
      if (['现结', '现金'].includes(settlementMethod)) {
          nextStatus = '待财务审批';
      } else {
          nextStatus = '待仓库审批';
      }
      
      // Perform validations (mocking the checks in the modal as well)
      if (settlementMethod === '预存' && record.totalAmount > 1000000) { // Just a mock fail
          return message.error('余额不足，仅可保存草稿');
      }

      setDataSource(dataSource.map(o => o.id === record.id ? { ...o, status: nextStatus, approvalStatus: '待审核', auditResult: '-' } : o));
      message.success(`已提交，当前状态: ${nextStatus}`);
  };

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
            <div className="text-xs text-gray-500 mb-1">状态</div>
            <Select placeholder="选择状态" className="w-full" allowClear>
              {['草稿', '待财务审批', '待仓库审批', '已出库'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
            </Select>
          </Col>
          <Col span={6}>
            <div className="text-xs text-gray-500 mb-1">结算方式</div>
            <Select placeholder="选择结算方式" className="w-full" allowClear>
              {['月结', '现结', '预存', '现金'].map(s => <Select.Option key={s} value={s}>{s}</Select.Option>)}
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
        notice={detailDrawer.data}
        onClose={() => setDetailDrawer({ open: false, data: null })}
      />

      <AuditDetailDrawer 
        open={auditDrawer.open} 
        record={auditDrawer.record} 
        onClose={() => setAuditDrawer({ open: false, record: null })} 
      />

      <FinanceAuditModal
        open={financeAuditOpen}
        record={activeRecord}
        onCancel={() => { setFinanceAuditOpen(false); setActiveRecord(null); }}
        onSuccess={(audited) => {
            setDataSource(dataSource.map(o => o.id === audited.id ? audited : o));
            setFinanceAuditOpen(false);
            setActiveRecord(null);
        }}
      />

      <WarehouseAuditModal
        open={warehouseAuditOpen}
        record={activeRecord}
        onCancel={() => { setWarehouseAuditOpen(false); setActiveRecord(null); }}
        onSuccess={(audited) => {
            setDataSource(dataSource.map(o => o.id === audited.id ? audited : o));
            setWarehouseAuditOpen(false);
            setActiveRecord(null);
        }}
      />
    </div>
  );
};

export default DeliveryNotice;
