
/**
 * BOM Data (Bill of Materials)
 * Used for Subcontracting (委外) to calculate material consumption
 */
export const boms = {
  'PROD001': [ // 皮沙发
    { id: 'bom1-1', materialId: 'MAT001', materialCode: 'MAT001', materialName: '红橡木板材', unit: 'm³', unitUsage: 0.05 },
    { id: 'bom1-2', materialId: 'LEA001', materialCode: 'LEA001', materialName: '头层牛皮', unit: '张', unitUsage: 1.5 }
  ],
  'PROD002': [ // 实木餐桌
    { id: 'bom2-1', materialId: 'MAT001', materialCode: 'MAT001', materialName: '红橡木板材', unit: 'm³', unitUsage: 0.12 }
  ]
};

/**
 * Virtual Warehouse Stock for Suppliers
 */
export const supplierVirtualStocks = {
  'sup1': [
    { productCode: 'MAT001', productName: '红橡木板材', unit: 'm³', stock: 10 },
    { productCode: 'MAT002', productName: '胡桃木皮', unit: '㎡', stock: 500 }
  ],
  'sup2': [
    { productCode: 'ACC001', productName: '不锈钢铰链', unit: '对', stock: 1000 }
  ],
  'sup3': [
    { productCode: 'LEA001', productName: '头层牛皮', unit: '张', stock: 50 }
  ]
};
