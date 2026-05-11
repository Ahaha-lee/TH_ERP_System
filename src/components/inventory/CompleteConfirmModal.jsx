import React, { useMemo, useState, useEffect } from 'react';
import { Modal, Typography, Space, Table, Tag, Divider, Alert, Button, message, Radio, Input, Card } from 'antd';
import { WarningOutlined, CheckCircleOutlined, InfoCircleOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/helpers';

const { Text, Title } = Typography;

const CompleteConfirmModal = ({ open, onCancel, onConfirm, diffResult = [], status, auditInfo }) => {
  const [data, setData] = useState([]);
  const [globalStatus, setGlobalStatus] = useState('通过');
  const [globalReason, setGlobalReason] = useState('');

  useEffect(() => {
    if (open) {
      setData(diffResult.map(item => ({ ...item, resultStatus: item.resultStatus || '待处理' })));
      setGlobalStatus('通过');
      setGlobalReason('');
    }
  }, [open, diffResult]);

  const summary = useMemo(() => {
    const surplus = data.filter(d => d.diffQty > 0);
    const shortage = data.filter(d => d.diffQty < 0);
    
    return {
      surplusCount: surplus.length,
      surplusTotal: surplus.reduce((acc, curr) => acc + curr.diffQty, 0),
      surplusAmount: surplus.reduce((acc, curr) => acc + curr.diffAmount, 0),
      shortageCount: shortage.length,
      shortageTotal: shortage.reduce((acc, curr) => acc + Math.abs(curr.diffQty), 0),
      shortageAmount: shortage.reduce((acc, curr) => acc + Math.abs(curr.diffAmount), 0),
    };
  }, [data]);

  const handleConfirm = () => {
    onConfirm({
      status: globalStatus,
      reason: globalReason,
      data: data.map(item => ({ ...item, resultStatus: globalStatus === '通过' ? '通过' : '异常' }))
    });
  };

  const columns = [
    { title: '货位编码', dataIndex: 'location', width: 100 },
    { title: '物料编码', dataIndex: 'productCode', width: 100 },
    { title: '物料名称', dataIndex: 'productName', width: 140 },
    { title: '规格型号', dataIndex: 'spec', width: 120 },
    { title: '批次号', dataIndex: 'batchNo', width: 100, render: t => t || '-' },
    { title: '盘点基准库存', dataIndex: 'bookQty', align: 'right', width: 100 },
    { title: '实盘数量', dataIndex: 'actualQty', align: 'right', width: 100 },
    { 
      title: '差异数量', 
      dataIndex: 'diffQty', 
      align: 'right',
      width: 100,
      render: (v) => <Text type={v > 0 ? 'success' : v < 0 ? 'danger' : 'secondary'}>{v > 0 ? `+${v}` : v}</Text>
    },
    { 
      title: '差异金额', 
      dataIndex: 'diffAmount', 
      align: 'right',
      width: 100,
      render: (v) => <Text type={v !== 0 ? 'danger' : 'secondary'}>{formatCurrency(v)}</Text>
    },
  ];

  const isReadOnly = status === '已完成' || status === '已拒绝';
  const [auditVisible, setAuditVisible] = useState(false);

  return (
    <>
      <Modal forceRender
        title={isReadOnly ? "查看盘点结果" : "盘点结果详情"}
        open={open}
        onCancel={onCancel}
        footer={[
          <Button key="close" onClick={onCancel}>关闭</Button>,
          !isReadOnly && (
            <Button key="audit" type="primary" onClick={() => setAuditVisible(true)}>
              立即审核
            </Button>
          )
        ]}
        width={1100}
      >
        <Space orientation="vertical" style={{ width: '100%' }} size="middle">
          {isReadOnly && auditInfo?.status && (
            <Card size="small" variant="borderless" className={auditInfo.status === '已通过' ? "bg-green-50" : "bg-red-50"}>
              <Space orientation="vertical" style={{ width: '100%' }}>
                <Space>
                  <Text strong>审核结论：</Text>
                  <Tag color={auditInfo.status === '已通过' ? 'green' : 'red'}>{auditInfo.status}</Tag>
                  <Text type="secondary" size="small">{auditInfo.time}</Text>
                </Space>
                <Space align="start">
                  <Text strong>审核意见：</Text>
                  <Text>{auditInfo.reason || '--'}</Text>
                </Space>
              </Space>
            </Card>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', backgroundColor: '#f9f9f9', padding: '16px', borderRadius: '8px' }}>
            <div>
              <Title level={5} type="success">盘盈</Title>
              <Text strong style={{ fontSize: '20px' }}>{summary.surplusCount}</Text> <Text type="secondary">项</Text>
              <br />
              <Text type="secondary">数量: {summary.surplusTotal} | 金额: {formatCurrency(summary.surplusAmount)}</Text>
            </div>
            <Divider orientation="vertical" style={{ height: '60px' }} />
            <div>
              <Title level={5} type="danger">盘亏</Title>
              <Text strong style={{ fontSize: '20px' }}>{summary.shortageCount}</Text> <Text type="secondary">项</Text>
              <br />
              <Text type="secondary">数量: {summary.shortageTotal} | 金额: {formatCurrency(summary.shortageAmount)}</Text>
            </div>
          </div>

          <Divider titlePlacement="left">差异明细</Divider>
          <Table
            dataSource={data}
            rowKey={(record) => `${record.productCode}-${record.location}`}
            size="small"
            pagination={{ pageSize: 8 }}
            columns={columns}
            scroll={{ x: 'max-content' }}
          />
        </Space>
      </Modal>

      <Modal forceRender
        title="盘点结果审核"
        open={auditVisible}
        onCancel={() => setAuditVisible(false)}
        onOk={() => {
          handleConfirm();
          setAuditVisible(false);
        }}
        width={450}
        centered
        okText={globalStatus === '通过' ? "审核通过" : "审核驳回"}
        okButtonProps={{ danger: globalStatus === '拒绝', type: 'primary' }}
      >
        <Space orientation="vertical" style={{ width: '100%', paddingTop: 8 }} size="large">
          <div>
            <div style={{ marginBottom: 8 }}><Text strong>审核结论</Text></div>
            <Radio.Group 
              value={globalStatus} 
              onChange={e => setGlobalStatus(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="通过"><CheckOutlined /> 审核通过</Radio.Button>
              <Radio.Button value="拒绝"><CloseOutlined /> 审核驳回</Radio.Button>
            </Radio.Group>
          </div>
          
          <div>
            <div style={{ marginBottom: 8 }}><Text strong>审核意见</Text></div>
            <Input.TextArea 
              placeholder="请填写审核备注（如拒绝理由）" 
              rows={3} 
              value={globalReason}
              onChange={e => setGlobalReason(e.target.value)}
            />
          </div>

          <Alert
            title="操作周知"
            description={globalStatus === '通过' ? "审核通过后，系统将预生成库存调整单，需二次确认后方可调整库存。" : "驳回后，该次盘点结果将标记为异常。"}
            type={globalStatus === '通过' ? "info" : "warning"}
            showIcon
          />
        </Space>
      </Modal>
    </>

  );
};

export default CompleteConfirmModal;
