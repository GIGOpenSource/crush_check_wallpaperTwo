import React, { useState } from 'react';
import { App } from 'antd';
import { Link, useNavigate } from 'react-router';
import { Mail, Lock, UserPlus, Info } from 'lucide-react';
import { ApiError } from '../../api/request';
import { registerUser } from '../../api/auth';

export default function RegisterPage() {
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
    
    // 密码正则校验：最少8位，必须包含字母和数字
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!passwordRegex.test(password)) {
      message.error('密码必须至少8位，且包含字母和数字');
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
    <div className="min-h-dvh bg-gray-50">
      <header className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-md mx-auto px-4 pt-6 pb-8">
          <h1 className="text-xl font-bold">创建账号</h1>
          <p className="mt-1 text-white/85 text-xs">注册后即可上传壁纸并收藏你喜欢的内容</p>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 -mt-5 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <form className="space-y-3" onSubmit={handleSubmit} noValidate>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">邮箱</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5">
                <Mail size={14} className="text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="h-10 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-xs"
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">密码</span>
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
              <p className="mt-1 flex items-start gap-1 text-xs text-gray-500">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>密码必须至少8位，且包含字母和数字</span>
              </p>
            </label>

            <label className="block">
              <span className="mb-1 block text-xs font-medium text-gray-700">确认密码</span>
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-2.5">
                <Lock size={14} className="text-gray-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="请再次输入密码"
                  className="h-10 w-full bg-transparent outline-none text-gray-900 placeholder:text-gray-400 text-xs"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 text-white text-xs disabled:opacity-60"
            >
              <UserPlus size={14} />
              {submitting ? '注册中...' : '注册'}
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-gray-600">
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
