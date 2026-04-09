import { useView } from '../contexts/ViewContext';
import MobileRegisterPage from '../pages/RegisterPage';
import DesktopRegisterPage from '../desktop/DesktopRegisterPage';

export default function RegisterPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileRegisterPage /> : <DesktopRegisterPage />;
}
