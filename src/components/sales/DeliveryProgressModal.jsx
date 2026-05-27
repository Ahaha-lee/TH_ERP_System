
import React from 'react';
import { Modal, Table, Tag, Typography, Progress } from 'antd';
import { useNavigate } from 'react-router-dom';

const { Text, Title, Link } = Typography;

const DeliveryProgressModal = ({ open, record, onCancel }) => {
    const navigate = useNavigate();
    const columns = [
        { title: '发货通知单号', dataIndex: 'noticeNo', key: 'noticeNo' },
        { 
            title: '备货单号', 
            dataIndex: 'stockingPlanNo', 
            key: 'stockingPlanNo',
            render: (text) => text && text !== '-' ? (
                <Link onClick={() => {
                    onCancel();
                    navigate('/stocking-plan', { state: { searchNo: text } });
                }}>{text}</Link>
            ) : '-'
        },
        { title: '出库单号', dataIndex: 'outboundNo', key: 'outboundNo' },
        { title: '发货日期', dataIndex: 'deliveryDate', key: 'deliveryDate' },
        { 
            title: '发货数量', 
            dataIndex: 'quantity', 
            key: 'quantity',
            render: (val, row) => {
                const isCancelled = row.status === '已出库（备货取消）';
                if (isCancelled) {
                    const absVal = Math.abs(Number(val)) || 3;
                    return (
                        <span className="font-mono font-semibold">
                            <span className="text-gray-900">{absVal}</span>
                            <span className="text-rose-600">-{absVal}</span>
                        </span>
                    );
                }
                // Normal deliveries: black font without dynamic colors or prefix signs
                return <span className="text-gray-900 font-mono">{val}</span>;
            }
        },
        { title: '物流单号', dataIndex: 'logisticsNo', key: 'logisticsNo' },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
                const colors = {
                    '已出库': 'green',
                    '待审核': 'blue',
                    '已出库（备货取消）': 'magenta'
                };
                return <Tag color={colors[val] || 'default'}>{val}</Tag>;
            }
        },
    ];

    let displayMockData = [];
    let totalOrdered = 10;
    let totalDelivered = 3;

    if (record?.orderNo === 'SO20250428001') {
        displayMockData = [
            { key: 1, noticeNo: 'DN20250429001', stockingPlanNo: 'SP20250519001', outboundNo: 'CK20250429001', deliveryDate: '2025-04-28', quantity: 5, logisticsNo: 'SF123456789', status: '已出库' },
            { key: 2, noticeNo: 'DN20250501001', stockingPlanNo: 'SP20250519003', outboundNo: 'CK20240501001', deliveryDate: '2025-04-27', quantity: 3, logisticsNo: 'SF987654321', status: '已出库' },
        ];
        totalDelivered = 8; // 5 + 3 = 8
    } else {
        displayMockData = [
            { key: 1, noticeNo: 'DN20250429001', stockingPlanNo: 'SP20250519001', outboundNo: '-', deliveryDate: '2025-04-28', quantity: 5, logisticsNo: 'SF123456789', status: '待审核' },
            { key: 2, noticeNo: 'DN20250501001', stockingPlanNo: 'SP20250519003', outboundNo: 'CK20240501001', deliveryDate: '2025-04-27', quantity: 3, logisticsNo: 'SF987654321', status: '已出库' },
        ];
        totalDelivered = 3;
    }

    return (
        <Modal forceRender
            title={`发货进度 - ${record?.orderNo}`}
            open={open}
            onCancel={onCancel}
            width={900}
            centered
            footer={null}
        >
            <div className="bg-blue-50 p-4 rounded mb-4 flex justify-around text-center">
                <div>
                   <div className="text-gray-500">总发货数量</div>
                   <div className="text-2xl font-bold">{totalDelivered}</div>
                </div>
                <div>
                   <div className="text-gray-500">未发货数量</div>
                   <div className="text-2xl font-bold text-red-500">{totalOrdered - totalDelivered}</div>
                </div>
                <div>
                   <div className="text-gray-500">发货进度</div>
                   <div style={{ width: 120 }}>
                     <Progress percent={(totalDelivered / totalOrdered) * 100} size="small" />
                   </div>
                </div>
            </div>

            <Table 
                columns={columns} 
                dataSource={displayMockData} 
                rowKey="key" 
                size="small" 
                pagination={false} 
            />
        </Modal>
    );
};

export default DeliveryProgressModal;
