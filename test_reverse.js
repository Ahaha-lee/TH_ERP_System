const fs = require('fs');

let testStr = "render: (v) => `¥${(v || 0).toFixed(2)}`";
console.log("Original:", testStr);

let replaced = testStr.replace(/\(v || 0\)\.toFixed/g, "REP");
console.log("Replaced:", replaced);

// Now how do we reverse it?
// We split by "REP". 
// Wait, between every char there is "REP".
// If there are two chars A and B, in between them is "REP".
// So replaced will look like REP A REP B REP...
// But wait, " 0).toFixed" was completely replaced by one "REP".
// What abut "(v "?

// Let's see...
