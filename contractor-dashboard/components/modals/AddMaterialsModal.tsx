import { useState } from 'react';

export default function AddMaterialsModal({ show, onClose, onSubmit, jobTitle }: {
  show: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; quantity: string; unit: string; supplier: string; cost: string; urgency: string; notes: string }) => void;
  jobTitle: string;
}) {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('units');
  const [supplier, setSupplier] = useState('');
  const [cost, setCost] = useState('');
  const [urgency, setUrgency] = useState('standard');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const units = ['units', 'sq ft', 'linear ft', 'gallons', 'lbs', 'rolls', 'sheets', 'boxes', 'bags', 'cans', 'kits'];
  const quickItems = [
    { name: 'PVC Pipe (10ft)', unit: 'linear ft', cost: '12' },
    { name: 'Drywall Screws (1lb)', unit: 'lbs', cost: '8' },
    { name: 'Silicone Caulk', unit: 'units', cost: '6' },
    { name: 'Wire Nuts (100pk)', unit: 'boxes', cost: '15' },
    { name: 'Teflon Tape', unit: 'rolls', cost: '3' },
    { name: 'Spray Foam Can', unit: 'cans', cost: '9' },
  ];

  const handleSubmit = () => {
    if (!name.trim() || !quantity.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit({ name, quantity, unit, supplier, cost, urgency, notes });
      setSubmitting(false);
      setName(''); setQuantity(''); setUnit('units'); setSupplier(''); setCost(''); setUrgency('standard'); setNotes('');
    }, 800);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>Add Materials</h3>
              <p className="text-xs text-gray-500 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
              <i className="ri-close-line text-xl text-gray-500"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Quick Add */}
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>QUICK ADD</label>
            <div className="flex flex-wrap gap-2">
              {quickItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => { setName(item.name); setUnit(item.unit); setCost(item.cost); setQuantity('1'); }}
                  className="px-3 py-1.5 bg-[#00B8A9]/10 text-[#00B8A9] rounded-full text-xs font-semibold hover:bg-[#00B8A9]/20 transition-colors cursor-pointer whitespace-nowrap"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>MATERIAL NAME *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g., 6-mil Vapor Barrier"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>QUANTITY *</label>
              <input
                type="text"
                value={quantity}
                onChange={e => setQuantity(e.target.value)}
                placeholder="0"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>UNIT</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] cursor-pointer bg-white"
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                {units.map(u => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>COST ($)</label>
              <input
                type="text"
                value={cost}
                onChange={e => setCost(e.target.value)}
                placeholder="0.00"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>SUPPLIER (OPTIONAL)</label>
            <input
              type="text"
              value={supplier}
              onChange={e => setSupplier(e.target.value)}
              placeholder="e.g., Home Depot, Ferguson Supply"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-2 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>URGENCY</label>
            <div className="flex gap-2">
              {[
                { id: 'standard', label: 'Standard', icon: 'ri-time-line', color: 'gray' },
                { id: 'rush', label: 'Rush', icon: 'ri-speed-line', color: 'orange' },
                { id: 'critical', label: 'Critical', icon: 'ri-alarm-warning-line', color: 'red' },
              ].map(u => (
                <button
                  key={u.id}
                  onClick={() => setUrgency(u.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    urgency === u.id
                      ? u.color === 'gray' ? 'border-gray-600 bg-gray-50 text-gray-700' :
                        u.color === 'orange' ? 'border-orange-500 bg-orange-50 text-orange-700' :
                        'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  <i className={u.icon}></i>
                  {u.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1.5 block" style={{ fontFamily: 'Montserrat, sans-serif' }}>NOTES (OPTIONAL)</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value.slice(0, 500))}
              placeholder="Any special instructions or specifications..."
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#00B8A9] transition-colors resize-none"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{notes.length}/500</div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !quantity.trim() || submitting}
            className="flex-1 px-4 py-3 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-semibold text-sm cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            {submitting ? (
              <><i className="ri-loader-4-line animate-spin"></i> Adding...</>
            ) : (
              <><i className="ri-add-line"></i> Add Material</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
