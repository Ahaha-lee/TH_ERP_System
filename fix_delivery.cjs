const fs = require("fs");
let content = fs.readFileSync("src/components/sales/DeliveryNoticeFormModal.jsx", "utf8");
content = content.replace("} else { form.setFieldsValue({ orderNo: `ORDER-", "-");
fs.writeFileSync("src/components/sales/DeliveryNoticeFormModal.jsx", content);
