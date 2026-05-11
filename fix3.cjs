const fs = require('fs');

const files = [
'src/components/CustomerSettlementModal.jsx',
'src/components/RechargeModal.jsx'
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
