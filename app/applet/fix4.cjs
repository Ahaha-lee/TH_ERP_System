const fs = require('fs');
let t = fs.readFileSync("src/components/warehouse/WarehouseFormModal.jsx", "utf8");
t = t.replace(/\}\`;\s*form\.setFieldsValue(\(\{)/, "} else { const initialWhCode = `WH-00${Math.floor(Math.random()*1000)}`; form.setFieldsValue$1");
fs.writeFileSync("src/components/warehouse/WarehouseFormModal.jsx", t);
