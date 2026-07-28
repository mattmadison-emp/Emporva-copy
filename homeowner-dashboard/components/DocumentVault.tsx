import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface PropertyDocument {
  id: string;
  name: string;
  category: string;
  fileName: string;
  fileSizeBytes: number;
  storagePath: string;
  notes: string | null;
  uploadDate: string;
}

interface DocumentVaultProps {
  searchTerm: string;
}

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_DOCUMENT_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel',
  'text/plain',
];

const DOCUMENT_CATEGORIES = [
  'Insurance',
  'Warranty',
  'Inspection',
  'Permit',
  'Receipt',
  'Appliance Manual',
  'Tax Document',
  'Appraisal',
  'Contract',
  'Other',
];

const categoryConfig: Record<string, { icon: string; color: string }> = {
  Insurance: { icon: 'ri-shield-check-line', color: 'bg-blue-50 text-blue-600' },
  Warranty: { icon: 'ri-verified-badge-line', color: 'bg-green-50 text-green-600' },
  Inspection: { icon: 'ri-search-eye-line', color: 'bg-purple-50 text-purple-600' },
  Permit: { icon: 'ri-government-line', color: 'bg-amber-50 text-amber-600' },
  Receipt: { icon: 'ri-receipt-line', color: 'bg-orange-50 text-orange-600' },
  'Appliance Manual': { icon: 'ri-book-open-line', color: 'bg-cyan-50 text-cyan-600' },
  'Tax Document': { icon: 'ri-bank-card-line', color: 'bg-rose-50 text-rose-600' },
  Appraisal: { icon: 'ri-line-chart-line', color: 'bg-indigo-50 text-indigo-600' },
  Contract: { icon: 'ri-file-paper-2-line', color: 'bg-teal-50 text-teal-600' },
  Other: { icon: 'ri-file-line', color: 'bg-gray-50 text-gray-600' },
};

const categoryStyle = (cat: string) => categoryConfig[cat] || categoryConfig.Other;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function isAllowedMime(file: File): boolean {
  if (!file.type) return true; // some browsers omit type for less common extensions
  return ALLOWED_DOCUMENT_MIME_PREFIXES.some(
    prefix => file.type === prefix || file.type.startsWith(prefix),
  );
}

