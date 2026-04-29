import { useView } from '../contexts/ViewContext';
import MobileTagsPage from '../pages/TagsPage';
import DesktopTagsPage from '../desktop/DesktopTagsPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function TagsPage() {
  const { viewMode } = useView();
  usePageTitle('tags');
  
  return viewMode === 'mobile' ? <MobileTagsPage /> : <DesktopTagsPage />;
}
