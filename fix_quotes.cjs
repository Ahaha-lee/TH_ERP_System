const fs = require("fs");
const files = require("child_process").execSync("find src -type f -name \"*.jsx\"").toString().split("\n").filter(Boolean);
for (const f of files) {
  let content = fs.readFileSync(f, "utf8");
  let changed = false;
  content = content.replace(/(form\.setFieldsValue\(\{ orderNo: `ORDER-[^;]*`;)/g, (match, p1) => {
    changed = true;
    return match.replace("`;", "` });");
  });
  content = content.replace(/(form\.setFieldsValue\(\{ orderNo: `ORDER-[^\,]*`,)/g, (match, p1) => {
    changed = true;
    return match; // Actually if it ends with `,` it is likely inside a multi-line object.
  });
  if (changed) {
    fs.writeFileSync(f, content);
    console.log("Fixed missing closing object in", f);
  }
}
