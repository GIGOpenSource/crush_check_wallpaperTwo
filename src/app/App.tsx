import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ViewProvider } from './contexts/ViewContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { ViewModeToggle } from './components/ViewModeToggle';
import { LanguageToggle } from './components/LanguageToggle';

export default function App() {
  return (
    <LanguageProvider>
      <ViewProvider>
        <LanguageToggle />
        <ViewModeToggle />
        <RouterProvider router={router} />
      </ViewProvider>
    </LanguageProvider>
  );
}