import { Link, useLocation } from 'react-router';
import { useNavigate } from 'react-router';
import { Home, Search, Tag, TrendingUp, Upload, User, Settings, Bell } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useUnreadCount } from '../hooks/useUnreadCount';

export function DesktopSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { unreadCount } = useUnreadCount();

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
    <aside className="desktop-sidebar fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
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
          <h1 className="text-2xl font-bold text-gray-900">{t.home.title}</h1>
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
          <p className="text-xs text-gray-500">© 2026 WallHaven</p>
        </div>
      </div>
    </aside>
  );
}