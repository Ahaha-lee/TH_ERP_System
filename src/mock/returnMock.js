import dayjs from 'dayjs';

export const mockReturns = [
  {
    id: 'ret-001',
    returnNo: 'RET-20250428-001',
    sourceOrderNo: 'SOD-20250428-0001',
    customerId: 'c1',
    customerName: '雅居家具城',
    customerType: '经销商',
    settlementMethod: '月结',
    orderDate: '2025-04-28',
    salesperson: '张销售',
    status: '草稿',
    returnAmount: 1800,
    returnReason: '产品面料色差',
    items: [
      { id: 'reti-001', productCode: 'PROD001', productName: '皮沙发', spec: '真皮/棕色', returnQuantity: 1, unitPrice: 1800, amount: 1800, remark: '' }
    ],
    remark: '草稿状态测试'
  },
  {
    id: 'ret-002',
    returnNo: 'RET-20250428-002',
    sourceOrderNo: 'SOD-20250428-0002',
    customerName: '万达广场直营店',
    status: '待收货',
    returnAmount: 2000,
    items: [],
    remark: '待收货状态测试'
  },
  {
    id: 'ret-003',
    returnNo: 'RET-20250428-003',
    sourceOrderNo: 'SOD-20250428-0003',
    customerName: '绿城装修公司',
    status: '待收货',
    auditResult: '审批拒绝',
    returnAmount: 1500,
    items: [],
    remark: '待收货审批拒绝测试'
  },
  {
    id: 'ret-004',
    returnNo: 'RET-20250428-004',
    sourceOrderNo: 'SOD-20250428-0004',
    customerName: '北京天汇',
    status: '待财务审批',
    returnAmount: 3200,
    items: [],
    remark: '待财务审批测试'
  },
  {
    id: 'ret-005',
    returnNo: 'RET-20250428-005',
    sourceOrderNo: 'SOD-20250428-0005',
    customerName: '上海新世界',
    status: '待财务审批',
    auditResult: '审批拒绝',
    returnAmount: 4100,
    items: [],
    remark: '待财务审批审批拒绝测试'
  },
  {
    id: 'ret-006',
    returnNo: 'RET-20250428-006',
    sourceOrderNo: 'SOD-20250428-0006',
    customerName: '顾家家居',
    status: '已完成',
    returnAmount: 900,
    items: [],
    remark: '已完成测试'
  },
  {
    id: 'ret-007',
    returnNo: 'RET-20250428-007',
    sourceOrderNo: 'SOD-20250428-0007',
    customerName: '阳光城物业',
    status: '已关闭',
    returnAmount: 1100,
    items: [],
    remark: '已关闭测试'
  }
];
