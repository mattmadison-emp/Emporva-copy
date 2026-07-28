import { useState, useRef } from 'react';

interface MediaUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: 'image' | 'both';
  multiple?: boolean;
  maxFiles?: number;
  existingFiles?: File[];
  existingUrls?: string[];
  onRemove?: (index: number) => void;
  showPreviews?: boolean;
}

export default function MediaUpload({
  onFilesSelected,
  accept = 'image',
  multiple = true,
  maxFiles = 10,
  existingFiles = [],
  existingUrls = [],
  onRemove,
  showPreviews = true,
}: MediaUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState<string[]>(existingUrls);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const libraryInputRef = useRef<HTMLInputElement>(null);

  // Check if device is mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;

  const getAcceptString = () => {
    if (accept === 'image') return 'image/*';
    return 'image/*,video/*';
  };

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
  const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];

  const handleFiles = (files: FileList | null) => {
    if (!files) return;

    const allowedTypes = accept === 'both'
      ? [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES]
      : ALLOWED_IMAGE_TYPES;

    const rejected: string[] = [];
    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        rejected.push(`"${file.name}" is not a supported file type`);
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        rejected.push(`"${file.name}" exceeds the 10MB size limit`);
        return false;
      }
      return true;
    });

    if (rejected.length > 0) {
      alert(rejected.join('\n'));
    }

    if (validFiles.length === 0) return;

    const totalFiles = existingFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      newPreviews.push(url);
    });

    setPreviews(prev => [...prev, ...newPreviews]);
    onFilesSelected(validFiles);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleRemove = (index: number) => {
    setPreviews(prev => prev.filter((_, i) => i !== index));
    if (onRemove) {
      onRemove(index);
    }
  };

  const renderPreview = (url: string, index: number) => {
    return (
      <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
        <img src={url} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
        <button
          type="button"
          onClick={() => handleRemove(index)}
          className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg cursor-pointer"
        >
          <i className="ri-close-line text-sm"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Mobile Upload Options */}
      {isMobile ? (
        <div className="space-y-3">
          {/* Camera Capture Button */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="w-full p-4 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-colors flex items-center justify-center gap-3 cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-camera-line text-2xl"></i>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Take Photo
              </p>
              <p className="text-xs text-white/80" style={{ fontFamily: 'Inter, sans-serif' }}>
                Open camera
              </p>
            </div>
          </button>
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            aria-label="Take photo with camera"
          />

          {/* Library Upload Button */}
          <button
            type="button"
            onClick={() => libraryInputRef.current?.click()}
            className="w-full p-4 bg-white border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 cursor-pointer"
          >
            <div className="w-6 h-6 flex items-center justify-center">
              <i className="ri-folder-image-line text-2xl"></i>
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Upload From Library
              </p>
              <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Choose existing photos
              </p>
            </div>
          </button>
          <input
            ref={libraryInputRef}
            type="file"
            accept={getAcceptString()}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            aria-label="Upload photos from library"
          />
        </div>
      ) : (
        /* Desktop Drag & Drop */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
            isDragging ? 'border-[#D4B483] bg-[#D4B483]/5' : 'border-gray-300 hover:border-[#D4B483]'
          }`}
          onClick={() => libraryInputRef.current?.click()}
        >
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-[#D4B483]/10 rounded-full">
            <i className="ri-upload-cloud-line text-3xl text-[#D4B483]"></i>
          </div>
          <p className="text-[#333645] font-semibold mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Upload Photos
          </p>
          <p className="text-sm text-gray-500 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
            Images up to 10MB
          </p>
          <input
            ref={libraryInputRef}
            type="file"
            accept={getAcceptString()}
            multiple={multiple}
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
            aria-label="Upload photos"
          />
        </div>
      )}

      {/* Preview Grid */}
      {showPreviews && previews.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((url, index) => renderPreview(url, index))}
        </div>
      )}

      {/* File Count */}
      {showPreviews && previews.length > 0 && (
        <p className="text-xs text-gray-500 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
          {previews.length} of {maxFiles} files uploaded
        </p>
      )}
    </div>
  );
}
