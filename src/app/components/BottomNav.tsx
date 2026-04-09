import { Link, useLocation } from 'react-router';
import { Home, Search, Tag, User, Upload } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export function BottomNav() {
  const location = useLocation();
  const { t } = useLanguage();

  const navItems = [
    { icon: Home, label: t.nav.home, path: '/' },
    { icon: Search, label: t.nav.search, path: '/search' },
    { icon: Tag, label: t.nav.tags, path: '/tags' },
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
              className="flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className="flex flex-col items-center"
              >
                <Icon
                  size={24}
                  className={`transition-colors ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
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