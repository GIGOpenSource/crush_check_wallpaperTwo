import { useView } from '../contexts/ViewContext';
import MobileEditProfilePage from '../pages/EditProfilePage';
import DesktopEditProfilePage from '../desktop/DesktopEditProfilePage';

export default function EditProfilePage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileEditProfilePage /> : <DesktopEditProfilePage />;
}
