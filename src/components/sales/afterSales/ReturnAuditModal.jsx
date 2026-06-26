
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
    Select,
    Tag,
    Button,
    InputNumber,
    Upload,
    Image,
    Space
} from 'antd';
import { PlusOutlined, BarcodeOutlined } from '@ant-design/icons';
import { warehouses } from '../../../mock/warehouseMock';

const { TextArea } = Input;
const { Text } = Typography;
const { Option } = Select;

const ReturnAuditModal = ({ open, record, onCancel, onSuccess, readonly }) => {
    const [form] = Form.useForm();
    const [items, setItems] = useState([]);
    const [adjustModalVisible, setAdjustModalVisible] = useState(false);
    const [selectedItemKey, setSelectedItemKey] = useState(null);
    const [adjustTableData, setAdjustTableData] = useState([]);
    const [scanValue, setScanValue] = useState('');

    const handleOpenAdjustModal = (recordItem) => {
        setSelectedItemKey(recordItem.key);
        if (recordItem.adjustments && recordItem.adjustments.length > 0) {
            setAdjustTableData(recordItem.adjustments.map((adj, idx) => ({
                key: adj.key || `${recordItem.key}-adj-${idx}`,
                serialNo: adj.serialNo || '',
                isProductCode: adj.isProductCode || false,
                warehouseName: adj.warehouseName,
                bin: adj.bin,
                quantity: adj.quantity
            })));
        } else {
            setAdjustTableData([
                {
                    key: `${recordItem.key}-adj-0`,
                    serialNo: '',
                    isProductCode: false,
                    warehouseName: recordItem.warehouseName || (warehouses[0]?.name || ''),
                    bin: recordItem.bin || '',
                    quantity: recordItem.returnQuantity || 0
                }
            ]);
        }
        setAdjustModalVisible(true);
    };

    const handleAddWarehouseRow = () => {
        const newKey = `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        setAdjustTableData(prev => [
            ...prev,
            {
                key: newKey,
                serialNo: '',
                isProductCode: false,
                warehouseName: warehouses[0]?.name || '',
                bin: '',
                quantity: 0
            }
        ]);
    };

    const handleScanAdd = (customValue) => {
        const rawVal = typeof customValue === 'string' ? customValue : scanValue;
        const trimmed = rawVal ? rawVal.trim() : '';
        if (!trimmed) {
            message.warning('请先输入或扫描序列号或产品码！');
            return;
        }
        
        // Check format error simulation
        if (trimmed.startsWith('ERR_INVALID') || trimmed === 'INVALID_BARCODE') {
            message.error('条码格式无效！');
            return;
        }

        // Check occupied simulation
        if (trimmed.startsWith('SN-OCCUPIED') || trimmed === 'SN_OCCUPIED_999') {
            message.error(`该序列号[${trimmed}]已存在于其他退货单中，不可入库`);
            return;
        }

        const currentItem = items.find(item => item.key === selectedItemKey);
        const totalCurrentInbound = adjustTableData.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
        const maxQty = currentItem ? (currentItem.returnQuantity || 0) : 0;

        // Check duplicate scanning
        const exists = adjustTableData.some(item => item.serialNo === trimmed && trimmed);
        if (exists) {
            message.error(`该条码 [${trimmed}] 已在本次录入列表中，请勿重复扫码！`);
            return;
        }

        // Check if total scanned would exceed the max allowed quantity
        if (totalCurrentInbound + 1 > maxQty) {
            message.error(`❌ 扫码异常：本次退货总数已达到退货数量上限（${maxQty} 个），无法继续录入！`);
            return;
        }

        const isProductCode = !trimmed.toUpperCase().startsWith('SN');
        const newRow = {
            key: `scan-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            serialNo: isProductCode ? '' : trimmed,
            isProductCode: isProductCode,
            warehouseName: warehouses[0]?.name || '原材料仓库',
            bin: 'A-01-01',
            quantity: 1
        };

        setAdjustTableData(prev => [...prev, newRow]);
        setScanValue('');
        message.success('录入成功');
    };

    const handleSaveAdjust = () => {
        const selectedItem = items.find(item => item.key === selectedItemKey);
        const maxQuantity = selectedItem ? (selectedItem.returnQuantity || 0) : 0;
        
        const totalAdjusted = adjustTableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);
        if (totalAdjusted > maxQuantity) {
            message.error(`所有实入数量之和（${totalAdjusted}）不能超过 本次退货数量（${maxQuantity}）`);
            return;
        }

        setItems(prev => prev.map(item => {
            if (item.key === selectedItemKey) {
                const firstAdj = adjustTableData[0] || {};
                return {
                    ...item,
                    warehouseName: firstAdj.warehouseName,
                    bin: firstAdj.bin,
                    adjustments: adjustTableData
                };
            }
            return item;
        }));
        setAdjustModalVisible(false);
        message.success('调整仓库成功');
    };

    useEffect(() => {
        if (record && record.items) {
            setItems(record.items.map((item, index) => {
                const key = item.id || `item-${index}`;
                const rQty = item.returnQuantity || 0;
                return {
                    ...item,
                    key,
                    warehouseName: item.warehouseName || undefined,
                    bin: item.bin || undefined,
                    adjustments: (item.adjustments || [
                        {
                            key: `${key}-adj-0`,
                            serialNo: item.serialNo || '',
                            isProductCode: item.isProductCode || false,
                            warehouseName: item.warehouseName || (warehouses[0]?.name || ''),
                            bin: item.bin || '',
                            quantity: rQty
                        }
                    ]).map((adj, i_adj) => ({
                        ...adj,
                        key: adj.key || `${key}-adj-${i_adj}`,
                        serialNo: adj.serialNo || '',
                        isProductCode: adj.isProductCode || false
                    }))
                };
            }));
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
            const images = (values.auditImages || []).map(file => {
                const localUrl = file.originFileObj ? URL.createObjectURL(file.originFileObj) : '';
                return {
                    uid: file.uid,
                    name: file.name,
                    status: 'done',
                    url: file.url || file.thumbUrl || localUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150',
                    thumbUrl: file.thumbUrl || file.url || localUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=150'
                };
            });

            onSuccess({
                ...record,
                items: items,
                auditResult: values.action === 'pass' ? '审批通过' : '审批拒绝',
                auditRemark: values.remark,
                auditImages: images,
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

    const selectedItem = items.find(item => item.key === selectedItemKey);
    const maxQuantity = selectedItem ? (selectedItem.returnQuantity || 0) : 0;
    const totalAdjusted = adjustTableData.reduce((sum, row) => sum + (Number(row.quantity) || 0), 0);

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
        { 
            title: '本次退货数量', 
            dataIndex: 'returnQuantity', 
            width: 110, 
            align: 'right',
            render: (v) => <Text strong>{v || 0}</Text>
        },
        { 
            title: '操作', 
            key: 'action', 
            width: 150, 
            align: 'center',
            render: (_, recordItem) => (
                <Button 
                    type="link" 
                    size="small" 
                    onClick={() => handleOpenAdjustModal(recordItem)}
                >
                    调整仓库
                </Button>
            )
        },
        { title: '备注', dataIndex: 'remark', width: 150, ellipsis: true },
    ];

    return (
        <>
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
                        <Descriptions.Item label="紧急程度" span={3}>
                            <Tag color={(record.urgency === '紧急' || record.isUrgent) ? "red" : "default"}>
                                {record.urgency || (record.isUrgent ? '紧急' : '一般')}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="退货原因" span={3}>{record.returnReason}</Descriptions.Item>
                        {record.auditImages && record.auditImages.length > 0 && (
                            <Descriptions.Item label="审批凭证" span={3}>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {record.auditImages.map((img, idx) => (
                                        <Image
                                            key={idx}
                                            src={img.url || img.thumbUrl}
                                            alt={`凭证-${idx}`}
                                            width={80}
                                            height={80}
                                            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }}
                                        />
                                    ))}
                                </div>
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Divider titlePlacement="left" style={{ margin: '16px 0' }}>退货产品明细</Divider>
                    <Table 
                        dataSource={items} 
                        columns={columns} 
                        pagination={false} 
                        size="small" 
                        bordered
                        scroll={{ x: 1200 }}
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
                                    <Col span={24}>
                                        <Form.Item 
                                            name="auditImages" 
                                            label="上传图片/凭证" 
                                            valuePropName="fileList"
                                            getValueFromEvent={(e) => {
                                                if (Array.isArray(e)) return e;
                                                return e?.fileList || [];
                                            }}
                                            extra="支持上传格式为 jpg, jpeg, png, gif 的图片，最多 5 张"
                                        >
                                            <Upload
                                                listType="picture-card"
                                                beforeUpload={() => false}
                                                maxCount={5}
                                                multiple
                                                accept="image/*"
                                            >
                                                <div>
                                                    <PlusOutlined style={{ fontSize: 18 }} />
                                                    <div style={{ marginTop: 8 }}>上传图片</div>
                                                </div>
                                            </Upload>
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
                            { 
                                title: '审批意见/凭证', 
                                dataIndex: 'remark',
                                render: (text, row) => {
                                    if (row.node === '仓库审核' && record.auditImages && record.auditImages.length > 0) {
                                        return (
                                            <div>
                                                <div>{text}</div>
                                                <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                                    {record.auditImages.map((img, idx) => (
                                                        <Image
                                                            key={idx}
                                                            src={img.url || img.thumbUrl}
                                                            alt={`凭证-${idx}`}
                                                            width={45}
                                                            height={45}
                                                            style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    }
                                    return text;
                                }
                            },
                        ]}
                        rowKey="node"
                    />
                </div>
            ) : null}
        </Modal>

        <Modal
            title="调整仓库"
            open={adjustModalVisible}
            onCancel={() => setAdjustModalVisible(false)}
            onOk={handleSaveAdjust}
            width={780}
            destroyOnHidden
            centered
        >
            <div style={{ marginBottom: 16 }}>
                <Space size="large">
                    <span>
                        <Text strong>产品名称: </Text>
                        <Text className="text-gray-700">{selectedItem?.productName || '-'}</Text>
                    </span>
                    <span>
                        <Text strong>本次退货数量: </Text>
                        <Text className="font-semibold text-blue-600">
                            {maxQuantity || 0} {selectedItem?.unit || '个'}
                        </Text>
                    </span>
                    <span>
                        <Text strong>已分配总量: </Text>
                        <Text strong className={totalAdjusted > maxQuantity ? "text-red-500" : "text-green-600"}>
                            {totalAdjusted} / {maxQuantity || 0}
                        </Text>
                    </span>
                </Space>
            </div>

            {/* 扫码录入的部件占满一行 */}
            <div style={{ marginBottom: 16, padding: '16px', background: '#fafafa', borderRadius: '8px', border: '1px solid #f0f0f0' }}>
                <div style={{ fontWeight: '600', marginBottom: 8, color: '#262626' }}>
                    🔍 扫码录入：
                </div>
                <Space style={{ width: '100%', justifyContent: 'space-between', marginBottom: 8 }} wrap>
                    <Space>
                        <BarcodeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />
                        <Input
                            placeholder="请输入序列号/产品码或扫描条码并回车"
                            value={scanValue}
                            onChange={(e) => setScanValue(e.target.value)}
                            onPressEnter={() => handleScanAdd()}
                            style={{ width: 240 }}
                            allowClear
                        />
                        <Button type="primary" onClick={() => handleScanAdd()}>录入</Button>
                    </Space>
                </Space>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 8, marginTop: 4 }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#8c8c8c', marginBottom: 4 }}>
                        💡 模拟扫码测试工具箱（快捷触发扫码及各种异常检测）：
                    </div>
                    <Space wrap size="small">
                        <Button 
                            size="small" 
                            onClick={() => handleScanAdd(`SN-2026-06${Math.floor(Math.random() * 9000 + 1000)}`)}
                            style={{ color: '#2f54eb', borderColor: '#adc6ff', background: '#f0f5ff', fontSize: '11px' }}
                        >
                            🟢 扫码序列号
                        </Button>
                        <Button 
                            size="small" 
                            onClick={() => handleScanAdd(`PROD-WOOD-${Math.floor(Math.random() * 900 + 100)}`)}
                            style={{ color: '#096dd9', borderColor: '#91d5ff', background: '#e6f7ff', fontSize: '11px' }}
                        >
                            🔵 扫码产品码 (可改仓库/数量)
                        </Button>
                        <Button 
                            size="small" 
                            onClick={() => {
                                if (adjustTableData.length > 0 && adjustTableData.some(i => i.serialNo)) {
                                    const firstScanned = adjustTableData.find(i => i.serialNo);
                                    handleScanAdd(firstScanned.serialNo);
                                } else {
                                    const dummy = 'SN-2026-069999';
                                    handleScanAdd(dummy);
                                    setTimeout(() => handleScanAdd(dummy), 300);
                                }
                            }}
                            style={{ color: '#fa8c16', borderColor: '#ffd591', background: '#fff7e6', fontSize: '11px' }}
                        >
                            ⚠️ 重复扫码
                        </Button>
                        <Button 
                            size="small" 
                            onClick={() => handleScanAdd('ERR_INVALID_CODE')}
                            style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
                        >
                            ❌ 格式错误
                        </Button>
                        <Button 
                            size="small" 
                            onClick={() => handleScanAdd('SN-OCCUPIED_999')}
                            style={{ color: '#f5222d', borderColor: '#ffa39e', background: '#fff1f0', fontSize: '11px' }}
                        >
                            ❌ 被占用
                        </Button>
                    </Space>
                </div>
            </div>

            {/* 按钮在扫码部件下面一行，右侧对齐 */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <Button 
                    type="primary" 
                    icon={<PlusOutlined />}
                    onClick={handleAddWarehouseRow}
                >
                    添加仓库分配
                </Button>
            </div>

            {/* 列表字段：序号、序列号、仓库、货位、实入数量、操作（删除） */}
            <Table
                dataSource={adjustTableData}
                pagination={false}
                size="small"
                bordered
                rowKey="key"
                locale={{ emptyText: <Text type="secondary">暂无分配数据，请点击上方“添加仓库分配”或扫码进行分配</Text> }}
                columns={[
                    {
                        title: '序号',
                        key: 'index',
                        width: 60,
                        render: (_, __, idx) => idx + 1
                    },
                    {
                        title: '序列号',
                        dataIndex: 'serialNo',
                        key: 'serialNo',
                        width: 180,
                        render: (value, record) => {
                            if (value) {
                                if (record.isProductCode) {
                                    return null;
                                }
                                return <Text copyable className="font-mono">{value}</Text>;
                            }
                            return <Text type="secondary">-</Text>;
                        }
                    },
                    {
                        title: '仓库',
                        dataIndex: 'warehouseName',
                        key: 'warehouseName',
                        width: 180,
                        render: (text, recordItem) => (
                            <Select
                                placeholder="请选择仓库"
                                value={text}
                                disabled={recordItem.serialNo && !recordItem.isProductCode}
                                style={{ width: '100%' }}
                                onChange={(val) => {
                                    const newData = adjustTableData.map(item => {
                                        if (item.key === recordItem.key) {
                                            return { ...item, warehouseName: val, bin: undefined };
                                        }
                                        return item;
                                    });
                                    setAdjustTableData(newData);
                                }}
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
                        key: 'bin',
                        width: 180,
                        render: (text, recordItem) => {
                            const wh = warehouses.find(h => h.name === recordItem.warehouseName);
                            const bins = wh ? (wh.locations || []) : [];
                            return (
                                <Select
                                    placeholder="请选择货位"
                                    value={text}
                                    style={{ width: '100%' }}
                                    disabled={!recordItem.warehouseName || (recordItem.serialNo && !recordItem.isProductCode)}
                                    onChange={(val) => {
                                        const newData = adjustTableData.map(item => {
                                            if (item.key === recordItem.key) {
                                                return { ...item, bin: val };
                                            }
                                            return item;
                                        });
                                        setAdjustTableData(newData);
                                    }}
                                >
                                    {bins.map(loc => (
                                        <Option key={loc.id} value={loc.name}>{loc.name}</Option>
                                    ))}
                                </Select>
                            );
                        }
                    },
                    {
                        title: '实入数量',
                        dataIndex: 'quantity',
                        key: 'quantity',
                        width: 120,
                        align: 'right',
                        render: (val, recordItem) => {
                            if (recordItem.serialNo && !recordItem.isProductCode) {
                                return <Text strong className="text-green-600">1</Text>;
                            }
                            return (
                                <InputNumber
                                    min={0.01}
                                    value={val}
                                    style={{ width: '100%' }}
                                    onChange={(v) => {
                                        const newData = adjustTableData.map(item => {
                                            if (item.key === recordItem.key) {
                                                return { ...item, quantity: v || 0 };
                                            }
                                            return item;
                                        });
                                        setAdjustTableData(newData);
                                    }}
                                />
                            );
                        }
                    },
                    {
                        title: '操作',
                        key: 'action',
                        width: 80,
                        align: 'center',
                        render: (_, recordItem) => (
                            <Button
                                type="link"
                                danger
                                size="small"
                                disabled={adjustTableData.length <= 1}
                                onClick={() => {
                                    setAdjustTableData(prev => prev.filter(item => item.key !== recordItem.key));
                                }}
                            >
                                删除
                            </Button>
                        )
                    }
                ]}
            />
        </Modal>
        </>
    );
};

export default ReturnAuditModal;
