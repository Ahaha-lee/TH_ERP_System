const fs = require('fs');
const files = [
  'src/pages/sales/TrusteeOrderList.jsx',
  'src/components/sales/OriginalOrderSelectModal.jsx',
  'src/components/sales/NormalOrderFormModal.jsx',
  'src/components/finance/ClaimFlowModal.jsx',
  'src/pages/sales/ConsignmentOrderList.jsx'
];

for (const file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/v\.toFixed/g, "(v || 0).toFixed");
    fs.writeFileSync(file, content);
    console.log("Fixed", file);
  } catch (e) {
    console.log("Error", file, e);
  }
}
