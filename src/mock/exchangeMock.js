export const mockExchanges = [
  {
    id: 'exc-001',
    exchangeNo: 'EXC-20250428-001',
    orderNo: 'SOD-202504250001',
    customerId: 'c3',
    customerName: '空间美学工程部',
    customerType: '设计师',
    orderDate: '2025-04-28',
    salesperson: '王经理',
    status: '待发货',
    returnStatus: '待收货',
    reason: '客户要求更换颜色',
    items: [
      { id: 'exr-001', productName: '皮沙发', quantity: 2, action: '退回' },
      { id: 'exs-001', productName: '皮沙发(黑色)', quantity: 2, action: '换出' }
    ]
  },
  {
    id: 'exc-002',
    exchangeNo: 'EXC-20250420-001',
    orderNo: 'SOD-202504200001',
    customerName: '万达广场直营店',
    salesperson: '张销售',
    status: '草稿',
    returnStatus: '未开始',
    reason: '五金件损坏更换',
    items: []
  }
];
