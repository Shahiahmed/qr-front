import type { Locale } from "@/content/landing";

export type AuthCopy = {
  registerTitle: string;
  registerSub: string;
  loginTitle: string;
  loginSub: string;

  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  passwordLabel: string;
  passwordHint: string;
  passwordConfirmLabel: string;

  submitRegister: string;
  submitLogin: string;
  submitting: string;

  haveAccount: string;
  goLogin: string;
  noAccount: string;
  goRegister: string;

  backHome: string;
  /** Shown when the request never reached the API at all. */
  networkError: string;

  dashboardTitle: string;
  /** Header link shown instead of the sign-in buttons. */
  navPanel: string;
  dashboardHello: string;
  dashboardNext: string;
  logout: string;

  tabVenues: string;
  tabProfile: string;
  tabSubscription: string;

  subTitle: string;
  /** Intro line under the page title. */
  subSubtitle: string;
  /** Heading over the "your current plan" card. */
  subCurrentPlan: string;
  /** Shown when the owner has no paid plan yet. */
  subFreeName: string;
  subFreeNote: string;
  /** «Действует до 12.08.2026» — prefix before the end date. */
  subActiveUntil: string;
  /** Banner when a request is awaiting a decision. */
  subPendingTitle: string;
  subPendingNote: string;
  /** Heading over the plan chooser / request form. */
  subChooseTitle: string;
  subChooseSub: string;
  subPickPlan: string;
  subContactPhone: string;
  subContactPhonePlaceholder: string;
  subComment: string;
  subCommentPlaceholder: string;
  subRequestCta: string;
  subRequestSending: string;
  subRequestSuccess: string;
  subSelectPlanFirst: string;
  subAlreadyPending: string;
  subNoPlans: string;
  subPerMonth: string;
  subPerYear: string;
  /** «−10 %» badge next to a discounted plan price. */
  subDiscountOff: string;
  subFeaturesTitle: string;

  venuesTitle: string;
  venuesEmpty: string;
  venueAdd: string;
  venueMenu: string;
  venueEdit: string;
  venueDelete: string;
  venueDeleteConfirm: string;

  modalAddTitle: string;
  fieldVenueName: string;
  fieldVenueNamePlaceholder: string;
  fieldSlug: string;
  fieldSlugHint: string;
  fieldCurrency: string;
  fieldCurrencyPlaceholder: string;
  fieldLanguage: string;
  fieldLanguagePlaceholder: string;
  fieldAddress: string;
  fieldPhone: string;
  cancel: string;
  add: string;
  save: string;

  profileTitle: string;
  passwordChangeTitle: string;
  currentPasswordLabel: string;
  newPasswordLabel: string;
  passwordChangeSubmit: string;
  passwordChangeSuccess: string;

  qrTitle: string;
  qrSubtitle: string;
  qrOpen: string;
  qrDownloadPng: string;
  qrDownloadSvg: string;
  qrPrint: string;
  qrLinkLabel: string;
  qrCopied: string;
  qrCopy: string;
  /** Printed on the table tent, above the code. */
  tentHeading: string;
  tentHint: string;
};

