import { customers, products, employees } from './masterData';

/**
 * Sales Order Mock Data
 */
export const normalOrders = [
  {
    id: '1',
    orderNo: 'SOD-20250423-0001',
    sourceQuoteNo: 'BJ202504230001',
    customerId: 'cus1',
    customerName: '美家家居',
    customerType: '经销商',
    settlementMethod: '月结',
    orderDate: '2025-04-23',
    expectedDate: '2025-05-01',
    totalAmount: 10000,
    receivedAmount: 3000,
    salesman: '张经理',
    status: '已排产',
    approvalResult: '审核通过',
    collectionStatus: '部分收款',
    productionProgress: 20,
    deliveryStatus: '已发货',
    items: [
      { id: '1-1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', quantity: 2, unitPrice: 2500, amount: 5000, remark: '加急' },
      { id: '1-2', productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', quantity: 1, unitPrice: 5000, amount: 5000, remark: '' }
    ],
    gifts: [],
    date: '2025-04-23', // Added for compatibility
    amount: 10000
  },
  {
    id: '2',
    orderNo: 'SOD-20250424-0002',
    sourceQuoteNo: '',
    customerId: 'cus002',
    customerName: '雅居饰界',
    customerType: '分销商',
    settlementMethod: '预存',
    orderDate: '2025-04-24',
    expectedDate: '2025-05-10',
    totalAmount: 8500,
    receivedAmount: 8500,
    salesman: '李四',
    status: '备货中',
    approvalResult: '审核通过',
    collectionStatus: '已结清',
    productionProgress: 100,
    deliveryStatus: '未发货',
    items: [
      { id: '2-1', productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', quantity: 5, unitPrice: 1700, amount: 8500, remark: '' }
    ],
    gifts: [
      { id: '2-g1', productCode: 'GIFT001', productName: '定制抱枕', spec: '真丝', quantity: 2, remark: '赠品' }
    ],
    date: '2025-04-24',
    amount: 8500
  },
  {
    id: '3',
    orderNo: 'SOD-20250425-0003',
    sourceQuoteNo: 'BJ202504240005',
    customerId: 'cus003',
    customerName: '宜居美学',
    customerType: '合伙人',
    settlementMethod: '现金',
    orderDate: '2025-04-25',
    expectedDate: '2025-05-05',
    totalAmount: 15600,
    receivedAmount: 0,
    salesman: '王五',
    status: '草稿',
    approvalResult: '-',
    collectionStatus: '未收款',
    productionProgress: 0,
    deliveryStatus: '未发货',
    items: [
      { id: '3-1', productCode: 'PROD004', productName: '双人床', spec: '布艺/1.8m', quantity: 2, unitPrice: 7800, amount: 15600, remark: '' }
    ],
    date: '2025-04-25',
    amount: 15600
  },
  {
    id: '4',
    orderNo: 'SOD-20250422-0004',
    sourceQuoteNo: '',
    customerId: 'cus001',
    customerName: '美家家居',
    customerType: '独立店',
    settlementMethod: '月结',
    orderDate: '2025-04-22',
    expectedDate: '2025-04-30',
    totalAmount: 4500,
    receivedAmount: 0,
    salesman: '张三',
    status: '生产中',
    approvalResult: '审核通过',
    collectionStatus: '未收款',
    productionProgress: 45,
    deliveryStatus: '未发货',
    items: [],
    date: '2025-04-22',
    amount: 4500
  },
  {
    id: '5',
    orderNo: 'SOD-20250420-0005',
    sourceQuoteNo: '',
    customerId: 'cus004',
    customerName: '创意空间',
    customerType: '直营店',
    settlementMethod: '现结',
    orderDate: '2025-04-20',
    expectedDate: '2025-04-25',
    totalAmount: 22000,
    receivedAmount: 22000,
    salesman: '管理员',
    status: '完成',
    approvalResult: '审核通过',
    collectionStatus: '已结清',
    productionProgress: 100,
    deliveryStatus: '全额发货',
    items: [],
    date: '2025-04-20',
    amount: 22000
  },
  {
    id: '6',
    orderNo: 'SOD-20250426-0006',
    sourceQuoteNo: 'BJ202504260001',
    customerId: 'cus006',
    customerName: '尚品宅配(代理)',
    customerType: '代理商',
    settlementMethod: '月结',
    orderDate: '2025-04-26',
    expectedDate: '2025-05-15',
    totalAmount: 5000,
    receivedAmount: 5000,
    salesman: '张三',
    status: '待审核',
    approvalResult: '待审核',
    collectionStatus: '已结清',
    productionProgress: 0,
    deliveryStatus: '未发货',
    items: [
      { id: '6-1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', quantity: 2, unitPrice: 2500, amount: 5000, remark: '' }
    ],
    date: '2025-04-26',
    amount: 5000
  },
  {
    id: '7',
    orderNo: 'SOD-20250426-0007',
    sourceQuoteNo: '',
    customerId: 'cus007',
    customerName: '全友家居服务中心',
    customerType: '特许经营',
    settlementMethod: '预存',
    orderDate: '2025-04-26',
    expectedDate: '2025-05-20',
    totalAmount: 12000,
    receivedAmount: 0,
    salesman: '李四',
    status: '待排产',
    approvalResult: '审核通过',
    collectionStatus: '未收款',
    productionProgress: 0,
    deliveryStatus: '未发货',
    items: [
      { id: '7-1', productCode: 'PROD006', productName: '转角沙发', spec: 'L型/灰色', quantity: 2, unitPrice: 4500, amount: 9000, remark: '' },
      { id: '7-2', productCode: 'PROD007', productName: '床头柜', spec: '实木简约', quantity: 5, unitPrice: 600, amount: 3000, remark: '' }
    ],
    date: '2025-04-26',
    amount: 12000
  }
];

export const salesOrders = normalOrders;

export const afterSaleOrders = [
  {
    id: 'as1',
    orderNo: 'RET-20250423-0001',
    relOrderNo: 'SOD-20250422-0004',
    customerName: '美家家居',
    customerType: '独立店',
    settlementMethod: '月结',
    orderDate: '2025-04-23',
    totalAmount: 5000,
    status: '已完成',
    type: '退货',
    afterSaleType: '退货',
    salesman: '张三',
    approvalResult: '审核通过',
    productInfo: '皮沙发/2',
    receiptProgress: '皮沙发已收2/应2',
    items: [
      { id: '1', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', unitPrice: 2500, orderQty: 2, deliveredQty: 2, returnedQty: 0, canReturnQty: 2, currentReturnQty: 2, amount: 5000, remark: '质量问题' }
    ]
  },
  {
    id: 'as2',
    orderNo: 'EXC-20250424-0001',
    relOrderNo: 'SOD-20250423-0001',
    customerName: '雅居饰界',
    orderDate: '2025-04-24',
    totalAmount: 15600,
    status: '待审批',
    type: '换货',
    afterSaleType: '换货',
    salesman: '李四',
    approvalResult: '-',
    productInfo: '极简书架/2',
    items: []
  },
  {
    id: 'as3',
    orderNo: 'REP-20250425-0001',
    relOrderNo: 'SOD-20250420-0005',
    customerName: '创意空间',
    orderDate: '2025-04-25',
    totalAmount: 1200,
    status: '草稿',
    type: '补货',
    afterSaleType: '补货',
    salesman: '管理员',
    approvalResult: '-',
    productInfo: '人体工学椅/1',
    items: []
  }
];

// consignmentOrders is exported from consignmentMock.js
const consignmentOrders = [
  {
    id: 'co1',
    orderNo: 'CID-20250423-0001',
    sourceQuoteNo: 'BJ20250420002',
    customerName: '宜居美学',
    customerType: '合伙人',
    settlementMethod: '现金',
    orderDate: '2025-04-23',
    expectedDate: '2025-05-05',
    totalAmount: 12000,
    receivedAmount: 0,
    salesman: '王五',
    status: '已审核',
    approvalResult: '审核通过',
    collectionStatus: '未收款',
    productionProgress: 0,
    deliveryStatus: '未发货',
    incomingMaterials: [
      { id: 'im1', materialCode: 'M001', materialName: '原木板材', spec: '2440*1220*18', unit: '张', quantity: 50, remark: '' }
    ],
    processingItems: [
      { id: 'pi1', productCode: 'P001', productName: '柜体侧板', processCode: 'OP01', processName: '切割封边', quantity: 100, unit: '块', spec: '600*400', unitPrice: 120, amount: 12000, remark: '' }
    ]
  },
  {
    id: 'co2',
    orderNo: 'CID-20250424-0002',
    customerName: '创意空间',
    customerType: '直营店',
    settlementMethod: '现结',
    orderDate: '2025-04-24',
    expectedDate: '2025-05-10',
    totalAmount: 8500,
    receivedAmount: 8500,
    salesman: '管理员',
    status: '来料已收',
    approvalResult: '审核通过',
    collectionStatus: '已结清',
    productionProgress: 20,
    deliveryStatus: '未发货',
    incomingMaterials: [
      { id: 'im2', materialCode: 'M002', materialName: '五金配件', spec: '通用', unit: '套', quantity: 100, remark: '' }
    ],
    processingItems: [
      { id: 'pi2', productCode: 'P002', productName: '成品拉篮', processCode: 'OP02', processName: '钻孔打桩', quantity: 50, unit: '套', spec: '标准', unitPrice: 170, amount: 8500, remark: '' }
    ]
  },
  {
    id: 'co3',
    orderNo: 'CID-20250420-0003',
    customerName: '美家家居',
    customerType: '独立店',
    settlementMethod: '月结',
    orderDate: '2025-04-20',
    expectedDate: '2025-04-25',
    totalAmount: 25000,
    receivedAmount: 15000,
    salesman: '张三',
    status: '完成',
    approvalResult: '审核通过',
    collectionStatus: '未收款',
    productionProgress: 100,
    deliveryStatus: '全额发货',
    incomingMaterials: [],
    processingItems: []
  }
];
