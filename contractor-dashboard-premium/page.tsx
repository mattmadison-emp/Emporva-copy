
import { useState, useEffect, useCallback } from 'react';
import AppNav from '../../components/layout/AppNav';
import LeadImport from './components/LeadImport';
import ActiveEmporvaJobs from '../../components/feature/ActiveEmporvaJobs';
import CRMContacts from '../contractor-dashboard-pro/components/CRMContacts';
import PipelineView from '../contractor-dashboard-pro/components/PipelineView';
import AutomationHub from '../contractor-dashboard-pro/components/AutomationHub';
import CommunicationHub from '../contractor-dashboard-pro/components/CommunicationHub';
import MarketingCampaigns from '../contractor-dashboard-pro/components/MarketingCampaigns';
import SocialContentHub from '../contractor-dashboard-pro/components/SocialContentHub';
import ReviewsReputation from '../contractor-dashboard-pro/components/ReviewsReputation';
import BusinessAnalytics from '../contractor-dashboard-pro/components/BusinessAnalytics';
import CalendarView from './components/CalendarView';
import JobMarketplace from '../../components/feature/JobMarketplace';
import AIInsights from './components/AIInsights';
import QuotesHub from './components/QuotesHub';
import EarningsDashboard from '../../components/feature/EarningsDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../../components/base/PullToRefreshIndicator';

