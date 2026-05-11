const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('src');
let issues = [];

files.forEach(file => {
    const content = fs.readFileSync(file, 'utf-8');
    const useFormMatch = content.match(/const\s+\[([a-zA-Z0-9_]+)\]\s*=\s*(?:Form\.)?useForm\(\)/);
    
    if (useFormMatch) {
        const formVarName = useFormMatch[1];
        if (content.match(/<Form/)) {
            const formPropRegex = new RegExp(`form={${formVarName}}`);
            if (!content.match(formPropRegex)) {
                issues.push(`File: ${file} might be missing form={${formVarName}}!`);
            }
        } else {
             issues.push(`File: ${file} uses useForm but renders NO <Form>!`);
        }
    }
});

console.log("RESULTS");
console.log(issues.join('\n'));
