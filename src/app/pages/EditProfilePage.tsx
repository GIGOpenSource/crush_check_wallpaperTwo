import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { App } from 'antd';
import { ArrowLeft, Camera, User, Save } from 'lucide-react';
import { BottomNav } from '../components/BottomNav';
import { useLanguage } from '../contexts/LanguageContext';
import { useUserProfile } from '../hooks/useUserProfile';
import { updateUserProfile } from '../../api/wallpaper';
import { motion } from 'motion/react';

export default function EditProfilePage() {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">请先登录</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-700" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">编辑资料</h1>
        </div>
      </header>

      {/* Content */}
      <div className="py-6 space-y-6">
        {/* Avatar Section */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">头像</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gray-100 rounded-full overflow-hidden">
                <img
                  src={avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(nickname || 'User')}`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors">
                <Camera size={16} className="text-white" />
              </button>
            </div>
            <div className="flex-1">
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="输入头像URL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">支持输入图片URL地址</p>
            </div>
          </div>
        </div>

        {/* Nickname Section */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <User size={18} />
              昵称
            </h3>
          </div>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="请输入昵称"
            maxLength={20}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-2">{nickname.length}/20</p>
        </div>

        {/* Gender Section */}
        <div className="bg-white px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">性别</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {genderOptions.map((option) => (
              <motion.button
                key={option.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => setGender(option.value)}
                className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
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

        {/* Info */}
        <div className="px-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              💡 提示：修改后将立即生效，其他用户可以看到您的最新信息。
            </p>
          </div>
        </div>

        {/* Save Button */}
        <div className="px-4 pb-8">
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <Save size={20} />
            <span>{saving ? '保存中...' : '保存'}</span>
          </motion.button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
