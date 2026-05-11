
import React, { useState, useEffect } from 'react';
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
    Select
} from 'antd';
import { warehouses } from '../../../mock/warehouseMock';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const ReturnAuditModal = ({ open, record, onCancel, onSuccess, readonly }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (record && record.items) {
            setItems(record.items.map((item, index) => ({
                ...item,
                key: item.id || `item-${index}`,
                warehouseName: item.warehouseName || undefined,
                bin: item.bin || undefined
            })));
        } else {
            setItems([]);
        }
    }, [record, open]);

    const handleOk = () => {
        if (!record) return;
        if (readonly) {
            onCancel();
            return;
        }
        form.validateFields().then(values => {
            message.success('审批完成');
            onSuccess({
                ...record,
                items: items,
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                auditRemark: values.remark,
                auditTime: new Date().toLocaleString(),
                auditor: '系统管理员'
            });
            form.resetFields();
        });
    };

    const handleItemChange = (key, field, value) => {
        const newItems = items.map(item => {
            if (item.key === key) {
                const newItem = { ...item, [field]: value };
                // If warehouse changes, reset bin
                if (field === 'warehouseName') {
                    newItem.bin = undefined;
                }
                return newItem;
            }
            return item;
        });
        setItems(newItems);
    };

    const columns = [
        { title: '产品编码', dataIndex: 'productCode', width: 120 },
        { title: '产品名称', dataIndex: 'productName', width: 150 },
        { title: '规格', dataIndex: 'spec', width: 120 },
        { title: '属性', dataIndex: 'property', width: 100 },
        { title: '单位', dataIndex: 'unit', width: 80 },
        { title: '原单数量', dataIndex: 'originalQuantity', width: 100, align: 'right' },
        { title: '已发货数量', dataIndex: 'shippedQuantity', width: 100, align: 'right' },
        { title: '已退货数量', dataIndex: 'returnedQuantity', width: 100, align: 'right' },
        { 
            title: '可退数量', 
            dataIndex: 'returnableQuantity', 
            width: 100, 
            align: 'right',
            render: (_, r) => (r.shippedQuantity - r.returnedQuantity) || 0
        },
        { title: '本次退货数量', dataIndex: 'returnQuantity', width: 100, align: 'right', render: (v) => <Text strong>{v}</Text> },
        { 
            title: '入库仓库', 
            dataIndex: 'warehouseName', 
            width: 160,
            render: (text, recordItem) => (
                <Select
                    placeholder="请选择仓库"
                    value={text}
                    style={{ width: '100%' }}
                    size="small"
                    allowClear
                    disabled={readonly}
                    onChange={(val) => handleItemChange(recordItem.key, 'warehouseName', val)}
                >
                    {warehouses.map(wh => (
                        <Option key={wh.id} value={wh.name}>{wh.name}</Option>
                    ))}
                </Select>
            )
        },
        { 
            title: '货位', 
            dataIndex: 'bin', 
            width: 160,
            render: (text, recordItem) => {
                const wh = warehouses.find(h => h.name === recordItem.warehouseName);
                const bins = wh ? wh.locations : [];
                return (
                    <Select
                        placeholder="请选择货位"
                        value={text}
                        style={{ width: '100%' }}
                        size="small"
                        allowClear
                        disabled={!recordItem.warehouseName || readonly}
                        onChange={(val) => handleItemChange(recordItem.key, 'bin', val)}
                    >
                        {bins.map(loc => (
                            <Option key={loc.id} value={loc.name}>{loc.name}</Option>
                        ))}
                    </Select>
                );
            }
        },
        { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    ];

    return (
        <Modal 
            forceRender
            title={record ? `退货单审批 - ${record.returnNo}` : '退货单审批'}
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
            {record ? (
                <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="退货单号">{record.returnNo}</Descriptions.Item>
                        <Descriptions.Item label="原销售订单号">{record.sourceOrderNo}</Descriptions.Item>
                        <Descriptions.Item label="客户名称">{record.customerName}</Descriptions.Item>
                        <Descriptions.Item label="申请日期">{record.date || record.orderDate}</Descriptions.Item>
                        <Descriptions.Item label="项目（子公司）">{record.subsidiary || '默认子公司'}</Descriptions.Item>
                        <Descriptions.Item label="业务员">{record.salesperson}</Descriptions.Item>
                        <Descriptions.Item label="退货原因" span={3}>{record.returnReason}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left" style={{ margin: '16px 0' }}>退货产品明细</Divider>
                    <Table 
                        dataSource={items} 
                        columns={columns} 
                        pagination={false} 
                        size="small" 
                        bordered
                        scroll={{ x: 1600 }}
                        rowKey="key"
                    />

                    {!readonly && (
                        <>
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
                        </>
                    )}
                    
                    <Divider titlePlacement="left" style={{ margin: '24px 0 16px 0' }}>审批历史</Divider>
                    <Table 
                        size="small"
                        bordered
                        pagination={false}
                        dataSource={record.status === '草稿' ? [] : [
                            { 
                                node: '提交申请', 
                                operator: record.salesperson || '业务员', 
                                time: record.createdAt || record.date || '2025-04-29 09:00:00', 
                                result: '提交', 
                                remark: '退货申请提交' 
                            },
                            record.auditTime ? { 
                                node: '仓库审核', 
                                operator: record.auditor || '仓库主管', 
                                time: record.auditTime, 
                                result: record.auditResult || '审核通过', 
                                remark: record.auditRemark || '确认退货产品' 
                            } : null,
                            record.financeAuditTime ? { 
                                node: '财务审核', 
                                operator: record.financeAuditor || '财务主管', 
                                time: record.financeAuditTime, 
                                result: record.financeAuditResult || '审核通过', 
                                remark: record.financeAuditRemark || '费项确认' 
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
            ) : null}
        </Modal>
    );
};

export default ReturnAuditModal;
