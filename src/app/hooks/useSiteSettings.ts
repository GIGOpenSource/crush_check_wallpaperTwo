import { useState, useEffect, useCallback } from 'react';
import { getSiteBasicSettings, type SiteBasicSettings } from '../../api/wallpaper';

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteBasicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSiteBasicSettings();
      setSettings(response?.data ?? null);
    } catch (err) {
      console.error('获取站点设置失败:', err);
      setError(err instanceof Error ? err : new Error('获取站点设置失败'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    loading,
    error,
    refresh: fetchSettings,
  };
}