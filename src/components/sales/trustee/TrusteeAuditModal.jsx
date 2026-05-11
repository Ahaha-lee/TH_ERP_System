
import React, { useState } from 'react';
import { 
    Modal, 
    Form, 
    Radio, 
    Input, 
    message, 
    Typography, 
    Descriptions, 
    Divider, 
    Table, 
    Row, 
    Col, 
    Tag,
    Select
} from 'antd';
import { warehouses } from '../../../mock/data';

const { TextArea } = Input;
const { Text, Title } = Typography;
const { Option } = Select;

const TrusteeAuditModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    React.useEffect(() => {
        if (record && record.items) {
            setItems(record.items.map(item => ({
                ...item,
                warehouse: item.warehouse || '成品仓',
                location: item.location || 'A-01-01'
            })));
        }
    }, [record]);

    const handleOk = () => {
        if (!record) return;
        form.validateFields().then(values => {
            message.success('审批处理成功');
            onSuccess({
                ...record,
                items: items,
                status: values.action === 'pass' ? '已审核' : record.status, 
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                auditRemark: values.remark,
                auditTime: new Date().toLocaleString(),
                auditor: '当前管理员'
            });
            form.resetFields();
        });
    };

    if (!record) return null;

    const productColumns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '数量', dataIndex: 'quantity', width: 80, align: 'right' },
        { 
            title: '出库仓库', 
            dataIndex: 'warehouse',
            width: 150,
            render: (val, row) => (
                <Select 
                    style={{ width: '100% '}} 
                    size="small" 
                    value={val}
                    onChange={(newVal) => {
                        setItems(items.map(it => it.id === row.id ? { ...it, warehouse: newVal } : it));
                    }}
                >
                    {warehouses.map(w => <Option key={w.id} value={w.name}>{w.name}</Option>)}
                </Select>
            )
        },
        { 
            title: '货位', 
            dataIndex: 'location',
            width: 150,
            render: (val, row) => (
                <Select 
                    style={{ width: '100% '}} 
                    size="small" 
                    value={val}
                    allowClear
                    placeholder="请选择"
                    onChange={(newVal) => {
                        setItems(items.map(it => it.id === row.id ? { ...it, location: newVal } : it));
                    }}
                >
                    <Option value="A-01-01">A-01-01</Option>
                    <Option value="A-01-02">A-01-02</Option>
                    <Option value="B-02-01">B-02-01</Option>
                    <Option value="R-01-01">R-01-01</Option>
                </Select>
            )
        },
        { title: '单价', dataIndex: 'unitPrice', width: 100, align: 'right', render: (v) => `¥${(v || 0).toFixed(2)}` },
        { title: '金额', dataIndex: 'amount', width: 120, align: 'right', render: (v) => <Text strong type="danger">¥{(v || 0).toFixed(2)}</Text> },
    ];

    return (
        <Modal forceRender
            title={`审批受托加工订单 - ${record.orderNo}`}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1200}
            centered
            okText="确认"
            cancelText="取消"
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                <Descriptions bordered size="small" column={3}>
                    <Descriptions.Item label="来源报价">{record.quotationNo || '-'}</Descriptions.Item>
                    <Descriptions.Item label="客户名称">{record.customerName}</Descriptions.Item>
                    <Descriptions.Item label="订单日期">{record.orderDate}</Descriptions.Item>
                    <Descriptions.Item label="期望发货日期">{record.expectDeliveryDate || '-'}</Descriptions.Item>
                    <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                    <Descriptions.Item label="当前状态"><Tag color="blue">{record.status}</Tag></Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="left" style={{ margin: '16px 0' }}>产品明细</Divider>
                <Table 
                    dataSource={items} 
                    columns={productColumns} 
                    pagination={false} 
                    size="small" 
                    bordered
                    rowKey="id"
                />

                {record.productionRemark && (
                    <div style={{ marginTop: 16 }}>
                        <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>生产备注</Title>
                        <div className="bg-gray-50 p-2 border rounded border-gray-200">
                            {record.productionRemark}
                        </div>
                    </div>
                )}

                <div className="mt-4 text-right">
                    <Text size="large">总额: </Text>
                    <Text strong type="danger" style={{ fontSize: 20 }}>¥{(record.totalAmount || 0).toFixed(2)}</Text>
                </div>

                <Divider style={{ margin: '24px 0 16px 0' }} />

                <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                    <Row gutter={24}>
                        <Col span={8}>
                            <Form.Item name="action" label="审批操作" rules={[{ required: true }]}>
                                <Radio.Group buttonStyle="solid">
                                    <Radio.Button value="pass">审批通过</Radio.Button>
                                    <Radio.Button value="reject">审批拒绝</Radio.Button>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                        <Col span={16}>
                            <Form.Item name="remark" label="审批意见" rules={[{ required: true, message: '请填写审批意见' }]}>
                                <TextArea rows={2} placeholder="请输入审批意见" />
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </div>
        </Modal>
    );
};

export default TrusteeAuditModal;
