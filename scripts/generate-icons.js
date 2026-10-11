import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toCrc = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toCrc), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, drawFn) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowOffset = y * (width * 4 + 1);
    raw[rowOffset] = 0;
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = drawFn(x, y, width, height);
      raw[pixelOffset] = r;
      raw[pixelOffset + 1] = g;
      raw[pixelOffset + 2] = b;
      raw[pixelOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(raw, { level: 6 });
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Draw Candy Swirl function
function drawCandyIcon(x, y, width, height, isMaskable = false) {
  const cx = width / 2;
  const cy = height / 2;
  const maxR = width / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2);

  // Background base: royal purple gradient (#5b15b5 to #8b5cf6)
  const bgT = (x + y) / (width + height);
  let bgR = Math.round(91 * (1 - bgT) + 139 * bgT);
  let bgG = Math.round(21 * (1 - bgT) + 92 * bgT);
  let bgB = Math.round(181 * (1 - bgT) + 246 * bgT);

  // Maskable uses full bleed background, normal uses rounded squircle
  if (!isMaskable) {
    const cornerR = width * 0.22;
    // Check if within rounded rectangle
    const inBoxX = Math.abs(dx) <= cx - cornerR;
    const inBoxY = Math.abs(dy) <= cy - cornerR;
    if (!inBoxX && !inBoxY) {
      const cornerDx = Math.abs(dx) - (cx - cornerR);
      const cornerDy = Math.abs(dy) - (cy - cornerR);
      if (cornerDx * cornerDx + cornerDy * cornerDy > cornerR * cornerR) {
        return [0, 0, 0, 0]; // Transparent
      }
    }
  }

  // Candy circle size (smaller on maskable to stay in safe-zone)
  const candyR = isMaskable ? width * 0.34 : width * 0.38;

  if (dist <= candyR) {
    // Outer shadow / glow border
    if (dist >= candyR - 3) {
      return [255, 255, 255, 230];
    }

    // Concentric core center
    if (dist < candyR * 0.16) {
      return [250, 204, 21, 255]; // Yellow dot
    }
    if (dist < candyR * 0.32) {
      return [244, 63, 94, 255]; // Raspberry pink
    }
    if (dist < candyR * 0.44) {
      return [255, 255, 255, 255]; // White ring
    }

    // Candy swirl spiral angle
    const spiral = (angle + (dist / candyR) * 1.8) % (Math.PI * 2);
    const sector = Math.floor((spiral / (Math.PI * 2)) * 8);

    switch (sector) {
      case 0: return [236, 72, 153, 255]; // Pink #ec4899
      case 1: return [56, 189, 248, 255]; // Cyan #38bdf8
      case 2: return [250, 204, 21, 255]; // Yellow #facc15
      case 3: return [239, 68, 68, 255];  // Red #ef4444
      case 4: return [255, 255, 255, 255]; // White
      case 5: return [168, 85, 247, 255]; // Purple #a855f7
      case 6: return [56, 189, 248, 255]; // Cyan #38bdf8
      case 7: return [236, 72, 153, 255]; // Pink
      default: return [255, 255, 255, 255];
    }
  }

  // Lollipop stick
  const stickAngle = Math.PI * 0.75;
  const stickLen = isMaskable ? width * 0.44 : width * 0.48;
  const stickX = cx + Math.cos(stickAngle) * dist;
  const stickY = cy + Math.sin(stickAngle) * dist;
  if (dy > 0 && dx < 0 && Math.abs(dy - Math.abs(dx)) < width * 0.04 && dist > candyR && dist < stickLen) {
    return [241, 245, 249, 255];
  }

  return [bgR, bgG, bgB, 255];
}

const outDir = path.resolve('public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 1. 192x192
console.log('Generating pwa-192x192.png...');
fs.writeFileSync(path.join(outDir, 'pwa-192x192.png'), createPng(192, 192, (x, y, w, h) => drawCandyIcon(x, y, w, h, false)));

// 2. 512x512
console.log('Generating pwa-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-512x512.png'), createPng(512, 512, (x, y, w, h) => drawCandyIcon(x, y, w, h, false)));

// 3. 512x512 maskable (with safe zone margin)
console.log('Generating pwa-maskable-512x512.png...');
fs.writeFileSync(path.join(outDir, 'pwa-maskable-512x512.png'), createPng(512, 512, (x, y, w, h) => drawCandyIcon(x, y, w, h, true)));

// 4. Apple Touch Icon 180x180
console.log('Generating apple-touch-icon.png...');
fs.writeFileSync(path.join(outDir, 'apple-touch-icon.png'), createPng(180, 180, (x, y, w, h) => drawCandyIcon(x, y, w, h, false)));

// 5. Favicon 64x64
console.log('Generating favicon.ico...');
fs.writeFileSync(path.join(outDir, 'favicon.ico'), createPng(64, 64, (x, y, w, h) => drawCandyIcon(x, y, w, h, false)));

console.log('All PWA icons generated successfully in public/');
