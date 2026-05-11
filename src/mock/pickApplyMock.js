/**
 * Pick Application Mock Data
 * Status: 待审核, 已审核
 */
export const pickApplys = [
  {
    id: 'PA1',
    orderNo: 'PA-20250428-001',
    workOrderNo: 'WO-20250427-001',
    applicant: '生产一车间',
    deptName: '制造一部',
    createDate: '2025-04-28',
    status: '已审核',
    items: [
      { productCode: 'MAT001', productName: '红橡木板材', spec: '20mm', unit: 'm³', applyQty: 10, sourceWO: 'WO-20250427-001' },
      { productCode: 'MAT002', productName: '夹板', spec: '15mm', unit: '张', applyQty: 5, sourceWO: 'WO-20250427-001' }
    ]
  },
  {
    id: 'PA2',
    orderNo: 'PA-20250429-002',
    workOrderNo: 'WO-20250429-002',
    applicant: '生产二车间',
    deptName: '制造二部',
    createDate: '2025-04-29',
    status: '已审核',
    items: [
      { productCode: 'ACC001', productName: '不锈钢铰链', spec: '304', unit: '对', applyQty: 200, sourceWO: 'WO-20250429-002' }
    ]
  }
];
