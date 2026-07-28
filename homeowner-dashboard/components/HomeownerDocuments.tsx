
import { useState, useRef } from 'react';

interface HomeownerDocumentsProps {
  jobId: number;
  jobTitle: string;
  contractor: string;
}

interface Document {
  id: number;
  name: string;
  type: 'contract' | 'permit' | 'invoice' | 'photo' | 'inspection' | 'insurance' | 'change-order' | 'warranty' | 'other';
  size: string;
  uploadedBy: string;
  uploadedAt: string;
  status: 'approved' | 'pending' | 'rejected' | 'expired';
  notes?: string;
  shared: boolean;
  sharedBy: 'contractor' | 'homeowner' | 'system';
  category: string;
}

const typeConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  contract: { label: 'Contract', icon: 'ri-file-text-line', color: 'text-[#0B1F33]', bg: 'bg-[#0B1F33]/10' },
  permit: { label: 'Permit', icon: 'ri-government-line', color: 'text-[#D4B483]', bg: 'bg-[#D4B483]/10' },
  invoice: { label: 'Invoice', icon: 'ri-bill-line', color: 'text-[#00B8A9]', bg: 'bg-[#00B8A9]/10' },
  photo: { label: 'Photo', icon: 'ri-image-line', color: 'text-pink-600', bg: 'bg-pink-50' },
  inspection: { label: 'Inspection', icon: 'ri-search-eye-line', color: 'text-amber-600', bg: 'bg-amber-50' },
  insurance: { label: 'Insurance', icon: 'ri-shield-check-line', color: 'text-green-600', bg: 'bg-green-50' },
  'change-order': { label: 'Change Order', icon: 'ri-exchange-line', color: 'text-orange-600', bg: 'bg-orange-50' },
  warranty: { label: 'Warranty', icon: 'ri-award-line', color: 'text-[#2D2A74]', bg: 'bg-[#2D2A74]/10' },
  other: { label: 'Other', icon: 'ri-file-line', color: 'text-gray-600', bg: 'bg-gray-100' },
};

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  approved: { label: 'Approved', color: 'text-green-700', bg: 'bg-green-100' },
  pending: { label: 'Pending Review', color: 'text-amber-700', bg: 'bg-amber-100' },
  rejected: { label: 'Rejected', color: 'text-red-700', bg: 'bg-red-100' },
  expired: { label: 'Expired', color: 'text-gray-600', bg: 'bg-gray-200' },
};

