import { useState, useMemo, useCallback, useEffect, DragEvent } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  hourlyRate: number;
}

interface ScheduledJob {
  id: string;
  name: string;
  date: number;
  time: string;
  duration: string;
  color: string;
  type: 'job' | 'appointment';
  assignedCrew: string[];
  address?: string;
  notes?: string;
  workItemId?: string;
}

interface CrewDayStatus {
  crewId: string;
  hoursBooked: number;
  maxHours: number;
  jobs: string[];
}

interface DragPayload {
  type: 'crew-to-job' | 'crew-from-job';
  crewId: string;
  sourceJobId?: string;
  sourceDate?: number;
}

const JOB_COLOR_PALETTE = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-violet-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-orange-500',
];

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function parseDuration(duration: string): number {
  if (duration.toLowerCase().includes('all day')) return 8;
  const match = duration.match(/(\d+)/);
  if (match) return parseInt(match[1]);
  if (duration.includes('30 min')) return 0.5;
  return 1;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

export default function MonthCalendarView() {
  const { user } = useAuth();
  const now = new Date();
  const [currentYear, setCurrentYear] = useState(now.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [showCrewPanel, setShowCrewPanel] = useState(true);
  const [selectedCrewFilter, setSelectedCrewFilter] = useState<string | null>(null);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<number | null>(null);
  const [jobs, setJobs] = useState<ScheduledJob[]>([]);
  const [crewMembers, setCrewMembers] = useState<CrewMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialJobs, setInitialJobs] = useState<ScheduledJob[]>([]);

  // Drag-and-drop state
  const [dragPayload, setDragPayload] = useState<DragPayload | null>(null);
  const [dropTargetJobId, setDropTargetJobId] = useState<string | null>(null);
  const [showUnassignZone, setShowUnassignZone] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [recentChanges, setRecentChanges] = useState<Array<{ id: string; text: string; time: number }>>([]);

  // Job detail modal state
  const [selectedJobDetail, setSelectedJobDetail] = useState<ScheduledJob | null>(null);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // ─── Fetch crew members ───
  const fetchCrew = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .eq('active', true);

    if (error) {
      console.error('Error fetching crew members:', error);
      return;
    }

    if (data) {
      const mapped: CrewMember[] = data.map((row: any) => ({
        id: row.id,
        name: row.name,
        role: row.role || 'General',
        avatar: getInitials(row.name),
        color: row.color || 'bg-blue-500',
        hourlyRate: Number(row.hourly_rate) || 0,
      }));
      setCrewMembers(mapped);
    }
  }, [user]);

  // ─── Fetch jobs for current month ───
  const fetchJobs = useCallback(async () => {
    if (!user) return;

    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    const startStr = monthStart.toISOString().split('T')[0];
    const endStr = monthEnd.toISOString().split('T')[0];

    // Fetch work items with joined job and profile data
    const { data: workItems, error: wiError } = await supabase
      .from('work_items')
      .select(`
        id,
        job_id,
        title,
        trade,
        status,
        start_date,
        end_date,
        jobs!inner (
          id,
          title,
          location,
          user_id
        )
      `)
      .eq('contractor_id', user.id)
      .in('status', ['assigned', 'in-progress'])
      .not('start_date', 'is', null)
      .lte('start_date', endStr)
      .or(`end_date.gte.${startStr},end_date.is.null`);

    if (wiError) {
      console.error('Error fetching work items:', wiError);
      return;
    }

    // Fetch crew assignments for this date range
    const { data: assignments, error: assignError } = await supabase
      .from('job_team_assignments')
      .select('*')
      .eq('user_id', user.id);

    if (assignError) {
      console.error('Error fetching crew assignments:', assignError);
    }

    // Build assignment map: work_item_id -> team_member_ids
    const assignmentMap: Record<string, string[]> = {};
    if (assignments) {
      for (const a of assignments) {
        if (!assignmentMap[a.work_item_id]) {
          assignmentMap[a.work_item_id] = [];
        }
        if (!assignmentMap[a.work_item_id].includes(a.team_member_id)) {
          assignmentMap[a.work_item_id].push(a.team_member_id);
        }
      }
    }

    // Fetch client profiles for all jobs
    const jobUserIds = [...new Set((workItems || []).map((wi: any) => wi.jobs?.user_id).filter(Boolean))];
    let profileMap: Record<string, string> = {};
    if (jobUserIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', jobUserIds);
      if (profiles) {
        for (const p of profiles) {
          profileMap[p.id] = p.last_name || p.first_name || '';
        }
      }
    }

    // Map work items to ScheduledJob entries, expanding multi-day jobs
    const scheduledJobs: ScheduledJob[] = [];
    (workItems || []).forEach((wi: any, index: number) => {
      const job = wi.jobs;
      if (!job) return;

      const clientName = profileMap[job.user_id] || '';
      const jobName = clientName
        ? `${job.title} - ${clientName}`
        : job.title;

      const startDate = new Date(wi.start_date + 'T00:00:00');
      const endDate = wi.end_date ? new Date(wi.end_date + 'T00:00:00') : startDate;
      const color = JOB_COLOR_PALETTE[index % JOB_COLOR_PALETTE.length];
      const crewIds = assignmentMap[wi.id] || [];

      // Compute duration label
      const diffDays = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      const durationLabel = diffDays > 0 ? 'All Day' : 'All Day';

      // Create one entry per day in the current month
      const iterDate = new Date(Math.max(startDate.getTime(), monthStart.getTime()));
      const iterEnd = new Date(Math.min(endDate.getTime(), monthEnd.getTime()));

      while (iterDate <= iterEnd) {
        const dayOfMonth = iterDate.getDate();

        scheduledJobs.push({
          id: diffDays > 0 ? `${wi.id}-d${dayOfMonth}` : wi.id,
          name: jobName,
          date: dayOfMonth,
          time: '9:00 AM',
          duration: durationLabel,
          color,
          type: 'job',
          assignedCrew: [...crewIds],
          address: job.location || undefined,
          workItemId: wi.id,
        });

        iterDate.setDate(iterDate.getDate() + 1);
      }
    });

    setJobs(scheduledJobs);
    setInitialJobs(scheduledJobs);
  }, [user, currentYear, currentMonth]);

  // ─── Initial data load ───
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([fetchCrew(), fetchJobs()]);
      setLoading(false);
    };
    load();
  }, [fetchCrew, fetchJobs]);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const addRecentChange = useCallback((text: string) => {
    setRecentChanges(prev => [
      { id: `${Date.now()}`, text, time: Date.now() },
      ...prev.slice(0, 9),
    ]);
  }, []);

  const prevMonth = () => {
    setSelectedDate(null);
    setShowDayDetail(false);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const nextMonth = () => {
    setSelectedDate(null);
    setShowDayDetail(false);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const getJobsForDate = useCallback((date: number): ScheduledJob[] => {
    let filtered = jobs.filter(j => j.date === date);
    if (selectedCrewFilter) {
      filtered = filtered.filter(j => j.assignedCrew.includes(selectedCrewFilter));
    }
    return filtered;
  }, [jobs, selectedCrewFilter]);

  const getCrewStatusForDate = useCallback((date: number): CrewDayStatus[] => {
    const dayJobs = jobs.filter(j => j.date === date);
    return crewMembers.map(crew => {
      const crewJobs = dayJobs.filter(j => j.assignedCrew.includes(crew.id));
      const hoursBooked = crewJobs.reduce((sum, j) => sum + parseDuration(j.duration), 0);
      return {
        crewId: crew.id,
        hoursBooked,
        maxHours: 8,
        jobs: crewJobs.map(j => j.name),
      };
    });
  }, [jobs, crewMembers]);

  const crewMonthStats = useMemo(() => {
    return crewMembers.map(crew => {
      let totalHours = 0;
      let totalDays = 0;
      const jobSet = new Set<string>();
      for (let d = 1; d <= daysInMonth; d++) {
        const dayJobs = jobs.filter(j => j.date === d && j.assignedCrew.includes(crew.id));
        if (dayJobs.length > 0) {
          totalDays++;
          dayJobs.forEach(j => {
            totalHours += parseDuration(j.duration);
            const baseName = j.name.split(' - ')[0];
            jobSet.add(baseName);
          });
        }
      }
      const utilization = Math.round((totalHours / (daysInMonth * 8)) * 100);
      return {
        ...crew,
        totalHours,
        totalDays,
        uniqueJobs: jobSet.size,
        utilization: Math.min(utilization, 100),
      };
    });
  }, [daysInMonth, jobs, crewMembers]);

  const totalJobsThisMonth = useMemo(() => {
    const uniqueNames = new Set(jobs.filter(j => j.type === 'job').map(j => j.name));
    return uniqueNames.size;
  }, [jobs]);

  const totalAppointments = useMemo(() => {
    return jobs.filter(j => j.type === 'appointment').length;
  }, [jobs]);

  const busiestDay = useMemo(() => {
    let maxJobs = 0;
    let bDay = 1;
    for (let d = 1; d <= daysInMonth; d++) {
      const count = jobs.filter(j => j.date === d).length;
      if (count > maxJobs) {
        maxJobs = count;
        bDay = d;
      }
    }
    return { day: bDay, count: maxJobs };
  }, [daysInMonth, jobs]);

  const handleDateClick = (date: number) => {
    if (dragPayload) return;
    if (selectedDate === date) {
      setShowDayDetail(!showDayDetail);
    } else {
      setSelectedDate(date);
      setShowDayDetail(true);
    }
  };

  const handleJobBarClick = (e: React.MouseEvent, job: ScheduledJob) => {
    e.stopPropagation();
    if (dragPayload) return;
    setSelectedJobDetail(job);
  };

  const updateJobNotes = (jobId: string, notes: string) => {
    setJobs(prev => prev.map(j => j.id === jobId ? { ...j, notes } : j));
    setSelectedJobDetail(prev => prev && prev.id === jobId ? { ...prev, notes } : prev);
    showToast('Notes saved');
  };

  const toggleCrewOnJobFromModal = async (jobId: string, crewId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const member = getCrewMember(crewId);
    if (!member) return;
    const isAssigned = job.assignedCrew.includes(crewId);
    const workItemId = job.workItemId || job.id.split('-d')[0];

    if (isAssigned) {
      // Remove assignment from DB
      await supabase
        .from('job_team_assignments')
        .delete()
        .eq('work_item_id', workItemId)
        .eq('team_member_id', crewId);
    } else {
      // Add assignment to DB
      await supabase
        .from('job_team_assignments')
        .insert({
          user_id: user?.id,
          work_item_id: workItemId,
          team_member_id: crewId,
          assigned_date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(job.date).padStart(2, '0')}`,
        });
    }

    setJobs(prev => prev.map(j => {
      // Update all entries sharing the same workItemId
      const jWorkItemId = j.workItemId || j.id.split('-d')[0];
      if (jWorkItemId === workItemId) {
        return {
          ...j,
          assignedCrew: isAssigned
            ? j.assignedCrew.filter(id => id !== crewId)
            : [...j.assignedCrew, crewId],
        };
      }
      return j;
    }));

    setSelectedJobDetail(prev => {
      if (!prev || prev.id !== jobId) return prev;
      return {
        ...prev,
        assignedCrew: isAssigned
          ? prev.assignedCrew.filter(id => id !== crewId)
          : [...prev.assignedCrew, crewId],
      };
    });

    const jobLabel = job.name.split(' - ')[0];
    const msg = isAssigned ? `Removed ${member.name} from ${jobLabel}` : `Assigned ${member.name} to ${jobLabel}`;
    showToast(msg);
    addRecentChange(msg);
  };

  const getCrewMember = (id: string) => crewMembers.find(c => c.id === id);

  // ─── Drag & Drop: Crew from sidebar -> Job bar ───
  const handleCrewDragStart = (e: DragEvent<HTMLDivElement>, crewId: string) => {
    const payload: DragPayload = { type: 'crew-to-job', crewId };
    setDragPayload(payload);
    setShowUnassignZone(false);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', crewId);
  };

  // ─── Drag & Drop: Crew avatar from inside a job bar ───
  const handleCrewFromJobDragStart = (e: DragEvent<HTMLDivElement>, crewId: string, jobId: string, jobDate: number) => {
    e.stopPropagation();
    const payload: DragPayload = { type: 'crew-from-job', crewId, sourceJobId: jobId, sourceDate: jobDate };
    setDragPayload(payload);
    setShowUnassignZone(true);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', crewId);
  };

  const handleJobDragOver = (e: DragEvent<HTMLDivElement>, jobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragPayload) return;
    e.dataTransfer.dropEffect = dragPayload.type === 'crew-from-job' ? 'move' : 'copy';
    setDropTargetJobId(jobId);
  };

  const handleJobDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.stopPropagation();
    // Only clear if we're actually leaving the job element
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!relatedTarget || !currentTarget.contains(relatedTarget)) {
      setDropTargetJobId(null);
    }
  };

  const handleJobDrop = async (e: DragEvent<HTMLDivElement>, targetJobId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDropTargetJobId(null);

    if (!dragPayload) return;
    const { crewId, sourceJobId } = dragPayload;
    const member = getCrewMember(crewId);
    const targetJob = jobs.find(j => j.id === targetJobId);
    if (!member || !targetJob) return;

    // Already assigned to this job
    if (targetJob.assignedCrew.includes(crewId)) {
      showToast(`${member.name} is already on this job`);
      resetDrag();
      return;
    }

    const targetWorkItemId = targetJob.workItemId || targetJob.id.split('-d')[0];

    // Check capacity warning (>8h)
    const dayJobs = jobs.filter(j => j.date === targetJob.date && j.assignedCrew.includes(crewId) && j.id !== sourceJobId);
    const existingHours = dayJobs.reduce((sum, j) => sum + parseDuration(j.duration), 0);
    const newHours = existingHours + parseDuration(targetJob.duration);

    // Insert assignment into DB
    await supabase
      .from('job_team_assignments')
      .insert({
        user_id: user?.id,
        work_item_id: targetWorkItemId,
        team_member_id: crewId,
        assigned_date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(targetJob.date).padStart(2, '0')}`,
      });

    // If moving from another job, remove from source in DB
    if (sourceJobId && sourceJobId !== targetJobId) {
      const sourceJob = jobs.find(j => j.id === sourceJobId);
      const sourceWorkItemId = sourceJob?.workItemId || sourceJobId.split('-d')[0];
      await supabase
        .from('job_team_assignments')
        .delete()
        .eq('work_item_id', sourceWorkItemId)
        .eq('team_member_id', crewId);
    }

    setJobs(prev => {
      let updated = prev.map(j => {
        const jWorkItemId = j.workItemId || j.id.split('-d')[0];
        if (jWorkItemId === targetWorkItemId && !j.assignedCrew.includes(crewId)) {
          return { ...j, assignedCrew: [...j.assignedCrew, crewId] };
        }
        return j;
      });
      // If moving from another job, remove from source
      if (sourceJobId && sourceJobId !== targetJobId) {
        const sourceJob = jobs.find(j => j.id === sourceJobId);
        const sourceWorkItemId = sourceJob?.workItemId || sourceJobId.split('-d')[0];
        updated = updated.map(j => {
          const jWorkItemId = j.workItemId || j.id.split('-d')[0];
          if (jWorkItemId === sourceWorkItemId) {
            return { ...j, assignedCrew: j.assignedCrew.filter(id => id !== crewId) };
          }
          return j;
        });
      }
      return updated;
    });

    const jobLabel = targetJob.name.split(' - ')[0];
    if (sourceJobId && sourceJobId !== targetJobId) {
      const srcJob = jobs.find(j => j.id === sourceJobId);
      const srcLabel = srcJob ? srcJob.name.split(' - ')[0] : 'previous job';
      const msg = `Moved ${member.name} from ${srcLabel} to ${jobLabel}`;
      showToast(msg);
      addRecentChange(msg);
    } else {
      const msg = `Assigned ${member.name} to ${jobLabel}`;
      showToast(newHours > 8 ? `${msg} (over 8h on ${monthNames[currentMonth]} ${targetJob.date})` : msg);
      addRecentChange(msg);
    }

    resetDrag();
  };

  // ─── Unassign zone drop ───
  const handleUnassignDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragPayload?.type === 'crew-from-job') {
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleUnassignDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!dragPayload || dragPayload.type !== 'crew-from-job' || !dragPayload.sourceJobId) return;

    const { crewId, sourceJobId } = dragPayload;
    const member = getCrewMember(crewId);
    const srcJob = jobs.find(j => j.id === sourceJobId);
    const sourceWorkItemId = srcJob?.workItemId || sourceJobId.split('-d')[0];

    // Remove from DB
    await supabase
      .from('job_team_assignments')
      .delete()
      .eq('work_item_id', sourceWorkItemId)
      .eq('team_member_id', crewId);

    setJobs(prev => prev.map(j => {
      const jWorkItemId = j.workItemId || j.id.split('-d')[0];
      if (jWorkItemId === sourceWorkItemId) {
        return { ...j, assignedCrew: j.assignedCrew.filter(id => id !== crewId) };
      }
      return j;
    }));

    const srcLabel = srcJob ? srcJob.name.split(' - ')[0] : 'job';
    const msg = `Removed ${member?.name} from ${srcLabel}`;
    showToast(msg);
    addRecentChange(msg);
    resetDrag();
  };

  const handleDragEnd = () => {
    resetDrag();
  };

  const resetDrag = () => {
    setDragPayload(null);
    setDropTargetJobId(null);
    setShowUnassignZone(false);
  };

  // ─── Undo last change ───
  const undoLastChange = async () => {
    setJobs(initialJobs);
    setRecentChanges([]);
    showToast('All changes reverted');
    // Refetch to resync with DB
    await fetchJobs();
  };

  // ─── Quick assign from day detail ───
  const toggleCrewOnJob = async (jobId: string, crewId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    const member = getCrewMember(crewId);
    if (!member) return;
    const workItemId = job.workItemId || job.id.split('-d')[0];

    const isAssigned = job.assignedCrew.includes(crewId);

    if (isAssigned) {
      await supabase
        .from('job_team_assignments')
        .delete()
        .eq('work_item_id', workItemId)
        .eq('team_member_id', crewId);
    } else {
      await supabase
        .from('job_team_assignments')
        .insert({
          user_id: user?.id,
          work_item_id: workItemId,
          team_member_id: crewId,
          assigned_date: `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(job.date).padStart(2, '0')}`,
        });
    }

    setJobs(prev => prev.map(j => {
      const jWorkItemId = j.workItemId || j.id.split('-d')[0];
      if (jWorkItemId === workItemId) {
        return {
          ...j,
          assignedCrew: isAssigned
            ? j.assignedCrew.filter(id => id !== crewId)
            : [...j.assignedCrew, crewId],
        };
      }
      return j;
    }));

    const jobLabel = job.name.split(' - ')[0];
    const msg = isAssigned ? `Removed ${member.name} from ${jobLabel}` : `Assigned ${member.name} to ${jobLabel}`;
    showToast(msg);
    addRecentChange(msg);
  };

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const isDragging = dragPayload !== null;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === currentYear && today.getMonth() === currentMonth;
  const todayDate = isCurrentMonth ? today.getDate() : -1;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-gray-200 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                  <div className="h-6 w-10 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-[#6B7C8F] font-medium">Loading calendar...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[70] animate-slide-in">
          <div className="bg-[#0B1F33] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-md">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="ri-check-line text-white text-lg"></i>
            </div>
            <span className="text-sm font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Drag Mode Banner */}
      {isDragging && (
        <div className="bg-teal-50 border-2 border-dashed border-teal-300 rounded-xl p-4 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
              <i className="ri-drag-move-2-line text-teal-600 text-xl"></i>
            </div>
            <div>
              <p className="text-sm font-bold text-teal-800">
                Dragging {getCrewMember(dragPayload.crewId)?.name}
              </p>
              <p className="text-xs text-teal-600">
                {dragPayload.type === 'crew-to-job'
                  ? 'Drop on any job bar to assign'
                  : 'Drop on another job to reassign, or the remove zone to unassign'}
              </p>
            </div>
          </div>
          <button
            onClick={resetDrag}
            className="px-4 py-2 bg-white border border-teal-200 rounded-lg text-sm font-semibold text-teal-700 hover:bg-teal-50 cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Month Stats Bar */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-[#0B1F33] rounded-xl flex items-center justify-center">
              <i className="ri-briefcase-line text-white text-lg"></i>
            </div>
            <div>
              <p className="text-xs text-[#6B7C8F] font-medium">Active Jobs</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{totalJobsThisMonth}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-teal-100 rounded-xl flex items-center justify-center">
              <i className="ri-calendar-check-line text-teal-600 text-lg"></i>
            </div>
            <div>
              <p className="text-xs text-[#6B7C8F] font-medium">Appointments</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{totalAppointments}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center">
              <i className="ri-fire-line text-amber-600 text-lg"></i>
            </div>
            <div>
              <p className="text-xs text-[#6B7C8F] font-medium">Busiest Day</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{monthNames[currentMonth]} {busiestDay.day}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center">
              <i className="ri-team-line text-emerald-600 text-lg"></i>
            </div>
            <div>
              <p className="text-xs text-[#6B7C8F] font-medium">Crew Members</p>
              <p className="text-2xl font-bold text-[#0B1F33]">{crewMembers.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Main Calendar */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6 transition-all">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-s-line text-[#0B1F33] text-xl"></i>
            </button>
            <h3 className="text-xl font-bold text-[#0B1F33]">
              {monthNames[currentMonth]} {currentYear}
            </h3>
            <div className="flex items-center gap-3">
              {recentChanges.length > 0 && (
                <button
                  onClick={undoLastChange}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-go-back-line"></i>
                  Reset All
                </button>
              )}
              <button
                onClick={() => setShowCrewPanel(!showCrewPanel)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${showCrewPanel ? 'bg-[#0B1F33] text-white' : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'}`}
              >
                <i className="ri-team-line"></i>
                Crew
              </button>
              <button
                onClick={nextMonth}
                className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <i className="ri-arrow-right-s-line text-[#0B1F33] text-xl"></i>
              </button>
            </div>
          </div>

          {/* Drag Instruction Hint */}
          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-[#6B7C8F]">
              <i className="ri-drag-move-2-line text-sm"></i>
              <span>Drag crew avatars from sidebar onto job bars to assign</span>
            </div>
            <div className="w-px h-4 bg-gray-200"></div>
            <div className="flex items-center gap-1.5 text-xs text-[#6B7C8F]">
              <i className="ri-user-shared-line text-sm"></i>
              <span>Drag crew dots on jobs to reassign between jobs</span>
            </div>
          </div>

          {/* Crew Filter Chips */}
          {selectedCrewFilter && (
            <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
              <span className="text-xs text-[#6B7C8F] font-medium">Filtered by:</span>
              {(() => {
                const member = getCrewMember(selectedCrewFilter);
                if (!member) return null;
                return (
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-full">
                    <div className={`w-5 h-5 ${member.color} rounded-full flex items-center justify-center text-white text-[8px] font-bold`}>
                      {member.avatar}
                    </div>
                    <span className="text-xs font-semibold text-teal-700">{member.name}</span>
                    <button
                      onClick={() => setSelectedCrewFilter(null)}
                      className="w-4 h-4 flex items-center justify-center rounded-full hover:bg-teal-200 transition-colors cursor-pointer"
                    >
                      <i className="ri-close-line text-teal-600 text-xs"></i>
                    </button>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEKDAY_LABELS.map((day) => (
              <div key={day} className="text-center py-2">
                <span className="text-xs font-bold text-[#6B7C8F] uppercase tracking-wider">{day}</span>
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((date, idx) => {
              if (date === null) {
                return <div key={`empty-${idx}`} className="min-h-[120px] bg-[#FAFAFA] rounded-lg"></div>;
              }

              const dayJobs = getJobsForDate(date);
              const isSelected = selectedDate === date;
              const isToday = date === todayDate;
              const isHovered = hoveredDate === date;
              const crewStatuses = getCrewStatusForDate(date);
              const busyCrew = crewStatuses.filter(s => s.hoursBooked >= 7).length;
              const isWeekend = (firstDay + date - 1) % 7 === 0 || (firstDay + date - 1) % 7 === 6;

              return (
                <div
                  key={date}
                  onClick={() => handleDateClick(date)}
                  onMouseEnter={() => setHoveredDate(date)}
                  onMouseLeave={() => setHoveredDate(null)}
                  className={`min-h-[120px] rounded-lg p-2 cursor-pointer transition-all border-2 ${
                    isSelected
                      ? 'border-[#0B1F33] bg-[#F0F4F8] shadow-md'
                      : isToday
                      ? 'border-teal-400 bg-teal-50/30'
                      : isHovered
                      ? 'border-gray-200 bg-gray-50'
                      : isWeekend
                      ? 'border-transparent bg-[#FAFAFA]'
                      : 'border-transparent bg-white'
                  }`}
                >
                  {/* Date Header */}
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-sm font-bold ${
                      isSelected ? 'text-[#0B1F33]' : isToday ? 'text-teal-600' : 'text-[#0B1F33]'
                    }`}>
                      {date}
                    </span>
                    <div className="flex items-center gap-1">
                      {dayJobs.length > 0 && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          dayJobs.length >= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-[#6B7C8F]'
                        }`}>
                          {dayJobs.length}
                        </span>
                      )}
                      {busyCrew > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-600">
                          <i className="ri-user-line text-[8px] mr-0.5"></i>{busyCrew}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Job Bars -- drop targets */}
                  <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                    {dayJobs.slice(0, 3).map((job) => {
                      const isDropTarget = dropTargetJobId === job.id;
                      return (
                        <div
                          key={job.id}
                          onClick={(e) => handleJobBarClick(e, job)}
                          onDragOver={(e) => handleJobDragOver(e, job.id)}
                          onDragLeave={handleJobDragLeave}
                          onDrop={(e) => handleJobDrop(e, job.id)}
                          className={`${job.color} rounded px-1.5 py-0.5 flex items-center gap-1 transition-all cursor-pointer ${
                            isDropTarget
                              ? 'ring-2 ring-white ring-offset-2 ring-offset-teal-400 scale-105 shadow-lg'
                              : isDragging
                              ? 'opacity-90 hover:ring-2 hover:ring-white hover:ring-offset-1 hover:ring-offset-teal-300'
                              : 'hover:brightness-110 hover:shadow-md'
                          }`}
                        >
                          <span className="text-[10px] font-semibold text-white truncate flex-1">
                            {job.name.split(' - ')[0]}
                          </span>
                          {/* Draggable crew dots on job bars */}
                          {job.assignedCrew.length > 0 && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              {job.assignedCrew.slice(0, 2).map((crewId) => {
                                const member = getCrewMember(crewId);
                                if (!member) return null;
                                const isBeingDragged = isDragging && dragPayload?.crewId === crewId && dragPayload?.sourceJobId === job.id;
                                return (
                                  <div
                                    key={crewId}
                                    draggable={!isDragging}
                                    onDragStart={(e) => handleCrewFromJobDragStart(e, crewId, job.id, job.date)}
                                    onDragEnd={handleDragEnd}
                                    className={`w-4 h-4 ${member.color} rounded-full flex items-center justify-center text-white text-[6px] font-bold border border-white/60 cursor-grab active:cursor-grabbing hover:scale-125 transition-transform ${
                                      isBeingDragged ? 'opacity-30' : ''
                                    }`}
                                    title={`Drag ${member.name} to reassign`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    {member.avatar.charAt(0)}
                                  </div>
                                );
                              })}
                              {job.assignedCrew.length > 2 && (
                                <span className="text-[7px] text-white/80 font-bold">+{job.assignedCrew.length - 2}</span>
                              )}
                            </div>
                          )}
                          {isDropTarget && (
                            <i className="ri-add-circle-fill text-white text-xs flex-shrink-0 animate-pulse"></i>
                          )}
                        </div>
                      );
                    })}
                    {dayJobs.length > 3 && (
                      <div className="text-[10px] font-semibold text-[#6B7C8F] text-center">
                        +{dayJobs.length - 3} more
                      </div>
                    )}
                  </div>

                  {/* Crew Availability Dots */}
                  {dayJobs.length > 0 && !isDragging && (
                    <div className="flex items-center gap-0.5 mt-1.5 flex-wrap">
                      {crewStatuses.filter(s => s.hoursBooked > 0).slice(0, 5).map((status) => {
                        const member = getCrewMember(status.crewId);
                        if (!member) return null;
                        return (
                          <div
                            key={status.crewId}
                            className={`w-4 h-4 ${member.color} rounded-full flex items-center justify-center text-white text-[7px] font-bold border border-white`}
                            title={`${member.name}: ${status.hoursBooked}h booked`}
                          >
                            {member.avatar.charAt(0)}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Unassign Drop Zone */}
          {showUnassignZone && dragPayload?.type === 'crew-from-job' && (
            <div
              onDragOver={handleUnassignDragOver}
              onDrop={handleUnassignDrop}
              className="mt-4 border-2 border-dashed border-red-300 bg-red-50 rounded-xl p-5 flex items-center justify-center gap-3 transition-all hover:border-red-400 hover:bg-red-100"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <i className="ri-user-unfollow-line text-red-500 text-xl"></i>
              </div>
              <div>
                <p className="text-sm font-bold text-red-700">Remove from Job</p>
                <p className="text-xs text-red-500">Drop here to unassign {getCrewMember(dragPayload.crewId)?.name}</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-5 mt-5 pt-4 border-t border-gray-100 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-xs text-[#6B7C8F]">Renovation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-emerald-500 rounded"></div>
              <span className="text-xs text-[#6B7C8F]">Plumbing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-amber-500 rounded"></div>
              <span className="text-xs text-[#6B7C8F]">Electrical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-rose-500 rounded"></div>
              <span className="text-xs text-[#6B7C8F]">HVAC</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-violet-500 rounded"></div>
              <span className="text-xs text-[#6B7C8F]">Multi-Trade</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 bg-teal-500 rounded"></div>
              <span className="text-xs text-[#6B7C8F]">Appointment</span>
            </div>
          </div>
        </div>

        {/* Crew Availability Sidebar */}
        {showCrewPanel && (
          <div className="w-[340px] flex-shrink-0 space-y-4">
            {/* Draggable Crew List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                  <i className="ri-bar-chart-grouped-line text-white text-lg"></i>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33]">Crew Utilization</h4>
                  <p className="text-[11px] text-[#6B7C8F]">{monthNames[currentMonth]} overview</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 mb-4 px-2 py-1.5 bg-teal-50 rounded-lg border border-teal-100">
                <i className="ri-drag-move-2-line text-teal-600 text-sm"></i>
                <span className="text-[11px] text-teal-700 font-medium">Drag crew members onto calendar jobs to assign</span>
              </div>

              {crewMembers.length > 0 ? (
                <div className="space-y-3">
                  {crewMonthStats.map((crew) => {
                    const isBeingDragged = isDragging && dragPayload?.crewId === crew.id && dragPayload?.type === 'crew-to-job';
                    return (
                      <div key={crew.id} className="relative">
                        <div
                          draggable={!isDragging}
                          onDragStart={(e) => handleCrewDragStart(e, crew.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedCrewFilter(selectedCrewFilter === crew.id ? null : crew.id)}
                          className={`w-full text-left p-3 rounded-xl transition-all ${
                            selectedCrewFilter === crew.id
                              ? 'bg-teal-50 border border-teal-200'
                              : 'bg-[#F9F9FB] border border-transparent hover:border-gray-200'
                          } ${isBeingDragged ? 'opacity-30 scale-95' : 'cursor-grab active:cursor-grabbing'}`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-8 h-8 ${crew.color} rounded-full flex items-center justify-center text-white text-[10px] font-bold relative`}>
                              {crew.avatar}
                              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-white rounded-full flex items-center justify-center">
                                <i className="ri-draggable text-[#6B7C8F] text-[7px]"></i>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-[#0B1F33] truncate">{crew.name}</p>
                              <p className="text-[10px] text-[#6B7C8F]">{crew.role}</p>
                            </div>
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              crew.utilization >= 80 ? 'bg-red-100 text-red-600' :
                              crew.utilization >= 50 ? 'bg-amber-100 text-amber-600' :
                              'bg-green-100 text-green-600'
                            }`}>
                              {crew.utilization}%
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                crew.utilization >= 80 ? 'bg-red-400' :
                                crew.utilization >= 50 ? 'bg-amber-400' :
                                'bg-green-400'
                              }`}
                              style={{ width: `${crew.utilization}%` }}
                            ></div>
                          </div>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="text-[10px] text-[#6B7C8F]">{crew.totalHours}h / {crew.totalDays} days</span>
                            <span className="text-[10px] text-[#6B7C8F]">{crew.uniqueJobs} jobs</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#F9F9FB] rounded-xl">
                  <i className="ri-team-line text-[#6B7C8F] text-3xl mb-2 block"></i>
                  <p className="text-sm font-semibold text-[#0B1F33] mb-1">No crew members</p>
                  <p className="text-xs text-[#6B7C8F]">Add crew members to start scheduling</p>
                </div>
              )}
            </div>

            {/* Recent Changes Log */}
            {recentChanges.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                      <i className="ri-history-line text-amber-600 text-base"></i>
                    </div>
                    <h4 className="text-sm font-bold text-[#0B1F33]">Recent Changes</h4>
                  </div>
                  <button
                    onClick={undoLastChange}
                    className="text-[11px] font-semibold text-amber-600 hover:text-amber-700 cursor-pointer flex items-center gap-1"
                  >
                    <i className="ri-arrow-go-back-line text-xs"></i>
                    Reset
                  </button>
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {recentChanges.map((change) => (
                    <div key={change.id} className="flex items-start gap-2 p-2 bg-[#F9F9FB] rounded-lg">
                      <div className="w-5 h-5 bg-teal-100 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                        <i className="ri-swap-line text-teal-600 text-[10px]"></i>
                      </div>
                      <p className="text-[11px] text-[#0B1F33] leading-relaxed">{change.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Day Detail Panel */}
            {showDayDetail && selectedDate && (
              <DayDetailPanel
                date={selectedDate}
                month={monthNames[currentMonth]}
                year={currentYear}
                jobs={getJobsForDate(selectedDate)}
                crewStatuses={getCrewStatusForDate(selectedDate)}
                crewMembers={crewMembers}
                onClose={() => setShowDayDetail(false)}
                onToggleCrew={toggleCrewOnJob}
              />
            )}
          </div>
        )}
      </div>

      {/* Day Detail below calendar when crew panel is hidden */}
      {!showCrewPanel && showDayDetail && selectedDate && (
        <DayDetailPanel
          date={selectedDate}
          month={monthNames[currentMonth]}
          year={currentYear}
          jobs={getJobsForDate(selectedDate)}
          crewStatuses={getCrewStatusForDate(selectedDate)}
          crewMembers={crewMembers}
          onClose={() => setShowDayDetail(false)}
          onToggleCrew={toggleCrewOnJob}
        />
      )}

      {/* Job Detail Modal */}
      {selectedJobDetail && (
        <JobDetailModal
          job={selectedJobDetail}
          monthName={monthNames[currentMonth]}
          year={currentYear}
          crewMembers={crewMembers}
          onClose={() => setSelectedJobDetail(null)}
          onToggleCrew={toggleCrewOnJobFromModal}
          onSaveNotes={updateJobNotes}
        />
      )}

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </div>
  );
}

function DayDetailPanel({
  date,
  month,
  year,
  jobs,
  crewStatuses,
  crewMembers,
  onClose,
  onToggleCrew,
}: {
  date: number;
  month: string;
  year: number;
  jobs: ScheduledJob[];
  crewStatuses: CrewDayStatus[];
  crewMembers: CrewMember[];
  onClose: () => void;
  onToggleCrew: (jobId: string, crewId: string) => void;
}) {
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const getCrewMember = (id: string) => crewMembers.find(c => c.id === id);
  const getAvailabilityColor = (hoursBooked: number): string => {
    if (hoursBooked === 0) return 'bg-green-400';
    if (hoursBooked < 4) return 'bg-green-400';
    if (hoursBooked < 7) return 'bg-amber-400';
    return 'bg-red-400';
  };
  const getAvailabilityLabel = (hoursBooked: number): string => {
    if (hoursBooked === 0) return 'Available';
    if (hoursBooked < 4) return 'Light';
    if (hoursBooked < 7) return 'Moderate';
    return 'Full Day';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0B1F33] rounded-xl flex items-center justify-center">
            <span className="text-white text-sm font-bold">{date}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0B1F33]">{month} {date}, {year}</h4>
            <p className="text-[11px] text-[#6B7C8F]">{jobs.length} scheduled item{jobs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-[#0B1F33]"></i>
        </button>
      </div>

      {/* Jobs for this day */}
      {jobs.length > 0 ? (
        <div className="space-y-2 mb-4">
          {jobs.map((job) => {
            const isEditing = editingJobId === job.id;
            return (
              <div key={job.id} className="border-l-4 rounded-lg p-3 bg-[#F9F9FB]" style={{ borderLeftColor: job.color.includes('blue') ? '#3B82F6' : job.color.includes('emerald') ? '#10B981' : job.color.includes('amber') ? '#F59E0B' : job.color.includes('rose') ? '#F43F5E' : job.color.includes('violet') ? '#8B5CF6' : '#14B8A6' }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#0B1F33] mb-0.5">{job.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-[#6B7C8F]">
                      <span><i className="ri-time-line mr-0.5"></i>{job.time}</span>
                      <span>&bull;</span>
                      <span>{job.duration}</span>
                    </div>
                    {job.address && (
                      <p className="text-[11px] text-[#6B7C8F] mt-0.5">
                        <i className="ri-map-pin-line mr-0.5"></i>{job.address}
                      </p>
                    )}
                    {job.notes && (
                      <p className="text-[11px] text-[#6B7C8F] mt-0.5 italic">
                        <i className="ri-sticky-note-line mr-0.5"></i>{job.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setEditingJobId(isEditing ? null : job.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-all whitespace-nowrap ${
                        isEditing ? 'bg-teal-600 text-white' : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
                      }`}
                    >
                      <i className={`${isEditing ? 'ri-check-line' : 'ri-user-settings-line'} mr-0.5`}></i>
                      {isEditing ? 'Done' : 'Crew'}
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                      job.type === 'appointment' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {job.type === 'appointment' ? 'Appt' : 'Job'}
                    </span>
                  </div>
                </div>
                {/* Assigned crew */}
                {!isEditing && job.assignedCrew.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {job.assignedCrew.map((crewId) => {
                      const member = getCrewMember(crewId);
                      if (!member) return null;
                      return (
                        <div
                          key={crewId}
                          className={`w-6 h-6 ${member.color} rounded-full flex items-center justify-center text-white text-[8px] font-bold border-2 border-white`}
                          title={member.name}
                        >
                          {member.avatar}
                        </div>
                      );
                    })}
                  </div>
                )}
                {/* Inline crew editor */}
                {isEditing && (
                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-1.5">
                    <p className="text-[10px] font-bold text-[#6B7C8F] uppercase tracking-wider mb-1">Tap to assign / unassign</p>
                    {crewMembers.map((member) => {
                      const isAssigned = job.assignedCrew.includes(member.id);
                      return (
                        <button
                          key={member.id}
                          onClick={() => onToggleCrew(job.id, member.id)}
                          className={`flex items-center gap-2 w-full p-2 rounded-lg transition-all cursor-pointer ${
                            isAssigned ? 'bg-teal-50 border border-teal-200' : 'bg-white border border-gray-100 hover:border-gray-200'
                          }`}
                        >
                          <div className={`w-6 h-6 ${member.color} rounded-full flex items-center justify-center text-white text-[8px] font-bold`}>
                            {member.avatar}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-[11px] font-semibold text-[#0B1F33] truncate">{member.name}</p>
                            <p className="text-[9px] text-[#6B7C8F]">{member.role}</p>
                          </div>
                          <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${isAssigned ? 'bg-teal-600' : 'bg-gray-200'}`}>
                            {isAssigned && <i className="ri-check-line text-white text-[10px]"></i>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-6 mb-4 bg-[#F9F9FB] rounded-xl">
          <i className="ri-calendar-line text-[#6B7C8F] text-2xl mb-1 block"></i>
          <p className="text-xs text-[#6B7C8F]">No jobs scheduled</p>
        </div>
      )}

      {/* Crew Availability for this day */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <i className="ri-team-line text-[#0B1F33] text-sm"></i>
          <h5 className="text-xs font-bold text-[#0B1F33] uppercase tracking-wider">Crew Availability</h5>
        </div>
        <div className="space-y-2">
          {crewStatuses.map((status) => {
            const member = getCrewMember(status.crewId);
            if (!member) return null;
            const pct = Math.round((status.hoursBooked / status.maxHours) * 100);
            return (
              <div key={status.crewId} className="flex items-center gap-3 p-2 bg-[#F9F9FB] rounded-lg">
                <div className={`w-7 h-7 ${member.color} rounded-full flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                  {member.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-semibold text-[#0B1F33] truncate">{member.name}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      status.hoursBooked === 0 ? 'bg-green-100 text-green-600' :
                      status.hoursBooked < 4 ? 'bg-green-100 text-green-600' :
                      status.hoursBooked < 7 ? 'bg-amber-100 text-amber-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {getAvailabilityLabel(status.hoursBooked)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getAvailabilityColor(status.hoursBooked)}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-[10px] text-[#6B7C8F] mt-0.5">{status.hoursBooked}h / {status.maxHours}h</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function JobDetailModal({
  job,
  monthName,
  year,
  crewMembers,
  onClose,
  onToggleCrew,
  onSaveNotes,
}: {
  job: ScheduledJob;
  monthName: string;
  year: number;
  crewMembers: CrewMember[];
  onClose: () => void;
  onToggleCrew: (jobId: string, crewId: string) => void;
  onSaveNotes: (jobId: string, notes: string) => void;
}) {
  const [editingCrew, setEditingCrew] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState(job.notes || '');

  const getCrewMember = (id: string) => crewMembers.find(c => c.id === id);

  const colorMap: Record<string, string> = {
    'bg-blue-500': '#3B82F6',
    'bg-emerald-500': '#10B981',
    'bg-amber-500': '#F59E0B',
    'bg-rose-500': '#F43F5E',
    'bg-violet-500': '#8B5CF6',
    'bg-teal-500': '#14B8A6',
    'bg-cyan-500': '#06B6D4',
    'bg-indigo-500': '#6366F1',
    'bg-orange-500': '#F97316',
  };

  const accentColor = colorMap[job.color] || '#3B82F6';

  const categoryMap: Record<string, string> = {
    'bg-blue-500': 'Renovation',
    'bg-emerald-500': 'Plumbing',
    'bg-amber-500': 'Electrical',
    'bg-rose-500': 'HVAC',
    'bg-violet-500': 'Multi-Trade',
    'bg-teal-500': 'Appointment',
  };

  const category = categoryMap[job.color] || 'General';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: accentColor }}></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <i
                  className={`${job.type === 'appointment' ? 'ri-calendar-check-line' : 'ri-briefcase-line'} text-2xl`}
                  style={{ color: accentColor }}
                ></i>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#0B1F33]">{job.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                    style={{ backgroundColor: accentColor }}
                  >
                    {category}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    job.type === 'appointment' ? 'bg-teal-100 text-teal-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {job.type === 'appointment' ? 'Appointment' : 'Active Job'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors cursor-pointer"
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
              <p className="text-xs text-[#6B7C8F]">Date</p>
              <p className="text-sm font-bold text-[#0B1F33]">{monthName} {job.date}, {year}</p>
            </div>
            <div className="bg-[#F9F9FB] rounded-xl p-3 text-center">
              <i className="ri-time-line text-[#6B7C8F] text-lg mb-1 block"></i>
              <p className="text-xs text-[#6B7C8F]">Time</p>
              <p className="text-sm font-bold text-[#0B1F33]">{job.time}</p>
            </div>
            <div className="bg-[#F9F9FB] rounded-xl p-3 text-center">
              <i className="ri-timer-line text-[#6B7C8F] text-lg mb-1 block"></i>
              <p className="text-xs text-[#6B7C8F]">Duration</p>
              <p className="text-sm font-bold text-[#0B1F33]">{job.duration}</p>
            </div>
          </div>

          {/* Address */}
          {job.address && (
            <div className="flex items-start gap-3 p-3 bg-[#F9F9FB] rounded-xl">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="ri-map-pin-line text-[#6B7C8F]"></i>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F] mb-0.5">Location</p>
                <p className="text-sm font-semibold text-[#0B1F33]">{job.address}</p>
              </div>
            </div>
          )}

          {/* Crew Assignment */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <i className="ri-team-line text-[#0B1F33]"></i>
                <h4 className="text-sm font-bold text-[#0B1F33]">Assigned Crew</h4>
                {job.assignedCrew.length > 0 && (
                  <span className="text-xs text-[#6B7C8F]">({job.assignedCrew.length})</span>
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
                {job.assignedCrew.length > 0 ? (
                  job.assignedCrew.map((crewId) => {
                    const member = getCrewMember(crewId);
                    if (!member) return null;
                    return (
                      <div key={crewId} className="flex items-center gap-3 p-2.5 bg-[#F9F9FB] rounded-xl">
                        <div className={`w-9 h-9 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                          {member.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F33]">{member.name}</p>
                          <p className="text-xs text-[#6B7C8F]">{member.role} &bull; ${member.hourlyRate}/hr</p>
                        </div>
                        <div className="ml-auto text-xs text-[#6B7C8F]">${member.hourlyRate}/hr</div>
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
                {crewMembers.map((member) => {
                  const isAssigned = job.assignedCrew.includes(member.id);
                  return (
                    <button
                      key={member.id}
                      onClick={() => onToggleCrew(job.id, member.id)}
                      className={`flex items-center gap-3 w-full p-2.5 rounded-lg transition-all cursor-pointer ${
                        isAssigned ? 'bg-teal-50 border border-teal-200' : 'bg-white border border-gray-100 hover:border-gray-200'
                      }`}
                    >
                      <div className={`w-9 h-9 ${member.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
                        {member.avatar}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-sm font-semibold text-[#0B1F33]">{member.name}</p>
                        <p className="text-xs text-[#6B7C8F]">{member.role} &bull; ${member.hourlyRate}/hr</p>
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${isAssigned ? 'bg-teal-600' : 'bg-gray-200'}`}>
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
                  onClick={() => { setEditingNotes(true); setTempNotes(job.notes || ''); }}
                  className="text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer flex items-center gap-1"
                >
                  <i className="ri-pencil-line"></i>
                  Edit
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { setEditingNotes(false); setTempNotes(job.notes || ''); }}
                    className="text-xs font-semibold text-[#6B7C8F] hover:text-[#0B1F33] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => { onSaveNotes(job.id, tempNotes); setEditingNotes(false); }}
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
                {job.notes ? (
                  <p className="text-sm text-[#0B1F33] leading-relaxed">{job.notes}</p>
                ) : (
                  <p className="text-sm text-[#6B7C8F] italic">No notes added yet. Click Edit to add notes.</p>
                )}
              </div>
            ) : (
              <textarea
                value={tempNotes}
                onChange={(e) => setTempNotes(e.target.value)}
                placeholder="Add notes about this job..."
                rows={4}
                maxLength={500}
                className="w-full px-4 py-3 bg-[#F9F9FB] border border-gray-200 rounded-xl text-[#0B1F33] placeholder-[#6B7C8F] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
              />
            )}
          </div>

          {/* Cost Estimate */}
          {job.assignedCrew.length > 0 && job.type === 'job' && (
            <div className="bg-gradient-to-r from-[#0B1F33] to-[#162d45] rounded-xl p-4 text-white">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-money-dollar-circle-line text-teal-400"></i>
                <h4 className="text-sm font-bold">Labor Cost Estimate</h4>
              </div>
              <div className="space-y-2">
                {job.assignedCrew.map((crewId) => {
                  const member = getCrewMember(crewId);
                  if (!member) return null;
                  const hours = parseDuration(job.duration);
                  const cost = member.hourlyRate * hours;
                  return (
                    <div key={crewId} className="flex items-center justify-between text-sm">
                      <span className="text-white/70">{member.name} ({hours}h &times; ${member.hourlyRate})</span>
                      <span className="font-bold">${cost.toFixed(0)}</span>
                    </div>
                  );
                })}
                <div className="border-t border-white/20 pt-2 mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-teal-400">Total Estimated</span>
                  <span className="text-lg font-bold">
                    ${job.assignedCrew.reduce((sum, crewId) => {
                      const member = getCrewMember(crewId);
                      if (!member) return sum;
                      return sum + member.hourlyRate * parseDuration(job.duration);
                    }, 0).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#162d45] transition-colors cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
