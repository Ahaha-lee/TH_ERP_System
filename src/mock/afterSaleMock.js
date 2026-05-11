
/**
 * After Sale Order Mock Data for Inbound Selection
 */
export const mockAfterSaleOrders = [
  {
    orderNo: 'AS20250427001',
    relSalesOrderNo: 'SOD-20250423-0001',
    customerName: '美家家居',
    type: '退货入库',
    summary: '实木餐桌退货 1 张',
    createDate: '2025-04-27',
    status: '已审核',
    items: [
      { productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', quantity: 1, price: 3200 }
    ]
  },
  {
    orderNo: 'AS20250427002',
    relSalesOrderNo: 'SOD-20250423-0002',
    customerName: '宜居美学',
    type: '维修退货',
    summary: '皮沙发维修退货 2 个',
    createDate: '2025-04-27',
    status: '已审核',
    items: [
      { productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', quantity: 2, price: 2500 }
    ]
  }
];
