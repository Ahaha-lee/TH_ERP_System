const glob = require('child_process').execSync('find src -type f -name "*.jsx"').toString().split('\n').filter(Boolean);
const fs = require('fs');
glob.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  let match;
  const regex = /const\s+\[(.*?)\]\s*=\s*(?:Form\.)?useForm/g;
  while ((match = regex.exec(content)) !== null) {
      const v = match[1].trim();
      const hasForm = content.includes(`form={${v}}`) || content.includes(`{...${v}}`);
      if (!hasForm) {
          console.log("Missing form prop for", v, "in", f);
      }
  }
});
