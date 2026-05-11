/**
 * General Application Order Mock Data (Purchase/Expense)
 */
export const applyOrders = [
  {
    id: 'AO1',
    orderNo: 'AO-20250428-001',
    type: '请购',
    applicant: '张三',
    deptName: '研发部',
    createDate: '2025-04-28',
    status: '已处理',
    summary: '研发样品申请: 铝型材 x10',
    items: [
      { productCode: 'MAT003', productName: '铝型材', spec: 'T5', unit: '米', applyQty: 10 }
    ]
  },
  {
    id: 'AO2',
    orderNo: 'AO-20250429-002',
    type: '费用申请',
    applicant: '李四',
    deptName: '行政部',
    createDate: '2025-04-29',
    status: '已审批',
    summary: '办公耗材出库',
    items: [
      { productCode: 'OFF001', productName: 'A4打印纸', spec: '80g', unit: '箱', applyQty: 5 }
    ]
  }
];
