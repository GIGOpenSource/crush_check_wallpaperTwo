import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './app/App';
import './app/analytics/aplusRouterSubscription';
import './app/analytics/pageLifecycle';
import './styles/index.css';
// 必须在 Capacitor 初始化前导入，以便保存原生 fetch 引用
import './api/nativeFetch';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);