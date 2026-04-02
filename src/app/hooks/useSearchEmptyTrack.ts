import { useEffect, useRef } from 'react';
import { umengclick } from '../analytics/aplusTracking';

/**
 * 有搜索/筛选意图且结果为空时，防抖上报 search_empty。
 * `signature` 应在 query / filters 变化时变化，以便重新计时。
 */
export function useSearchEmptyTrack(
  isEmpty: boolean,
  hasIntent: boolean,
  signature: string,
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!isEmpty || !hasIntent) return;
    timerRef.current = setTimeout(() => {
      umengclick('search_empty');
    }, 450);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isEmpty, hasIntent, signature]);
}
