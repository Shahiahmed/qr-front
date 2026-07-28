import type { PublicMenu } from "@/lib/guestMenuTypes";

/**
 * A ready-made sample menu served at `/m/demo`.
 *
 * It renders through the real `GuestMenu` component, so a prospect sees the
 * actual guest experience — not a mockup. Kept as static content on purpose:
 * the demo must open on the marketing site with no backend and no database,
 * exactly as the public landing does.
 *
 * Prices are in minor units (тиыны, 1/100 ₸) like real menu data. One dish is
 * marked unavailable so the stop-list treatment shows up in the demo.
 *
 * Photos are hotlinked from Unsplash (sized + auto-format at the edge) — good
 * enough for a demo with no backend. Real menus get owner uploads later, which
 * is why `image_url` is optional; Айран is left without one on purpose so the
 * photo-less card also shows in the demo.
 */

/** The reserved slug the guest router recognises as the built-in demo. */
export const DEMO_SLUG = "demo";

/** Unsplash CDN URL sized for a guest menu card. */
const photo = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=640&h=480&q=72&auto=format&fit=crop`;

/** Wider crop for the venue cover above the menu. */
const cover = (id: string) =>
  `https://images.unsplash.com/photo-${id}?w=1200&h=640&q=75&auto=format&fit=crop`;

