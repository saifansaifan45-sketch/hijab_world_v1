
import fs from 'fs';
import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('frontend/node_modules/sharp'));

async function run() {
  const svgBuf = fs.readFileSync('frontend/public/assets/brand/hijab-world-wordmark.svg');
  await sharp(svgBuf).png().toFile('frontend/public/assets/brand/hijab-world-wordmark.png');
  
  const tightBuf = fs.readFileSync('frontend/public/assets/brand/hijab-world-wordmark-standalone.svg');
  await sharp(tightBuf).png().toFile('frontend/public/assets/brand/hijab-world-wordmark-tight.png');
  console.log('Rasterized wordmarks!');
}
run().catch(console.error);
