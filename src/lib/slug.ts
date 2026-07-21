/**
 * Turns a venue name into a URL-safe slug.
 *
 * Venue names here are Russian or Kazakh, so stripping non-latin characters
 * would leave nothing at all — «Восточный дворик» has to come out as
 * `vostochnyy-dvorik`, not an empty string. Kazakh-specific letters are
 * mapped ahead of the Russian table because several of them share a base
 * glyph with a diacritic (ә, ғ, қ, ң, ө, ұ, ү, һ, і).
 */
const MAP: Record<string, string> = {
  // Kazakh
  ә: "a", ғ: "g", қ: "q", ң: "n", ө: "o", ұ: "u", ү: "u", һ: "h", і: "i",
  // Russian
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh",
  щ: "sch", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya",
};

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((char) => (char in MAP ? MAP[char] : char))
    .join("")
    // Anything still outside the safe set becomes a separator.
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
    // A trailing hyphen can reappear after the length cut.
    .replace(/-+$/g, "");
}
