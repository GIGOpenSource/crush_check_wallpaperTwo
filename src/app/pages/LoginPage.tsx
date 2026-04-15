import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, isApiSuccess, loginUser } from '../../api/auth';
import { BottomNav } from '../components/BottomNav';

export default function LoginPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-dvh bg-gray-50 pb-20 max-w-md mx-auto">
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-md mx-auto px-4 pt-6 pb-8">
          <h1 className="text-xl font-bold">欢迎回来</h1>
          <p className="mt-1 text-white/85 text-xs">登录后继续浏览和上传你喜欢的壁纸</p>
        </div>
      </header>

      <main className="px-4 -mt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <form className="space-y-3" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">邮箱</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5">
                <Mail size={14} className="text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="h-10 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-xs"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">输入密码</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5">
                <Lock size={14} className="text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="h-10 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-xs"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-60"
            >
              <LogIn size={14} />
              {submitting ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-600">
            还没有账号？
            <Link to="/register" className="ml-1 font-medium text-blue-600">
              去注册
            </Link>
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