export const demoMenu: PublicMenu = {
  name: "Дастархан",
  slug: DEMO_SLUG,
  currency: "KZT",
  default_locale: "ru",
  address: "Алматы, пр. Достык, 132",
  phone: "+7 727 000 00 00",
  cover_url: cover("1517248135467-4c7edcad34c4"),
  // Inline SVG emblem so the demo showcases the centred logo without a file.
  logo_url:
    "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%20100%20100'%3E%3Crect%20width%3D'100'%20height%3D'100'%20rx%3D'22'%20fill%3D'%23161616'%2F%3E%3Ccircle%20cx%3D'50'%20cy%3D'50'%20r%3D'38'%20fill%3D'none'%20stroke%3D'%23d8a24a'%20stroke-width%3D'3'%2F%3E%3Ctext%20x%3D'50'%20y%3D'63'%20font-family%3D'Georgia%2C%20%22Times%20New%20Roman%22%2C%20serif'%20font-size%3D'40'%20font-weight%3D'700'%20fill%3D'%23d8a24a'%20text-anchor%3D'middle'%3E%D0%94%3C%2Ftext%3E%3C%2Fsvg%3E",
  wifi_ssid: "Dastarkhan_Guest",
  wifi_password: "dastar2024",
  instagram_url: "https://instagram.com/dastarkhan",
  facebook_url: "https://facebook.com/dastarkhan",
  tiktok_url: "https://tiktok.com/@dastarkhan",
  categories: [
    {
      id: 1,
      name_ru: "Завтраки",
      name_kk: "Таңғы ас",
      dishes: [
        {
          id: 101,
          name_ru: "Сырники со сметаной",
          name_kk: "Қаймақпен ірімшік құймақ",
          description_ru: "Творожные сырники, подаются со сметаной и ягодным джемом.",
          description_kk: "Ірімшік құймақ, қаймақ пен жидек джемімен беріледі.",
          price: 190000,
          is_available: true,
          image_url: photo("1567620905732-2d1ec7ab7445"),
        },
        {
          id: 102,
          name_ru: "Овсяная каша с ягодами",
          name_kk: "Жидек қосылған сұлы ботқасы",
          description_ru: null,
          description_kk: null,
          price: 140000,
          is_available: true,
          image_url: photo("1517673400267-0251440c45dc"),
        },
        {
          id: 103,
          name_ru: "Омлет с томатами и зеленью",
          name_kk: "Қызанақ пен көкөніс қосылған омлет",
          description_ru: null,
          description_kk: null,
          price: 170000,
          is_available: true,
          image_url: photo("1510693206972-df098062cb71"),
        },
      ],
    },
    {
      id: 2,
      name_ru: "Салаты",
      name_kk: "Салаттар",
      dishes: [
        {
          id: 201,
          name_ru: "Цезарь с курицей",
          name_kk: "Тауық етті «Цезарь»",
          description_ru: "Салат ромэн, куриное филе гриль, пармезан и фирменный соус.",
          description_kk: "Ромэн салаты, грильдегі тауық еті, пармезан және фирмалық тұздық.",
          price: 290000,
          is_available: true,
          image_url: photo("1551248429-40975aa4de74"),
        },
        {
          id: 202,
          name_ru: "Греческий салат",
          name_kk: "Грек салаты",
          description_ru: null,
          description_kk: null,
          price: 240000,
          is_available: true,
          image_url: photo("1512621776951-a57141f2eefd"),
        },
        {
          id: 203,
          name_ru: "Ачичук с луком",
          name_kk: "Пиязбен ашшы-шүшік",
          description_ru: "Спелые томаты, тонкий лук и зелень — к плову и мясу.",
          description_kk: "Піскен қызанақ, жұқа пияз және көкөніс — палау мен етке.",
          price: 120000,
          is_available: true,
          image_url: photo("1540189549336-e6e99c3679fe"),
        },
      ],
    },
    {
      id: 3,
      name_ru: "Национальная кухня",
      name_kk: "Ұлттық ас",
      dishes: [
        {
          id: 301,
          name_ru: "Бешбармак",
          name_kk: "Бешбармақ",
          description_ru: "Отварная говядина и конина с домашней раскатанной лапшой и луковым соусом.",
          description_kk: "Үй кеспесі мен пияз тұздығына қосылған сиыр және жылқы еті.",
          price: 390000,
          is_available: true,
          image_url: photo("1633945274405-b6c8069047b0"),
        },
        {
          id: 302,
          name_ru: "Плов ташкентский",
          name_kk: "Ташкент палауы",
          description_ru: "Рассыпчатый рис с бараниной, морковью и зирой из казана.",
          description_kk: "Қазандағы қой еті, сәбіз және зире қосылған палау.",
          price: 260000,
          is_available: true,
          image_url: photo("1603133872878-684f208fb84b"),
        },
        {
          id: 303,
          name_ru: "Манты (5 шт)",
          name_kk: "Мәнті (5 дана)",
          description_ru: null,
          description_kk: null,
          price: 220000,
          is_available: true,
          image_url: photo("1563245372-f21724e3856d"),
        },
        {
          id: 304,
          name_ru: "Куырдак",
          name_kk: "Қуырдақ",
          description_ru: null,
          description_kk: null,
          price: 280000,
          is_available: true,
          image_url: photo("1631292784640-2b24be784d5d"),
        },
      ],
    },
    {
      id: 4,
      name_ru: "Горячее",
      name_kk: "Ыстық тағамдар",
      dishes: [
        {
          id: 401,
          name_ru: "Стейк рибай",
          name_kk: "Рибай стейк",
          description_ru: "Мраморная говядина на гриле, прожарка на выбор.",
          description_kk: "Грильдегі мәрмәр сиыр еті, қуыру дәрежесі таңдау бойынша.",
          price: 690000,
          is_available: true,
          image_url: photo("1432139509613-5c4255815697"),
        },
        {
          id: 402,
          name_ru: "Лагман уйгурский",
          name_kk: "Ұйғыр лағманы",
          description_ru: null,
          description_kk: null,
          price: 240000,
          is_available: true,
          image_url: photo("1563379926898-05f4575a45d8"),
        },
        {
          id: 403,
          name_ru: "Дорадо на гриле",
          name_kk: "Грильдегі дорадо",
          description_ru: "Целая рыба на гриле с лимоном и травами.",
          description_kk: "Лимон мен шөптермен грильде пісірілген тұтас балық.",
          price: 480000,
          // On the stop list, so the demo shows the "sold out" treatment.
          is_available: false,
          image_url: photo("1467003909585-2f8a72700288"),
        },
      ],
    },
    {
      id: 5,
      name_ru: "Десерты",
      name_kk: "Тәтті",
      dishes: [
        {
          id: 501,
          name_ru: "Медовик",
          name_kk: "Балды торт",
          description_ru: "Классический медовый торт с нежным сметанным кремом.",
          description_kk: "Нәзік қаймақ кремі бар классикалық балды торт.",
          price: 150000,
          is_available: true,
          image_url: photo("1565958011703-44f9829ba187"),
        },
        {
          id: 502,
          name_ru: "Чизкейк «Нью-Йорк»",
          name_kk: "«Нью-Йорк» чизкейгі",
          description_ru: null,
          description_kk: null,
          price: 190000,
          is_available: true,
          image_url: photo("1524351199678-941a58a3df50"),
        },
        {
          id: 503,
          name_ru: "Мороженое ассорти",
          name_kk: "Балмұздақ ассорти",
          description_ru: null,
          description_kk: null,
          price: 110000,
          is_available: true,
          image_url: photo("1551024506-0bccd828d307"),
        },
      ],
    },
    {
      id: 6,
      name_ru: "Напитки",
      name_kk: "Сусындар",
      dishes: [
        {
          id: 601,
          name_ru: "Капучино",
          name_kk: "Капучино",
          description_ru: null,
          description_kk: null,
          price: 130000,
          is_available: true,
          image_url: photo("1541167760496-1628856ab772"),
        },
        {
          id: 602,
          name_ru: "Чай травяной (чайник)",
          name_kk: "Шөп шайы (шәйнек)",
          description_ru: null,
          description_kk: null,
          price: 160000,
          is_available: true,
          image_url: photo("1571934811356-5cc061b6821f"),
        },
        {
          id: 603,
          name_ru: "Свежевыжатый апельсиновый сок",
          name_kk: "Жаңа сығылған апельсин шырыны",
          description_ru: null,
          description_kk: null,
          price: 160000,
          is_available: true,
          image_url: photo("1600271886742-f049cd451bba"),
        },
        {
          id: 604,
          name_ru: "Айран",
          name_kk: "Айран",
          description_ru: null,
          description_kk: null,
          price: 50000,
          is_available: true,
        },
        {
          id: 605,
          name_ru: "Компот из сухофруктов",
          name_kk: "Кептірілген жеміс компоты",
          description_ru: null,
          description_kk: null,
          price: 60000,
          is_available: true,
          image_url: photo("1556679343-c7306c1976bc"),
        },
      ],
    },
  ],
};
