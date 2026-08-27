import fs from 'fs';
import path from 'path';

const publicDir = path.resolve('public');
fs.copyFileSync('manifest.webmanifest', path.join(publicDir, 'manifest.webmanifest'));
fs.copyFileSync('sw.js', path.join(publicDir, 'sw.js'));
fs.copyFileSync('favicon.svg', path.join(publicDir, 'favicon.svg'));

console.log('Manifest and sw.js copied to public/');
