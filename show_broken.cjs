const fs = require("fs");
const files = [
"src/components/sales/AfterSaleReplenishFormModal.jsx",
"src/components/sales/AfterSaleReturnFormModal.jsx",
"src/components/sales/AfterSaleExchangeFormModal.jsx",
"src/components/inbound/ReturnInboundFormModal.jsx",
"src/components/inbound/ConsignmentInboundFormModal.jsx",
"src/components/inbound/SubcontractInboundFormModal.jsx",
"src/components/inbound/PurchaseInboundFormModal.jsx",
];
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes("}`")) {
       console.log(f + ":" + i + " -> " + lines[i]);
    }
  }
}
