/**
 * Stocktaking Task Mock Data
 * Status: 草稿, 盘点中, 已盘点, 已完成
 * Range: 全部物料, 按物料分类, 按货位, 按物料
 */
export const stocktakingTasks = [
  {
    id: 'st-001',
    taskNo: 'ST20250428001',
    warehouseName: '主成品仓库',
    rangeType: '全部物料',
    rangeDesc: '全部物料',
    planStartDate: '2025-04-28',
    planEndDate: '2025-04-30',
    creator: '管理员',
    createDate: '2025-04-28',
    status: '盘点中',
    remark: '月度常规盘点',
    baseTime: '2025-04-28 08:30:00',
    baseSnapshot: [
      { productCode: 'PROD001', productName: '皮沙发', spec: '真皮/棕色', unit: '套', bookQty: 100, location: 'A-01-01' },
      { productCode: 'PROD002', productName: '实木餐桌', spec: '1.8m/黑胡桃', unit: '张', bookQty: 50, location: 'A-01-02' }
    ]
  },
  {
    id: 'st-002',
    taskNo: 'ST20250429002',
    warehouseName: '原材料仓库',
    rangeType: '按物料分类',
    rangeDesc: '按物料分类: 板材类',
    planStartDate: '2025-04-30',
    planEndDate: '2025-05-02',
    creator: '李瑞',
    createDate: '2025-04-29',
    status: '草稿',
    remark: '板材专项盘点'
  },
  {
    id: 'st-003',
    taskNo: 'ST20250425001',
    warehouseName: '主成品仓库',
    rangeType: '按货位',
    rangeDesc: '按货位: A-01-01, A-01-02',
    planStartDate: '2025-04-25',
    planEndDate: '2025-04-26',
    creator: '管理员',
    createDate: '2025-04-25',
    status: '已完成',
    remark: '发货前核对',
    finishDate: '2025-04-26',
    baseSnapshot: [],
    diffResult: [],
    adjustments: [
      { adjNo: 'ADJ-20250426-001', productCode: 'PROD001', adjQty: 2, adjAmount: 2400, reason: '损耗' }
    ]
  },
  {
    id: 'st-004',
    taskNo: 'ST20250427001',
    warehouseName: '原材料仓库',
    rangeType: '按物料',
    rangeDesc: '按物料: 红橡木板材等3项',
    planStartDate: '2025-04-27',
    planEndDate: '2025-04-28',
    creator: '管理员',
    createDate: '2025-04-27',
    status: '已盘点',
    remark: '差异待确认',
    diffResult: [
      { productCode: 'MAT001', productName: '红橡木板材', bookQty: 10, actualQty: 9, diffQty: -1, diffAmount: -3500, location: 'RAW-01' }
    ]
  }
];
