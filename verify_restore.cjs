const testStr = `import React from 'react';\nconst fn = (v, record) => {\n    return (v || 0).toFixed(2);\n};`;
let content = testStr;
content = content.replace(/\(v || 0\)\.toFixed/g, "REP");
let parts = content.split("REP");

let restored = "";
for (let i = 1; i < parts.length - 1; i++) {
    if (parts[i] === "") {
        restored += "(v ";
    } else {
        restored += parts[i];
    }
}
console.log("Restored:", restored);
console.log("Matches original:", restored === testStr);
