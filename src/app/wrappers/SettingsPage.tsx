import { useView } from '../contexts/ViewContext';
import MobileSettingsPage from '../pages/SettingsPage';
import DesktopSettingsPage from '../desktop/DesktopSettingsPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function SettingsPage() {
  const { viewMode } = useView();
  usePageTitle('settings');
  
  return viewMode === 'mobile' ? <MobileSettingsPage /> : <DesktopSettingsPage />;
}
