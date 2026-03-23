function writeUint32BE(target: Uint8Array, offset: number, value: number) {
  target[offset] = (value >>> 24) & 0xff;
  target[offset + 1] = (value >>> 16) & 0xff;
  target[offset + 2] = (value >>> 8) & 0xff;
  target[offset + 3] = value & 0xff;
}

function makeCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[n] = c >>> 0;
  }
  return table;
}

const CRC_TABLE = makeCrcTable();

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i += 1) {
    const index = (crc ^ bytes[i]) & 0xff;
    crc = (CRC_TABLE[index] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function buildPhysChunk(dpi: number): Uint8Array {
  const ppm = Math.max(1, Math.round(dpi / 0.0254));
  const length = 9;
  const chunk = new Uint8Array(4 + 4 + length + 4);
  const type = new TextEncoder().encode("pHYs");
  const dataOffset = 8;

  writeUint32BE(chunk, 0, length);
  chunk.set(type, 4);
  writeUint32BE(chunk, dataOffset, ppm);
  writeUint32BE(chunk, dataOffset + 4, ppm);
  chunk[dataOffset + 8] = 1; // meters

  const crcBytes = new Uint8Array(4 + length);
  crcBytes.set(type, 0);
  crcBytes.set(chunk.slice(dataOffset, dataOffset + length), 4);
  writeUint32BE(chunk, dataOffset + length, crc32(crcBytes));

  return chunk;
}

function injectDpiChunk(pngBytes: Uint8Array, dpi: number): Uint8Array {
  if (dpi <= 0 || !Number.isFinite(dpi)) {
    return pngBytes;
  }

  // PNG signature is 8 bytes, first chunk is expected to be IHDR.
  if (pngBytes.length < 33) {
    return pngBytes;
  }

  const ihdrLength =
    (pngBytes[8] << 24) |
    (pngBytes[9] << 16) |
    (pngBytes[10] << 8) |
    pngBytes[11];
  const insertAt = 8 + 12 + ihdrLength;
  if (insertAt > pngBytes.length) {
    return pngBytes;
  }

  const physChunk = buildPhysChunk(dpi);
  const result = new Uint8Array(pngBytes.length + physChunk.length);
  result.set(pngBytes.slice(0, insertAt), 0);
  result.set(physChunk, insertAt);
  result.set(pngBytes.slice(insertAt), insertAt + physChunk.length);
  return result;
}

export async function createPngBlob(
  canvas: HTMLCanvasElement,
  dpi: number = 300,
): Promise<Blob> {
  const baseBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error("Failed to create PNG blob from canvas."));
      }
    }, "image/png");
  });

  const bytes = new Uint8Array(await baseBlob.arrayBuffer());
  const withDpi = injectDpiChunk(bytes, dpi);
  const blobBytes = new Uint8Array(withDpi.byteLength);
  blobBytes.set(withDpi);
  return new Blob([blobBytes.buffer], { type: "image/png" });
}
