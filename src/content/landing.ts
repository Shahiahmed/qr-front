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
  demoKicker: string;
  demoTitle: string;
  demoSub: string;
  demoCta: string;
  detailName: string;
  detailDesc: string;
  detailPrice: string;
  detailAdd: string;
  cartTitle: string;
  cartTable: string;
  cartTotalLabel: string;
  cartTotal: string;
  cartCheckout: string;
  cartCall: string;
  cartItems: { name: string; qty: number; price: string }[];
  priceKicker: string;
  priceTitle: string;
  priceSub: string;
  popular: string;
  planFree: PlanCopy;
  planStd: PlanCopy;
  planPrem: PlanCopy;
  ctaTitle: string;
  ctaSub: string;
  ctaBtn: string;
  footTag: string;
  footLinks: { label: string; href: string }[];
  footContactLabel: string;
  footEmail: string;
  footPhone: string;
  footCity: string;
  footRights: string;
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
  name: "Qmenu",
  logoLetter: "Q",
} as const;

const RU: LandingCopy = {
  meta: {
    title: "Qmenu — QR-меню для ресторанов",
    description:
      "Гости сканируют код и видят меню без приложения — на русском и казахском. Запуск за 2 минуты.",
  },
  navLogin: "Войти",
  navTry: "Попробовать бесплатно",
  navMenuOpen: "Открыть меню",
  navMenuClose: "Закрыть меню",
  languageAria: "Выбор языка",
  heroBadge: "Без установки приложения",
  heroTitle: "Меню по QR за 2 минуты",
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
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=640&h=480&q=72&auto=format&fit=crop",
    },
    {
      name: "Лагман уйгурский",
      desc: "ручная лапша, овощи",
      price: "2 100 ₸",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=640&h=480&q=72&auto=format&fit=crop",
    },
    {
      name: "Манты (5 шт)",
      desc: "сочная баранина",
      price: "1 890 ₸",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=640&h=480&q=72&auto=format&fit=crop",
    },
    {
      name: "Чай в чайнике",
      desc: "облепиха, мёд",
      price: "990 ₸",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=640&h=480&q=72&auto=format&fit=crop",
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
  demoKicker: "Демо",
  demoTitle: "Как это видит гость",
  demoSub: "Красивое меню, экран блюда и корзина с номером стола — всё в один тап.",
  demoCta: "Открыть живое демо",
  detailName: "Плов ташкентский",
  detailDesc: "Рассыпчатый рис, мраморная говядина, морковь и зира. Порция на одного.",
  detailPrice: "2 490 ₸",
  detailAdd: "Добавить в корзину",
  cartTitle: "Корзина",
  cartTable: "Стол №7",
  cartTotalLabel: "Итого",
  cartTotal: "6 690 ₸",
  cartCheckout: "Оформить заказ",
  cartCall: "или позвать официанта",
  cartItems: [
    { name: "Плов ташкентский", qty: 1, price: "2 490 ₸" },
    { name: "Лагман уйгурский", qty: 2, price: "4 200 ₸" },
  ],
  priceKicker: "Тарифы",
  priceTitle: "Простые и понятные тарифы",
  priceSub: "Начните бесплатно и расширяйтесь по мере роста заведения.",
  popular: "Популярный выбор",
  planFree: {
    name: "Бесплатный",
    price: "0 ₸",
    period: "навсегда",
    desc: "Чтобы попробовать и запустить меню",
    features: ["Меню + QR-код", "До 30 блюд", "Брендинг сервиса"],
    cta: "Начать бесплатно",
  },
  planStd: {
    name: "Стандарт",
    price: "9 900 ₸",
    period: "/ мес",
    desc: "Для одного заведения",
    features: ["Свой логотип и цвета", "Фото блюд", "Стоп-лист", "Аналитика сканирований"],
    cta: "Выбрать тариф",
  },
  planPrem: {
    name: "Премиум",
    price: "24 900 ₸",
    period: "/ мес",
    desc: "Для сетей и полного самообслуживания",
    features: ["Заказ со стола", "Вызов официанта", "Чаевые через Kaspi", "Несколько точек"],
    cta: "Выбрать тариф",
  },
  ctaTitle: "Запустите меню уже сегодня",
  ctaSub: "Регистрация занимает пару минут. Без карты и обязательств.",
  ctaBtn: "Начать бесплатно",
  footTag: "QR-меню для ресторанов и кафе. Меню, заказы и оплата — в одном сервисе.",
  footLinks: [
    { label: "О сервисе", href: "#how" },
    { label: "Тарифы", href: "#pricing" },
    { label: "Контакты", href: "#cta" },
    { label: "Публичная оферта", href: "#cta" },
  ],
  footContactLabel: "Контакты",
  footEmail: "hello@qmenu.kz",
  footPhone: "+7 700 000 00 00",
  footCity: "Алматы, Казахстан",
  footRights: "© 2026 Qmenu. Все права защищены.",
};

