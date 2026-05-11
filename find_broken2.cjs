const fs = require("fs");
const files = require("child_process").execSync("find src -type f -name \"*.jsx\"").toString().split("\n").filter(Boolean);
for (const f of files) {
  const content = fs.readFileSync(f, "utf8");
  if (content.match(/\}\`[,\;]/)) {
     console.log("Broken: ", f);
  }
}
