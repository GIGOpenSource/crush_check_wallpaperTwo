import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, UserPlus, Info } from 'lucide-react';
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
      const response = await registerUser({
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      
      // 检查响应中的code字段（业务状态码）
      const responseData = response as any;
      if (responseData && responseData.code !== undefined && responseData.code !== 200) {
        // 业务失败：提取错误信息
        const errorMessage = responseData.message || '注册失败';
        message.error(errorMessage);
        return;
      }
      
      // 注册成功
      message.success('注册成功，请登录');
      navigate('/login');
    } catch (error) {
      // 处理HTTP错误（非2xx状态码）
      if (error instanceof ApiError) {
        const responseData = error.data as any;
        
        // 优先从响应的data中提取详细错误信息
        if (responseData && responseData.data && typeof responseData.data === 'object') {
          // 尝试从data对象中提取第一个错误信息
          const errorDetails = responseData.data;
          const firstKey = Object.keys(errorDetails)[0];
          if (firstKey && Array.isArray(errorDetails[firstKey]) && errorDetails[firstKey].length > 0) {
            message.error(errorDetails[firstKey][0]);
            return;
          } else if (firstKey && typeof errorDetails[firstKey] === 'string') {
            message.error(errorDetails[firstKey]);
            return;
          }
        }
        
        // 使用message字段
        if (error.message && error.message !== 'Request failed') {
          message.error(error.message);
        } else {
          message.error('注册失败，请稍后重试');
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
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-lg mx-auto px-5 pt-10 pb-12">
          <h1 className="text-3xl font-bold">创建账号</h1>
          <p className="mt-2 text-white/85">注册后即可上传壁纸并收藏你喜欢的壁纸</p>
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
              <p className="mt-2 flex items-start gap-1.5 text-sm text-gray-500">
                <Info size={16} className="mt-0.5 shrink-0" />
                <span>密码必须至少8位，且包含字母和数字</span>
              </p>
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

          <p className="mt-5 text-center text-sm text-gray-600">
            已有账号？
            <Link to="/login" className="ml-1 font-medium text-blue-600">
              去登录
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
