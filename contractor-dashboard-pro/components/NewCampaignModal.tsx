
import { useState, useEffect } from 'react';

interface NewCampaignData {
  name: string;
  type: 'post-job' | 'seasonal' | 'maintenance' | 'referral' | 'promotion' | 'newsletter' | 'custom';
  channel: 'email' | 'sms' | 'both';
  subject: string;
  messageBody: string;
  audienceType: 'all' | 'segment' | 'manual';
  audienceFilters: {
    contactTypes: string[];
    statuses: string[];
    tags: string[];
    lastContactDays: number | null;
    jobHistory: string[];
  };
  manualRecipients: string[];
  scheduleType: 'now' | 'scheduled' | 'triggered';
  scheduledDate: string;
  scheduledTime: string;
  triggerEvent: string;
  repeatEnabled: boolean;
  repeatFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
}

interface NewCampaignModalProps {
  onClose: () => void;
  onSave: (campaign: NewCampaignData) => void;
  businessName?: string;
}

const campaignTypes = [
  { id: 'post-job', label: 'Post-Job Follow-Up', icon: 'ri-mail-send-line', color: 'bg-emerald-100 text-emerald-600', desc: 'Automatically follow up after completing a job' },
  { id: 'seasonal', label: 'Seasonal Promo', icon: 'ri-sun-line', color: 'bg-green-100 text-green-600', desc: 'Promote seasonal services and special offers' },
  { id: 'maintenance', label: 'Maintenance Reminder', icon: 'ri-tools-line', color: 'bg-amber-100 text-amber-600', desc: 'Remind clients about annual maintenance' },
  { id: 'referral', label: 'Referral Request', icon: 'ri-gift-line', color: 'bg-yellow-100 text-yellow-600', desc: 'Ask satisfied clients for referrals' },
  { id: 'promotion', label: 'Special Promotion', icon: 'ri-price-tag-3-line', color: 'bg-rose-100 text-rose-600', desc: 'Announce discounts and limited-time deals' },
  { id: 'newsletter', label: 'Newsletter', icon: 'ri-newspaper-line', color: 'bg-teal-100 text-teal-600', desc: 'Share tips, updates, and company news' },
  { id: 'custom', label: 'Custom Campaign', icon: 'ri-edit-2-line', color: 'bg-gray-100 text-gray-600', desc: 'Build a campaign from scratch' },
];

const contactTags = [
  'HVAC', 'Plumbing', 'Electrical', 'Roofing', 'Painting', 'Flooring',
  'Commercial', 'Residential', 'High-Value', 'Referral', 'Repeat Client',
  'New Lead', 'VIP', 'Insurance', 'Emergency'
];

const mockContacts = [
  { id: 1, name: 'Sarah Mitchell', email: 'sarah.m@email.com', type: 'Homeowner', status: 'Active', tags: ['HVAC', 'Repeat Client'] },
  { id: 2, name: 'David Thompson', email: 'david.t@email.com', type: 'Homeowner', status: 'Active', tags: ['Plumbing', 'High-Value'] },
  { id: 3, name: 'Jennifer Rodriguez', email: 'jen.r@email.com', type: 'Homeowner', status: 'Active', tags: ['Electrical', 'Referral'] },
  { id: 4, name: 'Michael Brown', email: 'mike.b@email.com', type: 'Property Manager', status: 'Active', tags: ['Commercial', 'HVAC'] },
  { id: 5, name: 'Amanda Garcia', email: 'amanda.g@email.com', type: 'Homeowner', status: 'Lead', tags: ['Roofing', 'New Lead'] },
  { id: 6, name: 'Robert Wilson', email: 'rob.w@email.com', type: 'Homeowner', status: 'Active', tags: ['Plumbing', 'VIP'] },
  { id: 7, name: 'Lisa Wong', email: 'lisa.w@email.com', type: 'Property Manager', status: 'Active', tags: ['Commercial', 'Electrical'] },
  { id: 8, name: 'Marcus Chen', email: 'marcus.c@email.com', type: 'Homeowner', status: 'Inactive', tags: ['HVAC', 'Residential'] },
  { id: 9, name: 'Patricia Nguyen', email: 'pat.n@email.com', type: 'Homeowner', status: 'Active', tags: ['Painting', 'Repeat Client'] },
  { id: 10, name: 'James Foster', email: 'james.f@email.com', type: 'Homeowner', status: 'Lead', tags: ['Flooring', 'New Lead'] },
  { id: 11, name: 'Karen Phillips', email: 'karen.p@email.com', type: 'Property Manager', status: 'Active', tags: ['Commercial', 'High-Value'] },
  { id: 12, name: 'Tom Bradley', email: 'tom.b@email.com', type: 'Homeowner', status: 'Active', tags: ['Roofing', 'Insurance'] },
];

