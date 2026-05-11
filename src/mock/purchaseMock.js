
/**
 * Purchase Order Mock Data for Inbound Selection
 */
export const mockPurchaseOrders = [
  {
    orderNo: 'PO-20250420-001',
    supplierName: '广东华美木业有限公司',
    purchaser: '管理员',
    orderDate: '2025-04-20',
    summary: '红橡木板材等',
    totalQty: 100,
    receivedQty: 20,
    remainQty: 80,
    status: '已下达',
    items: [
      { productCode: 'MAT001', productName: '红橡木板材', spec: '2000*200*20', unit: 'm³', price: 4200.00, quantity: 50, receivedQty: 10 },
      { productCode: 'MAT002', productName: '夹板', spec: '18mm', unit: '张', price: 85.50, quantity: 50, receivedQty: 10 },
      { productCode: 'MAT003', productName: '松木拼板', spec: '1220*2440*18', unit: '张', price: 165.00, quantity: 50, receivedQty: 0 }
    ]
  },
  {
    orderNo: 'PO-20250421-002',
    supplierName: '浙江固特五金制造厂',
    purchaser: '管理员',
    orderDate: '2025-04-21',
    summary: '五金配件批量采购',
    totalQty: 2500,
    receivedQty: 0,
    remainQty: 2500,
    status: '已下达',
    items: [
      { productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', unit: '对', price: 12.80, quantity: 2000, receivedQty: 0 },
      { productCode: 'ACC002', productName: '三节静音导轨', spec: '16寸/400mm', unit: '副', price: 25.00, quantity: 500, receivedQty: 0 }
    ]
  },
  {
    orderNo: 'PO-20250425-003',
    supplierName: '佛山名家皮革辅料公司',
    purchaser: '李经理',
    orderDate: '2025-04-25',
    summary: '头层牛皮/加厚海绵',
    totalQty: 800,
    receivedQty: 0,
    remainQty: 800,
    status: '已下达',
    items: [
      { productCode: 'FAB001', productName: '头层牛皮', spec: '咖啡色/优质', unit: '张', price: 1200.00, quantity: 100, receivedQty: 0 },
      { productCode: 'FOA001', productName: '高回弹海绵', spec: '45D/加厚', unit: '张', price: 45.00, quantity: 700, receivedQty: 0 }
    ]
  }
];
