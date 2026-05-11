
import React, { useState } from 'react';
import { Modal, Table, Tag, Typography } from 'antd';
import SalesOutboundDetailDrawer from '../../outbound/SalesOutboundDetailDrawer';

const { Link } = Typography;

const OutboundProgressModal = ({ open, record, onCancel }) => {
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOutboundNo, setSelectedOutboundNo] = useState(null);

    const mockData = [
        {
            id: '1',
            outboundNo: `OUT-EX-${record?.exchangeNo || '2025'}-01`,
            productName: record?.items?.[0]?.productName || '配件',
            quantity: record?.items?.[0]?.quantity || 1,
            status: '已出库'
        },
        {
            id: '2',
            outboundNo: `OUT-EX-${record?.exchangeNo || '2025'}-02`,
            productName: '包材/辅料',
            quantity: 1,
            status: '待审核'
        }
    ];

    const showDetail = (no) => {
        setSelectedOutboundNo(no);
        setDetailOpen(true);
    };

    const columns = [
        {
            title: '出库单号',
            dataIndex: 'outboundNo',
            key: 'outboundNo',
            render: (text) => <Link onClick={() => showDetail(text)}>{text}</Link>
        },
        {
            title: '产品信息',
            key: 'productInfo',
            render: (_, record) => `${record.productName} / ${record.quantity}`
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const colors = {
                    '待审核': 'default',
                    '已审核': 'blue',
                    '已出库': 'green'
                };
                return <Tag color={colors[status]}>{status}</Tag>;
            }
        }
    ];

    return (
        <>
            <Modal
                title="查看出库进度"
                open={open}
                onCancel={onCancel}
                footer={null}
                width={700}
            >
                <Table
                    dataSource={mockData}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                />
            </Modal>

            <SalesOutboundDetailDrawer 
                open={detailOpen}
                onClose={() => setDetailOpen(false)}
                orderId={selectedOutboundNo}
            />
        </>
    );
};

export default OutboundProgressModal;
