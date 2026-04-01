import { useView } from '../contexts/ViewContext';
import MobileTagDetailPage from '../pages/TagDetailPage';
import DesktopTagDetailPage from '../desktop/DesktopTagDetailPage';

export default function TagDetailPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileTagDetailPage /> : <DesktopTagDetailPage />;
}