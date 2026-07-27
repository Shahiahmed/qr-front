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
 */

/** The reserved slug the guest router recognises as the built-in demo. */
export const DEMO_SLUG = "demo";

export const demoMenu: PublicMenu = {
  name: "Дастархан",
  slug: DEMO_SLUG,
  currency: "KZT",
  default_locale: "ru",
  address: "Алматы, пр. Достык, 132",
  phone: "+7 727 000 00 00",
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
        },
        {
          id: 102,
          name_ru: "Овсяная каша с ягодами",
          name_kk: "Жидек қосылған сұлы ботқасы",
          description_ru: null,
          description_kk: null,
          price: 140000,
          is_available: true,
        },
        {
          id: 103,
          name_ru: "Омлет с томатами и зеленью",
          name_kk: "Қызанақ пен көкөніс қосылған омлет",
          description_ru: null,
          description_kk: null,
          price: 170000,
          is_available: true,
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
        },
        {
          id: 202,
          name_ru: "Греческий салат",
          name_kk: "Грек салаты",
          description_ru: null,
          description_kk: null,
          price: 240000,
          is_available: true,
        },
        {
          id: 203,
          name_ru: "Ачичук с луком",
          name_kk: "Пиязбен ашшы-шүшік",
          description_ru: "Спелые томаты, тонкий лук и зелень — к плову и мясу.",
          description_kk: "Піскен қызанақ, жұқа пияз және көкөніс — палау мен етке.",
          price: 120000,
          is_available: true,
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
        },
        {
          id: 302,
          name_ru: "Плов ташкентский",
          name_kk: "Ташкент палауы",
          description_ru: "Рассыпчатый рис с бараниной, морковью и зирой из казана.",
          description_kk: "Қазандағы қой еті, сәбіз және зире қосылған палау.",
          price: 260000,
          is_available: true,
        },
        {
          id: 303,
          name_ru: "Манты (5 шт)",
          name_kk: "Мәнті (5 дана)",
          description_ru: null,
          description_kk: null,
          price: 220000,
          is_available: true,
        },
        {
          id: 304,
          name_ru: "Куырдак",
          name_kk: "Қуырдақ",
          description_ru: null,
          description_kk: null,
          price: 280000,
          is_available: true,
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
        },
        {
          id: 402,
          name_ru: "Лагман уйгурский",
          name_kk: "Ұйғыр лағманы",
          description_ru: null,
          description_kk: null,
          price: 240000,
          is_available: true,
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
        },
        {
          id: 502,
          name_ru: "Чизкейк «Нью-Йорк»",
          name_kk: "«Нью-Йорк» чизкейгі",
          description_ru: null,
          description_kk: null,
          price: 190000,
          is_available: true,
        },
        {
          id: 503,
          name_ru: "Мороженое ассорти",
          name_kk: "Балмұздақ ассорти",
          description_ru: null,
          description_kk: null,
          price: 110000,
          is_available: true,
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
        },
        {
          id: 602,
          name_ru: "Чай травяной (чайник)",
          name_kk: "Шөп шайы (шәйнек)",
          description_ru: null,
          description_kk: null,
          price: 160000,
          is_available: true,
        },
        {
          id: 603,
          name_ru: "Свежевыжатый апельсиновый сок",
          name_kk: "Жаңа сығылған апельсин шырыны",
          description_ru: null,
          description_kk: null,
          price: 160000,
          is_available: true,
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
        },
      ],
    },
  ],
};
