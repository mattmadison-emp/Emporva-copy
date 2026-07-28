
import { useState, useCallback } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AppNav from '../../components/layout/AppNav';
import PortfolioOverview from './components/PortfolioOverview';
import PropertiesView from './components/PropertiesView';
import UnitsView from './components/UnitsView';
import CurrentJobs from './components/CurrentJobs';
import PreventiveMaintenance from './components/PreventiveMaintenance';
import Documents from './components/Documents';
import PremiumUpgrade from './components/PremiumUpgrade';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../../components/base/PullToRefreshIndicator';

export default function MultiUnitDashboardCore() {
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(async () => {
    await new Promise(resolve => setTimeout(resolve, 1200));
    setRefreshKey(k => k + 1);
  }, []);

  const { isRefreshing, isPulling, pullDistance, pullProgress, shouldTriggerRefresh } =
    usePullToRefresh({ onRefresh: handleRefresh });

  const tabs = [
    { id: 'overview', label: 'Portfolio Overview', icon: 'ri-dashboard-line' },
    { id: 'properties', label: 'Properties', icon: 'ri-building-line' },
    { id: 'units', label: 'Units', icon: 'ri-home-4-line' },
    { id: 'jobs', label: 'Current Jobs', icon: 'ri-briefcase-line' },
    { id: 'maintenance', label: 'Preventive Maintenance', icon: 'ri-calendar-check-line' },
    { id: 'documents', label: 'Documents', icon: 'ri-folder-line' },
    { id: 'upgrade', label: 'Upgrade to Premium', icon: 'ri-vip-crown-line' }
  ];

  useDocumentTitle(`${tabs.find(t => t.id === activeTab)?.label ?? 'Dashboard'} | Property Dashboard`);

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
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0B1F33] mb-2">
              Portfolio Command Center
            </h1>
            <p className="text-lg text-[#6B7C8F]">
              Manage multiple properties with clarity and coordination
            </p>
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
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all text-left ${
                        activeTab === tab.id
                          ? tab.id === 'upgrade'
                            ? 'bg-[#D4B483] text-[#0B1F33]'
                            : 'bg-[#0B1F33] text-white'
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
              {activeTab === 'overview' && <PortfolioOverview />}
              {activeTab === 'properties' && <PropertiesView />}
              {activeTab === 'units' && <UnitsView />}
              {activeTab === 'jobs' && <CurrentJobs />}
              {activeTab === 'maintenance' && <PreventiveMaintenance />}
              {activeTab === 'documents' && <Documents />}
              {activeTab === 'upgrade' && <PremiumUpgrade />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
