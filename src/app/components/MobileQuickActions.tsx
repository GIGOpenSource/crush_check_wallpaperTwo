import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export const MobileQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 12, y: 8 }); // 调整按钮位置，往上移动
  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage } = useLanguage();

  // 判断是否在搜索页面
  const isSearchPage = location.pathname === '/search';
  
  // 判断是否在首页（兼容 HashRouter 模式）
  // 在 HashRouter 中，需要同时检查 pathname 和 hash
  const currentPath = location.hash.replace('#', '') || location.pathname;
  const isHomePage = 
    currentPath === '/' || 
    currentPath === '' || 
    currentPath === '/trending';

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: 'CN' },
    { code: 'en', name: 'English', flag: 'EN' },
    { code: 'ja', name: '日本語', flag: 'JP' },
    { code: 'ko', name: '한국어', flag: 'KR' },
    { code: 'es', name: 'Español', flag: 'ES' },
    { code: 'fr', name: 'Français', flag: 'FR' },
  ];

  const currentLanguage = languageOptions.find((lang) => lang.code === language);

  // 首页固定位置在右上角
  useEffect(() => {
    if (isHomePage) {
      setPosition({ x: 12, y: 8 }); // 同步更新 useEffect 中的位置
    }
  }, [isHomePage]);

  // 如果不是首页，不渲染任何内容（必须在所有Hooks之后）
  if (!isHomePage) {
    return null;
  }

  const savePosition = (pos: { x: number; y: number }) => {
    localStorage.setItem('mobileQuickActionsPosition', JSON.stringify(pos));
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    hasDraggedRef.current = false;
    dragStartRef.current = { x: clientX - position.x, y: clientY - position.y };
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;
    
    const distance = Math.sqrt(
      Math.pow(clientX - dragStartRef.current.x - position.x, 2) + 
      Math.pow(clientY - dragStartRef.current.y - position.y, 2)
    );
    
    if (distance > 5) {
      hasDraggedRef.current = true;
    }
    
    let newX = clientX - dragStartRef.current.x;
    let newY = clientY - dragStartRef.current.y;
    
    // 边界检测
    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;
    
    newX = Math.max(0, Math.min(newX, maxX));
    newY = Math.max(0, Math.min(newY, maxY));
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    // 只在搜索页面保存拖拽位置
    if (isSearchPage) {
      savePosition(position);
    }
  };

  return (
    <div
      ref={buttonRef}
      className="fixed z-50"
      style={{
        right: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* 展开的菜单 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute ${
              isSearchPage ? 'top-12' : 'top-11'
            } right-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-w-[220px] max-h-[70vh]`}
          >
            {/* 语言切换部分 */}
            <div className="px-3 py-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-2">
                语言 / LANGUAGE
              </p>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as 'zh-CN' | 'en' | 'ja' | 'ko' | 'es' | 'fr');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                      language === lang.code 
                        ? 'bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-bold text-gray-800 w-8 text-center">
                      {lang.flag}
                    </span>
                    <span
                      className={`text-sm ${
                        language === lang.code ? 'text-blue-700 font-semibold' : 'text-gray-600 font-medium'
                      }`}
                    >
                      {lang.name}
                    </span>
                    {language === lang.code && (
                      <motion.div
                        layoutId="activeLang"
                        className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主按钮 - 固定在首页右上角 */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="h-9 px-3 rounded-full bg-white hover:bg-gray-50 border border-gray-300 shadow-md flex items-center justify-center gap-1.5 cursor-pointer transition-all"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-sm font-bold text-gray-800">
          {currentLanguage?.flag || 'CN'}
        </span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="w-4 h-4 text-gray-600"
        >
          <path d="m5 8 6 6" />
          <path d="m4 14 6-6 2-3" />
          <path d="M2 5h12" />
          <path d="M7 2h1" />
          <path d="m22 22-5-10-5 10" />
          <path d="M14 18h6" />
        </svg>
      </motion.button>
    </div>
  );
};
