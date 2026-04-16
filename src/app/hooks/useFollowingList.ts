import { useEffect, useState, useRef, useCallback } from 'react';
import { useView } from '../contexts/ViewContext';
import { getFollowingList, getFollowersList } from '../../api/wallpaper';
import type { FollowUserItem } from '../../api/wallpaper';

/**
 * 关注列表管理 Hook
 * 遵循项目规范：逻辑内聚、分页管理、竞态处理、平台适配
 */
export function useFollowingList(pageSize: number = 20) {
  const { viewMode } = useView();
  const isDesktop = viewMode === 'desktop';
  
  const [users, setUsers] = useState<FollowUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchingRef = useRef(false);

  // 加载数据
  const loadData = useCallback(async (page: number, isLoadMore = false) => {
    // 防止重复请求
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // 取消上一个未完成的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await getFollowingList({
        currentPage: page,
        pageSize,
      });

      // 检查请求是否被取消
      if (abortController.signal.aborted) return;

      // 详细调试日志
      console.log('=== 关注列表调试 ===');
      console.log('1. 原始 response 对象:', response);
      console.log('2. response 类型:', typeof response);
      console.log('3. response 的键:', Object.keys(response || {}));
      
      // 解析数据
      // 实际接口格式: { code: 200, message: "success", data: { pagination, results } }
      const responseData = response as any;
      let userList: FollowUserItem[] = [];
      let total = 0;

      console.log('4. responseData:', responseData);
      console.log('5. responseData.data:', responseData?.data);
      console.log('6. responseData.data?.results:', responseData?.data?.results);
      console.log('7. 是否为数组:', Array.isArray(responseData?.data?.results));

      // 优先解析: { code, message, data: { pagination, results } }
      if (responseData?.data?.results && Array.isArray(responseData.data.results)) {
        console.log('✅ 匹配格式: { data: { results } }');
        userList = responseData.data.results;
        total = responseData.data.pagination?.total || responseData.data.total || userList.length;
      }
      // 兼容: { pagination, results }
      else if (responseData?.results && Array.isArray(responseData.results)) {
        console.log('✅ 匹配格式: { results }');
        userList = responseData.results;
        total = responseData.pagination?.total || responseData.total || userList.length;
      }
      // 兼容: { data: { list, total } }
      else if (responseData?.data?.list && Array.isArray(responseData.data.list)) {
        console.log('✅ 匹配格式: { data: { list } }');
        userList = responseData.data.list;
        total = responseData.data.total || responseData.data.count || userList.length;
      }
      // 兼容: { list, total }
      else if (responseData?.list && Array.isArray(responseData.list)) {
        console.log('✅ 匹配格式: { list }');
        userList = responseData.list;
        total = responseData.total || responseData.count || userList.length;
      }
      // 兼容: 直接数组
      else if (Array.isArray(responseData)) {
        console.log('✅ 匹配格式: 直接数组');
        userList = responseData;
        total = responseData.length;
      } else {
        console.log('❌ 未匹配任何格式!');
      }

      console.log('8. 最终解析结果 - userList:', userList);
      console.log('9. 最终解析结果 - total:', total);
      console.log('10. userList 长度:', userList.length);
      console.log('===================');

      console.log('关注列表数据:', { userList, total, response: responseData });
      setUsers(prev => isLoadMore ? [...prev, ...userList] : userList);
      setTotal(total);
      setCurrentPage(page);
      setHasMore(userList.length === pageSize);
    } catch (err: any) {
      // 忽略取消请求的错误
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      
      console.error('获取关注列表失败:', err);
      setError(err.message || '加载失败，请重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [pageSize]);

  // 首次加载
  useEffect(() => {
    loadData(1, false);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadData(currentPage + 1, true);
    }
  }, [currentPage, loadingMore, hasMore, loadData]);

  // 刷新列表
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadData(1, false);
  }, [loadData]);

  return {
    users,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

/**
 * 粉丝列表管理 Hook
 * 遵循项目规范：逻辑内聚、分页管理、竞态处理、平台适配
 */
export function useFollowersList(pageSize: number = 20) {
  const { viewMode } = useView();
  const isDesktop = viewMode === 'desktop';
  
  const [users, setUsers] = useState<FollowUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const fetchingRef = useRef(false);

  // 加载数据
  const loadData = useCallback(async (page: number, isLoadMore = false) => {
    // 防止重复请求
    if (fetchingRef.current) return;
    fetchingRef.current = true;

    // 取消上一个未完成的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      if (!isLoadMore) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      setError(null);

      const response = await getFollowersList({
        currentPage: page,
        pageSize,
      });

      // 检查请求是否被取消
      if (abortController.signal.aborted) return;

      // 详细调试日志
      console.log('=== 粉丝列表调试 ===');
      console.log('1. 原始 response 对象:', response);
      console.log('2. response 类型:', typeof response);
      console.log('3. response 的键:', Object.keys(response || {}));
      
      // 解析数据
      // 实际接口格式: { code: 200, message: "success", data: { pagination, results } }
      const responseData = response as any;
      let userList: FollowUserItem[] = [];
      let total = 0;

      console.log('4. responseData:', responseData);
      console.log('5. responseData.data:', responseData?.data);
      console.log('6. responseData.data?.results:', responseData?.data?.results);
      console.log('7. 是否为数组:', Array.isArray(responseData?.data?.results));

      // 优先解析: { code, message, data: { pagination, results } }
      if (responseData?.data?.results && Array.isArray(responseData.data.results)) {
        console.log('✅ 匹配格式: { data: { results } }');
        userList = responseData.data.results;
        total = responseData.data.pagination?.total || responseData.data.total || userList.length;
      }
      // 兼容: { pagination, results }
      else if (responseData?.results && Array.isArray(responseData.results)) {
        console.log('✅ 匹配格式: { results }');
        userList = responseData.results;
        total = responseData.pagination?.total || responseData.total || userList.length;
      }
      // 兼容: { data: { list, total } }
      else if (responseData?.data?.list && Array.isArray(responseData.data.list)) {
        console.log('✅ 匹配格式: { data: { list } }');
        userList = responseData.data.list;
        total = responseData.data.total || responseData.data.count || userList.length;
      }
      // 兼容: { list, total }
      else if (responseData?.list && Array.isArray(responseData.list)) {
        console.log('✅ 匹配格式: { list }');
        userList = responseData.list;
        total = responseData.total || responseData.count || userList.length;
      }
      // 兼容: 直接数组
      else if (Array.isArray(responseData)) {
        console.log('✅ 匹配格式: 直接数组');
        userList = responseData;
        total = responseData.length;
      } else {
        console.log('❌ 未匹配任何格式!');
      }

      console.log('8. 最终解析结果 - userList:', userList);
      console.log('9. 最终解析结果 - total:', total);
      console.log('10. userList 长度:', userList.length);
      console.log('===================');

      console.log('粉丝列表数据:', { userList, total, response: responseData });
      setUsers(prev => isLoadMore ? [...prev, ...userList] : userList);
      setTotal(total);
      setCurrentPage(page);
      setHasMore(userList.length === pageSize);
    } catch (err: any) {
      // 忽略取消请求的错误
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      
      console.error('获取粉丝列表失败:', err);
      setError(err.message || '加载失败，请重试');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      fetchingRef.current = false;
    }
  }, [pageSize]);

  // 首次加载
  useEffect(() => {
    loadData(1, false);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  // 加载更多
  const loadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      loadData(currentPage + 1, true);
    }
  }, [currentPage, loadingMore, hasMore, loadData]);

  // 刷新列表
  const refresh = useCallback(() => {
    setCurrentPage(1);
    setHasMore(true);
    loadData(1, false);
  }, [loadData]);

  return {
    users,
    total,
    loading,
    loadingMore,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
