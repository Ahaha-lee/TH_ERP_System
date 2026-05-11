const fs = require("fs");
let content = fs.readFileSync("src/components/inbound/ProductionInboundFormModal.jsx", "utf8");
content = content.replace("batchNo: `B-${dayjs().format(\"YYYYMMDD\")} else { form.setFieldsValue({ orderNo: `ORDER-${Math.floor(Math.random() * 1000)}`,", "batchNo: `B-${dayjs().format(\"YYYYMMDD\")}-001`,");
fs.writeFileSync("src/components/inbound/ProductionInboundFormModal.jsx", content);