const messageTemplates: Record<string, { subject: string; body: string }> = {
  'post-job': {
    subject: 'How was your experience with us?',
    body: 'Hi {first_name},\n\nWe just wrapped up your {job_type} project and wanted to check in. We hope everything looks great!\n\nIf you have a moment, we\'d really appreciate a quick review. Your feedback helps us improve and helps other homeowners find quality service.\n\nThank you for choosing us!\n\nBest regards,\nYour team at {businessName}'
  },
  'seasonal': {
    subject: 'Seasonal special — limited time offer!',
    body: 'Hi {first_name},\n\nThe season is changing, and it\'s the perfect time to get your home ready! We\'re offering a special seasonal discount on our most popular services.\n\n\u2705 15% off all tune-ups and inspections\n\u2705 Free diagnostic with any service call\n\u2705 Priority scheduling for existing clients\n\nDon\'t wait until the rush — book your appointment today!\n\nBest regards,\nYour team at {businessName}'
  },
  'maintenance': {
    subject: 'Your annual maintenance check is due',
    body: 'Hi {first_name},\n\nIt\'s been about a year since your last {service_type} service. Regular maintenance prevents costly repairs and keeps your systems running efficiently.\n\nWe recommend scheduling your annual check-up soon to:\n\n\u2022 Extend equipment lifespan\n\u2022 Maintain warranty coverage\n\u2022 Prevent emergency breakdowns\n\nReply to this message or call us to schedule at your convenience.\n\nBest regards,\nYour team at {businessName}'
  },
  'referral': {
    subject: 'Know someone who needs help?',
    body: 'Hi {first_name}!\n\nThank you for being a valued client. We love working with great homeowners like you!\n\nIf you know anyone who needs home services, we\'d appreciate the referral. As a thank you, you\'ll both receive $50 off your next service.\n\nSimply share our name or reply with their contact info, and we\'ll take it from there.\n\nThanks again!\nYour team at {businessName}'
  },
  'promotion': {
    subject: 'Exclusive deal — just for you!',
    body: 'Hi {first_name},\n\nAs a valued client, we\'re giving you early access to our exclusive promotion!\n\n\ud83c\udf1f Special Offer Details:\n\u2022 20% off any service booked this month\n\u2022 Free consultation included\n\u2022 Flexible scheduling available\n\nThis offer is limited and available only to our existing clients. Don\'t miss out!\n\nBook now and save.\n\nBest regards,\nYour team at {businessName}'
  },
  'newsletter': {
    subject: 'Monthly update — tips & news from your pro team',
    body: 'Hi {first_name},\n\nHere\'s what\'s new this month:\n\n\ud83d\udee0\ufe0f Pro Tip: Check your water heater\'s anode rod annually to prevent tank corrosion and extend its life by 3-5 years.\n\n\ud83d\udce2 Company News: We\'ve expanded our team and now offer same-day emergency service!\n\n\ud83d\udcc5 Upcoming: Spring maintenance season is approaching. Book early for preferred scheduling.\n\nHave questions? Just reply to this email.\n\nBest regards,\nYour team at {businessName}'
  },
  'custom': {
    subject: '',
    body: ''
  }
};

const triggerEvents = [
  { id: 'job_complete', label: 'Job Completed', icon: 'ri-checkbox-circle-line' },
  { id: 'anniversary', label: 'Service Anniversary', icon: 'ri-calendar-event-line' },
  { id: 'quote_sent', label: 'Quote Sent (No Response)', icon: 'ri-file-list-3-line' },
  { id: 'new_lead', label: 'New Lead Added', icon: 'ri-user-add-line' },
  { id: 'inactive_30', label: 'Inactive for 30 Days', icon: 'ri-time-line' },
  { id: 'birthday', label: 'Client Birthday', icon: 'ri-cake-2-line' },
];

