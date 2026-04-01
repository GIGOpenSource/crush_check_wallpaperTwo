import { createBrowserRouter } from 'react-router';
import HomePage from './wrappers/HomePage';
import WallpaperDetailPage from './wrappers/WallpaperDetailPage';
import TagsPage from './wrappers/TagsPage';
import TagDetailPage from './wrappers/TagDetailPage';
import SearchPage from './wrappers/SearchPage';
import ProfilePage from './wrappers/ProfilePage';
import UploadPage from './wrappers/UploadPage';
import SettingsPage from './wrappers/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/wallpaper/:id',
    element: <WallpaperDetailPage />
  },
  {
    path: '/tags',
    element: <TagsPage />
  },
  {
    path: '/tag/:tagName',
    element: <TagDetailPage />
  },
  {
    path: '/search',
    element: <SearchPage />
  },
  {
    path: '/profile',
    element: <ProfilePage />
  },
  {
    path: '/profile/:userId',
    element: <ProfilePage />
  },
  {
    path: '/upload',
    element: <UploadPage />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  },
  {
    path: '/trending',
    element: <HomePage />
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
          <p className="text-gray-600">Page not found</p>
        </div>
      </div>
    )
  }
]);