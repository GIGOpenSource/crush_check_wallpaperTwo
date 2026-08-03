import React from 'react';
import { RefreshCw, ArrowDown } from 'lucide-react';

interface PullToRefreshProps {
  pullDistance: number;
  threshold: number;
  refreshing: boolean;
  isPulling: boolean;
  children: React.ReactNode;
  className?: string;
  pullText?: string;
  releaseText?: string;
  refreshingText?: string;
}

/**
 * 下拉刷新容器组件
 * 包裹内容区域，显示下拉刷新的指示器
 */
export function PullToRefresh({
  pullDistance,
  threshold,
  refreshing,
  isPulling,
  children,
  className = '',
  pullText = '下拉刷新',
  releaseText = '释放刷新',
  refreshingText = '正在刷新...',
}: PullToRefreshProps) {
  // 计算指示器高度
  let indicatorHeight = 0;
  let status: 'pulling' | 'can-release' | 'refreshing' | 'idle' = 'idle';

  if (refreshing) {
    indicatorHeight = threshold;
    status = 'refreshing';
  } else if (isPulling && pullDistance > 0) {
    indicatorHeight = pullDistance;
    status = pullDistance >= threshold ? 'can-release' : 'pulling';
  }

  const getStatusText = () => {
    switch (status) {
      case 'pulling':
        return pullText;
      case 'can-release':
        return releaseText;
      case 'refreshing':
        return refreshingText;
      default:
        return '';
    }
  };

  const getIcon = () => {
    if (status === 'refreshing') {
      return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    }
    if (status === 'can-release') {
      return <ArrowDown className="w-5 h-5 text-blue-500 transition-transform duration-200 rotate-180" />;
    }
    if (status === 'pulling') {
      return <ArrowDown className="w-5 h-5 text-gray-400" style={{ transform: `rotate(${pullDistance * 2}deg)` }} />;
    }
    return null;
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* 刷新指示器 */}
      <div
        className="absolute top-0 left-0 right-0 flex items-center justify-center bg-transparent overflow-hidden transition-[height] duration-200 ease-out"
        style={{
          height: `${indicatorHeight}px`,
          transitionDuration: refreshing || !isPulling ? '200ms' : '0ms',
        }}
      >
        <div className="flex flex-col items-center justify-center py-4">
          {getIcon()}
          {status !== 'idle' && (
            <span className={`mt-2 text-sm ${status === 'can-release' ? 'text-blue-500' : 'text-gray-500'}`}>
              {getStatusText()}
            </span>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div
        className="relative"
        style={{
          transform: `translateY(${indicatorHeight}px)`,
          transition: refreshing || !isPulling ? 'transform 200ms ease-out' : 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
