const fs = require('fs');

const files = [
    'src/components/sales/afterSales/ExchangeOrderDetailDrawer.jsx',
    'src/components/sales/afterSales/ExchangeOrderFormModal.jsx',
    'src/components/sales/afterSales/ReturnOrderFormModal.jsx',
    'src/components/sales/afterSales/ReturnOrderDetailDrawer.jsx',
    'src/components/sales/AuditDetailDrawer.jsx',
    'src/pages/sales/afterSales/ReturnOrderList.jsx',
    'src/components/sales/OriginalOrderSelectModal.jsx'
];

const rep = "NumberNumber(v || 0).toFixed";

files.forEach(file => {
    try {
        let content = fs.readFileSync(file, 'utf8');
        let parts = content.split(rep);
        
        let restored = "";
        for (let i = 1; i < parts.length - 1; i++) {
            if (parts[i] === "") {
                restored += "(v ";
            } else {
                restored += parts[i];
            }
        }
        
        fs.writeFileSync(file, restored);
        console.log("Successfully restored", file);
    } catch (e) {
        console.log("Error processing", file, e.message);
    }
});
