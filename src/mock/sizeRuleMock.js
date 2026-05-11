
export const initialSizeRules = [
  {
    id: 'rule_001',
    productCode: 'PROD001',
    productName: '皮沙发',
    productSpec: '真皮/咖啡色',
    isActive: true, // Added active status
    baseSize: { length: 1800, width: 800, height: 900 },
    lengthStep: {
      enabled: true,
      base: 1800,
      steps: [
        { start: 0, end: 100, price: 0 },
        { start: 100, end: 300, price: 200 },
        { start: 300, end: 500, price: 400 },
        { start: 500, end: 999999, price: 600 }
      ]
    },
    widthStep: {
      enabled: true,
      base: 600,
      steps: [
        { start: 0, end: 50, price: 0 },
        { start: 50, end: 150, price: 150 },
        { start: 150, end: 999999, price: 300 }
      ]
    },
    heightStep: {
      enabled: true,
      base: 2400,
      steps: [
        { start: 0, end: 100, price: 0 },
        { start: 100, end: 999999, price: 200 }
      ]
    },
    coefficient: 1.2,
    isActive: true,
    status: '审批通过'
  },
  {
    id: 'rule_002',
    productCode: 'PROD002',
    productName: '实木餐桌',
    productSpec: '1.6m圆形',
    baseSize: { length: 1200, width: 600, height: 750 },
    lengthStep: {
      enabled: true,
      base: 1200,
      steps: [
        { start: 0, end: 100, price: 0 },
        { start: 100, end: 200, price: 100 },
        { start: 200, end: 999999, price: 200 }
      ]
    },
    widthStep: {
      enabled: false,
      base: 600,
      steps: []
    },
    heightStep: {
      enabled: true,
      base: 750,
      steps: [
        { start: 0, end: 50, price: 0 },
        { start: 50, end: 999999, price: 80 }
      ]
    },
    coefficient: 1.1,
    isActive: true,
    status: '审批通过'
  }
];
