import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  Row, 
  Col, 
  Table, 
  Space, 
  Button, 
  message,
  Divider,
  Tag
} from 'antd';
import dayjs from 'dayjs';
import { warehouses } from '../../mock';
import { productCategories } from '../../mock';
import { products } from '../../mock';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

const StocktakingFormModal = ({ open, onCancel, onSave, editingRecord }) => {
  const [form] = Form.useForm();
  const [rangeType, setRangeType] = useState('全部物料');
  const [previewData, setPreviewData] = useState([]);

  const currentWarehouse = Form.useWatch('warehouseName', form);

  useEffect(() => {
    if (open) {
      if (editingRecord) {
        form.setFieldsValue({
          ...editingRecord,
          planDate: [dayjs(editingRecord.planStartDate), dayjs(editingRecord.planEndDate)]
        });
        setRangeType(editingRecord.rangeType);
      } else {
        form.setFieldsValue({
          planNo: `PD-${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          type: '动态盘点',
          rangeType: '全部物料',
          status: '草稿',
          creator: '管理员'
        });
        setRangeType('全部物料');
      }
    }
  }, [open, editingRecord, form]);

  useEffect(() => {
    if (!currentWarehouse) {
      setPreviewData([]);
    } else {
      let filtered = [...products];
      // For mock, just grab products of one category or filter based on a selected value if we had one in state
      setPreviewData(filtered.slice(0, 5)); // Just preview first 5 for UI consistency
    }
  }, [currentWarehouse, rangeType]);

  const handleRangeChange = (value) => {
    setRangeType(value);
  };

  const handleFinish = (status) => {
    form.validateFields().then(values => {
      const task = {
        ...values,
        id: editingRecord?.id || `st-${Date.now()}`,
        taskNo: editingRecord?.taskNo || `ST${dayjs().format('YYYYMMDD')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        status,
        planStartDate: values.planDate[0].format('YYYY-MM-DD'),
        planEndDate: values.planDate[1].format('YYYY-MM-DD'),
        createDate: dayjs().format('YYYY-MM-DD'),
        creator: '管理员',
        rangeDesc: valueToDesc(values)
      };
      onSave(task);
      onCancel();
    });
  };

  const valueToDesc = (values) => {
    if (values.rangeType === '全部物料') return '全部物料';
    if (values.rangeType === '按物料分类') return `按物料分类: ${values.category || '未指定'}`;
    if (values.rangeType === '按货位') return `按货位: ${values.bins?.join(', ') || '未指定'}`;
    if (values.rangeType === '按物料') return `按物料: ${values.productCount || 0} 项`;
    return values.rangeType;
  };

  const columns = [
    { title: '序号', width: 60, render: (_, __, i) => i + 1 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '批次号', dataIndex: 'batchNo', width: 120, render: (v) => v || '-' },
    { title: '规格型号', dataIndex: 'spec', width: 150 },
    { title: '物料分类', dataIndex: 'category', width: 100 },
    { title: '主货位', dataIndex: 'location', width: 100, render: () => 'A-01-01' },
  ];

  return (
    <Modal
      title={editingRecord ? '编辑盘点任务' : '新增盘点任务'}
      open={open}
      onCancel={onCancel}
      width={900}
      forceRender
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" onClick={() => handleFinish('草稿')}>保存草稿</Button>,
        <Button key="submit" type="primary" onClick={() => handleFinish('盘点中')}>保存并开始盘点</Button>,
      ]}
      
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item name="warehouseName" label="盘点仓库" rules={[{ required: true }]}>
              <Select placeholder="请选择">
                {warehouses.map(w => <Select.Option key={w.name} value={w.name}>{w.name}</Select.Option>)}
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="rangeType" label="盘点范围" rules={[{ required: true }]}>
              <Select onChange={handleRangeChange}>
                <Select.Option value="全部物料">全部物料</Select.Option>
                <Select.Option value="按物料分类">按物料分类</Select.Option>
                <Select.Option value="按货位">按货位</Select.Option>
                <Select.Option value="按物料">按物料</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item name="planDate" label="计划盘点周期" rules={[{ required: true }]}>
              <RangePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        {rangeType === '按物料分类' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="category" label="选择物料分类" rules={[{ required: true }]}>
                <Select placeholder="选择分类" mode="multiple">
                  {productCategories.map(c => <Select.Option key={c.id} value={c.name}>{c.name}</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {rangeType === '按货位' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="bins" label="选择货位范围" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="选择货位">
                  <Select.Option value="A-01-01">A-01-01</Select.Option>
                  <Select.Option value="A-01-02">A-01-02</Select.Option>
                  <Select.Option value="B-02-01">B-02-01</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        {rangeType === '按物料' && (
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="products" label="选择盘点物料" rules={[{ required: true }]}>
                <Select mode="multiple" placeholder="搜索物料" showSearch optionFilterProp="label">
                  {products.map(p => (
                    <Select.Option key={p.productCode} value={p.productCode} label={p.productName}>
                      {p.productCode} - {p.productName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>
        )}

        <Form.Item name="remark" label="备注">
          <TextArea rows={2} placeholder="请输入备注" />
        </Form.Item>
      </Form>

      <Divider titlePlacement="left">待盘点物料预览 (系统根据范围自动生成)</Divider>
      <Table
        columns={columns}
        dataSource={previewData}
        rowKey={(record) => record.productCode}
        size="small"
        pagination={false}
        locale={{ emptyText: currentWarehouse ? '暂无数据' : '请先选择盘点仓库以生成物料预览' }}
      />
    </Modal>
  );
};

export default StocktakingFormModal;
