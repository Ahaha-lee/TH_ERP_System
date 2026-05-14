import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Card, 
  Button, 
  Input, 
  Select, 
  Space, 
  Modal, 
  Form, 
  InputNumber, 
  message, 
  Popconfirm,
  Row,
  Col,
  Typography
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useMockData } from '../../mock/data';

const { Title, Text } = Typography;

const SalesTargetPlan = () => {
  const [plans, setPlans] = useMockData('salesTargetPlans');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Handle auto-calculation of monthly average (only for display/reference)
  const handleAnnualTargetChange = (value) => {
    if (value) {
      const avg = (value / 12).toFixed(2);
      form.setFieldsValue({ monthlyAverageTarget: avg });
    } else {
      form.setFieldsValue({ monthlyAverageTarget: 0 });
    }
  };

  const handleAdd = () => {
    setEditingPlan(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditingPlan(record);
    form.setFieldsValue({
      ...record,
      monthlyAverageTarget: (record.annualTarget / 12).toFixed(2)
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    const newPlans = plans.filter(p => p.id !== id);
    setPlans(newPlans);
    message.success('删除成功');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const { monthlyTargets, ...rest } = values;
      const formattedMonthlyTargets = Array.isArray(monthlyTargets) ? monthlyTargets : [];
      
      if (editingPlan) {
        const newPlans = plans.map(p => 
          p.id === editingPlan.id ? { ...p, ...rest, monthlyTargets: formattedMonthlyTargets, monthlyAverageTarget: (rest.annualTarget / 12) } : p
        );
        setPlans(newPlans);
        message.success('更新成功');
      } else {
        const newPlan = {
          id: `stp${Date.now()}`,
          ...rest,
          monthlyTargets: formattedMonthlyTargets,
          monthlyAverageTarget: (rest.annualTarget / 12)
        };
        setPlans([newPlan, ...plans]);
        message.success('添加成功');
      }
      setIsModalOpen(false);
    });
  };

  const filteredPlans = useMemo(() => {
    if (!searchText) return plans;
    return plans.filter(p => p.projectName.includes(searchText));
  }, [plans, searchText]);

  const columns = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 70,
      fixed: 'left',
      render: (text, record, index) => index + 1,
    },
    {
      title: '年份',
      dataIndex: 'year',
      key: 'year',
      width: 100,
      fixed: 'left',
      sorter: (a, b) => a.year - b.year,
    },
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '年度目标',
      dataIndex: 'annualTarget',
      key: 'annualTarget',
      width: 150,
      fixed: 'left',
      render: (val) => `¥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    ...new Array(12).fill(0).map((_, index) => ({
      title: `${index + 1}月目标`,
      key: `month_${index}`,
      dataIndex: 'monthlyTargets',
      width: 120,
      render: (targets) => {
        const val = targets ? targets[index] : 0;
        return `¥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      }
    })),
    {
      title: '月均目标',
      dataIndex: 'monthlyAverageTarget',
      key: 'monthlyAverageTarget',
      width: 150,
      render: (val) => `¥${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="数据删除后不可恢复，确定要删除吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="link" 
              danger 
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const projectOptions = useMemo(() => {
    const uniqueProjects = Array.from(new Set(plans.map(p => p.projectName)));
    return uniqueProjects.map(name => ({ label: name, value: name }));
  }, [plans]);

  return (
    <div className="p-4">
      <Card className="mb-4">
        <Space>
          <Select
            placeholder="请选择项目"
            style={{ width: 200 }}
            allowClear
            onChange={(val) => setSearchText(val || '')}
            options={projectOptions}
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增
          </Button>
        </Space>
      </Card>

      <Table 
        columns={columns} 
        dataSource={filteredPlans} 
        rowKey="id"
        scroll={{ x: 'max-content' }}
        pagination={{
            showQuickJumper: true,
            showSizeChanger: true,
            defaultPageSize: 10,
            showTotal: (total) => `共 ${total} 条数据`,
        }}
        bordered
      />

      <Modal
        title={editingPlan ? "编辑计划" : "新增计划"}
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
        width={800}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
          initialValues={{ monthlyTargets: new Array(12).fill(0) }}
        >
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="projectName"
                label="项目名称"
                rules={[{ required: true, message: '请输入项目名称' }]}
              >
                <Input placeholder="请输入项目名称" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="year"
                label="年份"
                rules={[{ required: true, message: '请选择年份' }]}
              >
                <Select placeholder="请选择年份">
                  {new Array(10).fill(0).map((_, i) => {
                    const y = new Date().getFullYear() - 2 + i;
                    return <Select.Option key={y} value={y}>{y}年</Select.Option>;
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="annualTarget"
                label="年度目标"
                rules={[{ required: true, message: '请输入年度目标' }]}
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  placeholder="请输入年度目标"
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                  onChange={handleAnnualTargetChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="monthlyAverageTarget"
                label="月均目标 (年度目标/12)"
              >
                <InputNumber 
                  style={{ width: '100%' }} 
                  disabled 
                  placeholder="自动计算"
                  formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                />
              </Form.Item>
            </Col>
          </Row>

          <Title level={5} style={{ marginTop: 16 }}>月度目标 (1-12月)</Title>
          <div style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: 8 }}>
            <Row gutter={[16, 8]}>
              {new Array(12).fill(0).map((_, index) => (
                <Col span={8} key={index}>
                  <Form.Item
                    name={['monthlyTargets', index]}
                    label={`${index + 1}月目标`}
                    rules={[{ required: true, message: `请输入${index + 1}月目标` }]}
                  >
                    <InputNumber 
                      style={{ width: '100%' }} 
                      placeholder="请输入月度目标"
                      formatter={value => `¥ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value.replace(/\¥\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              ))}
            </Row>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default SalesTargetPlan;
