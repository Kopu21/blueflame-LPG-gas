const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/koper/.gemini/antigravity/scratch/lpg-gas-agency';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

const imageMap = {};
files.forEach(f => {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  const matches = content.match(/https:\/\/images\.unsplash\.com\/[^\s\"\'\<\>]+/g) || [];
  matches.forEach(img => {
    const id = img.split('?')[0];
    if (!imageMap[id]) imageMap[id] = [];
    imageMap[id].push(f);
  });
});

console.log('Total distinct images currently: ' + Object.keys(imageMap).length);
for (const [id, pages] of Object.entries(imageMap)) {
  console.log(`${id} -> ${pages.join(', ')}`);
}
