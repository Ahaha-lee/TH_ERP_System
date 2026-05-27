import React, { useState, useEffect } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Descriptions, 
  Divider, 
  Table, 
  Radio, 
  Typography, 
  Space, 
  message 
} from 'antd';
import { warehouses } from '../../../mock/masterData';

const { TextArea } = Input;
const { Text } = Typography;

const OutboundAuditModal = ({ open, record, onCancel, onConfirm }) => {
  const [form] = Form.useForm();
  const [items, setItems] = useState([]);

  useEffect(() => {
    if (record && record.items) {
      setItems(record.items.map((item, index) => ({
        ...item,
        key: item.id || `item-${index}`,
        outboundQty: item.outboundQty || item.quantity || item.applyQty || 0,
        warehouseName: item.warehouseName || record.warehouseName || undefined,
        bin: item.bin || undefined
      })));
      form.resetFields();
    } else {
      setItems([]);
    }
  }, [record, open, form]);

  const handleOk = () => {
    form.validateFields().then(values => {
      onConfirm({
        ...values,
        items: items
      });
      form.resetFields();
    });
  };

  const isSubcontract = record?.type === '委外出库';
  const isOther = record?.type === '其他出库';

  const columns = [
    { title: '序号', render: (_, __, i) => i + 1, width: 60 },
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120, render: (v) => v || '-' },
    { title: '单位', dataIndex: 'unit', width: 80, render: (v) => v || '-' },
    { 
      title: isOther ? '申请数量' : '应发数量', 
      dataIndex: isOther ? 'applyQty' : 'applyQty', 
      width: 100, 
      align: 'right',
      render: (v, r) => {
        const val = r.applyQty !== undefined && r.applyQty !== null ? r.applyQty : r.quantity;
        return val !== undefined && val !== null ? val : '-';
      }
    },
    { 
      title: '本次出库数量', 
      dataIndex: 'outboundQty', 
      width: 120,
      align: 'right',
      render: (val, r) => {
        const value = r.outboundQty !== undefined && r.outboundQty !== null ? r.outboundQty : r.quantity;
        return <Text>{value !== undefined && value !== null ? value : '-'}</Text>;
      }
    },
    { 
      title: '出库仓库', 
      dataIndex: 'warehouseName', 
      width: 150,
      render: (val, r) => val || r.warehouseName || record?.warehouseName || '-'
    },
    { 
      title: '批次号', 
      dataIndex: 'batchNo', 
      width: 150,
      render: (val, r) => val || r.batchNo || '-'
    },
    { 
      title: '货位', 
      dataIndex: 'bin', 
      width: 120,
      render: (val, r) => val || r.bin || r.location || '-'
    },
    { 
      title: '备注', 
      dataIndex: 'remark', 
      width: 150,
      render: (val) => val || '-'
    },
  ];

  return (
    <Modal forceRender
      title={`${record?.type || ''}审核`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={1200}
      okText="确定"
      cancelText="取消"
    >
      {record ? (
        <>
          <Descriptions bordered column={3} size="small" style={{ marginBottom: 24 }}>
            <Descriptions.Item label="出库单号">{record.orderNo}</Descriptions.Item>
            <Descriptions.Item label="出库类型">
              <span className="text-orange-500 font-medium">{record.type}</span>
            </Descriptions.Item>
            {isSubcontract && (
              <>
                <Descriptions.Item label="关联委外采购单">{record.relNoticeNo || record.relOrderNo || '-'}</Descriptions.Item>
                <Descriptions.Item label="供应商">{record.partnerName || '-'}</Descriptions.Item>
                <Descriptions.Item label="创建日期/出库日期">{record.createDate || record.outboundDate || record.date || '-'}</Descriptions.Item>
              </>
            )}
            {isOther && (
              <>
                <Descriptions.Item label="其他出库类型">{record.usageType || record.category || '领款'}</Descriptions.Item>
                <Descriptions.Item label="关联申请单">{record.relApplyNo || record.relOrderNo || '-'}</Descriptions.Item>
                <Descriptions.Item label="申请人">{record.partnerName || record.applicant || '-'}</Descriptions.Item>
                <Descriptions.Item label="申请部门">{record.deptName || record.department || '-'}</Descriptions.Item>
                <Descriptions.Item label="创建日期/出库日期">{record.createDate || record.outboundDate || record.date || '-'}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="仓管员">{record.handler || record.operator || '管理员'}</Descriptions.Item>
            <Descriptions.Item label="状态">{record.status || '-'}</Descriptions.Item>
            <Descriptions.Item label="备注" span={3}>{record.remark || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider titlePlacement="left" style={{ margin: '0 0 16px 0' }}>
            {isSubcontract ? '发料明细' : '物料明细'}
          </Divider>
          
          <Table 
            dataSource={items}
            columns={columns}
            pagination={false}
            size="small"
            scroll={{ x: 1000, y: 300 }}
            rowKey="key"
            style={{ marginBottom: 24 }}
          />

          <Divider style={{ margin: '16px 0' }} />

          <Form 
            form={form} 
            layout="vertical"
            initialValues={{ auditResult: '通过' }}
          >
            <Form.Item 
              name="auditResult" 
              label="审核操作" 
              rules={[{ required: true }]}
            >
              <Radio.Group>
                <Radio value="通过">审核通过</Radio>
                <Radio value="拒绝">审核拒绝</Radio>
              </Radio.Group>
            </Form.Item>
            <Form.Item 
              name="auditRemark" 
              label="审核意见"
            >
              <TextArea rows={3} placeholder="请输入审核意见" />
            </Form.Item>
          </Form>
        </>
      ) : null}
    </Modal>
  );
};

export default OutboundAuditModal;
