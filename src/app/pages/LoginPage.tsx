import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, isApiSuccess, loginUser } from '../../api/auth';
import { BottomNav } from '../components/BottomNav';
import { motion } from 'motion/react';

export default function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      message.warning('请填写邮箱和密码');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      message.warning('请输入正确的邮箱地址');
      return;
    }
    setSubmitting(true);
    try {
      const res = await loginUser({
        email: email.trim(),
        password,
      });
      if (!isApiSuccess(res)) {
        message.error(extractApiErrorMessage(res) || '登录失败，请稍后重试');
        return;
      }
      const token = extractApiToken(res);
      if (!token) {
        message.error('登录成功但未返回 token，请联系后端检查登录接口返回');
        return;
      }
      setAuthToken(token);
      message.success('登录成功');
      navigate('/');
    } catch (error) {
      if (error instanceof ApiError) {
        message.error(extractApiErrorMessage(error.data) || error.message || '登录失败，请稍后重试');
      } else {
        message.error('登录失败，请稍后重试');
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
            欢迎回来
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-white/80 text-center text-sm"
          >
            登录后继续浏览和收藏你喜欢的壁纸
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
                邮箱地址
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full pl-11 pr-4 h-12 rounded-xl border-2 border-gray-200 bg-gray-50 outline-none text-gray-900 placeholder:text-gray-400 text-sm transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
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
                  登录
                </>
              )}
            </motion.button>
          </form>

          {/* 注册链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              还没有账号？
              <Link to="/register" className="ml-1 font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                立即注册
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
          登录即表示您同意我们的服务条款和隐私政策
        </motion.p>
      </main>

      <BottomNav />
    </div>
  );
}
