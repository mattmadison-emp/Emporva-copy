import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface WorkItemRow {
  id: string;
  title: string;
  description: string | null;
  trade: string;
  status: string;
  estimated_budget: string | null;
  agreed_price: number | null;
  start_date: string | null;
  end_date: string | null;
  contractor_name: string;
  contractor_avatar: string | null;
  business_name: string | null;
}

interface WorkItemsTabProps {
  jobId: string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  'open': { label: 'Open', bg: 'bg-blue-100', text: 'text-blue-700', icon: 'ri-door-open-line' },
  'quoted': { label: 'Quoted', bg: 'bg-purple-100', text: 'text-purple-700', icon: 'ri-file-text-line' },
  'assigned': { label: 'Assigned', bg: 'bg-amber-100', text: 'text-amber-700', icon: 'ri-user-follow-line' },
  'in-progress': { label: 'In Progress', bg: 'bg-teal-100', text: 'text-teal-700', icon: 'ri-loader-4-line' },
  'completed': { label: 'Completed', bg: 'bg-green-100', text: 'text-green-700', icon: 'ri-check-line' },
  'cancelled': { label: 'Cancelled', bg: 'bg-gray-100', text: 'text-gray-500', icon: 'ri-close-line' },
};

const tradeIcons: Record<string, string> = {
  'General Contractor': 'ri-building-line',
  'Plumbing': 'ri-drop-line',
  'Electrical': 'ri-flashlight-line',
  'HVAC': 'ri-temp-hot-line',
  'Roofing': 'ri-home-line',
  'Carpentry': 'ri-tools-line',
  'Painting': 'ri-paint-brush-line',
  'Flooring': 'ri-layout-grid-line',
  'Drywall': 'ri-artboard-line',
  'Landscaping': 'ri-plant-line',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

const formatDate = (iso: string | null) => {
  if (!iso) return '—';
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export default function WorkItemsTab({ jobId }: WorkItemsTabProps) {
  const { user } = useAuth();
  const [items, setItems] = useState<WorkItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchWorkItems = useCallback(async () => {
    if (!user) return;

    const { data: workItems } = await supabase
      .from('work_items')
      .select('id, title, description, trade, status, estimated_budget, agreed_price, start_date, end_date, contractor_id')
      .eq('job_id', jobId)
      .order('created_at', { ascending: true });

    if (!workItems || workItems.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    // Fetch contractor profiles
    const contractorIds = [...new Set(workItems.filter(w => w.contractor_id).map(w => w.contractor_id))];

    let profileMap: Record<string, { first_name: string; last_name: string; avatar_url: string | null }> = {};
    let businessMap: Record<string, string> = {};

    if (contractorIds.length > 0) {
      const [profilesRes, cpRes] = await Promise.all([
        supabase.from('profiles').select('id, first_name, last_name, avatar_url').in('id', contractorIds),
        supabase.from('contractor_profiles').select('user_id, business_name').in('user_id', contractorIds),
      ]);
      (profilesRes.data || []).forEach(p => { profileMap[p.id] = p; });
      (cpRes.data || []).forEach(cp => { businessMap[cp.user_id] = cp.business_name; });
    }

    const rows: WorkItemRow[] = workItems.map(wi => {
      const profile = wi.contractor_id ? profileMap[wi.contractor_id] : null;
      return {
        id: wi.id,
        title: wi.title,
        description: wi.description,
        trade: wi.trade,
        status: wi.status,
        estimated_budget: wi.estimated_budget,
        agreed_price: wi.agreed_price,
        start_date: wi.start_date,
        end_date: wi.end_date,
        contractor_name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unassigned',
        contractor_avatar: profile?.avatar_url || null,
        business_name: wi.contractor_id ? businessMap[wi.contractor_id] || null : null,
      };
    });

    setItems(rows);
    setLoading(false);
  }, [user, jobId]);

  useEffect(() => {
    fetchWorkItems();
  }, [fetchWorkItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <i className="ri-tools-line text-2xl text-gray-400"></i>
        </div>
        <p className="text-sm text-[#6B7C8F]">No work items for this project yet</p>
      </div>
    );
  }

  // Summary counts
  const completed = items.filter(i => i.status === 'completed').length;
  const inProgress = items.filter(i => i.status === 'in-progress').length;
  const totalAgreed = items.reduce((sum, i) => sum + (i.agreed_price || 0), 0);
  const uniqueContractors = new Set(items.filter(i => i.contractor_name !== 'Unassigned').map(i => i.contractor_name)).size;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Work Items</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">{items.length}</p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Completed</p>
          <p className="text-lg sm:text-xl font-bold text-green-600">{completed}/{items.length}</p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Contractors</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">{uniqueContractors}</p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Total Agreed</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">{totalAgreed > 0 ? formatCurrency(totalAgreed) : '—'}</p>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-[#6B7C8F]">Overall Progress</span>
          <span className="text-xs font-bold text-[#0B1F33]">{completed} of {items.length} complete</span>
        </div>
        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden flex">
          {items.length > 0 && (
            <>
              <div className="h-full bg-green-500 transition-all" style={{ width: `${(completed / items.length) * 100}%` }} />
              <div className="h-full bg-teal-400 transition-all" style={{ width: `${(inProgress / items.length) * 100}%` }} />
            </>
          )}
        </div>
        <div className="flex gap-4 mt-1.5 text-[10px] text-[#6B7C8F]">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span>Completed</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400"></span>In Progress</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-200"></span>Remaining</span>
        </div>
      </div>

      {/* Work Items List */}
      <div className="space-y-3">
        {items.map((item) => {
          const config = statusConfig[item.status] || statusConfig['open'];
          const tradeIcon = tradeIcons[item.trade] || 'ri-tools-line';
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={`bg-white rounded-xl border transition-all ${
                isExpanded ? 'border-[#14B8A6] shadow-md' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {/* Header row */}
              <button
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className="w-full p-4 flex items-center gap-3 text-left cursor-pointer"
              >
                {/* Trade icon */}
                <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}>
                  <i className={`${tradeIcon} text-lg sm:text-xl ${config.text}`}></i>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-sm sm:text-base text-[#0B1F33] truncate">{item.title}</h4>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold ${config.bg} ${config.text} flex items-center gap-1`}>
                      <i className={`${config.icon} text-xs`}></i>
                      {config.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[#6B7C8F]">
                    <span className="font-medium">{item.trade}</span>
                    <span>·</span>
                    <span>{item.contractor_name}</span>
                  </div>
                </div>

                {/* Price + chevron */}
                <div className="text-right flex-shrink-0 flex items-center gap-2">
                  {item.agreed_price ? (
                    <span className="text-sm sm:text-base font-bold text-[#0B1F33]">{formatCurrency(item.agreed_price)}</span>
                  ) : item.estimated_budget ? (
                    <span className="text-xs sm:text-sm text-[#6B7C8F]">{item.estimated_budget}</span>
                  ) : null}
                  <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-[#6B7C8F] text-lg`}></i>
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                  {/* Description */}
                  {item.description && (
                    <p className="text-sm text-[#6B7C8F] leading-relaxed">{item.description}</p>
                  )}

                  {/* Detail grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-[#F9F9FB] rounded-lg p-2.5">
                      <p className="text-[10px] text-[#6B7C8F] mb-0.5">Contractor</p>
                      <div className="flex items-center gap-2">
                        {item.contractor_avatar ? (
                          <img src={item.contractor_avatar} alt="" className="w-6 h-6 rounded-full object-cover" />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-[#0B1F33] text-white flex items-center justify-center text-[10px] font-bold">
                            {item.contractor_name !== 'Unassigned' ? item.contractor_name.split(' ').map(w => w[0]).join('').slice(0, 2) : '?'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#0B1F33] truncate">{item.contractor_name}</p>
                          {item.business_name && (
                            <p className="text-[10px] text-[#6B7C8F] truncate">{item.business_name}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#F9F9FB] rounded-lg p-2.5">
                      <p className="text-[10px] text-[#6B7C8F] mb-0.5">Budget</p>
                      <p className="text-xs font-bold text-[#0B1F33]">
                        {item.agreed_price ? formatCurrency(item.agreed_price) : item.estimated_budget || '—'}
                      </p>
                      {item.agreed_price && item.estimated_budget && (
                        <p className="text-[10px] text-[#6B7C8F]">Est: {item.estimated_budget}</p>
                      )}
                    </div>

                    <div className="bg-[#F9F9FB] rounded-lg p-2.5">
                      <p className="text-[10px] text-[#6B7C8F] mb-0.5">Start Date</p>
                      <p className="text-xs font-bold text-[#0B1F33]">{formatDate(item.start_date)}</p>
                    </div>

                    <div className="bg-[#F9F9FB] rounded-lg p-2.5">
                      <p className="text-[10px] text-[#6B7C8F] mb-0.5">End Date</p>
                      <p className="text-xs font-bold text-[#0B1F33]">{formatDate(item.end_date)}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
