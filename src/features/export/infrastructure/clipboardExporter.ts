/**
 * Copies an HTML canvas to the system clipboard as a PNG image.
 *
 * Requires the Clipboard API with `ClipboardItem` support (Chrome 66+, Edge 79+,
 * Safari 13.1+). Firefox does not yet support writing images via the Clipboard API.
 */
export async function copyCanvasToClipboard(
  canvas: HTMLCanvasElement,
): Promise<void> {
  if (!navigator.clipboard?.write) {
    throw new Error(
      "Clipboard API is not supported in this browser. Try Chrome, Edge, or Safari.",
    );
  }

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Failed to create image from canvas."))),
      "image/png",
    );
  });

  await navigator.clipboard.write([
    new ClipboardItem({ "image/png": blob }),
  ]);
}
