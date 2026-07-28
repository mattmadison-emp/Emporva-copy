import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import NewCampaignModal from './NewCampaignModal';

interface Recipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'pending' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed';
  openedAt?: string;
  clickedAt?: string;
  sentAt: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'post-job' | 'seasonal' | 'maintenance' | 'referral';
  status: 'active' | 'paused' | 'draft' | 'completed';
  sent: number;
  opened: number;
  clicked: number;
  channel: 'email' | 'sms' | 'both';
  subject?: string;
  previewText?: string;
  body?: string;
  createdAt: string;
  lastSentAt: string;
  nextSendAt?: string;
  recipients: Recipient[];
  dailyStats: { date: string; sent: number; opened: number; clicked: number }[];
}

const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatShortDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const mapDbCampaign = (row: any): Campaign => ({
  id: row.id,
  name: row.name,
  type: row.type,
  status: row.status,
  sent: row.total_sent ?? 0,
  opened: row.total_opened ?? 0,
  clicked: row.total_clicked ?? 0,
  channel: row.channel,
  subject: row.subject ?? undefined,
  previewText: row.preview_text ?? undefined,
  body: row.body ?? undefined,
  createdAt: formatDate(row.created_at),
  lastSentAt: formatDate(row.last_sent_at),
  nextSendAt: row.next_send_at ? formatDate(row.next_send_at) : undefined,
  recipients: [],
  dailyStats: [],
});

const mapDbRecipient = (row: any): Recipient => ({
  id: row.id,
  name: row.name ?? 'Unknown',
  email: row.email ?? '',
  phone: row.phone ?? undefined,
  status: row.status ?? 'pending',
  sentAt: formatShortDate(row.sent_at) || formatShortDate(row.created_at) || '',
  openedAt: row.opened_at ? formatShortDate(row.opened_at) : undefined,
  clickedAt: row.clicked_at ? formatShortDate(row.clicked_at) : undefined,
});

