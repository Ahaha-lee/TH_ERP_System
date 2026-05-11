
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { 
    Modal, 
    Form, 
    Radio, 
    Input, 
    message, 
    Descriptions, 
    Divider, 
    Table, 
    Tag,
    Row,
    Col,
    Select
} from 'antd';

const { TextArea } = Input;
const { Option } = Select;

// Hardcoded warehouses and bins for select
const MOCK_WAREHOUSES = [
    { id: 'wh-1', name: '一厂成品仓', bins: ['A区-01-01', 'A区-01-02', '退货存放区'] },
    { id: 'wh-2', name: '二厂原料虚拟仓', bins: ['默认货位'] },
    { id: 'wh-3', name: '原材料仓库', bins: ['R-01-01', 'R-01-02', 'R-01-03'] },
    { id: 'wh-4', name: '主成品仓库', bins: ['A-01-01', 'A-01-02'] },
    { id: 'wh-5', name: '珠海分仓', bins: ['B-02-01', 'B-02-02'] },
];

const InboundAuditModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (record && record.items) {
            setItems(record.items.map((item, index) => ({
                ...item,
                key: item.id || `item-${index}`,
                warehouseName: item.warehouseName || MOCK_WAREHOUSES[0].name,
                bin: item.bin || ''
            })));
        }
    }, [record]);

    const handleItemChange = (key, field, value) => {
        setItems(prev => prev.map(item => 
            item.key === key ? { ...item, [field]: value } : item
        ));
    };

    const handleOk = () => {
        if (!record) return;
        form.validateFields().then(values => {
            onSuccess({
                ...record,
                items: items, // Include updated warehouse/bin Info
                status: values.action === 'pass' ? '已入库' : '已审核', 
                inboundDate: values.action === 'pass' ? dayjs().format('YYYY-MM-DD') : record.inboundDate,
                auditResult: values.action === 'pass' ? '通过' : '拒绝',
                auditRemark: values.remark,
                auditTime: new Date().toLocaleString(),
                auditor: '当前管理员'
            });
            message.success('审核处理成功');
            form.resetFields();
        });
    };

    // Dynamic configuration based on type
    let relOrderLabel = '关联单号';
    let partnerLabel = '相关方';
    let qtyLabel = '数量';
    let hasPrice = false;
    let priceLabel = '单价';
    let extraQtyColumns = [];

    if (record) {
        switch (record.type) {
            case '采购入库':
                relOrderLabel = '关联采购单号';
                partnerLabel = '供应商名称';
                extraQtyColumns = [
                    { title: '待入库', dataIndex: 'pendingQty', width: 100, align: 'right' },
                ];
                qtyLabel = '本次入库';
                hasPrice = true;
                priceLabel = '采购单价';
                break;
            case '退货入库':
                relOrderLabel = '关联售后单号';
                partnerLabel = '客户名称';
                extraQtyColumns = [
                    { title: '退货数量', dataIndex: 'returnQty', width: 100, align: 'right' },
                ];
                qtyLabel = '本次入库';
                break;
            case '受托入库':
                relOrderLabel = '关联受托销售单号';
                partnerLabel = '客户名称';
                extraQtyColumns = [
                    { title: '销售单数量', dataIndex: 'orderQty', width: 100, align: 'right' },
                ];
                qtyLabel = '本次入库';
                break;
            case '委外入库':
                relOrderLabel = '关联委外采购号';
                partnerLabel = '供应商名称';
                extraQtyColumns = [
                    { title: '委外数量', dataIndex: 'processQty', width: 100, align: 'right' },
                    { title: '已入库', dataIndex: 'finishedQty', width: 100, align: 'right' },
                ];
                qtyLabel = '本次入库';
                hasPrice = true;
                priceLabel = '加工费单价';
                break;
            default:
                break;
        }
    }

    const columns = [
        { title: '物料编码', dataIndex: 'productCode', width: 120 },
        { title: '物料名称', dataIndex: 'productName' },
        { title: '规格', dataIndex: 'spec', ellipsis: true },
        { title: '单位', dataIndex: 'unit', width: 60 },
        ...extraQtyColumns.map(col => ({ ...col, render: (val) => val || '-' })),
        { title: qtyLabel, dataIndex: 'quantity', width: 100, align: 'right', render: (val) => val || '-' },
        ...(hasPrice ? [{ title: priceLabel, dataIndex: 'price', width: 100, align: 'right', render: (val) => `￥${val?.toFixed(2) || '0.00'}` }] : []),
        { 
            title: '入库仓库', 
            dataIndex: 'warehouseName', 
            width: 150,
            render: (text, recordItem) => (
                <Select 
                    value={text} 
                    size="small" 
                    style={{ width: '100%' }}
                    onChange={(val) => handleItemChange(recordItem.key, 'warehouseName', val)}
                >
                    {MOCK_WAREHOUSES.map(wh => (
                        <Option key={wh.id} value={wh.name}>{wh.name}</Option>
                    ))}
                </Select>
            )
        },
        { 
            title: '货位', 
            dataIndex: 'bin', 
            width: 150,
            render: (text, recordItem) => {
                const currentWarehouse = MOCK_WAREHOUSES.find(wh => wh.name === recordItem.warehouseName);
                const bins = currentWarehouse ? currentWarehouse.bins : [];
                return (
                    <Select 
                        value={text} 
                        size="small" 
                        allowClear
                        placeholder="请选择货位"
                        style={{ width: '100%' }}
                        onChange={(val) => handleItemChange(recordItem.key, 'bin', val)}
                    >
                        {bins.map(bin => (
                            <Option key={bin} value={bin}>{bin}</Option>
                        ))}
                    </Select>
                );
            }
        },
    ];

    return (
        <Modal forceRender
            title={`审核入库单 - ${record?.orderNo || ''}`}
            open={open}
            onCancel={() => {
                form.resetFields();
                onCancel();
            }}
            onOk={handleOk}
            width={1100}
            centered
            okText="提交审核"
            cancelText="取消"
        >
            {record ? (
                <>
                    <Descriptions bordered size="small" column={3}>
                        <Descriptions.Item label="入库单号">{record.orderNo}</Descriptions.Item>
                        <Descriptions.Item label={relOrderLabel}>{record.relOrderNo || '-'}</Descriptions.Item>
                        <Descriptions.Item label={partnerLabel}>{record.partnerName || '-'}</Descriptions.Item>
                        <Descriptions.Item label="仓管员">{record.operator || '管理员'}</Descriptions.Item>
                        <Descriptions.Item label="备注" span={2}>{record.remark || '-'}</Descriptions.Item>
                    </Descriptions>

                    <Divider titlePlacement="left" style={{ margin: '16px 0' }}>物料明细</Divider>
                    <Table 
                        dataSource={items} 
                        columns={columns} 
                        pagination={false} 
                        size="small" 
                        bordered
                        rowKey="key"
                        scroll={{ x: 1000 }}
                    />

                    <Divider style={{ margin: '24px 0 16px 0' }} />

                    <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                        <Row gutter={24}>
                            <Col span={8}>
                                <Form.Item name="action" label="审核操作" rules={[{ required: true }]}>
                                    <Radio.Group buttonStyle="solid">
                                        <Radio.Button value="pass">通过</Radio.Button>
                                        <Radio.Button value="reject">拒绝</Radio.Button>
                                    </Radio.Group>
                                </Form.Item>
                            </Col>
                            <Col span={16}>
                                <Form.Item name="remark" label="审核意见" rules={[{ required: true, message: '请填写审核意见' }]}>
                                    <TextArea rows={2} placeholder="请输入审核意见" />
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </>
            ) : null}
        </Modal>
    );
};

export default InboundAuditModal;
