import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, isApiSuccess, loginUser } from '../../api/auth';
import { useLanguage } from '../contexts/LanguageContext';

export default function DesktopLoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      message.warning(t.login.fillEmailAndPassword);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      message.warning(t.login.invalidEmail);
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-12">
          <h1 className="text-3xl font-bold">{t.login.welcomeBack}</h1>
          <p className="mt-2 text-white/85">{t.login.loginToContinue}</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 -mt-7 pb-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">{t.login.emailAddress}</span>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className="h-12 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">{t.login.password}</span>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="h-12 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
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
