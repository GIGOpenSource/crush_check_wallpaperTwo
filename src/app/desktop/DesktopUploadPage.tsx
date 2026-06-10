import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import { Modal } from 'antd';
import {
  Upload,
  Image as ImageIcon,
  X,
  Tag,
  FileText,
  CheckCircle,
  Loader,
  Lock
} from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { getHotTags, uploadWallpaper } from '../../api/wallpaper';
import type { TagItem } from '../../api/wallpaper';
import { getAuthToken } from '../../api/request';

type UploadStep = 'select' | 'details' | 'tags' | 'review' | 'uploading' | 'success';

export default function DesktopUploadPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const token = getAuthToken();

  // 如果未登录，显示需要登录的提示
  if (!token) {
    return (
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />

        <main className="flex-1 ml-64">
          {/* 顶部导航 */}
          <header className="bg-card border-b border-border">
            <div className="px-8 py-6">
              <div className="max-w-4xl mx-auto flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                <h1 className="text-2xl font-bold text-foreground">
                  {t.upload.uploadWallpaper}
                </h1>
              </div>
            </div>
          </header>

          {/* 未登录提示 */}
          <div className="flex flex-col items-center justify-center py-20 px-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
              <Lock className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-3">
              {t.upload.pleaseLogin}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {t.upload.loginPrompt}
            </p>
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
            >
              {t.upload.goToLogin}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [platform, setPlatform] = useState<'PHONE' | 'PC'>('PHONE');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [tagList, setTagList] = useState<TagItem[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [wallpaperId, setWallpaperId] = useState<string | null>(null);

  const steps: { id: UploadStep; label: string; icon: typeof ImageIcon }[] = [
    { id: 'select', label: t.upload.selectImage, icon: ImageIcon },
    { id: 'details', label: t.upload.addDetails, icon: FileText },
    { id: 'tags', label: t.upload.addTags, icon: Tag },
    { id: 'review', label: t.upload.reviewAndUpload, icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  // 获取热门标签列表
  useEffect(() => {
    getHotTags()
      .then((res) => {
        // 热门标签接口返回格式: { code: 200, message: "...", data: [...] }
        const tagData = res && typeof res === 'object' && 'data' in res 
          ? (res as any).data 
          : res;
        if (Array.isArray(tagData)) {
          setTagList(tagData as TagItem[]);
        }
      })
      .catch((err) => {
        console.error('Failed to load tags:', err);
      });
  }, []);

  // 从sessionStorage获取壁纸数据，用于重新上传
  useEffect(() => {
    const reuploadData = sessionStorage.getItem('reuploadWallpaper');
    if (reuploadData) {
      try {
        const wallpaper = JSON.parse(reuploadData);
        // 保存壁纸ID用于重新上传
        if (wallpaper.id) {
          setWallpaperId(String(wallpaper.id));
        }
        // 填充数据
        const titleValue = wallpaper.title || wallpaper.name;
        if (titleValue) setTitle(titleValue);
        if (wallpaper.description) setDescription(wallpaper.description);
        if (wallpaper.platform) setPlatform(wallpaper.platform === 'PHONE' ? 'PHONE' : 'PC');
        if (wallpaper.tags && Array.isArray(wallpaper.tags)) {
          setTags(wallpaper.tags.map((tag: any) => typeof tag === 'object' ? tag.name : tag));
        }
        // 回显图片
        const imageUrl = wallpaper.url || wallpaper.thumbUrl || wallpaper.imageUrl || wallpaper.thumb_url || wallpaper.image_url;
        if (imageUrl) {
          setSelectedImage(imageUrl);
        }
        // 设置步骤为详情页
        setCurrentStep('details');
        // 清除sessionStorage中的数据
        sessionStorage.removeItem('reuploadWallpaper');
      } catch (err) {
        console.error('Failed to parse reupload wallpaper data:', err);
        sessionStorage.removeItem('reuploadWallpaper');
      }
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 检查文件大小（10MB = 10 * 1024 * 1024 bytes）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        Modal.error({
          title: t.upload.imageTooLarge,
          content: t.upload.imageTooLargeMessage,
          okText: t.common.gotIt,
          centered: true,
        });
        // 清空文件选择
        e.target.value = '';
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        // 移除自动跳转，让用户手动点击下一步
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags([...tags, normalizedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async () => {
    // 验证：必须有图片（选择的文件或回显的图片）和标题
    const hasImage = selectedFile || selectedImage;
    if (!hasImage || !title.trim()) {
      setUploadError(t.upload.selectImageAndTitle);
      return;
    }

    await doUpload();
  };

  const doUpload = async () => {
    setCurrentStep('uploading');
    setUploadError(null);

    try {
      // 匹配已有标签 ID
      const matchedTagIds = tagList
        .filter((tag) => tags.includes(tag.name.toLowerCase()))
        .map((tag) => String(tag.id));

      // 新标签（没有在系统标签列表中的）
      const newTagNames = tags.filter(
        (tag) => !tagList.some((t) => t.name.toLowerCase() === tag)
      );

      await uploadWallpaper({
        id: wallpaperId || undefined,
        platform: platform,
        file: selectedFile,
        title: title.trim(),
        description: description.trim() || undefined,
        tag_ids: matchedTagIds.length > 0 ? matchedTagIds.join(',') : undefined,
        tag_names: newTagNames.length > 0 ? newTagNames.join(',') : undefined,
      });

      setCurrentStep('success');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError(t.upload.uploadFailed);
      setCurrentStep('review');
    }
  };

  if (currentStep === 'uploading') {
    return (
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-20 h-20 mx-auto mb-6"
            >
              <Loader size={80} className="text-blue-600" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-3">{t.upload.uploading}</h2>
            <p className="text-gray-600">{t.upload.pleaseWait}</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="flex min-h-screen bg-background">
        <DesktopSidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={64} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-3">{t.upload.uploadSuccessful}</h2>
            <p className="text-gray-600">{t.upload.uploadSuccessMessage}</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-foreground mb-6">{t.upload.uploadWallpaper}</h1>

              {/* Progress Steps */}
              {currentStep !== 'select' && (
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStepIndex;
                    const isCurrent = step.id === currentStep;
                    const canClick = index < currentStepIndex; // 只有已完成的步骤可以点击

                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <button
                            onClick={() => canClick && setCurrentStep(step.id)}
                            disabled={!canClick}
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                              canClick
                                ? 'cursor-pointer hover:scale-110 active:scale-95'
                                : 'cursor-default'
                            } ${
                              isActive
                                ? isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-green-500 text-white'
                                : 'bg-muted text-muted-foreground'
                            }`}
                            title={canClick ? `返回到${step.label}` : ''}
                          >
                            {isActive && !isCurrent ? (
                              <CheckCircle size={24} />
                            ) : (
                              <Icon size={24} />
                            )}
                          </button>
                          <span
                            className={`text-sm font-medium ${
                              isActive ? 'text-foreground' : 'text-muted-foreground'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`flex-1 h-1 mx-4 -mt-8 ${
                              index < currentStepIndex ? 'bg-green-500' : 'bg-muted'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="px-8 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Select Image */}
            {currentStep === 'select' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-12"
              >
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload size={48} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-3">{t.upload.uploadYourWallpaper}</h2>
                  <p className="text-gray-600">{t.upload.selectHighQuality}</p>
                </div>

                {/* 如果已有图片，显示预览 */}
                {selectedImage ? (
                  <div className="space-y-6">
                    <div className="relative rounded-2xl overflow-hidden bg-gray-900">
                      <div className="aspect-video">
                        <img src={selectedImage} alt="Selected" className="w-full h-full object-contain" />
                      </div>
                      <button
                        onClick={() => {
                          setSelectedImage(null);
                          setSelectedFile(null);
                        }}
                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X size={24} />
                      </button>
                    </div>
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-blue-500/50 rounded-2xl p-6 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-colors">
                        <Upload size={40} className="text-blue-500 mx-auto mb-3" />
                        <p className="text-lg text-blue-500 font-medium">{t.upload.changeImage}</p>
                      </div>
                    </label>
                    <button
                      onClick={() => setCurrentStep('details')}
                      className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {t.common.next}
                    </button>
                  </div>
                ) : (
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-border rounded-2xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-500/10 transition-colors">
                      <ImageIcon size={64} className="text-muted-foreground mx-auto mb-4" />
                      <p className="text-lg text-foreground mb-2">{t.upload.clickToSelect}</p>
                      <p className="text-sm text-muted-foreground">{t.upload.supportedFormats}</p>
                    </div>
                  </label>
                )}
              </motion.div>
            )}

            {/* Details */}
            {currentStep === 'details' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {selectedImage && (
                  <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
                    <div className="aspect-video bg-gray-900">
                      <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}

                <div className="bg-card rounded-2xl p-8 space-y-6">
                  {/* Platform Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      {t.profile.wallpaperType}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setPlatform('PHONE')}
                        className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all ${
                          platform === 'PHONE'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-border hover:border-blue-500/50 text-foreground'
                        }`}
                      >
                        📱 {t.profile.phoneWallpaper}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlatform('PC')}
                        className={`flex-1 px-4 py-3 border-2 rounded-xl font-medium transition-all ${
                          platform === 'PC'
                            ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                            : 'border-border hover:border-blue-500/50 text-foreground'
                        }`}
                      >
                        💻 {t.profile.pcWallpaper}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      {t.upload.title}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={t.upload.enterTitle}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-3">
                      {t.upload.descriptionOptional}
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t.upload.describeWallpaper}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep('tags')}
                  disabled={!title.trim()}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {t.upload.nextAddTags}
                </button>
              </motion.div>
            )}

            {/* Tags */}
            {currentStep === 'tags' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="bg-card rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-foreground mb-6">{t.upload.addTags}</h3>

                  <div className="flex gap-3 mb-6">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag(tagInput);
                        }
                      }}
                      placeholder={t.upload.typeTag}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={() => handleAddTag(tagInput)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {t.upload.add}
                    </button>
                  </div>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-3 mb-6">
                      {tags.map((tag) => (
                        <div
                          key={tag}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl"
                        >
                          <span className="font-medium">#{tag}</span>
                          <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground mb-3">{t.upload.suggestedTags}</p>
                    <div className="flex flex-wrap gap-3">
                      {tagList
                        .filter((tag) => !tags.includes(tag.name.toLowerCase()))
                        .slice(0, 15)
                        .map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleAddTag(tag.name.toLowerCase())}
                            className="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-muted transition-colors font-medium"
                          >
                            #{tag.name}
                          </button>
                        ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setCurrentStep('review')}
                  disabled={tags.length === 0}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  {t.upload.nextReview}
                </button>
              </motion.div>
            )}

            {/* Review */}
            {currentStep === 'review' && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {uploadError && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                    <p className="text-foreground">{uploadError}</p>
                  </div>
                )}

                <div className="bg-card rounded-2xl overflow-hidden shadow-sm">
                  <div className="aspect-video bg-gray-900">
                    <img src={selectedImage!} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-foreground mb-3">{title}</h2>
                    
                    {/* Platform Display */}
                    <div className="mb-4">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${
                        platform === 'PHONE' 
                          ? 'bg-purple-100 text-purple-700' 
                          : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {platform === 'PHONE' ? '📱' : '💻'}
                        {platform === 'PHONE' ? t.profile.phoneWallpaper : t.profile.pcWallpaper}
                      </span>
                    </div>
                    
                    {description && <p className="text-gray-600 mb-4">{description}</p>}
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-2xl p-6">
                  <label className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <span className="text-foreground">{t.upload.termsConfirm}</span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!acceptedTerms}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={24} />
                  {t.upload.uploadWallpaper}
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
