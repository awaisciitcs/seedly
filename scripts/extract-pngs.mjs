import fs from 'node:fs';

// CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf, start = 0, end = buf.length) {
  let c = 0xffffffff;
  for (let i = start; i < end; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(typeStr, dataBuf) {
  const typeBuf = Buffer.from(typeStr, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(dataBuf.length, 0);

  const toCrc = Buffer.concat([typeBuf, dataBuf]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, toCrc, crcBuf]);
}

function extractImageFromPdf(pdfPath, outPngPath) {
  const buf = fs.readFileSync(pdfPath);
  
  // Find /Subtype /Image
  const imgToken = Buffer.from('/Subtype /Image');
  const imgPos = buf.indexOf(imgToken);
  if (imgPos === -1) {
    throw new Error('No /Subtype /Image found in ' + pdfPath);
  }

  // Find stream after /Subtype /Image
  const streamIdx = buf.indexOf(Buffer.from('stream\r\n'), imgPos);
  const altStreamIdx = streamIdx === -1 ? buf.indexOf(Buffer.from('stream\n'), imgPos) : streamIdx;
  const isCrlf = streamIdx !== -1;
  const streamStart = isCrlf ? streamIdx + 8 : altStreamIdx + 7;

  const endStreamIdx = buf.indexOf(Buffer.from('endstream'), streamStart);
  if (streamStart === -1 || endStreamIdx === -1) {
    throw new Error('Could not find image stream in ' + pdfPath);
  }

  // Parse header before stream
  const headerBuf = buf.subarray(imgPos - 200, streamStart);
  const headerStr = headerBuf.toString('latin1');
  
  const widthMatch = headerStr.match(/\/Width\s+(\d+)/);
  const heightMatch = headerStr.match(/\/Height\s+(\d+)/);

  if (!widthMatch || !heightMatch) {
    throw new Error('Could not find Width/Height in image header: ' + headerStr);
  }

  const width = parseInt(widthMatch[1], 10);
  const height = parseInt(heightMatch[1], 10);
  console.log(`Found image in ${pdfPath}: ${width}x${height}`);

  const idatData = buf.subarray(streamStart, endStreamIdx);

  // Build PNG
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8 bits per component
  ihdrData.writeUInt8(2, 9); // Color type 2 (RGB)
  ihdrData.writeUInt8(0, 10); // Compression method 0
  ihdrData.writeUInt8(0, 11); // Filter method 0
  ihdrData.writeUInt8(0, 12); // Interlace method 0

  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', idatData);
  const iendChunk = Buffer.from([0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82]);

  const pngBuf = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.writeFileSync(outPngPath, pngBuf);
  console.log(`Saved ${outPngPath} (${pngBuf.length} bytes)`);
}

try {
  extractImageFromPdf('f:/Seedly/design-ref/homepage.pdf', 'f:/Seedly/design-ref/homepage.png');
  extractImageFromPdf('f:/Seedly/design-ref/shop-all.pdf', 'f:/Seedly/design-ref/shop-all.png');
  console.log('Successfully extracted both PNG reference designs!');
} catch (e) {
  console.error('Error extracting images:', e);
}
