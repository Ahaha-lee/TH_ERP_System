const fs = require('fs');

const fixToFixed = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    // Using simple replacements for specific cases
    content = content.replace(/\(\(r\.quantity \|\| r\.currentReturnQuantity \|\| 0\) \* \(r\.unitPrice \|\| r\.originalUnitPrice \|\| 0\)\)\.toFixed/g, "Number((r.quantity || r.currentReturnQuantity || 0) * (r.unitPrice || r.originalUnitPrice || 0) || 0).toFixed");
    content = content.replace(/\(\(r\.quantity \|\| 0\) \* \(r\.unitPrice \|\| 0\)\)\.toFixed/g, "Number((r.quantity || 0) * (r.unitPrice || 0) || 0).toFixed");
    content = content.replace(/\(r\.originalUnitPrice \* r\.currentReturnQuantity\)\.toFixed/g, "Number(r.originalUnitPrice * r.currentReturnQuantity || 0).toFixed");
    content = content.replace(/\(r\.unitPrice \* r\.quantity\)\.toFixed/g, "Number(r.unitPrice * r.quantity || 0).toFixed");
    content = content.replace(/totals\.returnTotal\.toFixed/g, "Number(totals.returnTotal || 0).toFixed");
    content = content.replace(/totals\.exchangeTotal\.toFixed/g, "Number(totals.exchangeTotal || 0).toFixed");
    content = content.replace(/totals\.diff\.toFixed/g, "Number(totals.diff || 0).toFixed");
    content = content.replace(/v\?\.toFixed/g, "Number(v || 0).toFixed");
    content = content.replace(/\(v || 0\)\.toFixed/g, "Number(v || 0).toFixed");
    content = content.replace(/totalSummaries\.productTotal\.toFixed/g, "Number(totalSummaries?.productTotal || 0).toFixed");
    content = content.replace(/totalSummaries\.originalPaid\.toFixed/g, "Number(totalSummaries?.originalPaid || 0).toFixed");
    content = content.replace(/totalSummaries\.orderTotal\.toFixed/g, "Number(totalSummaries?.orderTotal || 0).toFixed");
    content = content.replace(/\(totalSummaries\.productTotal - totalSummaries\.originalPaid\)\.toFixed/g, "Number((totalSummaries?.productTotal || 0) - (totalSummaries?.originalPaid || 0)).toFixed");
    
    // AuditDetailDrawer.jsx
    content = content.replace(/record\.deposit\.toFixed/g, "Number(record?.deposit || 0).toFixed");
    content = content.replace(/totalProductAmount\.toFixed/g, "Number(totalProductAmount || 0).toFixed");
    content = content.replace(/Math\.abs\(discountAmount\)\.toFixed/g, "Number(Math.abs(discountAmount || 0)).toFixed");
    content = content.replace(/\(\(record\?\.depositRatio \|\| 30\) \/ 100 \* totalOrderAmount\)\.toFixed/g, "Number(((record?.depositRatio || 30) / 100 * (totalOrderAmount || 0))).toFixed");
    content = content.replace(/totalOrderAmount\.toFixed/g, "Number(totalOrderAmount || 0).toFixed");
    
    // OriginalOrderSelectModal.jsx
    content = content.replace(/v\.toFixed/g, "Number(v || 0).toFixed");
    
    // ReturnOrderDetailDrawer.jsx specific
    content = content.replace(/\(v \|\| r\.unitPrice \|\| 0\)\.toFixed/g, "Number(v || r?.unitPrice || 0).toFixed");
    content = content.replace(/\(record\.returnAmount \|\| 0\)\.toFixed/g, "Number(record?.returnAmount || 0).toFixed");
    content = content.replace(/\(v \|\| 0\)\.toFixed/g, "Number(v || 0).toFixed");

    fs.writeFileSync(file, content);
};

[
    'src/components/sales/afterSales/ExchangeOrderDetailDrawer.jsx',
    'src/components/sales/afterSales/ExchangeOrderFormModal.jsx',
    'src/components/sales/afterSales/ReturnOrderFormModal.jsx',
    'src/components/sales/afterSales/ReturnOrderDetailDrawer.jsx',
    'src/components/sales/AuditDetailDrawer.jsx',
    'src/pages/sales/afterSales/ReturnOrderList.jsx',
    'src/components/sales/OriginalOrderSelectModal.jsx'
].forEach(fixToFixed);
console.log('Fixed toFixed references');
