
import { useState } from 'react';

interface HomeownerCostsMaterialsProps {
  jobId: number;
  jobTitle: string;
  contractor: string;
}

interface MaterialItem {
  id: number;
  name: string;
  category: string;
  quantity: string;
  ordered: string;
  unitCost: string;
  totalCost: string;
  supplier: string;
  status: 'delivered' | 'in-transit' | 'ordered' | 'pending' | 'backordered';
  eta?: string;
}

interface LaborEntry {
  id: number;
  worker: string;
  role: string;
  hoursWorked: number;
  hourlyRate: number;
  totalCost: number;
  date: string;
  status: 'paid' | 'pending' | 'approved';
}

interface ChangeOrder {
  id: number;
  title: string;
  description: string;
  amount: string;
  status: 'approved' | 'pending' | 'rejected';
  date: string;
  requestedBy: string;
}

interface CostData {
  budget: string;
  spent: string;
  remaining: string;
  laborTotal: string;
  materialsTotal: string;
  changeOrdersTotal: string;
  materials: MaterialItem[];
  labor: LaborEntry[];
  changeOrders: ChangeOrder[];
}

const jobCostsData: Record<number, CostData> = {
  1: {
    budget: '$4,950.00',
    spent: '$3,218.50',
    remaining: '$1,731.50',
    laborTotal: '$1,528.50',
    materialsTotal: '$1,390.00',
    changeOrdersTotal: '$300.00',
    materials: [
      { id: 1, name: '6-mil Vapor Barrier', category: 'Barriers', quantity: '900 sq ft', ordered: '900 sq ft', unitCost: '$0.50/sq ft', totalCost: '$450.00', supplier: 'BuildPro Supply', status: 'delivered' },
      { id: 2, name: 'Dehumidifier Unit (70-pint)', category: 'Equipment', quantity: '1 unit', ordered: '1 unit', unitCost: '$380.00', totalCost: '$380.00', supplier: 'HVAC Wholesale', status: 'delivered' },
      { id: 3, name: 'Spray Foam Insulation', category: 'Insulation', quantity: '12 cans', ordered: '12 cans', unitCost: '$20.00/can', totalCost: '$240.00', supplier: 'BuildPro Supply', status: 'in-transit', eta: 'Jan 22' },
      { id: 4, name: 'Drainage Matting', category: 'Barriers', quantity: '850 sq ft', ordered: '850 sq ft', unitCost: '$0.40/sq ft', totalCost: '$340.00', supplier: 'Foundation Direct', status: 'delivered' },
      { id: 5, name: 'Sump Pump Upgrade Kit', category: 'Equipment', quantity: '1 kit', ordered: '0 kits', unitCost: '$280.00', totalCost: '$280.00', supplier: 'Plumbing Depot', status: 'pending' },
      { id: 6, name: 'Sealing Tape (Butyl)', category: 'Sealants', quantity: '6 rolls', ordered: '6 rolls', unitCost: '$18.00/roll', totalCost: '$108.00', supplier: 'BuildPro Supply', status: 'delivered' },
      { id: 7, name: 'Concrete Patch Mix', category: 'Repair', quantity: '2 bags', ordered: '2 bags', unitCost: '$24.00/bag', totalCost: '$48.00', supplier: 'Foundation Direct', status: 'delivered' }
    ],
    labor: [
      { id: 1, worker: 'Mike Torres', role: 'Lead Technician', hoursWorked: 24, hourlyRate: 38, totalCost: 912, date: 'Jan 15 - Jan 20', status: 'paid' },
      { id: 2, worker: 'Jake Williams', role: 'Assistant Technician', hoursWorked: 18, hourlyRate: 26, totalCost: 468, date: 'Jan 16 - Jan 20', status: 'paid' },
      { id: 3, worker: 'Mike Torres', role: 'Lead Technician', hoursWorked: 8, hourlyRate: 38, totalCost: 304, date: 'Jan 21 - Jan 22 (est)', status: 'pending' },
      { id: 4, worker: 'Jake Williams', role: 'Assistant Technician', hoursWorked: 6, hourlyRate: 26, totalCost: 156, date: 'Jan 21 - Jan 22 (est)', status: 'pending' }
    ],
    changeOrders: [
      { id: 1, title: 'Additional Insulation Coverage', description: 'Extended spray foam insulation to cover north wall section with visible moisture damage', amount: '+$300.00', status: 'approved', date: 'Jan 18, 2025', requestedBy: 'Contractor' }
    ]
  },
  2: {
    budget: '$1,150.00',
    spent: '$185.00',
    remaining: '$965.00',
    laborTotal: '$0.00',
    materialsTotal: '$185.00',
    changeOrdersTotal: '$0.00',
    materials: [
      { id: 1, name: 'Diagnostic Tool Rental', category: 'Equipment', quantity: '1 day', ordered: '1 day', unitCost: '$85.00/day', totalCost: '$85.00', supplier: 'Tool Rental Pro', status: 'ordered', eta: 'Jan 22' },
      { id: 2, name: 'Refrigerant R-410A', category: 'Supplies', quantity: '2 lbs', ordered: '2 lbs', unitCost: '$35.00/lb', totalCost: '$70.00', supplier: 'HVAC Wholesale', status: 'ordered', eta: 'Jan 22' },
      { id: 3, name: 'Capacitor (35/5 MFD)', category: 'Parts', quantity: '1 unit', ordered: '0 units', unitCost: '$30.00', totalCost: '$30.00', supplier: 'HVAC Wholesale', status: 'pending' }
    ],
    labor: [
      { id: 1, worker: 'Sarah Martinez', role: 'HVAC Technician', hoursWorked: 4, hourlyRate: 45, totalCost: 180, date: 'Jan 22 (est)', status: 'pending' },
      { id: 2, worker: 'Sarah Martinez', role: 'HVAC Technician', hoursWorked: 3, hourlyRate: 45, totalCost: 135, date: 'Jan 23 (est)', status: 'pending' }
    ],
    changeOrders: []
  },
  3: {
    budget: '$3,200.00',
    spent: '$0.00',
    remaining: '$3,200.00',
    laborTotal: '$0.00',
    materialsTotal: '$0.00',
    changeOrdersTotal: '$0.00',
    materials: [
      { id: 1, name: 'Architectural Shingles (30-yr)', category: 'Roofing', quantity: '5 bundles', ordered: '0 bundles', unitCost: '$42.00/bundle', totalCost: '$210.00', supplier: 'Roofing Supply Co', status: 'pending' },
      { id: 2, name: 'Roofing Underlayment', category: 'Roofing', quantity: '2 rolls', ordered: '0 rolls', unitCost: '$65.00/roll', totalCost: '$130.00', supplier: 'Roofing Supply Co', status: 'pending' },
      { id: 3, name: 'Ridge Cap Shingles', category: 'Roofing', quantity: '1 bundle', ordered: '0 bundles', unitCost: '$55.00', totalCost: '$55.00', supplier: 'Roofing Supply Co', status: 'pending' }
    ],
    labor: [],
    changeOrders: []
  },
  4: {
    budget: '$2,100.00',
    spent: '$2,100.00',
    remaining: '$0.00',
    laborTotal: '$650.00',
    materialsTotal: '$1,450.00',
    changeOrdersTotal: '$0.00',
    materials: [
      { id: 1, name: '50-Gallon Water Heater', category: 'Equipment', quantity: '1 unit', ordered: '1 unit', unitCost: '$1,200.00', totalCost: '$1,200.00', supplier: 'Plumbing Depot', status: 'delivered' },
      { id: 2, name: 'Flexible Connectors', category: 'Parts', quantity: '2 units', ordered: '2 units', unitCost: '$35.00', totalCost: '$70.00', supplier: 'Plumbing Depot', status: 'delivered' },
      { id: 3, name: 'Expansion Tank', category: 'Parts', quantity: '1 unit', ordered: '1 unit', unitCost: '$45.00', totalCost: '$45.00', supplier: 'Plumbing Depot', status: 'delivered' },
      { id: 4, name: 'Gas Line Fittings', category: 'Parts', quantity: '1 set', ordered: '1 set', unitCost: '$28.00', totalCost: '$28.00', supplier: 'Plumbing Depot', status: 'delivered' }
    ],
    labor: [
      { id: 1, worker: 'James Wilson', role: 'Master Plumber', hoursWorked: 5, hourlyRate: 75, totalCost: 375, date: 'Jan 10, 2025', status: 'paid' },
      { id: 2, worker: 'James Wilson', role: 'Master Plumber', hoursWorked: 3, hourlyRate: 75, totalCost: 225, date: 'Jan 11, 2025', status: 'paid' },
      { id: 3, worker: 'Disposal Service', role: 'Old Unit Removal', hoursWorked: 1, hourlyRate: 50, totalCost: 50, date: 'Jan 10, 2025', status: 'paid' }
    ],
    changeOrders: []
  }
};

