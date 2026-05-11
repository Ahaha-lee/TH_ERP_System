
import React from 'react';
import { Modal, Form, Input, Radio, Typography, Descriptions, Table, Tag, message } from 'antd';
import { formatCurrency } from '../../utils/helpers';

const { TextArea } = Input;
const { Text } = Typography;

const AuditActionModal = ({ open, record, onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    const isFinance = record?.status === '待财务审批';
    const isWarehouse = record?.status === '待仓库审核';
    
    const handleSubmit = () => {
        if (!record) return;
        form.validateFields().then(values => {
            const result = values.action === 'pass' ? '审核通过' : '审核拒绝';
            
            let nextStatus = record.status;
            if (result === '审核通过') {
                if (isFinance) {
                    nextStatus = '待仓库审核';
                } else if (isWarehouse) {
                    nextStatus = '已审核';
                }
            }

            onSuccess({
                ...record,
                status: nextStatus,
                auditResult: result,
                lastAuditRemark: values.remark
            });
            message.success(`已处理: ${result}`);
            form.resetFields();
        });
    };

    return (
        <Modal forceRender
            title={`${isFinance ? '财务审核' : '仓库审核'} - ${record?.noticeNo || ''}`}
            open={open}
            onCancel={onCancel}
            onOk={handleSubmit}
            okText="提交结果"
            cancelText="关闭"
            width={900}
            centered
        >
            {record && (
                <>
                <Descriptions bordered size="small" column={2} className="mb-4">
                    <Descriptions.Item label="单据号">{record.noticeNo}</Descriptions.Item>
                    <Descriptions.Item label="结算方式">{record.settlementMethod}</Descriptions.Item>
                    <Descriptions.Item label="客户">{record.customerName}</Descriptions.Item>
                    <Descriptions.Item label="发货金额"><Text type="danger">{formatCurrency(record.totalAmount)}</Text></Descriptions.Item>
                </Descriptions>

                {isFinance && record.paymentImages && record.paymentImages.length > 0 && (
                    <div className="mb-4">
                        <Text type="secondary">付款凭证：</Text>
                        <div className="flex gap-2 mt-2">
                            {record.paymentImages.map((img, i) => (
                                <img key={i} src={img.url} className="w-20 h-20 border rounded object-cover" alt="Proof" width={80} height={80} />
                            ))}
                        </div>
                    </div>
                )}
                </>
            )}

            <Form form={form} layout="vertical" initialValues={{ action: 'pass' }}>
                {record && (
                    <>
                    <Form.Item label="审核结果" name="action" rules={[{ required: true }]}>
                        <Radio.Group>
                            <Radio.Button value="pass" className="!text-green-600">审核通过</Radio.Button>
                            <Radio.Button value="reject" className="!text-red-600">审核拒绝</Radio.Button>
                        </Radio.Group>
                    </Form.Item>
                    <Form.Item label="审核意见" name="remark" rules={[{ required: true, message: '请填写审核意见' }]}>
                        <TextArea rows={3} placeholder="请填写意见..." maxLength={200} showCount />
                    </Form.Item>
                    </>
                )}
            </Form>
        </Modal>
    );
};

export default AuditActionModal;
