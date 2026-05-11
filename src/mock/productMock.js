/**
 * Product / Material Mock Data
 */
import { products as masterProducts } from './masterData';

const products = masterProducts;
// No export here, use masterData instead

export const processes = [
  { processCode: 'P001', processName: '切割', unitPrice: 10 },
  { processCode: 'P002', processName: '焊接', unitPrice: 25 },
  { processCode: 'P003', processName: '打磨', unitPrice: 15 },
  { processCode: 'P004', processName: '喷涂', unitPrice: 40 },
  { processCode: 'P005', processName: '组装', unitPrice: 30 }
];
