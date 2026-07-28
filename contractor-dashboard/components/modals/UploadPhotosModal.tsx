import { useState } from 'react';

export default function UploadPhotosModal({ show, onClose, onSubmit, jobTitle, milestones }: {
  show: boolean;
  onClose: () => void;
  onSubmit: (count: number) => void;
  jobTitle: string;
  milestones: Array<{ id: number; title: string; status: string }>;
}) {
  const [photos, setPhotos] = useState<Array<{ id: string; name: string; size: string; preview: string }>>([]);
  const [milestone, setMilestone] = useState('');
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'homeowner' | 'internal'>('homeowner');
  const [submitting, setSubmitting] = useState(false);
  const handleFileSelect = () => {
    // Simulate file selection
    const mockPhotos = [
      { id: `p${Date.now()}-1`, name: 'progress_photo_1.jpg', size: '2.4 MB', preview: 'https://readdy.ai/api/search-image?query=construction%20progress%20photo%20crawlspace%20moisture%20barrier%20installation%20work%20site%20professional%20documentation&width=200&height=200&seq=upload1&orientation=squarish' },
      { id: `p${Date.now()}-2`, name: 'progress_photo_2.jpg', size: '1.8 MB', preview: 'https://readdy.ai/api/search-image?query=construction%20progress%20photo%20dehumidifier%20installation%20basement%20crawlspace%20professional%20work%20documentation&width=200&height=200&seq=upload2&orientation=squarish' },
    ];
    setPhotos(prev => [...prev, ...mockPhotos]);
  };

  const removePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  const handleSubmit = () => {
    if (photos.length === 0) return;
    setSubmitting(true);
    setTimeout(() => {
      const count = photos.length;
      onSubmit(count);
      setSubmitting(false);
      setPhotos([]); setMilestone(''); setCaption(''); setVisibility('homeowner');
    }, 1200);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Upload Progress Photos</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Drop Zone */}
          <div
            onClick={handleFileSelect}
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#00B8A9] transition-colors cursor-pointer"
          >
            <div className="w-12 h-12 flex items-center justify-center bg-[#00B8A9]/10 rounded-full mx-auto mb-3">
              <i className="ri-camera-line text-[#00B8A9] text-2xl"></i>
            </div>
            <p className="font-semibold text-[#2D2A74] text-sm mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Click to add photos
            </p>
            <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              JPG, PNG up to 10MB each &bull; Max 20 photos
            </p>
          </div>

          {/* Photo Previews */}
          {photos.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {photos.length} PHOTO{photos.length > 1 ? 'S' : ''} SELECTED
              </label>
              <div className="grid grid-cols-3 gap-2">
                {photos.map(photo => (
                  <div key={photo.id} className="relative group">
                    <div className="w-full h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img src={photo.preview} alt={photo.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <button
                      onClick={() => removePhoto(photo.id)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <i className="ri-close-line text-xs"></i>
                    </button>
                    <p className="text-xs text-gray-500 mt-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{photo.name}</p>
                  </div>
                ))}
                <button
                  onClick={handleFileSelect}
                  className="w-full h-24 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center hover:border-[#00B8A9] transition-colors cursor-pointer"
                >
                  <i className="ri-add-line text-gray-400 text-xl"></i>
                  <span className="text-xs text-gray-400">Add More</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>LINK TO MILESTONE (OPTIONAL)</label>
            <select
              value={milestone}
              onChange={e => setMilestone(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] cursor-pointer bg-white"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <option value="">No specific milestone</option>
              {milestones.map(m => (
                <option key={m.id} value={m.title}>{m.title} ({m.status})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>CAPTION (OPTIONAL)</label>
            <textarea
              value={caption}
              onChange={e => setCaption(e.target.value.slice(0, 500))}
              placeholder="Describe what these photos show..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{caption.length}/500</div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>VISIBILITY</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVisibility('homeowner')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  visibility === 'homeowner' ? 'border-[#00B8A9] bg-[#00B8A9]/10 text-[#00B8A9]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-eye-line"></i>
                Visible to Homeowner
              </button>
              <button
                onClick={() => setVisibility('internal')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  visibility === 'internal' ? 'border-[#2D2A74] bg-[#2D2A74]/10 text-[#2D2A74]' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-lock-line"></i>
                Internal Only
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={photos.length === 0 || submitting}
            className="flex-1 px-4 py-3 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {submitting ? (
              <><i className="ri-loader-4-line animate-spin"></i> Uploading...</>
            ) : (
              <><i className="ri-upload-2-line"></i> Upload {photos.length > 0 ? `${photos.length} Photo${photos.length > 1 ? 's' : ''}` : 'Photos'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
