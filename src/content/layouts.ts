/**
 * Menu layout presets — how the guest menu arranges dishes, separate from the
 * colour theme (content/themes.ts). The theme recolours; the layout rearranges.
 *
 * Keys must match `Establishment::LAYOUTS` on the backend.
 *
 * - classic — photo-left cards, one per row (the original look).
 * - grid    — photo-forward two-column grid, image on top. Best with photos.
 * - compact — dense text-first list, small thumbnails, divider lines. Best for
 *             large menus or venues without dish photos.
 */

export type LayoutKey = "classic" | "grid" | "compact";

export type MenuLayout = {
  key: LayoutKey;
  labelRu: string;
  labelKk: string;
  descRu: string;
  descKk: string;
};

export const DEFAULT_LAYOUT: LayoutKey = "classic";

export const MENU_LAYOUTS: MenuLayout[] = [
  {
    key: "classic",
    labelRu: "Классический",
    labelKk: "Классикалық",
    descRu: "Карточки с фото слева",
    descKk: "Фотосы сол жақта карточкалар",
  },
  {
    key: "grid",
    labelRu: "Плитка",
    labelKk: "Тор",
    descRu: "Две колонки, фото сверху",
    descKk: "Екі баған, фото жоғарыда",
  },
  {
    key: "compact",
    labelRu: "Компактный",
    labelKk: "Ықшам",
    descRu: "Плотный список, крупный текст",
    descKk: "Тығыз тізім, ірі мәтін",
  },
];

const KEYS = new Set<string>(MENU_LAYOUTS.map((layout) => layout.key));

/** Coerce an arbitrary/absent value to a known layout key. */
export function getLayout(key?: string | null): LayoutKey {
  return key && KEYS.has(key) ? (key as LayoutKey) : DEFAULT_LAYOUT;
}
