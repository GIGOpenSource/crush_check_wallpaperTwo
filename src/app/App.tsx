import { App as AntdApp, ConfigProvider, theme } from 'antd';
import { RouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';
import { ViewProvider } from './contexts/ViewContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { SidebarProvider } from './components/DesktopSidebar';
import { UnreadCountProvider } from './contexts/UnreadCountContext';

function AntdThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme: currentTheme } = useTheme();
  
  return (
    <ConfigProvider
      theme={{
        algorithm: currentTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorBgBase: currentTheme === 'dark' ? '#0a1628' : '#ffffff',
          colorText: currentTheme === 'dark' ? '#e8eef5' : '#0a1628',
          colorBorder: currentTheme === 'dark' ? '#1e3a5f' : 'rgba(0, 0, 0, 0.1)',
          colorBgContainer: currentTheme === 'dark' ? '#0f1f36' : '#ffffff',
          colorBgElevated: currentTheme === 'dark' ? '#0f1f36' : '#ffffff',
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <ThemeProvider>
          <AntdThemeWrapper>
            <AntdApp>
              <ViewProvider>
                <SidebarProvider>
                  <UnreadCountProvider>
                    <RouterProvider router={router} />
                  </UnreadCountProvider>
                </SidebarProvider>
              </ViewProvider>
            </AntdApp>
          </AntdThemeWrapper>
        </ThemeProvider>
      </LanguageProvider>
    </HelmetProvider>
  );
}
