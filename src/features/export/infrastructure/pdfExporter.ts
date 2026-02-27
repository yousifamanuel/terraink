import type { ExportOptions } from "../domain/types";

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function normalizePositiveNumber(value: number, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatPdfNumber(value: number): string {
  const rounded = Number(value.toFixed(3));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function createPdfBlobFromCanvas(
  canvas: HTMLCanvasElement,
  options: Partial<ExportOptions> = {},
): Blob {
  const imageWidth = Math.max(1, Math.round(Number(canvas?.width) || 1));
  const imageHeight = Math.max(1, Math.round(Number(canvas?.height) || 1));
  const widthCm = normalizePositiveNumber(options.widthCm ?? 20, 20);
  const heightCm = normalizePositiveNumber(options.heightCm ?? 30, 30);
  const pageWidthPt = (widthCm / 2.54) * 72;
  const pageHeightPt = (heightCm / 2.54) * 72;

  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.94);
  const base64 = jpegDataUrl.split(",")[1] || "";
  const imageBytes = base64ToBytes(base64);

  const contentStream = [
    "q",
    `${formatPdfNumber(pageWidthPt)} 0 0 ${formatPdfNumber(pageHeightPt)} 0 0 cm`,
    "/Im0 Do",
    "Q",
  ].join("\n");

  const encoder = new TextEncoder();
  const contentBytes = encoder.encode(contentStream);
  const chunks: Uint8Array[] = [];
  const objectOffsets: number[] = [0];
  let byteLength = 0;

  function append(part: string | Uint8Array): void {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    byteLength += bytes.length;
  }

  function writeObject(
    objectId: number,
    dictionary: string,
    streamBytes: Uint8Array | null = null,
  ): void {
    objectOffsets[objectId] = byteLength;
    append(`${objectId} 0 obj\n`);
    if (streamBytes) {
      append(`${dictionary}\nstream\n`);
      append(streamBytes);
      append("\nendstream\nendobj\n");
      return;
    }
    append(`${dictionary}\nendobj\n`);
  }

  append("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n");

  writeObject(1, "<< /Type /Catalog /Pages 2 0 R >>");
  writeObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  writeObject(
    3,
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageWidthPt)} ${formatPdfNumber(pageHeightPt)}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
  );
  writeObject(
    4,
    `<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>`,
    imageBytes,
  );
  writeObject(5, `<< /Length ${contentBytes.length} >>`, contentBytes);

  const xrefStart = byteLength;
  append("xref\n0 6\n");
  append("0000000000 65535 f \n");
  for (let objectId = 1; objectId <= 5; objectId += 1) {
    append(`${String(objectOffsets[objectId]).padStart(10, "0")} 00000 n \n`);
  }
  append("trailer\n<< /Size 6 /Root 1 0 R >>\n");
  append(`startxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks as BlobPart[], { type: "application/pdf" });
}
