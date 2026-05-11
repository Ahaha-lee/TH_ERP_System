
import { customers as masterCustomers, customerCategories, priceVersions } from './masterData';

const customers = masterCustomers;
// No export here, use masterData instead

export const getDiscountRate = (customerType) => {
  const category = customerCategories.find(c => c.name === customerType);
  if (!category) return 0;

  const activeVersion = priceVersions.find(v => v.categoryId === category.id && v.status === '生效');
  return activeVersion ? activeVersion.discountRate / 100 : 0;
};

export const auditLogs = [
  { id: 'l1', customerId: 'cus1', time: '2025-04-23 10:00:00', operator: '管理员', type: '新增客户', content: '创建客户档案', status: '审批通过' },
];

export const salespersonHistory = [
  { id: 'sh1', customerId: 'cus1', name: '张经理', startDate: '2025-04-23', endDate: null, operator: '管理员', createdAt: '2025-04-23 10:00:00' }
];
