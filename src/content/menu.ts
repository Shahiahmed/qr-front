import type { Locale } from "@/content/landing";

export type MenuCopy = {
  title: string;
  backToVenues: string;
  venueNotFound: string;

  empty: string;
  emptyHint: string;
  fillStarter: string;
  fillingStarter: string;
  openGuestMenu: string;
  openQr: string;

  /** Constructor sub-tabs — one job per screen. */
  tabMenu: string;
  tabLook: string;
  tabContacts: string;
  lookSub: string;
  contactsSub: string;

  addCategory: string;
  editCategory: string;
  deleteCategory: string;
  deleteCategoryConfirm: string;
  categoryNameRu: string;
  categoryNameKk: string;

  addDish: string;
  editDish: string;
  deleteDish: string;
  deleteDishConfirm: string;
  dishNameRu: string;
  dishNameKk: string;
  dishDescRu: string;
  dishDescKk: string;
  dishPrice: string;
  dishPriceHint: string;
  dishCategory: string;
  noDishes: string;

  inStock: string;
  outOfStock: string;
  outOfStockBadge: string;
  hidden: string;
  hiddenBadge: string;
  visibility: string;
  hideDish: string;
  showDish: string;
  moreActions: string;
  toStop: string;
  fromStop: string;

  // Design / venue header
  design: string;
  designSub: string;
  themeLabel: string;
  layoutLabel: string;
  headerFieldsLabel: string;
  fAddress: string;
  fPhone: string;
  fWifiName: string;
  fWifiPass: string;
  fInstagram: string;
  fFacebook: string;
  fTiktok: string;
  socialHint: string;
  designSaved: string;
  designError: string;

  // Telegram: bind a chat so the "call waiter" button reaches the venue
  tgTitle: string;
  tgHint: string;
  tgConnected: string;
  tgDisconnected: string;
  tgConnect: string;
  tgConnecting: string;
  tgDisconnect: string;
  tgWaitingHint: string;
  tgError: string;

  // Images (cover + logo)
  imagesLabel: string;
  coverLabel: string;
  coverHint: string;
  logoLabel: string;
  logoHint: string;
  showLogo: string;
  hideLogo: string;
  uploadImage: string;
  changeImage: string;
  removeImage: string;
  uploading: string;
  imageError: string;
  imageTooBig: string;

  // Dish photo + cropper
  dishPhoto: string;
  dishPhotoHint: string;
  addPhoto: string;
  changePhoto: string;
  removePhoto: string;
  cropTitle: string;
  cropHint: string;
  cropZoom: string;
  cropApply: string;

  // Free-tier content caps ({n} is replaced with the number)
  categoryLimitReached: string;
  dishLimitReached: string;

  // Section order
  moveUp: string;
  moveDown: string;

  kkOptional: string;
  cancel: string;
  save: string;
  add: string;
  saving: string;
};

