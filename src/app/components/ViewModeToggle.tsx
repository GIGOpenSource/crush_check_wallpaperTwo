import { Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { Modal } from 'antd';
import { umengclick } from '../analytics/aplusTracking';
import { useView } from '../contexts/ViewContext';
import { useLanguage } from '../contexts/LanguageContext';

export function ViewModeToggle() {
  const { viewMode } = useView();
  const { t } = useLanguage();

  const handleToggle = () => {
    umengclick('filter_click_device');
    // 使用 antd Modal 提示下载app开发中
    Modal.info({
      title: t.common.tip,
      content: t.common.appDownloadInProgress,
      okText: t.common.gotIt,
      centered: true,
    });
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      type="button"
      onClick={handleToggle}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      title={t.nav.mobile}
    >
      <Smartphone size={18} className="text-gray-700" />
      <span className="text-sm font-medium text-gray-700">{t.nav.mobile}</span>
    </motion.button>
  );
}