const KZ: LandingCopy = {
  meta: {
    title: "Qmenu — мейрамханаларға арналған QR-мәзір",
    description:
      "Қонақтар кодты сканерлеп, қосымшасыз мәзірді көреді — орысша және қазақша.",
  },
  navLogin: "Кіру",
  navTry: "Тегін тіркелу",
  navMenuOpen: "Мәзірді ашу",
  navMenuClose: "Мәзірді жабу",
  languageAria: "Тілді таңдау",
  heroBadge: "Қосымшасыз",
  heroTitle: "QR арқылы мәзір 2 минутта",
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
      image: "https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=640&h=480&q=72&auto=format&fit=crop",
    },
    {
      name: "Ұйғыр лағманы",
      desc: "қол кеспе, көкөніс",
      price: "2 100 ₸",
      image: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=640&h=480&q=72&auto=format&fit=crop",
    },
    {
      name: "Манты (5 дана)",
      desc: "шырынды қой еті",
      price: "1 890 ₸",
      image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=640&h=480&q=72&auto=format&fit=crop",
    },
    {
      name: "Шайнектегі шай",
      desc: "шырғанақ, бал",
      price: "990 ₸",
      image: "https://images.unsplash.com/photo-1571934811356-5cc061b6821f?w=640&h=480&q=72&auto=format&fit=crop",
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
  demoKicker: "Демо",
  demoTitle: "Мұны қонақ қалай көреді",
  demoSub: "Әдемі мәзір, тағам экраны және үстел нөмірі бар себет — бәрі бір түртумен.",
  demoCta: "Тірі демоны ашу",
  detailName: "Ташкент палауы",
  detailDesc: "Үгілмелі күріш, мәрмәр сиыр еті, сәбіз және зире. Бір адамдық.",
  detailPrice: "2 490 ₸",
  detailAdd: "Себетке қосу",
  cartTitle: "Себет",
  cartTable: "7-үстел",
  cartTotalLabel: "Барлығы",
  cartTotal: "6 690 ₸",
  cartCheckout: "Тапсырысты рәсімдеу",
  cartCall: "немесе даяшыны шақыру",
  cartItems: [
    { name: "Ташкент палауы", qty: 1, price: "2 490 ₸" },
    { name: "Ұйғыр лағманы", qty: 2, price: "4 200 ₸" },
  ],
  priceKicker: "Тарифтер",
  priceTitle: "Қарапайым әрі түсінікті тарифтер",
  priceSub: "Тегін бастаңыз да, мекеме өскен сайын кеңейіңіз.",
  popular: "Танымал таңдау",
  planFree: {
    name: "Тегін",
    price: "0 ₸",
    period: "мәңгі",
    desc: "Байқап көру және іске қосу үшін",
    features: ["Мәзір + QR-код", "30 тағамға дейін", "Сервис брендингі"],
    cta: "Тегін бастау",
  },
  planStd: {
    name: "Стандарт",
    price: "9 900 ₸",
    period: "/ ай",
    desc: "Бір мекемеге",
    features: ["Өз логотипі мен түстері", "Тағам фотосы", "Стоп-парақ", "Сканерлеу аналитикасы"],
    cta: "Тарифті таңдау",
  },
  planPrem: {
    name: "Премиум",
    price: "24 900 ₸",
    period: "/ ай",
    desc: "Желілер мен толық өзіне-өзі қызмет ету үшін",
    features: ["Үстелден тапсырыс", "Даяшыны шақыру", "Kaspi арқылы шайпұл", "Бірнеше нүкте"],
    cta: "Тарифті таңдау",
  },
  ctaTitle: "Мәзірді бүгін іске қосыңыз",
  ctaSub: "Тіркелу бірнеше минут алады. Картасыз және міндеттемесіз.",
  ctaBtn: "Тегін бастау",
  footTag:
    "Мейрамханалар мен кафеге арналған QR-мәзір. Мәзір, тапсырыс және төлем — бір сервисте.",
  footLinks: [
    { label: "Сервис туралы", href: "#how" },
    { label: "Тарифтер", href: "#pricing" },
    { label: "Байланыс", href: "#cta" },
    { label: "Жария оферта", href: "#cta" },
  ],
  footContactLabel: "Байланыс",
  footEmail: "hello@qmenu.kz",
  footPhone: "+7 700 000 00 00",
  footCity: "Алматы, Қазақстан",
  footRights: "© 2026 Qmenu. Барлық құқықтар қорғалған.",
};

export const landingByLocale: Record<Locale, LandingCopy> = {
  ru: RU,
  kz: KZ,
};