const RU: AuthCopy = {
  registerTitle: "Создать аккаунт",
  registerSub: "Пара минут — и можно добавлять заведение.",
  loginTitle: "Вход",
  loginSub: "Рады видеть снова.",

  nameLabel: "Ваше имя",
  namePlaceholder: "Айгүл Серікова",
  emailLabel: "Email",
  passwordLabel: "Пароль",
  passwordHint: "Минимум 8 символов",
  passwordConfirmLabel: "Повторите пароль",

  submitRegister: "Зарегистрироваться",
  submitLogin: "Войти",
  submitting: "Отправляем…",

  haveAccount: "Уже есть аккаунт?",
  goLogin: "Войти",
  noAccount: "Ещё нет аккаунта?",
  goRegister: "Зарегистрироваться",

  backHome: "На главную",
  networkError: "Не удалось связаться с сервером. Проверьте соединение.",

  dashboardTitle: "Кабинет",
  navPanel: "Кабинет",
  dashboardHello: "Вы вошли как",
  dashboardNext: "Следующий шаг — добавить заведение: название, адрес и контакты.",
  logout: "Выйти",

  tabVenues: "Заведения",
  tabProfile: "Профиль",
  tabSubscription: "Подписка",

  subTitle: "Подписка",
  subSubtitle: "Выберите тариф и оставьте заявку — мы активируем его вручную.",
  subCurrentPlan: "Ваш тариф",
  subFreeName: "Бесплатный",
  subFreeNote: "Базовые возможности. Оформите подписку, чтобы открыть больше.",
  subActiveUntil: "Действует до",
  subPendingTitle: "Заявка на рассмотрении",
  subPendingNote: "Мы свяжемся с вами и активируем тариф вручную.",
  subChooseTitle: "Оформить подписку",
  subChooseSub: "Выберите тариф — заявка уйдёт администратору.",
  subPickPlan: "Тариф",
  subContactPhone: "Телефон для связи",
  subContactPhonePlaceholder: "+7 700 000 00 00",
  subComment: "Комментарий",
  subCommentPlaceholder: "Например: нужно несколько заведений",
  subRequestCta: "Оставить заявку",
  subRequestSending: "Отправляем…",
  subRequestSuccess: "Заявка отправлена — мы свяжемся с вами.",
  subSelectPlanFirst: "Выберите тариф.",
  subAlreadyPending: "У вас уже есть заявка на рассмотрении.",
  subNoPlans: "Тарифы скоро появятся.",
  subPerMonth: "/ мес",
  subPerYear: "/ год",
  subDiscountOff: "скидка",
  subFeaturesTitle: "Что входит",

  venuesTitle: "Заведения",
  venuesEmpty: "Пока нет ни одного заведения. Добавьте первое — это займёт минуту.",
  venueAdd: "Добавить заведение",
  venueMenu: "Меню",
  venueEdit: "Изменить",
  venueDelete: "Удалить",
  venueDeleteConfirm: "Удалить заведение вместе с меню? Это необратимо.",

  modalAddTitle: "Добавить заведение",
  fieldVenueName: "Название заведения",
  fieldVenueNamePlaceholder: "Восточный дворик",
  fieldSlug: "Короткое имя в URL",
  fieldSlugHint: "Латиница, цифры и дефис",
  fieldCurrency: "Валюта",
  fieldCurrencyPlaceholder: "Выберите валюту",
  fieldLanguage: "Основной язык",
  fieldLanguagePlaceholder: "Выберите язык",
  fieldAddress: "Адрес",
  fieldPhone: "Телефон",
  cancel: "Отмена",
  add: "Добавить",
  save: "Сохранить",

  profileTitle: "Профиль",
  passwordChangeTitle: "Смена пароля",
  currentPasswordLabel: "Текущий пароль",
  newPasswordLabel: "Новый пароль",
  passwordChangeSubmit: "Сменить пароль",
  passwordChangeSuccess: "Пароль обновлён.",

  qrTitle: "QR-код",
  qrSubtitle: "Распечатайте и поставьте на стол. Гость наведёт камеру и увидит меню.",
  qrOpen: "QR-код",
  qrDownloadPng: "Скачать PNG",
  qrDownloadSvg: "Скачать SVG",
  qrPrint: "Печать таблички",
  qrLinkLabel: "Ссылка на меню",
  qrCopied: "Скопировано",
  qrCopy: "Копировать",
  tentHeading: "Меню здесь",
  tentHint: "Наведите камеру телефона на код",
};

