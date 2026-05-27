import React from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Row, 
  Col, 
  Table, 
  Radio, 
  Button, 
  Typography, 
  Divider,
  Descriptions
} from 'antd';

const { Text } = Typography;

const StockAdjustmentAuditModal = ({ open, onCancel, onFinish, record }) => {
  const [form] = Form.useForm();

  // Mock items for the audit table
  const mockAuditItems = record ? record.products.map((pName, index) => ({
    id: index,
    productCode: `ITEM-${String(index + 1).padStart(3, '0')}`,
    productName: pName,
    spec: '标准规格',
    batchNo: 'B20250501',
    warehouse: '主仓库',
    location: 'A-01',
    stockQty: 100,
    adjustmentQty: '+10',
    reason: ['报废处理', '损坏调整', '领用出库', '错扫调整', '手动补单'][index % 5]
  })) : [];

  const columns = [
    { title: '产品编码', dataIndex: 'productCode', width: 120 },
    { title: '产品名称', dataIndex: 'productName', width: 140 },
    { title: '规格型号', dataIndex: 'spec', width: 120 },
    { title: '批次号', dataIndex: 'batchNo', width: 120 },
    { title: '仓库', dataIndex: 'warehouse', width: 120 },
    { title: '货位', dataIndex: 'location', width: 100 },
    { title: '库存数量', dataIndex: 'stockQty', width: 100, align: 'right' },
    { title: '调整数量', dataIndex: 'adjustmentQty', width: 100, align: 'right', render: (val) => <Text type={val.startsWith('+') ? 'success' : 'danger'}>{val}</Text> },
    { title: '调整原因', dataIndex: 'reason', width: 150 },
  ];

  const handleConfirm = () => {
    form.validateFields().then(values => {
      onFinish({ ...values, id: record.id });
    });
  };

  return (
    <Modal
      title="库存调整单审核"
      open={open}
      onCancel={onCancel}
      width={1000}
      id="stock-audit-modal"
      footer={[
        <Button key="cancel" onClick={onCancel} id="audit-btn-cancel">取消</Button>,
        <Button key="confirm" type="primary" onClick={handleConfirm} id="audit-btn-confirm">确定</Button>,
      ]}
    >
      {record && (
        <>
          <Descriptions size="small" bordered column={3} className="mb-4" id="audit-descriptions">
            <Descriptions.Item label="库存调整单号">{record.orderNo}</Descriptions.Item>
            <Descriptions.Item label="操作人">{record.operator}</Descriptions.Item>
            <Descriptions.Item label="操作时间">{record.createTime}</Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="left" style={{ margin: '12px 0' }}>产品明细</Divider>
          <Table
            id="audit-table"
            dataSource={mockAuditItems}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 1000, y: 300 }}
            className="mb-4"
          />

          <Divider titlePlacement="left" style={{ margin: '12px 0' }}>审核操作</Divider>
          <Form form={form} layout="vertical" initialValues={{ auditResult: '审核通过' }} id="audit-form">
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item name="auditResult" label="审核操作" id="audit-form-item-result">
                  <Radio.Group id="audit-radio-group">
                    <Radio value="审核通过">审核通过</Radio>
                    <Radio value="审核拒绝">审核拒绝</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={24}>
                <Form.Item name="auditOpinion" label="审核意见" id="audit-form-item-opinion">
                  <Input.TextArea id="audit-input-opinion" rows={3} placeholder="请输入审核意见" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </>
      )}
    </Modal>
  );
};

export default StockAdjustmentAuditModal;
