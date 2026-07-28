import { useState } from 'react';

interface JobCostsMaterialsProps {
  jobId: number;
  jobTitle: string;
  isMultiTrade?: boolean;
  myTradeRole?: string;
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
  shared?: boolean;
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

const jobCostsData: Record<number, {
  budget: string;
  spent: string;
  remaining: string;
  laborTotal: string;
  materialsTotal: string;
  changeOrdersTotal: string;
  profitMargin: string;
  materials: MaterialItem[];
  labor: LaborEntry[];
  changeOrders: ChangeOrder[];
}> = {
  1: {
    budget: '$4,950.00',
    spent: '$3,218.50',
    remaining: '$1,731.50',
    laborTotal: '$1,528.50',
    materialsTotal: '$1,390.00',
    changeOrdersTotal: '$300.00',
    profitMargin: '34%',
    materials: [
      { id: 1, name: '6-mil Vapor Barrier', category: 'Barriers', quantity: '900 sq ft', ordered: '900 sq ft', unitCost: '$0.50/sq ft', totalCost: '$450.00', supplier: 'BuildPro Supply', status: 'delivered', shared: false },
      { id: 2, name: 'Dehumidifier Unit (70-pint)', category: 'Equipment', quantity: '1 unit', ordered: '1 unit', unitCost: '$380.00', totalCost: '$380.00', supplier: '?"HVAC Wholesale', status: 'delivered', shared: false },
      { id: 3, name: 'Spray Foam Insulation', category: 'Insulation', quantity: '12 cans', ordered: '12 cans', unitCost: '$20.00/can', totalCost: '$240.00', supplier: 'BuildPro Supply', status: 'in-transit', eta: 'Jan 22', shared: false },
      { id: 4, name: 'Drainage Matting', category: 'Barriers', quantity: '850 sq ft', ordered: '850 sq ft', unitCost: '$0.40/sq ft', totalCost: '$340.00', supplier: 'Foundation Direct', status: 'delivered', shared: false },
      { id: 5, name: 'Sump Pump Upgrade Kit', category: 'Equipment', quantity: '1 kit', ordered: '0 kits', unitCost: '$280.00', totalCost: '$280.00', supplier: 'Plumbing Depot', status: 'pending', shared: false },
      { id: 6, name: 'Sealing Tape (Butyl)', category: 'Sealants', quantity: '6 rolls', ordered: '6 rolls', unitCost: '$18.00/roll', totalCost: '$108.00', supplier: 'BuildPro Supply', status: 'delivered', shared: false },
      { id: 7, name: 'Concrete Patch Mix', category: 'Repair', quantity: '2 bags', ordered: '2 bags', unitCost: '$24.00/bag', totalCost: '$48.00', supplier: 'Foundation Direct', status: 'delivered', shared: false }
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
    profitMargin: '38%',
    materials: [
      { id: 1, name: 'Diagnostic Tool Rental', category: 'Equipment', quantity: '1 day', ordered: '1 day', unitCost: '$85.00/day', totalCost: '$85.00', supplier: 'Tool Rental Pro', status: 'ordered', eta: 'Jan 22', shared: false },
      { id: 2, name: 'Refrigerant R-410A', category: 'Supplies', quantity: '2 lbs', ordered: '2 lbs', unitCost: '$35.00/lb', totalCost: '$70.00', supplier: 'HVAC Wholesale', status: 'ordered', eta: 'Jan 22', shared: false },
      { id: 3, name: 'Capacitor (35/5 MFD)', category: 'Parts', quantity: '1 unit', ordered: '0 units', unitCost: '$30.00', totalCost: '$30.00', supplier: 'HVAC Wholesale', status: 'pending', shared: false }
    ],
    labor: [
      { id: 1, worker: 'Mike Torres', role: 'HVAC Technician', hoursWorked: 4, hourlyRate: 45, totalCost: 180, date: 'Jan 22 (est)', status: 'pending' },
      { id: 2, worker: 'Mike Torres', role: 'HVAC Technician', hoursWorked: 3, hourlyRate: 45, totalCost: 135, date: 'Jan 23 (est)', status: 'pending' }
    ],
    changeOrders: []
  },
  3: {
    budget: '$21,750.00',
    spent: '$8,420.00',
    remaining: '$13,330.00',
    laborTotal: '$2,640.00',
    materialsTotal: '$5,480.00',
    changeOrdersTotal: '$300.00',
    profitMargin: '28%',
    materials: [
      { id: 1, name: 'PEX Piping (100ft)', category: 'Plumbing', quantity: '100 ft', ordered: '100 ft', unitCost: '$1.80/ft', totalCost: '$180.00', supplier: 'Plumbing Depot', status: 'delivered', shared: false },
      { id: 2, name: 'Sink Fixtures (Moen)', category: 'Plumbing', quantity: '2 units', ordered: '2 units', unitCost: '$210.00', totalCost: '$420.00', supplier: 'Plumbing Depot', status: 'delivered', shared: false },
      { id: 3, name: 'Garbage Disposal (InSinkErator)', category: 'Plumbing', quantity: '1 unit', ordered: '1 unit', unitCost: '$280.00', totalCost: '$280.00', supplier: 'Plumbing Depot', status: 'delivered', shared: false },
      { id: 4, name: 'Shut-off Valves', category: 'Plumbing', quantity: '6 units', ordered: '6 units', unitCost: '$15.00', totalCost: '$90.00', supplier: 'Plumbing Depot', status: 'delivered', shared: false },
      { id: 5, name: 'Recessed LED Lights', category: 'Electrical', quantity: '8 units', ordered: '8 units', unitCost: '$40.00', totalCost: '$320.00', supplier: 'Lighting World', status: 'delivered', shared: false },
      { id: 6, name: 'GFCI Outlets', category: 'Electrical', quantity: '4 units', ordered: '4 units', unitCost: '$20.00', totalCost: '$80.00', supplier: 'Lighting World', status: 'delivered', shared: false },
      { id: 7, name: 'Under-Cabinet Lighting', category: 'Electrical', quantity: '15 ft', ordered: '15 ft', unitCost: '$16.00/ft', totalCost: '$240.00', supplier: 'Lighting World', status: 'in-transit', eta: 'Jan 26', shared: false },
      { id: 8, name: 'Custom Base Cabinets', category: 'Cabinetry', quantity: '8 units', ordered: '8 units', unitCost: '$400.00', totalCost: '$3,200.00', supplier: 'Elite Cabinetry', status: 'in-transit', eta: 'Jan 30', shared: false },
      { id: 9, name: 'Quartz Countertop Slabs', category: 'Countertops', quantity: '2 slabs', ordered: '2 slabs', unitCost: '$1,700.00', totalCost: '$3,400.00', supplier: 'Granite Masters', status: 'pending', shared: false },
      { id: 10, name: 'Subway Tiles (White)', category: 'Tiling', quantity: '45 sq ft', ordered: '0 sq ft', unitCost: '$6.00/sq ft', totalCost: '$270.00', supplier: 'Tile Warehouse', status: 'pending', shared: false }
    ],
    labor: [
      { id: 1, worker: 'You (ProFlow Plumbing)', role: 'Plumbing - Lead', hoursWorked: 32, hourlyRate: 55, totalCost: 1760, date: 'Jan 20 - Jan 24', status: 'paid' },
      { id: 2, worker: 'Carlos Reyes', role: 'Plumbing - Assistant', hoursWorked: 24, hourlyRate: 32, totalCost: 768, date: 'Jan 20 - Jan 24', status: 'paid' },
      { id: 3, worker: 'BrightSpark Electric', role: 'Electrical', hoursWorked: 16, hourlyRate: 65, totalCost: 1040, date: 'Jan 22 - Jan 27 (est)', status: 'pending' },
      { id: 4, worker: 'Perfect Walls Co.', role: 'Drywall', hoursWorked: 20, hourlyRate: 45, totalCost: 900, date: 'Jan 28 - Jan 31 (est)', status: 'pending' },
      { id: 5, worker: 'Elite Cabinetry', role: 'Cabinet Install', hoursWorked: 24, hourlyRate: 60, totalCost: 1440, date: 'Feb 1 - Feb 4 (est)', status: 'pending' }
    ],
    changeOrders: [
      { id: 1, title: 'Upgraded Sink Fixtures', description: 'Homeowner requested upgrade from standard to Moen Align series fixtures', amount: '+$180.00', status: 'approved', date: 'Jan 21, 2025', requestedBy: 'Homeowner' },
      { id: 2, title: 'Additional GFCI Outlet', description: 'Code requirement for additional outlet near island area', amount: '+$120.00', status: 'approved', date: 'Jan 23, 2025', requestedBy: 'Contractor' },
      { id: 3, title: 'Extended Under-Cabinet Lighting', description: 'Add lighting to pantry area cabinets', amount: '+$85.00', status: 'pending', date: 'Jan 25, 2025', requestedBy: 'Homeowner' }
    ]
  }
};

export default function JobCostsMaterials({ jobId, jobTitle, isMultiTrade: _isMultiTrade, myTradeRole: _myTradeRole }: JobCostsMaterialsProps) {
  const [activeSection, setActiveSection] = useState<'overview' | 'materials' | 'labor' | 'changes'>('overview');
  const [materialFilter, setMaterialFilter] = useState<string>('all');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddLabor, setShowAddLabor] = useState(false);
  const [expandedMaterial, setExpandedMaterial] = useState<number | null>(null);
  const [showNewChangeOrder, setShowNewChangeOrder] = useState(false);
  const [changeOrderForm, setChangeOrderForm] = useState({
    title: '',
    description: '',
    amount: '',
    reason: 'scope_change',
    priority: 'normal',
    notifyHomeowner: true,
    attachReceipt: false,
  });
  const [changeOrderSubmitting, setChangeOrderSubmitting] = useState(false);
  const [changeOrderSuccess, setChangeOrderSuccess] = useState(false);
  const [approvalAction, setApprovalAction] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);
  const [approvalProcessing, setApprovalProcessing] = useState(false);
  const [approvalDone, setApprovalDone] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null);

  const data = jobCostsData[jobId] || jobCostsData[1];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return { bg: 'bg-green-100 text-green-700', icon: 'ri-check-line', label: 'Delivered' };
      case 'in-transit':
        return { bg: 'bg-[#0B1F33]/10 text-[#0B1F33]', icon: 'ri-truck-line', label: 'In Transit' };
      case 'ordered':
        return { bg: 'bg-[#D4B483]/20 text-[#D4B483]', icon: 'ri-shopping-cart-line', label: 'Ordered' };
      case 'pending':
        return { bg: 'bg-orange-100 text-orange-700', icon: 'ri-time-line', label: 'Pending' };
      case 'backordered':
        return { bg: 'bg-red-100 text-red-700', icon: 'ri-error-warning-line', label: 'Backordered' };
      default:
        return { bg: 'bg-gray-100 text-gray-600', icon: 'ri-question-line', label: status };
    }
  };

  const getLaborStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'approved':
        return 'bg-[#0B1F33]/10 text-[#0B1F33]';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getChangeStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const categories = ['all', ...Array.from(new Set(data.materials.map(m => m.category)))];
  const filteredMaterials = materialFilter === 'all' ? data.materials : data.materials.filter(m => m.category === materialFilter);

  const deliveredCount = data.materials.filter(m => m.status === 'delivered').length;
  const inTransitCount = data.materials.filter(m => m.status === 'in-transit' || m.status === 'ordered').length;
  const pendingCount = data.materials.filter(m => m.status === 'pending' || m.status === 'backordered').length;

  const paidLabor = data.labor.filter(l => l.status === 'paid').reduce((sum, l) => sum + l.totalCost, 0);
  const pendingLabor = data.labor.filter(l => l.status !== 'paid').reduce((sum, l) => sum + l.totalCost, 0);

  const budgetNum = parseFloat(data.budget.replace(/[$,]/g, ''));
  const spentNum = parseFloat(data.spent.replace(/[$,]/g, ''));
  const spentPercent = Math.round((spentNum / budgetNum) * 100);

  const handleChangeOrderSubmit = () => {
    if (!changeOrderForm.title.trim() || !changeOrderForm.amount.trim()) return;
    setChangeOrderSubmitting(true);
    setTimeout(() => {
      setChangeOrderSubmitting(false);
      setChangeOrderSuccess(true);
      setTimeout(() => {
        setChangeOrderSuccess(false);
        setShowNewChangeOrder(false);
        setChangeOrderForm({
          title: '',
          description: '',
          amount: '',
          reason: 'scope_change',
          priority: 'normal',
          notifyHomeowner: true,
          attachReceipt: false,
        });
      }, 2000);
    }, 1500);
  };

  const handleApprovalAction = (orderId: number, action: 'approve' | 'reject') => {
    setApprovalAction({ id: orderId, action });
  };

  const confirmApproval = () => {
    if (!approvalAction) return;
    setApprovalProcessing(true);
    setTimeout(() => {
      setApprovalProcessing(false);
      setApprovalDone(approvalAction);
      setApprovalAction(null);
      setTimeout(() => setApprovalDone(null), 2500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
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
            {tab.id === 'changes' && data.changeOrders.filter(c => c.status === 'pending').length > 0 && (
              <span className="w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {data.changeOrders.filter(c => c.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* OVERVIEW SECTION */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Budget Summary Cards */}
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
                  <i className="ri-percent-line text-[#D4B483]"></i>
                </div>
                <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Profit Margin</span>
              </div>
              <p className="text-xl font-bold text-[#D4B483]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.profitMargin}</p>
            </div>
          </div>

          {/* Budget Progress Bar */}
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
              <div className="flex items-center gap-3 p-3 bg-[#0B1F33]/5 border border-[#0B1F33]/20 rounded-lg cursor-pointer hover:bg-[#0B1F33]/10 transition-colors" onClick={() => { setActiveSection('materials'); setMaterialFilter('all'); }}>
                <div className="w-10 h-10 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-truck-line text-[#0B1F33] text-xl"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{inTransitCount}</p>
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
        </div>
      )}

      {/* MATERIALS SECTION */}
      {activeSection === 'materials' && (
        <div className="space-y-4">
          {/* Header & Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Materials Tracker</h4>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.materials.length} items &middot; {data.materialsTotal} total</p>
            </div>
            <button
              onClick={() => setShowAddMaterial(!showAddMaterial)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00B8A9] text-white rounded-lg font-semibold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-add-line"></i>
              Add Material
            </button>
          </div>

          {/* Add Material Form */}
          {showAddMaterial && (
            <div className="bg-[#F9F9FB] rounded-xl p-5 border border-gray-200">
              <h5 className="font-bold text-[#0B1F33] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>New Material Entry</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder="Material name" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="text" placeholder="Category" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="text" placeholder="Quantity needed" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="text" placeholder="Unit cost" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="text" placeholder="Supplier" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <select className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] text-[#6B7C8F]">
                  <option>Status</option>
                  <option>Pending</option>
                  <option>Ordered</option>
                  <option>In Transit</option>
                  <option>Delivered</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddMaterial(false)} className="px-4 py-2 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                <button onClick={() => setShowAddMaterial(false)} className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Save Material</button>
              </div>
            </div>
          )}

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
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-[#0B1F33] text-sm truncate" style={{ fontFamily: 'Poppins, sans-serif' }}>{material.name}</p>
                        {material.shared && (
                          <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded font-semibold flex-shrink-0">Shared</span>
                        )}
                      </div>
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
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
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
                      <div className="flex gap-2">
                        <button className="px-3 py-1.5 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <i className="ri-edit-line mr-1"></i>Edit
                        </button>
                        <button className="px-3 py-1.5 bg-[#F9F9FB] text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <i className="ri-refresh-line mr-1"></i>Update Status
                        </button>
                        <button className="px-3 py-1.5 bg-[#F9F9FB] text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <i className="ri-delete-bin-line mr-1"></i>Remove
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* LABOR SECTION */}
      {activeSection === 'labor' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Labor Costs</h4>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {data.labor.length} entries &middot; {data.laborTotal} total
              </p>
            </div>
            <button
              onClick={() => setShowAddLabor(!showAddLabor)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00B8A9] text-white rounded-lg font-semibold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-add-line"></i>
              Log Labor
            </button>
          </div>

          {/* Add Labor Form */}
          {showAddLabor && (
            <div className="bg-[#F9F9FB] rounded-xl p-5 border border-gray-200">
              <h5 className="font-bold text-[#0B1F33] mb-4 text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>New Labor Entry</h5>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <input type="text" placeholder="Worker name" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="text" placeholder="Role / Trade" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="number" placeholder="Hours worked" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="number" placeholder="Hourly rate ($)" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <input type="text" placeholder="Date range" className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9]" />
                <select className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] text-[#6B7C8F]">
                  <option>Payment Status</option>
                  <option>Pending</option>
                  <option>Approved</option>
                  <option>Paid</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowAddLabor(false)} className="px-4 py-2 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Cancel</button>
                <button onClick={() => setShowAddLabor(false)} className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap" style={{ fontFamily: 'Montserrat, sans-serif' }}>Save Entry</button>
              </div>
            </div>
          )}

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

          {/* Labor Entries */}
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

      {/* CHANGE ORDERS SECTION */}
      {activeSection === 'changes' && (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#0B1F33] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Change Orders</h4>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {data.changeOrders.length} orders &middot; {data.changeOrdersTotal} total impact
              </p>
            </div>
            <button
              onClick={() => { setShowNewChangeOrder(true); setChangeOrderSuccess(false); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#00B8A9] text-white rounded-lg font-semibold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-add-line"></i>
              New Change Order
            </button>
          </div>

          {/* New Change Order Modal */}
          {showNewChangeOrder && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { if (!changeOrderSubmitting) { setShowNewChangeOrder(false); setChangeOrderSuccess(false); } }}>
              <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                {/* Modal Header */}
                <div className="bg-[#0B1F33] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center">
                      <i className="ri-file-edit-line text-[#D4B483] text-lg"></i>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-base" style={{ fontFamily: 'Poppins, sans-serif' }}>New Change Order</h3>
                      <p className="text-white/60 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{jobTitle}</p>
                    </div>
                  </div>
                  {!changeOrderSubmitting && !changeOrderSuccess && (
                    <button onClick={() => setShowNewChangeOrder(false)} className="w-8 h-8 flex items-center justify-center text-white/60 hover:text-white cursor-pointer">
                      <i className="ri-close-line text-xl"></i>
                    </button>
                  )}
                </div>

                {/* Success State */}
                {changeOrderSuccess ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="ri-check-line text-green-600 text-3xl"></i>
                    </div>
                    <h4 className="font-bold text-[#0B1F33] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Change Order Submitted</h4>
                    <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Your change order has been sent to the homeowner for review and approval.
                    </p>
                  </div>
                ) : changeOrderSubmitting ? (
                  <div className="p-12 text-center">
                    <div className="w-12 h-12 border-4 border-[#00B8A9] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Submitting change order...</p>
                  </div>
                ) : (
                  <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Change Order Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={changeOrderForm.title}
                        onChange={e => setChangeOrderForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Additional insulation for north wall"
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Description
                      </label>
                      <textarea
                        value={changeOrderForm.description}
                        onChange={e => {
                          if (e.target.value.length <= 500) {
                            setChangeOrderForm(prev => ({ ...prev, description: e.target.value }));
                          }
                        }}
                        placeholder="Describe the change, why it&#39;s needed, and what it involves..."
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent resize-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                      <p className="text-xs text-[#6B7C8F] text-right mt-1">{changeOrderForm.description.length}/500</p>
                    </div>

                    {/* Amount & Reason Row */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Cost Impact <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7C8F] text-sm font-semibold">$</span>
                          <input
                            type="text"
                            value={changeOrderForm.amount}
                            onChange={e => {
                              const val = e.target.value.replace(/[^0-9.]/g, '');
                              setChangeOrderForm(prev => ({ ...prev, amount: val }));
                            }}
                            placeholder="0.00"
                            className="w-full pl-8 pr-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Reason
                        </label>
                        <select
                          value={changeOrderForm.reason}
                          onChange={e => setChangeOrderForm(prev => ({ ...prev, reason: e.target.value }))}
                          className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent text-[#0B1F33] cursor-pointer"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <option value="scope_change">Scope Change</option>
                          <option value="unforeseen_condition">Unforeseen Condition</option>
                          <option value="material_upgrade">Material Upgrade</option>
                          <option value="code_requirement">Code Requirement</option>
                          <option value="homeowner_request">Homeowner Request</option>
                          <option value="design_revision">Design Revision</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-xs font-semibold text-[#0B1F33] mb-1.5" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Priority
                      </label>
                      <div className="flex gap-2">
                        {[
                          { id: 'low', label: 'Low', color: 'bg-gray-100 text-gray-600 border-gray-200', activeColor: 'bg-gray-600 text-white border-gray-600' },
                          { id: 'normal', label: 'Normal', color: 'bg-[#00B8A9]/10 text-[#00B8A9] border-[#00B8A9]/30', activeColor: 'bg-[#00B8A9] text-white border-[#00B8A9]' },
                          { id: 'high', label: 'High', color: 'bg-orange-100 text-orange-600 border-orange-200', activeColor: 'bg-orange-500 text-white border-orange-500' },
                          { id: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-600 border-red-200', activeColor: 'bg-red-500 text-white border-red-500' },
                        ].map(p => (
                          <button
                            key={p.id}
                            onClick={() => setChangeOrderForm(prev => ({ ...prev, priority: p.id }))}
                            className={`px-3.5 py-2 rounded-lg text-xs font-semibold border cursor-pointer transition-all whitespace-nowrap ${
                              changeOrderForm.priority === p.id ? p.activeColor : p.color
                            }`}
                            style={{ fontFamily: 'Montserrat, sans-serif' }}
                          >
                            {p.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Line Items Preview */}
                    <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-200">
                      <h5 className="text-xs font-semibold text-[#0B1F33] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        <i className="ri-file-list-3-line mr-1.5"></i>
                        Cost Breakdown (Optional)
                      </h5>
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2">
                          <input
                            type="text"
                            placeholder="Item description"
                            className="col-span-7 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                          <input
                            type="text"
                            placeholder="Qty"
                            className="col-span-2 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent text-center"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                          <input
                            type="text"
                            placeholder="Cost"
                            className="col-span-3 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#00B8A9] focus:border-transparent"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                          />
                        </div>
                        <button className="flex items-center gap-1 text-xs text-[#00B8A9] font-semibold hover:text-[#00a89a] cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          <i className="ri-add-line"></i>
                          Add Line Item
                        </button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setChangeOrderForm(prev => ({ ...prev, notifyHomeowner: !prev.notifyHomeowner }))}
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                            changeOrderForm.notifyHomeowner ? 'bg-[#00B8A9]' : 'border-2 border-gray-300 group-hover:border-[#00B8A9]'
                          }`}
                        >
                          {changeOrderForm.notifyHomeowner && <i className="ri-check-line text-white text-sm"></i>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Notify homeowner</p>
                          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Send an email and in-app notification for approval</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div
                          onClick={() => setChangeOrderForm(prev => ({ ...prev, attachReceipt: !prev.attachReceipt }))}
                          className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors cursor-pointer ${
                            changeOrderForm.attachReceipt ? 'bg-[#00B8A9]' : 'border-2 border-gray-300 group-hover:border-[#00B8A9]'
                          }`}
                        >
                          {changeOrderForm.attachReceipt && <i className="ri-check-line text-white text-sm"></i>}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Attach supporting documents</p>
                          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Photos, receipts, or estimates to support this change</p>
                        </div>
                      </label>
                    </div>

                    {/* Budget Impact Preview */}
                    {changeOrderForm.amount && (
                      <div className="bg-[#0B1F33]/5 border border-[#0B1F33]/15 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-information-line text-[#0B1F33]"></i>
                          <span className="text-xs font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>Budget Impact Preview</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Current Budget</p>
                            <p className="text-sm font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{data.budget}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>This Change</p>
                            <p className="text-sm font-bold text-orange-600" style={{ fontFamily: 'Poppins, sans-serif' }}>+${parseFloat(changeOrderForm.amount || '0').toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>New Total</p>
                            <p className="text-sm font-bold text-[#00B8A9]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              ${(budgetNum + parseFloat(changeOrderForm.amount || '0')).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Modal Footer */}
                {!changeOrderSubmitting && !changeOrderSuccess && (
                  <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-[#F9F9FB]">
                    <button
                      onClick={() => setShowNewChangeOrder(false)}
                      className="px-4 py-2.5 text-sm font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer whitespace-nowrap"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleChangeOrderSubmit}
                      disabled={!changeOrderForm.title.trim() || !changeOrderForm.amount.trim()}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                        changeOrderForm.title.trim() && changeOrderForm.amount.trim()
                          ? 'bg-[#00B8A9] text-white hover:bg-[#00a89a]'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      <i className="ri-send-plane-line"></i>
                      Submit Change Order
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Approval Confirmation Modal */}
          {approvalAction && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => { if (!approvalProcessing) setApprovalAction(null); }}>
              <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                  <div className={`w-14 h-14 bg-full rounded-full flex items-center justify-center mx-auto mb-4 ${
                    approvalAction.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    <i className={`${
                      approvalAction.action === 'approve' ? 'ri-check-line text-green-600' : 'ri-close-line text-red-600'
                    } text-2xl`}></i>
                  </div>
                  <h4 className="font-bold text-[#0B1F33] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {approvalAction.action === 'approve' ? 'Approve Change Order?' : 'Reject Change Order?'}
                  </h4>
                  <p className="text-sm text-[#6B7C8F] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {data.changeOrders.find(c => c.id === approvalAction.id)?.title}
                  </p>
                  <p className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {data.changeOrders.find(c => c.id === approvalAction.id)?.amount}
                  </p>
                  {approvalAction.action === 'approve' && (
                    <p className="text-xs text-[#6B7C8F] bg-[#F9F9FB] rounded-lg p-3 mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                      This will adjust the project budget and notify the homeowner of the approved change.
                    </p>
                  )}
                  {approvalAction.action === 'reject' && (
                    <div className="mb-4">
                      <textarea
                        placeholder="Reason for rejection (optional)..."
                        rows={2}
                        className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    </div>
                  )}
                  {approvalProcessing ? (
                    <div className="py-2">
                      <div className="w-8 h-8 border-3 border-[#00B8A9] border-t-transparent rounded-full animate-spin mx-auto"></div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setApprovalAction(null)}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-[#6B7C8F] rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={confirmApproval}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold text-white cursor-pointer whitespace-nowrap ${
                          approvalAction.action === 'approve'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
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
            }`} style={{ animation: 'slideUp 0.3s ease-out' }}>
              <div className={`w-8 h-8 bg-full rounded-full flex items-center justify-center ${
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
                  Homeowner has been notified
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
              <button
                onClick={() => { setShowNewChangeOrder(true); setChangeOrderSuccess(false); }}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#00B8A9] text-white rounded-lg font-semibold text-sm hover:bg-[#00a89a] transition-colors cursor-pointer whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-add-line"></i>
                Create First Change Order
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {data.changeOrders.map(order => (
                <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-full rounded-lg flex items-center justify-center flex-shrink-0 ${
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
                          className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-200 cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-check-line mr-1"></i>Approve
                        </button>
                        <button
                          onClick={() => handleApprovalAction(order.id, 'reject')}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-semibold hover:bg-red-200 cursor-pointer whitespace-nowrap"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          <i className="ri-close-line mr-1"></i>Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Change Order Impact Summary */}
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
    </div>
  );
}
