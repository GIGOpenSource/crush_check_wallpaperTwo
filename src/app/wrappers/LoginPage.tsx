import { useView } from '../contexts/ViewContext';
import MobileLoginPage from '../pages/LoginPage';
import DesktopLoginPage from '../desktop/DesktopLoginPage';

export default function LoginPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileLoginPage /> : <DesktopLoginPage />;
}
