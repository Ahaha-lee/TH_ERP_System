
/**
 * Outbound Order Mock Data
 * Status: 草稿, 待审批, 已审批, 已出库
 */
export const outboundOrders = [
  {
    id: 'out1',
    orderNo: 'SO-202504280001',
    type: '销售出库',
    relOrderNo: 'SALES-20250420-001',
    partnerName: '美家家居',
    warehouseName: '主成品仓库',
    materialTotal: 2,
    outboundDate: '2025-04-28',
    status: '已出库',
    remark: '加急发货',
    items: [
      { productCode: 'PROD001', productName: '皮沙发', quantity: 2, price: 2500 },
      { productCode: 'PROD002', productName: '实木餐桌', quantity: 1, price: 3200 }
    ]
  },
  {
    id: 'out2',
    orderNo: 'PK-202504280002',
    type: '领料出库',
    relOrderNo: 'WO-20250427-001',
    partnerName: '生产一车间',
    warehouseName: '原材料仓库',
    materialTotal: 3,
    outboundDate: '2025-04-28',
    status: '已审批',
    remark: '工单领料',
    items: [
      { productCode: 'MAT001', productName: '红橡木板材', quantity: 10, price: 4200 },
      { productCode: 'MAT002', productName: '夹板', quantity: 5, price: 80 }
    ]
  },
  {
    id: 'out3',
    orderNo: 'SI-202504290001',
    type: '委外出库',
    relOrderNo: 'SPO-20250422-003',
    partnerName: '顺德金工',
    warehouseName: '原材料仓库',
    materialTotal: 1,
    outboundDate: '2025-04-29',
    status: '草稿',
    remark: '发外喷漆',
    items: [
      { productCode: 'ACC001', productName: '不锈钢铰链', quantity: 100, price: 12 }
    ]
  },
  {
    id: 'out4',
    orderNo: 'OT-202504290002',
    type: '其他出库',
    relOrderNo: '-',
    partnerName: '-',
    warehouseName: '原材料仓库',
    materialTotal: 1,
    outboundDate: '2025-04-29',
    status: '已审批',
    remark: '样品出库',
    items: [
      { productCode: 'MAT003', productName: '铝型材', quantity: 1, price: 50 }
    ]
  },
  {
    id: 'out5',
    orderNo: 'SO-202504300001',
    type: '销售出库',
    relOrderNo: 'SALES-20250425-005',
    partnerName: '华发装饰',
    warehouseName: '主成品仓库',
    materialTotal: 1,
    outboundDate: '2025-04-30',
    status: '草稿',
    remark: '-',
    items: [
      { productCode: 'PROD002', productName: '实木餐桌', quantity: 5, price: 3200 }
    ]
  },
  {
    id: 'out6',
    orderNo: 'PK-202504300002',
    type: '领料出库',
    relOrderNo: 'WO-20250429-002',
    partnerName: '生产二车间',
    warehouseName: '原材料仓库',
    materialTotal: 2,
    outboundDate: '2025-04-30',
    status: '已出库',
    remark: '补料单',
    items: [
      { productCode: 'ACC001', productName: '不锈钢铰链', quantity: 200, price: 12 }
    ]
  }
];
