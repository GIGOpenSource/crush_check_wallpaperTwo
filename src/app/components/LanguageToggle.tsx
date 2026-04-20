import { Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Language } from '../locales/translations';

const languageOptions: { code: Language; name: string; flag: string }[] = [
  { code: 'zh-CN', name: '简体中文', flag: 'CN' },
  { code: 'en', name: 'English', flag: 'GB' },
  { code: 'ja', name: '日本語', flag: 'JP' },
  { code: 'ko', name: '한국어', flag: 'KR' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'fr', name: 'Français', flag: 'FR' },
];

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languageOptions.find((lang) => lang.code === language);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div ref={menuRef} className="fixed top-4 right-32 z-50">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 h-11 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title="Change language"
      >
        <span className="text-sm font-semibold">{currentLanguage?.flag}</span>
        <Languages size={18} className="text-gray-700" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-14 right-0 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden min-w-[220px]"
          >
            {languageOptions.map((lang) => (
              <motion.button
                key={lang.code}
                whileHover={{ x: 4 }}
                onClick={() => {
                  setLanguage(lang.code);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${
                  language === lang.code 
                    ? 'bg-gradient-to-r from-blue-50 to-blue-100' 
                    : 'hover:bg-gray-50'
                }`}
              >
                <span className="text-sm font-bold text-gray-800 w-8 text-center">
                  {lang.flag}
                </span>
                <span
                  className={`text-sm ${
                    language === lang.code ? 'text-blue-700 font-semibold' : 'text-gray-700 font-medium'
                  }`}
                >
                  {lang.name}
                </span>
                {language === lang.code && (
                  <motion.div
                    layoutId="activeLanguage"
                    className="ml-auto w-2.5 h-2.5 bg-blue-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}