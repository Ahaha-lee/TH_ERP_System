import React, { useMemo } from 'react';
import { 
  Drawer, 
  Tabs, 
  Descriptions, 
  Table, 
  Tag, 
  Typography, 
  Divider, 
  Space,
  Row,
  Col,
  Empty,
  Tooltip,
  message
} from 'antd';
import { formatCurrency } from '../../utils/helpers';
import { mockAuditRecords } from '../../mock/data';

const { Text, Title } = Typography;

const NormalOrderDetailDrawer = ({ open, order, record, onClose }) => {
    const activeRecord = record || order;
    
    const calculations = useMemo(() => {
        if (!activeRecord) return { productTotal: 0, discountedProductTotal: 0, totalSaving: 0, taxedProductTotal: 0, orderTotal: 0, depositReceivable: 0 };
        const items = activeRecord.items || [];
        const productTotal = items.reduce((sum, item) => sum + ((item.standardPrice || item.price || 0) * (item.quantity || 0)), 0);
        const discountedProductTotal = items.reduce((sum, item) => sum + (item.amount || ((item.finalPrice || item.unitPrice || 0) * (item.quantity || 0))), 0);
        const totalSaving = productTotal - discountedProductTotal;

        const activeTaxRateStr = activeRecord.taxRate ?? '13%';
        const clean = String(activeTaxRateStr).replace('%', '').trim();
        const num = parseFloat(clean);
        const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);

        const taxedProductTotal = discountedProductTotal * (1 + rate);
        const otherFee = activeRecord.otherFee ?? activeRecord.otherFees ?? 0;
        const orderTotal = taxedProductTotal + otherFee;
        const depositRatio = activeRecord.depositRatio || 0;
        const depositReceivable = activeRecord.isCollectDeposit ? orderTotal * (depositRatio / 100) : 0;

        return {
            productTotal,
            discountedProductTotal,
            totalSaving,
            taxedProductTotal,
            depositReceivable,
            orderTotal
        };
    }, [activeRecord]);
    
    const auditRecords = useMemo(() => {
        if (!activeRecord) return [];
        const records = [...(mockAuditRecords[activeRecord.id] || [])];
        if (activeRecord.auditResult && !records.some(r => r.time === activeRecord.auditTime)) {
            records.unshift({
                time: activeRecord.auditTime || new Date().toLocaleString(),
                operator: activeRecord.auditor || '当前管理员',
                action: activeRecord.auditResult,
                opinion: activeRecord.auditRemark || '-'
            });
        }
        return records;
    }, [activeRecord]);

    const deliveryNoticeData = useMemo(() => {
        if (!activeRecord) return [];
        const list = [];
        if (activeRecord.deliveryNotices) {
            const ids = activeRecord.deliveryNotices.split(',');
            ids.forEach((id) => {
                list.push({
                    id: id.trim(),
                    status: '发货中',
                    product: activeRecord.items?.[0]?.productName || '办公桌椅组合',
                    date: activeRecord.orderDate || '2026-05-22',
                    operator: activeRecord.salesperson || '管理员',
                    stockingNo: 'ST-2026' + String(activeRecord.orderNo).replace(/\D/g, '') + '01'
                });
            });
        } else if (activeRecord.status !== '草稿') {
            list.push({
                id: 'DN-2026' + String(activeRecord.orderNo).replace(/\D/g, '') + '01',
                status: '待发货',
                product: activeRecord.items?.[0]?.productName || '办公桌椅组合',
                date: activeRecord.orderDate || '2026-05-22',
                operator: activeRecord.salesperson || '管理员',
                stockingNo: 'ST-2026' + String(activeRecord.orderNo).replace(/\D/g, '') + '01'
            });
        }
        return list;
    }, [activeRecord]);

    const stockoutData = useMemo(() => {
        if (!activeRecord) return [];
        const list = [];
        if (activeRecord.status !== '草稿') {
            list.push({
                id: 'CK-2026' + String(activeRecord.orderNo).replace(/\D/g, '') + '01',
                product: activeRecord.items?.[0]?.productName || '办公桌椅组合',
                time: activeRecord.orderDate || '2026-05-22',
                operator: '李出库员',
                status: activeRecord.status === '已完成' || activeRecord.status === '全部发货' ? '已出库' : '待出库',
                stockingNo: 'ST-2026' + String(activeRecord.orderNo).replace(/\D/g, '') + '01'
            });
        }
        return list;
    }, [activeRecord]);

    if (!activeRecord) return null;

    const statusColors = {
        '草稿': 'default',
        '待审核': 'orange',
        '已审核': 'success',
        '已完成': 'blue',
        '部分发货': 'warning',
        '全部发货': 'success',
        '回款中': 'processing',
        '完成': 'success'
    };

    const standardProductColumns = [
        { title: '序号', width: 50, align: 'center', fixed: 'left', render: (_, __, i) => i + 1 },
        { title: '产品编码', dataIndex: 'productCode', width: 140, fixed: 'left' },
        { title: '产品名称', dataIndex: 'productName', width: 160 },
        { title: '规格', dataIndex: 'spec', width: 110, ellipsis: true },
        { title: '型号', dataIndex: 'model', width: 90, ellipsis: true },
        { 
          title: '属性', 
          dataIndex: 'property', 
          width: 120, 
          render: (v) => <span className="text-gray-700 font-medium">{v || '标准属性'}</span> 
        },
        { 
          title: '库存数量', 
          dataIndex: 'stockQty', 
          width: 80, 
          align: 'right',
          render: (v) => <span className="font-mono">{v ?? 120}</span>
        },
        { 
          title: '可用数量', 
          dataIndex: 'availableQty', 
          width: 80, 
          align: 'right',
          render: (v) => <span className="font-mono text-blue-600">{v ?? 100}</span>
        },
        { 
          title: '占用数量', 
          dataIndex: 'occupiedQty', 
          width: 80, 
          align: 'right',
          render: (v, rec) => {
            const stock = rec.stockQty ?? 120;
            const avail = rec.availableQty ?? 100;
            const val = rec.occupiedQty ?? (stock - avail >= 0 ? stock - avail : 20);
            return <span className="font-mono text-gray-500">{val}</span>;
          }
        },
        { 
          title: '标准单价', 
          dataIndex: 'standardPrice', 
          width: 100, 
          align: 'right', 
          render: (v, rec) => `¥${(v || rec.price || 0).toFixed(2)}` 
        },
        { 
          title: '价格策略', 
          dataIndex: 'strategyCode', 
          width: 110, 
          align: 'center', 
          render: (v) => {
            const code = v || 'DEFAULT';
            return <a onClick={() => message.info(`正在跳转至价格策略详情: ${code}`)}>{code}</a>;
          }
        },
        { title: '折后单价', dataIndex: 'finalPrice', width: 110, align: 'right', render: (v, rec) => <strong className="font-mono text-gray-900">¥{(v || rec.unitPrice || 0).toFixed(2)}</strong> },
        { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
        { 
          title: '标准总金额', 
          width: 110, 
          align: 'right',
          render: (_, rec) => {
            const price = rec.standardPrice || rec.price || 0;
            const qty = rec.quantity || 0;
            return <span className="font-mono text-gray-700">¥{(price * qty).toFixed(2)}</span>;
          }
        },
        { 
          title: '折后总金额（含税）', 
          width: 145, 
          align: 'right',
          render: (_, rec) => {
            const activeTaxRateStr = activeRecord.taxRate ?? '13%';
            const clean = String(activeTaxRateStr).replace('%', '').trim();
            const num = parseFloat(clean);
            const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);
            const finalPrice = rec.finalPrice || rec.unitPrice || 0;
            const qty = rec.quantity || 0;
            const discountedTaxed = (finalPrice * qty) * (1 + rate);
            return <strong className="font-mono text-amber-600">¥{discountedTaxed.toFixed(2)}</strong>;
          }
        },
        { 
          title: '折后总金额（不含税）', 
          width: 145, 
          align: 'right',
          render: (_, rec) => {
            const finalPrice = rec.finalPrice || rec.unitPrice || 0;
            const qty = rec.quantity || 0;
            return <strong className="font-mono text-emerald-600">¥{(finalPrice * qty).toFixed(2)}</strong>;
          }
        },
        { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true }
    ];

    const customProductColumns = [
        { title: '序号', width: 50, align: 'center', fixed: 'left', render: (_, __, i) => i + 1 },
        { title: '定制品编码', dataIndex: 'productCode', width: 140, fixed: 'left' },
        { title: '定制品名称', dataIndex: 'productName', width: 160 },
        { title: '规格', dataIndex: 'spec', width: 110, ellipsis: true },
        { title: '型号', dataIndex: 'model', width: 90, ellipsis: true },
        { 
          title: '属性', 
          dataIndex: 'property', 
          width: 120, 
          render: (v) => <span className="text-gray-700 font-medium">{v || '标准属性'}</span> 
        },
        { title: '产品类型', dataIndex: 'category', width: 100, render: (v) => v || '定制成品' },
        { 
          title: '库存数量', 
          dataIndex: 'stockQty', 
          width: 80, 
          align: 'right',
          render: (v) => <span className="font-mono">{v ?? 120}</span>
        },
        { 
          title: '可用数量', 
          dataIndex: 'availableQty', 
          width: 80, 
          align: 'right',
          render: (v) => <span className="font-mono text-blue-600">{v ?? 100}</span>
        },
        { 
          title: '占用数量', 
          dataIndex: 'occupiedQty', 
          width: 80, 
          align: 'right',
          render: (v, rec) => {
            const stock = rec.stockQty ?? 120;
            const avail = rec.availableQty ?? 100;
            const val = rec.occupiedQty ?? (stock - avail >= 0 ? stock - avail : 20);
            return <span className="font-mono text-gray-500">{val}</span>;
          }
        },
        { 
          title: '标准单价', 
          dataIndex: 'standardPrice', 
          width: 100, 
          align: 'right', 
          render: (v, rec) => `¥${(v || rec.price || 0).toFixed(2)}` 
        },
        { 
          title: '市场指导价', 
          dataIndex: 'marketPrice', 
          width: 100, 
          align: 'right', 
          render: (v, rec) => `¥${(v || rec.marketPrice || (rec.standardPrice || rec.price || 0) * 1.2).toFixed(2)}` 
        },
        { 
          title: '底价', 
          dataIndex: 'floorPrice', 
          width: 100, 
          align: 'right', 
          render: (v, rec) => `¥${(v || rec.floorPrice || (rec.standardPrice || rec.price || 0) * 0.8).toFixed(2)}` 
        },
        { 
          title: '优惠折扣率', 
          dataIndex: 'discountRate', 
          width: 100, 
          align: 'right', 
          render: (v) => `${v ?? 5}%` 
        },
        { 
          title: '价格策略', 
          dataIndex: 'strategyCode', 
          width: 110, 
          align: 'center', 
          render: (v) => {
            const code = v || 'DEFAULT';
            return <a onClick={() => message.info(`正在跳转至价格策略详情: ${code}`)}>{code}</a>;
          }
        },
        { title: '折后单价', dataIndex: 'finalPrice', width: 110, align: 'right', render: (v, rec) => <strong className="font-mono text-gray-900">¥{(v || rec.unitPrice || 0).toFixed(2)}</strong> },
        { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
        { 
          title: '标准总金额', 
          width: 110, 
          align: 'right',
          render: (_, rec) => {
            const price = rec.standardPrice || rec.price || 0;
            const qty = rec.quantity || 0;
            return <span className="font-mono text-gray-700">¥{(price * qty).toFixed(2)}</span>;
          }
        },
        { 
          title: '折后总金额（含税）', 
          width: 145, 
          align: 'right',
          render: (_, rec) => {
            const activeTaxRateStr = activeRecord.taxRate ?? '13%';
            const clean = String(activeTaxRateStr).replace('%', '').trim();
            const num = parseFloat(clean);
            const rate = isNaN(num) ? 0.13 : (num > 1 ? num / 100 : num);
            const finalPrice = rec.finalPrice || rec.unitPrice || 0;
            const qty = rec.quantity || 0;
            const discountedTaxed = (finalPrice * qty) * (1 + rate);
            return <strong className="font-mono text-amber-600">¥{discountedTaxed.toFixed(2)}</strong>;
          }
        },
        { 
          title: '折后总金额（不含税）', 
          width: 145, 
          align: 'right',
          render: (_, rec) => {
            const finalPrice = rec.finalPrice || rec.unitPrice || 0;
            const qty = rec.quantity || 0;
            return <strong className="font-mono text-emerald-600">¥{(finalPrice * qty).toFixed(2)}</strong>;
          }
        },
        { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true }
    ];

    const giftColumns = [
        { title: '序号', width: 50, align: 'center', render: (_, __, i) => i + 1 },
        { title: '产品编码', dataIndex: 'productCode', width: 140 },
        { title: '产品名称', dataIndex: 'productName', width: 160 },
        { title: '规格', dataIndex: 'spec', width: 110 },
        { title: '型号', dataIndex: 'model', width: 90, ellipsis: true },
        { title: '属性', dataIndex: 'property', width: 120, render: (v) => <span className="text-gray-700 font-medium">{v || '标准属性'}</span> },
        { title: '数量', dataIndex: 'quantity', width: 85, align: 'right' },
        { title: '备注', dataIndex: 'remark', width: 120, ellipsis: true }
    ];

    const auditColumns = [
        { title: '操作时间', dataIndex: 'time', width: 180 },
        { title: '操作人', dataIndex: 'operator', width: 120 },
        { 
          title: '审核动作', 
          dataIndex: 'action', 
          width: 120,
          render: (action) => {
            let color = 'default';
            let label = action;
            if (action === '提交审批') label = '提交审核';
            if (action.includes('通过')) color = 'success';
            if (action.includes('拒绝')) color = 'error';
            if (action.includes('提交')) color = 'blue';
            return <Tag color={color}>{label}</Tag>;
          }
        },
        { title: '审核建议', dataIndex: 'opinion' }
    ];

    const renderBasicInfo = () => (
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
            <Descriptions title="基本信息" bordered size="small" column={3}>
                <Descriptions.Item label="销售订单号">{activeRecord.orderNo}</Descriptions.Item>
                <Descriptions.Item label="订单日期">{activeRecord.orderDate}</Descriptions.Item>
                <Descriptions.Item label="业务员">{activeRecord.salesperson}</Descriptions.Item>
                
                <Descriptions.Item label="期望发货日期">{activeRecord.expectDeliveryDate || '-'}</Descriptions.Item>
                <Descriptions.Item label="客户类型">{activeRecord.customerType || '-'}</Descriptions.Item>
                <Descriptions.Item label="来源报价单号">{activeRecord.quotationNo || '-'}</Descriptions.Item>
                
                <Descriptions.Item label="客户名称" span={2}>{activeRecord.customerName}</Descriptions.Item>
                <Descriptions.Item label="项目">{activeRecord.subsidiary || '总部'}</Descriptions.Item>
                
                <Descriptions.Item label="是否存在定制产品">
                  <Tag color={(activeRecord.hasCustomProduct || activeRecord.items?.some(i => i.isCustom)) ? "warning" : "default"}>
                    {(activeRecord.hasCustomProduct || activeRecord.items?.some(i => i.isCustom)) ? '是' : '否'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="紧急程度">
                  <Tag color={(activeRecord.urgency === '紧急' || activeRecord.isUrgent) ? "error" : "default"}>
                    {activeRecord.urgency || (activeRecord.isUrgent ? '紧急' : '一般')}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="税率">{activeRecord.taxRate || '13%'}</Descriptions.Item>
                <Descriptions.Item label="结算方式">{activeRecord.settlementMethod || '常规结算'}</Descriptions.Item>
                <Descriptions.Item label="是否收取定金">{activeRecord.isCollectDeposit ? '是' : '否'}</Descriptions.Item>
                
                <Descriptions.Item label="纳入备货计划">
                  <Tag color={activeRecord.includeInStockingPlan ? "success" : "default"}>
                    {activeRecord.includeInStockingPlan ? '是' : '否'}
                  </Tag>
                </Descriptions.Item>

                {activeRecord.isCollectDeposit && (
                  <Descriptions.Item label="定金比例">{activeRecord.depositRatio || 0}%</Descriptions.Item>
                )}
                {activeRecord.isCollectDeposit && (
                  <Descriptions.Item label="定金应收" span={2}>
                    {formatCurrency(activeRecord.deposit || (activeRecord.totalAmount * (activeRecord.depositRatio / 100)))}
                  </Descriptions.Item>
                )}
                {!activeRecord.isCollectDeposit && (
                  <Descriptions.Item label="结算规则" span={3}>常规按单支付</Descriptions.Item>
                )}
                
                <Descriptions.Item label="生产备注" span={3}>{activeRecord.productionRemark || '-'}</Descriptions.Item>
                <Descriptions.Item label="客户备注" span={3}>{activeRecord.customerRemark || '-'}</Descriptions.Item>
            </Descriptions>

            <Divider titlePlacement="left">标品明细</Divider>
            <Table 
                dataSource={(activeRecord.items || []).filter(item => !item.isCustom)} 
                columns={standardProductColumns} 
                rowKey="id" 
                size="small" 
                pagination={false} 
                scroll={{ x: 1800, y: 350 }} 
                className="border border-gray-100 rounded"
                locale={{ emptyText: <Empty description="暂无标品明细" /> }}
            />

            <Divider titlePlacement="left">定制品明细</Divider>
            <Table 
                dataSource={(activeRecord.items || []).filter(item => item.isCustom)} 
                columns={customProductColumns} 
                rowKey="id" 
                size="small" 
                pagination={false} 
                scroll={{ x: 1800, y: 350 }} 
                className="border border-gray-100 rounded"
                locale={{ emptyText: <Empty description="暂无定制品明细" /> }}
            />

            <Divider titlePlacement="left">赠品明细</Divider>
            <Table 
                dataSource={activeRecord.giftItems || []} 
                columns={giftColumns} 
                rowKey="id" 
                size="small" 
                pagination={false} 
                className="border border-gray-100 rounded"
                locale={{ emptyText: <Empty description="暂无赠品明细" /> }}
            />

            <Divider />

            <Row justify="end">
                <Col span={8}>
                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                        <div className="text-xs font-semibold text-gray-500 mb-2 border-b border-gray-200 pb-1">费用汇总 / Summary</div>
                        <Space orientation="vertical" size="small" style={{ width: '100%' }}>
                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs">订单总额:</Col>
                                <Col span={10} className="text-right font-mono text-gray-700">¥{(calculations.productTotal || 0).toFixed(2)}</Col>
                            </Row>
                            
                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs">折后金额:</Col>
                                <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{(calculations.discountedProductTotal || 0).toFixed(2)}</Col>
                            </Row>

                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs">优惠总金额:</Col>
                                <Col span={10} className="text-right font-mono text-gray-500">¥{(calculations.totalSaving || 0).toFixed(2)}</Col>
                            </Row>

                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs font-semibold">订单含税总额:</Col>
                                <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{(calculations.taxedProductTotal || 0).toFixed(2)}</Col>
                            </Row>
                            
                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs">其他费用:</Col>
                                <Col span={10} className="text-right font-mono text-gray-700">¥{(activeRecord.otherFee || 0).toFixed(2)}</Col>
                            </Row>
                            
                            <Divider style={{ margin: '6px 0' }} />
                            
                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-800 font-semibold text-sm">订单总额:</Col>
                                <Col span={10} className="text-right font-mono text-red-600 font-bold text-lg">¥{(calculations.orderTotal || 0).toFixed(2)}</Col>
                            </Row>
                            
                            {activeRecord.isCollectDeposit && (
                                <Row wrap={false} align="middle" className="bg-amber-50 p-1 border border-dashed border-amber-200 rounded">
                                    <Col span={14} className="text-amber-800 text-xs font-medium">
                                        定金应收 ({activeRecord.depositRatio || 0}%):
                                    </Col>
                                    <Col span={10} className="text-right font-mono text-amber-600 font-bold">
                                        ¥{(calculations.depositReceivable || 0).toFixed(2)}
                                    </Col>
                                </Row>
                            )}

                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs">已收金额:</Col>
                                <Col span={10} className="text-right font-mono text-gray-700">¥{(activeRecord.paidAmount || 0).toFixed(2)}</Col>
                            </Row>

                            <Row wrap={false} align="middle">
                                <Col span={14} className="text-gray-500 text-xs font-medium">待收金额:</Col>
                                <Col span={10} className="text-right font-mono text-gray-900 font-semibold">¥{((calculations.orderTotal || 0) - (activeRecord.paidAmount || 0)).toFixed(2)}</Col>
                            </Row>
                        </Space>
                    </div>
                </Col>
            </Row>
        </Space>
    );

    const renderAuditHistory = () => (
        <div style={{ padding: '8px' }}>
            {auditRecords.length > 0 ? (
                <Table
                    dataSource={auditRecords}
                    columns={auditColumns}
                    rowKey={(r) => r.time + (r.operator || '')}
                    size="small"
                    pagination={false}
                />
            ) : (
                <Empty description="暂无审批记录" />
            )}
        </div>
    );

    const tabItems = [
        { key: 'basic', label: '基本信息', children: renderBasicInfo() },
        {
            key: 'production',
            label: '生产工单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '工单号', dataIndex: 'id', render: (t) => <a>{t}</a> },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '状态', dataIndex: 'status' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无生产工单" /> }}
                />
            )
        },
        {
            key: 'stockin',
            label: '入库单',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '入库单号', dataIndex: 'id' },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '入库时间', dataIndex: 'time' },
                        { title: '仓管员', dataIndex: 'operator' },
                        { title: '状态', dataIndex: 'status' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无入库单" /> }}
                />
            )
        },
        {
            key: 'notice',
            label: '发货通知单',
            children: (
                <Table 
                    size="small"
                    dataSource={deliveryNoticeData}
                    rowKey="id"
                    columns={[
                        { title: '发货通知单号', dataIndex: 'id' },
                        { 
                          title: '备货单号', 
                          dataIndex: 'stockingNo',
                          render: (val) => <a onClick={() => message.info(`正在跳转至备货计划: ${val}`)}>{val || 'ST-2026110201'}</a>
                        },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag color="orange">{s}</Tag> },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '创建日期', dataIndex: 'date' },
                        { title: '业务员', dataIndex: 'operator' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无发货通知单" /> }}
                />
            )
        },
        {
            key: 'stockout',
            label: '出库单',
            children: (
                <Table 
                    size="small"
                    dataSource={stockoutData}
                    rowKey="id"
                    columns={[
                        { title: '出库单号', dataIndex: 'id' },
                        { 
                          title: '备货单号', 
                          dataIndex: 'stockingNo',
                          render: (val) => <a onClick={() => message.info(`正在跳转至备货计划: ${val}`)}>{val || 'ST-2026110201'}</a>
                        },
                        { title: '产品信息', dataIndex: 'product' },
                        { title: '出库时间', dataIndex: 'time' },
                        { title: '仓管员', dataIndex: 'operator' },
                        { title: '状态', dataIndex: 'status', render: (s) => <Tag color={s === '已出库' ? 'green' : 'blue'}>{s}</Tag> },
                    ]}
                    locale={{ emptyText: <Empty description="暂无出库单" /> }}
                />
            )
        },
        {
            key: 'payment',
            label: '收款记录',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="flowNo"
                    columns={[
                        { title: '流水号', dataIndex: 'flowNo' },
                        { title: '项目（子公司）', dataIndex: 'project' },
                        { title: '发生时间', dataIndex: 'time' },
                        { title: '交易金额', dataIndex: 'totalAmount', render: (v) => formatCurrency(v) },
                        { title: '认领记录号', dataIndex: 'claimNo' },
                        { title: '认领比例', dataIndex: 'ratio', render: (v) => v ? `${v}%` : '-' },
                        { title: '认领金额', dataIndex: 'amount', render: (v) => formatCurrency(v) },
                        { title: '认领人', dataIndex: 'operator' },
                        { title: '审核状态', dataIndex: 'status', render: (s) => <Tag color="blue">{s || '已完成'}</Tag> },
                    ]}
                    locale={{ emptyText: <Empty description="暂无收款记录" /> }}
                />
            )
        },
        {
            key: 'aftersale',
            label: '售后记录',
            children: (
                <Table 
                    size="small"
                    dataSource={[]}
                    rowKey="id"
                    columns={[
                        { title: '售后订单号', dataIndex: 'id', render: (t) => <a>{t}</a> },
                        { title: '售后类型', dataIndex: 'type' },
                    ]}
                    locale={{ emptyText: <Empty description="暂无售后记录" /> }}
                />
            )
        },
        { key: 'audit', label: '审核详情', children: renderAuditHistory() }
    ];

    return (
        <Drawer forceRender
            title={
                <Space>
                    <span>销售订单详情 - {activeRecord.orderNo}</span>
                    {(activeRecord.hasCustomProduct || activeRecord.items?.some(i => i.isCustom)) && <Tag color="orange">存在定制产品</Tag>}
                    {(activeRecord.urgency === '紧急' || activeRecord.isUrgent) && <Tag color="red">加急单</Tag>}
                </Space>
            }
            open={open}
            onClose={onClose}
            size="large"
            extra={
                <Space>
                    <Tag color={statusColors[activeRecord.status] || 'blue'}>{activeRecord.status}</Tag>
                </Space>
            }
        >
            <Tabs defaultActiveKey="basic" items={tabItems} />
        </Drawer>
    );
};

export default NormalOrderDetailDrawer;
