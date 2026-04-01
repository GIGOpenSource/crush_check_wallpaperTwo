import { useView } from '../contexts/ViewContext';
import MobileSearchPage from '../pages/SearchPage';
import DesktopSearchPage from '../desktop/DesktopSearchPage';

export default function SearchPage() {
  const { viewMode } = useView();
  return viewMode === 'mobile' ? <MobileSearchPage /> : <DesktopSearchPage />;
}
