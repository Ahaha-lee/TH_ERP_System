const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.jsx') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            if (content.includes('useForm(')) {
                let changed = false;
                
                if (content.includes('destroyOnClose')) {
                    content = content.replace(/\bdestroyOnClose(=[^\s>]+)?\b/g, '');
                    changed = true;
                }
                if (content.includes('destroyOnHidden')) {
                    content = content.replace(/\bdestroyOnHidden(=[^\s>]+)?\b/g, '');
                    changed = true;
                }
                
                // For Modal and Drawer, if they don't have forceRender, we add it? 
                // Only if it's the main wrapper maybe. For now just removing destroy usually fixes it
                
                if (changed) {
                    fs.writeFileSync(fullPath, content, 'utf8');
                    console.log('Fixed', fullPath);
                }
            }
        }
    });
}
processDir('./src');
