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
};

export const authByLocale: Record<Locale, AuthCopy> = { ru: RU, kz: KZ };
