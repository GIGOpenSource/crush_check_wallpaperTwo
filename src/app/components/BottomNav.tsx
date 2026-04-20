import { Link, useLocation } from 'react-router';
import { Home, Search, Tag, User, Upload, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUnreadCount } from '../hooks/useUnreadCount';

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const { unreadCount } = useUnreadCount();

  const navItems = [
    { icon: Home, label: t.nav.home, path: '/' },
    { icon: Search, label: t.nav.search, path: '/search' },
    { icon: Bell, label: t.nav.notifications, path: '/notifications', showBadge: true },
    { icon: Upload, label: t.nav.upload, path: '/upload' },
    { icon: User, label: t.nav.profile, path: '/profile' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center justify-center flex-1 h-full relative"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center relative"
              >
                <Icon
                  size={24}
                  className={`transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {/* 未读消息角标 */}
                {item.showBadge && unreadCount > 0 && (
                  <span className="absolute -top-1 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center -translate-x-1/2">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
                <span
                  className={`text-xs mt-1 transition-colors ${
                    isActive ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}