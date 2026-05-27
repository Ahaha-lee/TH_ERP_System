
import React, { useState, useEffect } from 'react';
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
    Col
} from 'antd';

const { TextArea } = Input;
const { Text } = Typography;

const WarehouseAuditModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (open && record) {
            setItems(record.items || []);
        }
    }, [open, record]);

    const handleOk = () => {
        if (!record) return;
        form.validateFields().then(values => {
            message.success('仓库审核处理成功');
            onSuccess({
                ...record,
                items, // Include updated items with warehouse/location
                status: values.action === 'pass' ? '已审批' : '待财务审批',
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                warehouseAuditResult: values.action === 'pass' ? '通过' : '拒绝',
                warehouseAuditRemark: values.remark,
                warehouseAuditor: '仓库主管',
                warehouseAuditTime: new Date().toLocaleString()
            });
            form.resetFields();
        });
    };

    const columns = [
        { title: '销售订单号', dataIndex: 'sourceOrderNo', width: 140, render: (v, rec) => v || record?.orderNo || '-' },
        { 
            title: '客户名称（编码/名称）',   
            dataIndex: 'customerName', 
            width: 180,
            render: (v, rec) => {
                const name = v || record?.customerName || '-';
                const code = rec.customerCode || record?.customerCode || 'CUST-001';
                return `${code}/${name}`;
            }
        },
        { title: '产品编码', dataIndex: 'productCode', width: 110 },
        { title: '产品名称', dataIndex: 'productName', width: 140 },
        { title: '规格', dataIndex: 'spec', width: 110 },
        { title: '库存数量', dataIndex: 'stock', width: 90, align: 'right', render: (v) => <Text type="secondary">{v !== undefined ? v : 120}</Text> },
        { title: '可用数量', dataIndex: 'availableQty', width: 90, align: 'right', render: (v, rec) => <span className="text-emerald-600 font-semibold">{v !== undefined ? v : Math.floor((rec.stock !== undefined ? rec.stock : 120) * 0.85)}</span> },
        { title: '占用数量', dataIndex: 'allocatedQty', width: 90, align: 'right', render: (v, rec) => <span className="text-amber-600">{v !== undefined ? v : Math.floor((rec.stock !== undefined ? rec.stock : 120) * 0.15)}</span> },
        { title: '本次发货数量', dataIndex: 'currentQty', width: 110, align: 'right', render: (v) => <Text strong style={{ color: '#1677ff' }}>{v}</Text> },
    ];

    return (
        <Modal forceRender
            title={`仓库审批 - ${record?.noticeNo || ''}`}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1150}
            centered
            okText="确认审批"
            cancelText="取消"
        >
            <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                {record ? (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                        <Descriptions bordered size="small" column={3} styles={{ label: { width: 120 } }}>
                            <Descriptions.Item label="发货单号">{record.noticeNo || '-'}</Descriptions.Item>
                            <Descriptions.Item label="业务员">{record.salesperson || '-'}</Descriptions.Item>
                            <Descriptions.Item label="创建日期">{record.createdAt || '-'}</Descriptions.Item>
                            <Descriptions.Item label="备注" span={3}>{record.remark || '-'}</Descriptions.Item>
                        </Descriptions>

                        <Divider titlePlacement="left" style={{ margin: '16px 0' }}>发货产品明细</Divider>
                        <Table 
                            dataSource={items} 
                            columns={columns} 
                            pagination={false} 
                            size="small" 
                            bordered
                            rowKey="id"
                        />

                        <div style={{ marginTop: 24 }}>
                            <Row gutter={24}>
                                <Col span={8}>
                                    <Form.Item name="action" label="审批操作" rules={[{ required: true }]}>
                                        <Radio.Group buttonStyle="solid">
                                            <Radio.Button value="pass">审批同意</Radio.Button>
                                            <Radio.Button value="reject">审批拒绝</Radio.Button>
                                        </Radio.Group>
                                    </Form.Item>
                                </Col>
                                <Col span={16}>
                                    <Form.Item name="remark" label="审批备注" rules={[{ required: true, message: '请填写审批意见' }]}>
                                        <TextArea rows={2} placeholder="请输入审批意见" />
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

export default WarehouseAuditModal;
