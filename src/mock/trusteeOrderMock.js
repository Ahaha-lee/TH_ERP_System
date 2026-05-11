
export const mockTrusteeOrders = [
  {
    id: 'tp-001',
    orderNo: 'TP-20250428-0001',
    quotationNo: 'BJ20250420005',
    customerName: '欧派橱柜',
    orderDate: '2025-04-28',
    expectDeliveryDate: '2025-05-10',
    totalAmount: 12500.00,
    processingProgress: 30,
    deliveryProgressText: '未发货',
    salesperson: '管理员',
    auditResult: '审核通过',
    receiptStatus: '待收来料',
    status: '生产中',
    paymentStatus: '未收款',
    productionRemark: '急件，请优先安排封边工序。',
    customerRemark: '包装需防震处理，收货地址见备注。',
    items: [
      { id: 'tpi-1', productCode: 'PROD005', productName: '橱柜门板', spec: '高光白', quantity: 100, unitPrice: 125, amount: 12500 }
    ],
    materials: [
      { id: 'tpm-1', materialCode: 'MAT001', materialName: '密度板', spec: '18mm', quantity: 50 }
    ]
  },
  {
    id: 'tp-002',
    orderNo: 'TP-20250425-0001',
    customerName: '索菲亚家居',
    orderDate: '2025-04-25',
    expectDeliveryDate: '2025-05-05',
    totalAmount: 8000.00,
    processingProgress: 100,
    deliveryProgressText: '已全部发货',
    salesperson: '张经理',
    auditResult: '审核通过',
    receiptStatus: '已收来料',
    status: '完成',
    paymentStatus: '已结清',
    items: [
      { id: 'tpi-2', productCode: 'PROD006', productName: '衣柜侧板', spec: '原木色', quantity: 80, unitPrice: 100, amount: 8000 }
    ],
    materials: [
      { id: 'tpm-2', materialCode: 'MAT002', materialName: '颗粒板', spec: '15mm', quantity: 40 }
    ]
  },
  {
    id: 'tp-003',
    orderNo: 'TP-20250501-0001',
    customerName: '全友家居',
    orderDate: '2025-05-01',
    expectDeliveryDate: '2025-05-15',
    totalAmount: 5000.00,
    processingProgress: 0,
    deliveryProgressText: '未发货',
    salesperson: '管理员',
    auditResult: '-',
    receiptStatus: '待收来料',
    status: '草稿',
    paymentStatus: '未收款',
    items: [{ id: 'tpi-3', productCode: 'P001', productName: '支撑杆', spec: '定制', quantity: 100, unitPrice: 50, amount: 5000 }]
  },
  {
    id: 'tp-004',
    orderNo: 'TP-20250502-0002',
    customerName: '顾家家居',
    orderDate: '2025-05-02',
    expectDeliveryDate: '2025-05-20',
    totalAmount: 18000.00,
    processingProgress: 100,
    deliveryProgressText: '待发货',
    salesperson: '张经理',
    auditResult: '审核通过',
    receiptStatus: '已收来料',
    status: '已完工',
    paymentStatus: '未收款',
    items: [{ id: 'tpi-4', productCode: 'P004', productName: '真皮扶手', spec: '黑色', quantity: 40, unitPrice: 450, amount: 18000 }]
  },
  {
    id: 'tp-005',
    orderNo: 'TP-20250503-0003',
    customerName: '曲美家居',
    orderDate: '2025-05-03',
    expectDeliveryDate: '2025-05-25',
    totalAmount: 22000.00,
    processingProgress: 100,
    deliveryProgressText: '运输中',
    salesperson: '李经理',
    auditResult: '审核通过',
    receiptStatus: '已收来料',
    status: '确认发运',
    paymentStatus: '部分付款',
    items: [{ id: 'tpi-5', productCode: 'P005', productName: '实木腿', spec: '榉木', quantity: 200, unitPrice: 110, amount: 22000 }]
  }
];
