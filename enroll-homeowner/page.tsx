
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchProfile, updateProfile, saveHomeownerProfile } from '../../services/enrollmentService';
import type {
  PropertyType,
  FloorCount,
  HvacType,
  WaterHeaterType,
  RoofingType,
  OwnershipLength,
} from '../../types/property';
import QuickAddWizard, { type QuickSetupResult } from '../homeowner-dashboard-core/components/QuickAddWizard';

export default function EnrollHomeowner() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // Account Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState('');

  // Property Address — the one property field the Quick Setup wizard doesn't ask.
  const [address, setAddress] = useState('');

  // Pre-populate from profile
  useEffect(() => {
    if (!user) return;
    fetchProfile(user.id).then((profile) => {
      if (!profile) return;
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setEmail(profile.email || '');
      if (profile.phone) setPhone(profile.phone);
      if (profile.preferred_contact) setPreferredContact(profile.preferred_contact);
    });
  }, [user]);

  const accountComplete = !!(firstName && lastName && email && phone && preferredContact && address);

  // Saves the homeowner's account + property + systems and lands them on the dashboard.
  // Called both when the wizard completes (with a result) and when it's skipped (result = null).
  const persistAndGo = async (result: QuickSetupResult | null) => {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      // Update shared profile
      const profileResult = await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        preferred_contact: preferredContact as 'phone' | 'text' | 'email' | 'any',
        role: 'homeowner',
        onboarding_completed: true,
      });
      if (profileResult.error) {
        setError(profileResult.error);
        setShowWizard(false);
        return;
      }

      // Create homeowner profile link record
      const homeownerResult = await saveHomeownerProfile(user.id);
      if (homeownerResult.error) {
        setError(homeownerResult.error);
        setShowWizard(false);
        return;
      }

      // Save property to the shared properties table. property_type and floors are
      // NOT NULL, so fall back to sensible defaults when the wizard is skipped/unanswered.
      const p = result?.property ?? {};
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .insert({
          user_id: user.id,
          homeowner_profile_id: homeownerResult.id,
          address,
          property_type: (p.property_type as PropertyType) || 'single-family',
          year_built: p.year_built ?? null,
          square_footage: p.square_footage ?? null,
          floors: (p.floors as FloorCount) || '1',
          unit_count: 1,
          ownership_length: (p.ownership_length as OwnershipLength) ?? null,
          hvac_type: (p.hvac_type as HvacType) ?? null,
          hvac_age: p.hvac_age ?? null,
          water_heater_type: (p.water_heater_type as WaterHeaterType) ?? null,
          water_heater_age: p.water_heater_age ?? null,
          roofing_type: (p.roofing_type as RoofingType) ?? null,
          roofing_age: p.roofing_age ?? null,
          photos: [],
        })
        .select('id')
        .single();

      if (propError) {
        console.error('[enroll-homeowner] property insert failed:', propError);
        setError("We couldn't save your property details just now. Please try again.");
        setShowWizard(false);
        return;
      }

      // Insert every system/feature/appliance the wizard collected.
      if (result && result.systems.length > 0) {
        const rows = result.systems.map((s) => ({
          property_id: propData.id,
          user_id: user.id,
          name: s.name,
          category: s.category,
          type: s.type || null,
          install_year: s.installYear || null,
          last_service_date: null,
          condition: s.condition,
          notes: s.notes || null,
          estimated_lifespan_years: s.estimatedLifespan || null,
        }));
        const { error: sysErr } = await supabase.from('property_systems').insert(rows);
        if (sysErr) console.error('[enroll-homeowner] failed to add systems:', sysErr);
      }

      navigate('/homeowner-dashboard-core');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
              alt="Emporva Logo"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-primary-navy" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>
          <button
            onClick={() => navigate('/homeowner-dashboard-core')}
            className="text-sm text-[#6B7C8F] hover:text-[#333645]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            I'll do this later
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Let's start with your info
          </h2>
          <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Tell us about yourself and your property. Next, a quick 5-step setup builds your Property
            Command Center.
          </p>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="Jane"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="Doe"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm bg-[#F9F9FB]"
                placeholder="jane@example.com"
                required
                readOnly
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                placeholder="(555) 123-4567"
                required
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Preferred Contact Method *
              </label>
              <select
                value={preferredContact}
                onChange={(e) => setPreferredContact(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                required
                style={{ fontFamily: 'Inter, sans-serif' }}
              >
                <option value="">Select preferred contact method</option>
                <option value="phone">Phone Call</option>
                <option value="text">Text Message</option>
                <option value="email">Email</option>
                <option value="any">Any Method</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Property Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                placeholder="123 Main Street, City, State, ZIP"
                required
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>

            <div className="p-4 bg-[#D4B483]/10 rounded-lg">
              <div className="flex gap-3">
                <i className="ri-shield-check-line text-[#D4B483] text-xl flex-shrink-0"></i>
                <div>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Your contact information is only shared with contractors you choose to work with. We never sell your data.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowWizard(true)}
            disabled={!accountComplete}
            className="w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Continue to Quick Setup
          </button>
        </div>
      </div>

      {/* Quick Setup Questionnaire — the same 5-step wizard used in Systems Profile.
          Completing or skipping it finalizes enrollment and lands the user on the dashboard. */}
      {showWizard && (
        <QuickAddWizard
          onComplete={(result) => persistAndGo(result)}
          onSkip={() => persistAndGo(null)}
        />
      )}

      {/* Saving overlay (covers the wizard's own close) */}
      {saving && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl px-6 py-5 flex items-center gap-3 shadow-2xl">
            <i className="ri-loader-4-line animate-spin text-2xl text-[#0B1F33]"></i>
            <span className="text-sm font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Setting up your Command Center…
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
