export type Locale = "ru" | "kz";

export type LandingCopy = {
  meta: { title: string; description: string };
  navLogin: string;
  navTry: string;
  navMenuOpen: string;
  navMenuClose: string;
  languageAria: string;
  heroBadge: string;
  heroTitle: string;
  /** Highlighted tail of the headline, rendered with the accent gradient. */
  heroTitleAccent: string;
  heroSub: string;
  heroCta1: string;
  heroCta2: string;
  heroStat1: string;
  heroStat2: string;
  heroStat3: string;
  notifyTitle: string;
  restName: string;
  restTag: string;
  cats: { name: string; active?: boolean }[];
  heroDishes: { name: string; desc: string; price: string; image: string }[];
  hiwKicker: string;
  hiwTitle: string;
  hiwSub: string;
  steps: { num: string; title: string; text: string }[];
  advKicker: string;
  advTitle: string;
  features: { title: string; text: string }[];
  // cartTable/cartTotal stay: the Hero notification mockup still uses them.
  cartTable: string;
  cartTotal: string;
  faqKicker: string;
  faqTitle: string;
  faqSub: string;
  faqItems: { q: string; a: string }[];
  priceKicker: string;
  priceTitle: string;
  priceSub: string;
  popular: string;
  /** Badge on the bespoke Premium spotlight card. */
  priceCustomTag: string;
  planFree: PlanCopy;
  planStd: PlanCopy;
  planPrem: PlanCopy;
  ctaTitle: string;
  ctaSub: string;
  ctaBtn: string;
  footLinks: { label: string; href: string }[];
  footRights: string;
  waAria: string;
  waMessage: string;
  promoClose: string;
};

type PlanCopy = {
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  cta: string;
};

export const brand = {
  // Full wordmark for aria labels, OG siteName, page-title suffixes.
  name: "QR меню",
  // The badge shows "QR"; the wordmark word next to it is "меню" → "QR меню".
  logoLetter: "QR",
  wordmark: "меню",
} as const;

