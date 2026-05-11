
import React from 'react';
import { Modal, Table, Progress, Tag, Space, Typography } from 'antd';

const { Text } = Typography;

const ProductionProgressModal = ({ open, record, onCancel }) => {
    const columns = [
        { title: '生产工单号', dataIndex: 'workOrderNo', key: 'workOrderNo', render: (text) => <a>{text}</a> },
        { title: '产品名称', dataIndex: 'productName', key: 'productName' },
        { title: '完工数量/总数量', key: 'progressText', render: (_, r) => `${r.completedQuantity}/${r.totalQuantity}` },
        { title: '预计开工时间', dataIndex: 'estimatedStartTime', key: 'estimatedStartTime' },
        { title: '预计完工时间', dataIndex: 'estimatedEndTime', key: 'estimatedEndTime' },
        { 
            title: '进度', 
            dataIndex: 'progress', 
            key: 'progress',
            render: (val) => <Progress percent={val} size="small" />
        },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
                const statusColors = {
                    '待审核': 'default',
                    '已排产': 'cyan',
                    '生产中': 'blue',
                    '已完成': 'green',
                    '已关闭': 'red'
                };
                return <Tag color={statusColors[val] || 'blue'}>{val}</Tag>;
            }
        },
    ];

    const mockData = [
        { key: 1, workOrderNo: 'WO-20260507-001', productName: '皮沙发', completedQuantity: 0, totalQuantity: 10, progress: 0, status: '待审核', estimatedStartTime: '2026-05-08 08:00', estimatedEndTime: '2026-05-10 17:00' },
        { key: 2, workOrderNo: 'WO-20260507-002', productName: '实木餐桌', completedQuantity: 0, totalQuantity: 5, progress: 0, status: '已排产', estimatedStartTime: '2026-05-09 09:00', estimatedEndTime: '2026-05-11 18:00' },
        { key: 3, workOrderNo: 'WO-20260507-003', productName: '极简书架', completedQuantity: 3, totalQuantity: 8, progress: 37.5, status: '生产中', estimatedStartTime: '2026-05-07 10:00', estimatedEndTime: '2026-05-09 17:00' },
        { key: 4, workOrderNo: 'WO-20260507-004', productName: '红橡木板材', completedQuantity: 20, totalQuantity: 20, progress: 100, status: '已完成', estimatedStartTime: '2026-05-05 08:00', estimatedEndTime: '2026-05-06 17:00' },
        { key: 5, workOrderNo: 'WO-20260507-005', productName: '皮沙发', completedQuantity: 1, totalQuantity: 10, progress: 10, status: '已关闭', estimatedStartTime: '2026-05-01 08:00', estimatedEndTime: '2026-05-03 17:00' },
    ];

    return (
        <Modal forceRender
            title={`生产进度 - ${record?.orderNo}`}
            open={open}
            onCancel={onCancel}
            width={900}
            centered
            footer={null}
        >
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

export default ProductionProgressModal;
