const fs = require('fs');
const path = require('path');
const dir = './src/pages';
const files = fs.readdirSync(dir);
files.forEach(file => {
    if(!file.endsWith('.tsx') || file === 'Dashboard.tsx' || file === 'Vehicles.tsx') return;
    let content = fs.readFileSync(path.join(dir, file), 'utf8');
    content = content.replace(/<input /g, '<input style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} ');
    content = content.replace(/<select /g, '<select style={{backgroundColor:"var(--color-main-bg)", color:"var(--color-text-primary)"}} ');
    fs.writeFileSync(path.join(dir, file), content);
});
