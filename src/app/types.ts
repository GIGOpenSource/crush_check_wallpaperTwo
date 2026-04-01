// Type definitions for the wallpaper sharing platform

export interface Wallpaper {
  id: string;
  title: string;
  imageUrl: string;
  resolution: string;
  fileSize: string;
  uploadDate: string;
  uploader: User;
  tags: string[];
  views: number;
  downloads: number;
  likes: number;
  favorites: number;
  aspectRatio: string;
  colors: string[];
  purity: 'SFW' | 'Sketchy' | 'NSFW';
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  level: number;
  points: number;
  badges: Badge[];
  uploadedCount: number;
  favoritesCount: number;
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
}

export interface Tag {
  id: string;
  name: string;
  description?: string;
  wallpaperCount: number;
}

export interface SearchFilters {
  resolution?: string;
  aspectRatio?: string;
  colors?: string[];
  purity?: ('SFW' | 'Sketchy' | 'NSFW')[];
  sortBy?: 'relevance' | 'date' | 'views' | 'downloads';
}