const KZ: AuthCopy = {
  registerTitle: "Аккаунт құру",
  registerSub: "Бірнеше минут — және мекеме қосуға болады.",
  loginTitle: "Кіру",
  loginSub: "Қайта көргенімізге қуаныштымыз.",

  nameLabel: "Атыңыз",
  namePlaceholder: "Айгүл Серікова",
  emailLabel: "Email",
  passwordLabel: "Құпиясөз",
  passwordHint: "Кемінде 8 таңба",
  passwordConfirmLabel: "Құпиясөзді қайталаңыз",

  submitRegister: "Тіркелу",
  submitLogin: "Кіру",
  submitting: "Жіберілуде…",

  haveAccount: "Аккаунтыңыз бар ма?",
  goLogin: "Кіру",
  noAccount: "Аккаунтыңыз жоқ па?",
  goRegister: "Тіркелу",

  backHome: "Басты бетке",
  networkError: "Сервермен байланысу мүмкін болмады. Байланысты тексеріңіз.",

  dashboardTitle: "Кабинет",
  navPanel: "Кабинет",
  dashboardHello: "Сіз кірдіңіз:",
  dashboardNext: "Келесі қадам — мекеме қосу: атауы, мекенжайы және байланыс.",
  logout: "Шығу",

  tabVenues: "Мекемелер",
  tabProfile: "Профиль",
  tabSubscription: "Жазылым",

  subTitle: "Жазылым",
  subSubtitle: "Тарифті таңдап, өтінім қалдырыңыз — оны қолмен қосамыз.",
  subCurrentPlan: "Сіздің тарифіңіз",
  subFreeName: "Тегін",
  subFreeNote: "Негізгі мүмкіндіктер. Көбірек ашу үшін жазылым рәсімдеңіз.",
  subActiveUntil: "Дейін жарамды",
  subPendingTitle: "Өтінім қарастырылуда",
  subPendingNote: "Біз сізбен хабарласып, тарифті қолмен қосамыз.",
  subChooseTitle: "Жазылым рәсімдеу",
  subChooseSub: "Тарифті таңдаңыз — өтінім әкімшіге жіберіледі.",
  subPickPlan: "Тариф",
  subContactPhone: "Байланыс телефоны",
  subContactPhonePlaceholder: "+7 700 000 00 00",
  subComment: "Пікір",
  subCommentPlaceholder: "Мысалы: бірнеше мекеме қажет",
  subRequestCta: "Өтінім қалдыру",
  subRequestSending: "Жіберілуде…",
  subRequestSuccess: "Өтінім жіберілді — біз сізбен хабарласамыз.",
  subSelectPlanFirst: "Тарифті таңдаңыз.",
  subAlreadyPending: "Сізде қарастырылып жатқан өтінім бар.",
  subNoPlans: "Тарифтер жақында пайда болады.",
  subPerMonth: "/ ай",
  subPerYear: "/ жыл",
  subDiscountOff: "жеңілдік",
  subFeaturesTitle: "Не кіреді",

  venuesTitle: "Мекемелер",
  venuesEmpty: "Әзірге мекеме жоқ. Біріншісін қосыңыз — бір минут алады.",
  venueAdd: "Мекеме қосу",
  venueMenu: "Мәзір",
  venueEdit: "Өзгерту",
  venueDelete: "Жою",
  venueDeleteConfirm: "Мекемені мәзірімен бірге жою керек пе? Бұны қайтару мүмкін емес.",

  modalAddTitle: "Мекеме қосу",
  fieldVenueName: "Мекеме атауы",
  fieldVenueNamePlaceholder: "Шығыс ауласы",
  fieldSlug: "URL-дегі қысқа атау",
  fieldSlugHint: "Латын әріптері, сандар және дефис",
  fieldCurrency: "Валюта",
  fieldCurrencyPlaceholder: "Валютаны таңдаңыз",
  fieldLanguage: "Негізгі тіл",
  fieldLanguagePlaceholder: "Тілді таңдаңыз",
  fieldAddress: "Мекенжай",
  fieldPhone: "Телефон",
  cancel: "Болдырмау",
  add: "Қосу",
  save: "Сақтау",

  profileTitle: "Профиль",
  passwordChangeTitle: "Құпиясөзді өзгерту",
  currentPasswordLabel: "Қазіргі құпиясөз",
  newPasswordLabel: "Жаңа құпиясөз",
  passwordChangeSubmit: "Құпиясөзді өзгерту",
  passwordChangeSuccess: "Құпиясөз жаңартылды.",

  qrTitle: "QR-код",
  qrSubtitle: "Басып шығарып, үстелге қойыңыз. Қонақ камераны бағыттап, мәзірді көреді.",
  qrOpen: "QR-код",
  qrDownloadPng: "PNG жүктеу",
  qrDownloadSvg: "SVG жүктеу",
  qrPrint: "Кестені басып шығару",
  qrLinkLabel: "Мәзірге сілтеме",
  qrCopied: "Көшірілді",
  qrCopy: "Көшіру",
  tentHeading: "Мәзір осында",
  tentHint: "Телефон камерасын кодқа бағыттаңыз",
};

export const authByLocale: Record<Locale, AuthCopy> = { ru: RU, kz: KZ };
