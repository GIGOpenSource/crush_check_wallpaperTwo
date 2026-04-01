import { Link, useLocation } from 'react-router';
import { Home, Search, Tag, User, Upload, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export function DesktopSidebar() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.nav.home, path: '/' },
    { icon: Search, label: t.nav.search, path: '/search' },
    { icon: Tag, label: t.nav.tags, path: '/tags' },
    { icon: TrendingUp, label: t.nav.trending, path: '/trending' },
    { icon: Upload, label: t.nav.upload, path: '/upload' },
    { icon: User, label: t.nav.profile, path: '/profile' }
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">{t.home.title}</h1>
          <p className="text-sm text-gray-500 mt-1">{t.home.subtitle}</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktopActiveNav"
                        className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    )}
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
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