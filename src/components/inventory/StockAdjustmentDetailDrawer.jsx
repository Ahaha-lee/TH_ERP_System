import React, { useMemo } from 'react';
import { Drawer, Descriptions, Table, Tag, Typography, Divider, Empty, Space } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, InfoCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Text, Title } = Typography;

const StockAdjustmentDetailDrawer = ({ open, onClose, record }) => {
  // If no record, return null or empty drawer
  const items = useMemo(() => {
    if (!record) return [];
    
    // If the record has custom saved items inside, use them
    if (record.items && record.items.length > 0) {
      return record.items.map((item, index) => ({
        id: item.id || index,
        productCode: item.productCode || `ITEM-${String(index + 1).padStart(3, '0')}`,
        productName: item.productName,
        spec: item.spec || '标准规格',
        batchNo: item.batchNo || '-',
        warehouse: item.warehouse === 'w1' ? '主原材料仓库' : item.warehouse === 'w2' ? '半成品仓库' : item.warehouse === 'w3' ? '主成品仓库' : (item.warehouse || '主仓库'),
        location: item.location || '-',
        stockQty: item.stockQty !== undefined ? item.stockQty : 100,
        adjustmentQty: item.adjustmentQty || '0',
        reason: item.reason || '数据调整'
      }));
    }

    // Otherwise, generate realistic mock items based on the products summary array
    const productList = record.products || [];
    if (productList.length === 0) return [];

    return productList.map((pName, index) => {
      // Create interesting deterministic mock details for existing records
      const codes = {
        '皮沙发': 'PROD001',
        '实木餐桌': 'PROD002',
        '红橡木板材': 'MAT001',
        '不锈钢铰链': 'ACC001',
        '极简书架': 'PROD003',
        '抽屉滑轨': 'ACC002',
        '自攻螺丝': 'ACC003'
      };
      const specs = {
        '皮沙发': '真皮/咖啡色',
        '实木餐桌': '1.6m圆形',
        '红橡木板材': '2000*200*20',
        '不锈钢铰链': '110度/自卸',
        '极简书架': '120 * 30 * 180cm',
        '抽屉滑轨': '45cm三节阻尼',
        '自攻螺丝': 'M4*16十字槽'
      };
      
      const stockQties = [50, 120, 800, 1500, 65, 300, 5000];
      const adjustmentQties = ['+10', '-5', '+50', '-100', '+15', '-4', '+1000'];
      const reasons = ['盘亏调减', '盘盈调增', '损坏调整', '批次溢出', '手动补仓', '报废处理', '错扫修正'];

      return {
        id: index,
        productCode: codes[pName] || `ITEM-${String(index + 1).padStart(3, '0')}`,
        productName: pName,
        spec: specs[pName] || '标准规格',
        batchNo: record.type === '盘点任务生成' ? `ST-BATCH-${record.orderNo.substring(3, 11)}` : 'B20250501',
        warehouse: record.stockType === '原材料' ? '主原材料仓库' : '主成品仓库',
        location: `A-0${(index % 4) + 1}`,
        stockQty: stockQties[index % stockQties.length],
        adjustmentQty: adjustmentQties[index % adjustmentQties.length],
        reason: reasons[index % reasons.length]
      };
    });
  }, [record]);

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: '产品编码',
      dataIndex: 'productCode',
      width: 120,
    },
    {
      title: '产品名称',
      dataIndex: 'productName',
      width: 150,
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: '规格型号',
      dataIndex: 'spec',
      width: 130,
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      width: 130,
      render: (text) => <span className="font-mono text-gray-500">{text}</span>
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      width: 130,
    },
    {
      title: '货位',
      dataIndex: 'location',
      width: 90,
    },
    {
      title: '初始库存',
      dataIndex: 'stockQty',
      width: 100,
      align: 'right',
      render: (val) => <span className="font-mono">{val}</span>
    },
    {
      title: '调整变动量',
      dataIndex: 'adjustmentQty',
      width: 110,
      align: 'right',
      render: (val) => {
        const isPlus = String(val).startsWith('+') || Number(val) > 0;
        const formattedVal = String(val).startsWith('+') || String(val).startsWith('-') ? val : `+${val}`;
        return (
          <span className={`font-semibold font-mono ${isPlus ? 'text-emerald-600' : 'text-rose-500'}`}>
            {formattedVal}
          </span>
        );
      }
    },
    {
      title: '调整原因',
      dataIndex: 'reason',
      width: 150,
    }
  ];

  const getStatusTag = (status) => {
    if (!status) return <Tag icon={<ClockCircleOutlined />} color="default">自动生效</Tag>;
    switch (status) {
      case '草稿':
        return <Tag color="default">草稿</Tag>;
      case '待审核':
        return <Tag icon={<ClockCircleOutlined />} color="processing">待审核</Tag>;
      case '已审核':
        return <Tag icon={<CheckCircleOutlined />} color="success">已审核</Tag>;
      default:
        return <Tag color="default">{status}</Tag>;
    }
  };

  const getAuditResultTag = (result) => {
    if (!result) return '-';
    if (result === '审核通过') {
      return <Tag icon={<CheckCircleOutlined />} color="success">审核通过</Tag>;
    }
    if (result === '审核拒绝') {
      return <Tag icon={<CloseCircleOutlined />} color="error">审核拒绝</Tag>;
    }
    return <Tag color="blue">{result}</Tag>;
  };

  return (
    <Drawer
      title={
        <Space>
          <span>库存调整单详情</span>
          <Text type="secondary" style={{ fontSize: '13px', fontWeight: 'normal' }}>
            [{record?.orderNo}]
          </Text>
        </Space>
      }
      placement="right"
      onClose={onClose}
      open={open}
      styles={{ wrapper: { width: 900 } }}
      id="stock-adjustment-detail-drawer"
    >
      {record ? (
        <div className="flex flex-col h-full">
          <Descriptions bordered size="small" column={3} className="mb-6" id="detail-desc">
            <Descriptions.Item label="库存调整单号" labelStyle={{ width: '120px' }}>
              <span className="font-mono font-semibold text-gray-800">{record.orderNo}</span>
            </Descriptions.Item>
            <Descriptions.Item label="单据类型" labelStyle={{ width: '110px' }}>
              <Tag color={record.type === '盘点任务生成' ? 'orange' : 'blue'}>{record.type}</Tag>
            </Descriptions.Item>
            
            <Descriptions.Item label="盘点任务号">
              {record.taskNo ? (
                <span className="font-mono text-blue-600 font-semibold">{record.taskNo}</span>
              ) : '-'}
            </Descriptions.Item>
            <Descriptions.Item label="库存类型">
              <Tag color="cyan">{record.stockType || '成品'}</Tag>
            </Descriptions.Item>

            <Descriptions.Item label="流程状态">
              {getStatusTag(record.status)}
            </Descriptions.Item>
            <Descriptions.Item label="审核结果">
              {getAuditResultTag(record.auditResult)}
            </Descriptions.Item>

            <Descriptions.Item label="操作人">
              {record.operator}
            </Descriptions.Item>
            <Descriptions.Item label="操作时间">
              <span className="font-mono text-gray-600">{record.createTime || '-'}</span>
            </Descriptions.Item>

            <Descriptions.Item label="审核时间">
              <span className="font-mono text-gray-600">{record.auditTime || '-'}</span>
            </Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="left" style={{ margin: '12px 0 16px 0' }}>
            <span className="text-gray-800 font-semibold">产品调整明细</span>
          </Divider>

          <Table
            id="detail-table"
            dataSource={items}
            columns={columns}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ x: 800, y: 'calc(100vh - 380px)' }}
            locale={{
              emptyText: <Empty description="暂无变动物料明细" />
            }}
          />
        </div>
      ) : (
        <Empty description="暂无单据信息" />
      )}
    </Drawer>
  );
};

export default StockAdjustmentDetailDrawer;
