export const mockReplenishments = [
  {
    id: 'rep-001',
    replenishNo: 'REP-20250428-001',
    orderNo: 'SOD-202504200001',
    customerName: '万达广场直营店',
    orderDate: '2025-04-28',
    status: '待发货',
    salesperson: '张销售',
    reason: '质量补发',
    items: [
      { id: 'repi-001', productCode: 'PROD002', productName: '实木餐桌', quantity: 1, remark: '桌面划痕补寄' }
    ]
  },
  {
    id: 'rep-002',
    replenishNo: 'REP-20250425-001',
    orderNo: 'SOD-202504250001',
    customerName: '空间美学工程部',
    status: '草稿',
    salesperson: '李业务',
    items: []
  }
];
