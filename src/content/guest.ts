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
  /** Order stays on this phone for the waiter to read (no API yet). */
  localNote: string;
  showTicket: string;
  ticketEmpty: string;
  done: string;
  // Bottom navigation + guest-chosen look (colour + layout)
  navMenu: string;
  navCart: string;
  navSettings: string;
  settingsTitle: string;
  settingsHint: string;
  settingsColor: string;
  settingsDesign: string;
  // Call the waiter (Telegram) — bottom-bar button + its sheet
  navWaiter: string;
  waiterTitle: string;
  waiterHint: string;
  waiterReasonWaiter: string;
  waiterReasonBill: string;
  waiterReasonHelp: string;
  waiterTableLabel: string;
  waiterTablePlaceholder: string;
  waiterSent: string;
  waiterError: string;
  /** Tiny brand credit under the menu. */
  poweredBy: string;
  poweredByAria: string;
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
    localNote: "Пока без сервера: заказ виден только на этом устройстве.",
    showTicket: "Показать заказ",
    ticketEmpty: "В заказе ничего нет.",
    done: "Готово",
    navMenu: "Меню",
    navCart: "Корзина",
    navSettings: "Настройки",
    settingsTitle: "Настройки меню",
    settingsHint: "Оформление под себя — только на этом устройстве.",
    settingsColor: "Цвет",
    settingsDesign: "Дизайн",
    navWaiter: "Официант",
    waiterTitle: "Позвать официанта",
    waiterHint: "Официант получит уведомление и подойдёт.",
    waiterReasonWaiter: "Позвать официанта",
    waiterReasonBill: "Счёт",
    waiterReasonHelp: "Нужна помощь",
    waiterTableLabel: "Номер стола",
    waiterTablePlaceholder: "например, 12",
    waiterSent: "Официант уже идёт",
    waiterError: "Не удалось отправить. Попробуйте ещё раз.",
    poweredBy: "Сделано на QR меню",
    poweredByAria: "QR меню — QR-меню для ресторанов",
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
    localNote: "Әзірге серверсіз: тапсырыс тек осы құрылғыда көрінеді.",
    showTicket: "Тапсырысты көрсету",
    ticketEmpty: "Тапсырыста ештеңе жоқ.",
    done: "Дайын",
    navMenu: "Мәзір",
    navCart: "Себет",
    navSettings: "Баптаулар",
    settingsTitle: "Мәзір баптаулары",
    settingsHint: "Мәзірді өзіңізге ыңғайлаңыз — тек осы құрылғыда.",
    settingsColor: "Түс",
    settingsDesign: "Дизайн",
    navWaiter: "Даяшы",
    waiterTitle: "Даяшыны шақыру",
    waiterHint: "Даяшы хабарлама алып, жаныңызға келеді.",
    waiterReasonWaiter: "Даяшыны шақыру",
    waiterReasonBill: "Есеп-шот",
    waiterReasonHelp: "Көмек керек",
    waiterTableLabel: "Үстел нөмірі",
    waiterTablePlaceholder: "мысалы, 12",
    waiterSent: "Даяшы келе жатыр",
    waiterError: "Жіберілмеді. Қайта көріңіз.",
    poweredBy: "QR меню-де жасалған",
    poweredByAria: "QR меню — мейрамханаларға арналған QR-мәзір",
  },
};
