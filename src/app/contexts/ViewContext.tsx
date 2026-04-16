import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type ViewMode = 'mobile' | 'desktop';

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

// 检测设备类型
function getDefaultViewMode(): ViewMode {
  // 优先使用用户上次保存的选择
  const savedMode = localStorage.getItem('viewMode');
  if (savedMode === 'mobile' || savedMode === 'desktop') {
    return savedMode;
  }
  
  // 如果没有保存的选择，根据设备类型自动判断
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) 
    || window.innerWidth < 768;
  
  return isMobile ? 'mobile' : 'desktop';
}

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>(getDefaultViewMode());

  // 保存用户选择到 localStorage
  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  const setViewMode = (mode: ViewMode) => {
    setViewModeState(mode);
  };

  const toggleViewMode = () => {
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
