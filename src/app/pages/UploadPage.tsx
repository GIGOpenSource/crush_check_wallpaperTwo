import { useState } from 'react';
import { useNavigate } from 'react-router';
import { BottomNav } from '../components/BottomNav';
import {
  ChevronLeft,
  Upload,
  Image as ImageIcon,
  X,
  Tag,
  FileText,
  CheckCircle,
  Loader
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type UploadStep = 'select' | 'details' | 'tags' | 'review' | 'uploading' | 'success';

export default function UploadPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<UploadStep>('select');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const suggestedTags = ['nature', 'abstract', 'minimal', 'dark', 'colorful', 'space', 'city'];

  const steps: { id: UploadStep; label: string; icon: any }[] = [
    { id: 'select', label: 'Select Image', icon: ImageIcon },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'tags', label: 'Tags', icon: Tag },
    { id: 'review', label: 'Review', icon: CheckCircle }
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCurrentStep('details');
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

  const handleSubmit = () => {
    setCurrentStep('uploading');
    // Simulate upload
    setTimeout(() => {
      setCurrentStep('success');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    }, 2000);
  };

  if (currentStep === 'uploading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 mx-auto mb-4"
          >
            <Loader size={64} className="text-blue-600" />
          </motion.div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Uploading...</h2>
          <p className="text-sm text-gray-600">Please wait while we process your wallpaper</p>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={48} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Successful!</h2>
          <p className="text-sm text-gray-600">Your wallpaper has been uploaded</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20 max-w-md mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={24} className="text-gray-900" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Upload Wallpaper</h1>
        </div>

        {/* Progress Steps */}
        {currentStep !== 'select' && (
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStepIndex;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isActive
                          ? isCurrent
                            ? 'bg-blue-600 text-white'
                            : 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      {isActive && !isCurrent ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Icon size={18} />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-1 mx-2 ${
                          index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-600 text-center">
              {steps.find((s) => s.id === currentStep)?.label}
            </p>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="p-4">
        {/* Select Image */}
        {currentStep === 'select' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-8"
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={40} className="text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Your Wallpaper</h2>
              <p className="text-sm text-gray-600">
                Select a high-quality image to share with the community
              </p>
            </div>

            <label className="block">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-colors">
                <ImageIcon size={48} className="text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-1">Click to select an image</p>
                <p className="text-xs text-gray-400">Supported: JPG, PNG (Max 10MB)</p>
              </div>
            </label>
          </motion.div>
        )}

        {/* Details */}
        {currentStep === 'details' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {selectedImage && (
              <div className="bg-white rounded-xl overflow-hidden">
                <img src={selectedImage} alt="Preview" className="w-full h-48 object-cover" />
              </div>
            )}

            <div className="bg-white rounded-xl p-4">
              <label className="block mb-4">
                <span className="text-sm font-medium text-gray-700 mb-2 block">Title *</span>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter wallpaper title"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Description (Optional)
                </span>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your wallpaper..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </label>
            </div>

            <button
              onClick={() => setCurrentStep('tags')}
              disabled={!title.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next: Add Tags
            </button>
          </motion.div>
        )}

        {/* Tags */}
        {currentStep === 'tags' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Add Tags</h3>

              <div className="flex gap-2 mb-4">
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
                  placeholder="Type a tag and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-600"
                />
                <button
                  onClick={() => handleAddTag(tagInput)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg"
                >
                  Add
                </button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full"
                    >
                      <span className="text-sm">#{tag}</span>
                      <button onClick={() => handleRemoveTag(tag)} className="hover:text-blue-900">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <p className="text-xs text-gray-500 mb-2">Suggested tags:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags
                    .filter((tag) => !tags.includes(tag))
                    .map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleAddTag(tag)}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                      >
                        #{tag}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setCurrentStep('review')}
              disabled={tags.length === 0}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Next: Review
            </button>
          </motion.div>
        )}

        {/* Review */}
        {currentStep === 'review' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl overflow-hidden">
              <img src={selectedImage!} alt="Preview" className="w-full h-64 object-cover" />
              <div className="p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">{title}</h2>
                {description && <p className="text-sm text-gray-600 mb-3">{description}</p>}
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm text-gray-600">
                  I confirm that I own the rights to this image or have permission to upload it. I
                  agree to the Terms of Service and Community Guidelines.
                </span>
              </label>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!acceptedTerms}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Upload size={20} />
              Upload Wallpaper
            </button>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}