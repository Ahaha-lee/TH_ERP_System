
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
    Col,
    Select
} from 'antd';
import { warehouses } from '../../mock';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const WarehouseAuditModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (open && record) {
            setItems(record.items || []);
        }
    }, [open, record]);

    const handleItemChange = (index, field, value) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        setItems(newItems);
    };

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
        { title: '产品编码', dataIndex: 'productCode', width: 110 },
        { title: '产品名称', dataIndex: 'productName', width: 140 },
        { title: '规格', dataIndex: 'spec', width: 110 },
        { title: '当前库存', dataIndex: 'stock', width: 90, align: 'right', render: (v) => <Text type="secondary">{v || Math.floor(Math.random() * 200)}</Text> },
        { title: '本次发货数量', dataIndex: 'currentQty', width: 110, align: 'right', render: (v) => <Text strong style={{ color: '#1677ff' }}>{v}</Text> },
        { 
            title: '出库仓库', 
            dataIndex: 'outWarehouse', 
            width: 150,
            render: (val, _, index) => (
                <Select 
                    placeholder="选择仓库" 
                    style={{ width: '100%' }} 
                    value={val}
                    size="small"
                    onChange={(v) => handleItemChange(index, 'outWarehouse', v)}
                >
                    {warehouses.map(w => <Option key={w.id} value={w.name}>{w.name}</Option>)}
                </Select>
            )
        },
        { 
            title: '批次号', 
            dataIndex: 'batchNo', 
            width: 140,
            render: (val, _, index) => (
                <Select 
                    placeholder="选择批次" 
                    value={val}
                    size="small"
                    style={{ width: '100%' }}
                    onChange={(v) => handleItemChange(index, 'batchNo', v)}
                >
                    <Option value="20240501A">20240501A</Option>
                    <Option value="20240501B">20240501B</Option>
                    <Option value="20240502A">20240502A</Option>
                    <Option value="20250101X">20250101X</Option>
                </Select>
            )
        },
        { 
            title: '货位', 
            dataIndex: 'location', 
            width: 120,
            render: (val, _, index) => (
                <Select 
                    placeholder="选择货位" 
                    value={val}
                    size="small"
                    allowClear
                    style={{ width: '100%' }}
                    onChange={(v) => handleItemChange(index, 'location', v)}
                >
                    <Option value="A-01-01">A-01-01</Option>
                    <Option value="A-01-02">A-01-02</Option>
                    <Option value="B-02-01">B-02-01</Option>
                    <Option value="B-02-02">B-02-02</Option>
                    <Option value="C-03-01">C-03-01</Option>
                    <Option value="备货区-01">备货区-01</Option>
                </Select>
            )
        },
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
            width={1100}
            centered
            okText="确认审批"
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
