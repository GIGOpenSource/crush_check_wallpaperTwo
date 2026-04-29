import { useView } from '../contexts/ViewContext';
import MobileEditProfilePage from '../pages/EditProfilePage';
import DesktopEditProfilePage from '../desktop/DesktopEditProfilePage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function EditProfilePage() {
  const { viewMode } = useView();
  usePageTitle('editProfile');
  
  return viewMode === 'mobile' ? <MobileEditProfilePage /> : <DesktopEditProfilePage />;
}
