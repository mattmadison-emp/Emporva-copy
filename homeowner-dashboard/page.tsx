import { useState } from 'react';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import AppNav from '../../components/layout/AppNav';
import PropertyOverview from './components/PropertyOverview';
import SeasonalMaintenance from './components/SeasonalMaintenance';
import SystemRegistry from './components/SystemRegistry';
import TaskBoard from './components/TaskBoard';
import UtilitiesTracker from './components/UtilitiesTracker';
import RiskForecasting from './components/RiskForecasting';
import EmergencyProtocol from './components/EmergencyProtocol';
import PremiumUpgrade from './components/PremiumUpgrade';
import ActiveJobs from './components/ActiveJobs';
import PaymentHistory from './components/PaymentHistory';
import InvoicesReceived from './components/InvoicesReceived';
import RenovationPreview from './components/RenovationPreview';
import PropertyMemory from './components/PropertyMemory';
import UtilityInsights from './components/UtilityInsights';
import DIYProjectsTeaser from './components/DIYProjectsTeaser';

export default function HomeownerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'ri-dashboard-line' },
    { id: 'jobs', label: 'Current Emporva Jobs', icon: 'ri-briefcase-line' },
    { id: 'invoices', label: 'Invoices', icon: 'ri-file-text-line', badge: 2 },
    { id: 'payments', label: 'Payment History', icon: 'ri-secure-payment-line' },
    { id: 'diy', label: 'DIY Projects', icon: 'ri-tools-line', premium: true },
    { id: 'renovation', label: 'Renovation Preview', icon: 'ri-magic-line', premium: true },
    { id: 'memory', label: 'Property Memory', icon: 'ri-history-line', premium: true },
    { id: 'utility-insights', label: 'Utility Insights', icon: 'ri-line-chart-line', premium: true },
    { id: 'seasonal', label: 'Seasonal Tasks', icon: 'ri-calendar-check-line' },
    { id: 'systems', label: 'Systems & Appliances', icon: 'ri-tools-fill' },
    { id: 'tasks', label: 'Task Board', icon: 'ri-task-line' },
    { id: 'utilities', label: 'Utilities', icon: 'ri-flashlight-line' },
    { id: 'risks', label: 'Risk Alerts', icon: 'ri-alert-line' },
    { id: 'emergency', label: 'Emergency Protocols', icon: 'ri-first-aid-kit-line' },
    { id: 'premium', label: 'Upgrade to Premium', icon: 'ri-vip-crown-line' }
  ];

  useDocumentTitle(`${tabs.find(t => t.id === activeTab)?.label ?? 'Dashboard'} | Emporva Dashboard`);

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <AppNav />
      
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-[#0B1F33] mb-2">
              Property Command Center
            </h1>
            <p className="text-lg text-[#6B7C8F]">
              Clarity before crisis. Anticipate, don't react.
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
                          ? tab.id === 'premium'
                            ? 'bg-[#D4B483] text-[#0B1F33]'
                            : tab.premium
                            ? 'bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] text-white'
                            : 'bg-[#0B1F33] text-white'
                          : 'text-[#6B7C8F] hover:bg-[#F9F9FB]'
                      }`}
                    >
                      <i className={`${tab.icon} text-lg`}></i>
                      {tab.label}
                      {tab.premium && (
                        <i className="ri-vip-crown-fill text-[#D4B483] text-xs ml-auto"></i>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-w-0">
              {activeTab === 'overview' && <PropertyOverview />}
              {activeTab === 'jobs' && <ActiveJobs />}
              {activeTab === 'invoices' && <InvoicesReceived />}
              {activeTab === 'payments' && <PaymentHistory />}
              {activeTab === 'diy' && <DIYProjectsTeaser />}
              {activeTab === 'renovation' && <RenovationPreview />}
              {activeTab === 'memory' && <PropertyMemory />}
              {activeTab === 'utility-insights' && <UtilityInsights />}
              {activeTab === 'seasonal' && <SeasonalMaintenance />}
              {activeTab === 'systems' && <SystemRegistry />}
              {activeTab === 'tasks' && <TaskBoard />}
              {activeTab === 'utilities' && <UtilitiesTracker />}
              {activeTab === 'risks' && <RiskForecasting />}
              {activeTab === 'emergency' && <EmergencyProtocol />}
              {activeTab === 'premium' && <PremiumUpgrade />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
