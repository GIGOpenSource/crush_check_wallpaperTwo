import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { App } from 'antd';
import { ArrowLeft, Camera, User, Save } from 'lucide-react';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { updateUserProfile } from '../../api/wallpaper';
import { motion } from 'motion/react';

export default function DesktopEditProfilePage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { profile, refresh } = useUserProfile();
  
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<0 | 1 | 2>(0);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  // 初始化表单数据
  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || profile.username || '');
      setGender((profile.gender as 0 | 1 | 2) || 0);
      setAvatarUrl(profile.avatar_url || profile.avatar || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!nickname.trim()) {
      message.warning('昵称不能为空');
      return;
    }

    setSaving(true);
    try {
      await updateUserProfile({
        nickname: nickname.trim(),
        gender,
        avatar_url: avatarUrl.trim() || undefined,
      });
      
      message.success('保存成功');
      // 刷新用户信息
      await refresh();
      // 返回上一页
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error) {
      console.error('更新个人信息失败:', error);
      message.error('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  const genderOptions = [
    { value: 0, label: '未知' },
    { value: 1, label: '男' },
    { value: 2, label: '女' },
  ];

  if (!profile) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <p className="text-gray-500">请先登录</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />
      
      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="px-8 py-6 flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">编辑资料</h1>
          </div>
        </header>

        {/* Content */}
        <div className="px-8 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Avatar Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">头像</h3>
              <div className="flex items-start gap-8">
                <div className="relative">
                  <div className="w-32 h-32 bg-gray-100 rounded-full overflow-hidden ring-4 ring-gray-100">
                    <img
                      src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || 'User')}`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-2 right-2 w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                    <Camera size={20} className="text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    头像URL
                  </label>
                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="输入头像图片的URL地址"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 支持输入有效的图片URL地址，例如：https://example.com/avatar.jpg
                  </p>
                </div>
              </div>
            </div>

            {/* Nickname Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} />
                昵称
              </h3>
              <div>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder="请输入您的昵称"
                  maxLength={20}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-sm text-gray-500">昵称将显示在您的个人主页和评论中</p>
                  <p className="text-sm text-gray-400">{nickname.length}/20</p>
                </div>
              </div>
            </div>

            {/* Gender Section */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">性别</h3>
              <div className="grid grid-cols-3 gap-4">
                {genderOptions.map((option) => (
                  <motion.button
                    key={option.value}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setGender(option.value)}
                    className={`py-4 px-6 rounded-xl border-2 font-medium transition-all ${
                      gender === option.value
                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">温馨提示</h4>
                  <p className="text-sm text-blue-800">
                    修改个人信息后将立即生效，其他用户可以看到您的最新信息。请确保填写的信息真实有效。
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pb-8">
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={saving}
                className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center gap-3 shadow-lg"
              >
                <Save size={20} />
                <span>{saving ? '保存中...' : '保存'}</span>
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
