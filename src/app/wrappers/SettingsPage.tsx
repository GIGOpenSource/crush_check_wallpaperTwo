import { useView } from '../contexts/ViewContext';
import MobileSettingsPage from '../pages/SettingsPage';
import DesktopSettingsPage from '../desktop/DesktopSettingsPage';

export default function SettingsPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileSettingsPage /> : <DesktopSettingsPage />;
}
