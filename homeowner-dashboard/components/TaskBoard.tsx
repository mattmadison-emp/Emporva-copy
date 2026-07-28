import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface DIYTask {
  id: string;
  description: string;
  completed: boolean;
}

interface DIYProject {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Not started' | 'In progress' | 'Paused' | 'Completed';
  complexity?: 'Easy' | 'Moderate' | 'Advanced';
  targetDate?: string;   // YYYY-MM-DD — estimated completion date
  totalCost: number;
  tasks: DIYTask[];
  handedOffToContractor: boolean;
}

type ColumnId = 'diagnose' | 'plan' | 'quote' | 'scheduled' | 'inProgress' | 'completed';

// DIY projects have only 4 statuses; map them onto the board's stages. Diagnose,
// Quote Requested and Work Scheduled have no DIY equivalent and stay empty.
const STATUS_TO_COLUMN: Record<DIYProject['status'], ColumnId> = {
  'Not started': 'plan',
  'In progress': 'inProgress',
  'Paused': 'inProgress',
  'Completed': 'completed',
};

function mapDbToDIY(row: Record<string, unknown>): DIYProject {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as string,
    description: (row.description as string) || '',
    status: row.status as DIYProject['status'],
    complexity: (row.complexity as DIYProject['complexity']) || undefined,
    targetDate: (row.target_date as string) || undefined,
    totalCost: Number(row.total_cost) || 0,
    tasks: (row.tasks as DIYTask[]) || [],
    handedOffToContractor: (row.handed_off_to_contractor as boolean) || false,
  };
}

// Parse a YYYY-MM-DD date component-wise (local) to avoid UTC timezone drift.
function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  if (!y || !m || !d) return dateStr;
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function taskProgress(tasks: DIYTask[]): number | null {
  if (!tasks.length) return null;
  return Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100);
}

// Sort by estimated completion date (target_date), soonest first; projects
// without a target date sort to the end.
function byTargetDate(a: DIYProject, b: DIYProject): number {
  if (!a.targetDate && !b.targetDate) return 0;
  if (!a.targetDate) return 1;
  if (!b.targetDate) return -1;
  return a.targetDate.localeCompare(b.targetDate);
}

