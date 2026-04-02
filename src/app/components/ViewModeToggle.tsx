import { Smartphone, Monitor } from 'lucide-react';
import { motion } from 'motion/react';
import { umengclick } from '../analytics/aplusTracking';
import { useView } from '../contexts/ViewContext';
import { useLanguage } from '../contexts/LanguageContext';

export function ViewModeToggle() {
  const { viewMode, toggleViewMode } = useView();
  const { t } = useLanguage();

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={() => {
        umengclick('filter_click_device');
        toggleViewMode();
      }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 h-11 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      title={`Switch to ${viewMode === 'mobile' ? t.nav.desktop : t.nav.mobile} view`}
    >
      {viewMode === 'mobile' ? (
        <>
          <Monitor size={20} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700">{t.nav.desktop}</span>
        </>
      ) : (
        <>
          <Smartphone size={20} className="text-gray-700" />
          <span className="text-sm font-medium text-gray-700">{t.nav.mobile}</span>
        </>
      )}
    </motion.button>
  );
}