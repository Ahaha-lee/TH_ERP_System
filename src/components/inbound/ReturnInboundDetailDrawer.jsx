import React, { useMemo } from 'react';
import { Drawer, Descriptions, Table, Tag, Typography, Divider, Tabs, Empty, Modal } from 'antd';
import { useMockData, mockAuditRecords } from '../../mock/data';

const { Text } = Typography;

const ReturnInboundDetailDrawer = ({ open, onClose, orderNo }) => {
  const [inboundOrders] = useMockData('inboundOrders');
  const order = useMemo(() => (inboundOrders || []).find(o => o.orderNo === orderNo), [orderNo, inboundOrders]);
  
  const auditRecords = useMemo(() => {
    if (!order) return [];
    return mockAuditRecords[order.id] || [];
  }, [order]);

  const columns = [
    { title: '序号', width: 60, render: (_, __, index) => index + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '型号', dataIndex: 'model', width: 110, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 60 },
    { title: '退货数量', dataIndex: 'quantity', width: 100, align: 'right' },
    { title: '批次号', dataIndex: 'batchNo', width: 150, render: (val) => val || order?.batchNo || 'B20260510001' },
    { title: '入库仓库', dataIndex: 'warehouseName', width: 150, render: (val) => val || order?.warehouseName || '-' },
    { title: '货位', dataIndex: 'bin', width: 100 },
  ];

  const auditColumns = [
    { title: '审核时间', dataIndex: 'time', width: 180 },
    { title: '审核人', dataIndex: 'operator', width: 120 },
    { 
      title: '审核动作', 
      dataIndex: 'action', 
      width: 120,
      render: (action) => {
        let color = 'default';
        if (action.includes('通过')) color = 'success';
        if (action.includes('拒绝')) color = 'error';
        if (action.includes('提交')) color = 'blue';
        return <Tag color={color}>{action}</Tag>;
      }
    },
    { title: '审核建议', dataIndex: 'opinion' }
  ];

  const renderBasicInfo = () => (
    <>
      <Descriptions bordered column={3} size="small" className="mb-6">
        <Descriptions.Item label="入库单号">{order?.orderNo}</Descriptions.Item>
        <Descriptions.Item label="入库类型">{order?.type}</Descriptions.Item>
        <Descriptions.Item label="关联售后单">{order?.relOrderNo}</Descriptions.Item>
        <Descriptions.Item label="客户">{order?.partnerName}</Descriptions.Item>
        <Descriptions.Item label="时间">{order?.inboundDate}</Descriptions.Item>
        <Descriptions.Item label="状态"><Tag color="default">{order?.status}</Tag></Descriptions.Item>
        <Descriptions.Item label="备注" span={3}>{order?.remark || '-'}</Descriptions.Item>
        <Descriptions.Item label="凭证/图片" span={3}>
          {order?.images && order.images.length > 0 ? (
            <div className="flex gap-2 flex-wrap mt-1">
              {order.images.map((img, idx) => (
                <div key={idx} className="relative border border-slate-200 rounded p-1 group bg-white shadow-sm hover:shadow transition-shadow cursor-pointer"
                     onClick={() => {
                       Modal.info({
                         title: '凭证图片预览',
                         width: 'auto',
                         centered: true,
                         icon: null,
                         okText: '关闭',
                         content: (
                           <div style={{ textAlign: 'center', marginTop: 12 }}>
                             <img src={img} alt="preview" style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain', borderRadius: 4 }} referrerPolicy="no-referrer" />
                           </div>
                         )
                       });
                     }}
                >
                  <img 
                    src={img} 
                    alt={`voucher-${idx + 1}`} 
                    className="h-20 w-auto max-w-[160px] object-contain rounded" 
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded">
                    <span className="text-white text-[11px] px-1.5 py-0.5 bg-black/60 rounded">点击放大</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">无凭证图片</span>
          )}
        </Descriptions.Item>
      </Descriptions>
 
      <Divider titlePlacement="left">退货物料明细</Divider>
      <Table
        rowKey="productCode"
        columns={columns}
        dataSource={order?.items || []}
        pagination={false}
        size="small"
        summary={(pageData) => {
          let totalQty = pageData.reduce((s, it) => s + (it.quantity || 0), 0);
          return (
            <Table.Summary.Row key="total">
              <Table.Summary.Cell index={0} colSpan={5}>合计</Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right"><Text strong>{totalQty}</Text></Table.Summary.Cell>
              <Table.Summary.Cell index={2} colSpan={3}></Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    </>
  );

  const renderAuditHistory = () => (
    <div style={{ padding: '8px' }}>
      <Table
        dataSource={auditRecords.map((r, i) => ({ ...r, key: i }))}
        columns={auditColumns}
        rowKey="key"
        size="small"
        pagination={false}
      />
    </div>
  );

  const tabItems = [
    { key: 'basic', label: '基本信息', children: renderBasicInfo() },
    { key: 'audit', label: '审核详情', children: renderAuditHistory() }
  ];

  return (
    <Drawer forceRender
      title={`退货入库单详情 - ${orderNo}`}
      size="large"
      open={open}
      onClose={onClose}
    >
      <Tabs defaultActiveKey="basic" items={tabItems} />
    </Drawer>
  );
};

export default ReturnInboundDetailDrawer;
