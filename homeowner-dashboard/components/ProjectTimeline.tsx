
import { useState } from 'react';

interface ProjectTimelineProps {
  jobId: number;
  jobTitle: string;
  contractor: string;
}

interface TimelineEvent {
  id: number;
  timestamp: string;
  date: string;
  actor: 'contractor' | 'homeowner' | 'system';
  actorName: string;
  type: 'milestone' | 'payment' | 'document' | 'message' | 'photo' | 'approval' | 'change-order' | 'task' | 'material' | 'note' | 'schedule';
  title: string;
  description: string;
  metadata?: {
    amount?: string;
    status?: string;
    count?: number;
    photoUrl?: string;
  };
}

const typeConfig: Record<string, { icon: string; color: string; bg: string; ring: string }> = {
  milestone: { icon: 'ri-flag-line', color: 'text-[#00B8A9]', bg: 'bg-[#00B8A9]', ring: 'ring-[#00B8A9]/20' },
  payment: { icon: 'ri-money-dollar-circle-line', color: 'text-green-600', bg: 'bg-green-500', ring: 'ring-green-200' },
  document: { icon: 'ri-file-text-line', color: 'text-[#D4B483]', bg: 'bg-[#D4B483]', ring: 'ring-[#D4B483]/20' },
  message: { icon: 'ri-message-3-line', color: 'text-[#0B1F33]', bg: 'bg-[#0B1F33]', ring: 'ring-[#0B1F33]/20' },
  photo: { icon: 'ri-camera-line', color: 'text-pink-600', bg: 'bg-pink-500', ring: 'ring-pink-200' },
  approval: { icon: 'ri-shield-check-line', color: 'text-green-600', bg: 'bg-green-500', ring: 'ring-green-200' },
  'change-order': { icon: 'ri-exchange-line', color: 'text-orange-600', bg: 'bg-orange-500', ring: 'ring-orange-200' },
  task: { icon: 'ri-checkbox-circle-line', color: 'text-[#00B8A9]', bg: 'bg-[#00B8A9]', ring: 'ring-[#00B8A9]/20' },
  material: { icon: 'ri-box-3-line', color: 'text-[#2D2A74]', bg: 'bg-[#2D2A74]', ring: 'ring-[#2D2A74]/20' },
  note: { icon: 'ri-sticky-note-line', color: 'text-amber-600', bg: 'bg-amber-500', ring: 'ring-amber-200' },
  schedule: { icon: 'ri-calendar-check-line', color: 'text-[#0B1F33]', bg: 'bg-[#0B1F33]', ring: 'ring-[#0B1F33]/20' },
};

const actorConfig: Record<string, { label: string; color: string; bg: string }> = {
  contractor: { label: 'Contractor', color: 'text-[#00B8A9]', bg: 'bg-[#00B8A9]/10' },
  homeowner: { label: 'You', color: 'text-[#0B1F33]', bg: 'bg-[#0B1F33]/10' },
  system: { label: 'Emporva', color: 'text-[#6B7C8F]', bg: 'bg-gray-100' },
};

