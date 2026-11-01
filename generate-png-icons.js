const fs = require('fs');
const zlib = require('zlib');

// Minimal PNG generator using Node's built-in zlib
function createPNG(size, primaryColor, accentColor, text) {
  const width = size;
  const height = size;
  
  // Create RGBA raw pixels buffer
  const rowSize = width * 4 + 1; // 1 filter byte per row
  const rawBuffer = Buffer.alloc(rowSize * height);

  const [pr, pg, pb] = primaryColor;
  const [ar, ag, ab] = accentColor;
  const radius = size * 0.22;
  const center = size / 2;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawBuffer[rowOffset] = 0; // Filter type 0 (None)

    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 4;

      // Rounded rect distance
      const dx = Math.max(0, Math.abs(x - center) - (center - radius));
      const dy = Math.max(0, Math.abs(y - center) - (center - radius));
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > radius) {
        // Transparent outside rounded corner
        rawBuffer[pixelOffset] = 0;
        rawBuffer[pixelOffset + 1] = 0;
        rawBuffer[pixelOffset + 2] = 0;
        rawBuffer[pixelOffset + 3] = 0;
      } else {
        // Inner calendar card simulation
        const isHeader = y >= size * 0.2 && y <= size * 0.38 && x >= size * 0.15 && x <= size * 0.85;
        const isBody = y > size * 0.38 && y <= size * 0.85 && x >= size * 0.15 && x <= size * 0.85;

        if (isHeader) {
          rawBuffer[pixelOffset] = 220; // Red
          rawBuffer[pixelOffset + 1] = 38;
          rawBuffer[pixelOffset + 2] = 38;
          rawBuffer[pixelOffset + 3] = 255;
        } else if (isBody) {
          // White card with some colored dot patterns
          rawBuffer[pixelOffset] = 255;
          rawBuffer[pixelOffset + 1] = 255;
          rawBuffer[pixelOffset + 2] = 255;
          rawBuffer[pixelOffset + 3] = 255;

          // Add a blue strip in the middle representing GP leave
          if (y >= size * 0.52 && y <= size * 0.62 && x >= size * 0.35 && x <= size * 0.75) {
            rawBuffer[pixelOffset] = 37;  // Blue
            rawBuffer[pixelOffset + 1] = 99;
            rawBuffer[pixelOffset + 2] = 235;
          }
          // Add an orange dot representing festival
          const fdx = x - size * 0.65;
          const fdy = y - size * 0.72;
          if (fdx * fdx + fdy * fdy <= (size * 0.05) * (size * 0.05)) {
            rawBuffer[pixelOffset] = 249; // Orange
            rawBuffer[pixelOffset + 1] = 115;
            rawBuffer[pixelOffset + 2] = 22;
          }
        } else {
          // Deep blue background gradient
          const gradFactor = y / height;
          rawBuffer[pixelOffset] = Math.round(pr * (1 - gradFactor * 0.3));
          rawBuffer[pixelOffset + 1] = Math.round(pg * (1 - gradFactor * 0.3));
          rawBuffer[pixelOffset + 2] = Math.round(pb * (1 - gradFactor * 0.2) + 20 * gradFactor);
          rawBuffer[pixelOffset + 3] = 255;
        }
      }
    }
  }

  // Deflate compressed data
  const compressedData = zlib.deflateSync(rawBuffer);

  // Helper CRC32
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = data.length;
    const buf = Buffer.alloc(12 + len);
    buf.writeUInt32BE(len, 0);
    buf.write(type, 4, 4, 'ascii');
    data.copy(buf, 8);
    const crcVal = crc32(buf.subarray(4, 8 + len));
    buf.writeUInt32BE(crcVal, 8 + len);
    return buf;
  }

  // PNG Header
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA (6)
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT
  const idatChunk = makeChunk('IDAT', compressedData);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const deepBlue = [12, 59, 130];
const gold = [245, 158, 11];

fs.writeFileSync('icon-192.png', createPNG(192, deepBlue, gold, 'BIT'));
fs.writeFileSync('icon-512.png', createPNG(512, deepBlue, gold, 'BIT'));
console.log('Successfully generated icon-192.png and icon-512.png');

