
import dayjs from 'dayjs';

/**
 * claimStatus: '未认领' | '部分认领' | '待审批' | '已认领'
 */
export const initialBankFlows = [
  {
    id: '1',
    flowNo: 'ICBC202504230001',
    transTime: '2025-04-23 10:30:00',
    amount: 10000,
    batchNo: 'IMP202504230001',
    payerName: '美家家居有限公司',
    payerAccount: '6217********1234',
    summary: 'SOD-20250423-0001 货款',
    claimStatus: '部分认领',
    claimUser: '张三',
    claims: [
      { 
        id: 'clm1', 
        type: '销售订单', 
        orderNo: 'SOD-20250423-0001', 
        customerName: '美家家居',
        salesman: '张三',
        orderTotalAmount: 10000,
        orderReceivedAmount: 0,
        orderPendingAmount: 10000,
        claimRatio: 30,
        amount: 3000, 
        claimant: '张三',
        claimTime: '2025-04-23 14:00:00',
        remark: '首付款认领',
        status: '审批通过' 
      }
    ]
  },
  {
    id: '2',
    flowNo: 'ICBC202504230002',
    transTime: '2025-04-23 11:15:00',
    amount: 50000,
    batchNo: 'IMP202504230001',
    payerName: '宜居美学有限公司',
    payerAccount: '6222********5678',
    summary: '货款',
    claimStatus: '未认领',
    claimUser: null,
    claims: []
  },
  {
    id: '3',
    flowNo: 'BOC202504240001',
    transTime: '2025-04-24 09:00:00',
    amount: 8500,
    batchNo: 'IMP202504230001',
    payerName: '雅居饰界有限公司',
    payerAccount: '6212********9901',
    summary: '尾款',
    claimStatus: '已认领',
    claimUser: '李四',
    claims: [
      { 
        id: 'clm2', 
        type: '销售订单', 
        orderNo: 'SOD-20250424-0002', 
        customerName: '雅居饰界',
        salesman: '李四',
        orderTotalAmount: 8500,
        orderReceivedAmount: 0,
        orderPendingAmount: 8500,
        claimRatio: 100,
        amount: 8500, 
        claimant: '李四',
        claimTime: '2025-04-24 10:00:00',
        remark: '全额认领',
        status: '审批通过' 
      }
    ]
  },
  {
    id: '4',
    flowNo: 'ABC202504250005',
    transTime: '2025-04-25 14:20:00',
    amount: 15600,
    batchNo: 'IMP202504230002',
    payerName: '宜居美学',
    payerAccount: '6214********4432',
    summary: '货款',
    claimStatus: '未认领',
    claimUser: null,
    claims: []
  },
  {
    id: '5',
    flowNo: 'CCB202504250006',
    transTime: '2025-04-25 16:45:00',
    amount: 30000,
    batchNo: 'IMP202504250001',
    payerName: '雅居饰界',
    payerAccount: '6222********5678',
    summary: '充值货款',
    claimStatus: '已认领',
    claimUser: '李四',
    claims: [
      { 
        id: 'clm3', 
        type: '充值订单', 
        orderNo: 'CZ202504250001',
        customerName: '雅居饰界',
        salesman: '李四',
        orderTotalAmount: 30000,
        orderReceivedAmount: 0,
        orderPendingAmount: 30000,
        claimRatio: 100,
        amount: 30000, 
        claimant: '李四',
        claimTime: '2025-04-25 17:00:00',
        remark: '预存充值',
        status: '审批通过' 
      }
    ]
  },
  {
    id: '6',
    flowNo: 'ABC202504260010',
    transTime: '2025-04-26 10:00:00',
    amount: 5000,
    batchNo: 'IMP202504260001',
    payerName: '尚品宅配(代理)',
    payerAccount: '6211********1111',
    summary: 'SOD-20250426-0006',
    claimStatus: '已认领',
    claimUser: '张三',
    claims: [
      { 
        id: 'clm4', 
        type: '销售订单', 
        orderNo: 'SOD-20250426-0006',
        customerName: '尚品宅配(代理)',
        salesman: '张三',
        orderTotalAmount: 5000,
        orderReceivedAmount: 0,
        orderPendingAmount: 5000,
        claimRatio: 100,
        amount: 5000, 
        claimant: '张三',
        claimTime: '2025-04-26 10:15:00',
        remark: '全额收货款',
        status: '审批通过' 
      }
    ]
  }
];

export const initialClaimRecords = [
  {
    id: 'clm1',
    claimNo: 'CLM20250423000001',
    recordNo: 'CLM20250423000001',
    flowNo: 'ICBC202504230001',
    orderType: '销售订单',
    orderNo: 'SOD-20250423-0001',
    customerName: '美家家居',
    customerType: '独立店',
    salesman: '张三',
    amount: 3000,
    claimAmount: 3000,
    orderAmount: 10000,
    receivedAmount: 0,
    claimant: '张三',
    claimUser: '张三',
    claimTime: '2025-04-23 14:00:00',
    status: '审批通过',
    reviewer: '财务主管',
    reviewTime: '2025-04-23 15:30:00',
    remark: '首付款认领'
  },
  {
    id: 'clm2',
    claimNo: 'CLM20250424000001',
    recordNo: 'CLM20250424000001',
    flowNo: 'BOC202504240001',
    orderType: '销售订单',
    orderNo: 'SOD-20250424-0002',
    customerName: '雅居饰界',
    customerType: '分销商',
    salesman: '李四',
    amount: 8500,
    claimAmount: 8500,
    orderAmount: 8500,
    receivedAmount: 0,
    claimant: '李四',
    claimUser: '李四',
    claimTime: '2025-04-24 10:00:00',
    status: '审批通过',
    remark: '全额认领'
  },
  {
    id: 'clm3',
    claimNo: 'CLM20250425000001',
    recordNo: 'CLM20250425000001',
    flowNo: 'CCB202504250006',
    orderType: '充值订单',
    orderNo: 'CZ202504250001',
    customerName: '雅居饰界',
    customerType: '分销商',
    salesman: '李四',
    amount: 30000,
    claimAmount: 30000,
    orderAmount: 30000,
    receivedAmount: 0,
    claimant: '李四',
    claimUser: '李四',
    claimTime: '2025-04-25 17:00:00',
    status: '审批通过',
    reviewer: '管理员',
    reviewTime: '2025-04-25 17:05:00',
    remark: '预存充值'
  },
  {
    id: 'clm4',
    claimNo: 'CLM20250426000001',
    recordNo: 'CLM20250426000001',
    flowNo: 'ABC202504260010',
    orderType: '销售订单',
    orderNo: 'SOD-20250426-0006',
    customerName: '尚品宅配(代理)',
    customerType: '代理商',
    salesman: '张三',
    amount: 5000,
    claimAmount: 5000,
    orderAmount: 5000,
    receivedAmount: 0,
    claimant: '张三',
    claimUser: '张三',
    claimTime: '2025-04-26 10:15:00',
    status: '审批通过',
    remark: '全额收货款'
  }
];
