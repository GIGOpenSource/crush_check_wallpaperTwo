import { Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={toggleTheme}
      className="fixed top-4 right-20 z-50 flex items-center gap-2 px-4 py-2 h-11 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all"
      title={isDarkMode ? '切换到浅色模式' : '切换到深色模式'}
    >
      <motion.div
        initial={false}
        animate={{ rotate: isDarkMode ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        {isDarkMode ? (
          <Moon size={20} className="text-blue-600" />
        ) : (
          <Sun size={20} className="text-yellow-500" />
        )}
      </motion.div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
        {isDarkMode ? '深色' : '浅色'}
      </span>
    </motion.button>
  );
}
