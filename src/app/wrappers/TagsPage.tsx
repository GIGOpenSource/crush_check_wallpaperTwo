import { useView } from '../contexts/ViewContext';
import MobileTagsPage from '../pages/TagsPage';
import DesktopTagsPage from '../desktop/DesktopTagsPage';

export default function TagsPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileTagsPage /> : <DesktopTagsPage />;
}
