import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Select, 
  Space, 
  Drawer, 
  Descriptions, 
  Typography,
  Tag,
  Button,
  Input,
  DatePicker,
  Divider
} from 'antd';
import { UserOutlined, PercentageOutlined, SearchOutlined } from '@ant-design/icons';
import { useMockData } from '../../mock/data';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SalesTargetStats = () => {
  const [stats] = useMockData('salesTargetStats');
  const [plans] = useMockData('salesTargetPlans');
  const [selectedProject, setSelectedProject] = useState(null);
  const [salespersonName, setSalespersonName] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentSalesperson, setCurrentSalesperson] = useState(null);

  // Constants for calculation
  const currentMonth = dayjs().month(); // 0-indexed

  // Project List for Select
  const projectOptions = useMemo(() => {
    const names = Array.from(new Set(plans.map(p => p.projectName)));
    return names.map(name => ({ label: name, value: name }));
  }, [plans]);

  // Flattened logs for the main table (daily activity log level)
  const allLogs = useMemo(() => {
    let logs = [];
    stats.forEach(s => {
      if (s.history) {
        s.history.forEach(h => {
          logs.push({
            ...h,
            salespersonId: s.id,
            projectName: s.projectName,
            salespersonName: s.salespersonName,
            parentRecord: s // reference original salesperson for details
          });
        });
      }
    });
    return logs;
  }, [stats]);

  // Filtered Logs for the Table and summary calculation
  const filteredLogs = useMemo(() => {
    return allLogs.filter(log => {
      const matchProject = !selectedProject || log.projectName === selectedProject;
      const matchName = !salespersonName || log.salespersonName.includes(salespersonName);
      let matchDate = true;
      if (dateRange && dateRange[0] && dateRange[1]) {
        const logDate = dayjs(log.date);
        matchDate = (logDate.isAfter(dateRange[0], 'month') || logDate.isSame(dateRange[0], 'month')) &&
                    (logDate.isBefore(dateRange[1], 'month') || logDate.isSame(dateRange[1], 'month'));
      }
      return matchProject && matchName && matchDate;
    });
  }, [allLogs, selectedProject, salespersonName, dateRange]);

  // Global Annual Stats (affected BY year filter, but NOT project/salesperson)
  const globalAnnualSummaries = useMemo(() => {
    const selectedYears = (!dateRange || !dateRange[0] || !dateRange[1]) 
      ? [dayjs().year()] 
      : Array.from({ length: dateRange[1].year() - dateRange[0].year() + 1 }, (_, i) => dateRange[0].year() + i);

    return selectedYears.map(year => {
      const filteredPlansByYear = plans.filter(p => p.year === year);
      const annualLogs = allLogs.filter(log => dayjs(log.date).year() === year);

      const totalTargetAnnual = filteredPlansByYear.reduce((acc, curr) => acc + curr.annualTarget, 0);
      const totalActualOrderAmount = annualLogs.reduce((acc, curr) => acc + curr.orderAmount, 0);
      const annualRate = totalTargetAnnual ? (totalActualOrderAmount / totalTargetAnnual * 100).toFixed(2) : '0.00';
      const remaining = Math.max(0, totalTargetAnnual - totalActualOrderAmount);

      return {
        year,
        yearLabel: `${year}年度`,
        targetAnnual: totalTargetAnnual,
        actualOrderTotal: totalActualOrderAmount,
        annualOrderRate: annualRate,
        remainingAnnual: remaining,
      };
    });
  }, [plans, allLogs, dateRange]);

  // Summary Logic for Cards (Aggregation based on ALL filters)
  const summary = useMemo(() => {
    const filteredPlans = selectedProject
      ? plans.filter(p => p.projectName === selectedProject)
      : plans;

    // Filter aggregated stats based on user inputs
    const actualOrderTotal = filteredLogs.reduce((acc, curr) => acc + curr.orderAmount, 0);
    const actualDeliveryTotal = filteredLogs.reduce((acc, curr) => acc + curr.deliveryAmount, 0);

    // Calculate aggregated target for the selected period
    let targetForPeriod = 0;
    if (dateRange && dateRange[0] && dateRange[1]) {
      const start = dateRange[0].startOf('month');
      const end = dateRange[1].endOf('month');
      
      filteredPlans.forEach(plan => {
        if (plan.monthlyTargets) {
          let current = start.clone();
          while (current.isBefore(end) || current.isSame(end, 'month')) {
            if (current.year() === plan.year) {
              targetForPeriod += plan.monthlyTargets[current.month()] || 0;
            }
            current = current.add(1, 'month');
          }
        }
      });
    } else {
      targetForPeriod = filteredPlans.reduce((acc, curr) => acc + (curr.monthlyTargets?.[currentMonth] || 0), 0);
    }
    
    // Rates for filtered data
    const orderRate = targetForPeriod ? (actualOrderTotal / targetForPeriod * 100).toFixed(2) : '0.00';
    const deliveryRate = targetForPeriod ? (actualDeliveryTotal / targetForPeriod * 100).toFixed(2) : '0.00';
    
    // Get label for current period
    let periodLabel = '本期';
    if (dateRange && dateRange[0] && dateRange[1]) {
      if (dateRange[0].isSame(dateRange[1], 'month')) {
        periodLabel = dateRange[0].format('YYYY年MM月');
      } else {
        periodLabel = `${dateRange[0].format('YY/MM')}-${dateRange[1].format('YY/MM')}`;
      }
    }

    return {
      actualOrderTotal,
      actualDeliveryTotal,
      targetPeriod: targetForPeriod,
      orderRate,
      deliveryRate,
      periodLabel,
      remainingPeriod: Math.max(0, targetForPeriod - actualOrderTotal)
    };
  }, [selectedProject, filteredLogs, plans, currentMonth, dateRange]);

  // Table Columns
  const columns = [
    {
      title: '序号',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: '项目',
      dataIndex: 'projectName',
      key: 'projectName',
    },
    {
      title: '业务员名称',
      dataIndex: 'salespersonName',
      key: 'salespersonName',
      render: (text) => (
        <Space>
           <UserOutlined />
           <Text strong>{text}</Text>
        </Space>
      )
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix(),
    },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      render: (val) => <Text strong type="success">¥{Number(val).toLocaleString()}</Text>,
    },
    {
      title: '发货金额',
      dataIndex: 'deliveryAmount',
      key: 'deliveryAmount',
      render: (val) => `¥${Number(val).toLocaleString()}`,
    }
  ];

  const handleRowClick = (record) => {
    setCurrentSalesperson(record);
    setDrawerOpen(true);
  };

  const detailColumns = [
    {
      title: '序号',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: '日期',
      dataIndex: 'date',
      key: 'date',
      sorter: (a, b) => dayjs(b.date).unix() - dayjs(a.date).unix(),
    },
    {
      title: '订单金额',
      dataIndex: 'orderAmount',
      key: 'orderAmount',
      render: (val) => `¥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      title: '发货金额',
      dataIndex: 'deliveryAmount',
      key: 'deliveryAmount',
      render: (val) => `¥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
  ];

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <Card variant="borderless" className="mb-4 shadow-sm">
        <Row gutter={24}>
          <Col span={6}>
            <div className="mb-1 text-gray-500 text-xs">项目名称</div>
            <Select
              placeholder="请选择项目"
              style={{ width: '100%' }}
              allowClear
              onChange={setSelectedProject}
              options={projectOptions}
            />
          </Col>
          <Col span={6}>
            <div className="mb-1 text-gray-500 text-xs">业务员名称</div>
            <Input 
              placeholder="请输入业务员姓名" 
              prefix={<SearchOutlined />} 
              value={salespersonName}
              onChange={e => setSalespersonName(e.target.value)}
              allowClear
            />
          </Col>
          <Col span={10}>
            <div className="mb-1 text-gray-500 text-xs">时间范围 (年月)</div>
            <RangePicker 
              picker="month" 
              style={{ width: '100%' }} 
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
        </Row>
      </Card>

      <Row gutter={[12, 12]} className="mb-4" align="stretch">
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm h-full" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="订单总额"
              value={summary.actualOrderTotal}
              precision={2}
              prefix="¥"
              styles={{ content: { color: '#3f8600' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm h-full" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="订单目标达成率"
              value={summary.orderRate}
              precision={2}
              suffix="%"
              styles={{ content: { color: Number(summary.orderRate) >= 100 ? '#3f8600' : '#cf1322' } }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm h-full" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="发货总额"
              value={summary.actualDeliveryTotal}
              precision={2}
              prefix="¥"
              styles={{ content: { color: '#1677ff' } }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card variant="borderless" className="shadow-sm h-full" styles={{ body: { padding: '16px' } }}>
            <Statistic
              title="发货目标达成率"
              value={summary.deliveryRate}
              precision={2}
              suffix="%"
              styles={{ content: { color: Number(summary.deliveryRate) >= 100 ? '#3f8600' : '#cf1322' } }}
              prefix={<PercentageOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {globalAnnualSummaries.length > 0 && (
        <Card title={<Text strong>年度汇总统计</Text>} variant="borderless" className="shadow-sm mb-4" styles={{ body: { padding: '12px 24px' } }}>
          {globalAnnualSummaries.map((yearSummary, index) => (
            <div key={yearSummary.year} className={index > 0 ? "mt-4 pt-4 border-t border-gray-100" : ""}>
              <Row gutter={24} align="middle">
                <Col span={4}>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <Title level={5} style={{ margin: 0 }}>{yearSummary.yearLabel}</Title>
                    <Text type="secondary" className="text-[10px]">年度目标汇总</Text>
                  </div>
                </Col>
                <Col span={10}>
                  <Statistic
                    title="年度目标销售额"
                    value={yearSummary.targetAnnual}
                    precision={2}
                    prefix="¥"
                    styles={{ content: { color: '#1f1f1f', fontSize: '20px' } }}
                  />
                  <div className="mt-1 text-xs text-gray-500 flex space-x-6">
                    <div>已完成：<Text type="success" strong>¥{yearSummary.actualOrderTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text></div>
                    <div>未完成：<Text type="danger" strong>¥{yearSummary.remainingAnnual.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text></div>
                  </div>
                </Col>
                <Col span={10}>
                  <Statistic
                    title="年度目标达成率"
                    value={yearSummary.annualOrderRate}
                    precision={2}
                    suffix="%"
                    styles={{ content: { color: '#fa8c16', fontSize: '20px' } }}
                    prefix={<PercentageOutlined />}
                  />
                </Col>
              </Row>
            </div>
          ))}
        </Card>
      )}

      <Table 
        columns={columns} 
        dataSource={filteredLogs}
        rowKey={(record) => `${record.salespersonId}-${record.date}`}
        className="shadow-sm"
        onRow={(record) => ({
          onClick: () => handleRowClick(record.parentRecord),
          className: 'cursor-pointer hover:bg-blue-50 transition-colors'
        })}
        pagination={{
          showQuickJumper: true,
          showSizeChanger: true,
          defaultPageSize: 10,
          showTotal: (total) => `共 ${total} 条数据`,
        }}
      />

      <Drawer
        title="完成情况明细"
        placement="right"
        size="large"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        extra={
            <Space>
                <Tag color="blue">{currentSalesperson?.projectName}</Tag>
                <Tag color="cyan">{currentSalesperson?.salespersonName}</Tag>
                <Button type="primary" size="small" onClick={() => setDrawerOpen(false)}>关闭</Button>
            </Space>
        }
      >
        {currentSalesperson && (
          <>
            <div className="mb-6">
                <Title level={5}>业务员基本信息</Title>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="所属项目">{currentSalesperson.projectName}</Descriptions.Item>
                    <Descriptions.Item label="业务员姓名">{currentSalesperson.salespersonName}</Descriptions.Item>
                    <Descriptions.Item label="当月累计订单总额">
                        <Text strong type="success">¥{currentSalesperson.monthlyOrderAmount.toLocaleString()}</Text>
                    </Descriptions.Item>
                    <Descriptions.Item label="当月累计发货总额">
                        <Text strong>¥{currentSalesperson.monthlyDeliveryAmount.toLocaleString()}</Text>
                    </Descriptions.Item>
                </Descriptions>
            </div>

            <div className="mb-6">
                <Title level={5}>金额明细记录</Title>
                <Table
                   columns={detailColumns}
                   dataSource={currentSalesperson.history}
                   rowKey="id"
                   pagination={{
                      pageSize: 5,
                      showTotal: (total) => `共 ${total} 条记录`
                   }}
                />
            </div>

            <div>
                <Title level={5}>历史月份统计</Title>
                <Table
                   columns={[
                     { title: '序号', width: 70, render: (_, __, idx) => idx + 1 },
                     { title: '年份', dataIndex: 'year', key: 'year' },
                     { title: '月份', dataIndex: 'month', key: 'month', render: m => `${m}月` },
                     { title: '订单金额', dataIndex: 'orderAmount', key: 'orderAmount', render: v => `¥${Number(v).toLocaleString()}` },
                     { title: '发货金额', dataIndex: 'deliveryAmount', key: 'deliveryAmount', render: v => `¥${Number(v).toLocaleString()}` },
                   ]}
                   dataSource={currentSalesperson.monthlyHistory}
                   rowKey="id"
                   pagination={false}
                />
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
};

export default SalesTargetStats;
