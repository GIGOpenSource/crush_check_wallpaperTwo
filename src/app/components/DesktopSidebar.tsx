import { Link, useLocation } from 'react-router';
import { useNavigate } from 'react-router';
import { Home, Search, Tag, TrendingUp, Upload, User, Settings, Bell, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUnreadCount } from '../hooks/useUnreadCount';
import { useState, createContext, useContext } from 'react';
import { motion } from 'framer-motion';

// 创建侧边栏上下文
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

// 自定义 Hook 用于访问侧边栏状态
export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

// 侧边栏提供者组件
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { unreadCount } = useUnreadCount();
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const handleNavClick = (path: string, isHome?: boolean) => {
    // Home 菜单特殊处理：直接修改 window.location 确保 URL 带有尾部斜杠
    if (isHome) {
      // 使用 window.location.replace 确保 URL 为 /markwallpapers/
      window.location.pathname = '/markwallpapers/';
    } else {
      navigate(path);
    }
  };

  const navItems = [
    { icon: Home, label: t.nav.home, path: '/' },
    { icon: Search, label: t.nav.search, path: '/search' },
    { icon: Bell, label: t.nav.notifications, path: '/notifications', showBadge: true },
    { icon: Tag, label: t.nav.tags, path: '/tags' },
    { icon: TrendingUp, label: t.nav.trending, path: '/trending' },
    { icon: Upload, label: t.nav.upload, path: '/upload' },
    { icon: User, label: t.nav.profile, path: '/profile' }
  ];

  return (
    <>
      {/* 折叠后的图标菜单 */}
      <aside 
        className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-16 block' : 'w-0 hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo - 简化版 */}
          <div className="p-4 border-b border-gray-200 flex justify-center items-center h-16">
            <span className="text-lg font-bold text-blue-600">MW</span>
          </div>

          {/* Navigation Icons Only */}
          <nav className="flex-1 p-2" aria-label="Main">
            <ul className="space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      data-active={isActive ? 'true' : undefined}
                      className={`flex items-center justify-center w-full py-3 rounded-lg transition-colors relative group ${
                        isActive ? 'bg-blue-50' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.25 : 2} className={isActive ? 'text-blue-600' : 'text-gray-600'} />
                      
                      {/* Tooltip */}
                      <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50">
                        {item.label}
                        {item.showBadge && unreadCount > 0 && (
                          <span className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[16px] h-4 px-1 inline-flex items-center justify-center">
                            {unreadCount > 99 ? '99+' : unreadCount}
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      {/* 完整的侧边栏 */}
      <aside 
        className={`desktop-sidebar fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-40 transition-all duration-300 ${
          isCollapsed ? 'w-0 hidden' : 'w-64 block'
        }`}
      >
        {/* 设置按钮 - 右上角 */}
        <button
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors"
          aria-label="设置"
        >
          <Settings size={20} className="text-gray-600" />
        </button>

        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-800">{t.home.title}</h1>
            <p className="text-sm text-gray-500 mt-1">{t.home.subtitle}</p>
          </div>

          {/* Navigation */}
          <nav className="desktop-sidebar-nav flex-1 p-4" aria-label="Main">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      data-active={isActive ? 'true' : undefined}
                      className={`desktop-sidebar-link flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive ? 'font-semibold' : 'hover:bg-gray-50'
                      }`}
                    >
                      <Icon size={20} strokeWidth={isActive ? 2.25 : 2} />
                      <span className="font-medium">{item.label}</span>
                      {/* 未读消息角标 */}
                      {item.showBadge && unreadCount > 0 && (
                        <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">© 2026 MarkWallpaperss</p>
          </div>
        </div>
      </aside>

      {/* 折叠/展开按钮 - 放在页面右上角，与语言切换按钮样式一致 */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="fixed top-4 right-54 z-50 flex items-center gap-2 px-5 py-2 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
        aria-label={isCollapsed ? '展开侧边栏' : '折叠侧边栏'}
        // title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <PanelLeftOpen size={18} className="text-gray-700" />
        ) : (
          <PanelLeftClose size={18} className="text-gray-700" />
        )}
      </motion.button>
    </>
  );
}
