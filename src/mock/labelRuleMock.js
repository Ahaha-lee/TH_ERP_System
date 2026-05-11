
export const mockLabelRules = [
  {
    id: '1',
    ruleNo: 'R001',
    ruleName: '成品标准标签',
    category: '成品',
    fields: ['materialCode', 'materialName', 'productionDate', 'workOrderNo'],
    status: '启用',
  },
  {
    id: '2',
    ruleNo: 'R002',
    ruleName: '半成品标签',
    category: '半成品',
    fields: ['materialCode', 'materialName', 'batchNo', 'supplierName'],
    status: '禁用',
  },
];