const getCampaignTypeColor = (type: string) => {
  switch (type) {
    case 'post-job': return 'bg-emerald-100 text-emerald-700';
    case 'seasonal': return 'bg-green-100 text-green-700';
    case 'maintenance': return 'bg-amber-100 text-amber-700';
    case 'referral': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getOpenRate = (campaign: Campaign) => {
  return campaign.sent > 0 ? Math.round((campaign.opened / campaign.sent) * 100) : 0;
};

const getClickRate = (campaign: Campaign) => {
  return campaign.opened > 0 ? Math.round((campaign.clicked / campaign.opened) * 100) : 0;
};

const getRecipientStatusConfig = (status: string) => {
  switch (status) {
    case 'clicked': return { icon: 'ri-cursor-line', color: 'text-teal-600', bg: 'bg-teal-50', label: 'Clicked' };
    case 'opened': return { icon: 'ri-mail-open-line', color: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Opened' };
    case 'delivered': return { icon: 'ri-mail-check-line', color: 'text-gray-500', bg: 'bg-gray-50', label: 'Delivered' };
    case 'pending': return { icon: 'ri-time-line', color: 'text-blue-500', bg: 'bg-blue-50', label: 'Pending' };
    case 'bounced': return { icon: 'ri-error-warning-line', color: 'text-red-500', bg: 'bg-red-50', label: 'Bounced' };
    case 'unsubscribed': return { icon: 'ri-user-unfollow-line', color: 'text-orange-500', bg: 'bg-orange-50', label: 'Unsubscribed' };
    default: return { icon: 'ri-mail-line', color: 'text-gray-400', bg: 'bg-gray-50', label: status };
  }
};

export default function MarketingCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [loadingRecipients, setLoadingRecipients] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'recipients' | 'preview'>('overview');
  const [recipientFilter, setRecipientFilter] = useState<'all' | 'clicked' | 'opened' | 'delivered' | 'bounced'>('all');
  const [toast, setToast] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [businessName, setBusinessName] = useState('Your Business');

  useEffect(() => {
    if (!user) return;
    supabase.from('contractor_profiles').select('business_name').eq('user_id', user.id).single()
      .then(({ data }) => { if (data?.business_name) setBusinessName(data.business_name); });
  }, [user]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchCampaigns = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching campaigns:', error);
        return;
      }

      const mapped = (data || []).map(mapDbCampaign);
      setCampaigns(mapped);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const fetchRecipients = useCallback(async (campaignId: string): Promise<Recipient[]> => {
    const { data, error } = await supabase
      .from('campaign_recipients')
      .select('*')
      .eq('campaign_id', campaignId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recipients:', error);
      return [];
    }

    return (data || []).map(mapDbRecipient);
  }, []);

  const toggleCampaignStatus = async (id: string) => {
    const campaign = campaigns.find(c => c.id === id);
    if (!campaign) return;

    const newStatus = campaign.status === 'active' ? 'paused' : 'active';

    const { error } = await supabase
      .from('marketing_campaigns')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating campaign status:', error);
      showToast('Failed to update campaign status');
      return;
    }

    setCampaigns(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, status: newStatus as Campaign['status'] };
        if (selectedCampaign?.id === id) {
          setSelectedCampaign(updated);
        }
        return updated;
      }
      return c;
    }));
    showToast(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`);
  };

  const duplicateCampaign = async (campaign: Campaign) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        user_id: user.id,
        name: `${campaign.name} (Copy)`,
        type: campaign.type,
        status: 'draft',
        channel: campaign.channel,
        subject: campaign.subject || null,
        preview_text: campaign.previewText || null,
        body: campaign.body || null,
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
      })
      .select()
      .single();

    if (error) {
      console.error('Error duplicating campaign:', error);
      showToast('Failed to duplicate campaign');
      return;
    }

    if (data) {
      const newCampaign = mapDbCampaign(data);
      setCampaigns(prev => [newCampaign, ...prev]);
      showToast('Campaign duplicated as draft');
    }
    setMenuOpenId(null);
  };

  const handleNewCampaignSave = async (campaignData: { name: string; type: string; channel: string; subject: string; messageBody: string; scheduleType: string; scheduledDate: string; scheduledTime: string; triggerEvent: string; repeatEnabled: boolean; repeatFrequency: string; audienceType: string; manualRecipients: string[] }) => {
    if (!user) return;

    const now = new Date().toISOString();
    const isImmediate = campaignData.scheduleType === 'now';

    let nextSendAt: string | null = null;
    if (campaignData.scheduleType === 'scheduled' && campaignData.scheduledDate && campaignData.scheduledTime) {
      nextSendAt = new Date(`${campaignData.scheduledDate}T${campaignData.scheduledTime}`).toISOString();
    }

    const { data, error } = await supabase
      .from('marketing_campaigns')
      .insert({
        user_id: user.id,
        name: campaignData.name,
        type: campaignData.type,
        status: isImmediate ? 'active' : 'draft',
        channel: campaignData.channel,
        subject: campaignData.subject || null,
        preview_text: campaignData.messageBody || null,
        body: campaignData.messageBody || null,
        total_sent: 0,
        total_opened: 0,
        total_clicked: 0,
        last_sent_at: isImmediate ? now : null,
        next_send_at: nextSendAt,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating campaign:', error);
      showToast('Failed to create campaign');
      return;
    }

    if (data) {
      const newCampaign = mapDbCampaign(data);
      setCampaigns(prev => [newCampaign, ...prev]);
      setShowNewCampaign(false);
      showToast(`Campaign "${campaignData.name}" created successfully`);
    }
  };

  const openDetail = async (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setDetailTab('overview');
    setRecipientFilter('all');

    // Fetch recipients for this campaign
    setLoadingRecipients(true);
    const recipients = await fetchRecipients(campaign.id);
    const updatedCampaign = { ...campaign, recipients };
    setSelectedCampaign(updatedCampaign);
    // Also update the campaign in the list so recipients are cached
    setCampaigns(prev => prev.map(c => c.id === campaign.id ? updatedCampaign : c));
    setLoadingRecipients(false);
  };

  const filteredRecipients = selectedCampaign?.recipients.filter(r =>
    recipientFilter === 'all' || r.status === recipientFilter
  ) || [];

  const maxDailySent = selectedCampaign && selectedCampaign.dailyStats.length > 0
    ? Math.max(...selectedCampaign.dailyStats.map(d => d.sent), 1)
    : 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[70] animate-slide-in">
          <div className="bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-white text-lg"></i>
            </div>
            <span className="text-sm font-semibold">{toast}</span>
          </div>
        </div>
      )}

      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]">Marketing Campaigns</h2>
            <p className="text-sm text-[#6B7C8F] mt-1">Simple lifecycle-based campaigns</p>
          </div>
          <button
            onClick={() => setShowNewCampaign(true)}
            className="bg-[#0B1F33] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all whitespace-nowrap cursor-pointer"
          >
            <i className="ri-add-line mr-2"></i>
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="p-6 border-b border-gray-100 bg-[#F9F9FB]">
        <div className="grid grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Active Campaigns</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {campaigns.filter(c => c.status === 'active').length}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Total Sent (30d)</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {campaigns.reduce((sum, c) => sum + c.sent, 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Avg Open Rate</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + getOpenRate(c), 0) / campaigns.length) : 0}%
            </p>
          </div>
          <div>
            <p className="text-xs text-[#6B7C8F] mb-1">Avg Click Rate</p>
            <p className="text-2xl font-bold text-[#0B1F33]">
              {campaigns.length > 0 ? Math.round(campaigns.reduce((sum, c) => sum + getClickRate(c), 0) / campaigns.length) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      <div className="p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-3 border-[#0B1F33] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-[#6B7C8F]">Loading campaigns...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 bg-[#F9F9FB] rounded-full flex items-center justify-center mb-4">
              <i className="ri-mail-send-line text-[#6B7C8F] text-3xl"></i>
            </div>
            <h3 className="text-lg font-bold text-[#0B1F33] mb-2">No campaigns yet</h3>
            <p className="text-sm text-[#6B7C8F] mb-6 text-center max-w-sm">
              Create your first marketing campaign to start engaging with your clients through email and SMS.
            </p>
            <button
              onClick={() => setShowNewCampaign(true)}
              className="bg-[#0B1F33] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer"
            >
              <i className="ri-add-line mr-2"></i>
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="border-2 border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-[#0B1F33]">{campaign.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getCampaignTypeColor(campaign.type)}`}>
                        {campaign.type.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        campaign.channel === 'email' ? 'bg-amber-50 text-amber-700' :
                        campaign.channel === 'sms' ? 'bg-green-100 text-green-700' :
                        'bg-teal-50 text-teal-700'
                      }`}>
                        {campaign.channel === 'both' ? 'Email + SMS' : campaign.channel.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 relative">
                    <button
                      onClick={() => openDetail(campaign)}
                      className="text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
                      title="Edit campaign"
                    >
                      <i className="ri-edit-line text-lg"></i>
                    </button>
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === campaign.id ? null : campaign.id)}
                      className="text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
                    >
                      <i className="ri-more-2-fill text-lg"></i>
                    </button>
                    {menuOpenId === campaign.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setMenuOpenId(null)} />
                        <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-gray-100 py-2 w-48 z-50">
                          <button
                            onClick={() => { toggleCampaignStatus(campaign.id); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] cursor-pointer"
                          >
                            <i className={`${campaign.status === 'active' ? 'ri-pause-circle-line' : 'ri-play-circle-line'} text-lg`}></i>
                            {campaign.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                          </button>
                          <button
                            onClick={() => duplicateCampaign(campaign)}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] cursor-pointer"
                          >
                            <i className="ri-file-copy-line text-lg"></i>
                            Duplicate
                          </button>
                          <button
                            onClick={() => { openDetail(campaign); setMenuOpenId(null); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#0B1F33] hover:bg-[#F9F9FB] cursor-pointer"
                          >
                            <i className="ri-bar-chart-box-line text-lg"></i>
                            View Analytics
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Campaign Metrics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-[#F9F9FB] rounded-lg p-3">
                    <p className="text-xs text-[#6B7C8F] mb-1">Sent</p>
                    <p className="text-xl font-bold text-[#0B1F33]">{campaign.sent}</p>
                  </div>
                  <div className="bg-[#F9F9FB] rounded-lg p-3">
                    <p className="text-xs text-[#6B7C8F] mb-1">Opened</p>
                    <p className="text-xl font-bold text-[#0B1F33]">{campaign.opened}</p>
                    <p className="text-xs text-green-600 font-semibold">{getOpenRate(campaign)}%</p>
                  </div>
                  <div className="bg-[#F9F9FB] rounded-lg p-3">
                    <p className="text-xs text-[#6B7C8F] mb-1">Clicked</p>
                    <p className="text-xl font-bold text-[#0B1F33]">{campaign.clicked}</p>
                    <p className="text-xs text-teal-600 font-semibold">{getClickRate(campaign)}%</p>
                  </div>
                  <div className="bg-[#F9F9FB] rounded-lg p-3 flex items-center justify-center">
                    <button
                      onClick={() => openDetail(campaign)}
                      className="text-[#0B1F33] font-semibold text-sm hover:text-[#D4B483] cursor-pointer"
                    >
                      View Details <i className="ri-arrow-right-line ml-1"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campaign Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedCampaign(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeScaleIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    selectedCampaign.type === 'post-job' ? 'bg-emerald-100' :
                    selectedCampaign.type === 'seasonal' ? 'bg-green-100' :
                    selectedCampaign.type === 'maintenance' ? 'bg-amber-100' : 'bg-yellow-100'
                  }`}>
                    <i className={`text-2xl ${
                      selectedCampaign.type === 'post-job' ? 'ri-mail-send-line text-emerald-600' :
                      selectedCampaign.type === 'seasonal' ? 'ri-sun-line text-green-600' :
                      selectedCampaign.type === 'maintenance' ? 'ri-tools-line text-amber-600' : 'ri-gift-line text-yellow-600'
                    }`}></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {selectedCampaign.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getCampaignTypeColor(selectedCampaign.type)}`}>
                        {selectedCampaign.type.replace('-', ' ')}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedCampaign.status === 'active' ? 'bg-green-100 text-green-700' :
                        selectedCampaign.status === 'paused' ? 'bg-yellow-100 text-yellow-700' :
                        selectedCampaign.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {selectedCampaign.status}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        selectedCampaign.channel === 'email' ? 'bg-amber-50 text-amber-700' :
                        selectedCampaign.channel === 'sms' ? 'bg-green-100 text-green-700' :
                        'bg-teal-50 text-teal-700'
                      }`}>
                        {selectedCampaign.channel === 'both' ? 'Email + SMS' : selectedCampaign.channel}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-[#0B1F33] text-xl"></i>
                </button>
              </div>

              {/* Detail Tabs */}
              <div className="flex gap-1 mt-5 bg-[#F9F9FB] rounded-lg p-1">
                {([
                  { id: 'overview' as const, label: 'Overview', icon: 'ri-bar-chart-box-line' },
                  { id: 'recipients' as const, label: 'Recipients', icon: 'ri-group-line' },
                  { id: 'preview' as const, label: 'Message Preview', icon: 'ri-mail-line' },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDetailTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      detailTab === tab.id ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F] hover:text-[#0B1F33]'
                    }`}
                  >
                    <i className={`${tab.icon} text-sm`}></i>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Overview Tab */}
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="ri-send-plane-line text-white text-lg"></i>
                      </div>
                      <p className="text-2xl font-bold text-[#0B1F33]">{selectedCampaign.sent}</p>
                      <p className="text-xs text-[#6B7C8F]">Total Sent</p>
                    </div>
                    <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="ri-mail-open-line text-emerald-600 text-lg"></i>
                      </div>
                      <p className="text-2xl font-bold text-[#0B1F33]">{selectedCampaign.opened}</p>
                      <p className="text-xs text-[#6B7C8F]">Opened ({getOpenRate(selectedCampaign)}%)</p>
                    </div>
                    <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="ri-cursor-line text-teal-600 text-lg"></i>
                      </div>
                      <p className="text-2xl font-bold text-[#0B1F33]">{selectedCampaign.clicked}</p>
                      <p className="text-xs text-[#6B7C8F]">Clicked ({getClickRate(selectedCampaign)}%)</p>
                    </div>
                    <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                      <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-2">
                        <i className="ri-error-warning-line text-red-400 text-lg"></i>
                      </div>
                      <p className="text-2xl font-bold text-[#0B1F33]">
                        {selectedCampaign.recipients.filter(r => r.status === 'bounced').length}
                      </p>
                      <p className="text-xs text-[#6B7C8F]">Bounced</p>
                    </div>
                  </div>

                  {/* Performance Funnel */}
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
                      <i className="ri-filter-3-line text-[#6B7C8F]"></i>
                      Conversion Funnel
                    </h4>
                    <div className="space-y-2">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#6B7C8F]">Sent</span>
                          <span className="text-xs font-bold text-[#0B1F33]">{selectedCampaign.sent}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#0B1F33] rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#6B7C8F]">Opened</span>
                          <span className="text-xs font-bold text-emerald-600">{selectedCampaign.opened} ({getOpenRate(selectedCampaign)}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${getOpenRate(selectedCampaign)}%` }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#6B7C8F]">Clicked</span>
                          <span className="text-xs font-bold text-teal-600">{selectedCampaign.clicked} ({selectedCampaign.sent > 0 ? Math.round((selectedCampaign.clicked / selectedCampaign.sent) * 100) : 0}%)</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-teal-500 rounded-full transition-all" style={{ width: `${selectedCampaign.sent > 0 ? (selectedCampaign.clicked / selectedCampaign.sent) * 100 : 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 7-Day Activity Chart */}
                  {selectedCampaign.dailyStats.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
                        <i className="ri-line-chart-line text-[#6B7C8F]"></i>
                        7-Day Activity
                      </h4>
                      <div className="bg-[#F9F9FB] rounded-xl p-4">
                        <div className="flex items-end gap-2 h-32">
                          {selectedCampaign.dailyStats.map((day, idx) => (
                            <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                              <div className="w-full flex flex-col items-center gap-0.5" style={{ height: '100px' }}>
                                <div className="w-full flex items-end justify-center gap-0.5" style={{ height: '100%' }}>
                                  <div
                                    className="w-2.5 bg-[#0B1F33] rounded-t-sm transition-all"
                                    style={{ height: `${(day.sent / maxDailySent) * 100}%`, minHeight: '4px' }}
                                    title={`Sent: ${day.sent}`}
                                  ></div>
                                  <div
                                    className="w-2.5 bg-emerald-400 rounded-t-sm transition-all"
                                    style={{ height: `${(day.opened / maxDailySent) * 100}%`, minHeight: '4px' }}
                                    title={`Opened: ${day.opened}`}
                                  ></div>
                                  <div
                                    className="w-2.5 bg-teal-400 rounded-t-sm transition-all"
                                    style={{ height: `${(day.clicked / maxDailySent) * 100}%`, minHeight: '4px' }}
                                    title={`Clicked: ${day.clicked}`}
                                  ></div>
                                </div>
                              </div>
                              <span className="text-[9px] text-[#6B7C8F] whitespace-nowrap">{day.date}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-[#0B1F33] rounded-sm"></div>
                            <span className="text-[10px] text-[#6B7C8F]">Sent</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></div>
                            <span className="text-[10px] text-[#6B7C8F]">Opened</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-teal-400 rounded-sm"></div>
                            <span className="text-[10px] text-[#6B7C8F]">Clicked</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Campaign Info */}
                  <div>
                    <h4 className="text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
                      <i className="ri-information-line text-[#6B7C8F]"></i>
                      Campaign Details
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#F9F9FB] rounded-xl p-3">
                        <p className="text-[10px] text-[#6B7C8F] uppercase tracking-wide font-semibold mb-0.5">Created</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{selectedCampaign.createdAt}</p>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-3">
                        <p className="text-[10px] text-[#6B7C8F] uppercase tracking-wide font-semibold mb-0.5">Last Sent</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{selectedCampaign.lastSentAt}</p>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-3">
                        <p className="text-[10px] text-[#6B7C8F] uppercase tracking-wide font-semibold mb-0.5">Next Send</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{selectedCampaign.nextSendAt || 'N/A'}</p>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-3">
                        <p className="text-[10px] text-[#6B7C8F] uppercase tracking-wide font-semibold mb-0.5">Channel</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">
                          {selectedCampaign.channel === 'both' ? 'Email + SMS' : selectedCampaign.channel === 'email' ? 'Email' : 'SMS'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recipients Tab */}
              {detailTab === 'recipients' && (
                <div className="space-y-4">
                  {/* Recipient Filters */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {([
                      { id: 'all' as const, label: 'All', count: selectedCampaign.recipients.length },
                      { id: 'clicked' as const, label: 'Clicked', count: selectedCampaign.recipients.filter(r => r.status === 'clicked').length },
                      { id: 'opened' as const, label: 'Opened', count: selectedCampaign.recipients.filter(r => r.status === 'opened').length },
                      { id: 'delivered' as const, label: 'Delivered', count: selectedCampaign.recipients.filter(r => r.status === 'delivered').length },
                      { id: 'bounced' as const, label: 'Bounced', count: selectedCampaign.recipients.filter(r => r.status === 'bounced' || r.status === 'unsubscribed').length },
                    ]).map(f => (
                      <button
                        key={f.id}
                        onClick={() => setRecipientFilter(f.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                          recipientFilter === f.id ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                        }`}
                      >
                        {f.label} ({f.count})
                      </button>
                    ))}
                  </div>

                  {/* Recipient List */}
                  <div className="space-y-2">
                    {loadingRecipients ? (
                      <div className="flex flex-col items-center justify-center py-10">
                        <div className="w-8 h-8 border-2 border-[#0B1F33] border-t-transparent rounded-full animate-spin mb-3"></div>
                        <p className="text-sm text-[#6B7C8F]">Loading recipients...</p>
                      </div>
                    ) : filteredRecipients.length === 0 ? (
                      <div className="text-center py-10">
                        <div className="w-14 h-14 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-3">
                          <i className="ri-user-line text-[#6B7C8F] text-2xl"></i>
                        </div>
                        <p className="text-sm text-[#6B7C8F]">No recipients in this filter</p>
                      </div>
                    ) : (
                      filteredRecipients.map((recipient) => {
                        const statusConfig = getRecipientStatusConfig(recipient.status);
                        return (
                          <div key={recipient.id} className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-xl hover:bg-gray-100 transition-colors">
                            <div className="w-10 h-10 bg-[#0B1F33] rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {recipient.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-[#0B1F33] truncate">{recipient.name}</p>
                              <p className="text-xs text-[#6B7C8F] truncate">{recipient.email}</p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              {recipient.clickedAt && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] text-[#6B7C8F]">Clicked</p>
                                  <p className="text-xs font-semibold text-teal-600">{recipient.clickedAt}</p>
                                </div>
                              )}
                              {recipient.openedAt && !recipient.clickedAt && (
                                <div className="text-right hidden sm:block">
                                  <p className="text-[10px] text-[#6B7C8F]">Opened</p>
                                  <p className="text-xs font-semibold text-emerald-600">{recipient.openedAt}</p>
                                </div>
                              )}
                              <div className="text-right">
                                <p className="text-[10px] text-[#6B7C8F]">Sent</p>
                                <p className="text-xs font-semibold text-[#0B1F33]">{recipient.sentAt}</p>
                              </div>
                              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${statusConfig.bg} ${statusConfig.color}`}>
                                <i className={`${statusConfig.icon} text-xs`}></i>
                                {statusConfig.label}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* Message Preview Tab */}
              {detailTab === 'preview' && (
                <div className="space-y-5">
                  {/* Subject Line */}
                  {selectedCampaign.subject && (
                    <div>
                      <h4 className="text-xs font-bold text-[#6B7C8F] uppercase tracking-wide mb-2">Subject Line</h4>
                      <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-100">
                        <p className="text-sm font-semibold text-[#0B1F33]">{selectedCampaign.subject}</p>
                      </div>
                    </div>
                  )}

                  {/* Message Body Preview */}
                  <div>
                    <h4 className="text-xs font-bold text-[#6B7C8F] uppercase tracking-wide mb-2">Message Body</h4>
                    <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
                      {/* Email Header */}
                      <div className="bg-[#0B1F33] p-5 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <div className="w-8 h-8 bg-[#D4B483] rounded-lg flex items-center justify-center">
                            <i className="ri-building-2-line text-white text-lg"></i>
                          </div>
                          <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{businessName}</span>
                        </div>
                      </div>
                      {/* Email Body */}
                      <div className="p-6">
                        <p className="text-sm text-[#0B1F33] leading-relaxed whitespace-pre-line">
                          {selectedCampaign.body || selectedCampaign.previewText || 'No message content available.'}
                        </p>
                        <div className="mt-6">
                          <div className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg text-sm font-semibold">
                            {selectedCampaign.type === 'post-job' ? 'Leave a Review' :
                             selectedCampaign.type === 'seasonal' ? 'Book Now — 15% Off' :
                             selectedCampaign.type === 'maintenance' ? 'Schedule Maintenance' :
                             'Refer a Friend'}
                          </div>
                        </div>
                      </div>
                      {/* Email Footer */}
                      <div className="bg-[#F9F9FB] p-4 border-t border-gray-100 text-center">
                        <p className="text-[10px] text-[#6B7C8F]">
                          Sent via {businessName} &bull; Unsubscribe &bull; Privacy Policy
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Merge Tags */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-code-s-slash-line text-amber-600"></i>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#0B1F33] mb-1">Dynamic Merge Tags</p>
                        <p className="text-xs text-[#6B7C8F] leading-relaxed">
                          This message uses personalization tags like <span className="font-mono bg-white px-1 py-0.5 rounded text-amber-700 text-[10px]">{'{first_name}'}</span> and <span className="font-mono bg-white px-1 py-0.5 rounded text-amber-700 text-[10px]">{'{job_type}'}</span> that are automatically replaced with each recipient&apos;s actual information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t border-gray-100 flex items-center gap-3 bg-[#F9F9FB] flex-shrink-0">
              <button
                onClick={() => toggleCampaignStatus(selectedCampaign.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap ${
                  selectedCampaign.status === 'active'
                    ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                }`}
              >
                <i className={selectedCampaign.status === 'active' ? 'ri-pause-circle-line' : 'ri-play-circle-line'}></i>
                {selectedCampaign.status === 'active' ? 'Pause' : 'Resume'}
              </button>
              <button
                onClick={() => { duplicateCampaign(selectedCampaign); setSelectedCampaign(null); }}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-file-copy-line"></i>
                Duplicate
              </button>
              <div className="flex-1" />
              <button
                onClick={() => setSelectedCampaign(null)}
                className="px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Campaign Modal */}
      {showNewCampaign && (
        <NewCampaignModal
          onClose={() => setShowNewCampaign(false)}
          onSave={handleNewCampaignSave}
          businessName={businessName}
        />
      )}

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
}
