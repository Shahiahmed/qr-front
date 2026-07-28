/** Language the guest reads the menu in. Kazakh is `kk`, matching the API. */
export type GuestLocale = "ru" | "kk";

export type GuestCopy = {
  soldOut: string;
  emptyMenu: string;
  notFoundTitle: string;
  notFoundText: string;
  languageAria: string;
  sectionsAria: string;
  // Venue info — icons carry the meaning; these are for a11y / tooltips
  wifiNetworkAria: string;
  wifiPasswordAria: string;
  wifiCopied: string;
  phoneAria: string;
  instagramAria: string;
  facebookAria: string;
  tiktokAria: string;
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
  /** Demo-only honesty line under the ticket. */
  demoNote: string;
  /** Real menus: order stays on this phone for the waiter to read. */
  localNote: string;
  showTicket: string;
  ticketEmpty: string;
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
    wifiNetworkAria: "Wi‑Fi сеть",
    wifiPasswordAria: "Скопировать пароль Wi‑Fi",
    wifiCopied: "Скопировано",
    phoneAria: "Позвонить",
    instagramAria: "Instagram",
    facebookAria: "Facebook",
    tiktokAria: "TikTok",
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
    placedTitle: "Покажите официанту",
    placedText: "Заказ сохранён на этом телефоне — передайте экран официанту.",
    placedTable: "Стол",
    demoNote: "Это демонстрация — заказ никуда не отправляется.",
    localNote: "Пока без сервера: заказ виден только на этом устройстве.",
    showTicket: "Показать заказ",
    ticketEmpty: "В заказе ничего нет.",
    done: "Готово",
  },
  kk: {
    soldOut: "Бітті",
    emptyMenu: "Мәзір әзірге бос.",
    notFoundTitle: "Мәзір табылмады",
    notFoundText: "Мекенжайды тексеріңіз немесе кодты қайта сканерлеңіз.",
    languageAria: "Тілді таңдау",
    sectionsAria: "Мәзір бөлімдері",
    wifiNetworkAria: "Wi‑Fi желісі",
    wifiPasswordAria: "Wi‑Fi құпия сөзін көшіру",
    wifiCopied: "Көшірілді",
    phoneAria: "Қоңырау шалу",
    instagramAria: "Instagram",
    facebookAria: "Facebook",
    tiktokAria: "TikTok",
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
    placedTitle: "Даяшыға көрсетіңіз",
    placedText: "Тапсырыс осы телефонда сақталды — экранды даяшыға беріңіз.",
    placedTable: "Үстел",
    demoNote: "Бұл демо — тапсырыс ешқайда жіберілмейді.",
    localNote: "Әзірге серверсіз: тапсырыс тек осы құрылғыда көрінеді.",
    showTicket: "Тапсырысты көрсету",
    ticketEmpty: "Тапсырыста ештеңе жоқ.",
    done: "Дайын",
  },
};
