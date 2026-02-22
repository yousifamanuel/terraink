export async function ensureGoogleFont(fontFamily) {
  const family = String(fontFamily ?? "").trim();
  if (!family) {
    return;
  }

  const linkId = `font-${family.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement("link");
    link.id = linkId;
    link.rel = "stylesheet";
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(
      family,
    ).replace(/%20/g, "+")}:wght@300;400;700&display=swap`;
    document.head.appendChild(link);
  }

  if (document.fonts?.load) {
    await Promise.allSettled([
      document.fonts.load(`300 16px "${family}"`),
      document.fonts.load(`400 16px "${family}"`),
      document.fonts.load(`700 16px "${family}"`),
    ]);
  }
}
