
export const initialEstimations = [
  {
    id: 'est_001',
    orderNo: 'YJ202504230001',
    customerId: 'cus1',
    customerName: '美家家居',
    productId: 'p1',
    productName: '皮沙发',
    customSize: { length: 2000, width: 850, height: 950 },
    basePrice: 2500,
    sizeAddon: 350, // 200 (length) + 150 (width) + 0 (height)
    coefficient: 1.2,
    totalAmount: 3420, // (2500 + 350) * 1.2
    estimationDate: '2025-04-23',
    expectedDeliveryDate: '2025-05-10',
    salesman: '张三',
    status: '草稿',
    remark: '客户要求加宽，高度略增'
  },
  {
    id: 'est_002',
    orderNo: 'YJ202504240001',
    customerId: 'cus2',
    customerName: '宜居美学',
    productId: 'p2',
    productName: '实木餐桌',
    customSize: { length: 1450, width: 600, height: 750 },
    basePrice: 3200,
    sizeAddon: 200, // 200 (length) + 0 (width) + 0 (height)
    coefficient: 1.1,
    totalAmount: 3740, // (3200 + 200) * 1.1
    estimationDate: '2025-04-24',
    expectedDeliveryDate: '2025-05-15',
    salesman: '李四',
    status: '已转报价单',
    relQuoteNo: 'BJ20250425001'
  },
  {
    id: 'est_003',
    orderNo: 'YJ202504250001',
    customerId: 'cus3',
    customerName: '锦绣服饰旗舰店',
    productId: 'p1',
    productName: '皮沙发',
    customSize: { length: 1800, width: 600, height: 2400 },
    basePrice: 2500,
    sizeAddon: 0,
    coefficient: 1.2,
    totalAmount: 3000,
    estimationDate: '2025-04-25',
    expectedDeliveryDate: '2025-05-20',
    salesman: '王五',
    status: '草稿'
  }
];
