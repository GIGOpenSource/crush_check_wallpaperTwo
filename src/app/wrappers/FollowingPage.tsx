import React from 'react';
import { useView } from '../contexts/ViewContext';
import FollowingPage from '../pages/FollowingPage';
import DesktopFollowingPage from '../desktop/DesktopFollowingPage';

export default function FollowingPageWrapper() {
  const { viewMode } = useView();
  const isDesktop = viewMode === 'desktop';
  
  return isDesktop ? <DesktopFollowingPage /> : <FollowingPage />;
}