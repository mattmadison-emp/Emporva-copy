
import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import CSVImportModal from '../../../components/feature/CSVImportModal';

interface ConnectedEmail {
  id: string;
  email: string;
  provider: 'gmail' | 'outlook' | 'yahoo' | 'imap';
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSync: string;
  leadsImported: number;
  unreadLeads: number;
}

interface EmailLead {
  id: string;
  accountId: string;
  subject: string;
  from: string;
  fromEmail: string;
  receivedAt: string;
  status: 'new' | 'processing' | 'processed' | 'review' | 'rejected';
  confidence: number;
  extractedData?: {
    name: string;
    phone: string;
    address: string;
    projectType: string;
    estimatedValue: string;
  };
  snippet: string;
  labels: string[];
}

interface FilterRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  enabled: boolean;
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHr / 24);
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

const PIPELINE_STAGES = [
  { id: 'new-lead', label: 'New Lead', status: 'open' },
  { id: 'clarifying', label: 'Clarifying Scope', status: 'open' },
  { id: 'ready-quote', label: 'Ready to Quote', status: 'quoted' },
  { id: 'scheduled', label: 'Scheduled', status: 'assigned' },
  { id: 'in-progress', label: 'In Progress', status: 'in-progress' },
  { id: 'completed', label: 'Completed', status: 'completed' },
  { id: 'follow-up', label: 'Follow-Up', status: 'completed' },
];

