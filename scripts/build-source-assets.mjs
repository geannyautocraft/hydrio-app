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
  { svg: 'icon.svg', png: 'icon.png', size: 1024 },
  { svg: 'icon-foreground.svg', png: 'icon-foreground.png', size: 1024 },
  { svg: 'icon-background.svg', png: 'icon-background.png', size: 1024 },
  { svg: 'splash.svg', png: 'splash.png', size: 2732 },
];

for (const { svg, png, size } of TASKS) {
  const svgPath = resolve(resources, svg);
  const pngPath = resolve(resources, png);
  const svgBuffer = await readFile(svgPath);
  await sharp(svgBuffer, { density: 384 })
    .resize(size, size)
    .png()
    .toFile(pngPath);
  console.log(`✔ ${svg} → ${png} (${size}x${size})`);
}

console.log('\nDone. Now run: npx @capacitor/assets generate --android');
