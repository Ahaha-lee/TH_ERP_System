
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
    Select
} from 'antd';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const ExchangeWarehouseAuditModal = ({ open, record, onCancel, onSuccess, readonly }) => {
    const [form] = Form.useForm();

    const handleOk = () => {
        if (!record) return;
        if (readonly) {
            onCancel();
            return;
        }
        form.validateFields().then(values => {
            message.success('仓库审核处理成功');
            onSuccess({
                ...record,
                status: values.action === 'pass' ? '待出库' : '待仓库审批',
                warehouseAuditResult: values.action === 'pass' ? '通过' : '拒绝',
                warehouseAuditRemark: values.remark,
                warehouseAuditor: '仓库主管',
                warehouseAuditTime: new Date().toLocaleString()
            });
            form.resetFields();
        });
    };

    if (!record) return null;

    const returnItems = record.items?.filter(i => i.action === '退回') || [];
    const exchangeItems = record.items?.filter(i => i.action === '换出') || [];

    const returnColumns = [
        { title: '产品名称', dataIndex: 'productName' },
        { title: '属性', dataIndex: 'property' },
        { title: '可退数量', dataIndex: 'availableQuantity' },
        { title: '本次退回数量', dataIndex: 'currentReturnQuantity', align: 'right' },
        { title: '单价', dataIndex: 'originalUnitPrice', align: 'right', render: (v) => `¥${Number(v || 0).toFixed(2)}` },
        { title: '金额', align: 'right', render: (_, r) => `¥${Number((r.currentReturnQuantity || 0) * (r.originalUnitPrice || 0)).toFixed(2)}` }
    ];

    const exchangeColumns = [
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '属性', dataIndex: 'property', width: 100 },
        { title: '数量', dataIndex: 'quantity', align: 'right', width: 80 },
        { 
            title: '出库仓库', 
            dataIndex: 'warehouse',
            width: 140,
            render: (val) => (
                <Select disabled={readonly} placeholder="选择仓库" style={{ width: '100%' }} size="small" defaultValue={val || '成品仓'}>
                    <Option value="成品仓">成品仓</Option>
                    <Option value="配件仓">配件仓</Option>
                    <Option value="海外仓">海外仓</Option>
                </Select>
            )
        },
        { 
            title: '货位', 
            dataIndex: 'location',
            width: 120,
            render: (val) => (
                <Select disabled={readonly} placeholder="选择货位" style={{ width: '100%' }} size="small" defaultValue={val || 'A-01-01'}>
                    <Option value="A-01-01">A-01-01</Option>
                    <Option value="A-01-02">A-01-02</Option>
                    <Option value="B-02-01">B-02-01</Option>
                    <Option value="B-02-02">B-02-02</Option>
                </Select>
            )
        },
        { 
            title: '批次号', 
            dataIndex: 'batchNo',
            width: 140,
            render: (val) => (
                <Select disabled={readonly} placeholder="选择批次" style={{ width: '100%' }} size="small" defaultValue={val || '20240501A'}>
                    <Option value="20240501A">20240501A</Option>
                    <Option value="20240501B">20240501B</Option>
                    <Option value="20240502A">20240502A</Option>
                </Select>
            )
        },
        { title: '单价', dataIndex: 'unitPrice', align: 'right', width: 100, render: (v) => `¥${Number(v || 0).toFixed(2)}` },
        { title: '金额', align: 'right', width: 100, render: (_, r) => `¥${Number((r.quantity || 0) * (r.unitPrice || 0)).toFixed(2)}` }
    ];

    return (
        <Modal forceRender
            title="换货单仓库审批"
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1200}
            centered
            okText={readonly ? '关闭' : '确认'}
            cancelText="取消"
            cancelButtonProps={readonly ? { style: { display: 'none' } } : {}}
        >
            <div style={{ maxHeight: '70vh', overflowY: 'auto', paddingRight: 8 }}>
                <Descriptions bordered size="small" column={2}>
                    <Descriptions.Item label="换货单号">{record.exchangeNo}</Descriptions.Item>
                    <Descriptions.Item label="原销售订单号">{record.orderNo}</Descriptions.Item>
                    <Descriptions.Item label="客户名称" span={2}>{record.customerName}</Descriptions.Item>
                </Descriptions>

                <Divider titlePlacement="left" style={{ margin: '16px 0' }}>退回旧货列表</Divider>
                <Table 
                    dataSource={returnItems} 
                    columns={returnColumns} 
                    pagination={false} 
                    size="small" 
                    bordered
                    rowKey="id"
                />

                <Divider titlePlacement="left" style={{ margin: '16px 0' }}>换出新货列表</Divider>
                <Table 
                    dataSource={exchangeItems} 
                    columns={exchangeColumns} 
                    pagination={false} 
                    size="small" 
                    bordered
                    rowKey="id"
                />

                {!readonly && (
                    <Form form={form} layout="vertical" initialValues={{ action: 'pass' }} style={{ marginTop: 24 }}>
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
                )}

                <Divider titlePlacement="left" style={{ margin: '24px 0 16px 0' }}>审批历史</Divider>
                <Table 
                    size="small"
                    bordered
                    pagination={false}
                    dataSource={[
                        { 
                            node: '提交申请', 
                            operator: record.salesperson || '业务员', 
                            time: record.createdAt || record.date || '2025-04-29 09:00:00', 
                            result: '提交', 
                            remark: '换货申请提交' 
                        },
                        record.warehouseAuditTime ? { 
                            node: '仓库审核', 
                            operator: record.warehouseAuditor || '仓库主管', 
                            time: record.warehouseAuditTime, 
                            result: record.warehouseAuditResult || '审核通过', 
                            remark: record.warehouseAuditRemark || '换货仓库确认完成' 
                        } : null
                    ].filter(Boolean)}
                    columns={[
                        { title: '审批环节', dataIndex: 'node', width: 120 },
                        { title: '操作人', dataIndex: 'operator', width: 120 },
                        { title: '操作时间', dataIndex: 'time', width: 160 },
                        { title: '审批结果', dataIndex: 'result', width: 120 },
                        { title: '审批意见', dataIndex: 'remark' },
                    ]}
                    rowKey="node"
                />
            </div>
        </Modal>
    );
};

export default ExchangeWarehouseAuditModal;
