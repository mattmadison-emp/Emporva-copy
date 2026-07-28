export default function Documents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F33]">Documents</h2>
          <p className="text-[#6B7C8F]">Store and organize property documents, photos, and records</p>
        </div>
        <button className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap flex items-center gap-2">
          <i className="ri-upload-line text-xl"></i>
          Upload Document
        </button>
      </div>

      {/* Document Categories */}
      <div className="grid md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-file-text-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="font-semibold text-[#0B1F33] mb-2">Property Documents</h3>
          <p className="text-sm text-[#6B7C8F] mb-3">Deeds, permits, certificates</p>
          <p className="text-2xl font-bold text-[#0B1F33]">24</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-image-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="font-semibold text-[#0B1F33] mb-2">Photos</h3>
          <p className="text-sm text-[#6B7C8F] mb-3">Property and unit photos</p>
          <p className="text-2xl font-bold text-[#0B1F33]">342</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-file-list-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="font-semibold text-[#0B1F33] mb-2">Invoices & Receipts</h3>
          <p className="text-sm text-[#6B7C8F] mb-3">Job and maintenance records</p>
          <p className="text-2xl font-bold text-[#0B1F33]">156</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center mb-4">
            <i className="ri-tools-line text-2xl text-[#D4B483]"></i>
          </div>
          <h3 className="font-semibold text-[#0B1F33] mb-2">Equipment Manuals</h3>
          <p className="text-sm text-[#6B7C8F] mb-3">HVAC, appliances, systems</p>
          <p className="text-2xl font-bold text-[#0B1F33]">48</p>
        </div>
      </div>

      {/* Recent Documents */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Recent Documents</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
                <i className="ri-file-pdf-line text-xl text-red-500"></i>
              </div>
              <div>
                <h4 className="font-semibold text-[#0B1F33]">Building A - HVAC Service Report</h4>
                <p className="text-sm text-[#6B7C8F]">Uploaded 2 hours ago • 2.4 MB</p>
              </div>
            </div>
            <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium whitespace-nowrap cursor-pointer">
              View
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
                <i className="ri-image-line text-xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-semibold text-[#0B1F33]">Unit 304 - Water Damage Photos</h4>
                <p className="text-sm text-[#6B7C8F]">Uploaded yesterday • 8 photos</p>
              </div>
            </div>
            <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium whitespace-nowrap cursor-pointer">
              View
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
                <i className="ri-file-text-line text-xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-semibold text-[#0B1F33]">Building C - Roof Inspection Certificate</h4>
                <p className="text-sm text-[#6B7C8F]">Uploaded 3 days ago • 1.2 MB</p>
              </div>
            </div>
            <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium whitespace-nowrap cursor-pointer">
              View
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-line text-xl text-[#D4B483]"></i>
              </div>
              <div>
                <h4 className="font-semibold text-[#0B1F33]">Painting Invoice - Building A Exterior</h4>
                <p className="text-sm text-[#6B7C8F]">Uploaded 1 week ago • 456 KB</p>
              </div>
            </div>
            <button className="text-[#D4B483] hover:text-[#D4B483]/80 font-medium whitespace-nowrap cursor-pointer">
              View
            </button>
          </div>
        </div>
      </div>

      {/* Organize by Property */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Browse by Property</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-[#F9F9FB] transition-colors">
            <h4 className="font-semibold text-[#0B1F33] mb-2">Building A</h4>
            <p className="text-sm text-[#6B7C8F]">142 documents</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-[#F9F9FB] transition-colors">
            <h4 className="font-semibold text-[#0B1F33] mb-2">Building B</h4>
            <p className="text-sm text-[#6B7C8F]">128 documents</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg text-left hover:bg-[#F9F9FB] transition-colors">
            <h4 className="font-semibold text-[#0B1F33] mb-2">Building C</h4>
            <p className="text-sm text-[#6B7C8F]">156 documents</p>
          </button>
        </div>
      </div>
    </div>
  );
}
