"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "th" | "en";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (thText: string, enText: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "th",
  setLang: () => {},
  toggleLang: () => {},
  t: (thText: string, enText: string) => thText,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>("th");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("gts_lang") as Language;
      if (savedLang === "th" || savedLang === "en") {
        setLangState(savedLang);
      }
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("gts_lang", newLang);
      document.cookie = `gts_lang=${newLang}; path=/; max-age=31536000`;
    }
  };

  const toggleLang = () => {
    setLang(lang === "th" ? "en" : "th");
  };

  const t = (thText: string, enText: string): string => {
    return lang === "en" ? enText : thText;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
