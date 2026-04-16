import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, MessageCircle, Share2, Home, Search, User, Upload, Bell } from 'lucide-react';
import { useViewMode } from '../contexts/ViewContext';

interface QuickActionItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  onClick?: () => void;
}

export const MobileQuickActions: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 }); // 默认右下角位置
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { viewMode } = useViewMode();

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

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging) return;
      
      let newX = moveEvent.clientX - startX;
      let newY = moveEvent.clientY - startY;
      
      // 边界检测
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      newX = Math.max(0, Math.min(newX, maxX));
      newY = Math.max(0, Math.min(newY, maxY));
      
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      savePosition({ x: position.x, y: position.y });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp, { once: true });
  };

  const quickActions: QuickActionItem[] = [
    { 
      id: 'home', 
      icon: <Home size={20} />, 
      label: '首页', 
      onClick: () => navigate('/') 
    },
    { 
      id: 'search', 
      icon: <Search size={20} />, 
      label: '搜索', 
      onClick: () => navigate('/search') 
    },
    { 
      id: 'upload', 
      icon: <Upload size={20} />, 
      label: '上传', 
      onClick: () => navigate('/upload') 
    },
    { 
      id: 'notifications', 
      icon: <Bell size={20} />, 
      label: '消息', 
      onClick: () => navigate('/notifications') 
    },
    { 
      id: 'profile', 
      icon: <User size={20} />, 
      label: '我的', 
      onClick: () => navigate('/profile') 
    },
  ];

  const toggleMenu = () => {
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div
      className={`fixed z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'scale-100' : 'scale-90'
      }`}
      style={{
        right: `${position.x}px`,
        bottom: `${position.y}px`,
        transform: `translateY(${isOpen ? '-10px' : '0'})`,
      }}
      ref={buttonRef}
    >
      {/* 快速操作菜单项 */}
      {isOpen && (
        <div className="absolute mb-2 flex flex-col items-end space-y-3 bottom-16 left-0 w-full">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className={`flex items-center bg-white dark:bg-gray-700 rounded-full px-4 py-2 shadow-lg animate-slide-up ${
                isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ transitionDelay: `${index * 50}ms` }}
              onClick={action.onClick}
            >
              <span className="mr-2 text-gray-700 dark:text-gray-200">{action.label}</span>
              <div className="p-2 rounded-full bg-blue-500 text-white">
                {action.icon}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* 主按钮 */}
      <div
        className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg flex items-center justify-center cursor-pointer hover:from-blue-600 hover:to-purple-600 transition-all"
        onMouseDown={handleMouseDown}
        onClick={toggleMenu}
        onTouchStart={(e) => {
          setIsDragging(true);
          const touch = e.touches[0];
          const startX = touch.clientX - position.x;
          const startY = touch.clientY - position.y;

          const handleTouchMove = (moveEvent: TouchEvent) => {
            if (!isDragging) return;
            
            let newX = moveEvent.touches[0].clientX - startX;
            let newY = moveEvent.touches[0].clientY - startY;
            
            // 边界检测
            const maxX = window.innerWidth - 60;
            const maxY = window.innerHeight - 60;
            
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            setPosition({ x: newX, y: newY });
          };

          const handleTouchEnd = () => {
            setIsDragging(false);
            savePosition({ x: position.x, y: position.y });
          };

          document.addEventListener('touchmove', handleTouchMove, { passive: false });
          document.addEventListener('touchend', handleTouchEnd, { once: true });
        }}
      >
        {isOpen ? (
          <div className="text-white font-bold">×</div>
        ) : (
          <div className="flex space-x-1">
            <Heart size={20} className="text-white" />
            <MessageCircle size={20} className="text-white" />
            <Share2 size={20} className="text-white" />
          </div>
        )}
      </div>
    </div>
  );
};