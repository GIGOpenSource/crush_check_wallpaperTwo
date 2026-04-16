import React from 'react';
import { useView } from '../contexts/ViewContext';
import FollowersPage from '../pages/FollowersPage';
import DesktopFollowersPage from '../desktop/DesktopFollowersPage';

export default function FollowersPageWrapper() {
  const { viewMode } = useView();
  const isDesktop = viewMode === 'desktop';
  
  return isDesktop ? <DesktopFollowersPage /> : <FollowersPage />;
}