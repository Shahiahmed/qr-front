import type { CSSProperties } from "react";

/**
 * Colour presets for a guest menu.
 *
 * Only the accent family is themed — background and text stay the app default —
 * so an owner cannot pick a combination that makes the menu unreadable. Each
 * preset overrides the same CSS variables the guest components already use
 * (`--accent`, `--accent-hover`, `--accent-soft`, `--accent-tint`), so applying
 * a theme is just setting those on the menu's root element.
 *
 * Keys must match `Establishment::THEMES` on the backend.
 */

export type ThemeKey =
  | "classic"
  | "graphite"
  | "forest"
  | "ocean"
  | "berry"
  | "sand"
  | "rose"
  | "midnight";

export type MenuTheme = {
  key: ThemeKey;
  labelRu: string;
  labelKk: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  accentTint: string;
};

export const DEFAULT_THEME: ThemeKey = "classic";

export const MENU_THEMES: MenuTheme[] = [
  {
    key: "classic",
    labelRu: "Классический",
    labelKk: "Классикалық",
    accent: "#ff6a4d",
    accentHover: "#ee5233",
    accentSoft: "#fff1ec",
    accentTint: "#ffe3d9",
  },
  {
    key: "graphite",
    labelRu: "Графит",
    labelKk: "Графит",
    accent: "#3f4753",
    accentHover: "#2b313a",
    accentSoft: "#eef0f3",
    accentTint: "#dfe3e9",
  },
  {
    key: "forest",
    labelRu: "Лес",
    labelKk: "Орман",
    accent: "#1f9d57",
    accentHover: "#178048",
    accentSoft: "#e8f6ee",
    accentTint: "#cdebd9",
  },
  {
    key: "ocean",
    labelRu: "Океан",
    labelKk: "Мұхит",
    accent: "#2b8fd6",
    accentHover: "#1f76b8",
    accentSoft: "#e7f2fb",
    accentTint: "#cbe4f6",
  },
  {
    key: "berry",
    labelRu: "Ягода",
    labelKk: "Жидек",
    accent: "#c2417f",
    accentHover: "#a52f68",
    accentSoft: "#fbe9f2",
    accentTint: "#f4cfe0",
  },
  {
    key: "sand",
    labelRu: "Песок",
    labelKk: "Құм",
    accent: "#a9761f",
    accentHover: "#8c6015",
    accentSoft: "#f7efdd",
    accentTint: "#ecdcb9",
  },
  {
    key: "rose",
    labelRu: "Роза",
    labelKk: "Раушан",
    accent: "#e05a72",
    accentHover: "#c8465e",
    accentSoft: "#fdeaee",
    accentTint: "#f8ccd5",
  },
  {
    key: "midnight",
    labelRu: "Полночь",
    labelKk: "Түнгі",
    accent: "#5b60d6",
    accentHover: "#474cc0",
    accentSoft: "#ecedfb",
    accentTint: "#d5d7f5",
  },
];

const BY_KEY = new Map(MENU_THEMES.map((theme) => [theme.key, theme]));

export function getTheme(key?: string | null): MenuTheme {
  return (key && BY_KEY.get(key as ThemeKey)) || BY_KEY.get(DEFAULT_THEME)!;
}

/**
 * CSS-variable overrides for a theme, ready to spread into a `style` prop. The
 * custom properties cascade to every child, so the whole menu subtree recolours
 * without touching the global tokens.
 */
export function themeVars(key?: string | null): CSSProperties {
  const theme = getTheme(key);

  return {
    "--accent": theme.accent,
    "--accent-hover": theme.accentHover,
    "--accent-soft": theme.accentSoft,
    "--accent-tint": theme.accentTint,
  } as CSSProperties;
}
