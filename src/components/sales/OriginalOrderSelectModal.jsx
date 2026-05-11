
import React, { useState } from 'react';
import { Modal, Table, Input, Form, Row, Col, Button, Tag, Space } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { mockNormalOrders } from '../../mock/normalOrderMock';

const OriginalOrderSelectModal = ({ open, onCancel, onConfirm }) => {
    const [selectedRowKey, setSelectedRowKey] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    
    // Only show completed or partially shipped orders
    const filteredOrders = mockNormalOrders.filter(o => o.status === '完成' || o.status === '发货中');

    const columns = [
        { title: '销售订单号', dataIndex: 'orderNo', key: 'orderNo' },
        { title: '客户名称', dataIndex: 'customerName', key: 'customerName' },
        { title: '订单日期', dataIndex: 'orderDate', key: 'orderDate' },
        { title: '金额', dataIndex: 'totalAmount', key: 'totalAmount', render: (v) => `¥${(v || 0).toFixed(2)}` },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (status) => <Tag color={status === '完成' ? 'green' : 'blue'}>{status}</Tag>
        },
        { title: '业务员', dataIndex: 'salesperson', key: 'salesperson' },
    ];

    const handleOk = () => {
        if (selectedRecord) {
            onConfirm(selectedRecord);
            setSelectedRowKey(null);
            setSelectedRecord(null);
        }
    };

    return (
        <Modal forceRender
            title="选择原销售订单"
            open={open}
            onCancel={onCancel}
            onOk={handleOk}
            width={800}
            okButtonProps={{ disabled: !selectedRecord }}
        >
            <div className="mb-4">
                <Form layout="inline">
                    <Form.Item name="orderNo">
                        <Input placeholder="订单号" prefix={<SearchOutlined />} />
                    </Form.Item>
                    <Form.Item name="customerName">
                        <Input placeholder="客户名称" prefix={<SearchOutlined />} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary">查询</Button>
                    </Form.Item>
                </Form>
            </div>
            <Table
                dataSource={filteredOrders}
                columns={columns}
                rowKey="id"
                pagination={{ pageSize: 5 }}
                rowSelection={{
                    type: 'radio',
                    selectedRowKeys: selectedRowKey ? [selectedRowKey] : [],
                    onChange: (keys, rows) => {
                        setSelectedRowKey(keys[0]);
                        setSelectedRecord(rows[0]);
                    }
                }}
                onRow={(record) => ({
                    onClick: () => {
                        setSelectedRowKey(record.id);
                        setSelectedRecord(record);
                    }
                })}
            />
        </Modal>
    );
};

export default OriginalOrderSelectModal;
