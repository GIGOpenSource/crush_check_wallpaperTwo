import React, { useEffect } from 'react';
import { createHashRouter, useNavigate, useLocation, Outlet } from 'react-router';
import { AplusPageShell } from './analytics/AplusPageShell';
import HomePage from './wrappers/HomePage';
import WallpaperDetailPage from './wrappers/WallpaperDetailPage';
import TagsPage from './wrappers/TagsPage';
import TagDetailPage from './wrappers/TagDetailPage';
import SearchPage from './wrappers/SearchPage';
import ProfilePage from './wrappers/ProfilePage';
import EditProfilePage from './wrappers/EditProfilePage';
import UploadPage from './wrappers/UploadPage';
import SettingsPage from './wrappers/SettingsPage';
import SiteInfoPage from './wrappers/SiteInfoPageWrapper';
import LoginPage from './wrappers/LoginPage';
import RegisterPage from './wrappers/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import NotificationsPage from './wrappers/NotificationsPage';
import FollowingPage from './wrappers/FollowingPage';
import FollowersPage from './wrappers/FollowersPage';
import { LanguageToggle } from './components/LanguageToggle';
import { ViewModeToggle } from './components/ViewModeToggle';
import { MobileQuickActions } from './components/MobileQuickActions';
import { setNavigateFunction } from '../api/request';
import { useView } from './contexts/ViewContext';

// 用于设置navigate函数的组件
function NavigateInitializer() {
  const navigate = useNavigate();
  
  useEffect(() => {
    // 将navigate函数传递给request模块
    setNavigateFunction(navigate);
  }, [navigate]);
  
  return null;
}

// 不需要显示视图切换按钮的路由
const HIDDEN_TOGGLE_ROUTES = ['/login', '/register'];

// 桌面端切换按钮组件
function DesktopToggleButtons() {
  const location = useLocation();
  const shouldHide = HIDDEN_TOGGLE_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  if (shouldHide) {
    return null;
  }

  return (
    <>
      <LanguageToggle />
      <ViewModeToggle />
    </>
  );
}

// 移动端快捷操作按钮组件
function MobileToggleButtons() {
  const location = useLocation();
  const shouldHide = HIDDEN_TOGGLE_ROUTES.some(route => 
    location.pathname === route || location.pathname.startsWith(route + '/')
  );

  if (shouldHide) {
    return null;
  }

  return <MobileQuickActions />;
}

// 根据视图模式切换按钮
function SmartToggleButtons() {
  const { viewMode } = useView();
  
  return viewMode === 'mobile' ? <MobileToggleButtons /> : <DesktopToggleButtons />;
}

function RootLayout() {
  return (
    <>
      <NavigateInitializer />
      <Outlet />
      <SmartToggleButtons />
    </>
  );
}

export const router = createHashRouter([
  {
    element: <RootLayout />,
    children: [
      {
        path: '/',
        element: <AplusPageShell />,
        children: [
          {
            index: true,
            element: <HomePage />
          },
          {
            path: 'wallpaper/:id',
            element: <WallpaperDetailPage />
          },
          {
            path: 'tags',
            element: <TagsPage />
          },
          {
            path: 'tag/:tagId',
            element: <TagDetailPage />
          },
          {
            path: 'search',
            element: <SearchPage />
          },
          {
            path: 'profile',
            element: <ProfilePage />
          },
          {
            path: 'profile/:userId',
            element: <ProfilePage />
          },
          {
            path: 'profile/edit',
            element: <EditProfilePage />
          },
          {
            path: 'upload',
            element: <UploadPage />
          },
          {
            path: 'settings',
            element: <SettingsPage />
          },
          {
            path: 'site-info/:type',
            element: <SiteInfoPage />
          },
          {
            path: 'notifications',
            element: <NotificationsPage />
          },
          {
            path: 'following',
            element: <FollowingPage />
          },
          {
            path: 'followers',
            element: <FollowersPage />
          },
          {
            path: 'trending',
            element: <HomePage />
          },
          {
            path: 'login',
            element: <LoginPage />
          },
          {
            path: 'register',
            element: <RegisterPage />
          },
          {
            path: '*',
            element: <NotFoundPage />
          }
        ]
      }
    ]
  }
]);
