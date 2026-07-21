/** Language the guest reads the menu in. Kazakh is `kk`, matching the API. */
export type GuestLocale = "ru" | "kk";

export type GuestCopy = {
  soldOut: string;
  emptyMenu: string;
  notFoundTitle: string;
  notFoundText: string;
  languageAria: string;
  sectionsAria: string;
};

export const guestByLocale: Record<GuestLocale, GuestCopy> = {
  ru: {
    soldOut: "Закончилось",
    emptyMenu: "Меню пока пустое.",
    notFoundTitle: "Меню не найдено",
    notFoundText: "Проверьте адрес или отсканируйте код ещё раз.",
    languageAria: "Выбор языка",
    sectionsAria: "Разделы меню",
  },
  kk: {
    soldOut: "Бітті",
    emptyMenu: "Мәзір әзірге бос.",
    notFoundTitle: "Мәзір табылмады",
    notFoundText: "Мекенжайды тексеріңіз немесе кодты қайта сканерлеңіз.",
    languageAria: "Тілді таңдау",
    sectionsAria: "Мәзір бөлімдері",
  },
};
