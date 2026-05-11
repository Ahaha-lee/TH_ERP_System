
import dayjs from 'dayjs';

export const mockDeliveryNotices = [
    {
        id: 'dn-1',
        noticeNo: 'FH-20260429-001',
        orderNo: 'SOD-20250428-0001',
        customerName: '美家家居',
        settlementMethod: '月结',
        totalAmount: 12500,
        createdAt: '2026-04-29',
        salesperson: '管理员',
        status: '草稿',
        approvalStatus: '-',
        auditResult: '-',
        items: [
            { id: 'dni-1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', orderQty: 10, shippedQty: 0, pendingQty: 10, currentQty: 5 }
        ]
    },
    {
        id: 'dn-2',
        noticeNo: 'FH-20260429-002',
        orderNo: 'SOD-20250427-0001',
        customerName: '宏发商贸',
        settlementMethod: '预存',
        totalAmount: 16000,
        createdAt: '2026-04-28',
        salesperson: '张经理',
        status: '待财务审批',
        approvalStatus: '待审批',
        auditResult: '-',
        items: [
            { id: 'dni-2', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', orderQty: 5, shippedQty: 0, pendingQty: 5, currentQty: 5 }
        ]
    },
    {
        id: 'dn-3',
        noticeNo: 'FH-20260429-003',
        orderNo: 'SOD-20250425-0001',
        customerName: '瑞龙实业',
        settlementMethod: '月结',
        totalAmount: 6400,
        createdAt: '2026-04-27',
        salesperson: '管理员',
        status: '待财务审批',
        approvalStatus: '已审批',
        auditResult: '审批拒绝',
        items: [
            { id: 'dni-3', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', orderQty: 5, shippedQty: 3, pendingQty: 2, currentQty: 2 }
        ]
    },
    {
        id: 'dn-4',
        noticeNo: 'FH-20260429-004',
        orderNo: 'SOD-20250426-0001',
        customerName: '锦绣服饰旗舰店',
        settlementMethod: '现结',
        totalAmount: 9000,
        createdAt: '2026-04-28',
        salesperson: '管理员',
        status: '待仓库审批',
        approvalStatus: '待审批',
        auditResult: '-',
        paymentProof: 'https://placehold.co/100x100?text=PaymentProof',
        items: [
            { id: 'dni-4', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', orderQty: 10, shippedQty: 0, pendingQty: 10, currentQty: 5 }
        ]
    },
    {
        id: 'dn-5',
        noticeNo: 'FH-20260429-005',
        orderNo: 'SOD-20250428-0001',
        customerName: '美家家居',
        settlementMethod: '月结',
        totalAmount: 5000,
        createdAt: '2026-04-29',
        salesperson: '管理员',
        status: '待仓库审批',
        approvalStatus: '已审批',
        auditResult: '审批拒绝',
        items: [
            { id: 'dni-5', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', orderQty: 10, shippedQty: 5, pendingQty: 5, currentQty: 2 }
        ]
    },
    {
        id: 'dn-6',
        noticeNo: 'FH-20260429-006',
        orderNo: 'SOD-20250426-0002',
        customerName: '创意空间',
        settlementMethod: '月结',
        totalAmount: 25000,
        createdAt: '2026-04-29',
        salesperson: '张经理',
        status: '已审批',
        approvalStatus: '已审批',
        auditResult: '审批通过',
        items: [
            { id: 'dni-6', productCode: 'PROD004', productName: '电脑椅', spec: '人体工学/黑色', orderQty: 20, shippedQty: 0, pendingQty: 20, currentQty: 20 }
        ]
    },
    {
        id: 'dn-7',
        noticeNo: 'FH-20260429-007',
        orderNo: 'SOD-20250425-0002',
        customerName: '现代办公',
        settlementMethod: '现结',
        totalAmount: 18000,
        createdAt: '2026-04-26',
        salesperson: '管理员',
        status: '已出库',
        approvalStatus: '已审批',
        auditResult: '审批通过',
        outboundOrderNo: 'CK-20260429-001',
        items: [
            { id: 'dni-7', productCode: 'PROD005', productName: '办公桌', spec: '1.2m/白色', orderQty: 15, shippedQty: 15, pendingQty: 0, currentQty: 15 }
        ]
    }
];

export const deliveryNotices = mockDeliveryNotices;