export default function ContractorDashboardPremium() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Quick stats from DB
  const [activeJobsCount, setActiveJobsCount] = useState(0);
  const [pipelineCount, setPipelineCount] = useState(0);
  const [revenueMTD, setRevenueMTD] = useState('$0');
  const [avgRating, setAvgRating] = useState('—');
  const [newJobsCount, setNewJobsCount] = useState(0);

  const fetchQuickStats = useCallback(async () => {
    if (!user) return;

    // Active jobs: work_items assigned/in-progress for this contractor
    const { count: activeCount } = await supabase
      .from('work_items')
      .select('id', { count: 'exact', head: true })
      .eq('contractor_id', user.id)
      .in('status', ['assigned', 'in-progress']);
    setActiveJobsCount(activeCount || 0);

    // Pipeline: work_items in open/quoted status
    const { count: pipeCount } = await supabase
      .from('work_items')
      .select('id', { count: 'exact', head: true })
      .eq('contractor_id', user.id)
      .in('status', ['open', 'quoted']);
    setPipelineCount(pipeCount || 0);

    // Revenue MTD: sum of completed payments this month
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { data: payments } = await supabase
      .from('payments')
      .select('amount')
      .eq('payee_id', user.id)
      .eq('status', 'completed')
      .gte('created_at', monthStart);
    const totalRevenue = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
    if (totalRevenue >= 1000) {
      setRevenueMTD(`$${(totalRevenue / 1000).toFixed(1)}K`);
    } else {
      setRevenueMTD(`$${totalRevenue.toLocaleString()}`);
    }

    // Avg rating from reviews
    const { data: contractorProfile } = await supabase
      .from('contractor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (contractorProfile) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('contractor_profile_id', contractorProfile.id);
      if (reviews && reviews.length > 0) {
        const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
        setAvgRating(avg.toFixed(1));
      }
    }

    // New marketplace jobs (open jobs matching contractor trades)
    const { data: profile } = await supabase
      .from('contractor_profiles')
      .select('primary_trade, secondary_trades')
      .eq('user_id', user.id)
      .single();

    if (profile) {
      const trades = [profile.primary_trade, ...(profile.secondary_trades || [])];
      const { count: jobCount } = await supabase
        .from('jobs')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'open')
        .in('category', trades);
      setNewJobsCount(jobCount || 0);
    }
  }, [user]);

  useEffect(() => {
    fetchQuickStats();
  }, [fetchQuickStats]);

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshKey(k => k + 1);
  }, []);

  const { isRefreshing, isPulling, pullDistance, pullProgress, shouldTriggerRefresh } =
    usePullToRefresh({ onRefresh: handleRefresh });

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'marketplace', label: 'Job Marketplace', icon: 'ri-store-3-line', badge: newJobsCount },
    { id: 'schedule', label: 'Schedule', icon: 'ri-calendar-2-line' },
    { id: 'jobs', label: 'Active Jobs', icon: 'ri-briefcase-line' },
    { id: 'pipeline', label: 'Pipeline', icon: 'ri-flow-chart' },
    { id: 'quotes', label: 'Quotes', icon: 'ri-file-text-line' },
    { id: 'crm', label: 'CRM', icon: 'ri-contacts-line' },
    { id: 'communication', label: 'Messages', icon: 'ri-message-3-line' },
    { id: 'automation', label: 'Automation', icon: 'ri-robot-line' },
    { id: 'marketing', label: 'Campaigns', icon: 'ri-megaphone-line' },
    { id: 'social', label: 'Social Content', icon: 'ri-share-line' },
    { id: 'reviews', label: 'Reviews', icon: 'ri-star-line' },
    { id: 'analytics', label: 'Analytics', icon: 'ri-line-chart-line' },
    { id: 'import', label: 'Import Lead', icon: 'ri-download-line' }
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
                  Contractor Pro Dashboard
                </h1>
                <p className="text-sm md:text-lg text-[#6B7C8F]">
                  Your business command center
                </p>
              </div>
              <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                {newJobsCount > 0 && (
                  <button
                    onClick={() => setActiveTab('marketplace')}
                    className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg relative text-sm md:text-base"
                  >
                    <i className="ri-store-3-line text-lg md:text-xl"></i>
                    <span className="hidden sm:inline">View New Jobs</span>
                    <span className="sm:hidden">New Jobs</span>
                    <span className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {newJobsCount}
                    </span>
                  </button>
                )}
                <div className="flex items-center gap-2 md:gap-3 bg-gradient-to-r from-[#D4B483] to-[#c4a473] px-3 md:px-4 py-1.5 md:py-2 rounded-lg">
                  <i className="ri-vip-crown-line text-[#0B1F33] text-lg md:text-xl"></i>
                  <span className="font-bold text-[#0B1F33] text-sm md:text-base">Pro Plan</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Plan Summary */}
          <div className="mb-4 md:mb-6 bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl px-4 md:px-6 py-3 md:py-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-[#D4B483] text-lg md:text-xl"></i>
                </div>
                <div>
                  <p className="font-bold text-sm md:text-base text-white">All Pro Features Unlocked</p>
                  <p className="text-xs md:text-sm text-white/70">Full access to CRM, automation, marketing, analytics, communication hub &amp; more</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-4 md:mb-6">
            {[
              { bg: 'bg-[#0B1F33]', icon: 'ri-briefcase-line', iconColor: 'text-white', label: 'Active Jobs', value: String(activeJobsCount) },
              { bg: 'bg-teal-100', icon: 'ri-flow-chart', iconColor: 'text-teal-600', label: 'Pipeline', value: String(pipelineCount) },
              { bg: 'bg-green-100', icon: 'ri-money-dollar-circle-line', iconColor: 'text-green-600', label: 'Revenue (MTD)', value: revenueMTD },
              { bg: 'bg-yellow-100', icon: 'ri-star-line', iconColor: 'text-yellow-600', label: 'Avg Rating', value: avgRating },
            ].map((stat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                    <i className={`${stat.icon} ${stat.iconColor} text-lg md:text-xl`}></i>
                  </div>
                  <div>
                    <p className="text-xs md:text-sm text-[#6B7C8F]">{stat.label}</p>
                    <p className="text-xl md:text-2xl font-bold text-[#0B1F33]">{stat.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Divider Line */}
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

          {/* Sidebar + Content Layout */}
          <div className="flex gap-4 md:gap-6">
            {/* Left Sidebar Tabs - Desktop */}
            <div className="hidden lg:block w-56 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-28">
                <div className="flex flex-col gap-1">
                  {tabs.map((tab) => (
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
              </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMobileMenu && (
              <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setShowMobileMenu(false)}>
                <div className="absolute top-0 left-0 right-0 bg-white rounded-b-2xl shadow-2xl p-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                    <h3 className="font-bold text-[#0B1F33]">Navigation</h3>
                    <button onClick={() => setShowMobileMenu(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer">
                      <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id);
                          setShowMobileMenu(false);
                        }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl font-semibold text-sm cursor-pointer transition-all relative ${
                          activeTab === tab.id
                            ? 'bg-[#0B1F33] text-white'
                            : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                        }`}
                      >
                        <i className={`${tab.icon} text-2xl`}></i>
                        <span className="text-xs text-center leading-tight">{tab.label}</span>
                        {tab.badge && (
                          <span className="absolute top-2 right-2 w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content */}
            <div key={refreshKey} className="flex-1 min-w-0">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <EarningsDashboard />
                  <AIInsights onNavigate={(tab) => setActiveTab(tab)} />
                </div>
              )}
              {activeTab === 'marketplace' && (
                <JobMarketplace />
              )}
              {activeTab === 'schedule' && <CalendarView />}
              {activeTab === 'jobs' && <ActiveEmporvaJobs />}
              {activeTab === 'pipeline' && <PipelineView />}
              {activeTab === 'quotes' && <QuotesHub />}
              {activeTab === 'crm' && <CRMContacts />}
              {activeTab === 'communication' && <CommunicationHub />}
              {activeTab === 'automation' && <AutomationHub />}
              {activeTab === 'marketing' && <MarketingCampaigns />}
              {activeTab === 'social' && <SocialContentHub />}
              {activeTab === 'reviews' && <ReviewsReputation />}
              {activeTab === 'analytics' && <BusinessAnalytics />}
              {activeTab === 'import' && <LeadImport />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
