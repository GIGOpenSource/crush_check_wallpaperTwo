import { useView } from '../contexts/ViewContext';
import MobileTagDetailPage from '../pages/TagDetailPage';
import DesktopTagDetailPage from '../desktop/DesktopTagDetailPage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLocation } from 'react-router';
import type { TagDetailLocationState } from '../types/tagDetailNav';
import { useParams } from 'react-router';

export default function TagDetailPage() {
  const { viewMode } = useView();
  const location = useLocation();
  const { tagId } = useParams();
  
  const state = location.state as TagDetailLocationState | null;
  const meta = state?.tagMeta;
  const decodedId = tagId ? decodeURIComponent(tagId).trim() : '';
  
  // 优先使用标签名称，其次使用标签ID
  const tagName = meta?.name || decodedId || 'tagDetail';
  usePageTitle(tagName);
  
  return viewMode === 'mobile' ? <MobileTagDetailPage /> : <DesktopTagDetailPage />;
}
