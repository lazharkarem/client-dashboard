import React from "react";
import { useTranslation } from "react-i18next";

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      {["fr", "en", "ar"].map((lng) => (
        <button
          key={lng}
          onClick={() => changeLanguage(lng)}
          className={`px-2 py-1 rounded-md text-sm transition ${
            i18n.language === lng
              ? "bg-white text-indigo-600 font-bold"
              : "bg-indigo-600 text-white"
          }`}
        >
          {lng.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