const jobDocumentsData: Record<number, Document[]> = {
  1: [
    { id: 1, name: 'Service Agreement - Crawlspace Remediation', type: 'contract', size: '245 KB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 14, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Legal' },
    { id: 2, name: 'Building Permit #CLT-2025-0847', type: 'permit', size: '1.2 MB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 13, 2025', status: 'approved', notes: 'Approved by Mecklenburg County', shared: true, sharedBy: 'contractor', category: 'Legal' },
    { id: 3, name: 'Initial Assessment Report', type: 'inspection', size: '3.8 MB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 15, 2025', status: 'approved', notes: 'Includes moisture readings and photos', shared: true, sharedBy: 'contractor', category: 'Reports' },
    { id: 4, name: 'Vapor Barrier Installation Photos', type: 'photo', size: '12.4 MB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 17, 2025', status: 'approved', notes: '8 photos documenting installation', shared: true, sharedBy: 'contractor', category: 'Photos' },
    { id: 5, name: 'Homeowner Insurance Policy', type: 'insurance', size: '520 KB', uploadedBy: 'You', uploadedAt: 'Jan 12, 2025', status: 'approved', notes: 'State Farm policy covering water damage', shared: true, sharedBy: 'homeowner', category: 'Insurance' },
    { id: 6, name: 'Dehumidifier Spec Sheet', type: 'other', size: '890 KB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 18, 2025', status: 'pending', notes: 'Awaiting your review', shared: true, sharedBy: 'contractor', category: 'Specifications' },
    { id: 7, name: 'Contractor Liability Insurance Certificate', type: 'insurance', size: '320 KB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 12, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Insurance' },
    { id: 8, name: 'Change Order - Additional Insulation', type: 'change-order', size: '198 KB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 20, 2025', status: 'approved', notes: 'Approved by you on Jan 20', shared: true, sharedBy: 'contractor', category: 'Changes' },
    { id: 9, name: 'Progress Photos - Dehumidifier Setup', type: 'photo', size: '8.6 MB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 21, 2025', status: 'pending', notes: '4 photos - awaiting review', shared: true, sharedBy: 'contractor', category: 'Photos' },
    { id: 10, name: 'Property Inspection Report (Pre-Work)', type: 'inspection', size: '2.1 MB', uploadedBy: 'You', uploadedAt: 'Jan 10, 2025', status: 'approved', notes: 'Home inspection report showing crawlspace issues', shared: true, sharedBy: 'homeowner', category: 'Reports' },
    { id: 11, name: 'Dehumidifier Warranty Card', type: 'warranty', size: '145 KB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 19, 2025', status: 'approved', notes: '5-year manufacturer warranty', shared: true, sharedBy: 'contractor', category: 'Warranty' },
    { id: 12, name: 'Materials Invoice - Vapor Barrier & Drainage', type: 'invoice', size: '156 KB', uploadedBy: 'Mike Thompson', uploadedAt: 'Jan 16, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Financial' },
  ],
  2: [
    { id: 20, name: 'HVAC Diagnostic Agreement', type: 'contract', size: '210 KB', uploadedBy: 'Sarah Martinez', uploadedAt: 'Jan 20, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Legal' },
    { id: 21, name: 'System Inspection Checklist', type: 'inspection', size: '450 KB', uploadedBy: 'Sarah Martinez', uploadedAt: 'Jan 20, 2025', status: 'pending', shared: true, sharedBy: 'contractor', category: 'Reports' },
    { id: 22, name: 'HVAC Maintenance History', type: 'other', size: '180 KB', uploadedBy: 'You', uploadedAt: 'Jan 19, 2025', status: 'approved', notes: 'Last 3 years of service records', shared: true, sharedBy: 'homeowner', category: 'Reports' },
  ],
  3: [
    { id: 30, name: 'Roof Replacement Quote', type: 'contract', size: '280 KB', uploadedBy: 'David Chen', uploadedAt: 'Jan 25, 2025', status: 'pending', shared: true, sharedBy: 'contractor', category: 'Legal' },
    { id: 31, name: 'Roof Damage Photos', type: 'photo', size: '15.8 MB', uploadedBy: 'You', uploadedAt: 'Jan 24, 2025', status: 'approved', notes: 'Photos taken after storm damage', shared: true, sharedBy: 'homeowner', category: 'Photos' },
  ],
  4: [
    { id: 40, name: 'Water Heater Installation Contract', type: 'contract', size: '195 KB', uploadedBy: 'James Wilson', uploadedAt: 'Jan 9, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Legal' },
    { id: 41, name: 'Water Heater Warranty', type: 'warranty', size: '310 KB', uploadedBy: 'James Wilson', uploadedAt: 'Jan 11, 2025', status: 'approved', notes: '10-year tank warranty, 6-year parts', shared: true, sharedBy: 'contractor', category: 'Warranty' },
    { id: 42, name: 'Final Invoice', type: 'invoice', size: '142 KB', uploadedBy: 'James Wilson', uploadedAt: 'Jan 11, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Financial' },
    { id: 43, name: 'Completion Certificate', type: 'inspection', size: '98 KB', uploadedBy: 'James Wilson', uploadedAt: 'Jan 11, 2025', status: 'approved', shared: true, sharedBy: 'contractor', category: 'Reports' },
  ],
};

