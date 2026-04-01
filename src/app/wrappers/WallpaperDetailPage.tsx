import { useView } from '../contexts/ViewContext';
import MobileWallpaperDetailPage from '../pages/WallpaperDetailPage';
import DesktopWallpaperDetailPage from '../desktop/DesktopWallpaperDetailPage';

export default function WallpaperDetailPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileWallpaperDetailPage /> : <DesktopWallpaperDetailPage />;
}