const RU: LandingCopy = {
  meta: {
    title: "QR меню — цифровое меню для ресторанов",
    description:
      "Гости сканируют код и видят меню без приложения — на русском и казахском. Запуск за 2 минуты.",
  },
  navLogin: "Войти",
  navTry: "Попробовать бесплатно",
  navMenuOpen: "Открыть меню",
  navMenuClose: "Закрыть меню",
  languageAria: "Выбор языка",
  heroBadge: "Без установки приложения",
  heroTitle: "Меню по QR",
  heroTitleAccent: "за 2 минуты",
  heroSub:
    "Гости сканируют код и видят ваше меню без установки приложения — на русском и казахском.",
  heroCta1: "Попробовать бесплатно",
  heroCta2: "Смотреть демо",
  heroStat1: "на запуск",
  heroStat2: "два языка",
  heroStat3: "старт бесплатно",
  notifyTitle: "Новый заказ",
  restName: "Восточный дворик",
  restTag: "Узбекская и казахская кухня",
  cats: [
    { name: "Горячее", active: true },
    { name: "Салаты" },
    { name: "Напитки" },
    { name: "Десерты" },
  ],
  heroDishes: [
    {
      name: "Плов ташкентский",
      desc: "с мраморной говядиной",
      price: "2 490 ₸",
      // Same Unsplash crops as `/m/demo` — keeps the landing in sync with the live sample.
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=160&h=160&q=70&auto=format&fit=crop",
    },
    {
      name: "Лагман уйгурский",
      desc: "ручная лапша, овощи",
      price: "2 100 ₸",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=160&h=160&q=70&auto=format&fit=crop",
    },
    {
      name: "Манты (5 шт)",
      desc: "сочная баранина",
      price: "1 890 ₸",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=160&h=160&q=70&auto=format&fit=crop",
    },
    {
      name: "Чай в чайнике",
      desc: "облепиха, мёд",
      price: "990 ₸",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=160&h=160&q=70&auto=format&fit=crop",
    },
  ],
  hiwKicker: "Как это работает",
  hiwTitle: "Три шага до цифрового меню",
  hiwSub: "Регистрация, меню и QR на столы — без разработчиков и приложений.",
  steps: [
    {
      num: "1",
      title: "Создайте аккаунт",
      text: "Зарегистрируйтесь и добавьте заведение: название, адрес и короткий URL меню.",
    },
    {
      num: "2",
      title: "Заполните меню",
      text: "Разделы, блюда и цены на русском и казахском. Стоп-лист — в один тап.",
    },
    {
      num: "3",
      title: "Поставьте QR на стол",
      text: "Скачайте код, распечатайте табличку — гость сканирует и сразу видит меню.",
    },
  ],
  advKicker: "Преимущества",
  advTitle: "Всё, что нужно заведению",
  features: [
    {
      title: "Двуязычность RU / KZ",
      text: "Меню сразу на двух языках, гость выбирает удобный.",
    },
    {
      title: "Стоп-лист в один тап",
      text: "Блюдо закончилось — скрыли из меню мгновенно.",
    },
    {
      title: "Заказ со стола",
      text: "Гость оформляет заказ сам, без ожидания официанта.",
    },
    {
      title: "Вызов официанта",
      text: "Одна кнопка — и помощь подойдёт к столу.",
    },
    {
      title: "Чаевые через Kaspi QR",
      text: "Гость благодарит команду в один тап.",
    },
    {
      title: "Аналитика сканирований",
      text: "Видно, что смотрят и заказывают чаще всего.",
    },
    {
      title: "Мгновенное обновление цен",
      text: "Меняйте цены без перепечатки бумажных меню.",
    },
    {
      title: "Своё оформление",
      text: "Логотип, фото блюд и фирменные цвета заведения.",
    },
  ],
  cartTable: "Стол №7",
  cartTotal: "6 690 ₸",
  faqKicker: "Вопросы",
  faqTitle: "Частые вопросы",
  faqSub: "Коротко о том, как работает QR-меню и что нужно для запуска.",
  faqItems: [
    {
      q: "Нужно ли гостю устанавливать приложение?",
      a: "Нет. Гость наводит камеру на QR-код на столе и сразу видит меню в браузере — скачивать ничего не нужно.",
    },
    {
      q: "На каких языках работает меню?",
      a: "Меню двуязычное — русский и казахский. Гость сам переключает язык, а вы заполняете оба варианта в кабинете.",
    },
    {
      q: "Как быстро можно запустить меню?",
      a: "Обычно за несколько минут: регистрируетесь, добавляете разделы и блюда (или берёте готовый шаблон) и распечатываете QR-код на стол.",
    },
    {
      q: "Можно ли менять цены и убирать блюда из наличия?",
      a: "Да. Цены, описания и стоп-лист меняются в один тап — гость сразу видит актуальное меню, перепечатывать QR-код не нужно.",
    },
    {
      q: "Сколько это стоит?",
      a: "Есть бесплатный период на одно меню. Дальше — фиксированная плата за срок доступа меню (полгода или год); актуальные цены — в разделе «Тарифы».",
    },
    {
      q: "Что нужно, чтобы начать?",
      a: "Только телефон или компьютер: зарегистрироваться, заполнить меню и распечатать QR-код. Дополнительное оборудование не требуется.",
    },
  ],
  priceKicker: "Тарифы",
  priceTitle: "Простые и понятные тарифы",
  priceSub: "Начните бесплатно и расширяйтесь по мере роста заведения.",
  popular: "Популярный выбор",
  priceCustomTag: "Индивидуальное решение",
  planFree: {
    name: "Бесплатный",
    price: "0 ₸",
    period: "",
    desc: "Одно меню на 1 месяц — попробовать",
    features: ["1 меню + QR-код", "Все функции меню", "Доступ на 1 месяц"],
    cta: "Начать бесплатно",
  },
  planStd: {
    name: "На 6 месяцев",
    price: "15 000 ₸",
    period: "/ 6 мес",
    desc: "Одно меню на полгода",
    features: ["1 меню + QR-код", "Все функции меню", "Оформление и логотип", "Доступ на 6 месяцев"],
    cta: "Выбрать тариф",
  },
  planPrem: {
    name: "На год",
    price: "25 000 ₸",
    period: "/ год",
    desc: "Одно меню на год — выгоднее",
    features: ["1 меню + QR-код", "Все функции меню", "Оформление и логотип", "Доступ на год"],
    cta: "Выбрать тариф",
  },
  ctaTitle: "Запустите меню уже сегодня",
  ctaSub: "Регистрация занимает пару минут. Без карты и обязательств.",
  ctaBtn: "Начать бесплатно",
  footLinks: [
    { label: "О сервисе", href: "#how" },
    { label: "Тарифы", href: "#pricing" },
    { label: "Вопросы", href: "#faq" },
    { label: "Контакты", href: "#cta" },
  ],
  footRights: "© 2026 QR меню. Все права защищены.",
  waAria: "Написать в WhatsApp",
  waMessage: "Здравствуйте! Хочу узнать про QR меню.",
  promoClose: "Закрыть",
};

