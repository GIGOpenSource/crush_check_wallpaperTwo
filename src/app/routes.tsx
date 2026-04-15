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
import LoginPage from './wrappers/LoginPage';
import RegisterPage from './wrappers/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';
import { LanguageToggle } from './components/LanguageToggle';
import { ViewModeToggle } from './components/ViewModeToggle';
import { setNavigateFunction } from '../api/request';

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

function ToggleButtons() {
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

function RootLayout() {
  return (
    <>
      <NavigateInitializer />
      <Outlet />
      <ToggleButtons />
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