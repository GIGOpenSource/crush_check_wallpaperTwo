import { useLanguage } from '../contexts/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLanguage();
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{t.errors.pageNotFoundTitle}</h1>
        <p className="text-gray-600">{t.errors.pageNotFound}</p>
      </div>
    </div>
  );
}
