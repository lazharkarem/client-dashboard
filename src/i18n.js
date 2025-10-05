import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        profile: "Profile",
        settings: "Settings",
        logout: "Logout",
      },
    },
    fr: {
      translation: {
        profile: "Profil",
        settings: "Paramètres",
        logout: "Se déconnecter",
      },
    },
    ar: {
      translation: {
        profile: "الملف الشخصي",
        settings: "الإعدادات",
        logout: "تسجيل الخروج",
      },
    },
  },
  lng: "fr", // اللغة الافتراضية
  fallbackLng: "en",
  interpolation: { escapeValue: false },
});

export default i18n;
