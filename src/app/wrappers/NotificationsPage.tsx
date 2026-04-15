import { useView } from '../contexts/ViewContext';
import MobileNotificationsPage from '../pages/NotificationsPage';
import DesktopNotificationsPage from '../desktop/DesktopNotificationsPage';

export default function NotificationsPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileNotificationsPage /> : <DesktopNotificationsPage />;
}
