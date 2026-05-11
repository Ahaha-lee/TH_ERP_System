
import React from 'react';
import { Modal, Table, Tag, Typography } from 'antd';

const { Text } = Typography;

const TrusteeMaterialReceiptModal = ({ open, record, onCancel }) => {
    const mockData = [
        {
            key: '1',
            receiptNo: 'LR-20260429-001',
            materialInfo: '铝板 (300*300)',
            expectedQty: 500,
            actualQty: 500,
            receiptDate: '2026-04-28',
            status: '已入库'
        },
        {
            key: '2',
            receiptNo: 'LR-20260429-002',
            materialInfo: '支撑架',
            expectedQty: 100,
            actualQty: 100,
            receiptDate: '2026-04-29',
            status: '已审核'
        }
    ];

    const columns = [
        { title: '入库单号', dataIndex: 'receiptNo', key: 'receiptNo', render: (t) => <Typography.Link>{t}</Typography.Link> },
        { title: '入库物料明细', dataIndex: 'materialInfo', key: 'materialInfo' },
        { title: '应收数量', dataIndex: 'expectedQty', key: 'expectedQty', align: 'right' },
        { title: '实收数量', dataIndex: 'actualQty', key: 'actualQty', align: 'right', render: (v) => <Text strong>{v}</Text> },
        { title: '入库日期', dataIndex: 'receiptDate', key: 'receiptDate' },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (val) => {
              const statusConfig = {
                '待审核': { color: 'orange' },
                '已审核': { color: 'blue' },
                '已入库': { color: 'green' }
              };
              const config = statusConfig[val] || { color: 'default' };
              return <Tag color={config.color}>{val}</Tag>;
            }
        },
    ];

    return (
        <Modal forceRender
            title={`${record?.orderNo || '-'} - 来料入库进度`}
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

export default TrusteeMaterialReceiptModal;
