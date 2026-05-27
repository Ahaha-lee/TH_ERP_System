
import React, { useState } from 'react';
import { Modal, Table, Tag, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import SalesOutboundDetailDrawer from '../../outbound/SalesOutboundDetailDrawer';

const { Link } = Typography;

const OutboundProgressModal = ({ open, record, onCancel }) => {
    const navigate = useNavigate();
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedOutboundNo, setSelectedOutboundNo] = useState(null);

    const mockData = [
        {
            id: '1',
            outboundNo: `OUT-EX-${record?.exchangeNo || '2025'}-01`,
            stockingPlanNo: 'SP20250519002',
            productName: record?.items?.[0]?.productName || '配件',
            quantity: record?.items?.[0]?.quantity || 1,
            status: '已入库'
        },
        {
            id: '2',
            outboundNo: `OUT-EX-${record?.exchangeNo || '2025'}-02`,
            stockingPlanNo: '-',
            productName: '包材/辅料',
            quantity: 1,
            status: '已入库'
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
            title: '备货单号',
            dataIndex: 'stockingPlanNo',
            key: 'stockingPlanNo',
            render: (text) => text && text !== '-' ? (
                <Link onClick={() => {
                    onCancel();
                    navigate('/stocking-plan', { state: { searchNo: text } });
                }}>
                    {text}
                </Link>
            ) : '-'
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
                    '已出库': 'green',
                    '已入库': 'green',
                    '已关闭(备货取消)': 'magenta'
                };
                return <Tag color={colors[status] || 'default'}>{status}</Tag>;
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