const jobTimelineData: Record<number, TimelineEvent[]> = {
  1: [
    { id: 1, timestamp: '9:14 AM', date: 'Jan 21, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'photo', title: 'Uploaded 4 Progress Photos', description: 'Dehumidifier setup and calibration documentation — before, during, and after shots of the installation process.', metadata: { count: 4, photoUrl: 'https://readdy.ai/api/search-image?query=commercial%20dehumidifier%20unit%20positioned%20in%20crawlspace%20on%20vapor%20barrier%20with%20condensate%20drain%20line%20connected%20professional%20HVAC%20equipment%20installation%20well%20lit%20clean%20workspace&width=320&height=200&seq=tl1&orientation=landscape' } },
    { id: 2, timestamp: '8:45 AM', date: 'Jan 21, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'milestone', title: 'Submitted Milestone for Approval', description: 'Dehumidifier Setup & Calibration marked as complete. All 5 tasks finished. Awaiting your review to release $990.00 payment.', metadata: { amount: '$990.00', status: 'awaiting-approval' } },
    { id: 3, timestamp: '8:30 AM', date: 'Jan 21, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'task', title: 'Completed Task: Run 24-hour Test Cycle', description: 'Final task in the Dehumidifier Setup milestone. Humidity levels stable at 47% after 24-hour monitoring period.' },
    { id: 4, timestamp: '7:15 AM', date: 'Jan 21, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'note', title: 'Added Completion Note', description: 'All tasks completed. 24-hour test cycle passed — humidity levels stable at 47%. Ready for your review.' },
    { id: 5, timestamp: '4:30 PM', date: 'Jan 20, 2025', actor: 'homeowner', actorName: 'You', type: 'approval', title: 'Approved Change Order', description: 'You approved the change order for additional insulation coverage on the north wall section. Budget adjusted by +$300.00.', metadata: { amount: '+$300.00' } },
    { id: 6, timestamp: '2:15 PM', date: 'Jan 20, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'change-order', title: 'Submitted Change Order', description: 'Additional Insulation Coverage — Extended spray foam insulation to cover north wall section with visible moisture damage.', metadata: { amount: '+$300.00', status: 'pending' } },
    { id: 7, timestamp: '11:00 AM', date: 'Jan 20, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'task', title: 'Completed 3 Tasks', description: 'Position dehumidifier unit, Connect condensate drain line, Wire electrical connection — all completed in the Dehumidifier Setup milestone.', metadata: { count: 3 } },
    { id: 8, timestamp: '9:30 AM', date: 'Jan 20, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'material', title: 'Material Status Update', description: 'Spray Foam Insulation (12 cans) shipped and in transit. Expected delivery: Jan 22. All other materials for current phase delivered.', metadata: { status: 'in-transit' } },
    { id: 9, timestamp: '3:00 PM', date: 'Jan 19, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'document', title: 'Shared Dehumidifier Warranty Card', description: '5-year manufacturer warranty documentation uploaded and shared with you for your records.' },
    { id: 10, timestamp: '10:00 AM', date: 'Jan 19, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'schedule', title: 'Started Milestone: Dehumidifier Setup', description: 'Dehumidifier Setup & Calibration phase has begun. Estimated completion: Jan 22, 2025.' },
    { id: 11, timestamp: '2:30 PM', date: 'Jan 18, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'document', title: 'Shared Dehumidifier Spec Sheet', description: 'Technical specifications for the 70-pint dehumidifier unit uploaded for your review.' },
    { id: 12, timestamp: '11:45 AM', date: 'Jan 17, 2025', actor: 'homeowner', actorName: 'You', type: 'approval', title: 'Approved Milestone: Vapor Barrier Installation', description: 'You approved the completed vapor barrier installation and released payment of $1,485.00 to Mike Thompson.', metadata: { amount: '$1,485.00' } },
    { id: 13, timestamp: '11:30 AM', date: 'Jan 17, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'photo', title: 'Uploaded Installation Photos', description: 'New 6-mil vapor barrier installation complete — 8 photos documenting the finished work.', metadata: { count: 8, photoUrl: 'https://readdy.ai/api/search-image?query=new%20white%20vapor%20barrier%20plastic%20sheeting%20installed%20in%20crawlspace%20with%20sealed%20seams%20using%20butyl%20tape%20clean%20professional%20installation%20secured%20to%20foundation%20walls%20bright%20work%20lights%20showing%20quality%20finish&width=320&height=200&seq=tl2&orientation=landscape' } },
    { id: 14, timestamp: '10:00 AM', date: 'Jan 17, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'milestone', title: 'Submitted Milestone for Approval', description: 'Vapor Barrier Installation marked as complete. All 6 tasks finished. Submitted for your review.', metadata: { amount: '$1,485.00' } },
    { id: 15, timestamp: '9:00 AM', date: 'Jan 16, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'schedule', title: 'Started Milestone: Vapor Barrier Installation', description: 'Vapor barrier installation phase has begun. Old barrier removal and surface prep underway.' },
    { id: 16, timestamp: '4:00 PM', date: 'Jan 15, 2025', actor: 'system', actorName: 'Emporva', type: 'payment', title: 'Payment Released: Initial Assessment', description: 'Milestone 1 payment of $990.00 automatically released after homeowner approval.', metadata: { amount: '$990.00' } },
    { id: 17, timestamp: '3:45 PM', date: 'Jan 15, 2025', actor: 'homeowner', actorName: 'You', type: 'approval', title: 'Approved Milestone: Initial Assessment', description: 'You approved the initial assessment and remediation plan. Payment of $990.00 released.', metadata: { amount: '$990.00' } },
    { id: 18, timestamp: '2:00 PM', date: 'Jan 15, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'milestone', title: 'Submitted Milestone for Approval', description: 'Initial Assessment & Planning marked as complete. Remediation plan submitted for your review.', metadata: { amount: '$990.00' } },
    { id: 19, timestamp: '9:32 AM', date: 'Jan 15, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'photo', title: 'Uploaded Assessment Photos', description: 'Initial moisture damage documentation — 2 photos showing moisture readings and damage on east wall joists.', metadata: { count: 2, photoUrl: 'https://readdy.ai/api/search-image?query=crawlspace%20with%20visible%20moisture%20damage%20on%20wooden%20beams%20and%20floor%20joists%20dark%20damp%20environment%20with%20condensation%20droplets%20professional%20inspection%20photo%20with%20flashlight%20illumination%20showing%20water%20stains%20and%20mold%20growth&width=320&height=200&seq=tl3&orientation=landscape' } },
    { id: 20, timestamp: '9:00 AM', date: 'Jan 15, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'schedule', title: 'Project Started', description: 'Crawlspace Moisture Remediation project officially started. Mike Thompson arrived on-site for initial assessment.' },
    { id: 21, timestamp: '5:00 PM', date: 'Jan 14, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'document', title: 'Shared Service Agreement', description: 'Service Agreement for Crawlspace Remediation uploaded and shared. Signed by both parties.' },
    { id: 22, timestamp: '3:00 PM', date: 'Jan 13, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'document', title: 'Shared Building Permit', description: 'Building Permit #CLT-2025-0847 approved by Mecklenburg County and uploaded to the project.' },
    { id: 23, timestamp: '10:00 AM', date: 'Jan 12, 2025', actor: 'homeowner', actorName: 'You', type: 'document', title: 'Uploaded Insurance Policy', description: 'State Farm homeowner insurance policy covering water damage uploaded and shared with contractor.' },
    { id: 24, timestamp: '9:00 AM', date: 'Jan 12, 2025', actor: 'contractor', actorName: 'Mike Thompson', type: 'document', title: 'Shared Liability Insurance', description: 'Contractor liability insurance certificate uploaded for your records.' },
    { id: 25, timestamp: '2:00 PM', date: 'Jan 10, 2025', actor: 'homeowner', actorName: 'You', type: 'document', title: 'Uploaded Pre-Work Inspection', description: 'Home inspection report showing crawlspace moisture issues uploaded to the project.' },
    { id: 26, timestamp: '11:00 AM', date: 'Jan 10, 2025', actor: 'system', actorName: 'Emporva', type: 'schedule', title: 'Job Created', description: 'Crawlspace Moisture Remediation job created on Emporva. Mike Thompson assigned as contractor. Start date: Jan 15, 2025.' },
  ],
  2: [
    { id: 50, timestamp: '2:00 PM', date: 'Jan 20, 2025', actor: 'contractor', actorName: 'Sarah Martinez', type: 'document', title: 'Shared Diagnostic Agreement', description: 'HVAC Diagnostic Agreement uploaded and shared for your review.' },
    { id: 51, timestamp: '11:00 AM', date: 'Jan 20, 2025', actor: 'contractor', actorName: 'Sarah Martinez', type: 'document', title: 'Shared Inspection Checklist', description: 'System inspection checklist uploaded — pending your review.' },
    { id: 52, timestamp: '9:00 AM', date: 'Jan 19, 2025', actor: 'homeowner', actorName: 'You', type: 'document', title: 'Uploaded HVAC Maintenance History', description: 'Last 3 years of HVAC service records shared with contractor.' },
    { id: 53, timestamp: '3:00 PM', date: 'Jan 18, 2025', actor: 'system', actorName: 'Emporva', type: 'schedule', title: 'Job Created', description: 'HVAC System Diagnostic & Repair job created. Sarah Martinez assigned. Scheduled for Jan 22-23.' },
  ],
  3: [
    { id: 60, timestamp: '10:00 AM', date: 'Jan 25, 2025', actor: 'contractor', actorName: 'David Chen', type: 'document', title: 'Shared Roof Replacement Quote', description: 'Detailed quote for south-side shingle replacement uploaded for your approval.' },
    { id: 61, timestamp: '3:00 PM', date: 'Jan 24, 2025', actor: 'homeowner', actorName: 'You', type: 'photo', title: 'Uploaded Roof Damage Photos', description: 'Photos of storm damage on south-facing roof section shared with contractor.', metadata: { count: 6 } },
    { id: 62, timestamp: '11:00 AM', date: 'Jan 23, 2025', actor: 'system', actorName: 'Emporva', type: 'schedule', title: 'Job Created', description: 'Roof Shingle Replacement job created. David Chen assigned. Pending approval to start Feb 5.' },
  ],
  4: [
    { id: 70, timestamp: '4:00 PM', date: 'Jan 11, 2025', actor: 'homeowner', actorName: 'You', type: 'approval', title: 'Approved Final Milestone', description: 'Water heater replacement approved. Final payment of $2,100.00 released.', metadata: { amount: '$2,100.00' } },
    { id: 71, timestamp: '3:00 PM', date: 'Jan 11, 2025', actor: 'contractor', actorName: 'James Wilson', type: 'milestone', title: 'Submitted for Final Approval', description: 'Water heater installation complete. All 4 tasks finished. Submitted for your review.', metadata: { amount: '$2,100.00' } },
    { id: 72, timestamp: '2:00 PM', date: 'Jan 11, 2025', actor: 'contractor', actorName: 'James Wilson', type: 'document', title: 'Shared Warranty & Invoice', description: 'Water heater warranty (10-year tank, 6-year parts) and final invoice uploaded.' },
    { id: 73, timestamp: '9:00 AM', date: 'Jan 10, 2025', actor: 'contractor', actorName: 'James Wilson', type: 'schedule', title: 'Project Started', description: 'Water heater replacement started. Old unit disconnected and removed.' },
    { id: 74, timestamp: '8:00 AM', date: 'Jan 9, 2025', actor: 'contractor', actorName: 'James Wilson', type: 'document', title: 'Shared Installation Contract', description: 'Water heater installation contract uploaded and signed.' },
    { id: 75, timestamp: '2:00 PM', date: 'Jan 8, 2025', actor: 'system', actorName: 'Emporva', type: 'schedule', title: 'Job Created', description: 'Water Heater Replacement job created. James Wilson assigned. Start date: Jan 10.' },
  ],
};

export default function ProjectTimeline({ jobId, jobTitle: _jobTitle, contractor }: ProjectTimelineProps) {
  const [actorFilter, setActorFilter] = useState<'all' | 'contractor' | 'homeowner' | 'system'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const allEvents = jobTimelineData[jobId] || jobTimelineData[1];

  const filteredEvents = allEvents.filter(e => {
    const matchesActor = actorFilter === 'all' || e.actor === actorFilter;
    const matchesType = typeFilter === 'all' || e.type === typeFilter;
    return matchesActor && matchesType;
  });

  // Group events by date
  const groupedEvents: Record<string, TimelineEvent[]> = {};
  filteredEvents.forEach(e => {
    if (!groupedEvents[e.date]) groupedEvents[e.date] = [];
    groupedEvents[e.date].push(e);
  });

  const dates = Object.keys(groupedEvents);

  const contractorActions = allEvents.filter(e => e.actor === 'contractor').length;
  const homeownerActions = allEvents.filter(e => e.actor === 'homeowner').length;
  const systemActions = allEvents.filter(e => e.actor === 'system').length;

  const eventTypes = Array.from(new Set(allEvents.map(e => e.type)));

  const isToday = (dateStr: string) => {
    const today = new Date();
    const formatted = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return dateStr === formatted;
  };

  const isYesterday = (dateStr: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatted = yesterday.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return dateStr === formatted;
  };

  const getDateLabel = (dateStr: string) => {
    if (isToday(dateStr)) return 'Today';
    if (isYesterday(dateStr)) return 'Yesterday';
    return dateStr;
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div
          onClick={() => setActorFilter(actorFilter === 'contractor' ? 'all' : 'contractor')}
          className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${
            actorFilter === 'contractor' ? 'border-[#00B8A9] bg-[#00B8A9]/5' : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
              <i className="ri-hammer-line text-[#00B8A9]"></i>
            </div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Contractor</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{contractorActions}</p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>actions by {contractor.split(' ')[0]}</p>
        </div>
        <div
          onClick={() => setActorFilter(actorFilter === 'homeowner' ? 'all' : 'homeowner')}
          className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${
            actorFilter === 'homeowner' ? 'border-[#0B1F33] bg-[#0B1F33]/5' : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center">
              <i className="ri-user-line text-[#0B1F33]"></i>
            </div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Your Actions</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{homeownerActions}</p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>approvals &amp; uploads</p>
        </div>
        <div
          onClick={() => setActorFilter(actorFilter === 'system' ? 'all' : 'system')}
          className={`rounded-xl p-4 cursor-pointer transition-all border-2 ${
            actorFilter === 'system' ? 'border-[#6B7C8F] bg-gray-50' : 'border-gray-100 bg-white hover:border-gray-200'
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
              <i className="ri-robot-line text-[#6B7C8F]"></i>
            </div>
            <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>System</span>
          </div>
          <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>{systemActions}</p>
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>automated events</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider" style={{ fontFamily: 'Montserrat, sans-serif' }}>Filter by type:</span>
        <div className="flex gap-2 overflow-x-auto pb-1 flex-1">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
              typeFilter === 'all' ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
            }`}
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            All ({filteredEvents.length})
          </button>
          {eventTypes.map(t => {
            const config = typeConfig[t];
            const count = allEvents.filter(e => e.type === t && (actorFilter === 'all' || e.actor === actorFilter)).length;
            if (count === 0) return null;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(typeFilter === t ? 'all' : t)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5 ${
                  typeFilter === t ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className={`${config.icon} text-xs ${typeFilter === t ? 'text-white' : ''}`}></i>
                {t.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                <span className={typeFilter === t ? 'text-white/70' : 'text-gray-400'}>{count}</span>
              </button>
            );
          })}
        </div>
        {(actorFilter !== 'all' || typeFilter !== 'all') && (
          <button
            onClick={() => { setActorFilter('all'); setTypeFilter('all'); }}
            className="px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg cursor-pointer whitespace-nowrap flex items-center gap-1 transition-colors"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-close-line"></i>Clear Filters
          </button>
        )}
      </div>

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <i className="ri-time-line text-gray-300 text-5xl mb-3 block"></i>
          <p className="text-sm text-[#6B7C8F] font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>No events match the current filters</p>
          <button
            onClick={() => { setActorFilter('all'); setTypeFilter('all'); }}
            className="mt-3 px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {dates.map((date) => {
            const events = groupedEvents[date];
            return (
              <div key={date}>
                {/* Date Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                    isToday(date) ? 'bg-[#00B8A9] text-white' : 'bg-[#F9F9FB] text-[#0B1F33]'
                  }`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    {getDateLabel(date)}
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{events.length} event{events.length > 1 ? 's' : ''}</span>
                </div>

                {/* Events */}
                <div className="space-y-0">
                  {events.map((event, idx) => {
                    const config = typeConfig[event.type];
                    const aConfig = actorConfig[event.actor];
                    const isExpanded = expandedEvent === event.id;
                    const isLast = idx === events.length - 1;

                    return (
                      <div key={event.id} className="relative flex gap-4">
                        {/* Timeline Line & Dot */}
                        <div className="flex flex-col items-center flex-shrink-0" style={{ width: '32px' }}>
                          <div className={`w-8 h-8 rounded-full ${config.bg} ring-4 ${config.ring} flex items-center justify-center z-10 flex-shrink-0`}>
                            <i className={`${config.icon} text-white text-sm`}></i>
                          </div>
                          {!isLast && (
                            <div className="w-0.5 flex-1 bg-gray-200 min-h-[16px]"></div>
                          )}
                        </div>

                        {/* Event Card */}
                        <div
                          className={`flex-1 mb-3 rounded-xl border transition-all cursor-pointer ${
                            isExpanded
                              ? 'border-[#00B8A9]/40 bg-[#00B8A9]/5 shadow-sm'
                              : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm'
                          }`}
                          onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        >
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${aConfig.bg} ${aConfig.color}`} style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                    {event.actorName}
                                  </span>
                                  <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{event.timestamp}</span>
                                </div>
                                <h5 className="font-semibold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                                  {event.title}
                                </h5>
                                {!isExpanded && (
                                  <p className="text-xs text-[#6B7C8F] mt-1 line-clamp-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {event.description}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                {event.metadata?.amount && (
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                    event.type === 'payment' || event.type === 'approval' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                                  }`} style={{ fontFamily: 'Poppins, sans-serif' }}>
                                    {event.metadata.amount}
                                  </span>
                                )}
                                {event.metadata?.count && event.type === 'photo' && (
                                  <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded-lg text-xs font-semibold flex items-center gap-1">
                                    <i className="ri-image-line text-xs"></i>{event.metadata.count}
                                  </span>
                                )}
                                <i className={`ri-arrow-${isExpanded ? 'up' : 'down'}-s-line text-[#6B7C8F]`}></i>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {isExpanded && (
                              <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-sm text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  {event.description}
                                </p>
                                {event.metadata?.photoUrl && (
                                  <div className="mt-3 rounded-lg overflow-hidden border border-gray-100 w-64 h-40">
                                    <img src={event.metadata.photoUrl} alt={event.title} className="w-full h-full object-cover object-top" />
                                  </div>
                                )}
                                {event.metadata?.status && (
                                  <div className="mt-3 flex items-center gap-2">
                                    <span className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Status:</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
                                      event.metadata.status === 'awaiting-approval' ? 'bg-orange-100 text-orange-700' :
                                      event.metadata.status === 'in-transit' ? 'bg-[#00B8A9]/10 text-[#00B8A9]' :
                                      event.metadata.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                      'bg-gray-100 text-gray-600'
                                    }`}>
                                      {event.metadata.status.replace('-', ' ')}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h4 className="font-bold text-[#0B1F33] text-sm mb-3 flex items-center gap-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          <i className="ri-information-line text-[#00B8A9]"></i>
          Timeline Legend
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(typeConfig).map(([key, config]) => (
            <div key={key} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center flex-shrink-0`}>
                <i className={`${config.icon} text-white text-xs`}></i>
              </div>
              <span className="text-xs text-[#6B7C8F] capitalize" style={{ fontFamily: 'Inter, sans-serif' }}>
                {key.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
