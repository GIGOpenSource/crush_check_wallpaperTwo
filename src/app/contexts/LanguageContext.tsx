import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language } from '../locales/translations';
import { setCurrentLanguage } from '../../api/request';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations[Language];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 从 localStorage 读取保存的语言，如果没有则默认为英文
const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem('app-language');
  return (saved as Language) || 'en';
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  // 封装 setLanguage，同时保存到 localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const t = translations[language];

  // 当语言变化时，同步更新 request.ts 中的全局语言状态
  useEffect(() => {
    setCurrentLanguage(language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
