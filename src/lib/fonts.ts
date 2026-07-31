import { Inter } from "next/font/google";

/**
 * Site UI font.
 *
 * Onest (the previous face) only ships basic Cyrillic — Russian looks fine,
 * but Kazakh letters Ә Ғ Қ Ң Ө Ұ Ү Һ fall back to a system font and look
 * mismatched. Inter includes those glyphs in `cyrillic-ext` and still covers
 * full Russian + Latin.
 */
export const siteFont = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic", "cyrillic-ext"],
  weight: ["400", "500", "600", "700", "800"],
});
