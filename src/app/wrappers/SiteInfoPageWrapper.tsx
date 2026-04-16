import SiteInfoPage from '../pages/SiteInfoPage';
import DesktopSiteInfoPage from '../desktop/DesktopSiteInfoPage';
import { useView } from '../contexts/ViewContext';

export default function SiteInfoPageWrapper() {
  const { viewMode } = useView();
  
  return viewMode === 'desktop' ? <DesktopSiteInfoPage /> : <SiteInfoPage />;
}
