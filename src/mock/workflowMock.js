/**
 * Workflow & Audit Mock Data
 */
export const auditRecords = [
  { id: 'ar1', orderNo: 'SOD-20250423-0001', time: '2025-04-23 10:00:00', operator: '管理员', action: '提交', opinion: '-' },
  { id: 'ar2', orderNo: 'SOD-20250423-0001', time: '2025-04-23 14:00:00', operator: '销售总监', action: '通过', opinion: '客户资质优良，同意' },
  { id: 'ar3', orderNo: 'SOD-20250424-0002', time: '2025-04-24 09:30:00', operator: '管理员', action: '提交', opinion: '-' },
  { id: 'ar4', orderNo: 'SOD-20250424-0002', time: '2025-04-24 11:00:00', operator: '财务经理', action: '拒绝', opinion: '预付款比例不足' },
  { id: 'ar5', orderNo: 'RET-20250425-0001', time: '2025-04-25 15:00:00', operator: '张三', action: '提交', opinion: '-' },
  { id: 'ar6', orderNo: 'RET-20250425-0001', time: '2025-04-25 16:30:00', operator: '仓库主管', action: '通过', opinion: '确认已收货并检查无误' }
];
