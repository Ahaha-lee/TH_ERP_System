
/**
 * Work Order Mock Data for Inbound Selection
 */
export const mockWorkOrders = [
  {
    orderNo: 'WO20250427001',
    productCode: 'PROD001',
    productName: '皮沙发',
    spec: '真皮/咖啡色',
    unit: '个',
    planQty: 20,
    receivedQty: 5,
    remainQty: 15,
    finishDate: '2025-05-10',
    status: '生产中'
  },
  {
    orderNo: 'WO20250427002',
    productCode: 'PROD002',
    productName: '实木餐桌',
    spec: '1.6m圆形',
    unit: '张',
    planQty: 10,
    receivedQty: 0,
    remainQty: 10,
    finishDate: '2025-05-05',
    status: '部分完工'
  }
];
