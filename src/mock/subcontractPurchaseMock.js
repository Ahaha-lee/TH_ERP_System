
/**
 * Subcontract Purchase Order Mock Data
 * BOM Materials are what needs to be sent to the supplier
 */
export const subcontractPurchases = [
  {
    id: 'SUB-PO-001',
    orderNo: 'SPO-20250422-003',
    supplierName: '顺德金工',
    purchaser: '管理员',
    orderDate: '2025-04-22',
    summary: '实木餐桌加工',
    productCode: 'PROD002',
    productName: '实木餐桌',
    quantity: 100,
    price: 120,
    status: '已下达',
    type: '委外',
    items: [
      { productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '件', quantity: 100, price: 120, receivedQty: 0 }
    ],
    bomMaterials: [
      { materialCode: 'MAT001', materialName: '红橡木板材', spec: '20mm', unit: 'm³', qtyPerUnit: 0.1, totalQty: 10 },
      { materialCode: 'ACC001', productName: '不锈钢铰链', spec: '304', unit: '对', qtyPerUnit: 4, totalQty: 400 }
    ]
  },
  {
    id: 'SUB-PO-002',
    orderNo: 'SPO-20250423-001',
    supplierName: '佛山五金',
    purchaser: '管理员',
    orderDate: '2025-04-23',
    summary: '金属支架加工',
    productCode: 'PROD003',
    productName: '金属支架',
    quantity: 200,
    price: 45,
    status: '已下达',
    type: '委外',
    items: [
      { productCode: 'PROD003', productName: '金属支架', spec: '通用规格', unit: '个', quantity: 200, price: 45, receivedQty: 0 }
    ],
    bomMaterials: [
      { materialCode: 'MAT003', materialName: '铝型材', spec: 'T5', unit: '米', qtyPerUnit: 2, totalQty: 400 }
    ]
  }
];
