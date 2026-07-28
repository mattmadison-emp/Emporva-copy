

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AppNav from '../../components/layout/AppNav';
import PropertyOverview from '../homeowner-dashboard-core/components/PropertyOverview';
import SeasonalMaintenance from '../homeowner-dashboard-core/components/SeasonalMaintenance';
import SystemRegistry from '../homeowner-dashboard-core/components/SystemRegistry';
import TaskBoard from '../homeowner-dashboard-core/components/TaskBoard';
// Active Projects tab restored as DIY-only (contractor/Emporva jobs hidden for now).
import ActiveJobs from '../homeowner-dashboard-core/components/ActiveJobs';
// PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
// import MessagesTab from '../homeowner-dashboard-core/components/MessagesTab';
// import PostedJobsTab from '../homeowner-dashboard-core/components/PostedJobsTab';
import RenovationVisualization from './components/RenovationVisualization';
import SmartIntakeCard from '../../components/feature/SmartIntakeCard';
import PropertyMemory from '../homeowner-dashboard/components/PropertyMemory';
// PHASE_1_GTM: contractor invoices/payments paused — restore for Phase 2
// import PaymentHistoryTab from '../homeowner-dashboard-core/components/PaymentHistoryTab';

// PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
// import JobPostingModal, { JobPostingData } from '../../components/feature/JobPostingModal';
import HomeValuation from './components/HomeValuation';
import UtilityInsights from '../homeowner-dashboard/components/UtilityInsights';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../../components/base/PullToRefreshIndicator';

export default function HomeownerDashboardPremium() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  // PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
  // const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshKey(k => k + 1);
  }, []);

  const { isRefreshing, isPulling, pullDistance, pullProgress, shouldTriggerRefresh } =
    usePullToRefresh({ onRefresh: handleRefresh });

  // PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
  // const handleJobSubmit = (jobData: JobPostingData) => {
  //   console.log('Job submitted:', jobData);
  //   setActiveTab('posted-jobs');
  //   setShowMobileMenu(false);
  // };

  const tabs: { id: string; label: string; icon: string; badge?: number }[] = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'home-value', label: 'Home Value', icon: 'ri-line-chart-line' },
    { id: 'renovation', label: 'Renovation Inspiration', icon: 'ri-magic-line' },
    { id: 'memory', label: 'Property Memory', icon: 'ri-history-line' },
    { id: 'utility-insights', label: 'Utility Insights', icon: 'ri-line-chart-line' },
    { id: 'seasonal', label: 'Seasonal Tasks', icon: 'ri-calendar-check-line' },
    { id: 'systems', label: 'Systems Profile', icon: 'ri-home-gear-line' },
    { id: 'tasks', label: 'Task Board', icon: 'ri-task-line' },
    { id: 'jobs', label: 'Active Projects', icon: 'ri-briefcase-line' },
    // PHASE_1_GTM: contractor marketplace tabs paused — restore for Phase 2
    // { id: 'messages', label: 'Messages', icon: 'ri-message-3-line' },
    // { id: 'posted-jobs', label: 'Posted Jobs', icon: 'ri-megaphone-line' },
    // { id: 'payments', label: 'Payment History', icon: 'ri-secure-payment-line' },
  ];

  useDocumentTitle(`${tabs.find(t => t.id === activeTab)?.label ?? 'Dashboard'} | Emporva Dashboard`);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setShowMobileMenu(false);
  };

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

      <div className="pt-20 sm:pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0B1F33] mb-1 sm:mb-2">
                  Property Command Center
                </h1>
                <p className="text-sm sm:text-base lg:text-lg text-[#6B7C8F]">
                  Your complete home intelligence platform
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                {/* PHASE_1_GTM: contractor marketplace paused — restore Post a Job button for Phase 2
                <button
                  onClick={() => setShowJobPostingModal(true)}
                  className="flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
                >
                  <i className="ri-add-line text-lg sm:text-xl"></i>
                  <span className="hidden xs:inline">Post a Job</span>
                  <span className="xs:hidden">Post Job</span>
                </button>
                */}
                <div className="flex items-center gap-2 sm:gap-3 bg-gradient-to-r from-[#D4B483] to-[#c4a473] px-3 sm:px-4 py-2 rounded-lg">
                  <i className="ri-vip-crown-line text-[#0B1F33] text-lg sm:text-xl"></i>
                  <span className="font-bold text-[#0B1F33] text-xs sm:text-sm">Premium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Premium Plan Summary */}
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl px-4 sm:px-6 py-3 sm:py-4 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#D4B483]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className="ri-shield-check-line text-[#D4B483] text-lg sm:text-xl"></i>
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base text-white">All Premium Features Unlocked</p>
                  <p className="text-xs sm:text-sm text-white">
                    Full access to AI diagnostics, renovation inspiration, predictive timeline, property analytics &amp; more
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-gray-200 mb-4 sm:mb-6"></div>

          {/* Mobile Tab Selector */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <i className={`${tabs.find(t => t.id === activeTab)?.icon} text-xl text-[#0B1F33]`}></i>
                <span className="font-semibold text-[#0B1F33] text-sm sm:text-base">
                  {tabs.find(t => t.id === activeTab)?.label}
                </span>
                {tabs.find(t => t.id === activeTab)?.badge && (
                  <span className="w-5 h-5 bg-teal-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {tabs.find(t => t.id === activeTab)?.badge}
                  </span>
                )}
              </div>
              <i className={`ri-arrow-${showMobileMenu ? 'up' : 'down'}-s-line text-xl text-[#6B7C8F]`}></i>
            </button>

            {/* Mobile Dropdown Menu */}
            {showMobileMenu && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2 max-h-[60vh] overflow-y-auto">
                <div className="flex flex-col gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all relative text-left ${
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
            )}
          </div>

          {/* Sidebar + Content Layout */}
          <div className="flex gap-6">
            {/* Left Sidebar Tabs - Desktop Only */}
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

            {/* Tab Content */}
            <div key={refreshKey} className="flex-1 min-w-0">
              {activeTab === 'overview' && (
                <>
                  <SmartIntakeCard />
                  <PropertyOverview isCore={false} />
                </>
              )}
              {activeTab === 'home-value' && <HomeValuation />}
              {activeTab === 'renovation' && <RenovationVisualization />}
              {activeTab === 'utility-insights' && <UtilityInsights />}
              {activeTab === 'memory' && <PropertyMemory />}
              {activeTab === 'seasonal' && <SeasonalMaintenance />}
              {activeTab === 'systems' && <SystemRegistry />}
              {activeTab === 'tasks' && <TaskBoard />}
              {activeTab === 'jobs' && <ActiveJobs showDIY diyOnly />}
              {/* PHASE_1_GTM: contractor marketplace tabs paused — restore for Phase 2
              {activeTab === 'messages' && <MessagesTab />}
              {activeTab === 'posted-jobs' && <PostedJobsTab />}
              {activeTab === 'payments' && <PaymentHistoryTab />}
              */}
            </div>
          </div>
        </div>
      </div>

      {/* PHASE_1_GTM: contractor marketplace paused — restore JobPostingModal for Phase 2
      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => setShowJobPostingModal(false)}
        userType="homeowner"
        onSubmit={handleJobSubmit}
      />
      */}
    </div>
  );
}
