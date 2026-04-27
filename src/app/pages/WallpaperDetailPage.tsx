import { App } from 'antd';
import { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import { WallpaperGrid } from '../components/WallpaperGrid';
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
import { recordWallpaperDownload ,recordWallpaperCollect} from '../../api/wallpaper';
import { getAuthToken } from '../../api/request';
import { DownloadNoticeAlert } from '../components/DownloadNoticeAlert';
import CommentSection from '../components/CommentSection';
import {
  Download,
  Heart,
  Share2,
  Eye,
  Calendar,
  Image as ImageIcon,
  User,
  ChevronLeft,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WallpaperDetailPage() {
  const { message } = App.useApp();
  const { t } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { wallpaper, loading, error, refresh } = useWallpaperDetailFromRoute();
  const { relatedWallpapers, loadingRelated } = useGuessYouLikeRelated(id);
  const { comments, total: commentTotal } = useWallpaperComments(id || '');
  const { profile: currentProfile } = useUserProfile();
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [localLikes, setLocalLikes] = useState<number | null>(null); // 本地管理的收藏数
  const [localDownloads, setLocalDownloads] = useState<number | null>(null); // 本地管理的下载数
  const [downloadNotice, setDownloadNotice] = useState<{
    open: boolean;
    message: string;
    pendingTabUrl?: string;
  }>({ open: false, message: '' });

  // 初始化喜欢状态使用壁纸的is_collected字段
  const [isLiked, setIsLiked] = useState(!!wallpaper?.is_collected);

  // 当壁纸数据更新时，同步更新isLiked状态
  useEffect(() => {
    if (wallpaper && wallpaper.is_collected !== undefined) {
      setIsLiked(wallpaper.is_collected);
    }
  }, [wallpaper?.is_collected]);

  // 判断是否是自己的壁纸
  const isOwnWallpaper = useMemo(() => {
    if (!wallpaper?.uploader || !currentProfile) return false;
    return String(wallpaper.uploader.id) === String(currentProfile.id);
  }, [wallpaper?.uploader?.id, currentProfile?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">{t.common.loading}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!wallpaper || error) {
    return (
      <div className="min-h-screen flex flex-col max-w-md mx-auto bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">{t.wallpaperDetail.wallpaperNotFound}</p>
        </div>
        <BottomNav />
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
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center p-4">
          <button
            type="button"
            onClick={() => {
              umengclick('detail_back');
              navigate(-1);
            }}
            className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
        </div>
      </header>

      {/* Full-screen Wallpaper */}
      <div className="relative w-full aspect-[9/16]">
        <img
          src={wallpaper.imageUrl}
          alt={wallpaper.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content */}
      <div className="bg-white">
        {/* Title and Uploader */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 mb-2">{wallpaper.title}</h1>
          {wallpaper.description && (
            <p className="text-sm text-gray-600 mb-3">{wallpaper.description}</p>
          )}
          {/* 上传者信息 - 只在有uploader时显示 */}
          {wallpaper.uploader && (
            <button
              onClick={() => {
                // 如果是自己的壁纸，跳转到自己的主页；否则跳转到其他用户页面
                if (isOwnWallpaper) {
                  navigate('/profile');
                } else {
                  navigate(`/profile/${wallpaper.uploader?.id}?other_id=${wallpaper.uploader?.id}`);
                }
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            >
              <User size={16} />
              <span className="text-sm">{wallpaper.uploader.username}</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 px-4 py-4 border-b border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 mb-1">
              <Eye size={18} />
              <span className="text-lg font-semibold">{formatNumber(wallpaper.views)}</span>
            </div>
            <p className="text-xs text-gray-500">{t.wallpaperDetail.views}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 mb-1">
              <Download size={18} />
              <span className="text-lg font-semibold">{formatNumber(localDownloads ?? wallpaper.downloads)}</span>
            </div>
            <p className="text-xs text-gray-500">{t.wallpaperDetail.downloads}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-gray-900 mb-1">
              <Heart size={18} />
              <span className="text-lg font-semibold">{formatNumber(localLikes ?? wallpaper.likes)}</span>
            </div>
            <p className="text-xs text-gray-500">{t.wallpaperDetail.likes}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-4 flex gap-3 border-b border-gray-200">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-full font-semibold flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none"
          >
            <Download size={20} />
            {downloading ? t.common.loading : t.wallpaperDetail.download}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleCollect}
            className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
              isLiked
                ? 'bg-red-50 border-red-500 text-red-500'
                : 'bg-white border-gray-300 text-gray-600'
            }`}
          >
            <Heart size={20} className={isLiked ? 'fill-red-500' : ''} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleShare}
            className="w-12 h-12 bg-white border-2 border-gray-300 text-gray-600 rounded-full flex items-center justify-center"
          >
            <Share2 size={20} />
          </motion.button>
        </div>

        {/* Wallpaper Details */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.wallpaperDetail.details}</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t.wallpaperDetail.resolution}</span>
              <span className="text-gray-900 font-medium">{wallpaper.resolution}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t.wallpaperDetail.aspectRatio}</span>
              <span className="text-gray-900 font-medium">{wallpaper.aspectRatio}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500">{t.wallpaperDetail.uploadDate}</span>
              <span className="text-gray-900 font-medium">
                {new Date(wallpaper.uploadDate).toLocaleDateString()}
              </span>
            </div>
            {/* 上传者信息 - 只在有uploader时显示 */}
            {wallpaper.uploader && (
              <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                <span className="text-gray-500">{t.wallpaperDetail.uploader || '上传者'}</span>
                <div className="flex items-center gap-2">
                  {wallpaper.uploader.avatar && (
                    <img
                      src={wallpaper.uploader.avatar}
                      alt={wallpaper.uploader.username}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                  <span className="text-gray-900 font-medium">{wallpaper.uploader.username}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="px-4 py-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">{t.wallpaperDetail.tagsHeading}</h3>
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
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-full transition-colors"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Comments Section */}
        <div className="px-4 py-4 border-b border-gray-200">
          <CommentSection wallpaperId={id || ''} />
        </div>

        {(loadingRelated || relatedWallpapers.length > 0) && (
          <div className="py-4">
            <div className="px-4 mb-4">
              <h3 className="text-sm font-semibold text-gray-900">
                {t.wallpaperDetail.relatedWallpapers}
              </h3>
            </div>
            {loadingRelated ? (
              <p className="px-4 py-4 text-center text-sm text-gray-500">{t.common.loading}</p>
            ) : (
              <WallpaperGrid wallpapers={relatedWallpapers} />
            )}
          </div>
        )}
      </div>

      {/* Share Bottom Sheet */}
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
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6"
            >
              <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {t.wallpaperDetail.shareWallpaper}
              </h3>
              <div className="grid grid-cols-5 gap-2 sm:gap-4 mb-4">
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
                    <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                      <Share2 size={24} className="text-gray-600" />
                    </div>
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowShareSheet(false)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-full font-medium"
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

      <BottomNav />
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
}