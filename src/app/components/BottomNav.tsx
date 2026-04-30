import { Link, useLocation } from 'react-router';
import { Home, Search, Tag, User, Upload, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUnreadCount } from '../hooks/useUnreadCount';

// tabBar 页面路由列表（精确匹配）
const TABBAR_ROUTES = ['/', '/search', '/notifications', '/tags', '/profile'];

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();
  const { unreadCount } = useUnreadCount();

  // 判断当前路由是否为 tabBar 页面
  // 注意：/profile 显示 tabBar，但 /profile/:userId（他人主页）不显示
  const isTabBarPage = TABBAR_ROUTES.some(route => {
    // 精确匹配路由
    if (location.pathname === route) {
      return true;
    }
    // 对于 /profile，需要排除 /profile/:userId 和 /profile/edit 等子路由
    if (route === '/profile') {
      return location.pathname === '/profile';
    }
    // 其他路由支持前缀匹配
    return location.pathname.startsWith(route + '/');
  });

  // 非 tabBar 页面不显示底部导航
  if (!isTabBarPage) {
    return null;
  }

  const navItems = [
    { icon: Home, label: t.nav.home, path: '/' },
    { icon: Search, label: t.nav.search, path: '/search' },
    { icon: Bell, label: t.nav.notifications, path: '/notifications', showBadge: true },
    { icon: Tag, label: t.nav.tags, path: '/tags' },
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
