import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  color: string;
  hourly_rate: number;
  active: boolean;
  created_at: string;
}

const COLOR_OPTIONS = [
  { value: 'bg-blue-500', label: 'Blue', preview: 'bg-blue-500' },
  { value: 'bg-teal-500', label: 'Teal', preview: 'bg-teal-500' },
  { value: 'bg-green-500', label: 'Green', preview: 'bg-green-500' },
  { value: 'bg-purple-500', label: 'Purple', preview: 'bg-purple-500' },
  { value: 'bg-orange-500', label: 'Orange', preview: 'bg-orange-500' },
  { value: 'bg-red-500', label: 'Red', preview: 'bg-red-500' },
  { value: 'bg-pink-500', label: 'Pink', preview: 'bg-pink-500' },
  { value: 'bg-yellow-500', label: 'Yellow', preview: 'bg-yellow-500' },
];

const ROLE_SUGGESTIONS = [
  'Foreman', 'Lead Technician', 'Apprentice', 'Journeyman', 'Helper',
  'Project Manager', 'Electrician', 'Plumber', 'HVAC Tech', 'Carpenter',
  'Painter', 'Laborer', 'Driver', 'Office Manager',
];

export default function TeamMembers() {
  const { user } = useAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '',
    role: '',
    color: 'bg-blue-500',
    hourlyRate: '',
  });

  const fetchMembers = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setMembers(data || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const openAdd = () => {
    setEditingMember(null);
    setForm({ name: '', role: '', color: 'bg-blue-500', hourlyRate: '' });
    setShowModal(true);
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      role: member.role,
      color: member.color,
      hourlyRate: member.hourly_rate ? member.hourly_rate.toString() : '',
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!user || !form.name.trim()) return;
    setSaving(true);

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      color: form.color,
      hourly_rate: Number(form.hourlyRate) || 0,
    };

    if (editingMember) {
      await supabase.from('team_members').update(payload).eq('id', editingMember.id).eq('user_id', user.id);
    } else {
      await supabase.from('team_members').insert({ ...payload, user_id: user.id });
    }

    setSaving(false);
    setShowModal(false);
    setEditingMember(null);
    fetchMembers();
  };

  const handleToggleActive = async (member: TeamMember) => {
    await supabase.from('team_members').update({ active: !member.active }).eq('id', member.id);
    setMembers(prev => prev.map(m => m.id === member.id ? { ...m, active: !m.active } : m));
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    await supabase.from('team_members').delete().eq('id', id).eq('user_id', user.id);
    setShowDeleteConfirm(null);
    setMembers(prev => prev.filter(m => m.id !== id));
  };

  const activeCount = members.filter(m => m.active).length;
  const totalHourlyRate = members.filter(m => m.active).reduce((sum, m) => sum + m.hourly_rate, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-[#0B1F33]">Team Members</h3>
          <p className="text-sm text-[#6B7C8F]">Manage your crew for job scheduling and assignments</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
        >
          <i className="ri-add-line"></i>
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#F9F9FB] rounded-lg p-4">
          <p className="text-xs text-[#6B7C8F] mb-1">Total Members</p>
          <p className="text-2xl font-bold text-[#0B1F33]">{members.length}</p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-4">
          <p className="text-xs text-[#6B7C8F] mb-1">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-[#F9F9FB] rounded-lg p-4">
          <p className="text-xs text-[#6B7C8F] mb-1">Total Hourly Cost</p>
          <p className="text-2xl font-bold text-[#0B1F33]">${totalHourlyRate.toFixed(2)}/hr</p>
        </div>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-14 h-14 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-team-line text-2xl text-[#D4B483]"></i>
          </div>
          <h4 className="font-bold text-[#0B1F33] mb-1">No team members yet</h4>
          <p className="text-sm text-[#6B7C8F] mb-4">Add crew members to assign them to jobs on your calendar</p>
          <button
            onClick={openAdd}
            className="px-6 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer"
          >
            <i className="ri-add-line mr-2"></i>Add Your First Member
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <div
              key={member.id}
              className={`bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-4 transition-all ${!member.active ? 'opacity-50' : ''}`}
            >
              {/* Color Avatar */}
              <div className={`w-11 h-11 ${member.color} rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                {member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h4 className="font-bold text-[#0B1F33] text-sm truncate">{member.name}</h4>
                  {!member.active && (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-[10px] font-semibold rounded-full">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#6B7C8F]">
                  {member.role && <span>{member.role}</span>}
                  {member.hourly_rate > 0 && <span>${member.hourly_rate.toFixed(2)}/hr</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleToggleActive(member)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg transition-colors cursor-pointer ${member.active ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                  title={member.active ? 'Set inactive' : 'Set active'}
                >
                  <i className={member.active ? 'ri-toggle-fill text-xl' : 'ri-toggle-line text-xl'}></i>
                </button>
                <button
                  onClick={() => openEdit(member)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-[#6B7C8F] hover:bg-gray-50 transition-colors cursor-pointer"
                  title="Edit"
                >
                  <i className="ri-edit-line"></i>
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(member.id)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Delete"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-[#0B1F33]">{editingMember ? 'Edit Team Member' : 'Add Team Member'}</h3>
                <button onClick={() => { setShowModal(false); setEditingMember(null); }} className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer">
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Mike Johnson"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Role</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Lead Technician"
                    list="role-suggestions"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  />
                  <datalist id="role-suggestions">
                    {ROLE_SUGGESTIONS.map(r => <option key={r} value={r} />)}
                  </datalist>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-1.5">Hourly Rate ($)</label>
                  <input
                    type="number"
                    value={form.hourlyRate}
                    onChange={e => setForm(prev => ({ ...prev, hourlyRate: e.target.value }))}
                    placeholder="e.g., 35"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0B1F33] mb-2">Color Tag</label>
                  <div className="flex flex-wrap gap-2">
                    {COLOR_OPTIONS.map(c => (
                      <button
                        key={c.value}
                        onClick={() => setForm(prev => ({ ...prev, color: c.value }))}
                        className={`w-9 h-9 rounded-full ${c.preview} cursor-pointer transition-all ${form.color === c.value ? 'ring-2 ring-offset-2 ring-[#0B1F33] scale-110' : 'hover:scale-105'}`}
                        title={c.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); setEditingMember(null); }}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingMember ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-sm w-full p-6">
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-delete-bin-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Remove Team Member?</h3>
              <p className="text-sm text-[#6B7C8F]">
                This will also remove them from any job assignments. This cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowDeleteConfirm(null)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => handleDelete(showDeleteConfirm)} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all cursor-pointer whitespace-nowrap">Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
