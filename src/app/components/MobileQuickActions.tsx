import React, { useState, useEffect, useRef } from 'react';
import { Globe, Monitor, Smartphone, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useView } from '../contexts/ViewContext';
import { useLanguage } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export const MobileQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 100 }); // 默认右侧居中位置
  const buttonRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  
  const navigate = useNavigate();
  const { viewMode, setViewMode } = useView();
  const { language, setLanguage } = useLanguage();

  const languageOptions = [
    { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
  ];

  const currentLanguage = languageOptions.find((lang) => lang.code === language);

  // 记住上次的位置
  useEffect(() => {
    const savedPosition = localStorage.getItem('mobileQuickActionsPosition');
    if (savedPosition) {
      try {
        setPosition(JSON.parse(savedPosition));
      } catch (e) {
        console.error('Failed to parse position from localStorage', e);
      }
    }
  }, []);

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
    savePosition(position);
  };

  const handleClick = () => {
    // 只有没有拖拽时才切换菜单
    if (!hasDraggedRef.current) {
      setIsOpen(!isOpen);
    }
  };

  const switchToMobile = () => {
    setViewMode('mobile');
    setIsOpen(false);
  };

  const switchToDesktop = () => {
    setViewMode('desktop');
    setIsOpen(false);
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
            className="absolute top-16 right-0 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden min-w-[220px] max-h-[70vh]"
          >
            {/* 语言切换部分 */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                语言 / Language
              </p>
              <div className="space-y-1 max-h-[30vh] overflow-y-auto">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as 'zh-CN' | 'en' | 'ja' | 'ko' | 'es' | 'fr');
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                      language === lang.code ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span
                      className={`text-sm font-medium ${
                        language === lang.code ? 'text-blue-600' : 'text-gray-700'
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

            {/* 视图切换部分 */}
            <div className="px-4 py-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                视图 / View Mode
              </p>
              <div className="space-y-1">
                <button
                  onClick={switchToMobile}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    viewMode === 'mobile' ? 'bg-blue-50' : ''
                  }`}
                >
                  <Smartphone size={18} className={viewMode === 'mobile' ? 'text-blue-600' : 'text-gray-600'} />
                  <span className={`text-sm font-medium ${viewMode === 'mobile' ? 'text-blue-600' : 'text-gray-700'}`}>
                    移动版
                  </span>
                  {viewMode === 'mobile' && (
                    <motion.div
                      layoutId="activeView"
                      className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                    />
                  )}
                </button>
                <button
                  onClick={switchToDesktop}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors ${
                    viewMode === 'desktop' ? 'bg-blue-50' : ''
                  }`}
                >
                  <Monitor size={18} className={viewMode === 'desktop' ? 'text-blue-600' : 'text-gray-600'} />
                  <span className={`text-sm font-medium ${viewMode === 'desktop' ? 'text-blue-600' : 'text-gray-700'}`}>
                    桌面版
                  </span>
                  {viewMode === 'desktop' && (
                    <motion.div
                      layoutId="activeView"
                      className="ml-auto w-2 h-2 bg-blue-600 rounded-full"
                    />
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 主按钮 */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full bg-blue-600 shadow-lg flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-all"
        onMouseDown={(e) => handleDragStart(e.clientX, e.clientY)}
        onMouseMove={(e) => handleDragMove(e.clientX, e.clientY)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={(e) => {
          const touch = e.touches[0];
          handleDragStart(touch.clientX, touch.clientY);
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0];
          handleDragMove(touch.clientX, touch.clientY);
        }}
        onTouchEnd={handleDragEnd}
        onClick={handleClick}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white"
        >
          {isOpen ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
        </motion.div>
      </motion.button>
    </div>
  );
};
