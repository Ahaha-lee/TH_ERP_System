const fs = require('fs');
const path = require('path');

function findFiles(dir) {
    let files = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('node_modules')) {
                files = files.concat(findFiles(file));
            }
        } else {
            if (file.endsWith('.jsx')) {
                files.push(file);
            }
        }
    });
    return files;
}

const files = findFiles('./src');
files.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const useFormMatch = content.match(/const\s+\[([a-zA-Z0-9_]+)\]\s*=\s*(?:Form\.)?useForm\(\)/);
    if (useFormMatch) {
        const formVarName = useFormMatch[1];
        // Check if form={formVarName} exists in the file
        const formPropRegex = new RegExp(`form\\s*=\\s*[\\{\\(]\\s*${formVarName}\\s*[\\}\\)]`);
        if (!formPropRegex.test(content)) {
            console.log(`Potential issue in ${file}: '${formVarName}' is created by useForm but not passed to <Form form={...}>`);
        }
    }
});
