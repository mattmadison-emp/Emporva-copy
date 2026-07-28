import { useState } from 'react';

interface JobPhoto {
  id: string;
  url: string;
  caption: string;
  uploadedBy: 'contractor' | 'homeowner';
  uploadedDate: string;
  category: 'before' | 'progress' | 'after' | 'issue' | 'other';
}

interface PhotosTabProps {
  photos: JobPhoto[];
  onUpload: (caption: string, category: string) => void;
}

export default function PhotosTab({ photos, onUpload }: PhotosTabProps) {
  const [photoFilter, setPhotoFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState<string>('progress');

  const filteredPhotos = photoFilter === 'all' ? photos : photos.filter(p => p.category === photoFilter);

  const handleUpload = () => {
    onUpload(caption, category);
    setShowUpload(false);
    setCaption('');
    setCategory('progress');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Project Photos</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="px-3 sm:px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap text-xs sm:text-sm"
        >
          <i className="ri-upload-line mr-1 sm:mr-2"></i>
          Upload Photo
        </button>
      </div>

      {showUpload && (
        <div className="bg-[#F9F9FB] rounded-xl p-6 mb-4 border-2 border-dashed border-gray-300">
          <h4 className="font-bold text-[#0B1F33] mb-4">Upload New Photo</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Photo Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6] cursor-pointer"
              >
                <option value="before">Before</option>
                <option value="progress">Progress</option>
                <option value="after">After</option>
                <option value="issue">Issue/Concern</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Caption</label>
              <input
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add a description for this photo..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14B8A6]"
              />
            </div>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-[#14B8A6] transition-colors">
              <i className="ri-image-add-line text-4xl text-gray-400 mb-2"></i>
              <p className="text-sm text-[#6B7C8F]">Click to select photo or drag and drop</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                className="flex-1 px-4 py-2 bg-[#14B8A6] text-white rounded-lg font-semibold hover:bg-[#0ea89a] transition-colors cursor-pointer whitespace-nowrap"
              >
                Upload Photo
              </button>
              <button
                onClick={() => setShowUpload(false)}
                className="px-4 py-2 bg-white border-2 border-gray-300 text-[#6B7C8F] rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
        {[
          { id: 'all', label: 'All Photos', icon: 'ri-image-line' },
          { id: 'before', label: 'Before', icon: 'ri-time-line' },
          { id: 'progress', label: 'Progress', icon: 'ri-loader-line' },
          { id: 'after', label: 'After', icon: 'ri-check-line' },
          { id: 'issue', label: 'Issues', icon: 'ri-alert-line' },
          { id: 'other', label: 'Other', icon: 'ri-folder-line' }
        ].map((filter) => (
          <button
            key={filter.id}
            onClick={() => setPhotoFilter(filter.id)}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
              photoFilter === filter.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-white border border-gray-200 text-[#6B7C8F] hover:bg-[#F9F9FB]'
            }`}
          >
            <i className={`${filter.icon} text-sm sm:text-base`}></i>
            {filter.label}
          </button>
        ))}
      </div>

      {filteredPhotos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-image-line text-3xl text-gray-400"></i>
          </div>
          <p className="text-[#6B7C8F] text-sm sm:text-base">No photos in this category yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredPhotos.map((photo) => (
            <div key={photo.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
              <div className="relative w-full h-40 sm:h-48 bg-gray-100 overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.caption}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <span className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold ${
                    photo.category === 'before' ? 'bg-gray-900/80 text-white'
                    : photo.category === 'progress' ? 'bg-blue-600/80 text-white'
                    : photo.category === 'after' ? 'bg-green-600/80 text-white'
                    : photo.category === 'issue' ? 'bg-red-600/80 text-white'
                    : 'bg-purple-600/80 text-white'
                  }`}>
                    {photo.category.charAt(0).toUpperCase() + photo.category.slice(1)}
                  </span>
                </div>
              </div>
              <div className="p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-semibold text-[#0B1F33] mb-2 line-clamp-2">{photo.caption}</p>
                <div className="flex items-center justify-between text-[10px] sm:text-xs text-[#6B7C8F]">
                  <span className="flex items-center gap-1">
                    <i className={photo.uploadedBy === 'contractor' ? 'ri-user-line' : 'ri-home-line'}></i>
                    {photo.uploadedBy === 'contractor' ? 'Contractor' : 'You'}
                  </span>
                  <span>{new Date(photo.uploadedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
