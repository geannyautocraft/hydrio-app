/**
 * Icon generation helper.
 * Run: npx tsx scripts/generate-icons.js
 *
 * For now, we generate simple solid-color PNG placeholders.
 * Replace public/icon-192.png and public/icon-512.png with
 * proper designed icons for production.
 */
import fs from 'fs';
import path from 'path';
import { deflateSync } from 'zlib';

function createMinimalPng(size) {
  // Create a minimal valid PNG with a blue square
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);  // width
  ihdrData.writeUInt32BE(size, 4);  // height
  ihdrData.writeUInt8(8, 8);        // bit depth
  ihdrData.writeUInt8(2, 9);        // color type (RGB)
  ihdrData.writeUInt8(0, 10);       // compression
  ihdrData.writeUInt8(0, 11);       // filter
  ihdrData.writeUInt8(0, 12);       // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk - create image data
  const rawData = [];
  const blue = [59, 130, 246]; // #3B82F6

  for (let y = 0; y < size; y++) {
    rawData.push(0); // filter none
    for (let x = 0; x < size; x++) {
      // Simple water drop shape
      const cx = size / 2;
      const cy = size / 2;
      const dx = (x - cx) / (size / 2);
      const dy = (y - cy) / (size / 2);

      // Drop shape: circle with pointed top
      const topPart = y < cy;
      const inDrop = topPart
        ? (dx * dx + (dy + 0.3) * (dy + 0.3) * 2.5) < 0.35
        : (dx * dx + dy * dy) < 0.35;

      if (inDrop) {
        rawData.push(...blue);
      } else {
        rawData.push(240, 249, 255); // light blue bg #f0f9ff
      }
    }
  }

  const compressed = deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);

  // CRC32
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < crcData.length; i++) {
    crc ^= crcData[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
    }
  }
  crc ^= 0xFFFFFFFF;

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

const publicDir = path.join(import.meta.dirname, '..', 'public');

fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createMinimalPng(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createMinimalPng(512));

console.log('Icons generated: icon-192.png, icon-512.png');
