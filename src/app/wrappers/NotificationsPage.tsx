import { useView } from '../contexts/ViewContext';
import MobileNotificationsPage from '../pages/NotificationsPage';
import DesktopNotificationsPage from '../desktop/DesktopNotificationsPage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useUnreadCount } from '../hooks/useUnreadCount';

export default function NotificationsPage() {
  const { viewMode } = useView();
  const { unreadCount } = useUnreadCount();
  
  // 如果有未读消息则显示"Notifications (X)"，否则显示"Notifications"
  if (unreadCount > 0) {
    usePageTitle('notifications', { count: unreadCount });
  } else {
    usePageTitle('notifications');
  }
  
  return viewMode === 'mobile' ? <MobileNotificationsPage /> : <DesktopNotificationsPage />;
}
