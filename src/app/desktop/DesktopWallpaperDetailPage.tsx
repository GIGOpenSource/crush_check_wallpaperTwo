import { App } from 'antd';
import { useState,useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { DesktopWallpaperGrid } from '../components/DesktopWallpaperGrid';
import { currentUser } from '../mockData';
import { trackAndRunDetailShare } from '../analytics/detailPageShareTrack';
import { umengclick } from '../analytics/aplusTracking';
import { useLanguage } from '../contexts/LanguageContext';
import { useGuessYouLikeRelated } from '../hooks/useGuessYouLikeRelated';
import { useWallpaperDetailFromRoute } from '../hooks/useWallpaperDetailFromRoute';
import { useWallpaperComments } from '../hooks/useWallpaperComments';
import { useUserProfile } from '../hooks/useUserProfile';
import { tpl } from '../utils/format';
import { downloadWallpaperImage, openImageUrlInNewTab } from '../utils/downloadWallpaperImage';
import { recordWallpaperDownload, recordWallpaperCollect } from '../../api/wallpaper';
import { getAuthToken } from '../../api/request';
import { DownloadNoticeAlert } from '../components/DownloadNoticeAlert';
import CommentSection from '../components/CommentSection';
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
  const { wallpaper, loading, error, refresh } = useWallpaperDetailFromRoute();
  const { relatedWallpapers, loadingRelated } = useGuessYouLikeRelated(id);
  const { comments, total: commentTotal } = useWallpaperComments(id || '');
  const { profile: currentProfile } = useUserProfile();
  const [isLiked, setIsLiked] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [localLikes, setLocalLikes] = useState<number | null>(null); // 本地管理的收藏数
  const [localDownloads, setLocalDownloads] = useState<number | null>(null); // 本地管理的下载数
  const [downloadNotice, setDownloadNotice] = useState<{
    open: boolean;
    message: string;
    pendingTabUrl?: string;
  }>({ open: false, message: '' });
  
  // 判断是否是自己的壁纸
  const isOwnWallpaper = useMemo(() => {
    if (!wallpaper?.uploader || !currentProfile) return false;
    return String(wallpaper.uploader.id) === String(currentProfile.id);
  }, [wallpaper?.uploader?.id, currentProfile?.id]);

  useEffect(() => {
    console.log("wallpaper", wallpaper);
    if (wallpaper && wallpaper.is_collected !== undefined) {
      setIsLiked(wallpaper.is_collected);
    }
  }, [wallpaper]); 
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
    umengclick('detail_download_click');
    setDownloading(true);
    umengclick('download_start');
    try {
      try {
        // 调用下载记录接口，获取最新的下载量
        const res = await recordWallpaperDownload(wallpaper.id) as { 
          code: number; 
          message: string; 
          data: { download_count: number } 
        };
        
        // 检查业务状态码并更新下载量
        if (res.code === 200 && res.data?.download_count !== undefined) {
          // 使用局部状态更新下载量
          setLocalDownloads(res.data.download_count);
        }
      } catch (err) {
        console.error('记录下载失败:', err);
        // 上报失败不影响实际下载流程
      }
      const result = await downloadWallpaperImage(wallpaper.imageUrl, wallpaper.title);
      if (result.status === 'failed') {
        umengclick('download_fail');
        setDownloadNotice({ open: true, message: t.wallpaperDetail.downloadFailed });
      } else if (result.status === 'blob') {
        umengclick('download_success');
      } else {
        setDownloadNotice({
          open: true,
          message: t.wallpaperDetail.downloadOpenInNewTab,
          pendingTabUrl: result.url,
        });
      }
    } catch {
      umengclick('download_fail');
      setDownloadNotice({ open: true, message: t.wallpaperDetail.downloadFailed });
    } finally {
      setDownloading(false);
    }
  };
  const handleCollect = async () => {
    // 检查是否登录
    const token = getAuthToken();
    if (!token) {
      // message.warning('请先登录后再收藏');
      setTimeout(() => {
        navigate('/login');
      }, 500);
      return;
    }

    console.log("开始收藏");
    try {
      // 调用收藏接口，返回格式: { code: 200, message: "...", data: { collected: boolean, collect_count: number } }
      const res = await recordWallpaperCollect(wallpaper.id) as { 
        code: number; 
        message: string; 
        data: { collected: boolean; collect_count: number } 
      };
      
      // 检查业务状态码
      if (res.code !== 200) {
        message.error(res.message || '操作失败，请重试');
        return;
      }
      
      // 更新收藏状态
      setIsLiked(res.data.collected);
      // 直接使用接口返回的 collect_count 更新收藏数，不调用详情接口
      setLocalLikes(res.data.collect_count);
      
      // 显示成功提示
      
      message.success(res.data.collected ? t.wallpaperDetail.collectSuccess : t.wallpaperDetail.collectCanceled);
    } catch (err) {
      console.error('收藏失败:', err);
      message.error(err.message);
    }
  };

  const handleShare = () => {
    umengclick('detail_share_click');
    setShowShareSheet(true);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-4">
            <div className="flex items-center gap-4 mb-2">
              <button
                type="button"
                onClick={() => {
                  umengclick('detail_back');
                  navigate(-1);
                }}
                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
              >
                <ChevronLeft size={24} className="text-gray-900" />
              </button>
              <h1 className="text-xl font-bold text-gray-900 flex-1">{wallpaper.title}</h1>
              <button
                onClick={() => setIsFavorited(!isFavorited)}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${isFavorited
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
            {wallpaper.description && (
              <p className="text-sm text-gray-600 ml-14">{wallpaper.description}</p>
            )}
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
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                {/* Comments Section */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <CommentSection wallpaperId={id || ''} />
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
                    onClick={handleCollect}
                    className={`w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${isLiked
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
                        {formatNumber(localDownloads ?? wallpaper.downloads)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Heart size={18} />
                        <span>{t.wallpaperDetail.likes}</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatNumber(localLikes ?? wallpaper.likes)}
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

                {/* Uploader - 只在有uploader时显示 */}
                {wallpaper.uploader ? (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.uploader}</h4>
                    <button
                      onClick={() => {
                        // 如果是自己的壁纸，跳转到自己的主页；否则跳转到其他用户页面
                        if (isOwnWallpaper) {
                          navigate('/profile');
                        } else {
                          navigate(`/profile/${wallpaper.uploader?.id}?other_id=${wallpaper.uploader?.id}`);
                        }
                      }}
                      className="flex items-center gap-3 hover:bg-gray-50 p-3 rounded-lg transition-colors w-full text-left"
                    >
                      {wallpaper.uploader.avatar ? (
                        <img
                          src={wallpaper.uploader.avatar}
                          alt={wallpaper.uploader.username}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{wallpaper.uploader.username}</p>
                        <p className="text-sm text-gray-500">
                          {t.wallpaperDetail.level} {wallpaper.uploader.level} 
                          {/* •{' '}
                          {wallpaper.uploader.points} {t.wallpaperDetail.points} */}
                        </p>
                      </div>
                    </button>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.uploader}</h4>
                    <div className="flex items-center gap-3 p-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User size={20} className="text-gray-400" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-500">{t.wallpaperDetail.systemUpload}</p>
                        <p className="text-sm text-gray-400">{t.wallpaperDetail.uploadBySystem}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tags */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <h4 className="font-semibold text-gray-900 mb-4">{t.wallpaperDetail.tagsHeading}</h4>
                  <div className="flex flex-wrap gap-2">
                    {wallpaper.tags.map((tag) => (
                      <Link
                        key={tag.id}
                        to={`/tag/${encodeURIComponent(tag.id)}`}
                        onClick={() => umengclick('filter_click_tag')}
                        state={{
                          tagMeta: {
                            name: tag.name,
                          },
                        }}
                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm rounded-lg transition-colors"
                      >
                        #{tag.name}
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
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-6">
                {(
                  [
                    ['copy', t.wallpaperDetail.copyLink],
                    ['tw', t.wallpaperDetail.shareX],
                    ['fb', t.wallpaperDetail.shareFacebook],
                    ['wa', t.wallpaperDetail.shareWhatsApp],
                    ['pin', t.wallpaperDetail.sharePinterest],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    className="flex flex-col items-center gap-2"
                    onClick={async () => {
                      const shareUrl = window.location.href;
                      await trackAndRunDetailShare(key, shareUrl, () =>
                        message.success(t.wallpaperDetail.linkCopied),
                      );
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

      <DownloadNoticeAlert
        open={downloadNotice.open}
        onOpenChange={(open) =>
          setDownloadNotice((s) => ({
            ...s,
            open,
            ...(open ? {} : { pendingTabUrl: undefined }),
          }))
        }
        title={t.common.tip}
        description={downloadNotice.message}
        actionLabel={t.common.gotIt}
        onConfirm={() => {
          const url = downloadNotice.pendingTabUrl;
          if (url) {
            openImageUrlInNewTab(url);
            umengclick('download_success');
          }
        }}
      />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}
