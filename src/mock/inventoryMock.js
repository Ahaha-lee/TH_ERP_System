import { products, warehouses } from './masterData';

/**
 * Inventory Mock Data
 * Snapshot, Movements, Results, Adjustments
 */
export const inventorySnapshots = [
  {
    taskId: 'PD-20250426-0001',
    taskNo: 'PD-20250426-0001',
    snapshotTime: '2025-04-26 09:00:00',
    items: [
      { bin: 'A-01-01', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', batchNo: '20250101PD001', stockQty: 100 },
      { bin: 'R-01-01', productCode: 'MAT001', productName: '红橡木板材', spec: '2000*200*20', unit: 'm³', batchNo: '20250420-01', stockQty: 50 }
    ]
  }
];

export const periodMovements = [
  {
    id: 'mv1',
    taskId: 'PD-20250423-0001',
    time: '2025-04-23 10:30:00',
    type: '出库',
    productCode: 'PROD001',
    productName: '皮沙发',
    batchNo: '20250101PD001',
    bin: 'A-01-01',
    qty: 5,
    relOrderNo: 'SO-202504230001',
    relOrderType: '销售出库'
  },
  {
    id: 'mv2',
    taskId: 'PD-20250423-0001',
    time: '2025-04-23 14:15:00',
    type: '入库',
    productCode: 'MAT001',
    productName: '红橡木板材',
    batchNo: '20250420-01',
    bin: 'R-01-01',
    qty: 10,
    relOrderNo: 'PI-202504230002',
    relOrderType: '采购入库'
  }
];

export const stocktakingResults = [
  {
    id: 'res1',
    taskId: 'PD-20250424-0002',
    bin: 'A-01-01',
    productCode: 'PROD001',
    productName: '皮沙发',
    batchNo: '20250101PD001',
    baseQty: 100,
    periodIn: 0,
    periodOut: 5,
    theoryQty: 95,
    actualQty: 90,
    diffQty: -5,
    diffAmount: -1500,
    diffReason: '仓库搬运破损'
  }
];

export const adjustments = [
  {
    id: 'adj1',
    orderNo: 'ADJ-20250425-1001',
    type: '盘点调整',
    productCode: 'PROD001',
    productName: '皮沙发',
    qty: -5,
    amount: -1500,
    reason: '仓库搬运破损',
    effectiveTime: '2025-04-25 16:00:00'
  }
];
