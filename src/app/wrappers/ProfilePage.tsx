import { useView } from '../contexts/ViewContext';
import MobileProfilePage from '../pages/ProfilePage';
import DesktopProfilePage from '../desktop/DesktopProfilePage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useUserProfile } from '../hooks/useUserProfile';
import { useSearchParams } from 'react-router';

export default function ProfilePage() {
  const { viewMode } = useView();
  const [searchParams] = useSearchParams();
  const otherId = searchParams.get('other_id');
  
  // 获取用户信息以显示昵称
  const { profile } = useUserProfile(otherId || undefined);
  
  // 优先使用用户昵称，其次使用用户名，最后使用默认翻译
  const userName = profile?.nickname || profile?.username || 'profile';
  usePageTitle(userName);
  
  return viewMode === 'mobile' ? <MobileProfilePage /> : <DesktopProfilePage />;
}
