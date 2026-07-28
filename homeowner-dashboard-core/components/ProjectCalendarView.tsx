import { useState, useMemo } from 'react';

interface Milestone {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in-progress' | 'completed' | 'skipped';
  due_date: string | null;
  completed_at: string | null;
  sort_order: number;
}

interface Approval {
  id: string;
  type: 'estimate' | 'change_order' | 'milestone' | 'completion';
  title: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: string;
  amount?: number;
}

interface ProjectCalendarViewProps {
  milestones: Milestone[];
  approvals: Approval[];
  projectStart: string;
  projectEnd: string;
  projectTitle: string;
  projectProgress: number;
}

interface CalendarEvent {
  id: string;
  label: string;
  type: 'milestone' | 'approval' | 'project-start' | 'project-end';
  status: string;
  date: Date;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

const eventStyles: Record<string, { dot: string; bg: string; text: string; border: string }> = {
  'milestone-completed': { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'milestone-in-progress': { dot: 'bg-teal-500', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  'milestone-pending': { dot: 'bg-gray-400', bg: 'bg-gray-50', text: 'text-gray-600', border: 'border-gray-200' },
  'milestone-skipped': { dot: 'bg-gray-300', bg: 'bg-gray-50', text: 'text-gray-500', border: 'border-gray-200' },
  'approval-pending': { dot: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
  'approval-approved': { dot: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  'approval-rejected': { dot: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'project-start': { dot: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'project-end': { dot: 'bg-[#0B1F33]', bg: 'bg-[#0B1F33]/5', text: 'text-[#0B1F33]', border: 'border-[#0B1F33]/20' },
};

function getEventStyle(event: CalendarEvent) {
  const key = `${event.type}-${event.status}`;
  return eventStyles[key] || eventStyles['milestone-pending'];
}

const eventIcons: Record<string, string> = {
  'milestone-completed': 'ri-check-line',
  'milestone-in-progress': 'ri-loader-4-line',
  'milestone-pending': 'ri-time-line',
  'milestone-skipped': 'ri-skip-forward-line',
  'approval-pending': 'ri-error-warning-line',
  'approval-approved': 'ri-checkbox-circle-line',
  'approval-rejected': 'ri-close-circle-line',
  'project-start': 'ri-play-circle-line',
  'project-end': 'ri-flag-line',
};

export default function ProjectCalendarView({
  milestones,
  approvals,
  projectStart,
  projectEnd,
  projectTitle,
  projectProgress,
}: ProjectCalendarViewProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Build calendar events
  const events = useMemo(() => {
    const items: CalendarEvent[] = [];

    // Project start/end
    if (projectStart) {
      items.push({
        id: 'project-start',
        label: 'Project Start',
        type: 'project-start',
        status: 'start',
        date: new Date(projectStart + 'T00:00:00'),
      });
    }
    if (projectEnd) {
      items.push({
        id: 'project-end',
        label: 'Est. Completion',
        type: 'project-end',
        status: 'end',
        date: new Date(projectEnd + 'T00:00:00'),
      });
    }

    // Milestones
    for (const ms of milestones) {
      if (ms.due_date) {
        items.push({
          id: ms.id,
          label: ms.title,
          type: 'milestone',
          status: ms.status,
          date: new Date(ms.due_date + 'T00:00:00'),
        });
      }
    }

    // Approvals
    for (const ap of approvals) {
      if (ap.submittedDate) {
        items.push({
          id: ap.id,
          label: ap.title,
          type: 'approval',
          status: ap.status,
          date: new Date(ap.submittedDate + 'T00:00:00'),
        });
      }
    }

    return items;
  }, [milestones, approvals, projectStart, projectEnd]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => events.filter(e => isSameDay(e.date, date));

  // Calendar grid
  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  // Is date in project range?
  const projectStartDate = projectStart ? new Date(projectStart + 'T00:00:00') : null;
  const projectEndDate = projectEnd ? new Date(projectEnd + 'T00:00:00') : null;

  const isInProjectRange = (date: Date) => {
    if (!projectStartDate || !projectEndDate) return false;
    return date >= projectStartDate && date <= projectEndDate;
  };

  const navigateMonth = (dir: -1 | 1) => {
    const newMonth = currentMonth + dir;
    if (newMonth < 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else if (newMonth > 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(newMonth);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
    setSelectedDay(today);
  };

  const selectedDayEvents = selectedDay ? getEventsForDate(selectedDay) : [];

  // Count upcoming milestones
  const upcomingMilestones = milestones.filter(m => m.status !== 'completed' && m.status !== 'skipped' && m.due_date);
  const nextMilestone = upcomingMilestones.sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())[0];
  const pendingApprovalCount = approvals.filter(a => a.status === 'pending').length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Progress</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">{projectProgress}%</p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Milestones</p>
          <p className="text-lg sm:text-xl font-bold text-[#0B1F33]">
            {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
          </p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-3">
          <p className="text-xs text-[#6B7C8F] mb-1">Next Milestone</p>
          <p className="text-sm font-bold text-[#0B1F33] truncate">
            {nextMilestone ? nextMilestone.title : '—'}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${pendingApprovalCount > 0 ? 'bg-orange-50 border border-orange-200' : 'bg-[#F9F9FB]'}`}>
          <p className="text-xs text-[#6B7C8F] mb-1">Pending Approvals</p>
          <p className={`text-lg sm:text-xl font-bold ${pendingApprovalCount > 0 ? 'text-orange-600' : 'text-[#0B1F33]'}`}>
            {pendingApprovalCount}
          </p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-100">
          <button
            onClick={() => navigateMonth(-1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ri-arrow-left-s-line text-lg sm:text-xl text-[#6B7C8F]"></i>
          </button>
          <div className="flex items-center gap-3">
            <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">
              {MONTH_NAMES[currentMonth]} {currentYear}
            </h3>
            <button
              onClick={goToToday}
              className="text-xs px-2 py-1 bg-[#F9F9FB] rounded-md text-[#6B7C8F] hover:bg-gray-200 transition-colors font-medium"
            >
              Today
            </button>
          </div>
          <button
            onClick={() => navigateMonth(1)}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
          >
            <i className="ri-arrow-right-s-line text-lg sm:text-xl text-[#6B7C8F]"></i>
          </button>
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {WEEKDAYS.map(day => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-[#6B7C8F]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[60px] sm:min-h-[80px] border-b border-r border-gray-50 bg-gray-50/50" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const date = new Date(currentYear, currentMonth, dayNum);
            const dayEvents = getEventsForDate(date);
            const isToday = isSameDay(date, today);
            const isSelected = selectedDay && isSameDay(date, selectedDay);
            const inRange = isInProjectRange(date);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <div
                key={dayNum}
                onClick={() => setSelectedDay(date)}
                className={`min-h-[60px] sm:min-h-[80px] border-b border-r border-gray-50 p-1 sm:p-1.5 cursor-pointer transition-colors relative ${
                  isSelected
                    ? 'bg-[#0B1F33]/5 ring-2 ring-[#0B1F33] ring-inset'
                    : inRange
                    ? 'bg-teal-50/30 hover:bg-teal-50/50'
                    : isWeekend
                    ? 'bg-gray-50/50 hover:bg-gray-100'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className={`text-xs sm:text-sm font-medium mb-0.5 ${
                  isToday
                    ? 'w-6 h-6 sm:w-7 sm:h-7 bg-[#0B1F33] text-white rounded-full flex items-center justify-center'
                    : isSelected
                    ? 'text-[#0B1F33] font-bold'
                    : 'text-[#6B7C8F]'
                }`}>
                  {dayNum}
                </div>

                {/* Event dots */}
                <div className="flex flex-wrap gap-0.5">
                  {dayEvents.slice(0, 3).map(event => {
                    const style = getEventStyle(event);
                    return (
                      <div key={event.id} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${style.dot}`} title={event.label} />
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <span className="text-[8px] sm:text-[9px] text-[#6B7C8F] font-medium">+{dayEvents.length - 3}</span>
                  )}
                </div>

                {/* First event label (desktop only) */}
                {dayEvents.length > 0 && (
                  <div className="hidden sm:block mt-0.5">
                    {dayEvents.slice(0, 2).map(event => {
                      const style = getEventStyle(event);
                      return (
                        <div key={event.id} className={`text-[9px] leading-tight truncate px-1 py-0.5 rounded ${style.bg} ${style.text} mb-0.5`}>
                          {event.label}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Detail */}
      {selectedDay && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">
          <h4 className="font-bold text-[#0B1F33] mb-3">
            {selectedDay.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </h4>

          {selectedDayEvents.length === 0 ? (
            <p className="text-sm text-[#6B7C8F]">
              {isInProjectRange(selectedDay)
                ? 'No events scheduled for this day. Project work may still be ongoing.'
                : 'No events on this day.'}
            </p>
          ) : (
            <div className="space-y-3">
              {selectedDayEvents.map(event => {
                const style = getEventStyle(event);
                const iconKey = `${event.type}-${event.status}`;
                const icon = eventIcons[iconKey] || 'ri-circle-line';

                return (
                  <div key={event.id} className={`flex items-start gap-3 p-3 rounded-lg border ${style.bg} ${style.border}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${style.dot}`}>
                      <i className={`${icon} text-white text-sm`}></i>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm ${style.text}`}>{event.label}</p>
                      <p className="text-xs text-[#6B7C8F] mt-0.5">
                        {event.type === 'milestone' && `Milestone — ${event.status.replace('-', ' ')}`}
                        {event.type === 'approval' && `Approval — ${event.status}`}
                        {event.type === 'project-start' && `${projectTitle}`}
                        {event.type === 'project-end' && `${projectTitle}`}
                      </p>
                      {event.type === 'milestone' && (() => {
                        const ms = milestones.find(m => m.id === event.id);
                        return ms?.description ? <p className="text-xs text-[#6B7C8F] mt-1">{ms.description}</p> : null;
                      })()}
                      {event.type === 'approval' && (() => {
                        const ap = approvals.find(a => a.id === event.id);
                        return ap?.amount ? <p className="text-xs text-[#6B7C8F] mt-1">${ap.amount.toLocaleString()}</p> : null;
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-[#6B7C8F]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
          Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-teal-500"></div>
          In Progress
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>
          Pending
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
          Needs Approval
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
          Project Start
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#0B1F33]"></div>
          Est. Completion
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-2.5 rounded-sm bg-teal-50 border border-teal-200"></div>
          Project Duration
        </div>
      </div>
    </div>
  );
}
