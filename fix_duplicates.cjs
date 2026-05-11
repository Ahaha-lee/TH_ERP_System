const fs = require('fs');

const files = [
'src/components/CustomerEditModal.jsx',
'src/components/CustomerSelectModal.jsx',
'src/components/PriceVersionModal.jsx',
'src/components/QuotationFormModal.jsx',
'src/components/inventory/StocktakingFormModal.jsx',
'src/components/sales/AfterSaleReturnFormModal.jsx',
'src/components/sales/AuditModal.jsx',
'src/components/sales/DeliveryNoticeFormModal.jsx',
'src/components/sales/FinanceAuditModal.jsx',
'src/components/sales/NormalOrderFormModal.jsx',
'src/components/sales/WarehouseAuditModal.jsx',
'src/components/sales/afterSales/ReturnOrderFormModal.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    // For each of these files, find `<Modal forceRender` and remove the first occurrence 
    // OR we just use a regex to replace `<Modal forceRender` with `<Modal `
    content = content.replace(/<Modal\s+forceRender/g, '<Modal');
    content = content.replace(/<Drawer\s+forceRender/g, '<Drawer');
    fs.writeFileSync(file, content);
    console.log(`Fixed ${file}`);
  }
});
