import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AppNav from '../../components/layout/AppNav';
import PropertyOverview from './components/PropertyOverview';
import ActiveJobs from './components/ActiveJobs';
import SmartIntakeCard from '../../components/feature/SmartIntakeCard';
import CoreUpgrade from './components/CoreUpgrade';
// PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
// import MessagesTab from './components/MessagesTab';
// import PostedJobsTab from './components/PostedJobsTab';
import SystemRegistry from './components/SystemRegistry';
import SeasonalMaintenance from './components/SeasonalMaintenance';
import TaskBoard from './components/TaskBoard';
import PremiumUpsellCards from './components/PremiumUpsellCards';
// PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
// import JobPostingModal from '../../components/feature/JobPostingModal';
// import { JobPostingData } from '../../components/feature/JobPostingModal';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../../components/base/PullToRefreshIndicator';

export default function HomeownerDashboardCore() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'overview');
  // PHASE_1_GTM: contractor marketplace UI paused — restore for Phase 2
  // const [showJobPostingModal, setShowJobPostingModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Respond to URL changes after mount (e.g. arriving from a Messages job link).
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
  // const handleJobPost = (jobData: JobPostingData) => {
  //   console.log('Job posted:', jobData);
  //   setShowJobPostingModal(false);
  // };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'systems', label: 'Systems Profile', icon: 'ri-home-gear-line' },
    { id: 'seasonal', label: 'Seasonal Tasks', icon: 'ri-calendar-check-line' },
    { id: 'tasks', label: 'Task Board', icon: 'ri-task-line' },
    { id: 'active-projects', label: 'Active Projects', icon: 'ri-briefcase-line' },
    // PHASE_1_GTM: contractor marketplace tabs paused — restore for Phase 2
    // { id: 'messages', label: 'Messages', icon: 'ri-message-3-line' },
    // { id: 'posted-jobs', label: 'Posted Jobs', icon: 'ri-megaphone-line' },
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
                  Manage your home profile, tasks, and maintenance schedule
                </p>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="bg-white px-3 sm:px-4 py-2 rounded-lg border border-gray-200">
                  <span className="text-xs sm:text-sm font-semibold text-[#6B7C8F]">Core Plan</span>
                </div>
                {/* PHASE_1_GTM: contractor marketplace paused — restore Post a Job button for Phase 2
                <button
                  onClick={() => setShowJobPostingModal(true)}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-[#14B8A6] text-white rounded-lg text-sm sm:text-base font-semibold hover:bg-[#0ea89a] transition-all shadow-sm cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-add-line mr-1 sm:mr-2"></i>
                  <span className="hidden xs:inline">Post a Job</span>
                  <span className="xs:hidden">Post Job</span>
                </button>
                */}
              </div>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="mb-4 sm:mb-6 bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-4 sm:p-6 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2 text-white">Upgrade to Premium</h3>
                <p className="text-sm sm:text-base text-white mb-0">
                  Unlock home valuation, property analytics, renovation inspiration, DIY projects with AI planning, and more
                </p>
              </div>
              <a
                href="/homeowner-plans"
                className="bg-[#D4B483] text-[#0B1F33] px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:bg-[#c4a473] transition-all whitespace-nowrap cursor-pointer text-center"
              >
                View Premium Features
              </a>
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
                <span className="font-semibold text-[#0B1F33]">
                  {tabs.find(t => t.id === activeTab)?.label}
                </span>
              </div>
              <i className={`ri-arrow-${showMobileMenu ? 'up' : 'down'}-s-line text-xl text-[#6B7C8F]`}></i>
            </button>

            {/* Mobile Dropdown Menu */}
            {showMobileMenu && (
              <div className="mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-2">
                <div className="flex flex-col gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all text-left ${
                        activeTab === tab.id
                          ? 'bg-[#0B1F33] text-white'
                          : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                      {tab.label}
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all text-left ${
                        activeTab === tab.id
                          ? 'bg-[#0B1F33] text-white'
                          : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                      {tab.label}
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
                  <PropertyOverview isCore={true} />
                  <div className="mt-6">
                    <CoreUpgrade />
                  </div>
                  <div className="mt-6">
                    <PremiumUpsellCards />
                  </div>
                </>
              )}
              {activeTab === 'systems' && <SystemRegistry />}
              {activeTab === 'seasonal' && <SeasonalMaintenance />}
              {activeTab === 'tasks' && <TaskBoard />}
              {activeTab === 'active-projects' && <ActiveJobs showDIY={true} diyOnly={true} />}
              {/* PHASE_1_GTM: contractor marketplace tabs paused — restore for Phase 2
              {activeTab === 'messages' && <MessagesTab />}
              {activeTab === 'posted-jobs' && <PostedJobsTab />}
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
        onSubmit={handleJobPost}
      />
      */}
    </div>
  );
}
