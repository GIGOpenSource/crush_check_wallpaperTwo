import { Wallpaper, User, Badge, Tag, Comment } from './types';

// Mock user data
export const currentUser: User = {
  id: '1',
  username: 'WallpaperLover',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
  level: 12,
  points: 5680,
  badges: [
    { id: 'b1', name: 'Early Adopter', icon: '🌟', description: 'Joined during beta' },
    { id: 'b2', name: 'Contributor', icon: '📸', description: 'Uploaded 50+ wallpapers' },
    { id: 'b3', name: 'Curator', icon: '🎨', description: 'Helped moderate content' }
  ],
  uploadedCount: 67,
  favoritesCount: 243
};

// Mock wallpapers data
export const mockWallpapers: Wallpaper[] = [
  {
    id: '1',
    title: 'Abstract Colorful Gradient',
    imageUrl: 'https://images.unsplash.com/photo-1705254613735-1abb457f8a60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhYnN0cmFjdCUyMGNvbG9yZnVsJTIwd2FsbHBhcGVyfGVufDF8fHx8MTc3NDU0NTQ3OXww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '4.2 MB',
    uploadDate: '2026-03-25',
    uploader: currentUser,
    tags: ['abstract', 'colorful', 'gradient', 'digital-art'],
    views: 15234,
    downloads: 3421,
    likes: 892,
    favorites: 456,
    aspectRatio: '16:9',
    colors: ['#FF6B9D', '#C44569', '#8B4789', '#5A67D8'],
    purity: 'SFW'
  },
  {
    id: '2',
    title: 'Mountain Landscape',
    imageUrl: 'https://images.unsplash.com/photo-1597434429739-2574d7e06807?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuYXR1cmUlMjBsYW5kc2NhcGUlMjB3YWxscGFwZXJ8ZW58MXx8fHwxNzc0NTk0OTg1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '2560x1440',
    fileSize: '3.8 MB',
    uploadDate: '2026-03-24',
    uploader: { ...currentUser, username: 'NaturePhotog', id: '2' },
    tags: ['nature', 'landscape', 'mountains', 'scenic'],
    views: 23451,
    downloads: 5678,
    likes: 1234,
    favorites: 789,
    aspectRatio: '16:9',
    colors: ['#2D5F5D', '#4A7C7A', '#6B9593', '#A3C4C2'],
    purity: 'SFW'
  },
  {
    id: '3',
    title: 'Minimalist Dark Waves',
    imageUrl: 'https://images.unsplash.com/photo-1686425374911-e0d752e09806?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsaXN0JTIwZGFyayUyMHdhbGxwYXBlcnxlbnwxfHx8fDE3NzQ1OTQ5ODV8MA&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '2.1 MB',
    uploadDate: '2026-03-23',
    uploader: { ...currentUser, username: 'MinimalDesign', id: '3' },
    tags: ['minimalist', 'dark', 'waves', 'simple'],
    views: 18765,
    downloads: 4321,
    likes: 987,
    favorites: 543,
    aspectRatio: '16:9',
    colors: ['#1A1A1A', '#2D2D2D', '#3F3F3F', '#545454'],
    purity: 'SFW'
  },
  {
    id: '4',
    title: 'Space Galaxy',
    imageUrl: 'https://images.unsplash.com/photo-1539321908154-04927596764d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMGdhbGF4eSUyMHdhbGxwYXBlcnxlbnwxfHx8fDE3NzQ1OTQ5ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '5.6 MB',
    uploadDate: '2026-03-22',
    uploader: { ...currentUser, username: 'SpaceExplorer', id: '4' },
    tags: ['space', 'galaxy', 'stars', 'cosmic'],
    views: 34567,
    downloads: 8901,
    likes: 2345,
    favorites: 1234,
    aspectRatio: '16:9',
    colors: ['#0A0E27', '#1B263B', '#415A77', '#778DA9'],
    purity: 'SFW'
  },
  {
    id: '5',
    title: 'City Skyline at Night',
    imageUrl: 'https://images.unsplash.com/photo-1513563326940-e76e4641069e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMG5pZ2h0fGVufDF8fHx8MTc3NDUwMTY1Nnww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '2560x1440',
    fileSize: '4.5 MB',
    uploadDate: '2026-03-21',
    uploader: { ...currentUser, username: 'UrbanShots', id: '5' },
    tags: ['city', 'skyline', 'night', 'urban', 'lights'],
    views: 28901,
    downloads: 6543,
    likes: 1567,
    favorites: 890,
    aspectRatio: '16:9',
    colors: ['#1A1B2E', '#2E3A59', '#4A5F8A', '#6B7FA8'],
    purity: 'SFW'
  },
  {
    id: '6',
    title: 'Ocean Waves Sunset',
    imageUrl: 'https://images.unsplash.com/photo-1604580826271-aa59d10b875a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMHdhdmVzJTIwc3Vuc2V0fGVufDF8fHx8MTc3NDU0OTA5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '6.1 MB',
    uploadDate: '2026-03-20',
    uploader: { ...currentUser, username: 'OceanVibes', id: '6' },
    tags: ['ocean', 'waves', 'sunset', 'beach', 'nature'],
    views: 41234,
    downloads: 9876,
    likes: 2789,
    favorites: 1567,
    aspectRatio: '16:9',
    colors: ['#FF6B6B', '#FFA07A', '#FFD93D', '#95E1D3'],
    purity: 'SFW'
  },
  {
    id: '7',
    title: 'Snowy Mountain Peak',
    imageUrl: 'https://images.unsplash.com/photo-1667899984179-cdd91b51b4c4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMHBlYWslMjBzbm93fGVufDF8fHx8MTc3NDU0OTA5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '2560x1440',
    fileSize: '3.9 MB',
    uploadDate: '2026-03-19',
    uploader: { ...currentUser, username: 'MountainClimber', id: '7' },
    tags: ['mountain', 'snow', 'peak', 'winter', 'nature'],
    views: 19876,
    downloads: 4567,
    likes: 1098,
    favorites: 678,
    aspectRatio: '16:9',
    colors: ['#E8F4F8', '#B8D4E0', '#7FA9C0', '#5585A2'],
    purity: 'SFW'
  },
  {
    id: '8',
    title: 'Tropical Beach Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1714412192114-61dca8f15f68?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwcGFyYWRpc2V8ZW58MXx8fHwxNzc0NTE3ODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '5.3 MB',
    uploadDate: '2026-03-18',
    uploader: { ...currentUser, username: 'BeachLover', id: '8' },
    tags: ['beach', 'tropical', 'paradise', 'ocean', 'vacation'],
    views: 36789,
    downloads: 8234,
    likes: 2156,
    favorites: 1345,
    aspectRatio: '16:9',
    colors: ['#00D9FF', '#00B8D4', '#0097A7', '#00796B'],
    purity: 'SFW'
  },
  {
    id: '9',
    title: 'Geometric Pattern',
    imageUrl: 'https://images.unsplash.com/photo-1651410603527-73ef3b396399?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnZW9tZXRyaWMlMjBwYXR0ZXJuJTIwZGVzaWdufGVufDF8fHx8MTc3NDUwMzQwNHww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '2560x1440',
    fileSize: '2.8 MB',
    uploadDate: '2026-03-17',
    uploader: { ...currentUser, username: 'PatternMaster', id: '9' },
    tags: ['geometric', 'pattern', 'abstract', 'design', 'modern'],
    views: 22345,
    downloads: 5432,
    likes: 1345,
    favorites: 789,
    aspectRatio: '16:9',
    colors: ['#FF6F61', '#D4A5A5', '#9F86C0', '#5B5EA6'],
    purity: 'SFW'
  },
  {
    id: '10',
    title: 'Forest Sunlight',
    imageUrl: 'https://images.unsplash.com/photo-1692997364986-29a017d99013?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmVlcyUyMHN1bmxpZ2h0fGVufDF8fHx8MTc3NDUyOTI4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '6.7 MB',
    uploadDate: '2026-03-16',
    uploader: { ...currentUser, username: 'ForestWalker', id: '10' },
    tags: ['forest', 'trees', 'sunlight', 'nature', 'green'],
    views: 31456,
    downloads: 7234,
    likes: 1876,
    favorites: 1123,
    aspectRatio: '16:9',
    colors: ['#2D5016', '#4A7C2C', '#6FA945', '#8BC34A'],
    purity: 'SFW'
  },
  {
    id: '11',
    title: 'Neon Cyberpunk',
    imageUrl: 'https://images.unsplash.com/photo-1618902345200-8c3fe6106608?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwbGlnaHRzJTIwY3liZXJwdW5rfGVufDF8fHx8MTc3NDU5NDk4OHww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '4.9 MB',
    uploadDate: '2026-03-15',
    uploader: { ...currentUser, username: 'CyberPunk2077', id: '11' },
    tags: ['neon', 'cyberpunk', 'futuristic', 'lights', 'urban'],
    views: 45678,
    downloads: 11234,
    likes: 3456,
    favorites: 2345,
    aspectRatio: '16:9',
    colors: ['#FF006E', '#FB5607', '#FFBE0B', '#8338EC'],
    purity: 'SFW'
  },
  {
    id: '12',
    title: 'Desert Sand Dunes',
    imageUrl: 'https://images.unsplash.com/photo-1669024513552-56127b2d0d85?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBzYW5kJTIwZHVuZXN8ZW58MXx8fHwxNzc0NTAxODY2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '2560x1440',
    fileSize: '3.4 MB',
    uploadDate: '2026-03-14',
    uploader: { ...currentUser, username: 'DesertNomad', id: '12' },
    tags: ['desert', 'sand', 'dunes', 'nature', 'minimalist'],
    views: 17890,
    downloads: 4123,
    likes: 987,
    favorites: 567,
    aspectRatio: '16:9',
    colors: ['#C2925D', '#D4A574', '#E5B88F', '#F5CCAA'],
    purity: 'SFW'
  },
  {
    id: '13',
    title: 'Aurora Borealis',
    imageUrl: 'https://images.unsplash.com/photo-1719167140397-c83fd38b98c5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXJvcmElMjBib3JlYWxpcyUyMG5pZ2h0fGVufDF8fHx8MTc3NDU5NDk4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '5.8 MB',
    uploadDate: '2026-03-13',
    uploader: { ...currentUser, username: 'AuroraChaser', id: '13' },
    tags: ['aurora', 'northern-lights', 'night', 'nature', 'sky'],
    views: 52341,
    downloads: 13456,
    likes: 4567,
    favorites: 3234,
    aspectRatio: '16:9',
    colors: ['#00FFA3', '#00E5A0', '#00CC9E', '#00B39B'],
    purity: 'SFW'
  },
  {
    id: '14',
    title: 'Cherry Blossom Spring',
    imageUrl: 'https://images.unsplash.com/photo-1617836250803-24873f080562?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGVycnklMjBibG9zc29tJTIwc3ByaW5nfGVufDF8fHx8MTc3NDU5NDk4OXww&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '2560x1440',
    fileSize: '4.7 MB',
    uploadDate: '2026-03-12',
    uploader: { ...currentUser, username: 'SpringLover', id: '14' },
    tags: ['cherry-blossom', 'spring', 'flowers', 'nature', 'pink'],
    views: 38765,
    downloads: 8901,
    likes: 2345,
    favorites: 1456,
    aspectRatio: '16:9',
    colors: ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9'],
    purity: 'SFW'
  },
  {
    id: '15',
    title: 'Waterfall Paradise',
    imageUrl: 'https://images.unsplash.com/photo-1760638135404-308b3a556cc5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjBuYXR1cmUlMjBncmVlbnxlbnwxfHx8fDE3NzQ1MjkyOTB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    resolution: '3840x2160',
    fileSize: '7.2 MB',
    uploadDate: '2026-03-11',
    uploader: { ...currentUser, username: 'WaterfallHunter', id: '15' },
    tags: ['waterfall', 'nature', 'green', 'scenic', 'water'],
    views: 44567,
    downloads: 10123,
    likes: 3012,
    favorites: 2134,
    aspectRatio: '16:9',
    colors: ['#00695C', '#00897B', '#26A69A', '#80CBC4'],
    purity: 'SFW'
  }
];

