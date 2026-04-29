import { useView } from '../contexts/ViewContext';
import MobileRegisterPage from '../pages/RegisterPage';
import DesktopRegisterPage from '../desktop/DesktopRegisterPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function RegisterPage() {
  const { viewMode } = useView();
  usePageTitle('register');
  
  return viewMode === 'mobile' ? <MobileRegisterPage /> : <DesktopRegisterPage />;
}
