const fs = require('fs');

const files = [
'src/pages/finance/ReceiptManagement.jsx',
'src/pages/inbound/BatchManagement.jsx',
'src/pages/inbound/InboundOrderList.jsx',
'src/pages/inventory/MaterialStockLedger.jsx',
'src/pages/inventory/StocktakingList.jsx',
'src/pages/outbound/OutboundOrderList.jsx',
'src/pages/sales/ConsignmentOrderList.jsx',
'src/pages/sales/NormalOrderList.jsx',
'src/pages/sales/QuotationList.jsx',
'src/pages/sales/SalesOrderNormal.jsx',
'src/pages/sales/TrusteeOrderList.jsx',
'src/pages/settings/LabelRule.jsx',
'src/pages/warehouse/WarehouseList.jsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/<Modal(?=\s|>)/g, '<Modal forceRender');
    content = content.replace(/<Drawer(?=\s|>)/g, '<Drawer forceRender');
    content = content.replace(/forceRender\s+forceRender/g, 'forceRender');
    fs.writeFileSync(file, content);
    console.log(`Updated ${file}`);
  }
});
