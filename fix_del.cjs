const fs = require("fs");
let content = fs.readFileSync("src/components/sales/DeliveryNoticeFormModal.jsx", "utf8");
content = content.replace(/FH-\$\{dayjs\(\)\.format\(YYYYMMDD\)-\$\{Math/, "FH-${dayjs().format(YYYYMMDD)}-${Math");
content = content.replace("orderNo: `ORDER-", "noticeNo: `FH-");
fs.writeFileSync("src/components/sales/DeliveryNoticeFormModal.jsx", content);
