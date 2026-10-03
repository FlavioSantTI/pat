import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, "ascii");
  data.copy(buf, 8);
  const crc = crc32(buf.subarray(4, 8 + len));
  buf.writeUInt32BE(crc, 8 + len);
  return buf;
}

function createPng(width, height) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8 bits per channel
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // standard filter
  ihdr[12] = 0; // non-interlaced
  const ihdrChunk = makeChunk("IHDR", ihdr);

  // Scanlines with Lumina Indigo / Violet gradient
  const raw = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter type 0 (none)
    const factor = y / height;
    const r = Math.round(79 + (124 - 79) * factor);  // #4F46E5 -> #7C3AED
    const g = Math.round(70 + (58 - 70) * factor);
    const b = Math.round(229 + (237 - 229) * factor);

    for (let x = 0; x < width; x++) {
      // Draw centered circle badge
      const dx = x - width / 2;
      const dy = y - height / 2;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < width * 0.22) {
        // Center calm white symbol
        raw[offset++] = 255;
        raw[offset++] = 255;
        raw[offset++] = 255;
        raw[offset++] = 255;
      } else if (dist < width * 0.26) {
        // Soft ring
        raw[offset++] = 255;
        raw[offset++] = 255;
        raw[offset++] = 255;
        raw[offset++] = 180;
      } else {
        // Background gradient
        raw[offset++] = r;
        raw[offset++] = g;
        raw[offset++] = b;
        raw[offset++] = 255;
      }
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idatChunk = makeChunk("IDAT", compressed);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const outDir = path.join(process.cwd(), "public", "icons");
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

fs.writeFileSync(path.join(outDir, "icon-192.png"), createPng(192, 192));
fs.writeFileSync(path.join(outDir, "icon-512.png"), createPng(512, 512));
fs.writeFileSync(path.join(outDir, "icon-maskable-512.png"), createPng(512, 512));
fs.writeFileSync(path.join(outDir, "apple-touch-icon.png"), createPng(180, 180));
console.log("Successfully generated PNG icons for Lumina PWA!");
