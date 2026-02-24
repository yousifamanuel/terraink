function slugifyCity(value) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "city";
}

function createTimestamp() {
  const date = new Date();
  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

function normalizeExtension(value) {
  const trimmed = String(value ?? "png").trim().toLowerCase();
  return trimmed || "png";
}

function base64ToBytes(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function normalizePositiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function formatPdfNumber(value) {
  const rounded = Number(value.toFixed(3));
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

export function createPosterFilename(cityOrLocation, themeId, extension = "png") {
  const citySlug = slugifyCity(cityOrLocation);
  const normalizedExtension = normalizeExtension(extension);
  return `${citySlug}_${themeId}_${createTimestamp()}.${normalizedExtension}`;
}

export function triggerDownloadBlob(blob, filename) {
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function createPdfBlobFromCanvas(canvas, options = {}) {
  const imageWidth = Math.max(1, Math.round(Number(canvas?.width) || 1));
  const imageHeight = Math.max(1, Math.round(Number(canvas?.height) || 1));
  const widthCm = normalizePositiveNumber(options.widthCm, 20);
  const heightCm = normalizePositiveNumber(options.heightCm, 30);
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
  const chunks = [];
  const objectOffsets = [0];
  let byteLength = 0;

  function append(part) {
    const bytes = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(bytes);
    byteLength += bytes.length;
  }

  function writeObject(objectId, dictionary, streamBytes = null) {
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
  writeObject(
    5,
    `<< /Length ${contentBytes.length} >>`,
    contentBytes,
  );

  const xrefStart = byteLength;
  append("xref\n0 6\n");
  append("0000000000 65535 f \n");
  for (let objectId = 1; objectId <= 5; objectId += 1) {
    append(`${String(objectOffsets[objectId]).padStart(10, "0")} 00000 n \n`);
  }
  append("trailer\n<< /Size 6 /Root 1 0 R >>\n");
  append(`startxref\n${xrefStart}\n%%EOF`);

  return new Blob(chunks, { type: "application/pdf" });
}
