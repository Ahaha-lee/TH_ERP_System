import React, { useState, useEffect } from 'react';
import { Modal, Form, Table, InputNumber, Button, Space, message } from 'antd';

const DeliveryNoticeModal = ({ open, onCancel, order }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (open && order) {
      const initializedItems = (order.items || []).map(item => {
        // Find if item already has a stock, or assign a realistic random one
        const stock = item.stock || item.stockQty || Math.floor(Math.random() * 150) + 10;
        return {
          ...item,
          stock,
          pendingQty: item.quantity || 10,
          currentQty: item.quantity || 10, // Default ship quantity to pending quantity
        };
      });
      setItems(initializedItems);
    } else if (!open) {
      setItems([]);
    }
  }, [open, order]);

  const handleQtyChange = (itemId, val) => {
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, currentQty: val } : item));
  };

  const handleConfirm = () => {
    if (items.length === 0) {
      message.warning('明细为空，无法发起发货');
      return;
    }

    // 验证本次发货数量要小于等于库存数量和待发货数量
    for (const item of items) {
      const name = item.productName || '产品';
      const currentQty = Number(item.currentQty);
      const stock = Number(item.stock || 0);
      const pendingQty = Number(item.pendingQty || 0);

      if (isNaN(currentQty) || currentQty <= 0) {
        message.warning(`无法保存或提交：产品【${name}】的本次发货数量必须大于0且为有效数字`);
        return;
      }

      if (currentQty > stock) {
        message.warning(`无法保存或提交：产品【${name}】本次发货数量（${currentQty}）不能大于库存数量（${stock}）`);
        return;
      }

      if (currentQty > pendingQty) {
        message.warning(`无法保存或提交：产品【${name}】本次发货数量（${currentQty}）不能大于待发货数量（${pendingQty}）`);
        return;
      }
    }

    message.success('已发起发货通知');
    onCancel();
  };

  const columns = [
    { title: '产品名称', dataIndex: 'productName', key: 'productName' },
    { title: '规格/属性', dataIndex: 'spec', key: 'spec', render: (text, rec) => text || rec.property || '-' },
    { 
      title: '可用库存', 
      dataIndex: 'stock', 
      key: 'stock',
      width: 120,
      render: (stock) => <span className="text-emerald-600 font-semibold font-mono">{stock}</span>
    },
    { 
      title: '未发数量', 
      dataIndex: 'pendingQty', 
      key: 'pendingQty',
      width: 120,
      render: (qty) => <span className="font-mono">{qty}</span>
    },
    { 
      title: '本次发货数量', 
      key: 'currentQty',
      width: 150,
      render: (_, rec) => (
        <InputNumber 
          min={1} 
          value={rec.currentQty} 
          status={rec.currentQty > rec.stock ? 'error' : ''}
          onChange={(val) => handleQtyChange(rec.id, val)}
          style={{ width: '100%' }}
        />
      )
    }
  ];

  return (
    <Modal forceRender
      title={`发起发货通知 - ${order?.orderNo}`}
      open={open}
      onCancel={onCancel}
      onOk={handleConfirm}
      width={800}
    >
      <Table dataSource={items} columns={columns} rowKey="id" size="small" pagination={false} />
    </Modal>
  );
};

export default DeliveryNoticeModal;
