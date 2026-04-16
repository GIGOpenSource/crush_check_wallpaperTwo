import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { translations, Language, TranslationKey } from '../locales/translations';
import { setCurrentLanguage } from '../../api/request';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKey;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh-CN');

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
