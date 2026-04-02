import { App } from 'antd';
import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { mockComments, currentUser } from '../mockData';
import { useLanguage } from '../contexts/LanguageContext';
import { useGuessYouLikeRelated } from '../hooks/useGuessYouLikeRelated';
import { useWallpaperDetailFromRoute } from '../hooks/useWallpaperDetailFromRoute';
import { useWallpaperDetailShareUrl } from '../hooks/useWallpaperDetailShareUrl';
import { copyTextToClipboard, openWallpaperShareChannel } from '../utils/wallpaperShareActions';
import { tpl } from '../utils/format';
import { downloadWallpaperImage } from '../utils/downloadWallpaperImage';
import {
  Download,
  Heart,
  Share2,
  Eye,
  Calendar,
  User,
  ChevronLeft,
  MessageCircle,
  Bookmark,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function DesktopWallpaperDetailPage() {
  const { message } = App.useApp();
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallpaper, loading, error } = useWallpaperDetailFromRoute();
  const shareUrl = useWallpaperDetailShareUrl();
  const { relatedWallpapers, loadingRelated } = useGuessYouLikeRelated(id);
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [downloading, setDownloading] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
      </div>
    );
  }

  if (!wallpaper || error) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">{t.wallpaperDetail.wallpaperNotFound}</p>
        </div>
      </div>
    );
  }

  const handleDownload = async () => {
    if (downloading || !wallpaper.imageUrl) return;
    setDownloading(true);
    try {
      const result = await downloadWallpaperImage(wallpaper.imageUrl, wallpaper.title);
      if (result === 'opened-tab') {
        alert(t.wallpaperDetail.downloadOpenInNewTab);
      } else if (result === 'failed') {
        alert(t.wallpaperDetail.downloadFailed);
      }
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft size={24} className="text-gray-900" />
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex-1">{wallpaper.title}</h1>
            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                isFavorited
                  ? 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Bookmark size={20} className={isFavorited ? 'fill-yellow-600' : ''} />
              <span className="font-medium">
                {isFavorited ? t.wallpaperDetail.saved : t.wallpaperDetail.save}
              </span>
            </button>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-8">
              {/* Main Content - Left Column */}
              <div className="col-span-2 space-y-6">
                {/* Wallpaper Image */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={wallpaper.imageUrl}
                      alt={wallpaper.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-6">
                    <MessageCircle size={24} className="text-gray-700" />
                    <h3 className="text-xl font-bold text-gray-900">
                      {t.wallpaperDetail.comments} ({mockComments.length})
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {mockComments.map((comment) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-semibold text-gray-900">
                              {comment.user.username}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-2">{comment.content}</p>
                          <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                            <Heart size={14} />
                            <span>{tpl(t.wallpaperDetail.commentLikes, { n: comment.likes })}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {(loadingRelated || relatedWallpapers.length > 0) && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      {t.wallpaperDetail.relatedWallpapers}
                    </h3>
                    {loadingRelated ? (
                      <p className="py-8 text-center text-gray-500">{t.common.loading}</p>
                    ) : (
                      <DesktopWallpaperGrid wallpapers={relatedWallpapers} columns={3} />
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar - Right Column */}
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDownload}
                    disabled={downloading}
                    className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:pointer-events-none"
                  >
                    <Download size={20} />
                    {downloading ? t.common.loading : t.wallpaperDetail.download}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setIsLiked(!isLiked)}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                      isLiked
                        ? 'bg-red-50 text-red-600 hover:bg-red-100'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Heart size={20} className={isLiked ? 'fill-red-600' : ''} />
                    {isLiked ? t.wallpaperDetail.liked : t.wallpaperDetail.like}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                  >
                    <Share2 size={20} />
                    {t.wallpaperDetail.share}
                  </motion.button>
                </div>

                {/* Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.statistics}</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye size={18} />
                        <span>{t.wallpaperDetail.views}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(wallpaper.views)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Download size={18} />
                        <span>{t.wallpaperDetail.downloads}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(wallpaper.downloads)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart size={18} />
                        <span>{t.wallpaperDetail.likes}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(wallpaper.likes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.details}</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.wallpaperDetail.resolution}</span>
                      <span className="font-medium text-gray-900">{wallpaper.resolution}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.wallpaperDetail.fileSize}</span>
                      <span className="font-medium text-gray-900">{wallpaper.fileSize}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.wallpaperDetail.aspectRatio}</span>
                      <span className="font-medium text-gray-900">{wallpaper.aspectRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t.wallpaperDetail.uploadDate}</span>
                      <span className="font-medium text-gray-900">
                        {new Date(wallpaper.uploadDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Uploader */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.uploader}</h4>
                  <Link
                    to={`/profile/${wallpaper.uploader.id}`}
                    className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{wallpaper.uploader.username}</p>
                      <p className="text-sm text-gray-500">
                        {t.wallpaperDetail.level} {wallpaper.uploader.level} •{' '}
                        {wallpaper.uploader.points} {t.wallpaperDetail.points}
                      </p>
                    </div>
                    <ExternalLink size={18} className="text-gray-400" />
                  </Link>
                </div>

                {/* Tags */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.tagsHeading}</h4>
                  <div className="flex flex-wrap gap-2">
                    {wallpaper.tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/tag/${tag}`}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareSheet && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowShareSheet(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl z-50 p-8 w-full max-w-md"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6">{t.wallpaperDetail.shareWallpaper}</h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {(
                  [
                    ['copy', t.wallpaperDetail.copyLink],
                    ['tw', t.wallpaperDetail.shareTwitter],
                    ['fb', t.wallpaperDetail.shareFacebook],
                    ['wa', t.wallpaperDetail.shareWhatsApp],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="flex flex-col items-center gap-2"
                    onClick={async () => {
                      if (!shareUrl) return;
                      if (key === 'copy') {
                        const ok = await copyTextToClipboard(shareUrl);
                        if (ok) message.success(t.wallpaperDetail.linkCopied);
                      } else if (key === 'tw') {
                        openWallpaperShareChannel('twitter', shareUrl);
                      } else if (key === 'fb') {
                        openWallpaperShareChannel('facebook', shareUrl);
                      } else if (key === 'wa') {
                        openWallpaperShareChannel('whatsapp', shareUrl);
                      }
                      setShowShareSheet(false);
                    }}
                  >
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Share2 size={24} className="text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowShareSheet(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                {t.common.cancel}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