export default function DocumentVault({ searchTerm }: DocumentVaultProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<PropertyDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Upload modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('');
  const [uploadNotes, setUploadNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const { data: prop } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (!prop) {
      setPropertyId(null);
      setDocuments([]);
      setLoading(false);
      return;
    }
    setPropertyId(prop.id);

    const { data, error } = await supabase
      .from('property_documents')
      .select('*')
      .eq('property_id', prop.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[property-docs] fetch failed:', error);
      setDocuments([]);
      setLoading(false);
      return;
    }

    setDocuments(
      (data || []).map(d => ({
        id: d.id,
        name: d.name,
        category: d.category,
        fileName: d.file_name,
        fileSizeBytes: Number(d.file_size_bytes) || 0,
        storagePath: d.storage_path,
        notes: d.notes,
        uploadDate: d.upload_date,
      })),
    );
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const resetUploadForm = () => {
    setUploadFile(null);
    setUploadName('');
    setUploadCategory('');
    setUploadNotes('');
    setUploadError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileSelected = (file: File | null) => {
    setUploadError('');
    if (!file) {
      setUploadFile(null);
      return;
    }
    if (file.size > MAX_DOCUMENT_BYTES) {
      setUploadError('File exceeds the 10 MB limit.');
      setUploadFile(null);
      return;
    }
    if (!isAllowedMime(file)) {
      setUploadError('That file type is not supported. Use a PDF, image, or document file.');
      setUploadFile(null);
      return;
    }
    setUploadFile(file);
    // Pre-fill the name with the file name (sans extension) if blank.
    if (!uploadName) setUploadName(file.name.replace(/\.[^/.]+$/, ''));
  };

  const handleUpload = async () => {
    if (!user || !propertyId || !uploadFile || !uploadName.trim() || !uploadCategory) return;
    setUploading(true);
    setUploadError('');

    const ext = uploadFile.name.includes('.')
      ? uploadFile.name.slice(uploadFile.name.lastIndexOf('.'))
      : '';
    const fileId =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const storagePath = `${user.id}/${propertyId}/${fileId}${ext}`;

    const upload = await supabase.storage
      .from('property-documents')
      .upload(storagePath, uploadFile, {
        contentType: uploadFile.type || undefined,
        upsert: false,
      });
    if (upload.error) {
      console.error('[property-docs] upload failed:', upload.error);
      setUploadError('Upload failed. Please try again.');
      setUploading(false);
      return;
    }

    const insert = await supabase
      .from('property_documents')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        name: uploadName.trim(),
        category: uploadCategory,
        file_name: uploadFile.name,
        file_size_bytes: uploadFile.size,
        storage_path: storagePath,
        notes: uploadNotes.trim() || null,
      })
      .select('*')
      .single();
    if (insert.error || !insert.data) {
      console.error('[property-docs] insert failed:', insert.error);
      await supabase.storage.from('property-documents').remove([storagePath]);
      setUploadError('Could not save the document. Please try again.');
      setUploading(false);
      return;
    }

    const row = insert.data;
    setDocuments(prev => [
      {
        id: row.id,
        name: row.name,
        category: row.category,
        fileName: row.file_name,
        fileSizeBytes: Number(row.file_size_bytes) || 0,
        storagePath: row.storage_path,
        notes: row.notes,
        uploadDate: row.upload_date,
      },
      ...prev,
    ]);
    setUploading(false);
    setShowUploadModal(false);
    resetUploadForm();
  };

  const handleDownload = async (doc: PropertyDocument) => {
    setDownloadingId(doc.id);
    const { data, error } = await supabase.storage
      .from('property-documents')
      .createSignedUrl(doc.storagePath, 60);
    setDownloadingId(null);
    if (error || !data?.signedUrl) {
      console.error('[property-docs] signed url failed:', error);
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDelete = async (doc: PropertyDocument) => {
    setDeletingId(doc.id);
    const { error: dbError } = await supabase
      .from('property_documents')
      .delete()
      .eq('id', doc.id);
    if (dbError) {
      console.error('[property-docs] delete failed:', dbError);
      setDeletingId(null);
      return;
    }
    const { error: storageError } = await supabase.storage
      .from('property-documents')
      .remove([doc.storagePath]);
    if (storageError) console.error('[property-docs] storage cleanup failed:', storageError);

    setDocuments(prev => prev.filter(d => d.id !== doc.id));
    setDeletingId(null);
  };

  const term = searchTerm.trim().toLowerCase();
  const filteredDocuments = documents.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (!term) return true;
    return (
      d.name.toLowerCase().includes(term) ||
      d.category.toLowerCase().includes(term) ||
      d.fileName.toLowerCase().includes(term) ||
      (d.notes || '').toLowerCase().includes(term)
    );
  });

  const countForCategory = (cat: string) =>
    cat === 'all' ? documents.length : documents.filter(d => d.category === cat).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!propertyId) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-home-4-line text-3xl text-amber-600"></i>
        </div>
        <p className="font-bold text-[#0B1F33] mb-1">Property setup needed</p>
        <p className="text-sm text-[#6B7C8F] mb-6">
          Complete your homeowner enrollment so we can attach documents to your property.
        </p>
        <a
          href="/enroll-homeowner"
          className="inline-block px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer"
        >
          Complete Property Setup
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toolbar: category filter + upload */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {['all', ...DOCUMENT_CATEGORIES].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full font-semibold text-xs whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  categoryFilter === cat
                    ? 'bg-[#D4B483] text-[#0B1F33]'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
              >
                {cat === 'all' ? 'All Documents' : cat}
                <span
                  className={`ml-0.5 text-[10px] ${
                    categoryFilter === cat ? 'text-[#0B1F33]/70' : 'text-[#6B7C8F]'
                  }`}
                >
                  {countForCategory(cat)}
                </span>
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              resetUploadForm();
              setShowUploadModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto flex-shrink-0"
          >
            <i className="ri-upload-cloud-line"></i>
            Upload Document
          </button>
        </div>
      </div>

      {/* Document list */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-folder-3-line text-3xl text-gray-400"></i>
          </div>
          <p className="font-bold text-[#0B1F33] mb-1">
            {documents.length === 0 ? 'No documents yet' : 'No documents match your filters'}
          </p>
          <p className="text-sm text-[#6B7C8F]">
            {documents.length === 0
              ? 'Upload insurance, warranties, permits, appraisals and more to build your property record.'
              : 'Try a different category or search term.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-3">
          {filteredDocuments.map(doc => {
            const style = categoryStyle(doc.category);
            const isExpanded = expandedId === doc.id;
            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 ${style.color} rounded-lg flex items-center justify-center flex-shrink-0`}
                  >
                    <i className={`${style.icon} text-lg sm:text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="font-bold text-[#0B1F33] text-sm sm:text-base truncate">
                        {doc.name}
                      </h4>
                      <span className="px-2 py-0.5 bg-[#F9F9FB] text-[#0B1F33] rounded-full text-[10px] font-semibold whitespace-nowrap">
                        {doc.category}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-[#6B7C8F]">
                      <span className="truncate max-w-[160px] sm:max-w-[240px]">{doc.fileName}</span>
                      <span>{formatFileSize(doc.fileSizeBytes)}</span>
                      <span>
                        <i className="ri-calendar-line mr-1"></i>
                        {doc.uploadDate
                          ? new Date(doc.uploadDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {doc.notes && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                        title={isExpanded ? 'Hide notes' : 'Show notes'}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7C8F] hover:bg-[#F9F9FB] cursor-pointer transition-colors"
                      >
                        <i className={`ri-sticky-note-line ${isExpanded ? 'text-[#D4B483]' : ''}`}></i>
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloadingId === doc.id}
                      title="Download"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-[#0B1F33] hover:bg-[#F9F9FB] cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i
                        className={
                          downloadingId === doc.id
                            ? 'ri-loader-4-line animate-spin'
                            : 'ri-download-line'
                        }
                      ></i>
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      title="Delete"
                      className="w-9 h-9 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <i
                        className={
                          deletingId === doc.id
                            ? 'ri-loader-4-line animate-spin'
                            : 'ri-delete-bin-line'
                        }
                      ></i>
                    </button>
                  </div>
                </div>
                {isExpanded && doc.notes && (
                  <div className="px-3 sm:px-4 pb-3 sm:pb-4 -mt-1">
                    <div className="bg-[#F9F9FB] rounded-lg p-3 text-xs sm:text-sm text-[#0B1F33] whitespace-pre-wrap">
                      {doc.notes}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">Upload Document</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                {/* File picker */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                    File *
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                    onChange={e => handleFileSelected(e.target.files?.[0] || null)}
                    className="w-full text-sm text-[#6B7C8F] file:mr-3 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-[#0B1F33] file:text-white file:font-semibold file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-[10px] text-[#6B7C8F] mt-1">
                    PDF, image, or document file. Max 10 MB.
                  </p>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                    Document Name *
                  </label>
                  <input
                    type="text"
                    value={uploadName}
                    onChange={e => setUploadName(e.target.value)}
                    placeholder="e.g. Homeowner Insurance Policy 2026"
                    maxLength={120}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                    Category *
                  </label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {DOCUMENT_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                    Notes
                  </label>
                  <textarea
                    value={uploadNotes}
                    onChange={e => setUploadNotes(e.target.value)}
                    rows={3}
                    maxLength={500}
                    placeholder="Optional — policy number, renewal date, what this covers..."
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent resize-none"
                  />
                </div>
              </div>

              {uploadError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700">
                    <i className="ri-error-warning-line mr-1"></i>
                    {uploadError}
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    resetUploadForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || !uploadFile || !uploadName.trim() || !uploadCategory}
                  className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
