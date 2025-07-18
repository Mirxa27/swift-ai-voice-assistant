const fs = require('fs');
const path = require('path');
const files = ['providers.json', 'prompts.json', 'crisis.json'];
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const dir = path.join('backup', stamp);
fs.mkdirSync(dir, { recursive: true });
for (const file of files) {
  const src = path.join(process.cwd(), file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(dir, file));
  }
}
console.log('Backup saved to', dir);
