
export const mockConsignmentOrders = [
  {
    id: 'con-001',
    orderNo: 'CON-20250428-001',
    quotationNo: 'BJ-CON-20250420-001',
    customerId: 'c4',
    customerName: '宏达家具厂',
    customerType: '工厂合作',
    settlementMethod: '月结',
    orderDate: '2025-04-28',
    expectDeliveryDate: '2025-05-15',
    totalAmount: 12000.00,
    paidAmount: 3000.00,
    salesperson: '李业务',
    status: '生产中',
    materialStatus: '已收来料',
    productionProgress: 60,
    deliveryProgress: '未发货',
    createDate: '2025-04-28',
    summary: '实木板材加工切片',
    items: [
      {
        id: 'coni-001',
        processName: '切片加工',
        processSpec: '厚度2mm',
        quantity: 1000,
        unit: '张',
        unitPrice: 12,
        amount: 12000
      }
    ],
    materials: [
      {
        id: 'mat-001',
        materialCode: 'RAW-001',
        materialName: '实木板材',
        spec: '2000*1000*20',
        unit: '张',
        quantity: 100,
        remark: '客户自带'
      }
    ],
    remark: '客户急需，优先排产'
  },
  {
    id: 'con-002',
    orderNo: 'CON-20250425-001',
    customerId: 'c1',
    customerName: '雅居家具城',
    customerType: '经销商',
    orderDate: '2025-04-25',
    expectDeliveryDate: '2025-05-05',
    totalAmount: 5000.00,
    paidAmount: 0,
    salesperson: '张销售',
    status: '已审批',
    materialStatus: '待收来料',
    productionProgress: 0,
    deliveryProgress: '未发货',
    createDate: '2025-04-25',
    summary: '桌腿代工',
    items: [
      { id: 'coni-002', processName: '打磨', processSpec: '精细', quantity: 50, unit: '件', unitPrice: 10, amount: 500 }
    ],
    materials: []
  },
  {
    id: 'con-003',
    orderNo: 'CON-20250420-001',
    customerName: '创意工作室',
    orderDate: '2025-04-20',
    expectDeliveryDate: '2025-04-30',
    totalAmount: 8000.00,
    paidAmount: 8000.00,
    salesperson: '王经理',
    status: '已完成',
    materialStatus: '已收来料',
    productionProgress: 100,
    deliveryProgress: '已发货',
    createDate: '2025-04-20',
    summary: '面板雕刻',
    items: [
      { id: 'coni-003', processName: '雕刻', processSpec: '定制花纹', quantity: 40, unit: '件', unitPrice: 200, amount: 8000 }
    ]
  }
];

export const consignmentOrders = mockConsignmentOrders;
