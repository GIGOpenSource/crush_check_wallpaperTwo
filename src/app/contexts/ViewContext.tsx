import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'mobile' | 'desktop';

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

// 检测设备类型
function detectDeviceType(): ViewMode {
  // 检测是否为移动设备
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth < 768;
  
  return isMobile ? 'mobile' : 'desktop';
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => {
    // 始终根据设备类型自动判断，不再读取 localStorage
    return detectDeviceType();
  });

  // 监听窗口大小变化，自动切换视图模式
  useEffect(() => {
    const handleResize = () => {
      const newMode = detectDeviceType();
      setViewModeState(newMode);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const setViewMode = (mode: ViewMode) => {
    // 保留此方法以兼容现有代码，但不再保存到 localStorage
    setViewModeState(mode);
  };

  const toggleViewMode = () => {
    // 保留此方法以兼容现有代码
    setViewModeState((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'));
  };

  return (
    <ViewContext.Provider value={{ viewMode, setViewMode, toggleViewMode }}>
      {children}
    </ViewContext.Provider>
  );
}

export function useView() {
  const context = useContext(ViewContext);
  if (!context) {
    throw new Error('useView must be used within ViewProvider');
  }
  return context;
}