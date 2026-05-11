
import dayjs from 'dayjs';

/**
 * Utility helper functions
 */
export const formatCurrency = (value) => {
  if (value === undefined || value === null) return '¥0.00';
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
  }).format(value);
};

export const generateId = (prefix = '') => {
  return `${prefix}${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

export const generateCustomerCode = (index) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const seq = String(index).padStart(4, '0');
  return `CUST${date}${seq}`;
};

export const getDiscountRate = (type, priceVersions = [], categories = []) => {
  if (!type || !priceVersions.length || !categories.length) return '0%';
  
  const category = categories.find(c => c.name === type);
  if (!category) return '0%';

  const activeVersion = priceVersions.find(v => v.categoryId === category.id && v.status === '生效');
  if (!activeVersion) return '0%';

  return `${activeVersion.discountRate}%`;
};

export const getDiscountRateValue = (type, priceVersions = [], categories = []) => {
  const rateStr = getDiscountRate(type, priceVersions, categories);
  return parseFloat(rateStr) / 100;
};

export const generateQuotationNo = () => {
  return `QN${dayjs().format('YYYYMMDDHHmmss')}`;
};

export const generateNormalOrderNo = () => {
  return `SO${dayjs().format('YYYYMMDDHHmmss')}`;
};

export const generateConsignmentOrderNo = () => {
  return `CO${dayjs().format('YYYYMMDDHHmmss')}`;
};

export const generateDeliveryNoticeNo = () => {
  return `DN${dayjs().format('YYYYMMDDHHmmss')}`;
};

export const generateReturnOrderNo = () => {
  return `RO${dayjs().format('YYYYMMDDHHmmss')}`;
};

export const generateExchangeOrderNo = () => {
  return `EO${dayjs().format('YYYYMMDDHHmmss')}`;
};

export const generateReplenishOrderNo = () => {
  return `RE${dayjs().format('YYYYMMDDHHmmss')}`;
};
