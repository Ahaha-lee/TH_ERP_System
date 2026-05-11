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

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // We reverse the damage.
    // The exact string inserted was "Number(v || 0).toFixed"
    const rep = "Number(v || 0).toFixed";
    
    // The replace was: `content.replace(/\(v || 0\)\.toFixed/g, rep)`
    // This replaced `\(v ` or ` ` or ` 0\)\.toFixed` (actually ` 0).toFixed`) with `rep`.
    // Wait, regex `/\(v || 0\)\.toFixed/g` means matching empty strings too!
    
    // If we just remove all `rep` that are followed by something, wait...
    // Let's reconstruct.
    // If we split by `rep`, the parts are the original characters, EXCEPT where `(v ` or ` 0).toFixed` was matched.
    
    let parts = content.split(rep);
    let original = "";
    
    for (let i = 0; i < parts.length; i++) {
        // usually parts are single characters!
        // but if alternative 1 `\(v ` was matched, the original characters `(v ` are missing between characters.
        // wait, how do we know if it was empty string or `(v `?
        // If it was empty string, the characters around it don't form a "hole".
        
        let p = parts[i];
        if (p.length > 0) {
            original += p;
        }
    }
    
    // This will reconstruct the string with all `rep` removed.
    // BUT what about `(v ` and ` 0).toFixed` which were consumed?
    // They are missing!
    // So `(v || 0).toFixed(2)` became `||(2)` because `(v ` is missing, ` 0).toFixed` is missing!
    // We can just repair `||(2)` into `(v || 0).toFixed(2)`.
    
    fs.writeFileSync(f + '.repaired', original);
});
console.log("Wrote repaired to .repaired");
