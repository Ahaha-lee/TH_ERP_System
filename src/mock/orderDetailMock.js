/**
 * Order Detail Related Mock Data
 * Including Production Orders, Outbound/Inbound records, Receipts
 */

export const productionOrders = [
  {
    id: 'wo1',
    orderNo: 'WO-202504230001',
    relOrderNo: 'SOD-20250423-0001',
    processName: '切割封边',
    completedQty: 50,
    totalQty: 100,
    status: '生产中',
    progress: 50
  },
  {
    id: 'wo2',
    orderNo: 'WO-202504230002',
    relOrderNo: 'SOD-20250423-0001',
    processName: '钻孔打桩',
    completedQty: 0,
    totalQty: 100,
    status: '待开始',
    progress: 0
  },
  {
    id: 'wo3',
    orderNo: 'WO-202504200001',
    relOrderNo: 'SOD-20250420-0005',
    processName: '包装入库',
    completedQty: 50,
    totalQty: 50,
    status: '已完工',
    progress: 100
  },
  {
    id: 'wo4',
    orderNo: 'WO-CON-001',
    relOrderNo: 'CID-20250424-0002',
    processName: '手工编织',
    completedQty: 10,
    totalQty: 50,
    status: '生产中',
    progress: 20
  }
];

export const outboundRecords = [
  {
    id: 'ob1',
    outboundNo: 'OUT-20250424001',
    relOrderNo: 'SOD-20250420-0005',
    noticeNo: 'FH202504220001',
    outboundDate: '2025-04-24',
    productName: '布艺沙发',
    quantity: 2,
    warehouse: '成品一仓库',
    status: '已出库',
    salesman: '王五'
  }
];

export const inboundRecords = [
  {
    id: 'ib1',
    inboundNo: 'IN-20250423001',
    relOrderNo: 'CID-20250423-0001',
    inboundDate: '2025-04-23',
    materialName: '原木板材',
    quantity: 50,
    warehouse: '原材料仓',
    status: '已完成',
    salesman: '王五'
  },
  {
    id: 'ib2',
    inboundNo: 'IN-AS-20250424001',
    relOrderNo: 'RET-20250423-0001',
    inboundDate: '2025-04-24',
    materialName: '皮沙发',
    quantity: 2,
    warehouse: '售后退货仓',
    status: '已收货',
    salesman: '张三'
  }
];

export const paymentRecords = [
  {
    id: 'pay1',
    serialNo: 'PAY202504230001',
    relOrderNo: 'SOD-20250423-0001',
    payTime: '2025-04-23 14:30:00',
    amount: 3000,
    partyName: '美家家居',
    claimRatio: 100,
    claimAmount: 3000,
    claimant: '张三',
    claimTime: '2025-04-23 15:00:00',
    status: '已审批'
  },
  {
    id: 'pay2',
    serialNo: 'PAY202504200005',
    relOrderNo: 'SOD-20250420-0005',
    payTime: '2025-04-20 10:00:00',
    amount: 22000,
    partyName: '创意空间',
    claimRatio: 100,
    claimAmount: 22000,
    claimant: '管理员',
    claimTime: '2025-04-20 10:30:00',
    status: '已审批'
  }
];
