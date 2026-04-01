import { useView } from '../contexts/ViewContext';
import MobileHomePage from '../pages/HomePage';
import DesktopHomePage from '../desktop/DesktopHomePage';

export default function HomePage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileHomePage /> : <DesktopHomePage />;
}