export default function HomeownerDocuments({ jobId, jobTitle: _jobTitle, contractor }: HomeownerDocumentsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'contractor' | 'homeowner'>('all');
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
  const [reviewAction, setReviewAction] = useState<{ doc: Document; action: 'approve' | 'reject' } | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [reviewProcessing, setReviewProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const documents = jobDocumentsData[jobId] || jobDocumentsData[1];

  const filteredDocs = documents.filter(doc => {
    const matchesType = activeFilter === 'all' || doc.type === activeFilter;
    const matchesSource = sourceFilter === 'all' || doc.sharedBy === sourceFilter;
    const matchesSearch = searchQuery === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSource && matchesSearch;
  });

  const docCounts: Record<string, number> = { all: documents.length };
  documents.forEach(d => { docCounts[d.type] = (docCounts[d.type] || 0) + 1; });

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const contractorDocs = documents.filter(d => d.sharedBy === 'contractor').length;
  const myDocs = documents.filter(d => d.sharedBy === 'homeowner').length;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

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
      showToast('Document uploaded successfully');
    }, 2000);
  };

  const handleReview = (doc: Document, action: 'approve' | 'reject') => {
    setReviewAction({ doc, action });
    setReviewNote('');
  };

  const confirmReview = () => {
    if (!reviewAction) return;
    if (reviewAction.action === 'reject' && !reviewNote.trim()) return;
    setReviewProcessing(true);
    setTimeout(() => {
      setReviewProcessing(false);
      setReviewAction(null);
      setReviewNote('');
      showToast(reviewAction.action === 'approve' ? 'Document approved' : 'Document sent back for revision');
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0B1F33] rounded-xl p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <i className="ri-folder-line text-[#D4B483]"></i>
            </div>
            <span className="text-xs text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>Total</span>
          </div>
          <p className="text-2xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{documents.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i className="ri-check-line text-green-600"></i>
            </div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Approved</span>
          </div>
          <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{approvedCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <i className="ri-time-line text-amber-600"></i>
            </div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Pending</span>
          </div>
          <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{pendingCount}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
              <i className="ri-share-line text-[#00B8A9]"></i>
            </div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Shared</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{contractorDocs} from {contractor.split(' ')[0]}</span>
            <span className="text-xs text-[#6B7C8F]">&middot;</span>
            <span className="text-sm font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>{myDocs} yours</span>
          </div>
        </div>
      </div>

      {/* Pending Review Alert */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-notification-3-line text-amber-600 text-xl"></i>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-amber-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              {pendingCount} Document{pendingCount > 1 ? 's' : ''} Awaiting Your Review
            </p>
            <p className="text-xs text-amber-700" style={{ fontFamily: 'Inter, sans-serif' }}>
              {contractor} has shared documents that need your review and approval.
            </p>
          </div>
          <button
            onClick={() => setActiveFilter('all')}
            className="px-3 py-1.5 bg-amber-600 text-white rounded-lg text-xs font-semibold hover:bg-amber-700 cursor-pointer whitespace-nowrap flex items-center gap-1.5 transition-colors"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-eye-line"></i>
            Review Now
          </button>
        </div>
      )}

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
        {/* Source Filter */}
        <div className="flex bg-[#F9F9FB] rounded-lg p-1">
          {[
            { id: 'all', label: 'All' },
            { id: 'contractor', label: contractor.split(' ')[0] },
            { id: 'homeowner', label: 'My Uploads' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setSourceFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                sourceFilter === f.id
                  ? 'bg-white text-[#0B1F33] shadow-sm'
                  : 'text-[#6B7C8F] hover:text-[#0B1F33]'
              }`}
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {f.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a2f47] transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer flex items-center gap-2"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <i className="ri-upload-2-line"></i>
          Upload Document
        </button>
      </div>

      {/* Type Filter Chips */}
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
          { id: 'warranty', label: 'Warranties' },
          { id: 'other', label: 'Other' },
        ].filter(f => f.id === 'all' || (docCounts[f.id] || 0) > 0).map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilter(filter.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
              activeFilter === filter.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {filter.label}
            <span className={`text-xs ${activeFilter === filter.id ? 'text-white/70' : 'text-gray-400'}`}>
              {docCounts[filter.id] || 0}
            </span>
          </button>
        ))}
      </div>

      {/* Document List */}
      <div className="space-y-2">
        {filteredDocs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
            <i className="ri-folder-open-line text-gray-300 text-5xl mb-3 block"></i>
            <p className="text-sm text-[#6B7C8F] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
              No documents found
            </p>
            <p className="text-xs text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
              {searchQuery ? 'Try a different search term' : 'No documents match the current filters'}
            </p>
          </div>
        ) : (
          filteredDocs.map((doc) => {
            const tConfig = typeConfig[doc.type];
            const sConfig = statusConfig[doc.status];
            const isSelected = selectedDoc?.id === doc.id;
            const isPending = doc.status === 'pending' && doc.sharedBy === 'contractor';

            return (
              <div
                key={doc.id}
                onClick={() => setSelectedDoc(isSelected ? null : doc)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  isPending
                    ? isSelected
                      ? 'border-amber-400 bg-amber-50/50'
                      : 'border-amber-200 bg-amber-50/30 hover:border-amber-300'
                    : isSelected
                    ? 'border-[#00B8A9] bg-[#00B8A9]/5'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${tConfig.bg} flex items-center justify-center flex-shrink-0`}>
                    <i className={`${tConfig.icon} ${tConfig.color} text-lg`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="font-semibold text-[#0B1F33] text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {doc.name}
                        </h5>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tConfig.bg} ${tConfig.color}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {tConfig.label}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${sConfig.bg} ${sConfig.color}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {sConfig.label}
                          </span>
                          <span className={`flex items-center gap-1 text-xs ${doc.sharedBy === 'homeowner' ? 'text-[#00B8A9]' : 'text-[#6B7C8F]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                            <i className={doc.sharedBy === 'homeowner' ? 'ri-user-line' : 'ri-user-star-line'}></i>
                            {doc.uploadedBy === 'You' ? 'Uploaded by you' : `From ${doc.uploadedBy}`}
                          </span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{doc.uploadedAt}</p>
                        <p className="text-xs text-gray-400 mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>{doc.size}</p>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isSelected && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        {doc.notes && (
                          <p className="text-xs text-[#6B7C8F] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                            <strong className="text-[#0B1F33]">Notes:</strong> {doc.notes}
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button className="px-3 py-1.5 bg-[#0B1F33] text-white rounded-md hover:bg-[#1a2f47] transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-download-line"></i>
                            Download
                          </button>
                          <button className="px-3 py-1.5 bg-white border border-gray-200 text-[#0B1F33] rounded-md hover:bg-gray-50 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            <i className="ri-eye-line"></i>
                            Preview
                          </button>
                          {isPending && (
                            <>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReview(doc, 'approve'); }}
                                className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                <i className="ri-check-line"></i>
                                Approve
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleReview(doc, 'reject'); }}
                                className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              >
                                <i className="ri-close-line"></i>
                                Reject
                              </button>
                            </>
                          )}
                          {doc.sharedBy === 'homeowner' && (
                            <button className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors text-xs font-semibold whitespace-nowrap cursor-pointer flex items-center gap-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              <i className="ri-delete-bin-line"></i>
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quick approve for pending when collapsed */}
                    {!isSelected && isPending && (
                      <div className="flex gap-2 mt-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleReview(doc, 'approve')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center gap-1"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-check-line"></i>Approve
                        </button>
                        <button
                          onClick={() => handleReview(doc, 'reject')}
                          className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-xs font-semibold hover:bg-red-50 cursor-pointer whitespace-nowrap flex items-center gap-1"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-close-line"></i>Reject
                        </button>
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
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="font-bold text-[#0B1F33] mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <i className="ri-checkbox-circle-line text-[#00B8A9]"></i>
          Required Documents Checklist
        </h4>
        <div className="space-y-2">
          {[
            { label: 'Signed Contract / Service Agreement', met: documents.some(d => d.type === 'contract' && d.status === 'approved') },
            { label: 'Building Permit (if applicable)', met: documents.some(d => d.type === 'permit' && d.status === 'approved') },
            { label: 'Contractor Proof of Insurance', met: documents.some(d => d.type === 'insurance' && d.status === 'approved' && d.sharedBy === 'contractor') },
            { label: 'Initial Inspection / Assessment', met: documents.some(d => d.type === 'inspection' && d.status === 'approved') },
            { label: 'Progress Photos', met: documents.some(d => d.type === 'photo') },
            { label: 'Warranty Documentation', met: documents.some(d => d.type === 'warranty' && d.status === 'approved') },
            { label: 'Final Invoice', met: false },
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 py-1.5">
              <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 ${
                item.met ? 'bg-green-500' : 'border-2 border-gray-300'
              }`}>
                {item.met && <i className="ri-check-line text-white text-xs"></i>}
              </div>
              <span className={`text-sm flex-1 ${item.met ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                {item.label}
              </span>
              {item.met ? (
                <span className="text-xs text-green-600 font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Complete</span>
              ) : (
                <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Awaiting</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {uploadSuccess ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <i className="ri-check-line text-green-600 text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Document Uploaded</h3>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Your document has been uploaded and shared with {contractor}.
                </p>
              </div>
            ) : (
              <>
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Upload Document</h3>
                  <button onClick={() => setShowUploadModal(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                    <i className="ri-close-line text-[#6B7C8F] text-xl"></i>
                  </button>
                </div>
                <div className="p-6 space-y-5">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#00B8A9] transition-colors cursor-pointer"
                  >
                    <input ref={fileInputRef} type="file" multiple onChange={handleFileSelect} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx,.csv" />
                    <i className="ri-upload-cloud-2-line text-gray-400 text-4xl mb-3 block"></i>
                    {uploadForm.files.length > 0 ? (
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {uploadForm.files.length} file{uploadForm.files.length > 1 ? 's' : ''} selected
                        </p>
                        {uploadForm.files.map((f, i) => (
                          <p key={i} className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {f.name} ({(f.size / 1024).toFixed(0)} KB)
                          </p>
                        ))}
                      </div>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-[#6B7C8F] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>Click to browse or drag files here</p>
                        <p className="text-xs text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>PDF, DOC, JPG, PNG, XLS up to 25MB each</p>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Document Name</label>
                    <input
                      type="text"
                      value={uploadForm.name}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Home Insurance Policy"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00B8A9] text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>Document Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {Object.entries(typeConfig).map(([key, config]) => (
                        <button
                          key={key}
                          onClick={() => setUploadForm(prev => ({ ...prev, type: key }))}
                          className={`p-2.5 rounded-lg border-2 text-center transition-all cursor-pointer ${
                            uploadForm.type === key ? 'border-[#00B8A9] bg-[#00B8A9]/5' : 'border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <i className={`${config.icon} ${uploadForm.type === key ? 'text-[#00B8A9]' : config.color} text-lg block mb-1`}></i>
                          <span className="text-xs font-semibold text-[#0B1F33] block leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>{config.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={uploadForm.notes}
                      onChange={(e) => { if (e.target.value.length <= 500) setUploadForm(prev => ({ ...prev, notes: e.target.value })); }}
                      maxLength={500}
                      placeholder="Add any relevant notes..."
                      rows={3}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-[#00B8A9] text-sm resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-xs text-gray-400 text-right mt-1">{uploadForm.notes.length}/500</p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg">
                    <div>
                      <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Share with Contractor</p>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{contractor} will be able to view this document</p>
                    </div>
                    <button
                      onClick={() => setUploadForm(prev => ({ ...prev, shared: !prev.shared }))}
                      className={`w-12 h-7 rounded-full transition-colors cursor-pointer relative ${uploadForm.shared ? 'bg-[#00B8A9]' : 'bg-gray-300'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow-sm ${uploadForm.shared ? 'left-6' : 'left-1'}`}></div>
                    </button>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-3">
                  <button onClick={() => setShowUploadModal(false)} className="flex-1 px-4 py-3 bg-gray-100 text-[#6B7C8F] rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                  <button
                    onClick={handleUpload}
                    disabled={uploadForm.files.length === 0 || !uploadForm.name.trim()}
                    className={`flex-1 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-colors flex items-center justify-center gap-2 ${
                      uploadForm.files.length > 0 && uploadForm.name.trim()
                        ? 'bg-[#0B1F33] text-white hover:bg-[#1a2f47]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-upload-2-line"></i>Upload Document
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewAction && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => { if (!reviewProcessing) setReviewAction(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {reviewProcessing ? (
              <div className="p-10 text-center">
                <div className={`w-16 h-16 border-4 ${reviewAction.action === 'approve' ? 'border-green-200 border-t-green-600' : 'border-red-200 border-t-red-600'} rounded-full animate-spin mx-auto mb-5`}></div>
                <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {reviewAction.action === 'approve' ? 'Approving Document...' : 'Sending Feedback...'}
                </h4>
              </div>
            ) : (
              <>
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${reviewAction.action === 'approve' ? 'bg-green-100' : 'bg-red-100'}`}>
                        <i className={`${reviewAction.action === 'approve' ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'} text-xl`}></i>
                      </div>
                      <div>
                        <h3 className="font-bold text-[#0B1F33] text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {reviewAction.action === 'approve' ? 'Approve Document' : 'Reject Document'}
                        </h3>
                        <p className="text-xs text-[#6B7C8F] truncate max-w-[250px]" style={{ fontFamily: 'Inter, sans-serif' }}>{reviewAction.doc.name}</p>
                      </div>
                    </div>
                    <button onClick={() => setReviewAction(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                      <i className="ri-close-line text-[#6B7C8F] text-lg"></i>
                    </button>
                  </div>
                </div>
                <div className="p-5 space-y-4">
                  {reviewAction.action === 'approve' ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                      <i className="ri-check-double-line text-green-600 text-xl mt-0.5"></i>
                      <p className="text-sm text-green-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                        This document will be marked as approved and {contractor} will be notified.
                      </p>
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                      <i className="ri-information-line text-red-600 text-xl mt-0.5"></i>
                      <p className="text-sm text-red-800" style={{ fontFamily: 'Inter, sans-serif' }}>
                        This document will be sent back to {contractor} with your feedback.
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs font-bold text-[#0B1F33] mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      {reviewAction.action === 'approve' ? 'Feedback (optional)' : 'Reason for Rejection'} {reviewAction.action === 'reject' && <span className="text-red-500">*</span>}
                    </label>
                    <textarea
                      value={reviewNote}
                      onChange={(e) => { if (e.target.value.length <= 500) setReviewNote(e.target.value); }}
                      placeholder={reviewAction.action === 'approve' ? 'Looks good...' : 'Please describe the issue...'}
                      rows={3}
                      maxLength={500}
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]/30 focus:border-[#00B8A9] resize-none"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-xs text-[#6B7C8F] text-right mt-1">{reviewNote.length}/500</p>
                  </div>
                </div>
                <div className="p-5 border-t border-gray-100 flex justify-end gap-3">
                  <button onClick={() => setReviewAction(null)} className="px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                  <button
                    onClick={confirmReview}
                    disabled={reviewAction.action === 'reject' && !reviewNote.trim()}
                    className={`px-5 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap flex items-center gap-2 transition-all ${
                      reviewAction.action === 'approve'
                        ? 'bg-green-600 text-white hover:bg-green-700 cursor-pointer'
                        : reviewNote.trim()
                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className={reviewAction.action === 'approve' ? 'ri-check-line' : 'ri-close-line'}></i>
                    {reviewAction.action === 'approve' ? 'Approve' : 'Reject'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce">
          <i className="ri-check-line text-[#00B8A9]"></i>
          <span className="text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>{toast}</span>
        </div>
      )}
    </div>
  );
}
