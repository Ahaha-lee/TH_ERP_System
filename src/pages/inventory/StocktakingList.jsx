import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Button, 
  Space, 
  Tag, 
  Typography, 
  message,
  Popconfirm,
  Modal,
  Alert
} from 'antd';
import { 
  SearchOutlined, 
  ReloadOutlined, 
  PlusOutlined, 
  CheckCircleOutlined, 
  PlayCircleOutlined,
  DownloadOutlined,
  UploadOutlined,
  FileSearchOutlined,
  ContainerOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useMockData, mockData } from '../../mock/data';
import { exportToExcel } from '../../utils/excelUtils';

// Subcomponents
import StocktakingFormModal from '../../components/inventory/StocktakingFormModal';
import StocktakingDetailDrawer from './StocktakingDetailDrawer';
import StartCheckConfirmModal from '../../components/inventory/StartCheckConfirmModal';
import ImportResultModal from '../../components/inventory/ImportResultModal';
import CompleteConfirmModal from '../../components/inventory/CompleteConfirmModal';

const { RangePicker } = DatePicker;
const { Link } = Typography;

const StocktakingList = () => {
  const [form] = Form.useForm();
  const [allData] = useMockData('stocktakingTasks');
  const [warehouses] = useMockData('warehouses');
  const [products] = useMockData('products');
  
  const [displayData, setDisplayData] = useState(null);
  const data = displayData || allData;

  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [startModalOpen, setStartModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [adjustConfirmModalOpen, setAdjustConfirmModalOpen] = useState(false);
  const [pendingAdjustments, setPendingAdjustments] = useState([]);
  const [currentTask, setCurrentTask] = useState(null);

  // Statistics
  const stats = useMemo(() => {
    const total = data.length;
    const inProgress = data.filter(t => t.status === '盘点中').length;
    const pendingApprove = data.filter(t => t.status === '待审批').length;
    const finished = data.filter(t => t.status === '已完成').length;
    return { total, inProgress, pendingApprove, finished };
  }, [data]);

  const handleSearch = () => {
    const values = form.getFieldsValue();
    let filtered = [...allData];

    if (values.taskNo) filtered = filtered.filter(t => t.taskNo.includes(values.taskNo));
    if (values.warehouseName) filtered = filtered.filter(t => t.warehouseName === values.warehouseName);
    if (values.rangeType) filtered = filtered.filter(t => t.rangeType === values.rangeType);
    if (values.status) filtered = filtered.filter(t => t.status === values.status);
    if (values.dateRange) {
      const [start, end] = values.dateRange;
      filtered = filtered.filter(t => dayjs(t.createDate).isBetween(start, end, 'day', '[]'));
    }

    setDisplayData(filtered);
  };

  const handleReset = () => {
    form.resetFields();
    setDisplayData(null);
  };

  const updateTask = (task) => {
    mockData.upsert('stocktakingTasks', task);
  };

  const handleSaveTask = (task) => {
    mockData.upsert('stocktakingTasks', task);
    message.success('保存成功');
  };

  // Start Check Process
  const handleStartCheck = () => {
    const task = currentTask;
    // Simulate Snapshotting
    const snapshot = products.slice(0, 5).map(p => ({
        ...p,
        bookQty: Math.floor(Math.random() * 100) + 10,
        location: 'A-01-' + Math.floor(Math.random() * 10 + 1).toString().padStart(2, '0')
    }));
    
    const updated = {
        ...task,
        status: '盘点中',
        actualStartDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        baseTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        baseSnapshot: snapshot
    };
    updateTask(updated);
    setStartModalOpen(false);
    message.success('盘点任务已启动，基准库存已锁定');
  };

  // Export Sheet
  const handleExportSheet = (record) => {
    if (!record.baseSnapshot || record.baseSnapshot.length === 0) {
        message.warning('该任务尚未启动或无快照数据');
        return;
    }
    const headers = {
        location: '货位编码',
        productCode: '物料编码',
        productName: '物料名称',
        spec: '规格型号',
        unit: '单位',
        bookQty: '账面库存',
        actualQty: '实盘数量' // Placeholder
    };
    const exportData = record.baseSnapshot.map(item => ({ ...item, actualQty: '' }));
    exportToExcel(exportData, `盘点表_${record.taskNo}.xlsx`, headers);
    message.success('盘点表导出成功');
  };

  // Import Result & Calculate Diff
  const handleImportResult = (excelData) => {
    const task = currentTask;
    const snapshot = task.baseSnapshot || [];
    
    const diffResult = snapshot.map(item => {
        const imported = excelData.find(row => row['物料编码'] === item.productCode && row['货位编码'] === item.location);
        const actualQty = imported ? Number(imported['实盘数量'] || 0) : 0;
        const diffQty = actualQty - item.bookQty;
        const product = products.find(p => p.productCode === item.productCode);
        const cost = product?.standardCost || 0;
        
        return {
            ...item,
            actualQty,
            diffQty,
            diffAmount: diffQty * cost,
            reason: diffQty !== 0 ? '盘点中心核实' : ''
        };
    });

    const updated = {
        ...task,
        status: '待审批',
        diffResult
    };
    updateTask(updated);
    setImportModalOpen(false);
    message.success('盘点结果导入成功，差异已自动计算');
  };

  // Complete & Generate Adjustments
  const handleCompleteFinish = ({ status, reason, data: processedData }) => {
    const task = currentTask;
    if (task.status === '已完成') {
      setCompleteModalOpen(false);
      return;
    }

    if (status === '拒绝') {
        const updated = {
            ...task,
            status: '已拒绝',
            auditStatus: '已拒绝',
            auditReason: reason,
            auditTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
            diffResult: processedData
        };
        updateTask(updated);
        setCompleteModalOpen(false);
        message.info('审批已驳回');
        return;
    }

    const adjustments = (processedData || task.diffResult || [])
        .filter(d => d.diffQty !== 0 && d.resultStatus === '通过')
        .map(d => ({
            id: `ADJ-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            adjNo: `ADJ-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
            location: d.location,
            productCode: d.productCode,
            productName: d.productName,
            batchNo: d.batchNo,
            beforeQty: d.bookQty,
            afterQty: d.actualQty,
            adjQty: d.diffQty,
            adjAmount: d.diffAmount,
            reason: '盘点差异调整',
            time: dayjs().format('YYYY-MM-DD HH:mm:ss')
        }));
    
    // Preliminary save with audit info
    const taskWithAudit = {
        ...task,
        auditStatus: '已通过',
        auditReason: reason,
        auditTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        diffResult: processedData
    };
    setCurrentTask(taskWithAudit);
    
    setPendingAdjustments(adjustments);
    setCompleteModalOpen(false);
    
    if (adjustments.length > 0) {
      setAdjustConfirmModalOpen(true);
    } else {
      // If no adjustments needed but approved (all match), just finish
      const updated = {
          ...taskWithAudit,
          status: '已完成',
          actualEndDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
          finishDate: dayjs().format('YYYY-MM-DD'),
          adjustments: []
      };
      updateTask(updated);
      message.success('盘点已结案（无差异）');
    }
  };

  const handleApplyAdjustments = () => {
    const task = currentTask;
    const updated = {
        ...task,
        status: '已完成',
        actualEndDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
        finishDate: dayjs().format('YYYY-MM-DD'),
        adjustments: pendingAdjustments
    };
    updateTask(updated);
    setAdjustConfirmModalOpen(false);
    message.success('库存调整已确认，系统已根据盘点差异更新库存');
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { 
      title: '盘点任务号', 
      dataIndex: 'taskNo', 
      width: 160,
      render: (text, record) => (
        <Link onClick={() => { setCurrentTask(record); setDrawerOpen(true); }}>{text}</Link>
      )
    },
    { title: '盘点仓库', dataIndex: 'warehouseName', width: 140 },
    { title: '盘点范围描述', dataIndex: 'rangeDesc', width: 220, ellipsis: true },
    { title: '计划开始', dataIndex: 'planStartDate', width: 110 },
    { title: '计划完成', dataIndex: 'planEndDate', width: 110 },
    { title: '实际开始', dataIndex: 'actualStartDate', width: 150, render: (v) => v || '-' },
    { title: '实际结束', dataIndex: 'actualEndDate', width: 150, render: (v) => v || '-' },
    { title: '状态', 
      dataIndex: 'status', 
      width: 100,
      render: (status) => {
        const colors = { '草稿': 'default', '盘点中': 'blue', '待审批': 'orange', '已完成': 'green', '已拒绝': 'red' };
        return <Tag color={colors[status]}>{status}</Tag>;
      }
    },
    { 
      title: '操作', 
      key: 'action', 
      fixed: 'right', 
      width: 250,
      render: (_, record) => {
        const { status } = record;
        return (
          <Space size="middle">
            {status === '草稿' && (
              <>
                <a onClick={() => { setCurrentTask(record); setModalOpen(true); }}>编辑</a>
                <a onClick={() => { setCurrentTask(record); setStartModalOpen(true); }}>开始盘点</a>
              </>
            )}
            {status === '盘点中' && (
              <>
                <a onClick={() => handleExportSheet(record)}>导出</a>
                <a onClick={() => { setCurrentTask(record); setImportModalOpen(true); }}>导入结果</a>
              </>
            )}
            {status === '待审批' && (
              <a onClick={() => { setCurrentTask(record); setCompleteModalOpen(true); }}>审核盘点结果</a>
            )}
            {status === '已完成' && (
              <a onClick={() => { setCurrentTask(record); setCompleteModalOpen(true); }}>查看盘点结果</a>
            )}
          </Space>
        );
      }
    },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Stats Cards */}
      <Row gutter={16}>
        <Col span={6}>
          <Card variant="borderless" className="bg-blue-50">
            <Statistic title="任务总数" value={stats.total} prefix={<ContainerOutlined className="text-blue-500" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-blue-50">
            <Statistic title="盘点中" value={stats.inProgress} prefix={<PlayCircleOutlined className="text-blue-500" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-orange-50">
            <Statistic title="待审批" value={stats.pendingApprove} prefix={<FileSearchOutlined className="text-orange-500" />} />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="bg-green-50">
            <Statistic title="已完成" value={stats.finished} prefix={<CheckCircleOutlined className="text-green-500" />} />
          </Card>
        </Col>
      </Row>

      {/* Search Area */}
      <Card size="small">
        <Form form={form} layout="inline">
          <Form.Item name="taskNo" label="任务号"><Input placeholder="请输入" allowClear  /></Form.Item>
          <Form.Item name="status" label="状态">
            <Select placeholder="选择状态" style={{ width: 120 }} allowClear>
              <Select.Option value="草稿">草稿</Select.Option>
              <Select.Option value="盘点中">盘点中</Select.Option>
              <Select.Option value="待审批">待审批</Select.Option>
              <Select.Option value="已完成">已完成</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
              <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* List Table */}
      <Card size="small" title="盘点任务列表" extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => { setCurrentTask(null); setModalOpen(true); }}>新建任务</Button>}>
        <Table columns={columns} dataSource={data} rowKey="id" size="small" scroll={{ x: 1300 }} />
      </Card>

      {/* Modals & Drawer */}
      <StocktakingFormModal open={modalOpen} onCancel={() => setModalOpen(false)} onSave={handleSaveTask} editingRecord={currentTask} />
      <StocktakingDetailDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} taskNo={currentTask?.taskNo} />
      <StartCheckConfirmModal open={startModalOpen} onCancel={() => setStartModalOpen(false)} onConfirm={handleStartCheck} />
      <ImportResultModal open={importModalOpen} onCancel={() => setImportModalOpen(false)} onConfirm={handleImportResult} task={currentTask} />
      <CompleteConfirmModal 
        open={completeModalOpen} 
        onCancel={() => setCompleteModalOpen(false)} 
        onConfirm={handleCompleteFinish} 
        diffResult={currentTask?.diffResult} 
        status={currentTask?.status}
        auditInfo={{
          status: currentTask?.auditStatus,
          reason: currentTask?.auditReason,
          time: currentTask?.auditTime
        }}
      />

      <Modal forceRender
        title="确认库存调整单"
        open={adjustConfirmModalOpen}
        onCancel={() => setAdjustConfirmModalOpen(false)}
        onOk={handleApplyAdjustments}
        okText="确认调整"
        width={900}
        centered
      >
        <Alert 
          title="差异调整确认" 
          description="系统已根据盘点结果预生成以下库存调整明细。点击“确认调整”后，将正式修改对应库位物料的库存数量。" 
          type="warning" 
          showIcon 
          style={{ marginBottom: 16 }}
        />
        <Table
          dataSource={pendingAdjustments}
          rowKey="id"
          size="small"
          columns={[
            { title: '物料编码', dataIndex: 'productCode' },
            { title: '物料名称', dataIndex: 'productName' },
            { title: '货位', dataIndex: 'location' },
            { title: '批次', dataIndex: 'batchNo', render: t => t || '-' },
            { title: '调整前', dataIndex: 'beforeQty', align: 'right' },
            { title: '调整后', dataIndex: 'afterQty', align: 'right' },
            { 
              title: '调整量', 
              dataIndex: 'adjQty', 
              align: 'right',
              render: v => <Typography.Text type={v > 0 ? 'success' : 'danger'}>{v > 0 ? `+${v}` : v}</Typography.Text>
            },
          ]}
          pagination={false}
        />
      </Modal>
    </div>
  );
};

export default StocktakingList;
