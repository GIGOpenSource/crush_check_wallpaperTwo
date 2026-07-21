import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router';
import { Mail, Lock, LogIn, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, extractApiUserId, isApiSuccess, loginUser } from '../../api/auth';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

export default function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 控制返回按钮显示：如果浏览器历史记录深度大于1或者来自特定页面，则显示返回按钮
  const shouldShowReturnButton = window.history.length > 1 || location.state?.from;

  const handleGoBack = () => {
    // 如果有来源页面，则返回来源页面；否则返回上一页
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate(-1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      message.warning(t.login.fillEmailAndPassword);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      message.warning(t.login.invalidEmail);
      return;
    }
    // 2. 密码校验：有空格直接提示
    if (password.includes(' ')) {
      message.warning(t.login.passwordContainsSpace);
      return;
    }
    setSubmitting(true);
    try {
      const res = await loginUser({
        email: email.trim(),
        password,
      });
      if (!isApiSuccess(res)) {
        message.error(extractApiErrorMessage(res) || t.login.loginFailed);
        return;
      }
      const token = extractApiToken(res);
      if (!token) {
        message.error(t.login.loginSuccessNoToken);
        return;
      }
      setAuthToken(token);

      // 提取并保存 user_id
      const userId = extractApiUserId(res);
      if (userId !== null) {
        try {
          localStorage.setItem('user_id', String(userId));
        } catch (e) {
          console.error('保存 user_id 失败:', e);
        }
      }

      message.success(t.login.loginSuccess);
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(extractApiErrorMessage(error.data) || error.message || t.login.loginFailed);
      } else {
        message.error(t.login.loginFailed);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 max-w-md mx-auto relative">
      {/* 返回按钮 */}
      {shouldShowReturnButton && (
        <button
          onClick={handleGoBack}
          className="fixed top-[calc(env(safe-area-inset-top)+1.5rem)] left-4 z-50 bg-card/10 backdrop-blur-sm border  rounded-full p-2 hover:bg-card/30 transition-colors shadow-md"
          aria-label={t.common.back}
        >
          <ArrowLeft size={20} className="text-white" />
        </button>
      )}

      {/* 顶部装饰区域 */}
      <div className="relative overflow-hidden" style={{ backgroundColor: theme === 'dark' ? '#0a1628' : undefined, background: theme !== 'dark' ? 'linear-gradient(to bottom right, #2563eb, #9333ea, #ec4899)' : undefined }}>
        {/* 装饰圆圈 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-card/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-card/10 rounded-full blur-3xl"></div>

        <div className="relative px-6 pt-[calc(env(safe-area-inset-top)+3rem)] pb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-bold text-white text-center mb-2"
          >
            {t.login.welcomeBack}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-center text-sm"
          >
            {t.login.loginToContinue}
          </motion.p>
        </div>
      </div>

      {/* 表单区域 */}
      <main className="px-6 relative z-10 pb-28">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-3xl bg-card p-6 shadow-xl border border-border -mt-8"
        >
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t.login.emailAddress}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className="w-full pl-11 pr-4 h-12 rounded-xl border-2 border-border bg-background outline-none text-foreground placeholder:text-muted-foreground text-sm transition-all focus:border-blue-500 focus:bg-card focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {t.login.password}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="w-full pl-11 pr-12 h-12 rounded-xl border-2 border-border bg-background outline-none text-foreground placeholder:text-muted-foreground text-sm transition-all focus:border-blue-500 focus:bg-card focus:ring-2 focus:ring-blue-100"
                />
                {!/Edge|Edg/i.test(navigator.userAgent) && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                )}
              </div>
            </div>

            {/* 登录按钮 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: theme === 'dark' ? '#2563eb' : 'linear-gradient(to right, #2563eb, #9333ea)' }}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <LogIn size={18} />
                  {t.login.loginButton}
                </>
              )}
            </motion.button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t.login.noAccount}
              <Link to="/register" className="ml-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                {t.login.registerNow}
              </Link>
            </p>
          </div>
        </motion.div>

        {/* 底部提示 */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 text-center text-xs text-muted-foreground"
        >
          {t.login.termsAgreement}
          <a
            href="https://www.markwallpapers.com/agreement/MarkWallpapers%20Privacy%20Policy.html"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-700 underline transition-colors"
          >
            {t.login.privacyPolicy}
          </a>
          <span className="ml-1">{t.login.and}</span>
          <Link
            to="/site-info/privacy"
            className="text-blue-600 hover:text-blue-700 underline transition-colors ml-1"
          >
            {t.settings.privacySecurity}
          </Link>
        </motion.p>
      </main>

      <BottomNav />
    </div>
  );
}