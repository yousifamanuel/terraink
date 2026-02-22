export function parseLocationParts(value) {
  const parts = String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (parts.length === 0) {
    return { city: "", country: "" };
  }

  if (parts.length === 1) {
    return { city: parts[0], country: "" };
  }

  return {
    city: parts[0],
    country: parts[parts.length - 1],
  };
}
