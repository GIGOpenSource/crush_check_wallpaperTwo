import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Info, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface CustomModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  content: string;
  okText: string;
}

export function CustomModal({ visible, onClose, title, content, okText }: CustomModalProps) {
  const { theme } = useTheme();
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 200);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          >
            {/* 遮罩层 */}
            <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/60' : 'bg-black/50'}`} />

            {/* 弹窗内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className={`relative w-full max-w-md rounded-lg shadow-xl overflow-hidden ${theme === 'dark'
                ? 'bg-[#0f1f36] border border-[#1e3a5f]'
                : 'bg-white border border-gray-200'
                }`}
            >
              {/* 头部 */}
              <div className="flex  gap-3 p-4 relative">
                <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full ${theme === 'dark' ? 'bg-blue-600/20' : 'bg-blue-50'
                  }`}>
                  <Info size={16} className={`${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>

                {/* 标题 + 内容 同行显示 */}
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <h3 className={`text-base font-semibold whitespace-nowrap ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {title}
                  </h3>
                  {/* 内容放在这里（红色区域） */}
                  <span className={`text-sm truncate ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    {content}
                  </span>
                </div>

                {/* 关闭按钮 */}
                <button
                  onClick={handleClose}
                  className={`absolute top-3 right-3 p-1 rounded transition-colors ${theme === 'dark'
                      ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                      : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                    }`}
                >
                  <X size={16} />
                </button>
              </div>

              {/* 底部 */}
              <div className="flex justify-end p-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleClose}
                  className={`px-6 py-2 rounded-lg text-sm font-medium text-white transition-colors ${theme === 'dark'
                    ? 'bg-blue-600 hover:bg-blue-500'
                    : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {okText}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}