/** Language the guest reads the menu in. Kazakh is `kk`, matching the API. */
export type GuestLocale = "ru" | "kk";

export type GuestCopy = {
  soldOut: string;
  emptyMenu: string;
  notFoundTitle: string;
  notFoundText: string;
  languageAria: string;
  sectionsAria: string;
  // Ordering (guest builds an order right at the table)
  add: string;
  addAria: string;
  removeAria: string;
  orderBar: string;
  cartTitle: string;
  cartEmpty: string;
  cartTotal: string;
  cartTableLabel: string;
  cartTablePlaceholder: string;
  checkout: string;
  close: string;
  placedTitle: string;
  placedText: string;
  placedTable: string;
  demoNote: string;
  done: string;
};

export const guestByLocale: Record<GuestLocale, GuestCopy> = {
  ru: {
    soldOut: "Закончилось",
    emptyMenu: "Меню пока пустое.",
    notFoundTitle: "Меню не найдено",
    notFoundText: "Проверьте адрес или отсканируйте код ещё раз.",
    languageAria: "Выбор языка",
    sectionsAria: "Разделы меню",
    add: "В заказ",
    addAria: "Добавить в заказ",
    removeAria: "Убрать из заказа",
    orderBar: "Заказать",
    cartTitle: "Ваш заказ",
    cartEmpty: "В заказе пока ничего нет.",
    cartTotal: "Итого",
    cartTableLabel: "Номер стола",
    cartTablePlaceholder: "например, 12",
    checkout: "Оформить заказ",
    close: "Закрыть",
    placedTitle: "Заказ отправлен!",
    placedText: "Официант уже увидел его и скоро подойдёт.",
    placedTable: "Стол",
    demoNote: "Это демонстрация — заказ никуда не отправляется.",
    done: "Готово",
  },
  kk: {
    soldOut: "Бітті",
    emptyMenu: "Мәзір әзірге бос.",
    notFoundTitle: "Мәзір табылмады",
    notFoundText: "Мекенжайды тексеріңіз немесе кодты қайта сканерлеңіз.",
    languageAria: "Тілді таңдау",
    sectionsAria: "Мәзір бөлімдері",
    add: "Тапсырысқа",
    addAria: "Тапсырысқа қосу",
    removeAria: "Тапсырыстан алу",
    orderBar: "Тапсырыс беру",
    cartTitle: "Сіздің тапсырысыңыз",
    cartEmpty: "Тапсырыста әзірге ештеңе жоқ.",
    cartTotal: "Барлығы",
    cartTableLabel: "Үстел нөмірі",
    cartTablePlaceholder: "мысалы, 12",
    checkout: "Тапсырыс беру",
    close: "Жабу",
    placedTitle: "Тапсырыс жіберілді!",
    placedText: "Даяшы оны көрді, жақын арада келеді.",
    placedTable: "Үстел",
    demoNote: "Бұл демо — тапсырыс ешқайда жіберілмейді.",
    done: "Дайын",
  },
};
