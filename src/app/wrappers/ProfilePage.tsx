import { useView } from '../contexts/ViewContext';
import MobileProfilePage from '../pages/ProfilePage';
import DesktopProfilePage from '../desktop/DesktopProfilePage';

export default function ProfilePage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileProfilePage /> : <DesktopProfilePage />;
}
