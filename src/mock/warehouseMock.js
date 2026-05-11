
// Mock data for Warehouse and Location Management

export const subsidiaries = [
  { id: 'sub-1', name: '家具一厂', shortName: 'F1' },
  { id: 'sub-2', name: '家具二厂', shortName: 'F2' },
  { id: 'sub-3', name: '红木制造中心', shortName: 'RW' },
];

export const employees = [
  { id: 'emp-1', name: '仓管员', role: '仓管员' },
  { id: 'emp-2', name: '张三', role: '仓库主管' },
  { id: 'emp-3', name: '李四', role: '仓管员' },
];

// Initial Warehouses
export let warehouses = [
  {
    id: 'wh-1',
    code: 'WH-F1-0001',
    name: '一厂成品仓',
    type: '实体仓库',
    subsidiaryId: 'sub-1',
    subsidiaryName: '家具一厂',
    location: '浙江省杭州市余杭区古运河路1号',
    managerId: 'emp-1',
    managerName: '仓管员',
    enabled: true,
    remark: '主要存放成品沙发及餐桌',
    locations: [
      { id: 'loc-1-1', code: 'LOC-WH-F1-0001-001', name: 'A区-01-01', type: '常规', spec: '2x2x2m', maxCapacity: 100 },
      { id: 'loc-1-2', code: 'LOC-WH-F1-0001-002', name: 'A区-01-02', type: '暂存', spec: '2x2x2m', maxCapacity: 50 },
      { id: 'loc-1-3', code: 'LOC-WH-F1-0001-003', name: '退货存放区', type: '退货区', spec: '5x5x3m', maxCapacity: 200 },
    ],
    hasRecords: true, // Simulated check for deletion
  },
  {
    id: 'wh-2',
    code: 'WH-F2-0001',
    name: '二厂原料虚拟仓',
    type: '虚拟仓库',
    subsidiaryId: 'sub-2',
    subsidiaryName: '家具二厂',
    location: '-',
    managerId: 'emp-2',
    managerName: '张三',
    enabled: false,
    remark: '用于在途物料核算',
    locations: [
      { id: 'loc-2-1', code: 'LOC-WH-F2-0001-001', name: '默认货位', type: '常规', spec: '-', maxCapacity: 99999 },
    ],
    hasRecords: false,
  },
];

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const warehouseService = {
  getWarehouses: () => [...warehouses],
  
  saveWarehouse: (data) => {
    if (data.id) {
      // Update
      const index = warehouses.findIndex(w => w.id === data.id);
      if (index !== -1) {
        warehouses[index] = { ...warehouses[index], ...data };
      }
    } else {
      // Create
      const newWh = {
        ...data,
        id: generateId(),
        hasRecords: false
      };
      warehouses.push(newWh);
    }
    return true;
  },
  
  deleteWarehouse: (id) => {
    const wh = warehouses.find(w => w.id === id);
    if (wh && wh.hasRecords) return false;
    warehouses = warehouses.filter(w => w.id !== id);
    return true;
  }
};
