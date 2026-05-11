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
    { title: '物料编码', dataIndex: 'productCode', width: 120 },
    { title: '物料名称', dataIndex: 'productName', width: 150 },
    { title: '规格', dataIndex: 'spec', width: 120 },
    { title: '单位', dataIndex: 'unit', width: 80 },
    { 
      title: isOther ? '申请数量' : '应发数量', 
      dataIndex: isOther ? 'applyQty' : 'quantity', 
      width: 100, 
      align: 'right',
      render: (v, r) => v || r?.quantity || 0
    },
    { 
      title: '本次出库数量', 
      dataIndex: 'outboundQty', 
      width: 120,
      align: 'right',
      render: (val) => <Text>{val}</Text>
    },
    { 
      title: '出库仓库', 
      dataIndex: 'warehouseName', 
      width: 150,
      render: (val) => val || '-'
    },
    { 
      title: '货位', 
      dataIndex: 'bin', 
      width: 120,
      render: (val) => val || '-'
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
            {isSubcontract && (
              <>
                <Descriptions.Item label="关联委外采购单">{record.relOrderNo || '-'}</Descriptions.Item>
                <Descriptions.Item label="供应商名称">{record.partnerName || '-'}</Descriptions.Item>
              </>
            )}
            {isOther && (
              <>
                <Descriptions.Item label="其他出库类型">{record.category || '生产余料出料'}</Descriptions.Item>
                <Descriptions.Item label="关联申请单">{record.relOrderNo || '-'}</Descriptions.Item>
                <Descriptions.Item label="申请人">{record.applicant || '管理员'}</Descriptions.Item>
                <Descriptions.Item label="申请部门">{record.department || '生产部'}</Descriptions.Item>
              </>
            )}
            <Descriptions.Item label="仓管员">{record.operator || '管理员'}</Descriptions.Item>
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
