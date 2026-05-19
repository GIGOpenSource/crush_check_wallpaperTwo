import { useView } from '../contexts/ViewContext';
import MobileWallpaperDetailPage from '../pages/WallpaperDetailPage';
import DesktopWallpaperDetailPage from '../desktop/DesktopWallpaperDetailPage';

export default function WallpaperDetailPage() {
  const { viewMode } = useView();
  
  // 壁纸详情页的标题由 Helmet 组件管理，使用 SEO 接口数据
  // 不再使用 usePageTitle，避免覆盖 SEO 标题
  
  return viewMode === 'mobile' ? <MobileWallpaperDetailPage /> : <DesktopWallpaperDetailPage />;
}
