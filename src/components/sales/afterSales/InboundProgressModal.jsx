
import React from 'react';
import { Modal, Table, Tag, Typography, message } from 'antd';

const { Text } = Typography;

const InboundProgressModal = ({ open, record, onCancel, type = 'outbound' }) => {
    const isOutbound = type === 'outbound';
    const label = isOutbound ? '出库' : '入库';
    const prefix = isOutbound ? 'OUT' : 'IN';

    // Mock inbound data related to the after-sales order
    let mockInboundLogs = [
        { 
            key: '1', 
            inboundNo: `${prefix}-REP-${record?.replenishNo || record?.id || '20250429'}-01`, 
            stockingPlanNo: `SP-REP-${record?.replenishNo || '20250429'}-01`,
            productInfo: record?.items?.map(i => `${i.productName}/${i.quantity || 0}套`).join(', ') || '待收货产品',
            status: record?.exchangeNo ? '已入库' : `已${label}`
        },
        { 
            key: '2', 
            inboundNo: `${prefix}-REP-${record?.replenishNo || record?.id || '20250429'}-02`, 
            stockingPlanNo: `SP-REP-${record?.replenishNo || '20250429'}-02`,
            productInfo: '配件/1',
            status: record?.exchangeNo ? '已入库' : `已${label}`
        }
    ];



    const columns = [
        { 
            title: `${label}单号`, 
            dataIndex: 'inboundNo', 
            key: 'inboundNo',
            render: (text) => <Typography.Link onClick={() => message.info(`正在跳转至${label}详情: ${text}`)}>{text}</Typography.Link>
        },
        { 
            title: '备货单号', 
            dataIndex: 'stockingPlanNo', 
            key: 'stockingPlanNo',
            render: (text) => <Typography.Link onClick={() => message.info(`正在跳转至备货计划: ${text}`)}>{text}</Typography.Link>
        },
        { 
            title: '产品信息', 
            dataIndex: 'productInfo', 
            key: 'productInfo' 
        },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => {
                const colors = {
                    '已出库': 'green',
                    '已入库': 'green',
                    '已关闭(备货取消)': 'magenta'
                };
                return <Tag color={colors[status] || 'blue'}>{status}</Tag>;
            }
        },
    ];

    return (
        <Modal forceRender
            title={`查看${label}进度`}
            open={open}
            onCancel={onCancel}
            footer={[
                <button 
                  key="close" 
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                  onClick={onCancel}
                >
                  关闭
                </button>
            ]}
            width={700}
        >
            <div className="mb-4">
                <Text type="secondary">售后单号：</Text>
                <Text strong>{record?.returnNo || record?.exchangeNo || record?.replenishNo || '-'}</Text>
            </div>
            <Table
                dataSource={record ? mockInboundLogs : []}
                columns={columns}
                pagination={false}
                size="small"
                bordered
            />
        </Modal>
    );
};

export default InboundProgressModal;
