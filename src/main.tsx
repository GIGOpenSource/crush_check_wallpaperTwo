import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './app/App';
import './app/analytics/aplusRouterSubscription';
import './app/analytics/pageLifecycle';
import './styles/index.css';

function setSafeArea() {
  const safeAreaTop = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--safe-area-inset-top')) || 0;
  const safeAreaTopEnv = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('env(safe-area-inset-top)')) || 0;
  const finalSafeAreaTop = Math.max(safeAreaTop, safeAreaTopEnv);
  
  if (finalSafeAreaTop > 0) {
    document.documentElement.style.setProperty('--safe-area-top', `${finalSafeAreaTop}px`);
    document.body.style.paddingTop = `${finalSafeAreaTop}px`;
  }
}

setSafeArea();
window.addEventListener('resize', setSafeArea);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);