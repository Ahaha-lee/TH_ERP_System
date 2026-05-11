
export const mockQuotations = [
  {
    id: '1',
    quotationNo: 'BJ202504280001',
    customerId: 'c1',
    customerName: '雅居家具城',
    quotationDate: '2025-04-28',
    salesperson: '张销售',
    totalAmount: 18000.00,
    status: '草稿',
    title: '5月促销季备货报价',
    remark: '试用阶段优惠',
    items: [
      {
        id: 'i1',
        productCode: 'PROD001',
        productName: '皮沙发',
        spec: '真皮/棕色',
        quantity: 10,
        unitPrice: 2000,
        finalPrice: 1800,
        amount: 18000,
        remark: ''
      }
    ],
    otherFee: 0,
    date: '2025-04-28' // Added for compatibility
  },
  {
    id: '2',
    quotationNo: 'BJ202504270001',
    customerId: 'c2',
    customerName: '悦生活体验馆',
    quotationDate: '2025-04-27',
    salesperson: '李业务',
    totalAmount: 8500.00,
    status: '待审批',
    title: '新款餐桌意向报价',
    items: [
      {
        id: 'i2',
        productCode: 'PROD002',
        productName: '实木餐桌',
        spec: '1.8m/黑胡桃',
        quantity: 5,
        unitPrice: 1700,
        finalPrice: 1700,
        amount: 8500,
        remark: ''
      }
    ],
    otherFee: 0,
    date: '2025-04-27'
  },
  {
    id: '3',
    quotationNo: 'BJ202504260001',
    customerId: 'c3',
    customerName: '空间美学工程部',
    quotationDate: '2025-04-26',
    salesperson: '王经理',
    totalAmount: 43200.00,
    status: '已转订单',
    title: '别墅软装工程报价',
    items: [],
    otherFee: 0,
    date: '2025-04-26'
  },
  {
    id: '4',
    quotationNo: 'BJ202504250001',
    customerId: 'c5',
    customerName: '万达广场直营店',
    quotationDate: '2025-04-25',
    salesperson: '张销售',
    totalAmount: 12000.00,
    status: '审批拒绝',
    title: '开业补货单',
    items: [],
    otherFee: 0,
    date: '2025-04-25'
  }
];

export const quotations = mockQuotations;

export const quotationAuditLogs = [
  { id: 'qal1', quotationNo: 'BJ202504230001', time: '2025-04-23 10:00:00', operator: '管理员', action: '提交', opinion: '-' },
  { id: 'qal2', quotationNo: 'BJ202504230001', time: '2025-04-23 14:00:00', operator: '主管部长', action: '通过', opinion: '价格合理，通过' }
];

export const mockAuditRecords = {
  '3': [
    { time: '2025-04-26 10:00:00', operator: '管理员', action: '提交审批', opinion: '客户优质，申请底价执行' },
    { time: '2025-04-26 14:30:00', operator: '部门经理', action: '审批通过', opinion: '同意' }
  ],
  '5': [
    { time: '2025-04-24 09:00:00', operator: '李业务', action: '提交审批', opinion: '客户压价厉害' },
    { time: '2025-04-24 11:20:00', operator: '王管理', action: '审批拒绝', opinion: '底价不符，请重新核算' }
  ]
};