// Mock tags
export const mockTags: Tag[] = [
  { id: 't1', name: 'nature', description: 'Natural landscapes and scenery', wallpaperCount: 1245 },
  { id: 't2', name: 'abstract', description: 'Abstract and digital art', wallpaperCount: 892 },
  { id: 't3', name: 'space', description: 'Space, galaxies, and cosmic scenes', wallpaperCount: 567 },
  { id: 't4', name: 'city', description: 'Urban and city landscapes', wallpaperCount: 423 },
  { id: 't5', name: 'minimalist', description: 'Clean and simple designs', wallpaperCount: 789 },
  { id: 't6', name: 'mountains', description: 'Mountain landscapes', wallpaperCount: 356 },
  { id: 't7', name: 'ocean', description: 'Ocean and beach scenes', wallpaperCount: 445 },
  { id: 't8', name: 'cyberpunk', description: 'Futuristic and neon aesthetics', wallpaperCount: 234 }
];

// Mock comments
export const mockComments: Comment[] = [
  {
    id: 'c1',
    user: { ...currentUser, username: 'CommentUser1', id: 'u1' },
    content: 'Absolutely stunning wallpaper! The colors are perfect.',
    timestamp: '2026-03-26T10:30:00Z',
    likes: 23
  },
  {
    id: 'c2',
    user: { ...currentUser, username: 'CommentUser2', id: 'u2' },
    content: 'Great quality! Using this on all my devices now.',
    timestamp: '2026-03-25T15:45:00Z',
    likes: 15
  },
  {
    id: 'c3',
    user: { ...currentUser, username: 'CommentUser3', id: 'u3' },
    content: 'Beautiful composition. Thanks for sharing!',
    timestamp: '2026-03-24T09:20:00Z',
    likes: 8
  }
];

// Editor's picks for carousel
export const editorsPicks = mockWallpapers.slice(0, 5);

// Trending wallpapers
export const trendingWallpapers = [...mockWallpapers].sort((a, b) => b.views - a.views).slice(0, 10);
