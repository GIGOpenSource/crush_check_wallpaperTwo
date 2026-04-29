import { App as AntdApp } from 'antd';
import { RouterProvider } from 'react-router';
import { HelmetProvider } from 'react-helmet-async';
import { router } from './routes';
import { ViewProvider } from './contexts/ViewContext';
import { LanguageProvider } from './contexts/LanguageContext';

export default function App() {
  return (
    <HelmetProvider>
      <LanguageProvider>
        <AntdApp>
          <ViewProvider>
            <RouterProvider router={router} />
          </ViewProvider>
        </AntdApp>
      </LanguageProvider>
    </HelmetProvider>
  );
}