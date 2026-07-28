import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../src/app");

function svgMarkup(size) {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ff8a70"/>
      <stop offset="55%" stop-color="#ff6a4d"/>
      <stop offset="100%" stop-color="#f0a83c"/>
    </linearGradient>
  </defs>
  <rect width="32" height="32" rx="8" fill="url(#g)"/>
  <text x="16" y="22.5" text-anchor="middle"
    font-family="Arial, Helvetica, sans-serif"
    font-size="18" font-weight="800" fill="#ffffff">Q</text>
</svg>`;
}

function icoFromPngs(images) {
  const count = images.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  const entries = [];
  let offset = 6 + 16 * count;

  for (const image of images) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 0);
    entry.writeUInt8(image.size >= 256 ? 0 : image.size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(image.buf.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += image.buf.length;
  }

  return Buffer.concat([header, ...entries, ...images.map((image) => image.buf)]);
}

const sizes = [16, 32, 48];
const images = [];

for (const size of sizes) {
  const buf = await sharp(Buffer.from(svgMarkup(size))).png().toBuffer();
  images.push({ size, buf });
}

await sharp(Buffer.from(svgMarkup(32))).png().toFile(path.join(dir, "icon.png"));
await sharp(Buffer.from(svgMarkup(180)))
  .resize(180, 180)
  .png()
  .toFile(path.join(dir, "apple-icon.png"));

fs.writeFileSync(path.join(dir, "favicon.ico"), icoFromPngs(images));

console.log("favicon.ico", fs.statSync(path.join(dir, "favicon.ico")).size);
console.log("icon.png + apple-icon.png written");
