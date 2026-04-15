import React, { useState } from 'react';
import { useWallpaperComments } from '../hooks/useWallpaperComments';
import { createComment, toggleCommentLike } from '../../api/wallpaper';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Send, Heart } from 'lucide-react';
import { App } from 'antd';

interface CommentSectionProps {
  wallpaperId: string | number;
}

export default function CommentSection({ wallpaperId }: CommentSectionProps) {
  const { message } = App.useApp();
  const { comments, loading, error, hasMore, loadMore, refresh, total } =
    useWallpaperComments(wallpaperId);
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likingCommentId, setLikingCommentId] = useState<number | string | null>(null);

  // 格式化时间
  const formatTime = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: zhCN,
      });
    } catch {
      return dateString;
    }
  };

  // 提交评论
  const handleSubmitComment = async () => {
    if (!commentContent.trim() || submitting) return;

    setSubmitting(true);
    try {
      await createComment({
        wallpaper_id: wallpaperId,
        content: commentContent.trim(),
      });
      setCommentContent('');
      // 刷新评论列表
      refresh();
    } catch (err) {
      console.error('发表评论失败:', err);
      // TODO: 显示错误提示
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // 点赞/取消点赞评论
  const handleToggleLike = async (commentId: number | string) => {
    if (likingCommentId === commentId) return; // 防止重复点击

    setLikingCommentId(commentId);
    try {
      await toggleCommentLike(commentId);
      // 点赞成功后刷新评论列表
      refresh();
      message.success('操作成功');
    } catch (err) {
      console.error('点赞操作失败:', err);
      message.error('操作失败，请重试');
    } finally {
      setLikingCommentId(null);
    }
  };

  // 加载状态
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 错误状态
  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">加载评论失败</p>
        <button
          onClick={refresh}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          重试
        </button>
      </div>
    );
  }

  // 空状态 - 但仍然显示输入框
  const isEmpty = comments.length === 0;

  return (
    <div className="space-y-6">
      {/* 评论输入框 - 始终显示 */}
      <div className="flex gap-3">
        <div className="flex-1">
          <textarea
            value={commentContent}
            onChange={(e) => setCommentContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="写下你的评论..."
            disabled={submitting}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {commentContent.length}/500
            </span>
            <button
              onClick={handleSubmitComment}
              disabled={!commentContent.trim() || submitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={16} />
              {submitting ? '发表中...' : '发表'}
            </button>
          </div>
        </div>
      </div>

      {/* 评论列表区域 */}
      {isEmpty ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg">暂无评论</p>
          <p className="text-sm mt-2">成为第一个评论的人吧！</p>
        </div>
      ) : (
        <>
          {/* 评论总数 */}
          <div className="flex items-center justify-between pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              评论 {total !== undefined && `(${total})`}
            </h3>
            <button
              onClick={refresh}
              className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
            >
              刷新
            </button>
          </div>

          {/* 评论列表 */}
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem 
                key={comment.id} 
                comment={comment} 
                formatTime={formatTime}
                onToggleLike={handleToggleLike}
                isLiking={likingCommentId === comment.id}
              />
            ))}
          </div>

          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={loadMore}
                className="px-6 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                加载更多
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 单个评论项组件
interface CommentItemProps {
  comment: {
    id: number;
    content: string;
    customer_info?: {
      nickname: string;
      avatar_url: string;
    };
    like_count?: number;
    is_hidden?: boolean;
    created_at?: string;
    parent_id?: number | null;
  };
  formatTime: (dateString?: string) => string;
  onToggleLike: (commentId: number) => void;
  isLiking: boolean;
}

const CommentItem = React.memo(function CommentItem({ 
  comment, 
  formatTime, 
  onToggleLike,
  isLiking 
}: CommentItemProps) {
  const isReply = comment.parent_id != null;
  const username = comment.customer_info?.nickname || '匿名用户';
  const avatarUrl = comment.customer_info?.avatar_url;
  const likes = comment.like_count || 0;
  const isLiked = comment.is_hidden || false;

  return (
    <div
      className={`flex gap-3 ${isReply ? 'ml-8' : ''}`}
    >
      {/* 用户头像 */}
      <div className="flex-shrink-0">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-avatar.png';
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
            {username[0].toUpperCase()}
          </div>
        )}
      </div>

      {/* 评论内容 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-white">
            {username}
          </span>
          {isReply && (
            <span className="text-xs text-gray-500 dark:text-gray-400">回复</span>
          )}
        </div>

        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed break-words">
          {comment.content}
        </p>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>{formatTime(comment.created_at)}</span>
          <button 
            onClick={() => onToggleLike(comment.id)}
            disabled={isLiking}
            className={`flex items-center gap-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isLiked 
                ? 'text-red-500 hover:text-red-600' 
                : 'hover:text-red-500'
            }`}
          >
            <Heart 
              size={14} 
              fill={isLiked ? 'currentColor' : 'none'}
              className={isLiking ? 'animate-pulse' : ''}
            />
            <span>{likes}</span>
          </button>
        </div>
      </div>
    </div>
  );
});
