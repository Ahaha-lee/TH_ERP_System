
import React from 'react';
import { Modal, Table, Tag, Typography } from 'antd';

const { Text } = Typography;

const InboundProgressModal = ({ open, record, onCancel }) => {
    // Mock inbound data related to the after-sales order
    const mockInboundLogs = [
        { 
            key: '1', 
            inboundNo: `IN-REP-${record?.replenishNo || record?.id || '20250429'}-01`, 
            productInfo: record?.items?.map(i => `${i.productName}/${i.quantity || 0}`).join(', ') || '待收货产品',
            status: '已入库' 
        },
        { 
            key: '2', 
            inboundNo: `IN-REP-${record?.replenishNo || record?.id || '20250429'}-02`, 
            productInfo: '配件/1',
            status: '已入库' 
        }
    ];

    const columns = [
        { 
            title: '入库单号', 
            dataIndex: 'inboundNo', 
            key: 'inboundNo',
            render: (text) => <Typography.Link>{text}</Typography.Link>
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
            render: (status) => (
                <Tag color="green">
                    {status}
                </Tag>
            )
        },
    ];

    return (
        <Modal forceRender
            title="查看入库进度"
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
