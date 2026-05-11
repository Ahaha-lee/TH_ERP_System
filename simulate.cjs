const testStr = `import React from 'react';
const fn = (v, record) => {
    return (v || 0).toFixed(2);
};`;

let content = testStr;
content = content.replace(/\(v || 0\)\.toFixed/g, "Number(v || 0).toFixed");
content = content.replace(/\(v \|\| 0\)\.toFixed/g, "Number(v || 0).toFixed");

// Now let's try to reverse it using a greedy matcher.
// We know `rep = "NumberNumber(v || 0).toFixed"`
const rep = "NumberNumber(v || 0).toFixed";
let parts = content.split(rep);

// Let's print parts to see
console.log(parts);
