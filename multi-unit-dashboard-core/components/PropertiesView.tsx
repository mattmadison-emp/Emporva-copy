import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Property, PropertyType, FloorCount } from '../../../types/property';

const propertyTypeLabels: Record<string, string> = {
  'single-family': 'Single Family',
  'townhouse': 'Townhouse',
  'condo': 'Condo',
  'multi-unit': 'Multi-Unit',
  'other': 'Other',
};

const emptyForm = {
  address: '',
  property_type: 'multi-unit' as PropertyType,
  year_built: '',
  square_footage: '',
  floors: '1' as FloorCount,
  unit_count: '',
};

export default function PropertiesView() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchProperties = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setProperties(data as Property[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setShowForm(true);
  };

  const openEdit = (p: Property) => {
    setEditingId(p.id);
    setForm({
      address: p.address,
      property_type: p.property_type,
      year_built: p.year_built?.toString() || '',
      square_footage: p.square_footage?.toString() || '',
      floors: p.floors,
      unit_count: p.unit_count.toString(),
    });
    setError('');
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !form.address || !form.property_type || !form.floors) return;
    setSaving(true);
    setError('');

    const payload = {
      user_id: user.id,
      address: form.address.trim(),
      property_type: form.property_type,
      year_built: form.year_built ? parseInt(form.year_built) : null,
      square_footage: form.square_footage ? parseInt(form.square_footage) : null,
      floors: form.floors,
      unit_count: form.unit_count ? parseInt(form.unit_count) : 1,
    };

    if (editingId) {
      const { error: err } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', editingId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      // Link to multi_unit_profile if one exists
      const { data: muProfile } = await supabase
        .from('multi_unit_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const { error: err } = await supabase
        .from('properties')
        .insert({
          ...payload,
          multi_unit_profile_id: muProfile?.id || null,
        });
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    setShowForm(false);
    fetchProperties();
  };

  const handleDelete = async (id: string) => {
    const { error: err } = await supabase
      .from('properties')
      .delete()
      .eq('id', id);
    if (!err) fetchProperties();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#0B1F33]">Properties</h2>
          <p className="text-[#6B7C8F]">Manage all properties in your portfolio</p>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap flex items-center gap-2"
        >
          <i className="ri-add-line text-xl"></i>
          Add Property
        </button>
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-[#0B1F33] mb-4">
            {editingId ? 'Edit Property' : 'Add New Property'}
          </h3>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#333645] mb-1">Address *</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
                className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                placeholder="123 Main Street, City, State, ZIP"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-1">Property Type *</label>
                <select
                  value={form.property_type}
                  onChange={(e) => setForm(f => ({ ...f, property_type: e.target.value as PropertyType }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                >
                  <option value="multi-unit">Multi-Unit</option>
                  <option value="single-family">Single Family</option>
                  <option value="townhouse">Townhouse</option>
                  <option value="condo">Condo</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-1">Floors *</label>
                <select
                  value={form.floors}
                  onChange={(e) => setForm(f => ({ ...f, floors: e.target.value as FloorCount }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-1">Year Built</label>
                <input
                  type="number"
                  value={form.year_built}
                  onChange={(e) => setForm(f => ({ ...f, year_built: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="1998"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-1">Sq Ft</label>
                <input
                  type="number"
                  value={form.square_footage}
                  onChange={(e) => setForm(f => ({ ...f, square_footage: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="5000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-1">Units</label>
                <input
                  type="number"
                  value={form.unit_count}
                  onChange={(e) => setForm(f => ({ ...f, unit_count: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="16"
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setShowForm(false)}
              className="px-5 py-2.5 border border-[#E5E7EB] text-[#333645] rounded-lg font-medium hover:bg-[#F9F9FB] transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || !form.address || !form.property_type || !form.floors}
              className="px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-medium hover:bg-[#0B1F33]/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Property'}
            </button>
          </div>
        </div>
      )}

      {/* Properties Grid */}
      {properties.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-building-line text-3xl text-[#D4B483]"></i>
          </div>
          <h3 className="text-lg font-bold text-[#0B1F33] mb-2">No Properties Yet</h3>
          <p className="text-[#6B7C8F] mb-6">Add your first property to start managing your portfolio.</p>
          <button
            onClick={openAdd}
            className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap"
          >
            <i className="ri-add-line mr-2"></i>
            Add Property
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow">
              {/* Colored header bar */}
              <div className="h-3 bg-gradient-to-r from-[#0B1F33] to-[#D4B483]"></div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-[#0B1F33] truncate">{property.address}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-[#F9F9FB] text-[#6B7C8F] text-xs font-medium rounded">
                      {propertyTypeLabels[property.property_type] || property.property_type}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-5">
                  <div>
                    <p className="text-xs text-[#6B7C8F] mb-1">Units</p>
                    <p className="text-lg font-bold text-[#0B1F33]">{property.unit_count}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7C8F] mb-1">Floors</p>
                    <p className="text-lg font-bold text-[#0B1F33]">{property.floors}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#6B7C8F] mb-1">Year Built</p>
                    <p className="text-lg font-bold text-[#0B1F33]">{property.year_built || '—'}</p>
                  </div>
                </div>

                {property.square_footage && (
                  <p className="text-sm text-[#6B7C8F] mb-4">
                    {property.square_footage.toLocaleString()} sq ft
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(property)}
                    className="flex-1 py-2 border border-[#E5E7EB] text-[#333645] rounded-lg font-medium hover:bg-[#F9F9FB] transition-colors whitespace-nowrap text-sm"
                  >
                    <i className="ri-edit-line mr-1"></i>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(property.id)}
                    className="py-2 px-3 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors text-sm"
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
