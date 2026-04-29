import { useView } from '../contexts/ViewContext';
import MobileSiteInfoPage from '../pages/SiteInfoPage';
import DesktopSiteInfoPage from '../desktop/DesktopSiteInfoPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function SiteInfoPageWrapper() {
  const { viewMode } = useView();
  usePageTitle('siteInfo');
  
  return viewMode === 'mobile' ? <MobileSiteInfoPage /> : <DesktopSiteInfoPage />;
}