export default function NewCampaignModal({ onClose, onSave, businessName = 'Your Business' }: NewCampaignModalProps) {
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [contactSearch, setContactSearch] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxSmsChars = 320;

  const [data, setData] = useState<NewCampaignData>({
    name: '',
    type: 'post-job',
    channel: 'email',
    subject: '',
    messageBody: '',
    audienceType: 'all',
    audienceFilters: {
      contactTypes: [],
      statuses: [],
      tags: [],
      lastContactDays: null,
      jobHistory: [],
    },
    manualRecipients: [],
    scheduleType: 'now',
    scheduledDate: '',
    scheduledTime: '09:00',
    triggerEvent: '',
    repeatEnabled: false,
    repeatFrequency: 'weekly',
  });

  useEffect(() => {
    if (data.channel === 'sms' || data.channel === 'both') {
      setCharCount(data.messageBody.length);
    }
  }, [data.messageBody, data.channel]);

  const updateData = (updates: Partial<NewCampaignData>) => {
    setData(prev => ({ ...prev, ...updates }));
    setErrors({});
  };

  const updateFilters = (updates: Partial<NewCampaignData['audienceFilters']>) => {
    setData(prev => ({
      ...prev,
      audienceFilters: { ...prev.audienceFilters, ...updates }
    }));
  };

  const toggleArrayItem = (arr: string[], item: string) => {
    return arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item];
  };

  const applyTemplate = (typeId: string) => {
    const template = messageTemplates[typeId];
    if (template) {
      updateData({
        subject: template.subject,
        messageBody: template.body,
      });
    }
  };

  const getEstimatedAudience = () => {
    if (data.audienceType === 'all') return mockContacts.length;
    if (data.audienceType === 'manual') return data.manualRecipients.length;
    let filtered = mockContacts;
    if (data.audienceFilters.contactTypes.length > 0) {
      filtered = filtered.filter(c => data.audienceFilters.contactTypes.includes(c.type));
    }
    if (data.audienceFilters.statuses.length > 0) {
      filtered = filtered.filter(c => data.audienceFilters.statuses.includes(c.status));
    }
    if (data.audienceFilters.tags.length > 0) {
      filtered = filtered.filter(c => c.tags.some(t => data.audienceFilters.tags.includes(t)));
    }
    return filtered.length;
  };

  const filteredContacts = mockContacts.filter(c =>
    contactSearch === '' ||
    c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

  const validateStep = (s: number): boolean => {
    const newErrors: Record<string, string> = {};
    if (s === 1) {
      if (!data.name.trim()) newErrors.name = 'Campaign name is required';
    }
    if (s === 2) {
      if (data.audienceType === 'manual' && data.manualRecipients.length === 0) {
        newErrors.audience = 'Select at least one recipient';
      }
    }
    if (s === 3) {
      if (data.channel !== 'sms' && !data.subject.trim()) newErrors.subject = 'Subject line is required';
      if (!data.messageBody.trim()) newErrors.messageBody = 'Message body is required';
    }
    if (s === 4) {
      if (data.scheduleType === 'scheduled') {
        if (!data.scheduledDate) newErrors.scheduledDate = 'Select a date';
        if (!data.scheduledTime) newErrors.scheduledTime = 'Select a time';
      }
      if (data.scheduleType === 'triggered' && !data.triggerEvent) {
        newErrors.triggerEvent = 'Select a trigger event';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (validateStep(step)) {
      if (step === 1 && data.type !== 'custom') {
        applyTemplate(data.type);
      }
      setStep(step + 1);
    }
  };

  const goBack = () => setStep(step - 1);

  const handleSave = (asDraft: boolean) => {
    if (!asDraft && !validateStep(step)) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => {
        onSave(data);
      }, 1200);
    }, 1500);
  };

  const steps = [
    { num: 1, label: 'Basics', icon: 'ri-settings-3-line' },
    { num: 2, label: 'Audience', icon: 'ri-group-line' },
    { num: 3, label: 'Message', icon: 'ri-mail-line' },
    { num: 4, label: 'Schedule', icon: 'ri-calendar-schedule-line' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[94vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ animation: 'fadeScaleIn 0.2s ease-out' }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {saved ? 'Campaign Created!' : 'Create New Campaign'}
              </h3>
              {!saved && (
                <p className="text-xs text-[#6B7C8F] mt-1">Step {step} of 4 &mdash; {steps[step - 1].label}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer flex-shrink-0"
            >
              <i className="ri-close-line text-[#0B1F33] text-xl"></i>
            </button>
          </div>

          {/* Step Indicator */}
          {!saved && !saving && (
            <div className="flex items-center gap-2">
              {steps.map((s, idx) => (
                <div key={s.num} className="flex items-center flex-1">
                  <div className={`flex items-center gap-2 flex-1 ${idx < steps.length - 1 ? '' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      step > s.num ? 'bg-teal-500 text-white' :
                      step === s.num ? 'bg-[#0B1F33] text-white' :
                      'bg-gray-100 text-[#6B7C8F]'
                    }`}>
                      {step > s.num ? (
                        <i className="ri-check-line text-sm"></i>
                      ) : (
                        <i className={`${s.icon} text-sm`}></i>
                      )}
                    </div>
                    <span className={`text-xs font-semibold hidden sm:block ${
                      step >= s.num ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'
                    }`}>{s.label}</span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className={`h-0.5 flex-1 mx-2 rounded-full transition-all ${
                      step > s.num ? 'bg-teal-500' : 'bg-gray-200'
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Saving State */}
          {saving && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0B1F33] rounded-full animate-spin mb-6"></div>
              <p className="text-lg font-bold text-[#0B1F33]">Creating your campaign...</p>
              <p className="text-sm text-[#6B7C8F] mt-1">Setting up audience and scheduling</p>
            </div>
          )}

          {/* Saved State */}
          {saved && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mb-6" style={{ animation: 'bounceIn 0.5s ease-out' }}>
                <i className="ri-check-double-line text-teal-600 text-4xl"></i>
              </div>
              <p className="text-2xl font-bold text-[#0B1F33] mb-2">Campaign Created!</p>
              <p className="text-sm text-[#6B7C8F] text-center max-w-md">
                &ldquo;{data.name}&rdquo; has been created and {data.scheduleType === 'now' ? 'will be sent shortly' : data.scheduleType === 'scheduled' ? `is scheduled for ${data.scheduledDate}` : 'is set up with your trigger'}.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="bg-[#F9F9FB] rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-[#6B7C8F]">Recipients</p>
                  <p className="text-lg font-bold text-[#0B1F33]">{getEstimatedAudience()}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-[#6B7C8F]">Channel</p>
                  <p className="text-lg font-bold text-[#0B1F33] capitalize">{data.channel === 'both' ? 'Email + SMS' : data.channel}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-[#6B7C8F]">Schedule</p>
                  <p className="text-lg font-bold text-[#0B1F33] capitalize">{data.scheduleType === 'now' ? 'Immediate' : data.scheduleType}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Basics */}
          {!saving && !saved && step === 1 && (
            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Campaign Name *</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => updateData({ name: e.target.value })}
                  placeholder="e.g., Spring HVAC Tune-Up Special"
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
                    errors.name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0B1F33]'
                  }`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Campaign Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {campaignTypes.map((ct) => (
                    <button
                      key={ct.id}
                      onClick={() => updateData({ type: ct.id as NewCampaignData['type'] })}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        data.type === ct.id
                          ? 'border-[#0B1F33] bg-[#F9F9FB]'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${ct.color.split(' ')[0]}`}>
                        <i className={`${ct.icon} text-lg ${ct.color.split(' ')[1]}`}></i>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0B1F33]">{ct.label}</p>
                        <p className="text-[11px] text-[#6B7C8F] leading-tight mt-0.5">{ct.desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Delivery Channel</label>
                <div className="flex gap-3">
                  {[
                    { id: 'email', label: 'Email Only', icon: 'ri-mail-line', desc: 'Rich HTML emails' },
                    { id: 'sms', label: 'SMS Only', icon: 'ri-message-2-line', desc: 'Text messages' },
                    { id: 'both', label: 'Email + SMS', icon: 'ri-mail-send-line', desc: 'Maximum reach' },
                  ].map((ch) => (
                    <button
                      key={ch.id}
                      onClick={() => updateData({ channel: ch.id as NewCampaignData['channel'] })}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        data.channel === ch.id
                          ? 'border-[#0B1F33] bg-[#F9F9FB]'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        data.channel === ch.id ? 'bg-[#0B1F33]' : 'bg-gray-100'
                      }`}>
                        <i className={`${ch.icon} text-lg ${data.channel === ch.id ? 'text-white' : 'text-[#6B7C8F]'}`}></i>
                      </div>
                      <p className="text-xs font-semibold text-[#0B1F33]">{ch.label}</p>
                      <p className="text-[10px] text-[#6B7C8F]">{ch.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Audience */}
          {!saving && !saved && step === 2 && (
            <div className="space-y-6">
              {/* Audience Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Target Audience</label>
                <div className="flex gap-3">
                  {[
                    { id: 'all', label: 'All Contacts', icon: 'ri-group-line', desc: `${mockContacts.length} contacts` },
                    { id: 'segment', label: 'Filtered Segment', icon: 'ri-filter-3-line', desc: 'Target specific groups' },
                    { id: 'manual', label: 'Manual Select', icon: 'ri-user-search-line', desc: 'Pick individually' },
                  ].map((at) => (
                    <button
                      key={at.id}
                      onClick={() => updateData({ audienceType: at.id as NewCampaignData['audienceType'] })}
                      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                        data.audienceType === at.id
                          ? 'border-[#0B1F33] bg-[#F9F9FB]'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        data.audienceType === at.id ? 'bg-[#0B1F33]' : 'bg-gray-100'
                      }`}>
                        <i className={`${at.icon} text-lg ${data.audienceType === at.id ? 'text-white' : 'text-[#6B7C8F]'}`}></i>
                      </div>
                      <p className="text-xs font-semibold text-[#0B1F33]">{at.label}</p>
                      <p className="text-[10px] text-[#6B7C8F]">{at.desc}</p>
                    </button>
                  ))}
                </div>
                {errors.audience && <p className="text-xs text-red-500 mt-2">{errors.audience}</p>}
              </div>

              {/* Segment Filters */}
              {data.audienceType === 'segment' && (
                <div className="space-y-5 bg-[#F9F9FB] rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <i className="ri-filter-3-line text-[#6B7C8F]"></i>
                    <h4 className="text-sm font-bold text-[#0B1F33]">Audience Filters</h4>
                  </div>

                  {/* Contact Type */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Contact Type</label>
                    <div className="flex gap-2">
                      {['Homeowner', 'Property Manager'].map((ct) => (
                        <button
                          key={ct}
                          onClick={() => updateFilters({ contactTypes: toggleArrayItem(data.audienceFilters.contactTypes, ct) })}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            data.audienceFilters.contactTypes.includes(ct)
                              ? 'bg-[#0B1F33] text-white'
                              : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {ct}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Status</label>
                    <div className="flex gap-2">
                      {['Active', 'Lead', 'Inactive'].map((st) => (
                        <button
                          key={st}
                          onClick={() => updateFilters({ statuses: toggleArrayItem(data.audienceFilters.statuses, st) })}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            data.audienceFilters.statuses.includes(st)
                              ? 'bg-[#0B1F33] text-white'
                              : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Service Tags</label>
                    <div className="flex flex-wrap gap-1.5">
                      {contactTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => updateFilters({ tags: toggleArrayItem(data.audienceFilters.tags, tag) })}
                          className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            data.audienceFilters.tags.includes(tag)
                              ? 'bg-teal-600 text-white'
                              : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Last Contact */}
                  <div>
                    <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Last Contacted</label>
                    <div className="flex gap-2">
                      {[
                        { val: null, label: 'Any time' },
                        { val: 7, label: 'Last 7 days' },
                        { val: 30, label: 'Last 30 days' },
                        { val: 90, label: 'Last 90 days' },
                        { val: 180, label: '6+ months ago' },
                      ].map((opt) => (
                        <button
                          key={String(opt.val)}
                          onClick={() => updateFilters({ lastContactDays: opt.val })}
                          className={`px-3 py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            data.audienceFilters.lastContactDays === opt.val
                              ? 'bg-[#0B1F33] text-white'
                              : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Manual Selection */}
              {data.audienceType === 'manual' && (
                <div className="space-y-3">
                  <div className="relative">
                    <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-[#6B7C8F]"></i>
                    <input
                      type="text"
                      value={contactSearch}
                      onChange={(e) => setContactSearch(e.target.value)}
                      placeholder="Search contacts by name or email..."
                      className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0B1F33] transition-colors"
                    />
                  </div>

                  {data.manualRecipients.length > 0 && (
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-[#6B7C8F] font-semibold">Selected ({data.manualRecipients.length}):</span>
                      {data.manualRecipients.map(id => {
                        const c = mockContacts.find(mc => String(mc.id) === id);
                        return c ? (
                          <span key={id} className="inline-flex items-center gap-1 px-2 py-1 bg-[#0B1F33] text-white rounded-full text-[10px] font-semibold">
                            {c.name}
                            <button
                              onClick={() => updateData({ manualRecipients: data.manualRecipients.filter(r => r !== id) })}
                              className="hover:text-red-300 cursor-pointer"
                            >
                              <i className="ri-close-line text-xs"></i>
                            </button>
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-100 rounded-xl p-2">
                    {filteredContacts.map((contact) => {
                      const isSelected = data.manualRecipients.includes(String(contact.id));
                      return (
                        <button
                          key={contact.id}
                          onClick={() => {
                            updateData({
                              manualRecipients: isSelected
                                ? data.manualRecipients.filter(r => r !== String(contact.id))
                                : [...data.manualRecipients, String(contact.id)]
                            });
                          }}
                          className={`w-full flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer text-left ${
                            isSelected ? 'bg-[#0B1F33]/5 border border-[#0B1F33]/20' : 'hover:bg-[#F9F9FB]'
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                            isSelected ? 'bg-[#0B1F33] text-white' : 'bg-gray-100 text-[#6B7C8F]'
                          }`}>
                            {isSelected ? <i className="ri-check-line"></i> : contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-[#0B1F33] truncate">{contact.name}</p>
                            <p className="text-[11px] text-[#6B7C8F] truncate">{contact.email}</p>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              contact.status === 'Active' ? 'bg-green-100 text-green-700' :
                              contact.status === 'Lead' ? 'bg-amber-100 text-amber-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{contact.status}</span>
                            <span className="text-[10px] text-[#6B7C8F]">{contact.type}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Estimated Audience */}
              <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <i className="ri-group-line text-teal-600 text-xl"></i>
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0B1F33]">Estimated Audience: {getEstimatedAudience()} contacts</p>
                  <p className="text-xs text-[#6B7C8F] mt-0.5">
                    {data.audienceType === 'all' ? 'All contacts in your CRM will receive this campaign' :
                     data.audienceType === 'segment' ? 'Contacts matching your filter criteria' :
                     'Manually selected recipients'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Message */}
          {!saving && !saved && step === 3 && (
            <div className="space-y-5">
              {/* Quick Templates */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Quick Templates</label>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {Object.entries(messageTemplates).filter(([k]) => k !== 'custom').map(([key, tmpl]) => (
                    <button
                      key={key}
                      onClick={() => {
                        updateData({ subject: tmpl.subject, messageBody: tmpl.body });
                      }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#F9F9FB] rounded-lg text-[11px] font-semibold text-[#6B7C8F] hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap flex-shrink-0"
                    >
                      <i className="ri-file-text-line text-sm"></i>
                      {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject Line */}
              {data.channel !== 'sms' && (
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Subject Line *</label>
                  <input
                    type="text"
                    value={data.subject}
                    onChange={(e) => updateData({ subject: e.target.value })}
                    placeholder="Enter email subject line..."
                    className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors ${
                      errors.subject ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#0B1F33]'
                    }`}
                  />
                  {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject}</p>}
                  <p className="text-[10px] text-[#6B7C8F] mt-1">{data.subject.length}/80 characters recommended</p>
                </div>
              )}

              {/* Message Body */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Message Body *</label>
                <textarea
                  value={data.messageBody}
                  onChange={(e) => {
                    if ((data.channel === 'sms') && e.target.value.length > maxSmsChars) return;
                    updateData({ messageBody: e.target.value });
                  }}
                  placeholder="Write your message here..."
                  rows={10}
                  maxLength={500}
                  className={`w-full px-4 py-3 border-2 rounded-xl text-sm focus:outline-none transition-colors resize-none leading-relaxed ${
                    errors.messageBody ? 'border-red-300 focus:border:red-400' : 'border-gray-200 focus:border-[#0B1F33]'
                  }`}
                />
                {errors.messageBody && <p className="text-xs text-red-500 mt-1">{errors.messageBody}</p>}
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-[#6B7C8F]">{data.messageBody.length}/500 characters</p>
                  {(data.channel === 'sms' || data.channel === 'both') && (
                    <p className="text-[10px] text-[#6B7C8F]">
                      SMS: {charCount} chars &bull; {Math.ceil(charCount / 160) || 1} segment{Math.ceil(charCount / 160) > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Merge Tags */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Insert Merge Tag</label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { tag: '{first_name}', label: 'First Name' },
                    { tag: '{last_name}', label: 'Last Name' },
                    { tag: '{job_type}', label: 'Job Type' },
                    { tag: '{service_type}', label: 'Service Type' },
                    { tag: '{company_name}', label: 'Company' },
                  ].map((mt) => (
                    <button
                      key={mt.tag}
                      onClick={() => updateData({ messageBody: data.messageBody + mt.tag })}
                      className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-lg text-[11px] font-semibold text-amber-700 hover:bg-amber-100 transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-code-s-slash-line text-xs"></i>
                      {mt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div>
                <label className="block text-xs font-semibold text-[#6B7C8F] mb-2 uppercase tracking-wide">Preview</label>
                <div className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden">
                  <div className="bg-[#0B1F33] p-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-6 h-6 bg-[#D4B483] rounded-md flex items-center justify-center">
                        <i className="ri-building-2-line text-white text-sm"></i>
                      </div>
                      <span className="text-white font-bold text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>{businessName}</span>
                    </div>
                  </div>
                  <div className="p-5">
                    {data.subject && data.channel !== 'sms' && (
                      <p className="text-xs font-bold text-[#0B1F33] mb-3 pb-3 border-b border-gray-100">
                        Subject: {data.subject}
                      </p>
                    )}
                    <p className="text-sm text-[#0B1F33] leading-relaxed whitespace-pre-line">
                      {data.messageBody || 'Your message will appear here...'}
                    </p>
                  </div>
                  <div className="bg-[#F9F9FB] p-3 border-t border-gray-100 text-center">
                    <p className="text-[9px] text-[#6B7C8F]">Sent via {businessName} &bull; Unsubscribe &bull; Privacy Policy</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Schedule */}
          {!saving && !saved && step === 4 && (
            <div className="space-y-6">
              {/* Schedule Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-3">When should this campaign send?</label>
                <div className="space-y-3">
                  {[
                    { id: 'now', label: 'Send Immediately', icon: 'ri-send-plane-line', desc: 'Campaign will be sent right away to all recipients' },
                    { id: 'scheduled', label: 'Schedule for Later', icon: 'ri-calendar-schedule-line', desc: 'Pick a specific date and time to send' },
                    { id: 'triggered', label: 'Event Triggered', icon: 'ri-flashlight-line', desc: 'Automatically send when a specific event occurs' },
                  ].map((st) => (
                    <button
                      key={st.id}
                      onClick={() => updateData({ scheduleType: st.id as NewCampaignData['scheduleType'] })}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        data.scheduleType === st.id
                          ? 'border-[#0B1F33] bg-[#F9F9FB]'
                          : 'border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        data.scheduleType === st.id ? 'bg-[#0B1F33]' : 'bg-gray-100'
                      }`}>
                        <i className={`${st.icon} text-xl ${data.scheduleType === st.id ? 'text-white' : 'text-[#6B7C8F]'}`}></i>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33]">{st.label}</p>
                        <p className="text-xs text-[#6B7C8F] mt-0.5">{st.desc}</p>
                      </div>
                      <div className="ml-auto flex-shrink-0">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          data.scheduleType === st.id ? 'border-[#0B1F33] bg-[#0B1F33]' : 'border-gray-300'
                        }`}>
                          {data.scheduleType === st.id && <i className="ri-check-line text-white text-xs"></i>}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Scheduled Date/Time */}
              {data.scheduleType === 'scheduled' && (
                <div className="bg-[#F9F9FB] rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
                    <i className="ri-calendar-line text-[#6B7C8F]"></i>
                    Schedule Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7C8F] mb-1.5">Date *</label>
                      <input
                        type="date"
                        value={data.scheduledDate}
                        onChange={(e) => updateData({ scheduledDate: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors cursor-pointer ${
                          errors.scheduledDate ? 'border-red-300' : 'border-gray-200 focus:border-[#0B1F33]'
                        }`}
                      />
                      {errors.scheduledDate && <p className="text-xs text-red-500 mt-1">{errors.scheduledDate}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7C8F] mb-1.5">Time *</label>
                      <input
                        type="time"
                        value={data.scheduledTime}
                        onChange={(e) => updateData({ scheduledTime: e.target.value })}
                        className={`w-full px-4 py-2.5 border-2 rounded-xl text-sm focus:outline-none transition-colors cursor-pointer ${
                          errors.scheduledTime ? 'border-red-300' : 'border-gray-200 focus:border-[#0B1F33]'
                        }`}
                      />
                      {errors.scheduledTime && <p className="text-xs text-red-500 mt-1">{errors.scheduledTime}</p>}
                    </div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                    <i className="ri-time-line text-amber-600 mt-0.5"></i>
                    <p className="text-xs text-amber-700">Times are in your local timezone. Campaign will be queued and sent at the scheduled time.</p>
                  </div>
                </div>
              )}

              {/* Trigger Event */}
              {data.scheduleType === 'triggered' && (
                <div className="bg-[#F9F9FB] rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
                    <i className="ri-flashlight-line text-[#6B7C8F]"></i>
                    Trigger Event
                  </h4>
                  {errors.triggerEvent && <p className="text-xs text-red-500">{errors.triggerEvent}</p>}
                  <div className="grid grid-cols-2 gap-2">
                    {triggerEvents.map((te) => (
                      <button
                        key={te.id}
                        onClick={() => updateData({ triggerEvent: te.id })}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all cursor-pointer text-left ${
                          data.triggerEvent === te.id
                            ? 'border-[#0B1F33] bg-white'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          data.triggerEvent === te.id ? 'bg-[#0B1F33]' : 'bg-gray-100'
                        }`}>
                          <i className={`${te.icon} text-base ${data.triggerEvent === te.id ? 'text-white' : 'text-[#6B7C8F]'}`}></i>
                        </div>
                        <span className="text-xs font-semibold text-[#0B1F33]">{te.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Repeat */}
              {data.scheduleType !== 'now' && (
                <div className="bg-[#F9F9FB] rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <i className="ri-repeat-line text-[#6B7C8F]"></i>
                      <h4 className="text-sm font-bold text-[#0B1F33]">Repeat Campaign</h4>
                    </div>
                    <button
                      onClick={() => updateData({ repeatEnabled: !data.repeatEnabled })}
                      className={`w-11 h-6 rounded-full transition-all cursor-pointer flex items-center ${
                        data.repeatEnabled ? 'bg-teal-500 justify-end' : 'bg-gray-300 justify-start'
                      }`}
                    >
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm mx-0.5"></div>
                    </button>
                  </div>
                  {data.repeatEnabled && (
                    <div className="flex gap-2">
                      {(['daily', 'weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                        <button
                          key={freq}
                          onClick={() => updateData({ repeatFrequency: freq })}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap capitalize ${
                            data.repeatFrequency === freq
                              ? 'bg-[#0B1F33] text-white'
                              : 'bg-white text-[#6B7C8F] border border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {freq === 'biweekly' ? 'Bi-Weekly' : freq}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Summary */}
              <div className="bg-[#0B1F33] rounded-xl p-5 text-white">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <i className="ri-file-list-3-line text-[#D4B483]"></i>
                  Campaign Summary
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Name</p>
                    <p className="text-sm font-semibold mt-0.5 truncate">{data.name || '—'}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Type</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">{data.type.replace('-', ' ')}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Channel</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">{data.channel === 'both' ? 'Email + SMS' : data.channel}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Recipients</p>
                    <p className="text-sm font-semibold mt-0.5">{getEstimatedAudience()} contacts</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Schedule</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">
                      {data.scheduleType === 'now' ? 'Immediate' :
                       data.scheduleType === 'scheduled' ? `${data.scheduledDate} at ${data.scheduledTime}` :
                       triggerEvents.find(t => t.id === data.triggerEvent)?.label || 'Triggered'}
                    </p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3">
                    <p className="text-[10px] text-white/60 uppercase tracking-wide">Repeat</p>
                    <p className="text-sm font-semibold mt-0.5 capitalize">
                      {data.repeatEnabled ? (data.repeatFrequency === 'biweekly' ? 'Bi-Weekly' : data.repeatFrequency) : 'One-time'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!saving && !saved && (
          <div className="p-5 border-t border-gray-100 flex items-center gap-3 bg-[#F9F9FB] flex-shrink-0">
            {step > 1 && (
              <button
                onClick={goBack}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-arrow-left-line"></i>
                Back
              </button>
            )}
            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-draft-line"></i>
              Save as Draft
            </button>
            <div className="flex-1" />
            {step < 4 ? (
              <button
                onClick={goNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
              >
                Continue
                <i className="ri-arrow-right-line"></i>
              </button>
            ) : (
              <button
                onClick={() => handleSave(false)}
                className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-send-plane-line"></i>
                {data.scheduleType === 'now' ? 'Create & Send' : 'Create Campaign'}
              </button>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes bounceIn {
          0% { transform: scale(0); }
          50% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
