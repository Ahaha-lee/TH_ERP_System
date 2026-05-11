
import React from 'react';
import { Modal, Table, Tag, Typography, Progress } from 'antd';

const { Text, Title } = Typography;

const DeliveryProgressModal = ({ open, record, onCancel }) => {
    const columns = [
        { title: '发货通知单号', dataIndex: 'noticeNo', key: 'noticeNo' },
        { title: '出库单号', dataIndex: 'outboundNo', key: 'outboundNo' },
        { title: '发货日期', dataIndex: 'deliveryDate', key: 'deliveryDate' },
        { title: '发货数量', dataIndex: 'quantity', key: 'quantity' },
        { title: '物流单号', dataIndex: 'logisticsNo', key: 'logisticsNo' },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => <Tag color={val === '已出库' ? 'green' : 'blue'}>{val}</Tag>
        },
    ];

    const mockData = [
        { key: 1, noticeNo: 'DN-20250428-001', outboundNo: '-', deliveryDate: '2025-04-28', quantity: 5, logisticsNo: 'SF123456789', status: '待审核' },
        { key: 2, noticeNo: 'DN-20250427-002', outboundNo: 'CK-20250427-012', deliveryDate: '2025-04-27', quantity: 3, logisticsNo: 'SF987654321', status: '已出库' },
    ];

    const totalOrdered = 10;
    const totalDelivered = 3;

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
                dataSource={mockData} 
                rowKey="key" 
                size="small" 
                pagination={false} 
            />
        </Modal>
    );
};

export default DeliveryProgressModal;
