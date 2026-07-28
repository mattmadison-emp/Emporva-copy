import { useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AppNav from '../../components/layout/AppNav';
import PortfolioAnalytics from './components/PortfolioAnalytics';
import PredictiveTimeline from './components/PredictiveTimeline';
import AutomatedMaintenance from './components/AutomatedMaintenance';
import PropertyMemory from './components/PropertyMemory';
import UtilityInsights from './components/UtilityInsights';
import PortfolioOverview from '../multi-unit-dashboard-core/components/PortfolioOverview';
import PropertiesView from '../multi-unit-dashboard-core/components/PropertiesView';
import UnitsView from '../multi-unit-dashboard-core/components/UnitsView';
import CurrentJobs from '../multi-unit-dashboard-core/components/CurrentJobs';
import PreventiveMaintenance from '../multi-unit-dashboard-core/components/PreventiveMaintenance';
import Documents from '../multi-unit-dashboard-core/components/Documents';
import JobPostingModal, { JobPostingData } from '../../components/feature/JobPostingModal';
import PostedJobsView from '../../components/feature/PostedJobsView';

export default function MultiUnitDashboardPremium() {
  const [activeTab, setActiveTab] = useState('overview');
  const [showJobPostingModal, setShowJobPostingModal] = useState(false);

  const handleJobSubmit = (jobData: JobPostingData) => {
    console.log('Job submitted:', jobData);
    // Handle job posting logic
    setActiveTab('posted-jobs');
  };

  const tabs = [
    { id: 'overview', label: 'Portfolio Overview', icon: 'ri-dashboard-line' },
    { id: 'properties', label: 'Properties', icon: 'ri-building-line' },
    { id: 'units', label: 'Units', icon: 'ri-home-4-line' },
    { id: 'jobs', label: 'Current Jobs', icon: 'ri-briefcase-line' },
    { id: 'posted-jobs', label: 'Posted Jobs', icon: 'ri-file-list-3-line', badge: 3 },
    { id: 'maintenance', label: 'Preventive Maintenance', icon: 'ri-calendar-check-line' },
    { id: 'documents', label: 'Documents', icon: 'ri-folder-line' },
    { id: 'memory', label: 'Property Memory', icon: 'ri-history-line', premium: true },
    { id: 'utilities', label: 'Utility Insights', icon: 'ri-lightbulb-flash-line', premium: true },
    { id: 'analytics', label: 'Portfolio Analytics', icon: 'ri-line-chart-line', premium: true },
    { id: 'timeline', label: 'Predictive Timeline', icon: 'ri-time-line', premium: true },
    { id: 'automated', label: 'Automated Maintenance', icon: 'ri-robot-line', premium: true }
  ];

  useDocumentTitle(`${tabs.find(t => t.id === activeTab)?.label ?? 'Dashboard'} | Property Dashboard`);

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <AppNav />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-[#0B1F33]">
                    Portfolio Command Center
                  </h1>
                  <span className="px-3 py-1 bg-[#D4B483] text-[#0B1F33] rounded-full text-sm font-semibold whitespace-nowrap">
                    Premium
                  </span>
                </div>
                <p className="text-lg text-[#6B7C8F]">
                  Complete portfolio management with advanced analytics and automation
                </p>
              </div>
              <button
                onClick={() => setShowJobPostingModal(true)}
                className="flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap shadow-lg"
              >
                <i className="ri-add-line text-xl"></i>
                Get Bids from Contractors
              </button>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t border-gray-200 mb-6"></div>

          {/* Sidebar + Content Layout */}
          <div className="flex gap-6">
            {/* Left Sidebar Tabs */}
            <div className="w-56 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2 sticky top-28">
                <div className="flex flex-col gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all relative text-left ${
                        activeTab === tab.id
                          ? 'bg-[#D4B483] text-[#0B1F33]'
                          : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                      {tab.label}
                      {tab.premium && (
                        <i className="ri-vip-crown-fill text-[#D4B483] text-xs ml-auto"></i>
                      )}
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
            <div className="flex-1 min-w-0">
              {activeTab === 'overview' && <PortfolioOverview />}
              {activeTab === 'properties' && <PropertiesView />}
              {activeTab === 'units' && <UnitsView />}
              {activeTab === 'jobs' && <CurrentJobs />}
              {activeTab === 'posted-jobs' && <PostedJobsView userType="multi-unit" />}
              {activeTab === 'maintenance' && <PreventiveMaintenance />}
              {activeTab === 'documents' && <Documents />}
              {activeTab === 'memory' && <PropertyMemory />}
              {activeTab === 'utilities' && <UtilityInsights />}
              {activeTab === 'analytics' && <PortfolioAnalytics />}
              {activeTab === 'timeline' && <PredictiveTimeline />}
              {activeTab === 'automated' && <AutomatedMaintenance />}
            </div>
          </div>
        </div>
      </div>

      {/* Job Posting Modal */}
      <JobPostingModal
        isOpen={showJobPostingModal}
        onClose={() => setShowJobPostingModal(false)}
        userType="multi-unit"
        onSubmit={handleJobSubmit}
      />
    </div>
  );
}
