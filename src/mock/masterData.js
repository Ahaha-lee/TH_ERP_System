
/**
 * Master Core Data Registry
 * Centralizes basic entities to ensure consistency across modules
 */

export const employees = [
  { id: 'emp1', name: '管理员', status: '在职', role: 'admin' },
  { id: 'emp2', name: '张经理', status: '在职', role: 'sales' },
  { id: 'emp3', name: '李仓库员', status: '在职', role: 'warehouse' },
  { id: 'emp4', name: '财务王', status: '在职', role: 'finance' }
];

export const customerCategories = [
  { id: 'cat1', name: '独立店', enabled: true },
  { id: 'cat2', name: '分销商', enabled: true },
  { id: 'cat3', name: '合伙人', enabled: true },
  { id: 'cat4', name: '直营店', enabled: true },
  { id: 'cat5', name: '企业客户', enabled: true },
  { id: 'cat6', name: '经销商', enabled: true },
  { id: 'cat7', name: '零售', enabled: true }
];

export const priceVersions = [
  { id: 'pv1', categoryId: 'cat1', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
  { id: 'pv2', categoryId: 'cat2', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
  { id: 'pv3', categoryId: 'cat3', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
  { id: 'pv4', categoryId: 'cat4', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
  { id: 'pv5', categoryId: 'cat5', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
  { id: 'pv6', categoryId: 'cat6', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
  { id: 'pv7', categoryId: 'cat7', discountRate: 5.0, startDate: '2025-04-01', endDate: null, status: '生效', reason: '初始设置' },
];

export const customers = [
  { id: 'cus1', code: 'CUS001', name: '美家家居', type: '经销商', contact: '张总', phone: '13811112222', status: '启用', salesperson: '张经理', settlementMethod: '月结', approvalStatus: '审批通过' },
  { id: 'cus2', code: 'CUS002', name: '宜居美学', type: '零售', contact: '李女士', phone: '13933334444', status: '启用', salesperson: '张经理', settlementMethod: '现金', approvalStatus: '审批通过' },
  { id: 'cus3', code: 'CUS003', name: '锦绣服饰旗舰店', type: '零售', contact: '王经理', phone: '13755556666', status: '启用', salesperson: '管理员', settlementMethod: '现结', approvalStatus: '审批通过' },
  { id: 'cus4', code: 'CUS004', name: '宏发商贸', type: '分销商', contact: '赵红', phone: '13677778888', status: '启用', salesperson: '张经理', settlementMethod: '预存', prepaidBalance: 15000, approvalStatus: '审批通过' },
  { id: 'cus5', code: 'CUS005', name: '博雅装饰', type: '独立店', contact: '孙博', phone: '13599990000', status: '启用', salesperson: '李仓库员', settlementMethod: '月结', approvalStatus: '待审批', hasOverdue: true },
  { id: 'cus6', code: 'CUS006', name: '瑞龙实业', type: '企业客户', contact: '周龙', phone: '13422223333', status: '启用', salesperson: '管理员', settlementMethod: '月结', approvalStatus: '审批通过' },
  { id: 'cus7', code: 'CUS007', name: '优选超市连锁', type: '合伙人', contact: '吴优', phone: '13344445555', status: '启用', salesperson: '张经理', settlementMethod: '现结', approvalStatus: '审批通过' },
  { id: 'cus8', code: 'CUS008', name: '华联购物中心', type: '直营店', contact: '郑经理', phone: '13266667777', status: '禁用', salesperson: '张经理', settlementMethod: '预存', prepaidBalance: 500, approvalStatus: '审批中' },
  { id: 'cus9', code: 'CUS009', name: '名仕精品', type: '独立店', contact: '冯名', phone: '13188889999', status: '启用', salesperson: '管理员', settlementMethod: '月结', approvalStatus: '审批通过' },
  { id: 'cus10', code: 'CUS010', name: '金牌装修队', type: '分销商', contact: '陈金', phone: '13000001111', status: '启用', salesperson: '李仓库员', settlementMethod: '现金', approvalStatus: '审批通过' },
  { id: 'cus11', code: 'CUS011', name: '理想中心', type: '经销商', contact: '沈想', phone: '18911112222', status: '启用', salesperson: '张经理', settlementMethod: '预存', prepaidBalance: 20000, approvalStatus: '审批通过' },
  { id: 'cus12', code: 'CUS012', name: '安然居', type: '零售', contact: '韩安', phone: '18833334444', status: '启用', salesperson: '张经理', settlementMethod: '现金', approvalStatus: '审批通过' }
];

export const suppliers = [
  { id: 'sup1', code: 'SUP001', name: '广东华美木业有限公司', contact: '陈经理', phone: '13800138001', category: '木材供应商', status: '合作中' },
  { id: 'sup2', code: 'SUP002', name: '浙江固特五金制造厂', contact: '王厂长', phone: '13922223333', category: '五金配件', status: '合作中' },
  { id: 'sup3', code: 'SUP003', name: '顺德金工', contact: '赵经理', phone: '13766667777', category: '金属加工', status: '合作中' }
];

export const products = [
  { id: 'p1', code: 'PROD001', name: '皮沙发', spec: '真皮/咖啡色', unit: '个', price: 2500, category: '成品', cost: 1500 },
  { id: 'p2', code: 'PROD002', name: '实木餐桌', spec: '1.6m圆形', unit: '张', price: 3200, category: '成品', cost: 2000 },
  { id: 'p3', code: 'PROD003', name: '极简书架', spec: '胡桃木', unit: '组', price: 1800, category: '成品', cost: 1000 },
  { id: 'p4', code: 'MAT001', name: '红橡木板材', spec: '2000*200*20', unit: 'm³', price: 4500, category: '原料', cost: 3500 },
  { id: 'p5', code: 'ACC001', name: '不锈钢铰链', spec: '110度/自卸', unit: '对', price: 12, category: '五金', cost: 8 }
];

export const productCategories = ['成品', '半成品', '原料', '五金', '包装', '辅料'];

export const warehouses = [
  { 
    id: 'wh1', 
    name: '主成品仓库', 
    bins: [
      { id: 'b1-1', name: 'A-01-01' },
      { id: 'b1-2', name: 'A-01-02' }
    ]
  },
  { 
    id: 'wh2', 
    name: '原材料仓库', 
    bins: [
      { id: 'b2-1', name: 'R-01-01' },
      { id: 'b2-2', name: 'R-01-02' }
    ]
  }
];
