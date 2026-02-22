export function parseHex(hex) {
  if (typeof hex !== "string") {
    return null;
  }

  let normalized = hex.trim().replace("#", "");
  if (normalized.length === 3) {
    normalized = normalized
      .split("")
      .map((char) => `${char}${char}`)
      .join("");
  }

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return null;
  }

  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  };
}

export function withAlpha(hex, alpha) {
  const rgb = parseHex(hex);
  if (!rgb) {
    return `rgba(0, 0, 0, ${alpha})`;
  }

  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function blendHex(hexA, hexB, weight = 0.5) {
  const a = parseHex(hexA);
  const b = parseHex(hexB);
  if (!a && !b) {
    return "#888888";
  }
  if (!a) {
    return hexB;
  }
  if (!b) {
    return hexA;
  }

  const t = Math.min(Math.max(weight, 0), 1);
  const mix = (from, to) => Math.round(from * (1 - t) + to * t);
  const r = mix(a.r, b.r).toString(16).padStart(2, "0");
  const g = mix(a.g, b.g).toString(16).padStart(2, "0");
  const bChannel = mix(a.b, b.b).toString(16).padStart(2, "0");

  return `#${r}${g}${bChannel}`;
}
