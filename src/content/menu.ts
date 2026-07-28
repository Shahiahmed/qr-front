import type { Locale } from "@/content/landing";

export type MenuCopy = {
  title: string;
  backToVenues: string;

  empty: string;
  emptyHint: string;
  fillStarter: string;
  fillingStarter: string;
  openGuestMenu: string;

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

  // Design / venue header ("Оформление")
  design: string;
  designSub: string;
  themeLabel: string;
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

  empty: "В меню пока пусто.",
  emptyHint: "Заполните примером — три раздела с блюдами, потом правите под себя.",
  fillStarter: "Заполнить примером",
  fillingStarter: "Заполняем…",
  openGuestMenu: "Как видит гость",

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

  design: "Оформление",
  designSub: "Цвет меню, контакты и Wi-Fi — гость видит это в шапке меню.",
  themeLabel: "Цвет меню",
  headerFieldsLabel: "Контакты и Wi-Fi",
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

  empty: "Мәзір әзірге бос.",
  emptyHint: "Үлгімен толтырыңыз — үш бөлім тағамдармен, кейін өзіңізге бейімдеңіз.",
  fillStarter: "Үлгімен толтыру",
  fillingStarter: "Толтырылуда…",
  openGuestMenu: "Қонақ қалай көреді",

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

  design: "Безендіру",
  designSub: "Мәзір түсі, байланыс және Wi-Fi — қонақ мұны мәзір шапкасынан көреді.",
  themeLabel: "Мәзір түсі",
  headerFieldsLabel: "Байланыс және Wi-Fi",
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

  moveUp: "Жоғары",
  moveDown: "Төмен",

  kkOptional: "Кейін толтыруға болады",
  cancel: "Болдырмау",
  save: "Сақтау",
  add: "Қосу",
  saving: "Сақталуда…",
};

export const menuByLocale: Record<Locale, MenuCopy> = { ru: RU, kz: KZ };
