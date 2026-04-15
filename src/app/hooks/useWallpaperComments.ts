import { useCallback, useEffect, useRef, useState } from 'react';
import { getComments } from '../../api/wallpaper';
import type { CommentItem } from '../../api/wallpaper';

const PAGE_SIZE = 20;

/** 合并并去重评论列表 */
function mergeDedupeComments(prev: CommentItem[], batch: CommentItem[]): CommentItem[] {
  const ids = new Set(prev.map((c) => c.id));
  const out = [...prev];
  for (const c of batch) {
    if (!ids.has(c.id)) {
      ids.add(c.id);
      out.push(c);
    }
  }
  return out;
}

/** 映射 API 响应到 CommentItem 数组 */
function mapCommentResponse(raw: unknown): CommentItem[] {
  if (raw == null || typeof raw !== 'object') return [];
  const o = raw as Record<string, unknown>;
  
  // 尝试从 data.results 或 data.list 获取
  const data = o.data;
  let list: unknown[] | undefined;
  
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const dataObj = data as Record<string, unknown>;
    // 优先尝试 results 字段
    list = dataObj.results as unknown[] | undefined;
    // 如果 results 不存在，尝试 list 字段
    if (!list || !Array.isArray(list)) {
      list = dataObj.list as unknown[] | undefined;
    }
  }
  
  // 如果 data.results/list 不存在，尝试直接从根对象的 results 或 list 获取
  if (!list || !Array.isArray(list)) {
    list = (o.results ?? o.list) as unknown[] | undefined;
  }
  
  if (!list || !Array.isArray(list)) return [];
  
  return list.filter((item): item is CommentItem => {
    if (item == null || typeof item !== 'object') return false;
    const comment = item as CommentItem;
    return comment.id != null && comment.content != null;
  });
}

/** 获取总数 */
function pickCommentTotal(raw: unknown): number | undefined {
  if (raw == null || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  
  // 尝试从 data.pagination.total 获取
  const data = o.data;
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const pagination = (data as Record<string, unknown>).pagination;
    if (pagination && typeof pagination === 'object') {
      const total = (pagination as Record<string, unknown>).total;
      if (typeof total === 'number' && !Number.isNaN(total)) return total;
    }
  }
  
  // 兼容其他格式
  const top = o.total ?? o.count;
  if (typeof top === 'number' && !Number.isNaN(top)) return top;
  
  return undefined;
}

/**
 * 获取壁纸评论列表
 * @param wallpaperId - 壁纸ID
 */
export function useWallpaperComments(wallpaperId: string | number) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);

  const pageRef = useRef(1);
  const fetchingRef = useRef(false);

  /** 加载首页数据 */
  const loadFirstPage = useCallback(() => {
    if (!wallpaperId) {
      setComments([]);
      setTotal(undefined);
      setHasMore(false);
      setLoading(false);
      setError(false);
      return;
    }

    let cancelled = false;
    pageRef.current = 1;
    setComments([]);
    setTotal(undefined);
    setHasMore(true);
    setLoading(true);
    setError(false);
    fetchingRef.current = true;

    getComments({
      currentPage: 1,
      pageSize: PAGE_SIZE,
      wallpaper_id: wallpaperId,
    })
      .then((raw) => {
        if (cancelled) return;
        const mapped = mapCommentResponse(raw);
        setComments(mapped);
        setTotal(pickCommentTotal(raw));
        setHasMore(mapped.length >= PAGE_SIZE);
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setComments([]);
          setHasMore(false);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
          fetchingRef.current = false;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [wallpaperId]);

  /** 加载更多 */
  const loadMore = useCallback(() => {
    if (!hasMore || loading || loadingMore || error || fetchingRef.current || !wallpaperId) return;

    const nextPage = pageRef.current + 1;
    fetchingRef.current = true;
    setLoadingMore(true);

    getComments({
      currentPage: nextPage,
      pageSize: PAGE_SIZE,
      wallpaper_id: wallpaperId,
    })
      .then((raw) => {
        const mapped = mapCommentResponse(raw);
        if (mapped.length === 0) {
          setHasMore(false);
          return;
        }
        pageRef.current = nextPage;
        setComments((prev) => mergeDedupeComments(prev, mapped));
        setHasMore(mapped.length >= PAGE_SIZE);
        const t = pickCommentTotal(raw);
        if (t != null) setTotal(t);
      })
      .catch(() => setHasMore(false))
      .finally(() => {
        fetchingRef.current = false;
        setLoadingMore(false);
      });
  }, [hasMore, loading, loadingMore, error, wallpaperId]);

  /** 刷新数据 */
  const refresh = useCallback(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  // 当 wallpaperId 变化时重新加载
  useEffect(() => {
    loadFirstPage();
  }, [loadFirstPage]);

  return {
    comments,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
