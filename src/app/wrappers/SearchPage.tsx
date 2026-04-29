import { useView } from '../contexts/ViewContext';
import MobileSearchPage from '../pages/SearchPage';
import DesktopSearchPage from '../desktop/DesktopSearchPage';
import { usePageTitle } from '../hooks/usePageTitle';
import { useSearchParams } from 'react-router';

export default function SearchPage() {
  const { viewMode } = useView();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // 如果有搜索关键词则显示"Search: xxx"，否则显示"Search"
  if (query) {
    usePageTitle('searchWithQuery', { query });
  } else {
    usePageTitle('search');
  }
  
  return viewMode === 'mobile' ? <MobileSearchPage /> : <DesktopSearchPage />;
}
