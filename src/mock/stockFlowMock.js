
/**
 * Stock Flow (In/Out) Mock Data
 */
export const mockStockFlow = {
  'PROD001': [
    {
      id: 'f1',
      time: '2025-04-23 10:30:00',
      docType: '成品入库',
      docNo: 'PDR-202504230001',
      warehouse: '主成品仓库',
      location: 'A-01-01',
      batchNo: 'B202504001',
      changeType: '入库',
      changeQty: 100,
      balanceQty: 100,
      operator: '李仓库员'
    }
  ],
  'PROD002': [
    {
      id: 'f2',
      time: '2025-04-24 14:00:00',
      docType: '销售出库',
      docNo: 'SOD-20250423-0001',
      warehouse: '主成品仓库',
      location: 'A-01-02',
      batchNo: 'B202504001',
      changeType: '出库',
      changeQty: -2,
      balanceQty: 8,
      operator: '李仓库员'
    },
    {
      id: 'f3',
      time: '2025-04-25 09:00:00',
      docType: '其他出库',
      docNo: 'OT-202504250001',
      warehouse: '主成品仓库',
      location: 'A-01-02',
      batchNo: 'B202504001',
      changeType: '出库',
      changeQty: -3,
      balanceQty: 5,
      operator: '管理员'
    }
  ],
  'MAT001': [
    {
      id: 'f4',
      time: '2025-04-23 09:00:00',
      docType: '采购入库',
      docNo: 'PI-202504230001',
      warehouse: '原材料仓库',
      location: 'R-01-01',
      batchNo: 'B202504001',
      changeType: '入库',
      changeQty: 50,
      balanceQty: 50,
      operator: '李仓库员'
    }
  ]
};