const RU: MenuCopy = {
  title: "Меню",
  backToVenues: "Заведения",
  venueNotFound: "Заведение не найдено",

  empty: "В меню пока пусто.",
  emptyHint: "Заполните примером — три раздела с блюдами, потом правите под себя.",
  fillStarter: "Заполнить примером",
  fillingStarter: "Заполняем…",
  openGuestMenu: "Как видит гость",
  openQr: "QR-код",

  tabMenu: "Меню",
  tabLook: "Оформление",
  tabContacts: "Контакты",
  lookSub: "Обложка, логотип и цвет меню.",
  contactsSub: "Адрес, телефон, Wi‑Fi и соцсети в шапке меню.",

  addCategory: "Добавить раздел",
  editCategory: "Изменить раздел",
  deleteCategory: "Удалить раздел",
  deleteCategoryConfirm: "Удалить раздел вместе со всеми блюдами?",
  categoryNameRu: "Название раздела",
  categoryNameKk: "Название на казахском",

  addDish: "Добавить блюдо",
  editDish: "Изменить блюдо",
  deleteDish: "Удалить блюдо",
  deleteDishConfirm: "Удалить блюдо?",
  dishNameRu: "Название блюда",
  dishNameKk: "Название на казахском",
  dishDescRu: "Описание",
  dishDescKk: "Описание на казахском",
  dishPrice: "Цена, ₸",
  dishPriceHint: "Например 2490",
  dishCategory: "Раздел",
  noDishes: "В разделе пока нет блюд.",

  inStock: "В наличии",
  outOfStock: "В стоп-листе",
  outOfStockBadge: "Стоп-лист",
  hidden: "Скрыто",
  hiddenBadge: "Скрыто",
  visibility: "Показывать гостям",
  hideDish: "Скрыть от гостей",
  showDish: "Показать гостям",
  moreActions: "Действия",
  toStop: "Убрать в стоп-лист",
  fromStop: "Вернуть в наличие",

  design: "Оформление",
  designSub: "Как меню выглядит у гостя.",
  themeLabel: "Цвет меню",
  layoutLabel: "Дизайн меню",
  headerFieldsLabel: "Контакты и Wi‑Fi",
  fAddress: "Адрес",
  fPhone: "Телефон",
  fWifiName: "Wi-Fi сеть",
  fWifiPass: "Пароль Wi-Fi",
  fInstagram: "Instagram",
  fFacebook: "Facebook",
  fTiktok: "TikTok",
  socialHint: "Ссылка на профиль",
  designSaved: "Сохранено",
  designError: "Не удалось сохранить. Проверьте ссылки соцсетей.",

  tgTitle: "Вызов официанта (Telegram)",
  tgHint:
    "Подключите Telegram — гость сможет позвать официанта с меню, вы получите уведомление в чат.",
  tgConnected: "Подключено",
  tgDisconnected: "Не подключено",
  tgConnect: "Подключить Telegram",
  tgConnecting: "Открываем…",
  tgDisconnect: "Отключить",
  tgWaitingHint:
    "Откройте бота в Telegram и нажмите «Старт». После этого обновите страницу.",
  tgError: "Не удалось. Попробуйте ещё раз.",

  imagesLabel: "Фото заведения",
  coverLabel: "Обложка",
  coverHint:
    "По умолчанию — фото из демо. Замените своим: JPG или PNG, до 8 МБ.",
  logoLabel: "Логотип",
  logoHint:
    "По умолчанию — первая буква названия. Замените своим PNG (лучше с прозрачным фоном).",
  showLogo: "Показать на меню",
  hideLogo: "Скрыть с меню",
  uploadImage: "Загрузить",
  changeImage: "Заменить",
  removeImage: "Удалить",
  uploading: "Загрузка…",
  imageError: "Не удалось загрузить. Попробуйте другой файл.",
  imageTooBig: "Файл больше 8 МБ. Выберите фото поменьше.",

  dishPhoto: "Фото блюда",
  dishPhotoHint: "Квадрат. Сожмётся автоматически, чтобы меню не тормозило.",
  addPhoto: "Добавить фото",
  changePhoto: "Заменить фото",
  removePhoto: "Удалить фото",
  cropTitle: "Кадрируйте фото",
  cropHint: "Потяните, чтобы сдвинуть · ползунком меняйте масштаб.",
  cropZoom: "Масштаб",
  cropApply: "Применить",

  categoryLimitReached: "Лимит бесплатного тарифа: {n} разделов. Оформите подписку, чтобы добавить ещё.",
  dishLimitReached: "Лимит бесплатного тарифа: {n} блюд в разделе.",

  moveUp: "Выше",
  moveDown: "Ниже",

  kkOptional: "Можно заполнить позже",
  cancel: "Отмена",
  save: "Сохранить",
  add: "Добавить",
  saving: "Сохраняем…",
};

