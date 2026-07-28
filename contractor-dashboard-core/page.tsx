
import { useState, useCallback, useEffect } from 'react';
import AppNav from '../../components/layout/AppNav';
import CreditBalance from './components/CreditBalance';
import HowCreditsWork from './components/HowCreditsWork';
import PremiumUpsellBanner from './components/PremiumUpsellBanner';
import ReviewsReputation from '../contractor-dashboard-pro/components/ReviewsReputation';
import EarningsDashboard from '../../components/feature/EarningsDashboard';
import ActiveEmporvaJobs from '../../components/feature/ActiveEmporvaJobs';
import JobMarketplace from '../../components/feature/JobMarketplace';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../../components/base/PullToRefreshIndicator';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

type PreviewJob = {
  id: string;
  title: string;
  location: string;
  budget_range: string | null;
  category: string;
  created_at: string;
};

function formatBudgetShort(range: string | null): string {
  switch (range) {
    case 'under-1000': return 'Under $1K';
    case '1000-5000': return '$1K–$5K';
    case '5000-10000': return '$5K–$10K';
    case '10000-25000': return '$10K–$25K';
    case '25000-plus': return '$25K+';
    default: return 'TBD';
  }
}

export default function ContractorDashboardCore() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [previewJobs, setPreviewJobs] = useState<PreviewJob[]>([]);
  const [jobCount, setJobCount] = useState(0);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [wonJobCount, setWonJobCount] = useState(0);
  const [creditBalance, setCreditBalance] = useState(0);
  const [isPremium, setIsPremium] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [recentActiveJobs, setRecentActiveJobs] = useState<Array<{ title: string; homeowner: string; status: string; amount: string }>>([]);

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshKey(k => k + 1);
  }, []);

  const { isRefreshing, isPulling, pullDistance, pullProgress, shouldTriggerRefresh } =
    usePullToRefresh({ onRefresh: handleRefresh });

  // Fetch dashboard data
  useEffect(() => {
    if (!user) return;

    async function fetchDashboardData() {
      // Get contractor profile (trades + credit balance)
      const { data: contractorProfile } = await supabase
        .from('contractor_profiles')
        .select('id, primary_trade, secondary_trades, credit_balance, selected_plan')
        .eq('user_id', user!.id)
        .single();

      if (!contractorProfile) return;

      setCreditBalance(contractorProfile.credit_balance || 0);
      setIsPremium(contractorProfile.selected_plan === 'premium');

      const trades: string[] = [];
      if (contractorProfile.primary_trade) trades.push(contractorProfile.primary_trade);
      if (contractorProfile.secondary_trades && Array.isArray(contractorProfile.secondary_trades)) {
        trades.push(...contractorProfile.secondary_trades);
      }

      // Fetch preview jobs for marketplace (open work items matching trades)
      let query = supabase
        .from('jobs')
        .select('id, title, location, budget_range, category, created_at')
        .eq('status', 'open')
        .neq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (trades.length > 0) {
        query = query.in('category', trades);
      }

      const { data } = await query.limit(4);
      if (data) {
        setPreviewJobs(data);
        const { count: totalCount } = await supabase
          .from('jobs')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'open')
          .neq('user_id', user!.id)
          .in('category', trades.length > 0 ? trades : ['__none__']);
        setJobCount(totalCount || data.length);
      }

      // Active work items (assigned or in-progress for this contractor)
      const { count: activeCount } = await supabase
        .from('work_items')
        .select('id', { count: 'exact', head: true })
        .eq('contractor_id', user!.id)
        .in('status', ['assigned', 'in-progress']);
      setActiveJobCount(activeCount || 0);

      // Won work items (completed for this contractor)
      const { count: wonCount } = await supabase
        .from('work_items')
        .select('id', { count: 'exact', head: true })
        .eq('contractor_id', user!.id)
        .in('status', ['assigned', 'in-progress', 'completed']);
      setWonJobCount(wonCount || 0);

      // Average rating from reviews
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('contractor_profile_id', contractorProfile.id);

      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setAvgRating(Math.round(avg * 10) / 10);
      }

      // Fetch recent active jobs for the overview section
      const { data: activeWIs } = await supabase
        .from('work_items')
        .select('job_id, agreed_price, status')
        .eq('contractor_id', user!.id)
        .in('status', ['assigned', 'in-progress', 'completed'])
        .order('updated_at', { ascending: false })
        .limit(3);

      if (activeWIs && activeWIs.length > 0) {
        const wiJobIds = [...new Set(activeWIs.map(w => w.job_id))];
        const { data: wiJobs } = await supabase
          .from('jobs')
          .select('id, title, user_id, status')
          .in('id', wiJobIds);

        const homeownerIds = [...new Set((wiJobs || []).map(j => j.user_id))];
        const { data: homeowners } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .in('id', homeownerIds);

        const hoMap = Object.fromEntries((homeowners || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));

        const recentJobs = activeWIs.map(wi => {
          const job = (wiJobs || []).find(j => j.id === wi.job_id);
          return {
            title: job?.title || 'Unknown Job',
            homeowner: job ? hoMap[job.user_id] || 'Unknown' : 'Unknown',
            status: wi.status === 'completed' ? 'Completed' : wi.status === 'in-progress' ? 'In Progress' : 'Assigned',
            amount: wi.agreed_price ? `$${Number(wi.agreed_price).toLocaleString()}` : 'TBD',
          };
        });
        setRecentActiveJobs(recentJobs);
      }
    }

    fetchDashboardData();
  }, [user, refreshKey]);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'jobs', label: 'Active Jobs', icon: 'ri-briefcase-line' },
    { id: 'earnings', label: 'Earnings', icon: 'ri-money-dollar-circle-line' },
    { id: 'marketplace', label: 'Job Marketplace', icon: 'ri-store-3-line', badge: jobCount || undefined },
    { id: 'reviews', label: 'Reviews', icon: 'ri-star-smile-line' },
  ];

  const lockedTabs = [
    { id: 'pipeline', label: 'Pipeline', icon: 'ri-flow-chart' },
    { id: 'quotes', label: 'Quotes Hub', icon: 'ri-file-text-line' },
    { id: 'crm', label: 'CRM', icon: 'ri-contacts-line' },
    { id: 'calendar', label: 'Calendar', icon: 'ri-calendar-2-line' },
    { id: 'automation', label: 'Automation', icon: 'ri-robot-line' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-line-chart-line' },
  ];

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <PullToRefreshIndicator
        isVisible={isPulling || isRefreshing}
        pullDistance={pullDistance}
        pullProgress={pullProgress}
        isRefreshing={isRefreshing}
        shouldTriggerRefresh={shouldTriggerRefresh}
      />
      <AppNav />

      <div className="pt-20 md:pt-24 pb-8 md:pb-16">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-[#0B1F33] mb-1 md:mb-2">
                  Contractor Dashboard
                </h1>
                <p className="text-sm md:text-lg text-[#6B7C8F]">
                  Manage your Emporva jobs and purchase leads
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                <div className="flex items-center gap-2 bg-[#0B1F33] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                  <i className="ri-copper-coin-line text-[#D4B483] text-lg"></i>
                  <span className="font-bold text-sm md:text-base">{isPremium ? <><i className="ri-infinity-line"></i> Unlimited</> : <>{creditBalance} Credits</>}</span>
                </div>
                <div className="bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg border border-gray-200">
                  <span className="text-xs md:text-sm font-semibold text-[#6B7C8F]">Core Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cost-Per-Lead Info Banner */}
          <div className="mb-4 md:mb-6 bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl px-4 md:px-6 py-3 md:py-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-copper-coin-line text-[#D4B483] text-lg md:text-xl"></i>
                </div>
                <div>
                  <p className="font-bold text-sm md:text-base text-white">Pay-Per-Lead Model</p>
                  <p className="text-xs md:text-sm text-white/70">
                    Use credits to unlock leads in the marketplace &bull; $15 per lead &bull; No monthly fees
                  </p>
                </div>
              </div>
              <a
                href="/contractor-plans"
                className="text-xs md:text-sm text-[#D4B483] hover:text-[#e0c49a] font-semibold whitespace-nowrap cursor-pointer transition-colors self-start sm:self-auto"
              >
                Switch to Unlimited <i className="ri-arrow-right-s-line"></i>
              </a>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                  <i className="ri-briefcase-line text-white text-lg md:text-xl"></i>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7C8F]">Active Jobs</p>
                  <p className="text-xl md:text-2xl font-bold text-[#0B1F33]">{activeJobCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <i className="ri-trophy-line text-green-600 text-lg md:text-xl"></i>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7C8F]">Jobs Won</p>
                  <p className="text-xl md:text-2xl font-bold text-[#0B1F33]">{wonJobCount}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-[#D4B483]/15 rounded-lg flex items-center justify-center">
                  <i className="ri-copper-coin-line text-[#D4B483] text-lg md:text-xl"></i>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7C8F]">Credits Left</p>
                  <p className="text-xl md:text-2xl font-bold text-[#0B1F33]">{isPremium ? <i className="ri-infinity-line"></i> : creditBalance}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
              <div className="flex items-center gap-2 md:gap-3">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <i className="ri-star-line text-yellow-600 text-lg md:text-xl"></i>
                </div>
                <div>
                  <p className="text-xs md:text-sm text-[#6B7C8F]">Avg Rating</p>
                  <p className="text-xl md:text-2xl font-bold text-[#0B1F33]">{avgRating || '—'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mb-4 md:mb-6"></div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="lg:hidden w-full mb-4 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <i className={`${tabs.find(t => t.id === activeTab)?.icon} text-[#0B1F33] text-xl`}></i>
              <span className="font-semibold text-[#0B1F33]">{tabs.find(t => t.id === activeTab)?.label}</span>
            </div>
            <i className={`ri-arrow-${showMobileMenu ? 'up' : 'down'}-s-line text-[#6B7C8F] text-xl`}></i>
          </button>

          {/* Sidebar + Content */}
          <div className="flex gap-4 md:gap-6">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-28">
                <p className="px-3 py-2 text-xs font-bold text-[#6B7C8F] uppercase tracking-wider">
                  Core Features
                </p>
                <div className="flex flex-col gap-1">
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all relative text-left ${
                        activeTab === tab.id
                          ? 'bg-[#0B1F33] text-white'
                          : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                      {tab.label}
                      {tab.badge && (
                        <span className="ml-auto w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                          {tab.badge}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="px-3 py-2 text-xs font-bold text-[#D4B483] uppercase tracking-wider flex items-center gap-1">
                    <i className="ri-vip-crown-line text-xs"></i>
                    Premium
                  </p>
                  <div className="flex flex-col gap-1">
                    {lockedTabs.map(tab => (
                      <a
                        key={tab.id}
                        href="/contractor-plans"
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm whitespace-nowrap cursor-pointer transition-all text-left text-[#6B7C8F]/50 hover:bg-[#D4B483]/5 hover:text-[#D4B483] group"
                      >
                        <i className={`${tab.icon} text-lg`}></i>
                        <span className="flex-1">{tab.label}</span>
                        <i className="ri-lock-line text-xs opacity-50 group-hover:opacity-100"></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Menu */}
            {showMobileMenu && (
              <div
                className="lg:hidden fixed inset-0 z-40 bg-black/50"
                onClick={() => setShowMobileMenu(false)}
              >
                <div
                  className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-[#0B1F33]">Navigation</h3>
                    <button
                      onClick={() => setShowMobileMenu(false)}
                      className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                    >
                      <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {tabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl font-semibold text-sm cursor-pointer transition-all ${
                          activeTab === tab.id
                            ? 'bg-[#0B1F33] text-white'
                            : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                        }`}
                      >
                        <i className={`${tab.icon} text-2xl`}></i>
                        <span className="text-xs text-center leading-tight">{tab.label}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-xs font-bold text-[#D4B483] uppercase tracking-wider mb-2 flex items-center gap-1">
                    <i className="ri-vip-crown-line text-xs"></i> Premium Features
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {lockedTabs.map(tab => (
                      <a
                        key={tab.id}
                        href="/contractor-plans"
                        className="flex flex-col items-center gap-1 p-3 rounded-xl text-[#6B7C8F]/50 bg-[#F9F9FB] hover:bg-[#D4B483]/10 transition-all"
                      >
                        <i className={`${tab.icon} text-xl`}></i>
                        <span className="text-[10px] text-center leading-tight">{tab.label}</span>
                        <i className="ri-lock-line text-[10px]"></i>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div key={refreshKey} className="flex-1 min-w-0">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <HowCreditsWork />
                  <CreditBalance />
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-[#0B1F33]">Recent Activity</h3>
                      <button
                        onClick={() => setActiveTab('jobs')}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap"
                      >
                        View All Jobs <i className="ri-arrow-right-s-line"></i>
                      </button>
                    </div>
                    <div className="space-y-3">
                      {recentActiveJobs.length > 0 ? recentActiveJobs.map((item, i) => {
                        const statusConfig = item.status === 'Completed'
                          ? { icon: 'ri-check-line', bg: 'bg-green-100', color: 'text-green-600' }
                          : item.status === 'In Progress'
                          ? { icon: 'ri-tools-line', bg: 'bg-teal-100', color: 'text-teal-600' }
                          : { icon: 'ri-time-line', bg: 'bg-[#D4B483]/15', color: 'text-[#D4B483]' };
                        return (
                          <div key={i} className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 ${statusConfig.bg} rounded-lg flex items-center justify-center`}>
                                <i className={`${statusConfig.icon} ${statusConfig.color}`}></i>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-[#0B1F33]">{item.title}</p>
                                <p className="text-xs text-[#6B7C8F]">{item.homeowner} • {item.status}</p>
                              </div>
                            </div>
                            <span className="text-sm font-bold text-[#0B1F33]">{item.amount}</span>
                          </div>
                        );
                      }) : (
                        <div className="text-center py-6 text-sm text-[#6B7C8F]">
                          No active jobs yet
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                          <i className="ri-store-3-line text-teal-600 text-xl"></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-[#0B1F33]">New Jobs Available</h3>
                          <p className="text-xs text-[#6B7C8F]">Use 1 credit to unlock a lead and submit your quote</p>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('marketplace')}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-store-3-line"></i>
                        Browse Jobs
                        {jobCount > 0 && (
                          <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">{jobCount}</span>
                        )}
                      </button>
                    </div>
                    {previewJobs.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-3">
                        {previewJobs.map(job => {
                          const isNew = new Date(job.created_at) > new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
                          return (
                            <div
                              key={job.id}
                              className="p-3 bg-[#F9F9FB] rounded-lg border border-gray-100 hover:border-teal-200 transition-colors cursor-pointer"
                              onClick={() => setActiveTab('marketplace')}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-sm font-bold text-[#0B1F33] truncate">{job.title}</h4>
                                    {isNew && (
                                      <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold rounded-full whitespace-nowrap">NEW</span>
                                    )}
                                  </div>
                                  <p className="text-xs text-[#6B7C8F]">{job.location} &bull; {formatBudgetShort(job.budget_range)}</p>
                                </div>
                                <div className="flex items-center gap-1 px-2 py-1 bg-[#D4B483]/15 rounded text-xs font-semibold text-[#D4B483] flex-shrink-0 ml-2">
                                  <i className="ri-copper-coin-line text-xs"></i>1
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                <span className="px-2 py-0.5 bg-[#0B1F33] text-white text-[10px] font-semibold rounded-full">{job.category}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-[#6B7C8F]">No jobs available matching your trades right now.</p>
                      </div>
                    )}
                  </div>
                  <PremiumUpsellBanner />
                </div>
              )}
              {activeTab === 'jobs' && <ActiveEmporvaJobs />}
              {activeTab === 'earnings' && <EarningsDashboard />}
              {activeTab === 'marketplace' && (
                <div className="space-y-4">
                  <div className="bg-[#D4B483]/10 border border-[#D4B483]/20 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="ri-copper-coin-line text-[#D4B483] text-xl"></i>
                      <div>
                        <p className="text-sm font-bold text-[#0B1F33]">{isPremium ? 'You have unlimited credits' : `You have ${creditBalance} credits remaining`}</p>
                        <p className="text-xs text-[#6B7C8F]">Each lead costs 1 credit ($15) to unlock and quote</p>
                      </div>
                    </div>
                    <a href="/contractor-plans" className="text-xs font-semibold text-[#D4B483] hover:underline cursor-pointer whitespace-nowrap hidden sm:block">
                      Go unlimited →
                    </a>
                  </div>
                  <JobMarketplace />
                </div>
              )}
              {activeTab === 'reviews' && <ReviewsReputation />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
