/**
 * Converts SVG sources in resources/ to the PNG files @capacitor/assets needs.
 * Run with: node scripts/build-source-assets.mjs
 */
import sharp from 'sharp';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const resources = resolve(root, 'resources');

const TASKS = [
  { svg: 'icon.svg', png: 'icon.png', width: 1024, height: 1024 },
  { svg: 'icon-foreground.svg', png: 'icon-foreground.png', width: 1024, height: 1024 },
  { svg: 'icon-background.svg', png: 'icon-background.png', width: 1024, height: 1024 },
  { svg: 'splash.svg', png: 'splash.png', width: 2732, height: 2732 },
  { svg: 'feature-graphic-en.svg', png: 'feature-graphic-en.png', width: 1024, height: 500 },
  { svg: 'feature-graphic-pt.svg', png: 'feature-graphic-pt.png', width: 1024, height: 500 },
];

for (const { svg, png, width, height } of TASKS) {
  const svgPath = resolve(resources, svg);
  const pngPath = resolve(resources, png);
  const svgBuffer = await readFile(svgPath);
  await sharp(svgBuffer, { density: 384 })
    .resize(width, height)
    .png()
    .toFile(pngPath);
  console.log(`✔ ${svg} → ${png} (${width}x${height})`);
}

console.log('\nDone. Now run: npx @capacitor/assets generate --android');
