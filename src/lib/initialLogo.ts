/**
 * First letter of a venue name for the stock logo (same idea as `/m/demo`).
 * Skips leading punctuation so ««Восток»» still yields «В».
 */
export function venueInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";

  const match = trimmed.match(/[\p{L}\p{N}]/u);
  const character = match?.[0] ?? trimmed.charAt(0);

  return character.toLocaleUpperCase("ru-RU");
}

/**
 * Inline SVG emblem: dark disc, gold ring, initial — matches the demo logo.
 * Used as an `<img src>` until the owner uploads a real file.
 */
export function initialLogoDataUrl(name: string): string {
  const letter = venueInitial(name)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">` +
    `<rect width="100" height="100" rx="22" fill="#161616"/>` +
    `<circle cx="50" cy="50" r="38" fill="none" stroke="#d8a24a" stroke-width="3"/>` +
    `<text x="50" y="63" font-family='Georgia, "Times New Roman", serif' font-size="40" font-weight="700" fill="#d8a24a" text-anchor="middle">${letter}</text>` +
    `</svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
