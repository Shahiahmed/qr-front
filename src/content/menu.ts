import type { Locale } from "@/content/landing";

export type MenuCopy = {
  title: string;
  backToVenues: string;

  empty: string;
  emptyHint: string;

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
  emptyHint: "Начните с раздела — например «Горячее» или «Напитки».",

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
  emptyHint: "Бөлімнен бастаңыз — мысалы «Ыстық» немесе «Сусындар».",

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

  kkOptional: "Кейін толтыруға болады",
  cancel: "Болдырмау",
  save: "Сақтау",
  add: "Қосу",
  saving: "Сақталуда…",
};

export const menuByLocale: Record<Locale, MenuCopy> = { ru: RU, kz: KZ };
