import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  due_date: string | null;
  category: string;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

const categories = [
  'Maintenance',
  'Project',
  'Documentation',
  'Safety',
  'Cleaning',
  'Inspection',
  'Other',
];

const priorities: { value: Task['priority']; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

const formatDueDate = (dateStr: string | null): string => {
  if (!dateStr) return 'No date';
  const due = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  return due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const getDueDateColor = (dateStr: string | null, completed: boolean): string => {
  if (completed || !dateStr) return 'text-[#6B7C8F]';
  const due = new Date(dateStr + 'T00:00:00');
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'text-red-600';
  if (diffDays === 0) return 'text-orange-600';
  if (diffDays <= 2) return 'text-yellow-600';
  return 'text-[#6B7C8F]';
};

export default function TaskBoard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<Task['priority']>('medium');
  const [newDueDate, setNewDueDate] = useState('');
  const [newCategory, setNewCategory] = useState('Maintenance');
  const [errors, setErrors] = useState<{ title?: string }>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    const [tasksRes, propRes] = await Promise.all([
      supabase
        .from('homeowner_tasks')
        .select('id, title, priority, due_date, category, completed, completed_at, created_at')
        .eq('user_id', user.id)
        .order('completed', { ascending: true })
        .order('due_date', { ascending: true, nullsFirst: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('properties')
        .select('id')
        .eq('user_id', user.id)
        .limit(1)
        .single(),
    ]);

    if (propRes.data) setPropertyId(propRes.data.id);
    setTasks((tasksRes.data as Task[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newTitle.trim() || !user) {
      setErrors({ title: 'Task title is required' });
      return;
    }

    const { data, error } = await supabase
      .from('homeowner_tasks')
      .insert({
        user_id: user.id,
        property_id: propertyId,
        title: newTitle.trim(),
        priority: newPriority,
        due_date: newDueDate || null,
        category: newCategory,
      })
      .select('id, title, priority, due_date, category, completed, completed_at, created_at')
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return;
    }

    setTasks(prev => [data as Task, ...prev]);
    setNewTitle('');
    setNewPriority('medium');
    setNewDueDate('');
    setNewCategory('Maintenance');
    setErrors({});
    setShowModal(false);
  };

  const toggleComplete = async (task: Task) => {
    const newCompleted = !task.completed;

    await supabase
      .from('homeowner_tasks')
      .update({
        completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', task.id);

    setTasks(prev =>
      prev.map(t =>
        t.id === task.id
          ? { ...t, completed: newCompleted, completed_at: newCompleted ? new Date().toISOString() : null }
          : t
      )
    );
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete) return;
    setDeleting(true);

    await supabase
      .from('homeowner_tasks')
      .delete()
      .eq('id', taskToDelete.id);

    setTasks(prev => prev.filter(t => t.id !== taskToDelete.id));
    setDeleting(false);
    setTaskToDelete(null);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const activeCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const overdueCount = tasks.filter(t => {
    if (t.completed || !t.due_date) return false;
    const due = new Date(t.due_date + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return due < now;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#14B8A6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33]">Task Board</h2>
            <p className="text-xs sm:text-sm text-[#6B7C8F] mt-1">
              {activeCount} active · {completedCount} completed
              {overdueCount > 0 && (
                <span className="text-red-600 font-semibold"> · {overdueCount} overdue</span>
              )}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer text-sm"
          >
            <i className="ri-add-line mr-2"></i>
            Add Task
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#F9F9FB] rounded-full p-1 mb-5 w-fit">
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filter === f
                  ? 'bg-[#0B1F33] text-white'
                  : 'text-[#6B7C8F] hover:text-[#0B1F33]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === 'all' && ` (${tasks.length})`}
              {f === 'active' && ` (${activeCount})`}
              {f === 'completed' && ` (${completedCount})`}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTasks.length === 0 && (
            <div className="text-center py-8 sm:py-12 text-[#6B7C8F]">
              <i className="ri-checkbox-circle-line text-3xl sm:text-4xl mb-3 block opacity-40"></i>
              <p className="font-semibold text-sm sm:text-base">No tasks here</p>
              <p className="text-xs sm:text-sm mt-1">
                {filter === 'completed'
                  ? 'No completed tasks yet.'
                  : filter === 'active'
                  ? 'All tasks are done!'
                  : 'Add a task to get started.'}
              </p>
            </div>
          )}
          {filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-[#F9F9FB] rounded-lg hover:shadow-md transition-all ${
                task.completed ? 'opacity-60' : ''
              }`}
            >
              <button
                onClick={() => toggleComplete(task)}
                className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md border-2 flex items-center justify-center cursor-pointer transition-colors flex-shrink-0 ${
                  task.completed
                    ? 'bg-teal-600 border-teal-600'
                    : 'border-gray-300 hover:border-[#0B1F33]'
                }`}
              >
                {task.completed && (
                  <i className="ri-check-line text-white text-xs sm:text-sm"></i>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <h4
                  className={`font-semibold text-[#0B1F33] text-sm sm:text-base mb-1 ${
                    task.completed ? 'line-through' : ''
                  }`}
                >
                  {task.title}
                </h4>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                  <span className={`flex items-center gap-1 ${getDueDateColor(task.due_date, task.completed)}`}>
                    <i className="ri-calendar-line"></i>
                    {formatDueDate(task.due_date)}
                  </span>
                  <span className="flex items-center gap-1 text-[#6B7C8F]">
                    <i className="ri-price-tag-3-line"></i>
                    {task.category}
                  </span>
                </div>
              </div>
              <span
                className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-semibold flex-shrink-0 ${
                  task.priority === 'high'
                    ? 'bg-red-100 text-red-700'
                    : task.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}
              >
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
              <button
                onClick={() => setTaskToDelete(task)}
                className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer text-[#6B7C8F] hover:text-red-600 transition-colors flex-shrink-0"
              >
                <i className="ri-delete-bin-line text-sm sm:text-base"></i>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Task Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4">
          <div
            className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center">
                  <i className="ri-task-line text-[#0B1F33] text-lg sm:text-xl"></i>
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Add New Task</h3>
                  <p className="text-xs sm:text-sm text-[#6B7C8F]">Create a task for your property</p>
                </div>
              </div>
              <button
                onClick={() => { setShowModal(false); setErrors({}); }}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-lg sm:text-xl text-[#6B7C8F]"></i>
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 space-y-4 sm:space-y-5">
              {/* Title */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); if (errors.title) setErrors({}); }}
                  placeholder="e.g. Schedule annual furnace inspection"
                  className={`w-full px-4 py-2.5 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 transition-colors ${
                    errors.title ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-[#F9F9FB]'
                  }`}
                />
                {errors.title && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <i className="ri-error-warning-line"></i>
                    {errors.title}
                  </p>
                )}
              </div>

              {/* Priority & Due Date Row */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Priority</label>
                  <div className="flex gap-1.5 sm:gap-2">
                    {priorities.map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setNewPriority(p.value)}
                        className={`flex-1 py-2 rounded-lg text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          newPriority === p.value
                            ? p.value === 'high'
                              ? 'bg-red-100 text-red-700 ring-2 ring-red-300'
                              : p.value === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                              : 'bg-green-100 text-green-700 ring-2 ring-green-300'
                            : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-100'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Due Date</label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg border border-gray-200 bg-[#F9F9FB] text-sm focus:outline-none focus:ring-2 focus:ring-[#0B1F33]/20 cursor-pointer"
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">Category</label>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setNewCategory(cat)}
                      className={`px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        newCategory === cat
                          ? 'bg-[#0B1F33] text-white'
                          : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-[#F9F9FB]/50">
              <button
                onClick={() => { setShowModal(false); setErrors({}); }}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold text-[#6B7C8F] hover:bg-gray-100 transition-colors cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTask}
                className="px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold bg-[#0B1F33] text-white hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-add-line mr-1.5"></i>
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {taskToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-5 sm:p-6">
            <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-red-100 rounded-full">
              <i className="ri-delete-bin-line text-2xl text-red-600"></i>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center mb-2">Delete Task</h3>
            <p className="text-xs sm:text-sm text-gray-600 text-center mb-1">Are you sure you want to delete:</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-900 text-center mb-5">
              "{taskToDelete.title}"
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setTaskToDelete(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-xs sm:text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTask}
                disabled={deleting}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs sm:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
