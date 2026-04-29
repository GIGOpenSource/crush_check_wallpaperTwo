import { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * 动态设置页面标题的 Hook
 * @param titleKey 翻译键名（如 'home', 'search' 等，对应 translations 中的 pageTitles 下的键）
 * @param params 可选参数对象，用于替换翻译文本中的占位符（如 {{query}}, {{count}}）
 * 
 * 使用示例:
 * usePageTitle('home'); // 根据当前语言显示: Home / 首页 / ホーム 等
 * usePageTitle('searchWithQuery', { query: 'nature' }); // 显示: Search: nature / 搜索: nature
 */
export function usePageTitle(titleKey: string, params?: Record<string, any>) {
  const { t, language } = useLanguage();
  
  useEffect(() => {
    // 从翻译对象中获取标题文本
    const pageTitle = t.pageTitles?.[titleKey as keyof typeof t.pageTitles] || titleKey;
    
    // 如果有参数，进行替换
    let finalTitle = pageTitle;
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        finalTitle = finalTitle.replace(`{{${key}}}`, String(value));
      });
    }
    
    // 设置页面标题
    document.title = finalTitle;
    
    // 组件卸载时恢复默认标题
    return () => {
      document.title = 'MarkWallpapers';
    };
  }, [titleKey, language, t, params]);
}
