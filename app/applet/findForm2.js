const fs = require('fs');
const files = require('child_process').execSync('find src -type f -name "*.jsx"').toString().split('\n').filter(Boolean);
for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  const regex = /const\s+\[([a-zA-Z0-9_]+)\]\s*=\s*(?:Form\.)?useForm/g;
  while ((match = regex.exec(content)) !== null) {
      const v = match[1];
      const hasForm = content.includes('form={' + v + '}') || content.includes('{...' + v + '}');
      if (!hasForm) {
          console.log("Missing form prop for", v, "in", file);
      }
  }
}