export default function TaskBoard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<DIYProject[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProjects = useCallback(async () => {
    if (!user) {
      setProjects([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from('diy_projects')
      .select('id, name, category, description, status, complexity, target_date, total_cost, tasks, handed_off_to_contractor')
      .eq('user_id', user.id);
    setProjects((data || []).map(mapDbToDIY));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const columns: { id: ColumnId; title: string; icon: string; color: string }[] = [
    { id: 'diagnose', title: 'Diagnose', icon: 'ri-search-line', color: 'bg-[#0B1F33]' },
    { id: 'plan', title: 'Plan', icon: 'ri-file-list-line', color: 'bg-[#6B7C8F]' },
    { id: 'quote', title: 'Quote Requested', icon: 'ri-money-dollar-circle-line', color: 'bg-[#D4B483]' },
    { id: 'scheduled', title: 'Work Scheduled', icon: 'ri-calendar-check-line', color: 'bg-orange-500' },
    { id: 'inProgress', title: 'In Progress', icon: 'ri-loader-line', color: 'bg-[#D4B483]' },
    { id: 'completed', title: 'Completed', icon: 'ri-checkbox-circle-line', color: 'bg-green-500' }
  ];

  // Bucket DIY projects into the board columns, each sorted by estimated
  // completion date.
  const byColumn: Record<ColumnId, DIYProject[]> = {
    diagnose: [], plan: [], quote: [], scheduled: [], inProgress: [], completed: [],
  };
  for (const p of projects) {
    const col = STATUS_TO_COLUMN[p.status];
    if (col) byColumn[col].push(p);
  }
  for (const id of Object.keys(byColumn) as ColumnId[]) {
    byColumn[id].sort(byTargetDate);
  }

  const inProgressCount = projects.filter(p => p.status === 'In progress' || p.status === 'Paused').length;
  const completedCount = projects.filter(p => p.status === 'Completed').length;
  const notStartedCount = projects.filter(p => p.status === 'Not started').length;

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'Advanced':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'Moderate':
        return 'bg-[#D4B483]/10 text-[#D4B483] border-[#D4B483]/20';
      case 'Easy':
        return 'bg-green-500/10 text-green-600 border-green-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-3xl text-[#0B1F33] mb-3 block"></i>
          <p className="text-[#6B7C8F]">Loading task board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Task Board
            </h2>
            <p className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Track your DIY projects from planning to completion
            </p>
          </div>
        </div>
      </div>

      {projects.length === 0 ? (
        /* Empty state */
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#F4F4F6] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <i className="ri-tools-line text-3xl text-[#6B7C8F]"></i>
          </div>
          <h3 className="text-xl font-bold text-[#0B1F33] mb-2">No DIY projects yet</h3>
          <p className="text-[#6B7C8F] max-w-md mx-auto">
            DIY projects you create will appear here, organized by stage and sorted by their estimated completion date.
          </p>
        </div>
      ) : (
        <>
          {/* Kanban Board */}
          <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {columns.map((column) => {
              const cards = byColumn[column.id];
              return (
                <div key={column.id} className="bg-[#F9F9FB] rounded-xl p-4">
                  {/* Column Header */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-8 h-8 flex items-center justify-center ${column.color} rounded-lg text-white`}>
                      <i className={column.icon}></i>
                    </div>
                    <div>
                      <h3 className="font-bold text-[#2D2A74] text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        {column.title}
                      </h3>
                      <div className="text-xs text-gray-500">
                        {cards.length} {cards.length === 1 ? 'project' : 'projects'}
                      </div>
                    </div>
                  </div>

                  {/* Project Cards */}
                  <div className="space-y-3">
                    {cards.map((project) => {
                      const progress = taskProgress(project.tasks);
                      return (
                        <div
                          key={project.id}
                          className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-[#D4B483] transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h4 className="font-bold text-[#0B1F33] text-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
                              {project.name}
                            </h4>
                            {project.complexity && (
                              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border whitespace-nowrap ${getComplexityColor(project.complexity)}`}>
                                {project.complexity}
                              </span>
                            )}
                          </div>

                          {project.description && (
                            <p className="text-xs text-[#333645] mb-3 line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {project.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="text-xs px-2 py-1 bg-[#D4B483]/10 text-[#D4B483] rounded font-semibold">
                              {project.category}
                            </span>
                            {project.status === 'Paused' && (
                              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-semibold flex items-center gap-1">
                                <i className="ri-pause-circle-line"></i> Paused
                              </span>
                            )}
                          </div>

                          {project.handedOffToContractor && (
                            <div className="text-xs text-[#333645] mb-2 flex items-center gap-1">
                              <i className="ri-user-shared-line text-[#D4B483]"></i>
                              Handed off to contractor
                            </div>
                          )}

                          {project.targetDate && (
                            <div className="text-xs text-[#333645] mb-2 flex items-center gap-1">
                              <i className="ri-calendar-line text-[#D4B483]"></i>
                              Est. completion: {formatDate(project.targetDate)}
                            </div>
                          )}

                          {progress !== null && project.status !== 'Completed' && (
                            <div className="mb-2">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500">Progress</span>
                                <span className="font-bold text-[#D4B483]">{progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-[#D4B483] h-1.5 rounded-full transition-all"
                                  style={{ width: `${progress}%` }}
                                ></div>
                              </div>
                            </div>
                          )}

                          {project.totalCost > 0 && (
                            <div className="text-sm font-bold text-[#0B1F33]">
                              ${project.totalCost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {cards.length === 0 && (
                      <p className="text-xs text-gray-400 text-center py-4">No projects</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-3xl font-bold text-[#0B1F33] mb-1">
                {projects.length}
              </div>
              <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Total Projects
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-3xl font-bold text-[#D4B483] mb-1">
                {inProgressCount}
              </div>
              <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                In Progress
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {completedCount}
              </div>
              <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Completed
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="text-3xl font-bold text-[#6B7C8F] mb-1">
                {notStartedCount}
              </div>
              <div className="text-sm text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                Not Started
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
