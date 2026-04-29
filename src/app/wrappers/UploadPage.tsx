import { useView } from '../contexts/ViewContext';
import MobileUploadPage from '../pages/UploadPage';
import DesktopUploadPage from '../desktop/DesktopUploadPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function UploadPage() {
  const { viewMode } = useView();
  usePageTitle('upload');
  
  return viewMode === 'mobile' ? <MobileUploadPage /> : <DesktopUploadPage />;
}
