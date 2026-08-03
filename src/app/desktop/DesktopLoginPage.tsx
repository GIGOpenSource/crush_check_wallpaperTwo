import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, extractApiUserId, isApiSuccess, loginUser } from '../../api/auth';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

import { analytics } from '../utils/firebase';  // ← 路径改成这个
import { logEvent } from 'firebase/analytics';
import { getDeviceType } from '../utils/device';


export default function DesktopLoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      logEvent(analytics, 'login_success', {
        userId: userId,
        page_title: 'login',  // ← 加上这个
        device_type: getDeviceType()
      });
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
    <div className="min-h-screen bg-background">
      <header className="text-white" style={{ backgroundColor: theme === 'dark' ? '#0a1628' : undefined, background: theme !== 'dark' ? 'linear-gradient(to bottom right, #2563eb, #9333ea)' : undefined }}>
        <div className="max-w-lg mx-auto px-5 pt-10 pb-12">
          <h1 className="text-3xl font-bold">{t.login.welcomeBack}</h1>
          <p className="mt-2 text-white/85">{t.login.loginToContinue}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 -mt-7 pb-10">
        <div className="rounded-3xl bg-card p-6 shadow-sm border border-border">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">{t.login.emailAddress}</span>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
                <Mail size={18} className="text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className="h-12 w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-foreground">{t.login.password}</span>
              <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3">
                <Lock size={18} className="text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="h-12 w-full bg-transparent outline-none text-foreground placeholder:text-muted-foreground"
                />
                {!/Edge|Edg/i.test(navigator.userAgent) && (
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-full hover:bg-muted transition-colors"
                  >
                    {showPassword ? <Eye size={18} className="text-muted-foreground" /> : <EyeOff size={18} className="text-muted-foreground" />}
                  </button>
                )}
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-white disabled:opacity-60"
            >
              <LogIn size={18} />
              {submitting ? t.common.loading : t.login.loginButton}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            {t.login.noAccount}
            <Link to="/register" className="ml-1 font-medium text-blue-600">
              {t.login.registerNow}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}