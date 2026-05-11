
import dayjs from 'dayjs';

export const mockNormalOrders = [
  {
    id: 'so-001',
    orderNo: 'SOD-20250428-0001',
    quotationNo: 'BJ20250420003',
    customerId: 'cus1',
    customerName: '美家家居',
    customerType: '经销商',
    settlementMethod: '月结',
    orderDate: '2025-04-28',
    expectDeliveryDate: '2025-05-15',
    totalAmount: 25000.00,
    paidAmount: 5000.00,
    salesperson: '管理员',
    status: '草稿',
    paymentStatus: '未收款',
    includeInStockingPlan: false,
    productionProgress: 0,
    deliveryProgressText: '未发货',
    items: [
      { id: 'soi-1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', property: '材质:头层牛皮', quantity: 10, unitPrice: 2500, amount: 25000 }
    ],
    giftItems: []
  },
  {
    id: 'so-002',
    orderNo: 'SOD-20250427-0001',
    customerId: 'cus4',
    customerName: '宏发商贸',
    customerType: '分销商',
    settlementMethod: '预存',
    orderDate: '2025-04-27',
    expectDeliveryDate: '2025-05-10',
    totalAmount: 16000.00,
    paidAmount: 16000.00,
    salesperson: '张经理',
    status: '已完工',
    paymentStatus: '已结清',
    includeInStockingPlan: true,
    productionProgress: 100,
    deliveryProgressText: '未发货',
    items: [
      { id: 'soi-2', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', property: '材质:胡桃木', quantity: 5, unitPrice: 3200, amount: 16000 }
    ],
    giftItems: []
  },
  {
    id: 'so-003',
    orderNo: 'SOD-20250426-0001',
    customerId: 'cus3',
    customerName: '锦绣服饰旗舰店',
    customerType: '零售',
    settlementMethod: '现结',
    orderDate: '2025-04-26',
    expectDeliveryDate: '2025-05-05',
    totalAmount: 18000.00,
    paidAmount: 0.00,
    salesperson: '管理员',
    status: '待审核',
    auditResult: '审核拒绝',
    includeInStockingPlan: false,
    paymentStatus: '未收款',
    productionProgress: 0,
    deliveryProgressText: '未发货',
    items: [
      { id: 'soi-3', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', quantity: 10, unitPrice: 1800, amount: 18000 }
    ],
    giftItems: []
  },
  {
    id: 'so-004',
    orderNo: 'SOD-20250425-0001',
    customerId: 'cus6',
    customerName: '瑞龙实业',
    customerType: '企业客户',
    settlementMethod: '月结',
    orderDate: '2025-04-25',
    expectDeliveryDate: '2025-05-20',
    totalAmount: 32000.00,
    paidAmount: 32000.00,
    salesperson: '管理员',
    status: '发货中',
    paymentStatus: '已结清',
    includeInStockingPlan: true,
    productionProgress: 100,
    deliveryProgressText: '实木餐桌已发3/5, 极简书架已发10/10',
    deliveryNotices: 'DN-20250428-001',
    items: [
      { id: 'soi-4-1', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', property: '材质:实木', quantity: 5, unitPrice: 3200, amount: 16000 },
      { id: 'soi-4-2', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', property: '颜色:胡桃色', quantity: 10, unitPrice: 1600, amount: 16000 }
    ],
    giftItems: []
  },
  {
    id: 'so-005',
    orderNo: 'SOD-20250420-0001',
    customerId: 'cus1',
    customerName: '美家家居',
    customerType: '经销商',
    settlementMethod: '月结',
    orderDate: '2025-04-20',
    expectDeliveryDate: '2025-05-01',
    totalAmount: 120000.00,
    paidAmount: 120000.00,
    salesperson: '张经理',
    status: '完成',
    paymentStatus: '已结清',
    includeInStockingPlan: false,
    productionProgress: 100,
    deliveryProgressText: '已全部发货',
    deliveryNotices: 'DN-20250425-001,DN-20250426-002',
    claimRecords: 'LS202504280001,LS202504280002',
    items: [
      { id: 'soi-5', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', property: '材质:真皮', quantity: 50, unitPrice: 2400, amount: 120000 }
    ],
    giftItems: [
      { id: 'soi-5-g', productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', quantity: 200, remark: '赠送' }
    ]
  }
];
