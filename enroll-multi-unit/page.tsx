import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { fetchProfile, updateProfile, saveMultiUnitProfile } from '../../services/enrollmentService';

type Step = 'account' | 'portfolio' | 'properties' | 'complete';

interface PropertyDraft {
  address: string;
  property_type: string;
  year_built: string;
  square_footage: string;
  floors: string;
  unit_count: string;
}

export default function EnrollMultiUnit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>('account');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Account Information
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredContact, setPreferredContact] = useState('');
  const [role, setRole] = useState('');

  // Portfolio Information
  const [portfolioName, setPortfolioName] = useState('');
  const [totalProperties, setTotalProperties] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [portfolioType, setPortfolioType] = useState('');

  // Properties
  const [properties, setProperties] = useState<PropertyDraft[]>([]);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [propAddress, setPropAddress] = useState('');
  const [propType, setPropType] = useState('');
  const [propYearBuilt, setPropYearBuilt] = useState('');
  const [propSqft, setPropSqft] = useState('');
  const [propFloors, setPropFloors] = useState('');
  const [propUnitCount, setPropUnitCount] = useState('1');

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

  const steps = [
    { id: 'account', label: 'Your Info', icon: 'ri-user-line' },
    { id: 'portfolio', label: 'Portfolio Details', icon: 'ri-building-line' },
    { id: 'properties', label: 'Add Properties', icon: 'ri-home-4-line' },
    { id: 'complete', label: 'Complete', icon: 'ri-check-line' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const resetPropertyForm = () => {
    setPropAddress('');
    setPropType('');
    setPropYearBuilt('');
    setPropSqft('');
    setPropFloors('');
    setPropUnitCount('1');
    setEditingIndex(null);
    setShowPropertyForm(false);
  };

  const handleAddProperty = () => {
    setShowPropertyForm(true);
    setEditingIndex(null);
    setPropAddress('');
    setPropType('');
    setPropYearBuilt('');
    setPropSqft('');
    setPropFloors('');
    setPropUnitCount('1');
  };

  const handleEditProperty = (index: number) => {
    const p = properties[index];
    setPropAddress(p.address);
    setPropType(p.property_type);
    setPropYearBuilt(p.year_built);
    setPropSqft(p.square_footage);
    setPropFloors(p.floors);
    setPropUnitCount(p.unit_count);
    setEditingIndex(index);
    setShowPropertyForm(true);
  };

  const handleSaveProperty = () => {
    const draft: PropertyDraft = {
      address: propAddress,
      property_type: propType,
      year_built: propYearBuilt,
      square_footage: propSqft,
      floors: propFloors,
      unit_count: propUnitCount,
    };

    if (editingIndex !== null) {
      setProperties(prev => prev.map((p, i) => i === editingIndex ? draft : p));
    } else {
      setProperties(prev => [...prev, draft]);
    }
    resetPropertyForm();
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveAndComplete = async () => {
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
        role: 'multi-unit',
        onboarding_completed: true,
      });
      if (profileResult.error) {
        setError(profileResult.error);
        return;
      }

      // Save multi-unit-specific data
      const multiUnitResult = await saveMultiUnitProfile({
        user_id: user.id,
        multi_unit_role: role as 'owner' | 'property-manager' | 'facilities-manager' | 'asset-manager' | 'other',
        portfolio_name: portfolioName,
        portfolio_type: portfolioType as 'multi-family' | 'small-apartments' | 'mixed-residential' | 'rental-properties' | 'other',
        total_properties: parseInt(totalProperties),
        total_units: parseInt(totalUnits),
      });
      if (multiUnitResult.error) {
        setError(multiUnitResult.error);
        return;
      }

      // Save properties if any were added
      if (properties.length > 0) {
        // Get the multi_unit_profile id
        const { data: muProfile } = await supabase
          .from('multi_unit_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (muProfile) {
          const rows = properties.map(p => ({
            multi_unit_profile_id: muProfile.id,
            user_id: user.id,
            address: p.address,
            property_type: p.property_type,
            year_built: p.year_built ? parseInt(p.year_built) : null,
            square_footage: p.square_footage ? parseInt(p.square_footage) : null,
            floors: p.floors,
            unit_count: parseInt(p.unit_count) || 1,
          }));

          const { error: propError } = await supabase
            .from('properties')
            .insert(rows);

          if (propError) {
            console.error('Failed to save properties:', propError);
            // Non-blocking — continue to dashboard even if properties fail
          }
        }
      }

      navigate('/multi-unit-dashboard-core');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 'account') {
      setCurrentStep('portfolio');
    } else if (currentStep === 'portfolio') {
      setCurrentStep('properties');
    } else if (currentStep === 'properties') {
      setCurrentStep('complete');
    } else if (currentStep === 'complete') {
      handleSaveAndComplete();
    }
  };

  const handleSkip = () => {
    if (currentStep === 'properties') {
      setCurrentStep('complete');
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
            onClick={() => navigate('/multi-unit-dashboard-core')}
            className="text-sm text-[#6B7C8F] hover:text-[#333645]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            I'll do this later
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-start">
            {steps.map((step, index) => (
              <div key={step.id} className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex flex-col items-center" style={{ minWidth: '4rem' }}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    index <= currentStepIndex ? 'bg-[#D4B483] text-white' : 'bg-[#E5E7EB] text-[#6B7C8F]'
                  }`}>
                    <i className={`${step.icon} text-xl`}></i>
                  </div>
                  <span className={`text-xs font-medium text-center whitespace-nowrap ${
                    index <= currentStepIndex ? 'text-[#333645]' : 'text-[#6B7C8F]'
                  }`} style={{ fontFamily: 'Inter, sans-serif' }}>
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-2 mt-5 ${
                    index < currentStepIndex ? 'bg-[#D4B483]' : 'bg-[#E5E7EB]'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700" style={{ fontFamily: 'Inter, sans-serif' }}>
            {error}
          </div>
        )}

        {currentStep === 'account' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Let's start with your info
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Tell us about yourself so contractors and our team can reach you when needed.
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
                    placeholder="Michael"
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
                    placeholder="Johnson"
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
                  placeholder="michael@example.com"
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
                  Your Role *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select your role</option>
                  <option value="owner">Property Owner</option>
                  <option value="property-manager">Property Manager</option>
                  <option value="facilities-manager">Facilities Manager</option>
                  <option value="asset-manager">Asset Manager</option>
                  <option value="other">Other</option>
                </select>
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
              onClick={handleNext}
              disabled={!firstName || !lastName || !email || !phone || !role || !preferredContact}
              className="w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'portfolio' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Tell us about your portfolio
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              This helps us set up your Portfolio Command Center with the right tools for managing multiple properties and units.
            </p>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Portfolio Name *
                </label>
                <input
                  type="text"
                  value={portfolioName}
                  onChange={(e) => setPortfolioName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  placeholder="e.g., Smith Properties, Downtown Portfolio"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Portfolio Type *
                </label>
                <select
                  value={portfolioType}
                  onChange={(e) => setPortfolioType(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select portfolio type</option>
                  <option value="multi-family">Multi-Family Buildings</option>
                  <option value="small-apartments">Small Apartment Buildings</option>
                  <option value="mixed-residential">Mixed Residential Portfolio</option>
                  <option value="rental-properties">Rental Properties</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Total Properties *
                  </label>
                  <input
                    type="number"
                    value={totalProperties}
                    onChange={(e) => setTotalProperties(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                    placeholder="5"
                    required
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Total Units *
                  </label>
                  <input
                    type="number"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                    placeholder="24"
                    required
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!portfolioName || !portfolioType || !totalProperties || !totalUnits}
              className="w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'properties' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-3xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Add Your Properties
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Start adding properties to your portfolio. You can add more properties and define units later from your dashboard.
            </p>

            {/* Added properties list */}
            {properties.length > 0 && (
              <div className="space-y-3 mb-6">
                {properties.map((p, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-[#F9F9FB] rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#D4B483]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className="ri-building-line text-[#D4B483] text-xl"></i>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#0B1F33] text-sm truncate" style={{ fontFamily: 'Inter, sans-serif' }}>{p.address}</p>
                        <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {p.unit_count} unit{parseInt(p.unit_count) !== 1 ? 's' : ''}
                          {p.square_footage ? ` \u2022 ${parseInt(p.square_footage).toLocaleString()} sq ft` : ''}
                          {p.floors ? ` \u2022 ${p.floors} floor${p.floors !== '1' ? 's' : ''}` : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <button
                        onClick={() => handleEditProperty(i)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                      >
                        <i className="ri-edit-line text-[#6B7C8F]"></i>
                      </button>
                      <button
                        onClick={() => handleRemoveProperty(i)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <i className="ri-delete-bin-line text-red-500"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Property form */}
            {showPropertyForm ? (
              <div className="border border-[#E5E7EB] rounded-lg p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {editingIndex !== null ? 'Edit Property' : 'New Property'}
                  </h3>
                  <button
                    onClick={resetPropertyForm}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-[#6B7C8F] text-xl"></i>
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Property Address *
                  </label>
                  <input
                    type="text"
                    value={propAddress}
                    onChange={(e) => setPropAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                    placeholder="123 Main Street, City, State, ZIP"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Property Type *
                    </label>
                    <select
                      value={propType}
                      onChange={(e) => setPropType(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Select type</option>
                      <option value="single-family">Single-Family Home</option>
                      <option value="townhouse">Townhouse</option>
                      <option value="condo">Condominium</option>
                      <option value="multi-unit">Multi-Unit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Number of Units *
                    </label>
                    <input
                      type="number"
                      value={propUnitCount}
                      onChange={(e) => setPropUnitCount(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                      placeholder="1"
                      min="1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Year Built
                    </label>
                    <input
                      type="number"
                      value={propYearBuilt}
                      onChange={(e) => setPropYearBuilt(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                      placeholder="1990"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Square Footage
                    </label>
                    <input
                      type="number"
                      value={propSqft}
                      onChange={(e) => setPropSqft(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                      placeholder="2000"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Floors *
                    </label>
                    <select
                      value={propFloors}
                      onChange={(e) => setPropFloors(e.target.value)}
                      className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4B483] text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="">Select</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                      <option value="4+">4+</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveProperty}
                  disabled={!propAddress || !propType || !propFloors || !propUnitCount}
                  className="w-full bg-[#D4B483] text-white py-2.5 rounded-lg font-semibold hover:bg-[#c4a473] transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap text-sm"
                  style={{ fontFamily: 'Montserrat, sans-serif' }}
                >
                  {editingIndex !== null ? 'Update Property' : 'Add Property'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleAddProperty}
                className="w-full border-2 border-dashed border-[#E5E7EB] rounded-lg p-6 text-center hover:border-[#D4B483] transition-colors cursor-pointer group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 bg-[#D4B483]/10 rounded-full flex items-center justify-center group-hover:bg-[#D4B483]/20 transition-colors">
                    <i className="ri-add-line text-xl text-[#D4B483]"></i>
                  </div>
                  <span className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {properties.length === 0 ? 'Add Your First Property' : 'Add Another Property'}
                  </span>
                </div>
              </button>
            )}

            <div className="mt-6 p-4 bg-[#D4B483]/10 rounded-lg">
              <div className="flex gap-3">
                <i className="ri-lightbulb-line text-[#D4B483] text-xl flex-shrink-0"></i>
                <div>
                  <p className="text-sm font-medium text-[#333645] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Tip: Start with your most active properties
                  </p>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    You can add properties and units anytime from your dashboard. Start with the properties that need the most attention.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSkip}
                className="flex-1 border border-[#E5E7EB] text-[#333645] py-3 rounded-lg font-semibold hover:bg-[#F9F9FB] transition-colors whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Skip for Now
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-5xl text-[#D4B483]"></i>
            </div>

            <h2 className="text-3xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Your Portfolio Command Center is Ready!
            </h2>
            <p className="text-lg text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              We've set up your dashboard with portfolio-level insights, preventive maintenance tools, and centralized job coordination.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-[#F9F9FB] rounded-lg">
                <i className="ri-dashboard-line text-3xl text-[#D4B483] mb-2"></i>
                <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Portfolio Overview
                </h3>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Track all properties and units in one place
                </p>
              </div>
              <div className="p-4 bg-[#F9F9FB] rounded-lg">
                <i className="ri-calendar-check-line text-3xl text-[#D4B483] mb-2"></i>
                <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Preventive Maintenance
                </h3>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Schedule maintenance at scale
                </p>
              </div>
              <div className="p-4 bg-[#F9F9FB] rounded-lg">
                <i className="ri-team-line text-3xl text-[#D4B483] mb-2"></i>
                <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Centralized Coordination
                </h3>
                <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Manage all jobs across your portfolio
                </p>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={saving}
              className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {saving ? 'Saving...' : 'Go to My Dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
