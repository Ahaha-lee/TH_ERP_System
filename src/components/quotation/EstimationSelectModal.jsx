import React, { useState, useMemo } from 'react';
import { Modal, Table, Input, Space, Button } from 'antd';
import { useMockData } from '../../mock/data';

const EstimationSelectModal = ({ open, onCancel, onSelect }) => {
  const [estimations] = useMockData('estimations');
  const [searchText, setSearchText] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const filteredEstimations = useMemo(() => {
    let result = estimations || [];
    if (searchText) {
      const lower = searchText.toLowerCase();
      result = result.filter(item => 
        (item.orderNo && item.orderNo.toLowerCase().includes(lower)) ||
        (item.customerName && item.customerName.toLowerCase().includes(lower))
      );
    }
    return result;
  }, [estimations, searchText]);

  const columns = [
    { title: '预估单号', dataIndex: 'orderNo', width: 140 },
    { title: '客户名称', dataIndex: 'customerName', width: 150, ellipsis: true },
    { title: '预估日期', dataIndex: 'date', width: 110 },
    { title: '产品名称', dataIndex: 'productName', width: 150, ellipsis: true },
    { title: '预估总额', dataIndex: 'totalPrice', width: 100, align: 'right', render: (v) => `¥${v.toFixed(2)}` }
  ];

  const handleOk = () => {
    if (selectedRecord) {
      onSelect(selectedRecord);
      onCancel();
    }
  };

  return (
    <Modal forceRender
      title="关联来源预估单"
      open={open}
      onCancel={onCancel}
      width={700}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="confirm" type="primary" disabled={!selectedRecord} onClick={handleOk}>确认</Button>
      ]}
      destroyOnHidden
      afterClose={() => {
        setSearchText('');
        setSelectedRowKeys([]);
        setSelectedRecord(null);
      }}
    >
      <Space orientation="vertical" style={{ width: '100%' }} size="middle">
        <Input.Search
          placeholder="搜索预估单号、客户名称"
          onSearch={setSearchText}
          onChange={e => setSearchText(e.target.value)}
          allowClear
        />
        <Table
          rowSelection={{
            type: 'radio',
            selectedRowKeys,
            onChange: (keys, rows) => {
              setSelectedRowKeys(keys);
              setSelectedRecord(rows[0]);
            }
          }}
          dataSource={filteredEstimations}
          columns={columns}
          rowKey="id"
          size="small"
          scroll={{ y: 400 }}
          pagination={{ pageSize: 10 }}
        />
      </Space>
    </Modal>
  );
};

export default EstimationSelectModal;
