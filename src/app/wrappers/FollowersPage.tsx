import React from 'react';
import { useView } from '../contexts/ViewContext';
import { usePageTitle } from '../hooks/usePageTitle';
import FollowersPage from '../pages/FollowersPage';
import DesktopFollowersPage from '../desktop/DesktopFollowersPage';

export default function FollowersPageWrapper() {
  const { viewMode } = useView();
  usePageTitle('followers');
  
  const isDesktop = viewMode === 'desktop';
  
  return isDesktop ? <DesktopFollowersPage /> : <FollowersPage />;
}