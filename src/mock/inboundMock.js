
import { suppliers, products, employees, warehouses } from './masterData';

/**
 * Inbound Order Mock Data
 */
export const inboundOrders = [
  {
    id: 'in1',
    orderNo: 'PI-202504230001',
    type: '采购入库',
    relOrderNo: 'PO-20250420-001',
    partnerName: '广东华美木业有限公司',
    warehouseName: '原材料仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-23',
    auditResult: '通过',
    status: '已入库',
    remark: '首批原材料到货',
    items: [
      { productCode: 'MAT001', productName: '红橡木板材', spec: '2000*200*20', unit: 'm³', price: 4200.00, quantity: 2, bin: 'R-01-01' }
    ]
  },
  {
    id: 'in2',
    orderNo: 'PD-202504250001',
    type: '生产入库',
    relOrderNo: 'WO20250423001',
    partnerName: '车间一组',
    warehouseName: '主成品仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-25',
    auditResult: '通过',
    status: '已审批',
    remark: '沙发成品入库',
    items: [
      { productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', price: 2500.00, quantity: 10, bin: 'A-01-01', batchNo: '20250425PD001' }
    ]
  },
  {
    id: 'in3',
    orderNo: 'RI-202504260001',
    type: '退货入库',
    relOrderNo: 'AS20250424001',
    partnerName: '美家家居',
    warehouseName: '主成品仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-26',
    auditResult: '-',
    status: '待入库',
    remark: '售后换货退回',
    items: [
      { productCode: 'PROD001', productName: '皮沙发', spec: '真皮/咖啡色', unit: '个', price: 2500.00, quantity: 1, bin: 'A-02-01' }
    ]
  },
  {
    id: 'in4',
    orderNo: 'SI-202504260002',
    type: '委外入库',
    relOrderNo: 'SPO-20250422-003',
    partnerName: '顺德金工',
    warehouseName: '主成品仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-26',
    auditResult: '通过',
    status: '已审批',
    remark: '委外加工返还',
    items: [
      { productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', price: 120.00, quantity: 50, bin: 'A-01-02' }
    ]
  },
  {
    id: 'in5',
    orderNo: 'CI-202504270001',
    type: '受托入库',
    relOrderNo: 'CON-20250420-001',
    partnerName: '华发装饰',
    warehouseName: '原材料仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-27',
    auditResult: '通过',
    status: '已入库',
    remark: '客户来料加工',
    items: [
      { productCode: 'MAT002', productName: '夹板', spec: '18mm', unit: '张', price: 80.00, quantity: 200, bin: 'R-01-02' }
    ]
  },
  {
    id: 'in6',
    orderNo: 'PI-202504270002',
    type: '采购入库',
    relOrderNo: 'PO-20250425-005',
    partnerName: '浙江固特五金制造厂',
    warehouseName: '原材料仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-27',
    auditResult: '拒绝',
    status: '已驳回',
    remark: '数量不符',
    items: [
      { productCode: 'ACC001', productName: '不锈钢铰链', spec: '110度/自卸', unit: '对', price: 12.50, quantity: 1000, bin: 'R-01-01' }
    ]
  },
  {
    id: 'in7',
    orderNo: 'PD-202504280001',
    type: '生产入库',
    relOrderNo: 'WO20250427002',
    partnerName: '车间二组',
    warehouseName: '主成品仓库',
    materialTypeCount: 2,
    inboundDate: '2025-04-28',
    auditResult: '通过',
    status: '已入库',
    remark: '常规成品入库',
    items: [
      { productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', price: 3200.00, quantity: 5, bin: 'A-01-01' },
      { productCode: 'PROD003', productName: '极简书架', spec: '胡桃木', unit: '组', price: 1800.00, quantity: 10, bin: 'A-01-02' }
    ]
  },
  {
    id: 'in8',
    orderNo: 'RI-202504280002',
    type: '退货入库',
    relOrderNo: 'AS20250427001',
    partnerName: '宜居美学',
    warehouseName: '主成品仓库',
    materialTypeCount: 1,
    inboundDate: '2025-04-28',
    auditResult: '-',
    status: '待审批',
    remark: '终端客户退货',
    items: [
      { productCode: 'PROD002', productName: '实木餐桌', spec: '1.6m圆形', unit: '张', price: 3200.00, quantity: 1, bin: 'A-01-01' }
    ]
  },
  {
    id: 'in9',
    orderNo: 'PI-202504290001',
    type: '采购入库',
    relOrderNo: 'PO-20250425-003',
    partnerName: '佛山名家皮革辅料公司',
    warehouseName: '原辅料仓库',
    materialTypeCount: 2,
    inboundDate: '2025-04-29',
    auditResult: '通过',
    status: '已审批',
    remark: '皮革海绵到货',
    items: [
      { productCode: 'FAB001', productName: '头层牛皮', spec: '咖啡色/优质', unit: '张', price: 1200.00, quantity: 50, bin: 'F-01-01' },
      { productCode: 'FOA001', productName: '高回弹海绵', spec: '45D/加厚', unit: '张', price: 45.00, quantity: 300, bin: 'F-02-01' }
    ]
  }
];
