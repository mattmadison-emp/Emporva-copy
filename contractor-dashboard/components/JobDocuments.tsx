
import { useState, useRef } from 'react';

interface Document {
  id: number;
  name: string;
  type: 'contract' | 'permit' | 'invoice' | 'photo' | 'inspection' | 'insurance' | 'change-order' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  notes?: string;
  shared: boolean;
}

interface JobDocumentsProps {
  jobId: number;
  jobTitle: string;
  homeowner: string;
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  contract: { label: 'Contract', icon: 'ri-file-text-line', color: 'text-[#0B1F33]', bg: 'bg-[#0B1F33]/10' },
  permit: { label: 'Permit', icon: 'ri-government-line', color: 'text-[#D4B483]', bg: 'bg-[#D4B483]/10' },
  invoice: { label: 'Invoice', icon: 'ri-bill-line', color: 'text-[#00B8A9]', bg: 'bg-[#00B8A9]/10' },
  photo: { label: 'Photo', icon: 'ri-image-line', color: 'text-pink-600', bg: 'bg-pink-50' },
  inspection: { label: 'Inspection', icon: 'ri-search-eye-line', color: 'text-amber-600', bg: 'bg-amber-50' },
  insurance: { label: 'Insurance', icon: 'ri-shield-check-line', color: 'text-green-600', bg: 'bg-green-50' },
  'change-order': { label: 'Change Order', icon: 'ri-exchange-line', color: 'text-orange-600', bg: 'bg-orange-50' },
  other: { label: 'Other', icon: 'ri-file-line', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100' },
  pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
  expired: { label: 'Expired', color: 'text-gray-600', bg: 'bg-gray-200' },
};

export default function JobDocuments({ jobId, jobTitle: _jobTitle, homeowner }: JobDocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [uploadForm, setUploadForm] = useState({
    name: '',
    type: 'other' as string,
    notes: '',
    shared: true,
    files: [] as File[],
  });
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const documents: Document[] = jobId === 1 ? [
    { id: 1, name: 'Service Agreement - Crawlspace Remediation', type: 'contract', size: '245 KB', uploadedBy: 'You', uploadedAt: 'Jan 14, 2025', status: 'approved', shared: true },
    { id: 2, name: 'Building Permit #CLT-2025-0847', type: 'permit', size: '1.2 MB', uploadedBy: 'You', uploadedAt: 'Jan 13, 2025', status: 'approved', notes: 'Approved by Mecklenburg County', shared: true },
    { id: 3, name: 'Initial Assessment Report', type: 'inspection', size: '3.8 MB', uploadedBy: 'You', uploadedAt: 'Jan 15, 2025', status: 'approved', notes: 'Includes moisture readings and photos', shared: true },
    { id: 4, name: 'Vapor Barrier Installation Photos', type: 'photo', size: '12.4 MB', uploadedBy: 'You', uploadedAt: 'Jan 17, 2025', status: 'approved', notes: '8 photos documenting installation', shared: true },
    { id: 5, name: 'Materials Invoice - Vapor Barrier & Drainage', type: 'invoice', size: '156 KB', uploadedBy: 'You', uploadedAt: 'Jan 16, 2025', status: 'approved', shared: false },
    { id: 6, name: 'Dehumidifier Spec Sheet', type: 'other', size: '890 KB', uploadedBy: 'You', uploadedAt: 'Jan 18, 2025', status: 'pending', notes: 'Awaiting homeowner review', shared: true },
    { id: 7, name: 'Liability Insurance Certificate', type: 'insurance', size: '320 KB', uploadedBy: 'You', uploadedAt: 'Jan 12, 2025', status: 'approved', shared: true },
    { id: 8, name: 'Change Order - Additional Insulation', type: 'change-order', size: '198 KB', uploadedBy: 'You', uploadedAt: 'Jan 20, 2025', status: 'approved', notes: 'Approved by Jennifer Martinez', shared: true },
    { id: 9, name: 'Progress Photos - Dehumidifier Setup', type: 'photo', size: '8.6 MB', uploadedBy: 'You', uploadedAt: 'Jan 21, 2025', status: 'pending', notes: '4 photos - awaiting review', shared: true },
    { id: 10, name: 'Spray Foam Invoice', type: 'invoice', size: '142 KB', uploadedBy: 'You', uploadedAt: 'Jan 19, 2025', status: 'pending', shared: false },
  ] : jobId === 2 ? [
    { id: 11, name: 'HVAC Diagnostic Agreement', type: 'contract', size: '210 KB', uploadedBy: 'You', uploadedAt: 'Jan 20, 2025', status: 'approved', shared: true },
    { id: 12, name: 'System Inspection Checklist', type: 'inspection', size: '450 KB', uploadedBy: 'You', uploadedAt: 'Jan 20, 2025', status: 'pending', shared: true },
  ] : [
    { id: 13, name: 'Kitchen Renovation Master Contract', type: 'contract', size: '380 KB', uploadedBy: 'You', uploadedAt: 'Jan 18, 2025', status: 'approved', shared: true },
    { id: 14, name: 'Plumbing Scope of Work', type: 'contract', size: '195 KB', uploadedBy: 'You', uploadedAt: 'Jan 18, 2025', status: 'approved', shared: true },
    { id: 15, name: 'Plumbing Permit #CLT-2025-0912', type: 'permit', size: '1.1 MB', uploadedBy: 'You', uploadedAt: 'Jan 19, 2025', status: 'approved', shared: true },
    { id: 16, name: 'Rough-In Inspection Report', type: 'inspection', size: '2.4 MB', uploadedBy: 'You', uploadedAt: 'Jan 22, 2025', status: 'approved', shared: true },
    { id: 17, name: 'Plumbing Completion Photos', type: 'photo', size: '15.2 MB', uploadedBy: 'You', uploadedAt: 'Jan 24, 2025', status: 'approved', notes: '12 photos of completed plumbing work', shared: true },
    { id: 18, name: 'Final Plumbing Invoice', type: 'invoice', size: '178 KB', uploadedBy: 'You', uploadedAt: 'Jan 24, 2025', status: 'approved', shared: false },
  ];

  const filteredDocs = documents.filter(doc => {
    const matchesFilter = activeFilter === 'all' || doc.type === activeFilter;
    const matchesSearch = searchQuery === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const docCounts = {
    all: documents.length,
    contract: documents.filter(d => d.type === 'contract').length,
    permit: documents.filter(d => d.type === 'permit').length,
    invoice: documents.filter(d => d.type === 'invoice').length,
    photo: documents.filter(d => d.type === 'photo').length,
    inspection: documents.filter(d => d.type === 'inspection').length,
    insurance: documents.filter(d => d.type === 'insurance').length,
    'change-order': documents.filter(d => d.type === 'change-order').length,
  };

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const approvedCount = documents.filter(d => d.status === 'approved').length;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadForm(prev => ({ ...prev, files: Array.from(e.target.files!) }));
    }
  };

  const handleUpload = () => {
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setShowUploadModal(false);
      setUploadForm({ name: '', type: 'other', notes: '', shared: true, files: [] });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#F9F9FB] rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#00B8A9]/10 flex items-center justify-center">
            <i className="ri-folder-line text-[#00B8A9] text-xl"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>{documents.length}</div>
            <div className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Total Documents</div>
          </div>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
            <i className="ri-check-line text-green-600 text-xl"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{approvedCount}</div>
            <div className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Approved</div>
          </div>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
            <i className="ri-time-line text-amber-600 text-xl"></i>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{pendingCount}</div>
            <div className="text-xs text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>Pending Review</div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-1 min-w-[200px] relative">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00B8A9] text-sm"
            style={{ fontFamily: 'Inter, sans-serif' }}
          />
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer flex items-center gap-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <i className="ri-upload-2-line"></i>
          Upload Document
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: 'All' },
          { id: 'contract', label: 'Contracts' },
          { id: 'permit', label: 'Permits' },
          { id: 'invoice', label: 'Invoices' },
          { id: 'photo', label: 'Photos' },
          { id: 'inspection', label: 'Inspections' },
          { id: 'insurance', label: 'Insurance' },
          { id: 'change-order', label: 'Change Orders' },
        ].filter(f => f.id === 'all' || docCounts[f.id as keyof typeof docCounts] > 0).map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
              activeFilter === filter.id
                ? 'bg-[#00B8A9] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {filter.label}
            <span className={`text-xs ${activeFilter === filter.id ? 'text-white/80' : 'text-gray-400'}`}>
              {docCounts[filter.id as keyof typeof docCounts] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-2">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12">
            <i className="ri-folder-open-line text-gray-300 text-5xl mb-3 block"></i>
            <p className="text-sm text-gray-500 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No documents found
            </p>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {searchQuery ? 'Try a different search term' : 'Upload your first document to get started'}
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const tConfig = typeConfig[doc.type];
            const sConfig = statusConfig[doc.status];
            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(selectedDoc?.id === doc.id ? null : doc)}
                className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedDoc?.id === doc.id
                    ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Type Icon */}
                  <div className={`w-10 h-10 rounded-lg ${tConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${tConfig.icon} ${tConfig.color} text-lg`}></i>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="font-semibold text-[#2D2A74] text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {doc.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tConfig.bg} ${tConfig.color}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {tConfig.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sConfig.bg} ${sConfig.color}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {sConfig.label}
                          </span>
                          {doc.shared && (
                            <span className="flex items-center gap-1 text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                              <i className="ri-share-line text-xs"></i>
                              Shared with {homeowner.split(' ')[0]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>{doc.uploadedAt}</p>
                        <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{doc.size}</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {selectedDoc?.id === doc.id && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {doc.notes && (
                          <p className="text-xs text-gray-600 mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <strong>Notes:</strong> {doc.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button className="px-3 py-1.5 bg-[#00B8A9] text-white rounded-md hover:bg-[#00a89a] transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-download-line"></i>
                            Download
                          </button>
                          <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-eye-line"></i>
                            Preview
                          </button>
                          {!doc.shared && (
                            <button className="px-3 py-1.5 bg-white border border-[#00B8A9] text-[#00B8A9] rounded-md hover:bg-[#00B8A9]/5 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              <i className="ri-share-line"></i>
                              Share with Homeowner
                            </button>
                          )}
                          <button className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-edit-line"></i>
                            Rename
                          </button>
                          <button className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-delete-bin-line"></i>
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Required Documents Checklist */}
      <div className="bg-[#F9F9FB] rounded-lg p-5">
        <h4 className="font-bold text-[#2D2A74] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <i className="ri-checkbox-circle-line text-[#00B8A9]"></i>
          Required Documents Checklist
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Signed Contract / Service Agreement', met: documents.some(d => d.type === 'contract' && d.status === 'approved') },
            { label: 'Building Permit (if applicable)', met: documents.some(d => d.type === 'permit' && d.status === 'approved') },
            { label: 'Proof of Insurance', met: documents.some(d => d.type === 'insurance' && d.status === 'approved') },
            { label: 'Initial Inspection / Assessment', met: documents.some(d => d.type === 'inspection' && d.status === 'approved') },
            { label: 'Progress Photos', met: documents.some(d => d.type === 'photo') },
            { label: 'Final Invoice', met: false },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-1.5">
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                item.met ? 'bg-green-500' : 'border-2 border-gray-300'
              }`}>
                {item.met && <i className="ri-check-line text-white text-xs"></i>}
              </div>
              <span className={`text-sm ${item.met ? 'text-[#2D2A74]' : 'text-gray-500'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </span>
              {item.met && (
                <span className="text-xs text-green-600 font-semibold ml-auto" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Complete
                </span>
              )}
              {!item.met && (
                <button
                  onClick={(e) => { e.stopPropagation(); setShowUploadModal(true); }}
                  className="text-xs text-[#00B8A9] font-semibold ml-auto hover:underline cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  Upload
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {uploadSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#2D2A74] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Document Uploaded
                </h3>
                <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your document has been uploaded successfully.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Upload Document
                  </h3>
                  <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <i className="ri-close-line text-gray-500 text-xl"></i>
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  {/* Drop Zone */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#00B8A9] transition-colors cursor-pointer"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv"
                    />
                    <i className="ri-upload-cloud-2-line text-gray-400 text-4xl mb-3 block"></i>
                    {uploadForm.files.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-[#2D2A74] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {uploadForm.files.length} file{uploadForm.files.length > 1 ? 's' : ''} selected
                        </p>
                        {uploadForm.files.map((f, i) => (
                          <p key={i} className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {f.name} ({(f.size / 1024).toFixed(0)} KB)
                          </p>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-gray-600 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Click to browse or drag files here
                        </p>
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          PDF, DOC, JPG, PNG, XLS up to 25MB each
                        </p>
                      </>
                    )}
                  </div>

                  {/* Document Name */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2A74] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Document Name
                    </label>
                    <input
                      type="text"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Progress Photos - Week 2"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00B8A9] text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  {/* Document Type */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2A74] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Document Type
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setUploadForm(prev => ({ ...prev, type: key }))}
                          className={`p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                            uploadForm.type === key
                              ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                              : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <i className={`${config.icon} ${uploadForm.type === key ? 'text-[#00B8A9]' : config.color} text-lg block mb-1`}></i>
                          <span className="text-xs font-semibold text-[#2D2A74] block leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {config.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-semibold text-[#2D2A74] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={uploadForm.notes}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          setUploadForm(prev => ({ ...prev, notes: e.target.value }));
                        }
                      }}
                      maxLength={500}
                      placeholder="Add any relevant notes about this document..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00B8A9] text-sm resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{uploadForm.notes.length}/500</p>
                  </div>

                  {/* Share Toggle */}
                  <div className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-[#2D2A74]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Share with Homeowner
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {homeowner} will be able to view this document
                      </p>
                    </div>
                    <button
                      onClick={() => setUploadForm(prev => ({ ...prev, shared: !prev.shared }))}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative ${
                        uploadForm.shared ? 'bg-[#00B8A9]' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${
                        uploadForm.shared ? 'left-6' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button
                    onClick={() => setShowUploadModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={uploadForm.files.length === 0 || !uploadForm.name.trim()}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                      uploadForm.files.length > 0 && uploadForm.name.trim()
                        ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-upload-2-line"></i>
                    Upload Document
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
