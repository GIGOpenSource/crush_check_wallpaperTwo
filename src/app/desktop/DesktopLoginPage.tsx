import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, LogIn } from 'lucide-react';
import { ApiError, setAuthToken } from '../../api/request';
import { extractApiErrorMessage, extractApiToken, isApiSuccess, loginUser } from '../../api/auth';

export default function DesktopLoginPage() {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-12">
          <h1 className="text-3xl font-bold">欢迎回来</h1>
          <p className="mt-2 text-white/85">登录后继续浏览和收藏你喜欢的壁纸</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-5 -mt-7 pb-10">
        <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-100">
          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">邮箱</span>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                <Mail size={18} className="text-gray-400" />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="h-12 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-gray-700">输入密码</span>
              <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                <Lock size={18} className="text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
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
              {submitting ? '登录中...' : '登录'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-600">
            还没有账号？
            <Link to="/register" className="ml-1 font-medium text-blue-600">
              去注册
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
