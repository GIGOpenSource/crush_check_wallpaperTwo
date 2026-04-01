import { createContext, useContext, useState, ReactNode } from 'react';

type ViewMode = 'mobile' | 'desktop';

interface ViewContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  toggleViewMode: () => void;
}

const ViewContext = createContext<ViewContextType | undefined>(undefined);

export function ViewProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');

  const toggleViewMode = () => {
    setViewMode((prev) => (prev === 'mobile' ? 'desktop' : 'mobile'));
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
