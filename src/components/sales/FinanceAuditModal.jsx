
import React from 'react';
import { 
    Modal, 
    Form, 
    Radio, 
    Input, 
    message, 
    Descriptions, 
    Table, 
    Divider, 
    Typography, 
    Row, 
    Col, 
    Tag,
    Space,
    Button
} from 'antd';
import { PaperClipOutlined } from '@ant-design/icons';
import { formatCurrency } from '../../utils/helpers';

const { TextArea } = Input;
const { Text, Title } = Typography;

const FinanceAuditModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        if (!record) return;
        form.validateFields().then(values => {
            message.success('财务审核处理成功');
            onSuccess({
                ...record,
                status: values.action === 'pass' ? '待仓库审批' : '待财务审批', 
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                financeAuditResult: values.action === 'pass' ? '通过' : '拒绝',
                financeAuditRemark: values.remark,
                financeAuditor: '财务主管',
                financeAuditTime: new Date().toLocaleString()
            });
            form.resetFields();
        });
    };

    // Financial calculations
    const items = record?.items || [];
    const productTotal = record?.totalAmount || 0;
    const discountRate = 5; // Mock from previous turns
    const discountedProductTotal = productTotal * (1 - discountRate / 100);
    const otherFee = record?.otherFee || 0;
    const orderTotal = discountedProductTotal + otherFee;
    
    // Current shipment product amount
    const currentShipmentAmount = items.reduce((sum, item) => {
        // Find product price - normally this would come from the record or a lookup
        const discountedUnitPrice = (item.unitPrice || 0) * (1 - discountRate / 100);
        return sum + ((item.currentQty || 0) * discountedUnitPrice);
    }, 0);

    const columns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 100 },
        { title: '订单数量', dataIndex: 'orderQty', width: 90, align: 'right' },
        { title: '已发货数量', dataIndex: 'shippedQty', width: 100, align: 'right' },
        { title: '本次发货数量', dataIndex: 'currentQty', width: 110, align: 'right', render: (v) => <Text strong type="danger">{v}</Text> },
    ];

    return (
        <Modal forceRender
            title={`财务审核 - ${record?.noticeNo || ''}`}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1000}
            centered
            okText="确认审核"
            cancelText="取消"
        >
            <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                {record ? (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                        <Descriptions bordered size="small" column={2} styles={{ label: { width: 120 } }}>
                            <Descriptions.Item label="客户名称">{record.customerName}</Descriptions.Item>
                            <Descriptions.Item label="销售订单号">{record.orderNo}</Descriptions.Item>
                            <Descriptions.Item label="客户备注" span={2}>{record.remark || '-'}</Descriptions.Item>
                        </Descriptions>

                        <Divider titlePlacement="left" style={{ margin: '16px 0' }}>发货明细</Divider>
                        <Table 
                            dataSource={items} 
                            columns={columns} 
                            pagination={false} 
                            size="small" 
                            bordered
                            rowKey="id"
                        />

                        <Divider titlePlacement="left" style={{ margin: '16px 0' }}>附件及费用信息</Divider>
                        <Row gutter={24}>
                            <Col span={12}>
                                <div className="bg-gray-50 p-4 rounded h-full">
                                    <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>附件信息</Title>
                                    {record.attachments && record.attachments.length > 0 ? (
                                        <Space orientation="vertical">
                                            {record.attachments.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-white border rounded">
                                                    <PaperClipOutlined className="text-gray-400" />
                                                    <Text ellipsis style={{ maxWidth: 200 }}>{file.name}</Text>
                                                    <Button type="link" size="small">查看</Button>
                                                </div>
                                            ))}
                                        </Space>
                                    ) : (
                                        <Text type="secondary">无附件</Text>
                                    )}
                                    
                                    {record.paymentImages && record.paymentImages.length > 0 && (
                                        <div className="mt-4">
                                            <Title level={5} style={{ fontSize: 14, marginBottom: 12 }}>付款凭证</Title>
                                            <Space size="small" wrap>
                                                {record.paymentImages.map((img, i) => (
                                                    <img key={i} src={img.url} alt="voucher" className="w-16 h-16 object-cover border rounded cursor-pointer" />
                                                ))}
                                            </Space>
                                        </div>
                                    )}
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="bg-gray-50 p-4 rounded text-right space-y-1">
                                    <Title level={5} style={{ margin: '0 0 10px 0', textAlign: 'left' }}>订单费用汇总</Title>
                                    <div>产品总额: <Text strong>¥{(productTotal).toFixed(2)}</Text></div>
                                    <div>折后金额: <Text strong type="danger">¥{discountedProductTotal.toFixed(2)}</Text></div>
                                    <div>其他费用: <Text strong>¥{otherFee.toFixed(2)}</Text></div>
                                    <Divider style={{ margin: '8px 0' }} />
                                    <div className="text-base font-bold">
                                        订单总额: ¥{orderTotal.toFixed(2)}
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="text-lg text-blue-600 font-bold">
                                            本次发货产品金额: ¥{(currentShipmentAmount || 0).toFixed(2)}
                                        </div>
                                        <Text type="secondary" size="small">(按折后单价计算)</Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="bg-blue-50 p-4 rounded border border-blue-100" style={{ marginTop: 24 }}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item name="action" label="审批意见" rules={[{ required: true }]}>
                                        <Radio.Group buttonStyle="solid">
                                            <Radio.Button value="pass">审批同意</Radio.Button>
                                            <Radio.Button value="reject">审批拒绝</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item name="remark" label="审批备注" rules={[{ required: true, message: '请填写审批意见' }]}>
                                        <TextArea rows={2} placeholder="请输入具体的审核意见" />
                                    </Form.Item>
                                </Col>
                            </Row>
                        </div>
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-400">加载中...</div>
                )}
            </Form>
        </Modal>
    );
};

export default FinanceAuditModal;
