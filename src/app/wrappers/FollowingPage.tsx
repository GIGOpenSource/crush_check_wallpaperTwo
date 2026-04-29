import React from 'react';
import { useView } from '../contexts/ViewContext';
import MobileFollowingPage from '../pages/FollowingPage';
import DesktopFollowingPage from '../desktop/DesktopFollowingPage';
import { usePageTitle } from '../hooks/usePageTitle';

export default function FollowingPageWrapper() {
  const { viewMode } = useView();
  usePageTitle('following');
  
  return viewMode === 'mobile' ? <MobileFollowingPage /> : <DesktopFollowingPage />;
}