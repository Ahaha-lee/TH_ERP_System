const fs = require("fs");
let content = fs.readFileSync("src/components/warehouse/WarehouseFormModal.jsx", "utf8");
content = content.replace("return `WH-${prefix}-${random} else { const initialWhCode = \"WH-00\" + Math.floor(Math.random()*1000); ", "return `WH-${prefix}-${random}`;");
fs.writeFileSync("src/components/warehouse/WarehouseFormModal.jsx", content);
