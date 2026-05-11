
import React from 'react';
import { Modal, Form, Radio, Input, Typography, Descriptions, Table, Divider, Row, Col } from 'antd';

const { TextArea } = Input;
const { Text, Title } = Typography;

const QuotationAuditModal = ({ open, onCancel, onConfirm, quotation }) => {
  const [form] = Form.useForm();

  const handleOk = () => {
    if (!quotation) return;
    form.validateFields().then(values => {
      onConfirm(values);
      form.resetFields();
    });
  };

  if (!quotation) return (
    <Modal open={open} onCancel={onCancel} title="报价单审核" footer={null} forceRender>
        <div className="p-8 text-center text-gray-400">加载中...</div>
        <div style={{ display: 'none' }}><Form form={form} /></div>
    </Modal>
  );

  const productTotal = quotation.items?.reduce((acc, curr) => acc + (curr.standardPrice || 0) * (curr.quantity || 0), 0) || 0;
  const saving = productTotal - (quotation.totalAmount - (quotation.otherFees || 0));

  const itemColumns = [
    { title: '产品编码', dataIndex: 'productCode', width: 120 },
    { title: '产品名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120, ellipsis: true },
    { title: '属性', dataIndex: 'property', width: 100, render: (v) => v || '-' },
    { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
    { title: '标准单价', dataIndex: 'standardPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '底价', dataIndex: 'floorPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '报价单价', dataIndex: 'unitPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '折后单价', dataIndex: 'finalPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '金额', dataIndex: 'amount', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
    { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true },
  ];

  return (
    <Modal forceRender
      title={`报价单审核 - ${quotation.quotationNo}`}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      okText="确认"
      cancelText="取消"
      width={1100}
      
    >
      <Descriptions bordered size="small" column={2} style={{ marginBottom: 16 }}>
        <Descriptions.Item label="客户名称">{quotation.customerName}</Descriptions.Item>
        <Descriptions.Item label="业务员">{quotation.salesperson}</Descriptions.Item>
      </Descriptions>

      <Divider titlePlacement="left">产品明细</Divider>
      <Table
        columns={itemColumns}
        dataSource={quotation.items || []}
        rowKey="id"
        size="small"
        pagination={false}
        scroll={{ x: 1000, y: 300 }}
      />

      <Divider titlePlacement="left" style={{ marginTop: 24 }}>价格汇总</Divider>
      <Row justify="end">
        <Col span={10}>
          <div className="text-right">
            <Row style={{ marginBottom: 4 }}><Col span={14}>产品总额:</Col><Col span={10}>¥{(productTotal).toFixed(2)}</Col></Row>
            <Row style={{ marginBottom: 4 }}><Col span={14}>客户类型折扣 ({quotation.customerType || '-'}):</Col><Col span={10}>{( (quotation.discountRate || 0) * 100).toFixed(0)}%</Col></Row>
            <Row style={{ marginBottom: 4 }}><Col span={14}>优惠金额:</Col><Col span={10}>- ¥{(productTotal - (quotation.totalAmount - (quotation.otherFees || 0))).toFixed(2)}</Col></Row>
            <Row style={{ marginBottom: 4 }}><Col span={14}>其他费用:</Col><Col span={10}>¥{(quotation.otherFees || 0).toFixed(2)}</Col></Row>
            <Row style={{ marginTop: 8 }}>
              <Col span={14}><Title level={5}>报价总额:</Title></Col>
              <Col span={10}><Title level={5} style={{ color: '#ff4d4f', marginTop: 0 }}>¥{(quotation.totalAmount || 0).toFixed(2)}</Title></Col>
            </Row>
          </div>
        </Col>
      </Row>

      <Divider />

      <Form
        form={form}
        layout="vertical"
        initialValues={{ auditResult: '审核通过' }}
      >
        <Form.Item
          name="auditResult"
          label="审核操作"
          rules={[{ required: true, message: '请选择审核操作' }]}
        >
          <Radio.Group>
            <Radio value="审核通过">审核通过</Radio>
            <Radio value="审核拒绝">审核拒绝</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="opinion"
          label="审核意见"
          rules={[{ required: true, message: '请输入审批意见' }]}
        >
          <TextArea rows={3} placeholder="请输入审批意见" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default QuotationAuditModal;
