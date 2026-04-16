import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getSiteInfo, type SiteInfo } from '../../api/wallpaper';
import { BottomNav } from '../components/BottomNav';

type InfoType = 'privacy' | 'help' | 'about';

export default function SiteInfoPage() {
  const { type } = useParams<{ type: InfoType }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [info, setInfo] = useState<SiteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      if (!type || !['privacy', 'help', 'about'].includes(type)) {
        setError('无效的信息类型');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const response = await getSiteInfo(type);
        const data = (response as any)?.data ?? response;
        setInfo(data);
      } catch (err: any) {
        setError(err?.message ?? '获取信息失败，请重试');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [type]);

  const getTitle = () => {
    switch (type) {
      case 'privacy':
        return t.settings.privacyPolicy;
      case 'help':
        return t.settings.helpSupport;
      case 'about':
        return t.settings.aboutApp;
      default:
        return '';
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-gray-50 pb-20">
      {/* 顶部导航栏 */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">{getTitle()}</h1>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="px-4 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={40} className="text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600">加载中...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              重试
            </button>
          </div>
        ) : info ? (
          <div className="bg-white rounded-lg p-6 shadow-sm">
            {info.title && (
              <h2 className="text-xl font-bold text-gray-900 mb-4">{info.title}</h2>
            )}
            <div
              className="prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: info.content ?? '' }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-gray-600">暂无内容</p>
          </div>
        )}
      </div>

      {/* 底部导航栏 */}
      <BottomNav />
    </div>
  );
}
