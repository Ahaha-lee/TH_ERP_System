import * as XLSX from 'xlsx';

/**
 * Export data to Excel
 * @param {Array} data - Array of objects
 * @param {string} fileName - File name
 * @param {Array} headers - Optional headers mapping { key: label }
 */
export const exportToExcel = (data, fileName = 'export.xlsx', headers) => {
  let wsData = data;
  
  if (headers) {
    wsData = data.map(item => {
      const newItem = {};
      Object.keys(headers).forEach(key => {
        newItem[headers[key]] = item[key];
      });
      return newItem;
    });
  }

  const ws = XLSX.utils.json_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, fileName);
};

/**
 * Import data from Excel
 * @param {File} file - File object from input
 * @returns {Promise<Array>} - Parsed JSON data
 */
export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        resolve(json);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};
