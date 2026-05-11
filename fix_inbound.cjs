const fs = require("fs");
const files = [
"src/components/inbound/ReturnInboundFormModal.jsx",
"src/components/inbound/ConsignmentInboundFormModal.jsx",
"src/components/inbound/SubcontractInboundFormModal.jsx",
"src/components/inbound/PurchaseInboundFormModal.jsx"
];
for (const f of files) {
  let content = fs.readFileSync(f, "utf8");
  content = content.replace(/      \}\`,/g, "      } else { form.setFieldsValue({ inboundNo: `IN-${dayjs().format(\"YYYYMMDD\")}`,");
  fs.writeFileSync(f, content);
  console.log("Fixed", f);
}
