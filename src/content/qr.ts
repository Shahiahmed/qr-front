import type { Locale } from "@/content/landing";

/**
 * QR constructor option lists. Kept out of the component the same way theme and
 * layout presets are (see themes.ts / layouts.ts) — the enum keys mirror the
 * `qr-code-styling` library, the labels are bilingual UI text.
 *
 * Types are local string unions on purpose: importing them from the library
 * would pull its node-only `jsdom`/`canvas` type graph into a content module.
 */
export type QrDotStyle = "square" | "rounded" | "dots" | "classy" | "extra-rounded";
export type QrCornerStyle = "square" | "dot" | "extra-rounded";

type Option<T extends string> = { key: T; ru: string; kk: string };

export const QR_DOT_STYLES: Option<QrDotStyle>[] = [
  { key: "rounded", ru: "Скруглённые", kk: "Дөңгеленген" },
  { key: "square", ru: "Квадраты", kk: "Шаршылар" },
  { key: "dots", ru: "Точки", kk: "Нүктелер" },
  { key: "classy", ru: "Резные", kk: "Өрнекті" },
  { key: "extra-rounded", ru: "Мягкие", kk: "Жұмсақ" },
];

export const QR_CORNER_STYLES: Option<QrCornerStyle>[] = [
  { key: "extra-rounded", ru: "Скруглённые", kk: "Дөңгеленген" },
  { key: "square", ru: "Квадрат", kk: "Шаршы" },
  { key: "dot", ru: "Круг", kk: "Дөңгелек" },
];

export type QrColorPreset = { key: string; ru: string; kk: string; dots: string; bg: string };

/** Quick-pick palettes. Dark modules on a light background always scan best. */
export const QR_COLOR_PRESETS: QrColorPreset[] = [
  { key: "ink", ru: "Классика", kk: "Классика", dots: "#141210", bg: "#ffffff" },
  { key: "forest", ru: "Лес", kk: "Орман", dots: "#1f6f4a", bg: "#ffffff" },
  { key: "berry", ru: "Ягода", kk: "Жидек", dots: "#7c2d5a", bg: "#ffffff" },
  { key: "ocean", ru: "Океан", kk: "Мұхит", dots: "#1d4e89", bg: "#ffffff" },
  { key: "sunset", ru: "Закат", kk: "Батқан күн", dots: "#b4451f", bg: "#fff7ed" },
];

export const DEFAULT_QR_STYLE = {
  dotStyle: "rounded" as QrDotStyle,
  cornerStyle: "extra-rounded" as QrCornerStyle,
  dotColor: "#141210",
  bgColor: "#ffffff",
};

export function optionLabel<T extends string>(
  options: Option<T>[],
  key: T,
  locale: Locale,
): string {
  const found = options.find((option) => option.key === key);
  if (!found) return "";
  return locale === "kz" ? found.kk : found.ru;
}
