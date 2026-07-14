import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  
  // CRC-32
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) {
        c = 0xedb88320 ^ (c >>> 1);
      } else {
        c = c >>> 1;
      }
    }
    crcTable[n] = c;
  }
  
  let crc = 0xffffffff;
  for (let i = 4; i < 8 + length; i++) {
    crc = crcTable[(crc ^ chunk[i]) & 0xff] ^ (crc >>> 8);
  }
  crc = crc ^ 0xffffffff;
  chunk.writeUInt32BE(crc >>> 0, 8 + length);
  return chunk;
}

function generateIconPng(width, height) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type (RGB)
  ihdrData[10] = 0; // compression method
  ihdrData[11] = 0; // filter method
  ihdrData[12] = 0; // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Pixel data with 1 filter byte per scanline
  const scanlineWidth = width * 3 + 1;
  const rawPixelData = Buffer.alloc(scanlineWidth * height);

  for (let y = 0; y < height; y++) {
    rawPixelData[y * scanlineWidth] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const idx = y * scanlineWidth + 1 + x * 3;
      
      // Default Background: Deep Slate Dark Blue (#020202)
      let r = 2;
      let g = 2;
      let b = 2;

      // Draw elegant grid lines
      if (x % Math.floor(width / 5) === 0 || y % Math.floor(height / 5) === 0) {
        r = 15;
        g = 15;
        b = 15;
      }

      // Border highlight (subtle gold frame)
      const borderWidth = Math.max(1, Math.floor(width * 0.02));
      if (x < borderWidth || x >= width - borderWidth || y < borderWidth || y >= height - borderWidth) {
        r = 255;
        g = 215;
        b = 0; // Shiny gold
      }

      // Drawing Candlesticks / Bars in center
      // 1. Bearish Candle (Red) on the left
      const c1XStart = Math.floor(width * 0.28);
      const c1XEnd = Math.floor(width * 0.38);
      const c1BodyYStart = Math.floor(height * 0.45);
      const c1BodyYEnd = Math.floor(height * 0.65);
      const c1WickYStart = Math.floor(height * 0.35);
      const c1WickYEnd = Math.floor(height * 0.75);
      const c1CenterX = Math.floor((c1XStart + c1XEnd) / 2);

      // 2. Bullish Gold Candle in the middle
      const c2XStart = Math.floor(width * 0.45);
      const c2XEnd = Math.floor(width * 0.55);
      const c2BodyYStart = Math.floor(height * 0.30);
      const c2BodyYEnd = Math.floor(height * 0.60);
      const c2WickYStart = Math.floor(height * 0.20);
      const c2WickYEnd = Math.floor(height * 0.70);
      const c2CenterX = Math.floor((c2XStart + c2XEnd) / 2);

      // 3. Bullish Candle (Green) on the right
      const c3XStart = Math.floor(width * 0.62);
      const c3XEnd = Math.floor(width * 0.72);
      const c3BodyYStart = Math.floor(height * 0.20);
      const c3BodyYEnd = Math.floor(height * 0.45);
      const c3WickYStart = Math.floor(height * 0.12);
      const c3WickYEnd = Math.floor(height * 0.55);
      const c3CenterX = Math.floor((c3XStart + c3XEnd) / 2);

      // Draw Candlestick 1 (Bearish Red)
      if (x === c1CenterX && y >= c1WickYStart && y <= c1WickYEnd) {
        r = 239; g = 68; b = 68;
      }
      if (x >= c1XStart && x <= c1XEnd && y >= c1BodyYStart && y <= c1BodyYEnd) {
        r = 239; g = 68; b = 68;
      }

      // Draw Candlestick 2 (Bullish Gold)
      if (x === c2CenterX && y >= c2WickYStart && y <= c2WickYEnd) {
        r = 255; g = 204; b = 0;
      }
      if (x >= c2XStart && x <= c2XEnd && y >= c2BodyYStart && y <= c2BodyYEnd) {
        // Gold gradient effect
        const factor = (y - c2BodyYStart) / (c2BodyYEnd - c2BodyYStart);
        r = Math.floor(255 - factor * 20);
        g = Math.floor(226 - factor * 50);
        b = Math.floor(89 - factor * 50);
      }

      // Draw Candlestick 3 (Bullish Green)
      if (x === c3CenterX && y >= c3WickYStart && y <= c3WickYEnd) {
        r = 34; g = 197; b = 94;
      }
      if (x >= c3XStart && x <= c3XEnd && y >= c3BodyYStart && y <= c3BodyYEnd) {
        r = 34; g = 197; b = 94;
      }

      rawPixelData[idx] = r;
      rawPixelData[idx + 1] = g;
      rawPixelData[idx + 2] = b;
    }
  }

  const idatData = zlib.deflateSync(rawPixelData);
  const idatChunk = createChunk('IDAT', idatData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate the icons and write them to public/
const publicDir = path.join(process.cwd(), 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'gold-icon-192.png'), generateIconPng(192, 192));
fs.writeFileSync(path.join(publicDir, 'gold-icon-512.png'), generateIconPng(512, 512));

console.log('Successfully generated gold-icon-192.png and gold-icon-512.png!');
