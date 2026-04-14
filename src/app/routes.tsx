import React from 'react';
import { createBrowserRouter } from 'react-router';
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

export const router = createBrowserRouter([
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
]);