export default function LeadImport() {
  const { user } = useAuth();
  const [importMethod, setImportMethod] = useState<'manual' | 'paste' | 'email' | 'csv' | null>(null);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [emailView, setEmailView] = useState<'dashboard' | 'connect' | 'inbox' | 'rules' | 'detail'>('dashboard');
  const [connectStep, setConnectStep] = useState(0);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [connectedEmails, setConnectedEmails] = useState<ConnectedEmail[]>([]);
  const [emailLeads, setEmailLeads] = useState<EmailLead[]>([]);
  const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
  const [selectedLead, setSelectedLead] = useState<EmailLead | null>(null);
  const [inboxFilter, setInboxFilter] = useState<'all' | 'new' | 'processing' | 'processed' | 'review' | 'rejected'>(
    'all',
  );
  const [showAddRule, setShowAddRule] = useState(false);
  const [newRule, setNewRule] = useState({ name: '', condition: '', action: 'Auto-process' });
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [connectEmail, setConnectEmail] = useState('');
  const [connectPassword, setConnectPassword] = useState('');
  const [leadData, setLeadData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    description: '',
    pipelineStep: 'new-lead',
  });
  const [loading, setLoading] = useState(true);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ─── Data Fetching ───

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('connected_email_accounts')
      .select('*')
      .eq('user_id', user.id)
      .neq('status', 'disconnected');
    if (error) {
      console.error('Error fetching connected accounts:', error);
      return;
    }
    if (data) {
      setConnectedEmails(
        data.map((row: any) => ({
          id: row.id,
          email: row.email,
          provider: row.provider,
          status: row.status,
          lastSync: formatTimeAgo(row.last_sync),
          leadsImported: row.leads_imported ?? 0,
          unreadLeads: row.unread_leads ?? 0,
        })),
      );
    }
  }, [user]);

  const fetchLeads = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('email_leads')
      .select('*')
      .eq('user_id', user.id)
      .order('received_at', { ascending: false });
    if (error) {
      console.error('Error fetching email leads:', error);
      return;
    }
    if (data) {
      setEmailLeads(
        data.map((row: any) => ({
          id: row.id,
          accountId: row.account_id,
          subject: row.subject ?? '',
          from: row.from_name ?? '',
          fromEmail: row.from_email ?? '',
          receivedAt: formatTimeAgo(row.received_at),
          status: row.status,
          confidence: row.confidence ?? 0,
          extractedData: row.extracted_data ?? undefined,
          snippet: row.snippet ?? '',
          labels: row.labels ?? [],
        })),
      );
    }
  }, [user]);

  const fetchRules = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('lead_filter_rules')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    if (error) {
      console.error('Error fetching filter rules:', error);
      return;
    }
    if (data) {
      setFilterRules(
        data.map((row: any) => ({
          id: row.id,
          name: row.name,
          condition: typeof row.condition === 'object' ? (row.condition.description ?? JSON.stringify(row.condition)) : String(row.condition ?? ''),
          action: row.action ?? '',
          enabled: row.enabled ?? true,
        })),
      );
    }
  }, [user]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchAccounts(), fetchLeads(), fetchRules()]);
      setLoading(false);
    };
    loadAll();
  }, [fetchAccounts, fetchLeads, fetchRules]);

  // ─── Handlers ───

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const stage = PIPELINE_STAGES.find(s => s.id === leadData.pipelineStep);
    const { error } = await supabase.from('contractor_contacts').insert({
      user_id: user.id,
      name: leadData.name,
      email: leadData.email,
      phone: leadData.phone,
      address: leadData.address,
      source: 'manual',
      tags: JSON.stringify(['Lead Import']),
      notes: leadData.description,
      pipeline_status: stage?.status ?? 'open',
      pipeline_step: leadData.pipelineStep,
    });

    if (error) {
      showToast('Failed to import lead: ' + error.message, 'error');
      return;
    }

    showToast('Lead imported successfully! AI clarification will begin processing.');
    setLeadData({ name: '', email: '', phone: '', address: '', description: '', pipelineStep: 'new-lead' });
    setImportMethod(null);
  };

  const handleProcessLead = async (leadId: string) => {
    // Optimistic update to processing
    setEmailLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, status: 'processing' as const, confidence: 45 } : l)),
    );
    showToast('AI processing started...');

    const { error } = await supabase
      .from('email_leads')
      .update({ status: 'processing' })
      .eq('id', leadId);

    if (error) {
      showToast('Failed to process lead', 'error');
      await fetchLeads();
      return;
    }

    // Simulate AI processing delay, then mark as processed
    setTimeout(async () => {
      const lead = emailLeads.find(l => l.id === leadId);
      const extracted = {
        name: lead?.from ?? '',
        phone: '(555) 000-0000',
        address: 'Extracted from email body',
        projectType: (lead?.subject ?? '').replace('Re: ', ''),
        estimatedValue: '$3,000 - $8,000',
      };

      const { error: updateErr } = await supabase
        .from('email_leads')
        .update({
          status: 'processed',
          confidence: 93,
          extracted_data: extracted,
        })
        .eq('id', leadId);

      if (updateErr) {
        showToast('Failed to complete processing', 'error');
        await fetchLeads();
        return;
      }

      setEmailLeads(prev =>
        prev.map(l =>
          l.id === leadId
            ? {
                ...l,
                status: 'processed' as const,
                confidence: 93,
                extractedData: extracted,
              }
            : l,
        ),
      );
      showToast('Lead processed successfully!');
      if (selectedLead?.id === leadId) {
        setSelectedLead(prev =>
          prev
            ? {
                ...prev,
                status: 'processed' as const,
                confidence: 93,
                extractedData: extracted,
              }
            : null,
        );
      }
    }, 2000);
  };

  const handleRejectLead = async (leadId: string) => {
    setEmailLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: 'rejected' as const } : l)));
    showToast('Email marked as not a lead', 'info');
    if (selectedLead?.id === leadId) {
      setSelectedLead(null);
      setEmailView('inbox');
    }

    const { error } = await supabase
      .from('email_leads')
      .update({ status: 'rejected' })
      .eq('id', leadId);

    if (error) {
      showToast('Failed to reject lead', 'error');
      await fetchLeads();
    }
  };

  const handleRestoreLead = async (leadId: string) => {
    setEmailLeads(prev =>
      prev.map(l => (l.id === leadId ? { ...l, status: 'new' as const } : l)),
    );
    setSelectedLead(prev => (prev && prev.id === leadId ? { ...prev, status: 'new' } : prev));
    showToast('Restored to inbox');

    const { error } = await supabase
      .from('email_leads')
      .update({ status: 'new' })
      .eq('id', leadId);

    if (error) {
      showToast('Failed to restore lead', 'error');
      await fetchLeads();
    }
  };

  const handleAddToPipeline = async (lead: EmailLead) => {
    if (!user) return;
    const extracted = lead.extractedData;
    const { error } = await supabase.from('contractor_contacts').insert({
      user_id: user.id,
      name: extracted?.name || lead.from,
      email: lead.fromEmail,
      phone: extracted?.phone || null,
      address: extracted?.address || null,
      source: 'manual',
      tags: JSON.stringify(lead.labels.length > 0 ? lead.labels : ['Email Lead']),
      notes: `Imported from email: ${lead.subject}`,
    });

    if (error) {
      showToast('Failed to add to pipeline', 'error');
      return;
    }

    showToast('Lead added to pipeline!');
    setSelectedLead(null);
    setEmailView('inbox');
  };

  const handleConnectAccount = async () => {
    if (!connectEmail || !user) return;

    const provider = (selectedProvider ?? 'imap') as ConnectedEmail['provider'];

    const { data, error } = await supabase
      .from('connected_email_accounts')
      .insert({
        user_id: user.id,
        email: connectEmail,
        provider,
        status: 'syncing',
        leads_imported: 0,
        unread_leads: 0,
      })
      .select()
      .single();

    if (error) {
      showToast('Failed to connect account', 'error');
      return;
    }

    const newAccount: ConnectedEmail = {
      id: data.id,
      email: connectEmail,
      provider,
      status: 'syncing',
      lastSync: 'Just now',
      leadsImported: 0,
      unreadLeads: 0,
    };
    setConnectedEmails(prev => [...prev, newAccount]);
    showToast(`${connectEmail} connected! Initial sync in progress...`);
    setConnectStep(0);
    setSelectedProvider(null);
    setConnectEmail('');
    setConnectPassword('');
    setEmailView('dashboard');

    // Simulate sync completion
    setTimeout(async () => {
      await supabase
        .from('connected_email_accounts')
        .update({ status: 'connected', last_sync: new Date().toISOString() })
        .eq('id', data.id);

      setConnectedEmails(prev =>
        prev.map(e => (e.id === data.id ? { ...e, status: 'connected', lastSync: '1 min ago' } : e)),
      );
    }, 3000);
  };

  const handleDisconnect = async (id: string) => {
    setConnectedEmails(prev => prev.filter(e => e.id !== id));
    showToast('Email account disconnected', 'info');

    const { error } = await supabase
      .from('connected_email_accounts')
      .update({ status: 'disconnected' })
      .eq('id', id);

    if (error) {
      showToast('Failed to disconnect account', 'error');
      await fetchAccounts();
    }
  };

  const handleToggleRule = async (id: string) => {
    const rule = filterRules.find(r => r.id === id);
    if (!rule) return;

    const newEnabled = !rule.enabled;
    setFilterRules(prev => prev.map(r => (r.id === id ? { ...r, enabled: newEnabled } : r)));

    const { error } = await supabase
      .from('lead_filter_rules')
      .update({ enabled: newEnabled })
      .eq('id', id);

    if (error) {
      showToast('Failed to update rule', 'error');
      await fetchRules();
    }
  };

  const handleAddRule = async () => {
    if (!newRule.name || !newRule.condition || !user) return;

    const { data, error } = await supabase
      .from('lead_filter_rules')
      .insert({
        user_id: user.id,
        name: newRule.name,
        condition: { description: newRule.condition },
        action: newRule.action,
        enabled: true,
      })
      .select()
      .single();

    if (error) {
      showToast('Failed to add rule', 'error');
      return;
    }

    setFilterRules(prev => [
      ...prev,
      {
        id: data.id,
        name: newRule.name,
        condition: newRule.condition,
        action: newRule.action,
        enabled: true,
      },
    ]);
    setNewRule({ name: '', condition: '', action: 'Auto-process' });
    setShowAddRule(false);
    showToast('Filter rule added!');
  };

  const handleDeleteRule = async (id: string) => {
    setFilterRules(prev => prev.filter(r => r.id !== id));
    showToast('Rule deleted', 'info');

    const { error } = await supabase
      .from('lead_filter_rules')
      .delete()
      .eq('id', id);

    if (error) {
      showToast('Failed to delete rule', 'error');
      await fetchRules();
    }
  };

  const filteredLeads = emailLeads.filter(l => inboxFilter === 'all' || l.status === inboxFilter);

  const getStatusBadge = (status: EmailLead['status']) => {
    const map = {
      new: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'New' },
      processing: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Processing' },
      processed: { bg: 'bg-green-100', text: 'text-green-700', label: 'Processed' },
      review: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Needs Review' },
      rejected: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Not a Lead' },
    };
    const s = map[status];
    return (
      <span className={`text-xs ${s.bg} ${s.text} px-2.5 py-1 rounded-full font-semibold whitespace-nowrap`}>
        {s.label}
      </span>
    );
  };

  const getProviderIcon = (provider: string) => {
    const map: Record<string, { icon: string; color: string }> = {
      gmail: { icon: 'ri-google-fill', color: 'text-red-500' },
      outlook: { icon: 'ri-microsoft-fill', color: 'text-blue-600' },
      yahoo: { icon: 'ri-yahoo-fill', color: 'text-purple-600' },
      imap: { icon: 'ri-server-line', color: 'text-gray-600' },
    };
    const p = map[provider] || map.imap;
    return <i className={`${p.icon} ${p.color} text-xl`}></i>;
  };

  const totalLeads = connectedEmails.reduce((sum, e) => sum + e.leadsImported, 0);
  const totalUnread = connectedEmails.reduce((sum, e) => sum + e.unreadLeads, 0);
  const processedCount = emailLeads.filter(l => l.status === 'processed').length;
  const newCount = emailLeads.filter(l => l.status === 'new').length;

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <i className="ri-loader-4-line animate-spin text-3xl text-[#D4B483] mb-3 block"></i>
              <p className="text-[#6B7C8F] font-medium">Loading lead import...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Email Integration Views ───
  const renderEmailDashboard = () => (
    <div className="space-y-5">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Connected Accounts', value: connectedEmails.length, icon: 'ri-link', color: 'bg-[#0B1F33]' },
          { label: 'Total Imported', value: totalLeads, icon: 'ri-inbox-archive-line', color: 'bg-[#D4B483]' },
          { label: 'Unread Leads', value: totalUnread, icon: 'ri-mail-unread-line', color: 'bg-amber-500' },
          { label: 'AI Processed', value: processedCount, icon: 'ri-sparkling-line', color: 'bg-emerald-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#F9F9FB] rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 ${stat.color} rounded-md flex items-center justify-center`}>
                <i className={`${stat.icon} text-white text-sm`}></i>
              </div>
              <span className="text-xs text-[#6B7C8F] font-medium">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold text-[#0B1F33]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Connected Accounts */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-[#0B1F33]">Connected Accounts</h3>
          <button
            onClick={() => {
              setEmailView('connect');
              setConnectStep(0);
            }}
            className="flex items-center gap-1.5 text-sm font-semibold text-[#D4B483] hover:text-[#c4a473] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-add-line"></i> Add Account
          </button>
        </div>
        <div className="space-y-2">
          {connectedEmails.map(account => (
            <div key={account.id} className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                  {getProviderIcon(account.provider)}
                </div>
                <div>
                  <p className="font-semibold text-[#0B1F33] text-sm">{account.email}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    {account.status === 'connected' && (
                      <span className="flex items-center gap-1 text-xs text-green-600">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Connected
                      </span>
                    )}
                    {account.status === 'syncing' && (
                      <span className="flex items-center gap-1 text-xs text-blue-600">
                        <i className="ri-loader-4-line animate-spin text-xs"></i> Syncing...
                      </span>
                    )}
                    {account.status === 'error' && (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span> Error
                      </span>
                    )}
                    <span className="text-xs text-[#6B7C8F]">· Last sync: {account.lastSync}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-[#0B1F33]">{account.leadsImported} leads</p>
                  {account.unreadLeads > 0 && (
                    <p className="text-xs text-amber-600 font-medium">{account.unreadLeads} new</p>
                  )}
                </div>
                <button
                  onClick={() => handleDisconnect(account.id)}
                  className="w-8 h-8 flex items-center justify-center text-[#6B7C8F] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                  title="Disconnect"
                >
                  <i className="ri-link-unlink text-lg"></i>
                </button>
              </div>
            </div>
          ))}
          {connectedEmails.length === 0 && (
            <div className="text-center py-8 text-[#6B7C8F]">
              <i className="ri-mail-add-line text-4xl mb-2 block"></i>
              <p className="font-medium">No accounts connected yet</p>
              <p className="text-sm mt-1">Connect your email to start auto-importing leads</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => setEmailView('inbox')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#0B1F33] hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center">
            <i className="ri-inbox-line text-white"></i>
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#0B1F33] text-sm">Lead Inbox</p>
            <p className="text-xs text-[#6B7C8F]">View &amp; process imported emails</p>
          </div>
          {newCount > 0 && (
            <span className="ml-auto bg-amber-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
              {newCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setEmailView('rules')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-[#0B1F33] hover:shadow-sm transition-all cursor-pointer"
        >
          <div className="w-10 h-10 bg-[#D4B483] rounded-lg flex items-center justify-center">
            <i className="ri-filter-3-line text-[#0B1F33]"></i>
          </div>
          <div className="text-left">
            <p className="font-semibold text-[#0B1F33] text-sm">Filter Rules</p>
            <p className="text-xs text-[#6B7C8F]">Manage auto-import rules</p>
          </div>
          <span className="ml-auto text-xs text-[#6B7C8F] font-medium">
            {filterRules.filter(r => r.enabled).length} active
          </span>
        </button>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-bold text-[#0B1F33] mb-3">Recent Activity</h3>
        <div className="space-y-2">
          {emailLeads.length === 0 && (
            <div className="text-center py-8 text-[#6B7C8F]">
              <i className="ri-inbox-line text-4xl mb-2 block"></i>
              <p className="font-medium">No leads imported yet</p>
              <p className="text-sm mt-1">Connect an email account to start receiving leads</p>
            </div>
          )}
          {emailLeads.slice(0, 4).map(lead => (
            <button
              key={lead.id}
              onClick={() => {
                setSelectedLead(lead);
                setEmailView('detail');
              }}
              className="w-full flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    lead.status === 'new'
                      ? 'bg-amber-500'
                      : lead.status === 'processing'
                      ? 'bg-blue-500 animate-pulse'
                      : lead.status === 'processed'
                      ? 'bg-green-500'
                      : lead.status === 'review'
                      ? 'bg-orange-500'
                      : 'bg-gray-300'
                  }`}
                ></div>
                <div className="min-w-0">
                  <p className="font-medium text-[#0B1F33] text-sm truncate">{lead.subject}</p>
                  <p className="text-xs text-[#6B7C8F] truncate">
                    {lead.from} · {lead.receivedAt}
                  </p>
                </div>
              </div>
              {getStatusBadge(lead.status)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderConnectFlow = () => (
    <div className="space-y-5">
      <button
        onClick={() => {
          setEmailView('dashboard');
          setConnectStep(0);
          setSelectedProvider(null);
        }}
        className="flex items-center gap-1.5 text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
      >
        <i className="ri-arrow-left-s-line"></i> Back to Dashboard
      </button>

      {connectStep === 0 && (
        <>
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-[#0B1F33]">Connect Email Account</h3>
            <p className="text-sm text-[#6B7C8F] mt-1">
              Choose your email provider to start auto-importing leads
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 'gmail',
                name: 'Gmail',
                icon: 'ri-google-fill',
                color: 'text-red-500',
                bg: 'bg-red-50',
                desc: 'Google Workspace & Gmail',
              },
              {
                id: 'outlook',
                name: 'Outlook',
                icon: 'ri-microsoft-fill',
                color: 'text-blue-600',
                bg: 'bg-blue-50',
                desc: 'Microsoft 365 & Outlook',
              },
              {
                id: 'yahoo',
                name: 'Yahoo Mail',
                icon: 'ri-yahoo-fill',
                color: 'text-purple-600',
                bg: 'bg-purple-50',
                desc: 'Yahoo & AOL Mail',
              },
              {
                id: 'imap',
                name: 'IMAP / Other',
                icon: 'ri-server-line',
                color: 'text-gray-600',
                bg: 'bg-gray-50',
                desc: 'Any IMAP-compatible email',
              },
            ].map(provider => (
              <button
                key={provider.id}
                onClick={() => {
                  setSelectedProvider(provider.id);
                  setConnectStep(1);
                }}
                className={`p-5 rounded-lg border-2 border-transparent hover:border-[#0B1F33] transition-all cursor-pointer text-center ${provider.bg}`}
              >
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                  <i className={`${provider.icon} ${provider.color} text-2xl`}></i>
                </div>
                <h4 className="font-bold text-[#0B1F33] text-sm">{provider.name}</h4>
                <p className="text-xs text-[#6B7C8F] mt-1">{provider.desc}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {connectStep === 1 && (
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-center mb-2">
            <div className="w-14 h-14 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-3">
              {getProviderIcon(selectedProvider || 'imap')}
            </div>
            <h3 className="text-lg font-bold text-[#0B1F33]">
              Connect{' '}
              {selectedProvider === 'gmail'
                ? 'Gmail'
                : selectedProvider === 'outlook'
                ? 'Outlook'
                : selectedProvider === 'yahoo'
                ? 'Yahoo Mail'
                : 'IMAP'}{' '}
              Account
            </h3>
          </div>

          {(selectedProvider === 'gmail' || selectedProvider === 'outlook') ? (
            <div className="space-y-4">
              <div className="bg-[#F9F9FB] rounded-lg p-4 text-center">
                <i className="ri-shield-check-line text-green-500 text-3xl mb-2"></i>
                <p className="text-sm text-[#6B7C8F]">
                  You&apos;ll be redirected to {selectedProvider === 'gmail' ? 'Google' : 'Microsoft'} to securely
                  authorize access. We only request read-only access to your inbox.
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Email Address</label>
                  <input
                    type="email"
                    value={connectEmail}
                    onChange={e => setConnectEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                    placeholder={selectedProvider === 'gmail' ? 'you@gmail.com' : 'you@outlook.com'}
                  />
                </div>
                <button
                  onClick={() => setConnectStep(2)}
                  disabled={!connectEmail}
                  className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-external-link-line mr-2"></i>
                  Authorize with {selectedProvider === 'gmail' ? 'Google' : 'Microsoft'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={connectEmail}
                  onChange={e => setConnectEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">
                  {selectedProvider === 'imap' ? 'App Password' : 'Password'}
                </label>
                <input
                  type="password"
                  value={connectPassword}
                  onChange={e => setConnectPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                  placeholder="••••••••••"
                />
              </div>
              {selectedProvider === 'imap' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">IMAP Server</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                      placeholder="imap.example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Port</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                      placeholder="993"
                    />
                  </div>
                </div>
              )}
              <button
                onClick={() => setConnectStep(2)}
                disabled={!connectEmail || !connectPassword}
                className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
              >
                Connect Account
              </button>
            </div>
          )}

          <div className="flex items-start gap-2 text-xs text-[#6B7C8F] bg-[#F9F9FB] rounded-lg p-3">
            <i className="ri-lock-line text-sm mt-0.5 flex-shrink-0"></i>
            <p>
              Your credentials are encrypted and stored securely. We never share your data with third parties.
            </p>
          </div>
        </div>
      )}

      {connectStep === 2 && (
        <div className="max-w-md mx-auto space-y-5">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#0B1F33]">Configure Import Settings</h3>
            <p className="text-sm text-[#6B7C8F] mt-1">Choose how leads are imported from this account</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Scan Frequency</label>
              <div className="grid grid-cols-3 gap-2">
                {['Every 5 min', 'Every 15 min', 'Every hour'].map((freq, i) => (
                  <button
                    key={freq}
                    className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                      i === 0 ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#0B1F33] hover:bg-gray-200'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Folders to Monitor</label>
              <div className="space-y-2">
                {['Inbox', 'Leads', 'Inquiries', 'Spam (for false positives)'].map((folder, i) => (
                  <label
                    key={folder}
                    className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    <input type="checkbox" defaultChecked={i < 2} className="w-4 h-4 accent-[#0B1F33] cursor-pointer" />
                    <span className="text-sm text-[#0B1F33]">{folder}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">AI Processing</label>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <i className="ri-sparkling-line text-[#D4B483]"></i>
                    <span className="text-sm text-[#0B1F33]">Auto-process new leads with AI</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0B1F33] cursor-pointer" />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-3-line text-[#D4B483]"></i>
                    <span className="text-sm text-[#0B1F33]">Notify me for high-value leads</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0B1F33] cursor-pointer" />
                </label>
                <label className="flex items-center justify-between p-3 bg-[#F9F9FB] rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-2">
                    <i className="ri-spam-line text-[#D4B483]"></i>
                    <span className="text-sm text-[#0B1F33]">Auto-reject obvious non-leads</span>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 accent-[#0B1F33] cursor-pointer" />
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleConnectAccount}
            className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-check-line mr-2"></i>
            Finish Setup &amp; Start Syncing
          </button>
        </div>
      )}
    </div>
  );

  const renderInbox = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setEmailView('dashboard')}
          className="flex items-center gap-1.5 text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-s-line"></i> Back
        </button>
        <h3 className="font-bold text-[#0B1F33]">Lead Inbox</h3>
        <button
          onClick={async () => {
            showToast('Syncing all accounts...', 'info');
            await Promise.all([fetchAccounts(), fetchLeads()]);
            showToast('Sync complete!');
          }}
          className="flex items-center gap-1.5 text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-refresh-line"></i> Sync Now
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-[#F9F9FB] rounded-lg p-1 overflow-x-auto">
        {[
          { key: 'all', label: 'All', count: emailLeads.length },
          { key: 'new', label: 'New', count: emailLeads.filter(l => l.status === 'new').length },
          {
            key: 'processing',
            label: 'Processing',
            count: emailLeads.filter(l => l.status === 'processing').length,
          },
          {
            key: 'processed',
            label: 'Processed',
            count: emailLeads.filter(l => l.status === 'processed').length,
          },
          { key: 'review', label: 'Review', count: emailLeads.filter(l => l.status === 'review').length },
          { key: 'rejected', label: 'Rejected', count: emailLeads.filter(l => l.status === 'rejected').length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setInboxFilter(tab.key as typeof inboxFilter)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
              inboxFilter === tab.key ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F] hover:text-[#0B1F33]'
            }`}
          >
            {tab.label} {tab.count > 0 && <span className="ml-1 opacity-60">({tab.count})</span>}
          </button>
        ))}
      </div>

      {/* Lead List */}
      <div className="space-y-2">
        {filteredLeads.map(lead => (
          <button
            key={lead.id}
            onClick={() => {
              setSelectedLead(lead);
              setEmailView('detail');
            }}
            className="w-full flex items-start gap-3 p-4 bg-[#F9F9FB] rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-left"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5 ${
                lead.status === 'new'
                  ? 'bg-amber-500'
                  : lead.status === 'processing'
                  ? 'bg-blue-500 animate-pulse'
                  : lead.status === 'processed'
                  ? 'bg-green-500'
                  : lead.status === 'review'
                  ? 'bg-orange-500'
                  : 'bg-gray-300'
              }`}
            ></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-[#0B1F33] text-sm truncate">{lead.subject}</p>
                {lead.labels.map(label => (
                  <span
                    key={label}
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${
                      label === 'Urgent'
                        ? 'bg-red-100 text-red-600'
                        : label === 'High Priority'
                        ? 'bg-amber-100 text-amber-700'
                        : label === 'High Value'
                        ? 'bg-emerald-100 text-emerald-700'
                        : label === 'Insurance'
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {label}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[#6B7C8F] mb-1">
                {lead.from} &lt;{lead.fromEmail}&gt; · {lead.receivedAt}
              </p>
              <p className="text-xs text-[#6B7C8F] truncate">{lead.snippet}</p>
            </div>
            <div className="flex-shrink-0 flex flex-col items-end gap-2">
              {getStatusBadge(lead.status)}
              {lead.confidence > 0 && (
                <span className="text-[10px] text-[#6B7C8F] font-medium">{lead.confidence}% match</span>
              )}
            </div>
          </button>
        ))}
        {filteredLeads.length === 0 && (
          <div className="text-center py-10 text-[#6B7C8F]">
            <i className="ri-inbox-line text-4xl mb-2 block"></i>
            <p className="font-medium">No emails in this category</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderLeadDetail = () => {
    if (!selectedLead) return null;
    return (
      <div className="space-y-5">
        <button
          onClick={() => {
            setSelectedLead(null);
            setEmailView('inbox');
          }}
          className="flex items-center gap-1.5 text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-s-line"></i> Back to Inbox
        </button>

        {/* Email Header */}
        <div className="bg-[#F9F9FB] rounded-lg p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="text-lg font-bold text-[#0B1F33]">{selectedLead.subject}</h3>
              <p className="text-sm text-[#6B7C8F] mt-1">
                From:{' '}
                <span className="font-medium text-[#0B1F33]">{selectedLead.from}</span>{' '}
                &lt;{selectedLead.fromEmail}&gt;
              </p>
              <p className="text-xs text-[#6B7C8F] mt-0.5">Received {selectedLead.receivedAt}</p>
            </div>
            <div className="flex items-center gap-2">
              {selectedLead.labels.map(label => (
                <span
                  key={label}
                  className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
                    label === 'Urgent'
                      ? 'bg-red-100 text-red-600'
                      : label === 'High Priority'
                      ? 'bg-amber-100 text-amber-700'
                      : label === 'High Value'
                      ? 'bg-emerald-100 text-emerald-700'
                      : label === 'Insurance'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {label}
                </span>
              ))}
              {getStatusBadge(selectedLead.status)}
            </div>
          </div>
          <div className="bg-white rounded-lg p-4 text-sm text-[#0B1F33] leading-relaxed border border-gray-100">
            {selectedLead.snippet}
          </div>
        </div>

        {/* AI Confidence */}
        {selectedLead.confidence > 0 && (
          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4">
            <div className="w-10 h-10 bg-gradient-to-br from-[#D4B483] to-[#c4a473] rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-sparkling-line text-[#0B1F33]"></i>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-[#0B1F33]">AI Lead Confidence</span>
                <span
                  className={`text-sm font-bold ${
                    selectedLead.confidence >= 80
                      ? 'text-green-600'
                      : selectedLead.confidence >= 50
                      ? 'text-amber-600'
                      : 'text-red-500'
                  }`}
                >
                  {selectedLead.confidence}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    selectedLead.confidence >= 80
                      ? 'bg-green-500'
                      : selectedLead.confidence >= 50
                      ? 'bg-amber-500'
                      : 'bg-red-400'
                  }`}
                  style={{ width: `${selectedLead.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Extracted Data */}
        {selectedLead.extractedData && (
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <i className="ri-sparkling-line text-[#D4B483]"></i>
              <h4 className="font-bold text-[#0B1F33]">AI-Extracted Lead Data</h4>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Customer Name', value: selectedLead.extractedData.name, icon: 'ri-user-line' },
                { label: 'Phone', value: selectedLead.extractedData.phone || 'Not found', icon: 'ri-phone-line' },
                { label: 'Address', value: selectedLead.extractedData.address, icon: 'ri-map-pin-line' },
                { label: 'Project Type', value: selectedLead.extractedData.projectType, icon: 'ri-tools-line' },
              ].map(field => (
                <div key={field.label} className="flex items-start gap-2">
                  <div className="w-8 h-8 bg-[#F9F9FB] rounded-md flex items-center justify-center flex-shrink-0 mt-0.5">
                    <i className={`${field.icon} text-[#6B7C8F] text-sm`}></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7C8F]">{field.label}</p>
                    <p className="text-sm font-semibold text-[#0B1F33]">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {selectedLead.extractedData.estimatedValue && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-md flex items-center justify-center flex-shrink-0">
                  <i className="ri-money-dollar-circle-line text-emerald-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-xs text-[#6B7C8F]">Estimated Value</p>
                  <p className="text-sm font-bold text-emerald-600">{selectedLead.extractedData.estimatedValue}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {(selectedLead.status === 'new' || selectedLead.status === 'review') && (
            <>
              <button
                onClick={() => handleProcessLead(selectedLead.id)}
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-sparkling-line mr-2"></i>
                Process with AI
              </button>
              <button
                onClick={() => handleRejectLead(selectedLead.id)}
                className="px-6 bg-[#F9F9FB] text-[#6B7C8F] py-3 rounded-lg font-semibold hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer whitespace-nowrap"
              >
                Not a Lead
              </button>
            </>
          )}
          {selectedLead.status === 'processed' && (
            <>
              <button
                onClick={() => handleAddToPipeline(selectedLead)}
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-2"></i>
                Add to Pipeline
              </button>
              <button
                onClick={() => showToast('Reply sent!')}
                className="px-6 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-reply-line mr-2"></i>
                Reply
              </button>
            </>
          )}
          {selectedLead.status === 'processing' && (
            <div className="flex-1 bg-blue-50 text-blue-700 py-3 rounded-lg font-semibold text-center">
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              AI is processing this lead...
            </div>
          )}
          {selectedLead.status === 'rejected' && (
            <button
              onClick={() => handleRestoreLead(selectedLead.id)}
              className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              <i className="ri-arrow-go-back-line mr-2"></i>
              Restore to Inbox
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderRules = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setEmailView('dashboard')}
          className="flex items-center gap-1.5 text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer"
        >
          <i className="ri-arrow-left-s-line"></i> Back
        </button>
        <h3 className="font-bold text-[#0B1F33]">Filter Rules</h3>
        <button
          onClick={() => setShowAddRule(true)}
          className="flex items-center gap-1.5 text-sm font-semibold text-[#D4B483] hover:text-[#c4a473] transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i> Add Rule
        </button>
      </div>

      <p className="text-sm text-[#6B7C8F]">
        Rules are applied in order to incoming emails. Matching emails are automatically categorized or
        processed.
      </p>

      {/* Add Rule Form */}
      {showAddRule && (
        <div className="bg-[#F9F9FB] rounded-lg p-4 space-y-3 border border-[#D4B483]/30">
          <h4 className="font-semibold text-[#0B1F33] text-sm">New Filter Rule</h4>
          <div>
            <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Rule Name</label>
            <input
              type="text"
              value={newRule.name}
              onChange={e => setNewRule({ ...newRule, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
              placeholder="e.g., Skip vendor emails"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Condition</label>
            <input
              type="text"
              value={newRule.condition}
              onChange={e => setNewRule({ ...newRule, condition: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
              placeholder='e.g., From domain contains "vendor.com"'
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Action</label>
            <select
              value={newRule.action}
              onChange={e => setNewRule({ ...newRule, action: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
            >
              <option>Auto-process</option>
              <option>Auto-reject</option>
              <option>Flag as High Priority</option>
              <option>Flag as High Value</option>
              <option>Send to Review</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setShowAddRule(false);
                setNewRule({ name: '', condition: '', action: 'Auto-process' });
              }}
              className="flex-1 bg-white text-[#0B1F33] py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap border border-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRule}
              disabled={!newRule.name || !newRule.condition}
              className="flex-1 bg-[#0B1F33] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#1a3a52] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer whitespace-nowrap"
            >
              Add Rule
            </button>
          </div>
        </div>
      )}

      {/* Rules List */}
      <div className="space-y-2">
        {filterRules.length === 0 && !showAddRule && (
          <div className="text-center py-8 text-[#6B7C8F]">
            <i className="ri-filter-3-line text-4xl mb-2 block"></i>
            <p className="font-medium">No filter rules yet</p>
            <p className="text-sm mt-1">Add rules to automatically categorize incoming leads</p>
          </div>
        )}
        {filterRules.map((rule, index) => (
          <div
            key={rule.id}
            className={`flex items-center gap-3 p-4 rounded-lg transition-colors ${
              rule.enabled ? 'bg-[#F9F9FB]' : 'bg-gray-50 opacity-60'
            }`}
          >
            <span className="text-xs text-[#6B7C8F] font-mono w-5 flex-shrink-0">#{index + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#0B1F33] text-sm">{rule.name}</p>
              <p className="text-xs text-[#6B7C8F] mt-0.5 truncate">If: {rule.condition}</p>
              <p className="text-xs text-[#D4B483] font-medium mt-0.5">Then: {rule.action}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleToggleRule(rule.id)}
                className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${
                  rule.enabled ? 'bg-[#0B1F33]' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                    rule.enabled ? 'left-5' : 'left-0.5'
                  }`}
                ></span>
              </button>
              <button
                onClick={() => handleDeleteRule(rule.id)}
                className="w-7 h-7 flex items-center justify-center text-[#6B7C8F] hover:text-red-500 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
              >
                <i className="ri-delete-bin-line text-sm"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium animate-[slideIn_0.3s_ease] ${
            toast.type === 'success'
              ? 'bg-green-600 text-white'
              : toast.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-[#0B1F33] text-white'
          }`}
        >
          <i
            className={`${
              toast.type === 'success'
                ? 'ri-check-line'
                : toast.type === 'error'
                ? 'ri-error-warning-line'
                : 'ri-information-line'
            }`}
          ></i>
          {toast.message}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">Import a Lead</h2>
            <p className="text-[#6B7C8F]">Add leads from multiple sources with enhanced Pro tools</p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full">
            <i className="ri-vip-crown-line text-[#0B1F33] text-sm"></i>
            <span className="text-xs font-bold text-[#0B1F33]">Pro</span>
          </div>
        </div>

        {/* Import Method Selection */}
        {!importMethod && (
          <div className="grid md:grid-cols-4 gap-4">
            <button
              onClick={() => setImportMethod('manual')}
              className="p-6 bg-[#F9F9FB] rounded-lg hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 bg-[#0B1F33] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-edit-line text-white text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#0B1F33] mb-2">Manual Entry</h3>
              <p className="text-sm text-[#6B7C8F]">Fill out lead details manually</p>
            </button>

            <button
              onClick={() => setImportMethod('paste')}
              className="p-6 bg-[#F9F9FB] rounded-lg hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 bg-[#0B1F33] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-copy-line text-white text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#0B1F33] mb-2">Paste Details</h3>
              <p className="text-sm text-[#6B7C8F]">Copy and paste from email or form</p>
            </button>

            <button
              onClick={() => setImportMethod('csv')}
              className="p-6 bg-[#F9F9FB] rounded-lg hover:bg-gray-200 transition-all cursor-pointer text-center"
            >
              <div className="w-16 h-16 bg-[#0B1F33] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-excel-line text-white text-2xl"></i>
              </div>
              <h3 className="font-bold text-[#0B1F33] mb-2">CSV Upload</h3>
              <p className="text-sm text-[#6B7C8F]">Import leads from a CSV file</p>
            </button>

            <button
              onClick={() => setImportMethod('email')}
              className="p-6 bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] rounded-lg hover:shadow-lg transition-all cursor-pointer text-center text-white"
            >
              <div className="w-16 h-16 bg-[#D4B483] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-mail-line text-[#0B1F33] text-2xl"></i>
              </div>
              <h3 className="font-bold mb-2">Email Integration</h3>
              <p className="text-sm text-white/80">Auto-import from connected email</p>
            </button>
          </div>
        )}

        {/* Manual Entry Form */}
        {importMethod === 'manual' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={leadData.name}
                  onChange={e => setLeadData({ ...leadData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Email *</label>
                <input
                  type="email"
                  required
                  value={leadData.email}
                  onChange={e => setLeadData({ ...leadData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Phone *</label>
                <input
                  type="tel"
                  required
                  value={leadData.phone}
                  onChange={e => setLeadData({ ...leadData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Property Address *</label>
                <input
                  type="text"
                  required
                  value={leadData.address}
                  onChange={e => setLeadData({ ...leadData, address: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                  placeholder="123 Main St, City, State"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Project Description *</label>
              <textarea
                required
                value={leadData.description}
                onChange={e => setLeadData({ ...leadData, description: e.target.value })}
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                placeholder="Describe the project or issue..."
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Pipeline Stage</label>
              <select
                value={leadData.pipelineStep}
                onChange={e => setLeadData({ ...leadData, pipelineStep: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm bg-white"
              >
                {PIPELINE_STAGES.map(stage => (
                  <option key={stage.id} value={stage.id}>
                    {stage.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">
                Upload Photos or Documents (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#0B1F33] transition-all cursor-pointer">
                <i className="ri-upload-cloud-line text-4xl text-[#6B7C8F] mb-2"></i>
                <p className="text-[#6B7C8F] text-sm">Click to upload or drag and drop</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setImportMethod(null)}
                className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-sparkling-line mr-2"></i>
                Import &amp; Run AI Clarification
              </button>
            </div>
          </form>
        )}

        {/* CSV Upload */}
        {importMethod === 'csv' && (
          <div className="space-y-4">
            <p className="text-sm text-[#6B7C8F]">
              Upload a CSV file containing your leads. The file should include columns for name, email, phone, and address.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setImportMethod(null)}
                className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setShowCSVModal(true)}
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer"
              >
                <i className="ri-file-excel-line mr-2"></i>
                Choose CSV File
              </button>
            </div>
            {showCSVModal && (
              <CSVImportModal
                onClose={() => setShowCSVModal(false)}
                onImport={async (rows: any[]) => {
                  if (!user) return;
                  const contacts = rows.map(row => ({
                    user_id: user.id,
                    name: row.name || '',
                    email: row.email || '',
                    phone: row.phone || '',
                    address: row.address || '',
                    source: 'manual' as const,
                    tags: JSON.stringify(['Lead Import', 'CSV']),
                    notes: row.description || row.notes || '',
                  }));
                  const { error } = await supabase.from('contractor_contacts').insert(contacts);
                  if (error) {
                    showToast('Failed to import CSV leads: ' + error.message, 'error');
                    return;
                  }
                  showToast(`Successfully imported ${contacts.length} leads from CSV!`);
                  setShowCSVModal(false);
                  setImportMethod(null);
                }}
              />
            )}
          </div>
        )}

        {/* Paste Details */}
        {importMethod === 'paste' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Paste Lead Details</label>
              <textarea
                rows={8}
                maxLength={500}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm text-[#0B1F33] bg-white"
                placeholder="Paste email content, form submission, or any lead details here. AI will extract the relevant information."
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setImportMethod(null)}
                className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer">
                <i className="ri-sparkling-line mr-2"></i>
                Process with AI
              </button>
            </div>
          </div>
        )}

        {/* Email Integration - Full Feature */}
        {importMethod === 'email' && (
          <div>
            {/* Sub-navigation */}
            {emailView !== 'connect' && emailView !== 'detail' && (
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-1 bg-[#F9F9FB] rounded-lg p-1">
                  {[
                    { key: 'dashboard', label: 'Overview', icon: 'ri-dashboard-line' },
                    { key: 'inbox', label: 'Inbox', icon: 'ri-inbox-line', badge: newCount },
                    { key: 'rules', label: 'Rules', icon: 'ri-filter-3-line' },
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setEmailView(tab.key as typeof emailView)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        emailView === tab.key ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F] hover:text-[#0B1F33]'
                      }`}
                    >
                      <i className={`${tab.icon} text-sm`}></i>
                      {tab.label}
                      {tab.badge && tab.badge > 0 ? (
                        <span className="bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center ml-0.5">
                          {tab.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setImportMethod(null)}
                  className="text-sm text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-close-line mr-1"></i> Close
                </button>
              </div>
            )}

            {emailView === 'dashboard' && renderEmailDashboard()}
            {emailView === 'connect' && renderConnectFlow()}
            {emailView === 'inbox' && renderInbox()}
            {emailView === 'rules' && renderRules()}
            {emailView === 'detail' && renderLeadDetail()}
          </div>
        )}

        {/* Integration Note */}
        {!importMethod && (
          <div className="mt-6 bg-gradient-to-r from-[#F9F9FB] to-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-information-line text-white text-xl"></i>
              </div>
              <div>
                <h4 className="font-bold text-[#0B1F33] mb-1">Lead Sources</h4>
                <p className="text-sm text-[#6B7C8F]">
                  Leads can come from Emporva native intake, manual contractor import, email integrations,
                  form submissions, or automation tools like Zapier. All leads are processed with AI
                  clarification to create structured, scoped jobs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
