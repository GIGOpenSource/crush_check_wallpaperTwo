import { useView } from '../contexts/ViewContext';
import MobileHomePage from '../pages/HomePage';
import DesktopHomePage from '../desktop/DesktopHomePage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useLocation } from 'react-router';

export default function HomePage() {
  const { viewMode } = useView();
  const location = useLocation();
  
  // 根据路由路径判断显示哪个标题
  const isTrending = location.pathname.includes('/trending');
  usePageTitle(isTrending ? 'trending' : 'home');
  
  return viewMode === 'mobile' ? <MobileHomePage /> : <DesktopHomePage />;
}
