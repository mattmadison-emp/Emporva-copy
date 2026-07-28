import { useState } from 'react';

export default function LeadImport() {
  const [importMethod, setImportMethod] = useState<'manual' | 'paste' | null>(null);
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle lead import
    alert('Lead imported successfully! AI clarification will begin processing.');
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">Import a Lead</h2>
            <p className="text-[#6B7C8F]">
              Manually add leads or paste details from emails, forms, or other sources
            </p>
          </div>
        </div>

        {/* Import Method Selection */}
        {!importMethod && (
          <div className="grid md:grid-cols-3 gap-4">
            <button
              onClick={() => setImportMethod('manual')}
              className="p-6 bg-[#F9F9FB] rounded-lg hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 bg-[#0B1F33] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-edit-line text-white text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#0B1F33] mb-2">Manual Entry</h3>
              <p className="text-sm text-[#6B7C8F]">Fill out lead details manually</p>
            </button>

            <button
              onClick={() => setImportMethod('paste')}
              className="p-6 bg-[#F9F9FB] rounded-lg hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 bg-[#0B1F33] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-copy-line text-white text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#0B1F33] mb-2">Paste Details</h3>
              <p className="text-sm text-[#6B7C8F]">Copy and paste from email or form</p>
            </button>

            <div className="p-6 bg-gradient-to-br from-[#F9F9FB] to-white rounded-lg border-2 border-dashed border-gray-300 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-link text-gray-400 text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#6B7C8F] mb-2">Email Integration</h3>
              <p className="text-sm text-[#6B7C8F] mb-3">Auto-import from email</p>
              <span className="text-xs bg-[#D4B483] text-[#0B1F33] px-3 py-1 rounded-full font-semibold">
                Pro Feature
              </span>
            </div>
          </div>
        )}

        {/* Manual Entry Form */}
        {importMethod === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  value={leadData.name}
                  onChange={(e) => setLeadData({ ...leadData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={leadData.email}
                  onChange={(e) => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={leadData.phone}
                  onChange={(e) => setLeadData({ ...leadData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                  Property Address *
                </label>
                <input
                  type="text"
                  required
                  value={leadData.address}
                  onChange={(e) => setLeadData({ ...leadData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                Project Description *
              </label>
              <textarea
                required
                value={leadData.description}
                onChange={(e) => setLeadData({ ...leadData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
                placeholder="Describe the project or issue..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                Upload Photos or Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0B1F33] transition-all cursor-pointer">
                <i className="ri-upload-cloud-line text-4xl text-[#6B7C8F] mb-2"></i>
                <p className="text-[#6B7C8F]">Click to upload or drag and drop</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setImportMethod(null)}
                className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-sparkling-line mr-2"></i>
                Import & Run AI Clarification
              </button>
            </div>
          </form>
        )}

        {/* Paste Details */}
        {importMethod === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                Paste Lead Details
              </label>
              <textarea
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33]"
                placeholder="Paste email content, form submission, or any lead details here. AI will extract the relevant information."
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setImportMethod(null)}
                className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-sparkling-line mr-2"></i>
                Process with AI
              </button>
            </div>
          </div>
        )}

        {/* Integration Note */}
        <div className="mt-6 bg-gradient-to-r from-[#F9F9FB] to-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-information-line text-white text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-[#0B1F33] mb-1">Lead Sources</h4>
              <p className="text-sm text-[#6B7C8F]">
                Leads can come from Emporva native intake, manual contractor import, email integrations, 
                form submissions, or automation tools like Zapier. All leads are processed with AI clarification 
                to create structured, scoped jobs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
