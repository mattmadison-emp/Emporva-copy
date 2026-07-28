import { useState, useEffect, useCallback, DragEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import MonthCalendarView from './MonthCalendarView';

interface Reminder {
  type: 'email' | 'sms' | 'both';
  timing: string;
  enabled: boolean;
}

interface RecurrenceConfig {
  enabled: boolean;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  endAfter: number;
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
}

interface Job {
  id: string;
  name: string;
  day: number;
  time: string;
  duration: string;
  color: string;
  type: 'job' | 'appointment';
  recurring?: RecurrenceConfig;
  reminders?: Reminder[];
  isRecurringInstance?: boolean;
  parentId?: string;
  assignedCrew?: string[];
  notes?: string;
  address?: string;
  appointmentType?: string;
  clientName?: string;
}

interface NewAppointment {
  clientName: string;
  address: string;
  date: string;
  time: string;
  duration: string;
  notes: string;
  type: string;
  recurring: RecurrenceConfig;
  reminders: Reminder[];
  assignedCrew: string[];
}

const DEFAULT_REMINDERS: Reminder[] = [
  { type: 'email', timing: '24 hours before', enabled: true },
  { type: 'sms', timing: '1 hour before', enabled: false },
];

export default function CalendarView() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false);
  const [showReminderPanel, setShowReminderPanel] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobForReminder, setSelectedJobForReminder] = useState<Job | null>(null);
  const [reminderToast, setReminderToast] = useState<string | null>(null);
  const [draggedJob, setDraggedJob] = useState<Job | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<number | null>(null);
  const [editingCrew, setEditingCrew] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState('');

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const [weekOffset, setWeekOffset] = useState(0);

  const getWeekStart = useCallback((offset: number) => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + mondayOffset + offset * 7);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }, []);

  const currentWeekStart = getWeekStart(weekOffset);
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6);

  const formatWeekRange = (start: Date, end: Date) => {
    const opts: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric' };
    const startStr = start.toLocaleDateString('en-US', opts);
    const endStr = end.toLocaleDateString('en-US', { ...opts, year: 'numeric' });
    return `${startStr} - ${endStr}`;
  };

  const getWeekDayDate = (dayIndex: number) => {
    const d = new Date(currentWeekStart);
    d.setDate(currentWeekStart.getDate() + dayIndex);
    return d.getDate();
  };

  const [jobs, setJobs] = useState<Job[]>([]);
  const [CREW_MEMBERS, setCrewMembers] = useState<CrewMember[]>([]);

  const fetchCrew = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('team_members')
      .select('id, name, role, color')
      .eq('user_id', user.id)
      .eq('active', true);
    if (data) {
      setCrewMembers(data.map(c => ({
        id: c.id,
        name: c.name,
        role: c.role || '',
        avatar: c.name.split(' ').map((w: string) => w.charAt(0)).join('').slice(0, 2).toUpperCase(),
        color: c.color || 'bg-blue-500',
      })));
    }
  }, [user]);

  useEffect(() => { fetchCrew(); }, [fetchCrew]);

  const jobColors = [
    'bg-blue-100 border-blue-500',
    'bg-green-100 border-green-500',
    'bg-purple-100 border-purple-500',
    'bg-yellow-100 border-yellow-500',
    'bg-rose-100 border-rose-500',
    'bg-cyan-100 border-cyan-500',
    'bg-orange-100 border-orange-500',
  ];

  // Fetch scheduled work items from DB
  const fetchCalendarJobs = useCallback(async () => {
    if (!user) return;

    const { data: workItems } = await supabase
      .from('work_items')
      .select('id, job_id, title, trade, status, start_date, end_date')
      .eq('contractor_id', user.id)
      .in('status', ['assigned', 'in-progress'])
      .not('start_date', 'is', null);

    if (!workItems || workItems.length === 0) return;

    const jobIds = [...new Set(workItems.map(w => w.job_id))];
    const workItemIds = workItems.map(w => w.id);

    const [jobsResult, profilesResult, crewResult] = await Promise.all([
      supabase.from('jobs').select('id, title, user_id, location').in('id', jobIds),
      supabase.from('profiles').select('id, first_name, last_name'),
      supabase.from('job_team_assignments').select('work_item_id, crew_member_id').in('work_item_id', workItemIds),
    ]);

    const dbJobs = jobsResult.data;
    const crewAssignments = crewResult.data;

    const homeownerIds = [...new Set((dbJobs || []).map(j => j.user_id))];
    const allProfiles = (profilesResult.data || []).filter((p: { id: string }) => homeownerIds.includes(p.id));
    const nameMap = Object.fromEntries(allProfiles.map((p: { id: string; first_name: string; last_name: string }) => [p.id, `${p.first_name} ${p.last_name}`]));
    const jobMap = Object.fromEntries((dbJobs || []).map(j => [j.id, j]));

    // Build crew assignment map: work_item_id -> crew_member_ids[]
    const crewMap: Record<string, string[]> = {};
    for (const a of (crewAssignments || [])) {
      if (!crewMap[a.work_item_id]) crewMap[a.work_item_id] = [];
      crewMap[a.work_item_id].push(a.crew_member_id);
    }

    const weekStart = getWeekStart(weekOffset);

    const calendarJobs: Job[] = workItems.map((wi, idx) => {
      const job = jobMap[wi.job_id];
      const clientName = job ? nameMap[job.user_id] || '' : '';
      const startDate = new Date(wi.start_date + 'T00:00:00');
      const dayIndex = Math.floor((startDate.getTime() - weekStart.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: wi.id,
        name: `${job?.title || wi.title} - ${clientName.split(' ')[1] || clientName}`,
        day: Math.max(0, Math.min(6, dayIndex)),
        time: '9:00 AM',
        duration: 'All Day',
        color: jobColors[idx % jobColors.length],
        type: 'job' as const,
        assignedCrew: crewMap[wi.id] || [],
        notes: `${wi.trade} — ${wi.status}`,
        address: job?.location || '',
        clientName,
      };
    });

    setJobs(calendarJobs);
  }, [user, weekOffset, getWeekStart]);

  useEffect(() => {
    fetchCalendarJobs();
  }, [fetchCalendarJobs]);

  const [newAppointment, setNewAppointment] = useState<NewAppointment>({
    clientName: '',
    address: '',
    date: '',
    time: '09:00',
    duration: '1 hour',
    notes: '',
    type: 'Working',
    recurring: { enabled: false, frequency: 'weekly', endAfter: 4 },
    reminders: [...DEFAULT_REMINDERS],
    assignedCrew: []
  });

  const handleDragStart = (e: DragEvent<HTMLDivElement>, job: Job) => {
    setDraggedJob(job);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', job.id);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>, dayIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetDay(dayIndex);
  };

  const handleDragLeave = () => {
    setDropTargetDay(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>, targetDay: number) => {
    e.preventDefault();
    setDropTargetDay(null);
    if (draggedJob && draggedJob.day !== targetDay) {
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.id === draggedJob.id ? { ...job, day: targetDay } : job
        )
      );
    }
    setDraggedJob(null);
  };

  const handleDragEnd = () => {
    setDraggedJob(null);
    setDropTargetDay(null);
  };

  const openJobDetail = (job: Job) => {
    setSelectedJob(job);
    setTempNotes(job.notes || '');
    setEditingCrew(false);
    setEditingNotes(false);
    setShowDetailModal(true);
  };

  const toggleCrewOnJob = (crewId: string) => {
    if (!selectedJob) return;
    const current = selectedJob.assignedCrew || [];
    const updated = current.includes(crewId)
      ? current.filter(id => id !== crewId)
      : [...current, crewId];
    const updatedJob = { ...selectedJob, assignedCrew: updated };
    setSelectedJob(updatedJob);
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? updatedJob : j));
  };

  const saveJobNotes = () => {
    if (!selectedJob) return;
    const updatedJob = { ...selectedJob, notes: tempNotes };
    setSelectedJob(updatedJob);
    setJobs(prev => prev.map(j => j.id === selectedJob.id ? updatedJob : j));
    setEditingNotes(false);
    showToast('Notes saved');
  };

  const toggleNewAppointmentCrew = (crewId: string) => {
    setNewAppointment(prev => ({
      ...prev,
      assignedCrew: prev.assignedCrew.includes(crewId)
        ? prev.assignedCrew.filter(id => id !== crewId)
        : [...prev.assignedCrew, crewId]
    }));
  };

  const getCrewMember = (id: string) => CREW_MEMBERS.find(c => c.id === id);

  const handleCreateAppointment = () => {
    if (!newAppointment.clientName || !newAppointment.date) return;

    const selectedDate = new Date(newAppointment.date + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    const adjustedDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const timeHour = parseInt(newAppointment.time.split(':')[0]);
    const formattedTime = timeHour >= 12
      ? `${timeHour === 12 ? 12 : timeHour - 12}:${newAppointment.time.split(':')[1]} PM`
      : `${timeHour}:${newAppointment.time.split(':')[1]} AM`;

    const isRecurring = newAppointment.recurring.enabled;
    const activeReminders = newAppointment.reminders.filter(r => r.enabled);

    const newJob: Job = {
      id: `appointment-${Date.now()}`,
      name: `${newAppointment.type} - ${newAppointment.clientName}`,
      day: adjustedDay,
      time: formattedTime,
      duration: newAppointment.duration,
      color: isRecurring ? 'bg-orange-100 border-orange-500' : 'bg-teal-100 border-teal-500',
      type: 'appointment',
      recurring: isRecurring ? { ...newAppointment.recurring } : undefined,
      reminders: activeReminders.length > 0 ? activeReminders : undefined,
      assignedCrew: newAppointment.assignedCrew.length > 0 ? [...newAppointment.assignedCrew] : undefined,
      notes: newAppointment.notes || undefined,
      address: newAppointment.address || undefined,
      appointmentType: newAppointment.type
    };

    setJobs(prev => [...prev, newJob]);

    const reminderTypes = activeReminders.map(r => r.type === 'both' ? 'email & SMS' : r.type).join(', ');
    if (activeReminders.length > 0) {
      showToast(`Appointment created with ${reminderTypes} reminders`);
    } else {
      showToast('Appointment created successfully');
    }

    setNewAppointment({
      clientName: '',
      address: '',
      date: '',
      time: '09:00',
      duration: '1 hour',
      notes: '',
      type: 'Working',
      recurring: { enabled: false, frequency: 'weekly', endAfter: 4 },
      reminders: [...DEFAULT_REMINDERS],
      assignedCrew: []
    });
    setShowNewAppointmentModal(false);
  };

  const showToast = (message: string) => {
    setReminderToast(message);
    setTimeout(() => setReminderToast(null), 3000);
  };

  const openReminderPanel = (job: Job) => {
    setSelectedJobForReminder(job);
    setShowReminderPanel(true);
  };

  const updateJobReminders = (jobId: string, reminders: Reminder[]) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, reminders } : j));
    const active = reminders.filter(r => r.enabled);
    if (active.length > 0) {
      showToast(`Reminders updated for this appointment`);
    }
  };

  const toggleNewReminder = (index: number) => {
    setNewAppointment(prev => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => i === index ? { ...r, enabled: !r.enabled } : r)
    }));
  };

  const updateNewReminderType = (index: number, type: 'email' | 'sms' | 'both') => {
    setNewAppointment(prev => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => i === index ? { ...r, type } : r)
    }));
  };

  const updateNewReminderTiming = (index: number, timing: string) => {
    setNewAppointment(prev => ({
      ...prev,
      reminders: prev.reminders.map((r, i) => i === index ? { ...r, timing } : r)
    }));
  };

  const addNewReminderRow = () => {
    if (newAppointment.reminders.length >= 4) return;
    setNewAppointment(prev => ({
      ...prev,
      reminders: [...prev.reminders, { type: 'email', timing: '30 minutes before', enabled: true }]
    }));
  };

  const removeNewReminderRow = (index: number) => {
    setNewAppointment(prev => ({
      ...prev,
      reminders: prev.reminders.filter((_, i) => i !== index)
    }));
  };

  const frequencyLabel = (freq: string) => {
    switch (freq) {
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Every 2 weeks';
      case 'monthly': return 'Monthly';
      default: return freq;
    }
  };

  const upcomingReminders = jobs
    .filter(j => j.type === 'appointment' && j.reminders && j.reminders.some(r => r.enabled))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="fixed top-6 right-6 z-[60] animate-slide-in">
          <div className="bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-white text-lg"></i>
            </div>
            <span className="text-sm font-semibold">{reminderToast}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">Multi-Job Calendar</h2>
            <p className="text-[#6B7C8F]">Drag to reschedule &bull; Click items for details &bull; Assign crew members</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowNewAppointmentModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-add-line text-lg"></i>
              New Appointment
            </button>
            <div className="flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full">
              <i className="ri-vip-crown-line text-[#0B1F33] text-sm"></i>
              <span className="text-xs font-bold text-[#0B1F33]">Pro</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${viewMode === 'week' ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${viewMode === 'month' ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
              >
                Month
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mb-6 pb-4 border-b border-gray-100 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-[#6B7C8F]">Active Jobs</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-teal-500 rounded"></div>
            <span className="text-sm text-[#6B7C8F]">Appointments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-sm text-[#6B7C8F]">Recurring</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-drag-move-2-line text-[#6B7C8F]"></i>
            <span className="text-sm text-[#6B7C8F]">Drag to reschedule</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-team-line text-[#6B7C8F]"></i>
            <span className="text-sm text-[#6B7C8F]">Crew assigned</span>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => setWeekOffset(prev => prev - 1)} className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
            <i className="ri-arrow-left-s-line text-[#0B1F33] text-xl"></i>
          </button>
          <h3 className="text-xl font-bold text-[#0B1F33]">{formatWeekRange(currentWeekStart, currentWeekEnd)}</h3>
          <button onClick={() => setWeekOffset(prev => prev + 1)} className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer">
            <i className="ri-arrow-right-s-line text-[#0B1F33] text-xl"></i>
          </button>
        </div>

        {/* Calendar Grid */}
        {viewMode === 'month' ? (
          <MonthCalendarView />
        ) : (
        <>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center p-3 bg-[#F9F9FB] rounded-lg">
              <p className="font-bold text-[#0B1F33]">{day}</p>
              <p className="text-sm text-[#6B7C8F]">{getWeekDayDate(index)}</p>
            </div>
          ))}

          {weekDays.map((_, dayIndex) => (
            <div
              key={dayIndex}
              className={`min-h-48 rounded-lg p-2 transition-all ${dropTargetDay === dayIndex ? 'bg-teal-50 border-2 border-dashed border-teal-400' : 'bg-[#F9F9FB]'}`}
              onDragOver={(e) => handleDragOver(e, dayIndex)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dayIndex)}
            >
              <div className="space-y-2">
                {jobs
                  .filter((job) => job.day === dayIndex)
                  .map((job) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job)}
                      onDragEnd={handleDragEnd}
                      onClick={() => openJobDetail(job)}
                      className={`${job.color} border-l-4 rounded p-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${draggedJob?.id === job.id ? 'opacity-50 scale-95' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-[#0B1F33] mb-1">{job.time}</p>
                          <p className="text-xs text-[#0B1F33] font-semibold truncate">{job.name}</p>
                          <p className="text-xs text-[#6B7C8F]">{job.duration}</p>
                          {/* Crew avatars */}
                          {job.assignedCrew && job.assignedCrew.length > 0 && (
                            <div className="flex items-center gap-0.5 mt-1.5">
                              {job.assignedCrew.slice(0, 3).map((crewId) => {
                                const member = getCrewMember(crewId);
                                if (!member) return null;
                                return (
                                  <div
                                    key={crewId}
                                    className={`w-5 h-5 ${member.color} rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white`}
                                    title={member.name}
                                  >
                                    {member.avatar}
                                  </div>
                                );
                              })}
                              {job.assignedCrew.length > 3 && (
                                <div className="w-5 h-5 bg-gray-400 rounded-full flex items-center justify-center text-white text-[8px] font-bold border border-white">
                                  +{job.assignedCrew.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                          {/* Recurring & Reminder badges */}
                          <div className="flex items-center gap-1 mt-1 flex-wrap">
                            {job.recurring?.enabled && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-orange-200/60 rounded text-[10px] font-semibold text-orange-700">
                                <i className="ri-repeat-line text-[10px]"></i>
                                {job.recurring.frequency === 'weekly' ? 'W' : job.recurring.frequency === 'biweekly' ? '2W' : 'M'}
                              </span>
                            )}
                            {job.reminders && job.reminders.some(r => r.enabled) && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-teal-200/60 rounded text-[10px] font-semibold text-teal-700">
                                <i className="ri-notification-3-line text-[10px]"></i>
                                {job.reminders.filter(r => r.enabled).length}
                              </span>
                            )}
                            {job.notes && (
                              <span className="inline-flex items-center px-1.5 py-0.5 bg-gray-200/60 rounded text-[10px] font-semibold text-gray-600">
                                <i className="ri-sticky-note-line text-[10px]"></i>
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-center gap-1 ml-1">
                          <i className="ri-draggable text-[#6B7C8F] text-sm"></i>
                          {job.type === 'appointment' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openReminderPanel(job); }}
                              className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/60 transition-colors cursor-pointer"
                              title="Manage reminders"
                            >
                              <i className="ri-notification-3-line text-[#6B7C8F] text-xs hover:text-teal-600"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                {dropTargetDay === dayIndex && draggedJob && (
                  <div className="border-2 border-dashed border-teal-400 rounded p-2 text-center">
                    <p className="text-xs text-teal-600 font-semibold">Drop here to move</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Conflict Alerts */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-alert-line text-yellow-600 text-xl"></i>
            </div>
            <div>
              <h4 className="font-bold text-[#0B1F33] mb-1">Scheduling Conflict Detected</h4>
              <p className="text-sm text-[#6B7C8F]">
                Kitchen Renovation milestone overlaps with Deck Installation start date on April 24.
                Consider adjusting the timeline or coordinating with both clients.
              </p>
            </div>
          </div>
        </div>
        </>
        )}
      </div>

      {/* Upcoming Reminders Panel */}
      {viewMode === 'week' && (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <i className="ri-notification-3-line text-teal-600 text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B1F33]">Upcoming Reminders</h3>
              <p className="text-sm text-[#6B7C8F]">Automated notifications for your appointments</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 rounded-lg">
            <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-teal-700">{upcomingReminders.length} active</span>
          </div>
        </div>

        {upcomingReminders.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-[#F9F9FB] rounded-xl flex items-center justify-center mx-auto mb-3">
              <i className="ri-notification-off-line text-[#6B7C8F] text-2xl"></i>
            </div>
            <p className="text-sm text-[#6B7C8F]">No active reminders. Add reminders when creating appointments.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map((job) => {
              const activeReminders = job.reminders!.filter(r => r.enabled);
              return (
                <div key={job.id} className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`w-1.5 h-12 rounded-full ${job.recurring?.enabled ? 'bg-orange-500' : 'bg-teal-500'}`}></div>
                    <div>
                      <p className="text-sm font-bold text-[#0B1F33]">{job.name}</p>
                      <p className="text-xs text-[#6B7C8F]">{weekDays[job.day]}, {job.time} &bull; {job.duration}</p>
                      {job.recurring?.enabled && (
                        <p className="text-xs text-orange-600 font-semibold mt-0.5">
                          <i className="ri-repeat-line mr-1"></i>
                          {frequencyLabel(job.recurring.frequency)} &bull; {job.recurring.endAfter} occurrences
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Crew avatars in reminder row */}
                    {job.assignedCrew && job.assignedCrew.length > 0 && (
                      <div className="flex items-center -space-x-1.5 mr-2">
                        {job.assignedCrew.slice(0, 2).map((crewId) => {
                          const member = getCrewMember(crewId);
                          if (!member) return null;
                          return (
                            <div
                              key={crewId}
                              className={`w-6 h-6 ${member.color} rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white`}
                              title={member.name}
                            >
                              {member.avatar}
                            </div>
                          );
                        })}
                        {job.assignedCrew.length > 2 && (
                          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-[9px] font-bold border-2 border-white">
                            +{job.assignedCrew.length - 2}
                          </div>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      {activeReminders.map((r, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg border border-gray-200 text-xs font-semibold text-[#0B1F33]">
                          <i className={`${r.type === 'email' ? 'ri-mail-line' : r.type === 'sms' ? 'ri-smartphone-line' : 'ri-mail-line'} text-teal-600 text-xs`}></i>
                          {r.type === 'both' && <i className="ri-smartphone-line text-teal-600 text-xs -ml-1"></i>}
                          {r.timing.replace(' before', '')}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => openReminderPanel(job)}
                      className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-gray-200 hover:border-teal-300 hover:bg-teal-50 transition-colors cursor-pointer"
                    >
                      <i className="ri-settings-3-line text-[#6B7C8F] text-sm"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      )}

      {/* Job/Appointment Detail Modal */}
      {showDetailModal && selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className={`p-6 border-b border-gray-100 ${selectedJob.type === 'appointment' ? 'bg-gradient-to-r from-teal-50 to-white' : 'bg-gradient-to-r from-blue-50 to-white'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${selectedJob.type === 'appointment' ? 'bg-teal-100' : 'bg-blue-100'}`}>
                    <i className={`${selectedJob.type === 'appointment' ? 'ri-calendar-check-line text-teal-600' : 'ri-briefcase-line text-blue-600'} text-2xl`}></i>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1F33]">{selectedJob.name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${selectedJob.type === 'appointment' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'}`}>
                        {selectedJob.type === 'appointment' ? (selectedJob.appointmentType || 'Appointment') : 'Active Job'}
                      </span>
                      {selectedJob.recurring?.enabled && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-orange-100 rounded-full text-[10px] font-bold text-orange-700">
                          <i className="ri-repeat-line text-[10px]"></i>
                          {frequencyLabel(selectedJob.recurring.frequency)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-[#0B1F33] text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Schedule Info */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#F9F9FB] rounded-xl p-3 text-center">
                  <i className="ri-calendar-line text-[#6B7C8F] text-lg mb-1 block"></i>
                  <p className="text-xs text-[#6B7C8F]">Day</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{weekDays[selectedJob.day]}, {(() => { const d = new Date(currentWeekStart); d.setDate(currentWeekStart.getDate() + selectedJob.day); return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); })()}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-xl p-3 text-center">
                  <i className="ri-time-line text-[#6B7C8F] text-lg mb-1 block"></i>
                  <p className="text-xs text-[#6B7C8F]">Time</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{selectedJob.time}</p>
                </div>
                <div className="bg-[#F9F9FB] rounded-xl p-3 text-center">
                  <i className="ri-timer-line text-[#6B7C8F] text-lg mb-1 block"></i>
                  <p className="text-xs text-[#6B7C8F]">Duration</p>
                  <p className="text-sm font-bold text-[#0B1F33]">{selectedJob.duration}</p>
                </div>
              </div>

              {/* Customer */}
              {selectedJob.clientName && (
                <div className="flex items-start gap-3 p-3 bg-[#F9F9FB] rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-user-line text-[#6B7C8F]"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7C8F] mb-0.5">Customer</p>
                    <p className="text-sm font-semibold text-[#0B1F33]">{selectedJob.clientName}</p>
                  </div>
                </div>
              )}

              {/* Address */}
              {selectedJob.address && (
                <div className="flex items-start gap-3 p-3 bg-[#F9F9FB] rounded-xl">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className="ri-map-pin-line text-[#6B7C8F]"></i>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7C8F] mb-0.5">Location</p>
                    <p className="text-sm font-semibold text-[#0B1F33]">{selectedJob.address}</p>
                  </div>
                </div>
              )}

              {/* Crew Assignment */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-team-line text-[#0B1F33]"></i>
                    <h4 className="text-sm font-bold text-[#0B1F33]">Assigned Crew</h4>
                    {selectedJob.assignedCrew && selectedJob.assignedCrew.length > 0 && (
                      <span className="text-xs text-[#6B7C8F]">({selectedJob.assignedCrew.length})</span>
                    )}
                  </div>
                  <button
                    onClick={() => setEditingCrew(!editingCrew)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                  >
                    <i className={editingCrew ? 'ri-check-line' : 'ri-pencil-line'}></i>
                    {editingCrew ? 'Done' : 'Edit'}
                  </button>
                </div>

                {!editingCrew ? (
                  <div className="space-y-2">
                    {selectedJob.assignedCrew && selectedJob.assignedCrew.length > 0 ? (
                      selectedJob.assignedCrew.map((crewId) => {
                        const member = getCrewMember(crewId);
                        if (!member) return null;
                        return (
                          <div key={crewId} className="flex items-center gap-3 p-2.5 bg-[#F9F9FB] rounded-xl">
                            <div className={`w-9 h-9 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                              {member.avatar}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[#0B1F33]">{member.name}</p>
                              <p className="text-xs text-[#6B7C8F]">{member.role}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-4 bg-[#F9F9FB] rounded-xl">
                        <i className="ri-user-add-line text-[#6B7C8F] text-2xl mb-1 block"></i>
                        <p className="text-xs text-[#6B7C8F]">No crew assigned yet</p>
                        <button
                          onClick={() => setEditingCrew(true)}
                          className="text-xs font-semibold text-teal-600 mt-1 cursor-pointer hover:text-teal-700"
                        >
                          Assign crew members
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5 bg-[#F9F9FB] rounded-xl p-3">
                    {CREW_MEMBERS.map((member) => {
                      const isAssigned = selectedJob.assignedCrew?.includes(member.id) || false;
                      return (
                        <button
                          key={member.id}
                          onClick={() => toggleCrewOnJob(member.id)}
                          className={`flex items-center gap-3 p-2.5 rounded-lg transition-all cursor-pointer ${isAssigned ? 'bg-teal-50 border border-teal-200' : 'bg-white border border-gray-100 hover:border-gray-200'}`}
                        >
                          <div className={`w-9 h-9 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                            {member.avatar}
                          </div>
                          <div className="flex-1 text-left">
                            <p className="text-sm font-semibold text-[#0B1F33]">{member.name}</p>
                            <p className="text-xs text-[#6B7C8F]">{member.role}</p>
                          </div>
                          <div className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors ${isAssigned ? 'bg-teal-600' : 'bg-gray-200'}`}>
                            {isAssigned && <i className="ri-check-line text-white text-sm"></i>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-sticky-note-line text-[#0B1F33]"></i>
                    <h4 className="text-sm font-bold text-[#0B1F33]">Notes</h4>
                  </div>
                  {!editingNotes ? (
                    <button
                      onClick={() => { setEditingNotes(true); setTempNotes(selectedJob.notes || ''); }}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                    >
                      <i className="ri-pencil-line"></i>
                      Edit
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingNotes(false); setTempNotes(selectedJob.notes || ''); }}
                        className="text-xs font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={saveJobNotes}
                        className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                      >
                        <i className="ri-check-line"></i>
                        Save
                      </button>
                    </div>
                  )}
                </div>

                {!editingNotes ? (
                  <div className="p-3 bg-[#F9F9FB] rounded-xl min-h-[60px]">
                    {selectedJob.notes ? (
                      <p className="text-sm text-[#0B1F33] leading-relaxed">{selectedJob.notes}</p>
                    ) : (
                      <p className="text-sm text-[#6B7C8F] italic">No notes added yet. Click Edit to add notes.</p>
                    )}
                  </div>
                ) : (
                  <textarea
                    value={tempNotes}
                    onChange={(e) => setTempNotes(e.target.value)}
                    placeholder="Add notes about this job or appointment..."
                    rows={4}
                    maxLength={500}
                    className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-xl text-[#0B1F33] placeholder-[#6B7C8F] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                  />
                )}
              </div>

              {/* Reminders summary */}
              {selectedJob.reminders && selectedJob.reminders.some(r => r.enabled) && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <i className="ri-notification-3-line text-[#0B1F33]"></i>
                    <h4 className="text-sm font-bold text-[#0B1F33]">Active Reminders</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedJob.reminders.filter(r => r.enabled).map((r, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-xs font-semibold text-teal-700">
                        <i className={`${r.type === 'email' ? 'ri-mail-line' : r.type === 'sms' ? 'ri-smartphone-line' : 'ri-mail-line'}`}></i>
                        {r.type === 'both' && <i className="ri-smartphone-line -ml-1"></i>}
                        {r.type === 'both' ? 'Email & SMS' : r.type === 'email' ? 'Email' : 'SMS'} &bull; {r.timing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="p-6 border-t border-gray-100 flex gap-3">
              {selectedJob.type === 'appointment' && (
                <button
                  onClick={() => { setShowDetailModal(false); openReminderPanel(selectedJob); }}
                  className="flex-1 px-4 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <i className="ri-notification-3-line"></i>
                  Reminders
                </button>
              )}
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#162d45] transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Appointment Modal */}
      {showNewAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                    <i className="ri-calendar-check-line text-teal-600 text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#0B1F33]">New Appointment</h3>
                    <p className="text-sm text-[#6B7C8F]">Schedule a site visit or consultation</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <i className="ri-close-line text-[#0B1F33] text-xl"></i>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Appointment Type */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Appointment Type</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {['Working', 'Site Visit', 'Estimate', 'Consultation'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewAppointment(prev => ({ ...prev, type }))}
                      className={`px-4 py-3 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${newAppointment.type === type ? 'bg-teal-600 text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Client Name */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Client Name *</label>
                <input
                  type="text"
                  value={newAppointment.clientName}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, clientName: e.target.value }))}
                  placeholder="Enter client name"
                  className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-lg text-[#0B1F33] placeholder-[#6B7C8F] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Site Address</label>
                <input
                  type="text"
                  value={newAppointment.address}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter site address"
                  className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-lg text-[#0B1F33] placeholder-[#6B7C8F] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Date *</label>
                  <input
                    type="date"
                    value={newAppointment.date}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-lg text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Time *</label>
                  <input
                    type="time"
                    value={newAppointment.time}
                    onChange={(e) => setNewAppointment(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-lg text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Duration</label>
                <div className="grid grid-cols-4 gap-2">
                  {['30 min', '1 hour', '2 hours', '3 hours'].map((duration) => (
                    <button
                      key={duration}
                      onClick={() => setNewAppointment(prev => ({ ...prev, duration }))}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm whitespace-nowrap cursor-pointer transition-all ${newAppointment.duration === duration ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
                    >
                      {duration}
                    </button>
                  ))}
                </div>
              </div>

              {/* Crew Assignment */}
              <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-3">
                  <i className="ri-team-line text-[#0B1F33] text-lg"></i>
                  <span className="text-sm font-bold text-[#0B1F33]">Assign Crew</span>
                  {newAppointment.assignedCrew.length > 0 && (
                    <span className="text-xs text-teal-600 font-semibold">({newAppointment.assignedCrew.length} selected)</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {CREW_MEMBERS.map((member) => {
                    const isSelected = newAppointment.assignedCrew.includes(member.id);
                    return (
                      <button
                        key={member.id}
                        onClick={() => toggleNewAppointmentCrew(member.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all cursor-pointer text-left ${isSelected ? 'bg-teal-50 border border-teal-200' : 'bg-white border border-gray-100 hover:border-gray-200'}`}
                      >
                        <div className={`w-7 h-7 ${member.color} rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                          {member.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0B1F33] truncate">{member.name}</p>
                          <p className="text-[10px] text-[#6B7C8F] truncate">{member.role}</p>
                        </div>
                        {isSelected && (
                          <i className="ri-check-line text-teal-600 text-sm flex-shrink-0"></i>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recurring Toggle */}
              <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-repeat-line text-orange-500 text-lg"></i>
                    <span className="text-sm font-bold text-[#0B1F33]">Recurring Appointment</span>
                  </div>
                  <button
                    onClick={() => setNewAppointment(prev => ({
                      ...prev,
                      recurring: { ...prev.recurring, enabled: !prev.recurring.enabled }
                    }))}
                    className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${newAppointment.recurring.enabled ? 'bg-teal-600' : 'bg-gray-300'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full shadow absolute top-0.5 transition-transform ${newAppointment.recurring.enabled ? 'translate-x-5.5' : 'translate-x-0.5'}`}></div>
                  </button>
                </div>
                {newAppointment.recurring.enabled && (
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7C8F] mb-1.5">Frequency</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => (
                          <button
                            key={freq}
                            onClick={() => setNewAppointment(prev => ({
                              ...prev,
                              recurring: { ...prev.recurring, frequency: freq }
                            }))}
                            className={`px-3 py-2 rounded-lg font-semibold text-xs whitespace-nowrap cursor-pointer transition-all ${newAppointment.recurring.frequency === freq ? 'bg-orange-500 text-white' : 'bg-white text-[#6B7C8F] hover:bg-gray-100 border border-gray-200'}`}
                          >
                            {frequencyLabel(freq)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#6B7C8F] mb-1.5">Repeat for</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={52}
                          value={newAppointment.recurring.endAfter}
                          onChange={(e) => setNewAppointment(prev => ({
                            ...prev,
                            recurring: { ...prev.recurring, endAfter: Math.max(2, Math.min(52, parseInt(e.target.value) || 2)) }
                          }))}
                          className="w-20 px-3 py-2 bg-white border border-gray-200 rounded-lg text-[#0B1F33] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                        />
                        <span className="text-xs text-[#6B7C8F]">occurrences</span>
                      </div>
                    </div>
                    <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">
                      <i className="ri-information-line mr-1"></i>
                      This will auto-create {newAppointment.recurring.endAfter} appointments {newAppointment.recurring.frequency === 'weekly' ? 'every week' : newAppointment.recurring.frequency === 'biweekly' ? 'every 2 weeks' : 'every month'}
                    </p>
                  </div>
                )}
              </div>

              {/* Reminders Section */}
              <div className="bg-[#F9F9FB] rounded-xl p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <i className="ri-notification-3-line text-teal-600 text-lg"></i>
                    <span className="text-sm font-bold text-[#0B1F33]">Reminders</span>
                  </div>
                  {newAppointment.reminders.length < 4 && (
                    <button
                      onClick={addNewReminderRow}
                      className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                    >
                      <i className="ri-add-line"></i> Add
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  {newAppointment.reminders.map((reminder, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white rounded-lg p-2.5 border border-gray-200">
                      <button
                        onClick={() => toggleNewReminder(index)}
                        className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${reminder.enabled ? 'bg-teal-600' : 'bg-gray-300'}`}
                      >
                        {reminder.enabled && <i className="ri-check-line text-white text-xs"></i>}
                      </button>
                      <select
                        value={reminder.type}
                        onChange={(e) => updateNewReminderType(index, e.target.value as 'email' | 'sms' | 'both')}
                        className="px-2 py-1.5 bg-[#F9F9FB] border border-gray-200 rounded-md text-xs text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                        <option value="both">Email &amp; SMS</option>
                      </select>
                      <select
                        value={reminder.timing}
                        onChange={(e) => updateNewReminderTiming(index, e.target.value)}
                        className="flex-1 px-2 py-1.5 bg-[#F9F9FB] border border-gray-200 rounded-md text-xs text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
                      >
                        <option value="15 minutes before">15 min before</option>
                        <option value="30 minutes before">30 min before</option>
                        <option value="1 hour before">1 hour before</option>
                        <option value="2 hours before">2 hours before</option>
                        <option value="24 hours before">24 hours before</option>
                        <option value="48 hours before">48 hours before</option>
                      </select>
                      {newAppointment.reminders.length > 1 && (
                        <button
                          onClick={() => removeNewReminderRow(index)}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          <i className="ri-delete-bin-line text-red-400 text-xs"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[#6B7C8F] mt-2">
                  <i className="ri-information-line mr-1"></i>
                  Reminders are sent to both you and the client automatically
                </p>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Notes</label>
                <textarea
                  value={newAppointment.notes}
                  onChange={(e) => setNewAppointment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add any notes about this appointment..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-lg text-[#0B1F33] placeholder-[#6B7C8F] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowNewAppointmentModal(false)}
                className="flex-1 px-6 py-3 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateAppointment}
                disabled={!newAppointment.clientName || !newAppointment.date}
                className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="ri-calendar-check-line mr-2"></i>
                {newAppointment.recurring.enabled ? 'Schedule Recurring' : 'Schedule Appointment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Settings Panel (for existing appointments) */}
      {showReminderPanel && selectedJobForReminder && (
        <ReminderSettingsPanel
          job={selectedJobForReminder}
          onClose={() => { setShowReminderPanel(false); setSelectedJobForReminder(null); }}
          onSave={(reminders) => {
            updateJobReminders(selectedJobForReminder.id, reminders);
            setShowReminderPanel(false);
            setSelectedJobForReminder(null);
          }}
        />
      )}
    </div>
  );
}

/* Reminder Settings Panel for existing appointments */
function ReminderSettingsPanel({
  job,
  onClose,
  onSave
}: {
  job: Job;
  onClose: () => void;
  onSave: (reminders: Reminder[]) => void;
}) {
  const [reminders, setReminders] = useState<Reminder[]>(
    job.reminders && job.reminders.length > 0
      ? [...job.reminders]
      : [{ type: 'email', timing: '24 hours before', enabled: true }]
  );

  const toggleReminder = (index: number) => {
    setReminders(prev => prev.map((r, i) => i === index ? { ...r, enabled: !r.enabled } : r));
  };

  const updateType = (index: number, type: 'email' | 'sms' | 'both') => {
    setReminders(prev => prev.map((r, i) => i === index ? { ...r, type } : r));
  };

  const updateTiming = (index: number, timing: string) => {
    setReminders(prev => prev.map((r, i) => i === index ? { ...r, timing } : r));
  };

  const addReminder = () => {
    if (reminders.length >= 4) return;
    setReminders(prev => [...prev, { type: 'sms', timing: '1 hour before', enabled: true }]);
  };

  const removeReminder = (index: number) => {
    setReminders(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <i className="ri-notification-3-line text-teal-600 text-xl"></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1F33]">Manage Reminders</h3>
                <p className="text-xs text-[#6B7C8F] truncate max-w-[220px]">{job.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-[#0B1F33] text-lg"></i>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          {reminders.map((reminder, index) => (
            <div key={index} className="flex items-center gap-2 bg-[#F9F9FB] rounded-lg p-3 border border-gray-200">
              <button
                onClick={() => toggleReminder(index)}
                className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 cursor-pointer transition-colors ${reminder.enabled ? 'bg-teal-600' : 'bg-gray-300'}`}
              >
                {reminder.enabled && <i className="ri-check-line text-white text-xs"></i>}
              </button>
              <select
                value={reminder.type}
                onChange={(e) => updateType(index, e.target.value as 'email' | 'sms' | 'both')}
                className="px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="both">Email &amp; SMS</option>
              </select>
              <select
                value={reminder.timing}
                onChange={(e) => updateTiming(index, e.target.value)}
                className="flex-1 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs text-[#0B1F33] focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer"
              >
                <option value="15 minutes before">15 min before</option>
                <option value="30 minutes before">30 min before</option>
                <option value="1 hour before">1 hour before</option>
                <option value="2 hours before">2 hours before</option>
                <option value="24 hours before">24 hours before</option>
                <option value="48 hours before">48 hours before</option>
              </select>
              {reminders.length > 1 && (
                <button
                  onClick={() => removeReminder(index)}
                  className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <i className="ri-delete-bin-line text-red-400 text-xs"></i>
                </button>
              )}
            </div>
          ))}

          {reminders.length < 4 && (
            <button
              onClick={addReminder}
              className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-lg text-sm font-semibold text-[#6B7C8F] hover:border-teal-300 hover:text-teal-600 transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <i className="ri-add-line"></i> Add Reminder
            </button>
          )}

          <p className="text-xs text-[#6B7C8F] pt-1">
            <i className="ri-information-line mr-1"></i>
            Notifications are sent to both you and the client before the appointment
          </p>
        </div>

        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2.5 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg font-semibold hover:bg-gray-200 transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(reminders)}
            className="flex-1 px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap text-sm"
          >
            <i className="ri-check-line mr-1"></i> Save Reminders
          </button>
        </div>
      </div>
    </div>
  );
}
