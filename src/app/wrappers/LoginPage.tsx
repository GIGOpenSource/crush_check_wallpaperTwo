import { useView } from '../contexts/ViewContext';
import MobileLoginPage from '../pages/LoginPage';
import DesktopLoginPage from '../desktop/DesktopLoginPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function LoginPage() {
  const { viewMode } = useView();
  usePageTitle('login');
  
  return viewMode === 'mobile' ? <MobileLoginPage /> : <DesktopLoginPage />;
}
