import { useState } from 'react';
import { Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { umengclick } from '../analytics/aplusTracking';
import { useView } from '../contexts/ViewContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomModal } from './CustomModal';

export function ViewModeToggle() {
  const { viewMode } = useView();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const handleToggle = () => {
    umengclick('filter_click_device');
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.95 }}
        type="button"
        onClick={handleToggle}
        className="fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 bg-card border-2 border-border rounded-full shadow-lg hover:shadow-xl transition-shadow"
        title={t.nav.mobile}
      >
        <Smartphone size={18} className="text-foreground" />
        <span className="text-sm font-medium text-foreground">{t.nav.mobile}</span>
      </motion.button>
      <CustomModal
        visible={showModal}
        onClose={handleClose}
        title={t.common.tip}
        content={t.common.appDownloadInProgress}
        okText={t.common.gotIt}
      />
    </>
  );
}
