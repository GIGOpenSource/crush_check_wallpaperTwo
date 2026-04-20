import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, isApiSuccess, loginUser } from '../../api/auth';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <div className="min-h-screen bg-white pb-20 max-w-md mx-auto">
      {/* 顶部装饰区域 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {/* 装饰圆圈 */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative px-6 pt-12 pb-16">
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
          className="rounded-3xl bg-white p-6 shadow-xl border border-gray-100 -mt-8"
        >
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            {/* 邮箱输入 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.login.emailAddress}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t.login.emailPlaceholder}
                  className="w-full pl-11 pr-4 h-12 rounded-xl border-2 border-gray-200 bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t.login.password}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.login.passwordPlaceholder}
                  className="w-full pl-11 pr-12 h-12 rounded-xl border-2 border-gray-200 bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* 登录按钮 */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={submitting}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-blue-500/30 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-blue-500/40 transition-shadow"
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
          className="mt-6 text-center text-xs text-gray-400"
        >
          {t.login.termsAgreement}
        </motion.p>
      </main>

      <BottomNav />
    </div>
  );
}
