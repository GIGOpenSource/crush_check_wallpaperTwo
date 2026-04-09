import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, UserPlus } from 'lucide-react';
import { ApiError } from '../../api/request';
import { registerUser } from '../../api/auth';

export default function DesktopRegisterPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password || !confirmPassword) {
      message.warning('请完整填写注册信息');
      return;
    }
    if (password !== confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setSubmitting(true);
    try {
      await registerUser({
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      if (error instanceof ApiError) {
        const data = error.data as Record<string, unknown> | string | null;
        if (typeof data === 'string' && data.trim()) {
          message.error(data);
        } else if (data && typeof data === 'object') {
          const first = Object.values(data)[0];
          if (typeof first === 'string') message.error(first);
          else if (Array.isArray(first) && typeof first[0] === 'string') message.error(first[0]);
          else message.error(error.message || '注册失败，请稍后重试');
        } else {
          message.error(error.message || '注册失败，请稍后重试');
        }
      } else {
        message.error('注册失败，请稍后重试');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto grid min-h-screen max-w-7xl grid-cols-2 gap-10 px-8 py-10">
        <section className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-10 text-white">
          <h1 className="text-4xl font-bold leading-tight">创建账号</h1>
          <p className="mt-4 text-white/85 text-lg">注册后即可上传壁纸并收藏你喜欢的内容</p>
          <div className="mt-10 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-white/90">加入社区，分享你喜欢的视觉风格。</p>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-3xl border border-gray-100 bg-white p-8 shadow-sm">
            <form className="space-y-5" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">邮箱</span>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                  <Mail size={18} className="text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    className="h-12 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">密码</span>
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

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-gray-700">确认密码</span>
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                  <Lock size={18} className="text-gray-400" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入密码"
                    className="h-12 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                  />
                </div>
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 text-white disabled:opacity-60"
              >
                <UserPlus size={18} />
                {submitting ? '注册中...' : '注册'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              已有账号？
              <Link to="/login" className="ml-1 font-medium text-blue-600">
                去登录
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
