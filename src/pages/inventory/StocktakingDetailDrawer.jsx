import React, { useMemo } from 'react';
import { Drawer, Empty, Typography, Button, Space, Tabs, Descriptions, Tag, Table, Divider, Statistic, Row, Col } from 'antd';
import { stocktakingTasks } from '../../mock';

const { Title, Text } = Typography;

const StocktakingDetailDrawer = ({ open, onClose, taskNo }) => {
  const task = useMemo(() => {
    return stocktakingTasks.find(t => t.taskNo === taskNo);
  }, [taskNo]);

  if (!task) return (
    <Drawer forceRender title="盘点任务详情" size="large" onClose={onClose} open={open}>
      <Empty description="未找到任务数据" />
    </Drawer>
  );

  const statusTags = {
    '草稿': <Tag>草稿</Tag>,
    '盘点中': <Tag color="blue">盘点中</Tag>,
    '已盘点': <Tag color="orange">已盘点</Tag>,
    '已完成': <Tag color="green">已完成</Tag>,
  };

  const snapshotColumns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '货位', dataIndex: 'location', width: 120 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '批次号', dataIndex: 'batchNo', width: 120, render: (v) => v || '-' },
    { title: '规格型号', dataIndex: 'spec', width: 150 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { title: '账面库存', dataIndex: 'bookQty', width: 100, align: 'right' },
  ];

  const resultColumns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '货位', dataIndex: 'location', width: 100 },
    { title: '物料编号', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '批次号', dataIndex: 'batchNo', width: 120, render: (v) => v || '-' },
    { title: '账面库存', dataIndex: 'bookQty', width: 100, align: 'right' },
    { title: '实盘数量', dataIndex: 'actualQty', width: 100, align: 'right' },
    { title: '差异原因', dataIndex: 'reason', width: 150, render: (v) => v || '-' },
    { 
      title: '盘亏/盘盈', 
      dataIndex: 'diffQty', 
      width: 100, 
      align: 'center',
      render: (v) => <Text type={v < 0 ? 'danger' : v > 0 ? 'success' : 'secondary'}>{v < 0 ? `盘亏 (${v})` : v > 0 ? `盘盈 (+${v})` : '-'}</Text>
    },
  ];

  const adjColumns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '货位', dataIndex: 'location', width: 100 },
    { title: '物料编号', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150, render: (v) => v || '-' },
    { title: '批次号', dataIndex: 'batchNo', width: 120, render: (v) => v || '-' },
    { title: '调整前库存', dataIndex: 'beforeQty', width: 100, align: 'right', render: (v) => v !== undefined ? v : '-' },
    { title: '调整后库存', dataIndex: 'afterQty', width: 100, align: 'right', render: (v) => v !== undefined ? v : '-' },
    { title: '调整时间', dataIndex: 'time', width: 150, render: (v) => v || '-' },
  ];

  const items = [
    {
      key: '1',
      label: '基本信息',
      children: (
        <Space orientation="vertical" style={{ width: '100%' }} size="large">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="任务号">{task.taskNo}</Descriptions.Item>
            <Descriptions.Item label="状态">{statusTags[task.status]}</Descriptions.Item>
            <Descriptions.Item label="仓库">{task.warehouseName}</Descriptions.Item>
            <Descriptions.Item label="盘点范围">{task.rangeDesc}</Descriptions.Item>
            <Descriptions.Item label="计划周期">{task.planStartDate} ~ {task.planEndDate}</Descriptions.Item>
            <Descriptions.Item label="实际开始">{task.actualStartDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="完成时间">{task.actualEndDate || task.finishDate || '-'}</Descriptions.Item>
            <Descriptions.Item label="基准时间">{task.baseTime || '-'}</Descriptions.Item>
            <Descriptions.Item label="创建人">{task.creator}</Descriptions.Item>
            <Descriptions.Item label="备注" span={2}>{task.remark || '-'}</Descriptions.Item>
          </Descriptions>
        </Space>
      ),
    },
    {
      key: '2',
      label: '盘点清单 (基准快照)',
      children: (
        <Table 
          dataSource={task.baseSnapshot || []} 
          columns={snapshotColumns} 
          rowKey={(r) => `${r.productCode}-${r.location}`} 
          pagination={{ pageSize: 10 }}
        />
      ),
    },
    {
      key: '3',
      label: '盘点结果',
      children: (task.status === '已盘点' || task.status === '待审批' || task.status === '已完成') ? (
        <Table 
          dataSource={task.diffResult || []} 
          columns={resultColumns} 
          rowKey={(r) => `${r.productCode}-${r.location}`} 
          pagination={{ pageSize: 10 }}
        />
      ) : <Empty description="盘点尚未导入结果" />,
    },
    {
      key: '4',
      label: '调整记录',
      children: task.status === '已完成' ? (
        <Table 
          dataSource={task.adjustments || []} 
          columns={adjColumns} 
          rowKey="adjNo" 
          pagination={{ pageSize: 10 }}
        />
      ) : <Empty description="任务尚未完成，未生成调整记录" />,
    },
  ];

  return (
    <Drawer forceRender
      title={`盘点任务详情 - ${taskNo}`}
      size="large"
      onClose={onClose}
      open={open}
      extra={
        <Space>
          <Button onClick={onClose}>关闭</Button>
          {(task.status === '盘点中' || task.status === '草稿') && (
            <Button type="primary">导出盘点表</Button>
          )}
        </Space>
      }
    >
      <Tabs defaultActiveKey="1" items={items} />
    </Drawer>
  );
};

export default StocktakingDetailDrawer;