const KZ: MenuCopy = {
  title: "Мәзір",
  backToVenues: "Мекемелер",
  venueNotFound: "Мекеме табылмады",

  empty: "Мәзір әзірге бос.",
  emptyHint: "Үлгімен толтырыңыз — үш бөлім тағамдармен, кейін өзіңізге бейімдеңіз.",
  fillStarter: "Үлгімен толтыру",
  fillingStarter: "Толтырылуда…",
  openGuestMenu: "Қонақ қалай көреді",
  openQr: "QR-код",

  tabMenu: "Мәзір",
  tabLook: "Безендіру",
  tabContacts: "Байланыс",
  lookSub: "Мұқаба, логотип және мәзір түсі.",
  contactsSub: "Мекенжай, телефон, Wi‑Fi және әлеуметтік желілер.",

  addCategory: "Бөлім қосу",
  editCategory: "Бөлімді өзгерту",
  deleteCategory: "Бөлімді жою",
  deleteCategoryConfirm: "Бөлімді барлық тағамдарымен жою керек пе?",
  categoryNameRu: "Бөлім атауы (орысша)",
  categoryNameKk: "Бөлім атауы (қазақша)",

  addDish: "Тағам қосу",
  editDish: "Тағамды өзгерту",
  deleteDish: "Тағамды жою",
  deleteDishConfirm: "Тағамды жою керек пе?",
  dishNameRu: "Тағам атауы (орысша)",
  dishNameKk: "Тағам атауы (қазақша)",
  dishDescRu: "Сипаттама (орысша)",
  dishDescKk: "Сипаттама (қазақша)",
  dishPrice: "Бағасы, ₸",
  dishPriceHint: "Мысалы 2490",
  dishCategory: "Бөлім",
  noDishes: "Бөлімде әзірге тағам жоқ.",

  inStock: "Бар",
  outOfStock: "Стоп-парақта",
  outOfStockBadge: "Стоп-парақ",
  hidden: "Жасырылған",
  hiddenBadge: "Жасырылған",
  visibility: "Қонақтарға көрсету",
  hideDish: "Қонақтардан жасыру",
  showDish: "Қонақтарға көрсету",
  moreActions: "Әрекеттер",
  toStop: "Стоп-параққа қою",
  fromStop: "Қайта қолжетімді ету",

  design: "Безендіру",
  designSub: "Қонақ мәзірді қалай көреді.",
  themeLabel: "Мәзір түсі",
  layoutLabel: "Мәзір дизайны",
  headerFieldsLabel: "Байланыс және Wi‑Fi",
  fAddress: "Мекенжай",
  fPhone: "Телефон",
  fWifiName: "Wi-Fi желісі",
  fWifiPass: "Wi-Fi құпия сөзі",
  fInstagram: "Instagram",
  fFacebook: "Facebook",
  fTiktok: "TikTok",
  socialHint: "Профиль сілтемесі",
  designSaved: "Сақталды",
  designError: "Сақтау мүмкін болмады. Әлеуметтік желі сілтемелерін тексеріңіз.",

  tgTitle: "Даяшыны шақыру (Telegram)",
  tgHint:
    "Telegram қосыңыз — қонақ мәзірден даяшыны шақыра алады, сіз чатқа хабарлама аласыз.",
  tgConnected: "Қосылған",
  tgDisconnected: "Қосылмаған",
  tgConnect: "Telegram қосу",
  tgConnecting: "Ашылуда…",
  tgDisconnect: "Ажырату",
  tgWaitingHint:
    "Telegram-да ботты ашып, «Старт» түймесін басыңыз. Содан кейін бетті жаңартыңыз.",
  tgError: "Мүмкін болмады. Қайта көріңіз.",

  imagesLabel: "Мекеме фотосы",
  coverLabel: "Мұқаба",
  coverHint:
    "Әдепкі — демо фотосы. Өзіңіздікімен ауыстырыңыз: JPG немесе PNG, 8 МБ дейін.",
  logoLabel: "Логотип",
  logoHint:
    "Әдепкі — атаудың бірінші әрпі. Өзіңіздікімен ауыстырыңыз (мөлдір PNG жақсырақ).",
  showLogo: "Мәзірде көрсету",
  hideLogo: "Мәзірден жасыру",
  uploadImage: "Жүктеу",
  changeImage: "Ауыстыру",
  removeImage: "Жою",
  uploading: "Жүктелуде…",
  imageError: "Жүктеу мүмкін болмады. Басқа файлды таңдаңыз.",
  imageTooBig: "Файл 8 МБ-тан үлкен. Кішірек фото таңдаңыз.",

  dishPhoto: "Тағам фотосы",
  dishPhotoHint: "Шаршы. Мәзір баяу болмауы үшін автоматты қысылады.",
  addPhoto: "Фото қосу",
  changePhoto: "Фотоны ауыстыру",
  removePhoto: "Фотоны жою",
  cropTitle: "Фотоны кадрлаңыз",
  cropHint: "Жылжыту үшін сүйреңіз · масштабты жүгірткімен өзгертіңіз.",
  cropZoom: "Масштаб",
  cropApply: "Қолдану",

  categoryLimitReached: "Тегін тариф шегі: {n} бөлім. Көбірек қосу үшін жазылыңыз.",
  dishLimitReached: "Тегін тариф шегі: бөлімде {n} тағам.",

  moveUp: "Жоғары",
  moveDown: "Төмен",

  kkOptional: "Кейін толтыруға болады",
  cancel: "Болдырмау",
  save: "Сақтау",
  add: "Қосу",
  saving: "Сақталуда…",
};

export const menuByLocale: Record<Locale, MenuCopy> = { ru: RU, kz: KZ };
