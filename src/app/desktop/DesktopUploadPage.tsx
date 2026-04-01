import { useState } from 'react';
import { useNavigate } from 'react-router';
import { DesktopSidebar } from '../components/DesktopSidebar';
import {
  Upload,
  Image as ImageIcon,
  X,
  Tag,
  FileText,
  CheckCircle,
  Loader
} from 'lucide-react';
import { motion } from 'motion/react';

type UploadStep = 'select' | 'details' | 'tags' | 'review' | 'uploading' | 'success';

export default function DesktopUploadPage() {
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
    { id: 'details', label: 'Add Details', icon: FileText },
    { id: 'tags', label: 'Add Tags', icon: Tag },
    { id: 'review', label: 'Review & Upload', icon: CheckCircle }
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
    setTimeout(() => {
      setCurrentStep('success');
      setTimeout(() => {
        navigate('/profile');
      }, 2000);
    }, 2000);
  };

  if (currentStep === 'uploading') {
    return (
      <div className="flex min-h-screen bg-gray-50">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Uploading...</h2>
            <p className="text-gray-600">Please wait while we process your wallpaper</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'success') {
    return (
      <div className="flex min-h-screen bg-gray-50">
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
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Upload Successful!</h2>
            <p className="text-gray-600">Your wallpaper has been uploaded successfully</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />

      <main className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Upload Wallpaper</h1>

              {/* Progress Steps */}
              {currentStep !== 'select' && (
                <div className="flex items-center justify-between">
                  {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= currentStepIndex;
                    const isCurrent = step.id === currentStep;

                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex flex-col items-center flex-1">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                              isActive
                                ? isCurrent
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-green-500 text-white'
                                : 'bg-gray-200 text-gray-400'
                            }`}
                          >
                            {isActive && !isCurrent ? (
                              <CheckCircle size={24} />
                            ) : (
                              <Icon size={24} />
                            )}
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              isActive ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                          </span>
                        </div>
                        {index < steps.length - 1 && (
                          <div
                            className={`flex-1 h-1 mx-4 -mt-8 ${
                              index < currentStepIndex ? 'bg-green-500' : 'bg-gray-200'
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
                className="bg-white rounded-2xl p-12"
              >
                <div className="text-center mb-8">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload size={48} className="text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-3">Upload Your Wallpaper</h2>
                  <p className="text-gray-600">
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
                  <div className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-600 hover:bg-blue-50 transition-colors">
                    <ImageIcon size={64} className="text-gray-400 mx-auto mb-4" />
                    <p className="text-lg text-gray-600 mb-2">Click to select an image</p>
                    <p className="text-sm text-gray-400">Supported: JPG, PNG (Max 10MB)</p>
                  </div>
                </label>
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
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    <img src={selectedImage} alt="Preview" className="w-full h-80 object-cover" />
                  </div>
                )}

                <div className="bg-white rounded-2xl p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter wallpaper title"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Description (Optional)
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your wallpaper..."
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
                  Next: Add Tags
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
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Add Tags</h3>

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
                      placeholder="Type a tag and press Enter"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-600"
                    />
                    <button
                      onClick={() => handleAddTag(tagInput)}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                    >
                      Add
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
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-blue-900"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-gray-500 mb-3">Suggested tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTags
                        .filter((tag) => !tags.includes(tag))
                        .map((tag) => (
                          <button
                            key={tag}
                            onClick={() => handleAddTag(tag)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
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
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
                >
                  Next: Review & Upload
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
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                  <img src={selectedImage!} alt="Preview" className="w-full h-96 object-cover" />
                  <div className="p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
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

                <div className="bg-white rounded-2xl p-6">
                  <label className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-5 h-5"
                    />
                    <span className="text-gray-700">
                      I confirm that I own the rights to this image or have permission to upload it.
                      I agree to the Terms of Service and Community Guidelines.
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={!acceptedTerms}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={24} />
                  Upload Wallpaper
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
