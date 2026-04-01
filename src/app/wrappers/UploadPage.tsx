import { useView } from '../contexts/ViewContext';
import MobileUploadPage from '../pages/UploadPage';
import DesktopUploadPage from '../desktop/DesktopUploadPage';

export default function UploadPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileUploadPage /> : <DesktopUploadPage />;
}
