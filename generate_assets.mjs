import fs from 'fs';
import path from 'path';

// Create 1x1 or valid minimal PNG buffer if canvas isn't present, or write SVG as icons
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Copy favicon.svg to public/
const svgContent = fs.readFileSync('favicon.svg', 'utf-8');
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svgContent);

console.log('Public assets initialized.');
