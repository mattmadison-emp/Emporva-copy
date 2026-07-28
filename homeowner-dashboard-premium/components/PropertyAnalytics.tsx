
import { useState } from 'react';

export default function PropertyAnalytics() {
  const [timeRange, setTimeRange] = useState<'month' | 'quarter' | 'year'>('month');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [manualReadings, setManualReadings] = useState<any[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [processingFiles, setProcessingFiles] = useState<string[]>([]);

  const handleFileUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    const fileNames = files.map((f) => f.name);
    setProcessingFiles(fileNames);
    setTimeout(() => {
      const newFiles = files.map((file, index) => ({
        id: Date.now() + index,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
        date: new Date().toLocaleDateString(),
        type: file.type.includes('pdf') ? 'PDF' : file.type.includes('csv') ? 'CSV' : 'Image',
      }));
      setUploadedFiles((prev) => [...prev, ...newFiles]);
      setProcessingFiles([]);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Utility Insights</h2>
          <p className="text-sm text-gray-600 mt-1">Track and optimize your home's utility usage</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <i className="ri-upload-cloud-line text-lg"></i>
            <span className="hidden sm:inline">Upload Bills</span>
            <span className="sm:hidden">Upload</span>
          </button>
          <button
            onClick={() => setShowManualEntry(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium whitespace-nowrap"
          >
            <i className="ri-edit-line text-lg"></i>
            <span className="hidden sm:inline">Manual Entry</span>
            <span className="sm:hidden">Enter</span>
          </button>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {(['month', 'quarter', 'year'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap capitalize ${
              timeRange === range
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {range.charAt(0).toUpperCase() + range.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[
          { label: 'Electric', icon: 'ri-flashlight-line', color: 'yellow', month: '$142', quarter: '$398', year: '$1,620' },
          { label: 'Gas', icon: 'ri-fire-line', color: 'orange', month: '$88', quarter: '$264', year: '$980' },
          { label: 'Water', icon: 'ri-drop-line', color: 'blue', month: '$54', quarter: '$162', year: '$648' },
          { label: 'Total', icon: 'ri-bar-chart-line', color: 'teal', month: '$284', quarter: '$824', year: '$3,248' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className={`w-10 h-10 flex items-center justify-center bg-${stat.color}-100 rounded-lg mb-3`}>
              <i className={`${stat.icon} text-xl text-${stat.color}-600`}></i>
            </div>
            <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
            <p className="text-xl font-bold text-gray-900">
              {timeRange === 'month' ? stat.month : timeRange === 'quarter' ? stat.quarter : stat.year}
            </p>
          </div>
        ))}
      </div>

      {/* Property Health Score */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Property Health Score</h3>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full">
            <i className="ri-vip-crown-line text-[#0B1F33] text-xs"></i>
            <span className="text-xs font-bold text-[#0B1F33]">Premium</span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-36 h-36 flex-shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="72" cy="72" r="60" stroke="#F3F4F6" strokeWidth="12" fill="none" />
              <circle
                cx="72" cy="72" r="60"
                stroke="#0d9488"
                strokeWidth="12"
                fill="none"
                strokeDasharray="376.8"
                strokeDashoffset="56.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900">85</span>
              <span className="text-xs text-gray-500">Excellent</span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1 w-full">
            {[
              { label: 'Structural', score: 92, icon: 'ri-shield-check-line', color: 'green' },
              { label: 'HVAC', score: 88, icon: 'ri-temp-cold-line', color: 'green' },
              { label: 'Plumbing', score: 76, icon: 'ri-drop-line', color: 'yellow' },
              { label: 'Electrical', score: 90, icon: 'ri-flashlight-line', color: 'green' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className={`w-10 h-10 bg-${item.color}-100 rounded-full flex items-center justify-center mx-auto mb-1.5`}>
                  <i className={`${item.icon} text-${item.color}-600 text-lg`}></i>
                </div>
                <p className="text-xs text-gray-500 mb-0.5">{item.label}</p>
                <p className="text-base font-bold text-gray-900">{item.score}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance Forecast */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">12-Month Maintenance Forecast</h3>
        <div className="space-y-3">
          {[
            { title: 'Roof Replacement Recommended', desc: 'Expected within 6-12 months based on age and condition', cost: 'Est. Cost: $12,000 - $18,000', icon: 'ri-home-4-line', bg: 'red' },
            { title: 'Water Heater Nearing End of Life', desc: 'Typical lifespan: 10-12 years. Current age: 9 years', cost: 'Est. Cost: $1,200 - $2,500', icon: 'ri-fire-line', bg: 'yellow' },
            { title: 'HVAC System in Good Condition', desc: 'Regular maintenance recommended every 6 months', cost: 'Next Service: May 2024', icon: 'ri-temp-cold-line', bg: 'green' },
          ].map((item) => (
            <div key={item.title} className={`flex items-start gap-3 p-4 bg-${item.bg}-50 rounded-lg border border-${item.bg}-200`}>
              <div className={`w-10 h-10 bg-${item.bg}-100 rounded-lg flex items-center justify-center flex-shrink-0`}>
                <i className={`${item.icon} text-${item.bg}-600 text-lg`}></i>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
                <p className={`text-xs font-semibold text-${item.bg}-600 mt-1`}>{item.cost}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual Cost Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Annual Cost Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Maintenance Spent (YTD)', value: '$3,240', sub: '↓ 12% vs last year', subColor: 'text-emerald-400' },
            { label: 'Projected Annual Cost', value: '$8,500', sub: 'Based on forecast', subColor: 'text-gray-300' },
            { label: 'Property Value Impact', value: '+$12K', sub: 'From improvements', subColor: 'text-gray-300', valueColor: 'text-emerald-400' },
          ].map((item) => (
            <div key={item.label} className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-lg p-4 text-white">
              <p className="text-xs text-gray-300 mb-1">{item.label}</p>
              <p className={`text-2xl font-bold ${item.valueColor || 'text-white'}`}>{item.value}</p>
              <p className={`text-xs mt-1 ${item.subColor}`}>{item.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Readings List */}
      {manualReadings.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6">
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-4">Uploaded Bills &amp; Readings</h3>
          <div className="space-y-2">
            {manualReadings.map((reading) => (
              <div key={reading.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-9 h-9 flex items-center justify-center bg-teal-100 rounded-lg flex-shrink-0">
                  <i className="ri-edit-line text-teal-600"></i>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 capitalize">{String(reading.type)} — {String(reading.period)}</p>
                  <p className="text-xs text-gray-500">{reading.usage} kWh · ${reading.cost} · {reading.date}</p>
                </div>
                <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-medium rounded whitespace-nowrap">Manual</span>
                <button
                  onClick={() => setManualReadings(manualReadings.filter((r) => r.id !== reading.id))}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Upload Utility Bills</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileUpload(Array.from(e.dataTransfer.files));
                }}
                className={`border-2 border-dashed rounded-xl p-6 sm:p-12 text-center transition-colors ${
                  isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
                }`}
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center bg-teal-100 rounded-full">
                  <i className="ri-upload-cloud-2-line text-2xl sm:text-3xl text-teal-600"></i>
                </div>
                <p className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">
                  Drop your bills here or click to browse
                </p>
                <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                  PDF, JPG, PNG, or CSV files up to 10MB
                </p>
                <input
                  type="file"
                  id="bill-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.csv"
                  onChange={(e) => handleFileUpload(Array.from(e.target.files || []))}
                  className="hidden"
                />
                <label
                  htmlFor="bill-upload"
                  className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer text-sm sm:text-base font-medium"
                >
                  <i className="ri-folder-open-line"></i>
                  Browse Files
                </label>
              </div>

              {/* Processing Files */}
              {processingFiles.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Processing...</h4>
                  {processingFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-blue-100 rounded-lg flex-shrink-0">
                        <i className="ri-file-text-line text-lg sm:text-xl text-blue-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file}</p>
                        <div className="w-full bg-blue-200 rounded-full h-1.5 mt-1.5">
                          <div className="bg-blue-600 h-1.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Uploaded Files List */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Uploaded Bills</h4>
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center bg-green-100 rounded-lg flex-shrink-0">
                        <i className="ri-file-text-line text-lg sm:text-xl text-green-600"></i>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                        <p className="text-xs text-gray-500">{file.date} · {file.size}</p>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded whitespace-nowrap">
                        Analyzed
                      </span>
                      <button
                        onClick={() => setUploadedFiles(uploadedFiles.filter((f) => f.id !== file.id))}
                        className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 transition-colors flex-shrink-0"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Info */}
              <div className="flex gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <i className="ri-information-line text-lg sm:text-xl text-blue-600 flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">Automatic Data Extraction</p>
                  <p className="text-xs sm:text-sm text-blue-700">
                    Our system automatically reads usage amounts, costs, and billing periods from your uploaded bills.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {showManualEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900">Manual Utility Entry</h3>
              <button
                onClick={() => setShowManualEntry(false)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <i className="ri-close-line text-xl"></i>
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const newReading = {
                  id: Date.now(),
                  type: fd.get('utilityType'),
                  period: fd.get('billingPeriod'),
                  usage: fd.get('usage'),
                  cost: fd.get('cost'),
                  notes: fd.get('notes'),
                  date: new Date().toLocaleDateString(),
                  source: 'Manual',
                };
                setManualReadings((prev) => [...prev, newReading]);
                setShowManualEntry(false);
              }}
              className="p-4 sm:p-6 space-y-4 sm:space-y-5"
            >
              {/* Utility Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Utility Type</label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  {[
                    { value: 'electric', icon: 'ri-flashlight-line', label: 'Electric', color: 'yellow' },
                    { value: 'gas', icon: 'ri-fire-line', label: 'Gas', color: 'orange' },
                    { value: 'water', icon: 'ri-drop-line', label: 'Water', color: 'blue' },
                  ].map((utility) => (
                    <label key={utility.value} className="relative cursor-pointer">
                      <input
                        type="radio"
                        name="utilityType"
                        value={utility.value}
                        defaultChecked={utility.value === 'electric'}
                        className="peer sr-only"
                      />
                      <div className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg text-center transition-all peer-checked:border-teal-500 peer-checked:bg-teal-50 hover:border-gray-300">
                        <i className={`${utility.icon} text-2xl sm:text-3xl text-${utility.color}-500 block mb-1 sm:mb-2`}></i>
                        <p className="text-xs sm:text-sm font-medium text-gray-900">{utility.label}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Billing Period */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Billing Period</label>
                <input
                  type="month"
                  name="billingPeriod"
                  required
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                />
              </div>

              {/* Usage Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Usage Amount</label>
                <div className="relative">
                  <input
                    type="number"
                    name="usage"
                    step="0.01"
                    required
                    placeholder="Enter usage"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 pr-16 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                  />
                  <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-gray-500">kWh</span>
                </div>
              </div>

              {/* Cost */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Total Cost</label>
                <div className="relative">
                  <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-sm sm:text-base text-gray-500">$</span>
                  <input
                    type="number"
                    name="cost"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Notes (Optional)</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Add any additional details..."
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm sm:text-base"
                ></textarea>
              </div>

              {/* Tip */}
              <div className="flex gap-3 p-3 sm:p-4 bg-amber-50 rounded-lg">
                <i className="ri-lightbulb-line text-lg sm:text-xl text-amber-600 flex-shrink-0 mt-0.5"></i>
                <p className="text-xs sm:text-sm text-amber-900">
                  <strong>Tip:</strong> Find your meter readings on your utility meters, usually located in your garage, basement, or outside your home.
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualEntry(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm sm:text-base font-medium"
                >
                  Save Reading
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
