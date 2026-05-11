
import React from 'react';
import { Modal, Table, Tag, Progress, Typography } from 'antd';

const { Text } = Typography;

const TrusteeProductionProgressModal = ({ open, record, onCancel }) => {
    const mockData = [
        {
            key: '1',
            workOrderNo: 'WO-ST-20260429-01',
            productName: record?.items?.[0]?.productName || '受托产品A',
            estimatedStartTime: '2026-05-10',
            estimatedEndTime: '2026-05-15',
            finishedQty: 50,
            totalQty: 100,
            status: '生产中'
        },
        {
            key: '2',
            workOrderNo: 'WO-ST-20260429-02',
            productName: record?.items?.[0]?.productName || '受托产品A',
            estimatedStartTime: '2026-05-16',
            estimatedEndTime: '2026-05-20',
            finishedQty: 0,
            totalQty: 100,
            status: '已排产'
        }
    ];

    const columns = [
        { title: '生产工单号', dataIndex: 'workOrderNo', key: 'workOrderNo', render: (t) => <Typography.Link>{t}</Typography.Link> },
        { title: '产品名称', dataIndex: 'productName', key: 'productName' },
        { title: '预计开始时间', dataIndex: 'estimatedStartTime', key: 'estimatedStartTime' },
        { title: '预计完工时间', dataIndex: 'estimatedEndTime', key: 'estimatedEndTime' },
        { 
            title: '完工数量/总数量', 
            key: 'qtyRatio',
            render: (_, r) => `${r.finishedQty} / ${r.totalQty}`
        },
        { 
            title: '进度', 
            key: 'progress',
            width: 150,
            render: (_, r) => {
                const percent = Math.round((r.finishedQty / r.totalQty) * 100) || 0;
                return <Progress percent={percent} size="small" />;
            }
        },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (s) => {
                const config = { 
                    '待审核': 'default', 
                    '已排产': 'cyan', 
                    '生产中': 'blue', 
                    '已完成': 'green', 
                    '已关闭': 'red' 
                };
                return <Tag color={config[s] || 'default'}>{s}</Tag>;
            }
        },
    ];

    return (
        <Modal forceRender
            title={`生产进度 - ${record?.orderNo || '-'}`}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={900}
            centered
        >
            <Table 
                rowKey="id"
                dataSource={record ? mockData : []} 
                columns={columns} 
                pagination={false} 
                size="small" 
                bordered 
            />
        </Modal>
    );
};

export default TrusteeProductionProgressModal;