const KZ: LandingCopy = {
  meta: {
    title: "QR меню — мейрамханаларға арналған QR-мәзір",
    description:
      "Қонақтар кодты сканерлеп, қосымшасыз мәзірді көреді — орысша және қазақша.",
  },
  navLogin: "Кіру",
  navTry: "Тегін тіркелу",
  navMenuOpen: "Мәзірді ашу",
  navMenuClose: "Мәзірді жабу",
  languageAria: "Тілді таңдау",
  heroBadge: "Қосымшасыз",
  heroTitle: "QR арқылы мәзір",
  heroTitleAccent: "2 минутта",
  heroSub:
    "Қонақтар кодты сканерлеп, қосымшасыз мәзіріңізді көреді — орысша және қазақша.",
  heroCta1: "Тегін тіркелу",
  heroCta2: "Демоны көру",
  heroStat1: "іске қосуға",
  heroStat2: "екі тіл",
  heroStat3: "тегін бастау",
  notifyTitle: "Жаңа тапсырыс",
  restName: "Шығыс ауласы",
  restTag: "Өзбек және қазақ асханасы",
  cats: [
    { name: "Ыстық", active: true },
    { name: "Салаттар" },
    { name: "Сусындар" },
    { name: "Тәттілер" },
  ],
  heroDishes: [
    {
      name: "Ташкент палауы",
      desc: "мәрмәр сиыр етімен",
      price: "2 490 ₸",
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=160&h=160&q=70&auto=format&fit=crop",
    },
    {
      name: "Ұйғыр лағманы",
      desc: "қол кеспе, көкөніс",
      price: "2 100 ₸",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=160&h=160&q=70&auto=format&fit=crop",
    },
    {
      name: "Манты (5 дана)",
      desc: "шырынды қой еті",
      price: "1 890 ₸",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=160&h=160&q=70&auto=format&fit=crop",
    },
    {
      name: "Шайнектегі шай",
      desc: "шырғанақ, бал",
      price: "990 ₸",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=160&h=160&q=70&auto=format&fit=crop",
    },
  ],
  hiwKicker: "Қалай жұмыс істейді",
  hiwTitle: "Цифрлық мәзірге дейін үш қадам",
  hiwSub: "Тіркелу, мәзір және үстелге QR — әзірлеушісіз әрі қосымшасыз.",
  steps: [
    {
      num: "1",
      title: "Аккаунт жасаңыз",
      text: "Тіркеліп, мекемені қосыңыз: атауы, мекенжайы және мәзірдің қысқа URL-і.",
    },
    {
      num: "2",
      title: "Мәзірді толтырыңыз",
      text: "Бөлімдер, тағамдар мен бағалар орысша және қазақша. Стоп-лист — бір басумен.",
    },
    {
      num: "3",
      title: "Үстелге QR қойыңыз",
      text: "Кодты жүктеп, кестені басып шығарыңыз — қонақ сканерлеп, мәзірді бірден көреді.",
    },
  ],
  advKicker: "Артықшылықтар",
  advTitle: "Мекемеге қажеттің бәрі",
  features: [
    {
      title: "Екі тіл: RU / KZ",
      text: "Мәзір бірден екі тілде, қонақ ыңғайлысын таңдайды.",
    },
    {
      title: "Стоп-парақ бір түртумен",
      text: "Тағам бітті — мәзірден бірден жасырдыңыз.",
    },
    {
      title: "Үстелден тапсырыс",
      text: "Қонақ даяшыны күтпей өзі тапсырыс береді.",
    },
    {
      title: "Даяшыны шақыру",
      text: "Бір батырма — көмек үстелге келеді.",
    },
    {
      title: "Kaspi QR арқылы шайпұл",
      text: "Қонақ командаға бір түртумен алғыс айтады.",
    },
    {
      title: "Сканерлеу аналитикасы",
      text: "Не жиі қаралып, тапсырыс берілетіні көрінеді.",
    },
    {
      title: "Бағаны бірден жаңарту",
      text: "Қағаз мәзірді қайта басусыз баға өзгертіңіз.",
    },
    {
      title: "Өз безендіруі",
      text: "Логотип, тағам фотосы және фирмалық түстер.",
    },
  ],
  cartTable: "7-үстел",
  cartTotal: "6 690 ₸",
  faqKicker: "Сұрақтар",
  faqTitle: "Жиі қойылатын сұрақтар",
  faqSub: "QR-мәзір қалай жұмыс істейтіні және іске қосу үшін не қажет екені туралы қысқаша.",
  faqItems: [
    {
      q: "Қонаққа қосымша орнату қажет пе?",
      a: "Жоқ. Қонақ үстелдегі QR-кодқа камераны бағыттайды да, мәзірді браузерден бірден көреді — ештеңе жүктеудің қажеті жоқ.",
    },
    {
      q: "Мәзір қай тілдерде жұмыс істейді?",
      a: "Мәзір екі тілде — орысша және қазақша. Қонақ тілді өзі ауыстырады, ал сіз кабинетте екі нұсқаны да толтырасыз.",
    },
    {
      q: "Мәзірді қаншалықты тез іске қосуға болады?",
      a: "Әдетте бірнеше минутта: тіркелесіз, бөлімдер мен тағамдарды қосасыз (немесе дайын үлгіні аласыз) және үстелге QR-кодты басып шығарасыз.",
    },
    {
      q: "Бағаны өзгертіп, тағамдарды стоп-параққа қоюға бола ма?",
      a: "Иә. Баға, сипаттама және стоп-парақ бір түртумен өзгереді — қонақ бірден жаңа мәзірді көреді, QR-кодты қайта басып шығарудың қажеті жоқ.",
    },
    {
      q: "Бұл қанша тұрады?",
      a: "Бір мәзірге тегін кезең бар. Одан әрі — мәзір қолжетімділігінің мерзіміне тіркелген төлем (жарты жыл немесе жыл); өзекті бағалар «Тарифтер» бөлімінде.",
    },
    {
      q: "Бастау үшін не қажет?",
      a: "Тек телефон немесе компьютер: тіркеліп, мәзірді толтырып, QR-кодты басып шығарасыз. Қосымша жабдық қажет емес.",
    },
  ],
  priceKicker: "Тарифтер",
  priceTitle: "Қарапайым әрі түсінікті тарифтер",
  priceSub: "Тегін бастаңыз да, мекеме өскен сайын кеңейіңіз.",
  popular: "Танымал таңдау",
  priceCustomTag: "Жеке шешім",
  planFree: {
    name: "Тегін",
    price: "0 ₸",
    period: "",
    desc: "Бір мәзір 1 айға — байқап көру",
    features: ["1 мәзір + QR-код", "Мәзірдің барлық функциялары", "1 айға қолжетімді"],
    cta: "Тегін бастау",
  },
  planStd: {
    name: "6 айға",
    price: "15 000 ₸",
    period: "/ 6 ай",
    desc: "Бір мәзір жарты жылға",
    features: ["1 мәзір + QR-код", "Мәзірдің барлық функциялары", "Дизайн және логотип", "6 айға қолжетімді"],
    cta: "Тарифті таңдау",
  },
  planPrem: {
    name: "Бір жылға",
    price: "25 000 ₸",
    period: "/ жыл",
    desc: "Бір мәзір бір жылға — тиімді",
    features: ["1 мәзір + QR-код", "Мәзірдің барлық функциялары", "Дизайн және логотип", "Бір жылға қолжетімді"],
    cta: "Тарифті таңдау",
  },
  ctaTitle: "Мәзірді бүгін іске қосыңыз",
  ctaSub: "Тіркелу бірнеше минут алады. Картасыз және міндеттемесіз.",
  ctaBtn: "Тегін бастау",
  footLinks: [
    { label: "Сервис туралы", href: "#how" },
    { label: "Тарифтер", href: "#pricing" },
    { label: "Сұрақтар", href: "#faq" },
    { label: "Байланыс", href: "#cta" },
  ],
  footRights: "© 2026 QR меню. Барлық құқықтар қорғалған.",
  waAria: "WhatsApp-қа жазу",
  waMessage: "Сәлеметсіз бе! QR меню туралы білгім келеді.",
  promoClose: "Жабу",
};

export const landingByLocale: Record<Locale, LandingCopy> = {
  ru: RU,
  kz: KZ,
};