export default function HomeownerCostsMaterials({ jobId, jobTitle: _jobTitle, contractor }: HomeownerCostsMaterialsProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'materials' | 'labor' | 'changes'>('overview');
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [expandedMaterial, setExpandedMaterial] = useState<number | null>(null);
  const [approvalAction, setApprovalAction] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [approvalDone, setApprovalDone] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const data = jobCostsData[jobId] || jobCostsData[1];

  const budgetNum = parseFloat(data.budget.replace(/[$,]/g, ''));
  const spentNum = parseFloat(data.spent.replace(/[$,]/g, ''));
  const spentPercent = budgetNum > 0 ? Math.round((spentNum / budgetNum) * 100) : 0;

  const deliveredCount = data.materials.filter(m => m.status === 'delivered').length;
  const inTransitCount = data.materials.filter(m => m.status === 'in-transit' || m.status === 'ordered').length;
  const pendingCount = data.materials.filter(m => m.status === 'pending' || m.status === 'backordered').length;

  const paidLabor = data.labor.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.totalCost, 0);
  const pendingLabor = data.labor.filter(l => l.status !== 'paid').reduce((sum, l) => sum + l.totalCost, 0);

  const categories = ['all', ...Array.from(new Set(data.materials.map(m => m.category)))];
  const filteredMaterials = materialFilter === 'all' ? data.materials : data.materials.filter(m => m.category === materialFilter);

  const pendingChangeOrders = data.changeOrders.filter(c => c.status === 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered': return { bg: 'bg-green-100 text-green-700', icon: 'ri-check-line', label: 'Delivered' };
      case 'in-transit': return { bg: 'bg-[#00B8A9]/10 text-[#00B8A9]', icon: 'ri-truck-line', label: 'In Transit' };
      case 'ordered': return { bg: 'bg-[#D4B483]/20 text-[#D4B483]', icon: 'ri-shopping-cart-line', label: 'Ordered' };
      case 'pending': return { bg: 'bg-orange-100 text-orange-700', icon: 'ri-time-line', label: 'Pending' };
      case 'backordered': return { bg: 'bg-red-100 text-red-700', icon: 'ri-error-warning-line', label: 'Backordered' };
      default: return { bg: 'bg-gray-100 text-gray-600', icon: 'ri-question-line', label: status };
    }
  };

  const getLaborStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700';
      case 'approved': return 'bg-[#00B8A9]/10 text-[#00B8A9]';
      case 'pending': return 'bg-orange-100 text-orange-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getChangeStatusBadge = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const handleApprovalAction = (orderId: number, action: 'approve' | 'reject') => {
    setApprovalAction({ id: orderId, action });
    setRejectReason('');
  };

  const confirmApproval = () => {
    if (!approvalAction) return;
    if (approvalAction.action === 'reject' && !rejectReason.trim()) return;
    setApprovalProcessing(true);
    setTimeout(() => {
      setApprovalProcessing(false);
      setApprovalDone(approvalAction);
      setApprovalAction(null);
      setRejectReason('');
      setTimeout(() => setApprovalDone(null), 2500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Read-Only Notice */}
      <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-3 flex items-center gap-3">
        <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-eye-line text-[#00B8A9]"></i>
        </div>
        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
          This is a read-only view of costs and materials managed by <strong className="text-[#0B1F33]">{contractor}</strong>. You can review all details and approve or reject change orders.
        </p>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Cost Overview', icon: 'ri-pie-chart-line' },
          { id: 'materials', label: 'Materials', icon: 'ri-box-3-line' },
          { id: 'labor', label: 'Labor', icon: 'ri-user-settings-line' },
          { id: 'changes', label: 'Change Orders', icon: 'ri-file-edit-line' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap cursor-pointer transition-all ${
              activeSection === tab.id
                ? 'bg-[#0B1F33] text-white'
                : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className={`${tab.icon} text-base`}></i>
            {tab.label}
            {tab.id === 'changes' && pendingChangeOrders.length > 0 && (
              <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {pendingChangeOrders.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Budget Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0B1F33] rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <i className="ri-wallet-3-line text-[#D4B483]"></i>
                </div>
                <span className="text-xs text-white/70" style={{ fontFamily: 'Inter, sans-serif' }}>Total Budget</span>
              </div>
              <p className="text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.budget}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-money-dollar-circle-line text-[#00B8A9]"></i>
                </div>
                <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Total Spent</span>
              </div>
              <p className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.spent}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-funds-line text-green-600"></i>
                </div>
                <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Remaining</span>
              </div>
              <p className="text-xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.remaining}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[#D4B483]/20 rounded-lg flex items-center justify-center">
                  <i className="ri-exchange-dollar-line text-[#D4B483]"></i>
                </div>
                <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Change Orders</span>
              </div>
              <p className="text-xl font-bold text-[#D4B483]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.changeOrdersTotal}</p>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>Budget Utilization</h4>
              <span className="text-sm font-semibold text-[#6B7C8F]" style={{ fontFamily: 'Montserrat, sans-serif' }}>{spentPercent}% used</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-4 mb-4">
              <div
                className={`h-4 rounded-full transition-all ${spentPercent > 90 ? 'bg-red-500' : spentPercent > 70 ? 'bg-orange-400' : 'bg-[#00B8A9]'}`}
                style={{ width: `${Math.min(spentPercent, 100)}%` }}
              ></div>
            </div>

            {/* Cost Breakdown */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-[#F9F9FB] rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-[#00B8A9] rounded-full"></div>
                  <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Materials</span>
                </div>
                <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.materialsTotal}</p>
              </div>
              <div className="p-3 bg-[#F9F9FB] rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-[#D4B483] rounded-full"></div>
                  <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Labor</span>
                </div>
                <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.laborTotal}</p>
              </div>
              <div className="p-3 bg-[#F9F9FB] rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                  <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Changes</span>
                </div>
                <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.changeOrdersTotal}</p>
              </div>
            </div>
          </div>

          {/* Material Status Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-bold text-[#0B1F33] text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Material Delivery Status</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg cursor-pointer hover:bg-green-100 transition-colors" onClick={() => { setActiveSection('materials'); setMaterialFilter('all'); }}>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-check-line text-green-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{deliveredCount}</p>
                  <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>Delivered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg cursor-pointer hover:bg-[#00B8A9]/10 transition-colors" onClick={() => { setActiveSection('materials'); setMaterialFilter('all'); }}>
                <div className="w-10 h-10 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-truck-line text-[#00B8A9] text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>{inTransitCount}</p>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>In Transit / Ordered</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => { setActiveSection('materials'); setMaterialFilter('all'); }}>
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-orange-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>{pendingCount}</p>
                  <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Labor Summary */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h4 className="font-bold text-[#0B1F33] text-sm mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>Labor Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-check-double-line text-green-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-xl font-bold text-green-600" style={{ fontFamily: 'Poppins, sans-serif' }}>${paidLabor.toLocaleString()}</p>
                  <p className="text-xs text-green-700" style={{ fontFamily: 'Inter, sans-serif' }}>Paid Labor</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <i className="ri-time-line text-orange-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-xl font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>${pendingLabor.toLocaleString()}</p>
                  <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>Pending / Estimated</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Change Orders Alert */}
          {pendingChangeOrders.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => setActiveSection('changes')}>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-file-edit-line text-orange-600 text-xl"></i>
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-orange-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {pendingChangeOrders.length} Change Order{pendingChangeOrders.length > 1 ? 's' : ''} Awaiting Your Decision
                </p>
                <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Review and approve or reject pending change orders from {contractor}.
                </p>
              </div>
              <i className="ri-arrow-right-s-line text-orange-600 text-xl"></i>
            </div>
          )}
        </div>
      )}

      {/* MATERIALS */}
      {activeSection === 'materials' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Materials Tracker</h4>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.materials.length} items &middot; {data.materialsTotal} total</p>
          </div>

          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setMaterialFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                  materialFilter === cat
                    ? 'bg-[#00B8A9] text-white'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                {cat === 'all' ? 'All' : cat}
                <span className="ml-1 opacity-70">
                  ({cat === 'all' ? data.materials.length : data.materials.filter(m => m.category === cat).length})
                </span>
              </button>
            ))}
          </div>

          {/* Materials List */}
          <div className="space-y-2">
            {filteredMaterials.map(material => {
              const badge = getStatusBadge(material.status);
              const isExpanded = expandedMaterial === material.id;
              return (
                <div key={material.id} className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#F9F9FB] transition-colors"
                    onClick={() => setExpandedMaterial(isExpanded ? null : material.id)}
                  >
                    <div className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center flex-shrink-0">
                      <i className="ri-box-3-line text-[#0B1F33] text-lg"></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#0B1F33] text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.name}</p>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{material.category} &middot; {material.quantity}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.totalCost}</p>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${badge.bg}`}>
                        <i className={`${badge.icon} text-xs`}></i>
                        {badge.label}
                      </span>
                    </div>
                    <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-[#6B7C8F]`}></i>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Unit Cost</p>
                          <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.unitCost}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Ordered</p>
                          <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.ordered}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Supplier</p>
                          <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.supplier}</p>
                        </div>
                        {material.eta && (
                          <div>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>ETA</p>
                            <p className="text-sm font-semibold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.eta}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LABOR */}
      {activeSection === 'labor' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Labor Costs</h4>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.labor.length} entries &middot; {data.laborTotal} total</p>
          </div>

          {/* Labor Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Total Hours</p>
              <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {data.labor.reduce((sum, l) => sum + l.hoursWorked, 0)}h
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Avg Hourly Rate</p>
              <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                ${data.labor.length > 0 ? Math.round(data.labor.reduce((sum, l) => sum + l.hourlyRate, 0) / data.labor.length) : 0}/hr
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>Workers</p>
              <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {new Set(data.labor.map(l => l.worker)).size}
              </p>
            </div>
          </div>

          {/* Labor Table */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#F9F9FB]">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Worker</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Role</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Hours</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Rate</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Total</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Date</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.labor.map(entry => (
                    <tr key={entry.id} className="border-t border-gray-100 hover:bg-[#F9F9FB] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-bold">{entry.worker.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{entry.worker}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{entry.role}</td>
                      <td className="px-4 py-3 text-sm text-center font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{entry.hoursWorked}h</td>
                      <td className="px-4 py-3 text-sm text-center text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>${entry.hourlyRate}/hr</td>
                      <td className="px-4 py-3 text-sm text-right font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>${entry.totalCost.toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{entry.date}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getLaborStatusBadge(entry.status)}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-[#0B1F33]/20 bg-[#F9F9FB]">
                    <td colSpan={2} className="px-4 py-3 text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Total</td>
                    <td className="px-4 py-3 text-sm text-center font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {data.labor.reduce((sum, l) => sum + l.hoursWorked, 0)}h
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      ${data.labor.reduce((sum, l) => sum + l.totalCost, 0).toLocaleString()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE ORDERS */}
      {activeSection === 'changes' && (
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Change Orders</h4>
            <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {data.changeOrders.length} orders &middot; {data.changeOrdersTotal} total impact
            </p>
          </div>

          {/* Pending Alert */}
          {pendingChangeOrders.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-notification-3-line text-orange-600 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-semibold text-orange-900 mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {pendingChangeOrders.length} Pending Change Order{pendingChangeOrders.length > 1 ? 's' : ''} Need Your Decision
                </p>
                <p className="text-xs text-orange-700" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Approving will adjust the project budget. Rejecting will notify {contractor} that the change was declined.
                </p>
              </div>
            </div>
          )}

          {data.changeOrders.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-edit-line text-[#6B7C8F] text-3xl"></i>
              </div>
              <h5 className="font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No Change Orders</h5>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                No change orders have been submitted for this job yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.changeOrders.map(order => (
                <div key={order.id} className={`bg-white rounded-xl border shadow-sm p-5 ${
                  order.status === 'pending' && !approvalDone?.id ? 'border-orange-200 ring-1 ring-orange-100' : 'border-gray-100'
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        (approvalDone?.id === order.id && approvalDone.action === 'approve') ? 'bg-green-100' :
                        (approvalDone?.id === order.id && approvalDone.action === 'reject') ? 'bg-red-100' :
                        order.status === 'approved' ? 'bg-green-100' : order.status === 'pending' ? 'bg-orange-100' : 'bg-red-100'
                      }`}>
                        <i className={`${
                          (approvalDone?.id === order.id && approvalDone.action === 'approve') ? 'ri-check-line text-green-600' :
                          (approvalDone?.id === order.id && approvalDone.action === 'reject') ? 'ri-close-line text-red-600' :
                          order.status === 'approved' ? 'ri-check-line text-green-600' : order.status === 'pending' ? 'ri-time-line text-orange-600' : 'ri-close-line text-red-600'
                        } text-xl`}></i>
                      </div>
                      <div>
                        <h5 className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{order.title}</h5>
                        <p className="text-xs text-[#6B7C8F] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>{order.description}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{order.amount}</p>
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        (approvalDone?.id === order.id && approvalDone.action === 'approve') ? 'bg-green-100 text-green-700' :
                        (approvalDone?.id === order.id && approvalDone.action === 'reject') ? 'bg-red-100 text-red-700' :
                        getChangeStatusBadge(order.status)
                      }`}>
                        {approvalDone?.id === order.id ? (approvalDone.action === 'approve' ? 'approved' : 'rejected') : order.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-[#6B7C8F] pt-3 border-t border-gray-100" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <span className="flex items-center gap-1">
                      <i className="ri-calendar-line"></i>
                      {order.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <i className="ri-user-line"></i>
                      Requested by: {order.requestedBy}
                    </span>
                    {order.status === 'pending' && !approvalDone?.id && (
                      <div className="flex gap-2 ml-auto">
                        <button
                          onClick={() => handleApprovalAction(order.id, 'approve')}
                          className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 cursor-pointer whitespace-nowrap flex items-center gap-1"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-check-line"></i>Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(order.id, 'reject')}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 cursor-pointer whitespace-nowrap flex items-center gap-1"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-close-line"></i>Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget Impact Summary */}
          {data.changeOrders.length > 0 && (
            <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/20 rounded-xl p-5">
              <h5 className="font-bold text-[#0B1F33] text-sm mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                <i className="ri-information-line mr-2"></i>
                Budget Impact Summary
              </h5>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Approved Changes</p>
                  <p className="font-bold text-green-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    +${data.changeOrders.filter(c => c.status === 'approved').reduce((sum, c) => sum + parseFloat(c.amount.replace(/[+$,]/g, '')), 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Pending Changes</p>
                  <p className="font-bold text-orange-600 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    +${data.changeOrders.filter(c => c.status === 'pending').reduce((sum, c) => sum + parseFloat(c.amount.replace(/[+$,]/g, '')), 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Net Impact</p>
                  <p className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {data.changeOrdersTotal}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Approval Confirmation Modal */}
      {approvalAction && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { if (!approvalProcessing) setApprovalAction(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${
                approvalAction.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <i className={`${
                  approvalAction.action === 'approve' ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
                } text-2xl`}></i>
              </div>
              <h4 className="font-bold text-[#0B1F33] text-lg mb-2 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {approvalAction.action === 'approve' ? 'Approve Change Order?' : 'Reject Change Order?'}
              </h4>
              <p className="text-sm text-[#6B7C8F] text-center mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                {data.changeOrders.find(c => c.id === approvalAction.id)?.title}
              </p>
              <p className="text-lg font-bold text-[#0B1F33] text-center mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {data.changeOrders.find(c => c.id === approvalAction.id)?.amount}
              </p>
              {approvalAction.action === 'approve' && (
                <p className="text-xs text-[#6B7C8F] bg-[#F9F9FB] rounded-lg p-3 mb-4 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
                  This will adjust the project budget. {contractor} will be notified of your approval.
                </p>
              )}
              {approvalAction.action === 'reject' && (
                <div className="mb-4">
                  <textarea
                    value={rejectReason}
                    onChange={e => { if (e.target.value.length <= 500) setRejectReason(e.target.value); }}
                    placeholder="Reason for rejection (required)..."
                    rows={3}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                  <p className="text-xs text-[#6B7C8F] text-right mt-1">{rejectReason.length}/500</p>
                </div>
              )}
              {approvalProcessing ? (
                <div className="py-2 flex justify-center">
                  <div className="w-8 h-8 border-3 border-[#00B8A9] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setApprovalAction(null); setRejectReason(''); }}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmApproval}
                    disabled={approvalAction.action === 'reject' && !rejectReason.trim()}
                    className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap transition-colors ${
                      approvalAction.action === 'approve'
                        ? 'bg-green-600 hover:bg-green-700'
                        : rejectReason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-300 cursor-not-allowed'
                    }`}
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    {approvalAction.action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval Success Toast */}
      {approvalDone && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-lg border ${
          approvalDone.action === 'approve'
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            approvalDone.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
          }`}>
            <i className={`${
              approvalDone.action === 'approve' ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
            } text-lg`}></i>
          </div>
          <div>
            <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Change Order {approvalDone.action === 'approve' ? 'Approved' : 'Rejected'}
            </p>
            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
              {contractor} has been notified
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
