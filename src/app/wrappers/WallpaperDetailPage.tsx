import { useView } from '../contexts/ViewContext';
import MobileWallpaperDetailPage from '../pages/WallpaperDetailPage';
import DesktopWallpaperDetailPage from '../desktop/DesktopWallpaperDetailPage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useWallpaperDetailFromRoute } from '../hooks/useWallpaperDetailFromRoute';
import { useParams } from 'react-router';

export default function WallpaperDetailPage() {
  const { viewMode } = useView();
  const { id } = useParams();
  const { wallpaper } = useWallpaperDetailFromRoute();
  
  // 壁纸详情页使用壁纸标题，如果没有则使用默认翻译
  const pageTitle = wallpaper?.title || 'wallpaperDetail';
  usePageTitle(pageTitle);
  
  return viewMode === 'mobile' ? <MobileWallpaperDetailPage /> : <DesktopWallpaperDetailPage />;
}
