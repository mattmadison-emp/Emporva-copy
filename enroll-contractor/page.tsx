
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProfile, updateProfile, saveContractorProfile } from '../../services/enrollmentService';
import type { ContractorProfile } from '../../types/contractor';
import { CONTRACTOR_TRADES } from '../../constants/trades';

type Step = 'account' | 'business' | 'service-area' | 'credentials' | 'plan' | 'complete';

export default function EnrollContractor() {
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

  // Business Information
  const [businessName, setBusinessName] = useState('');
  const [companyType, setCompanyType] = useState('');
  const [primaryTrade, setPrimaryTrade] = useState('');
  const [secondaryTrades, setSecondaryTrades] = useState<string[]>([]);
  const [yearsInBusiness, setYearsInBusiness] = useState('');

  // Service Area
  const [serviceZips, setServiceZips] = useState('');
  const [travelRadius, setTravelRadius] = useState('');
  const [emergencyAvailable, setEmergencyAvailable] = useState(false);

  // Credentials
  const [licensed, setLicensed] = useState('');
  const [insured, setInsured] = useState('');
  const [certifications, setCertifications] = useState('');

  // Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<'core' | 'premium'>('core');
  const [starterPack, setStarterPack] = useState(10);

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
    { id: 'business', label: 'Business', icon: 'ri-building-line' },
    { id: 'service-area', label: 'Service Area', icon: 'ri-map-pin-line' },
    { id: 'credentials', label: 'Credentials', icon: 'ri-shield-check-line' },
    { id: 'plan', label: 'Your Plan', icon: 'ri-copper-coin-line' },
    { id: 'complete', label: 'Complete', icon: 'ri-check-line' }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleSaveAndComplete = async () => {
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      // Update shared profile (including tier based on selected plan)
      const profileResult = await updateProfile(user.id, {
        first_name: firstName,
        last_name: lastName,
        phone,
        preferred_contact: preferredContact as 'phone' | 'text' | 'email' | 'any',
        role: 'contractor',
        tier: selectedPlan as 'core' | 'premium',
        onboarding_completed: true,
      });
      if (profileResult.error) {
        setError(profileResult.error);
        return;
      }

      // Save contractor-specific data
      const contractorResult = await saveContractorProfile({
        user_id: user.id,
        business_name: businessName,
        company_type: companyType as 'solo' | 'small-team' | 'multi-crew',
        primary_trade: primaryTrade as any,
        secondary_trades: secondaryTrades as any[],
        years_in_business: parseInt(yearsInBusiness),
        service_zips: serviceZips,
        travel_radius: travelRadius as '10' | '25' | '50' | '100' | 'unlimited',
        emergency_available: emergencyAvailable,
        licensing_status: (licensed || null) as ContractorProfile['licensing_status'],
        insurance_status: (insured || null) as ContractorProfile['insurance_status'],
        certifications: certifications || null,
        selected_plan: selectedPlan,
        starter_pack: selectedPlan === 'core' ? (starterPack as 5 | 10 | 25 | 50) : null,
        credit_balance: selectedPlan === 'core' ? (starterPack ? parseInt(String(starterPack)) : 0) : 0,
      });
      if (contractorResult.error) {
        setError(contractorResult.error);
        return;
      }

      navigate(selectedPlan === 'premium' ? '/contractor-dashboard-premium' : '/contractor-dashboard-core');
    } finally {
      setSaving(false);
    }
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'account':
        setCurrentStep('business');
        break;
      case 'business':
        setCurrentStep('service-area');
        break;
      case 'service-area':
        setCurrentStep('credentials');
        break;
      case 'credentials':
        setCurrentStep('plan');
        break;
      case 'plan':
        setCurrentStep('complete');
        break;
      case 'complete':
        handleSaveAndComplete();
        break;
      default:
        break;
    }
  };

  const handleSkip = () => {
    if (currentStep === 'credentials') {
      setCurrentStep('plan');
    }
  };

  const tradeOptions = CONTRACTOR_TRADES;

  const creditPacks = [
    { credits: 5, price: 75, perLead: 15, label: '5 Credits', savings: '' },
    { credits: 10, price: 150, perLead: 15, label: '10 Credits', savings: '', popular: true },
    { credits: 25, price: 356, perLead: 14.25, label: '25 Credits', savings: 'Save 5%' },
    { credits: 50, price: 675, perLead: 13.5, label: '50 Credits', savings: 'Save 10%' },
  ];

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
            <span
              className="text-2xl font-bold text-primary-navy"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Emporva
            </span>
          </Link>
          <button
            onClick={() => navigate('/contractor-dashboard-core')}
            className="text-sm text-[#6B7C8F] hover:text-[#333645] cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            I&apos;ll do this later
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
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                      index <= currentStepIndex
                        ? 'bg-[#0B1F33] text-white'
                        : 'bg-[#E5E7EB] text-[#6B7C8F]'
                    }`}
                  >
                    <i className={`${step.icon} text-xl`}></i>
                  </div>
                  <span
                    className={`text-xs font-medium text-center whitespace-nowrap hidden sm:block ${
                      index <= currentStepIndex ? 'text-[#333645]' : 'text-[#6B7C8F]'
                    }`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-2 mt-5 ${
                      index < currentStepIndex ? 'bg-[#0B1F33]' : 'bg-[#E5E7EB]'
                    }`}
                  ></div>
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
            <h2
              className="text-3xl font-bold text-[#0B1F33] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Let&apos;s start with your info
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Tell us about yourself so homeowners and our team can reach you.
            </p>

            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    className="block text-sm font-medium text-[#333645] mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                    placeholder="John"
                    required
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
                <div>
                  <label
                    className="block text-sm font-medium text-[#333645] mb-2"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  >
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                    placeholder="Smith"
                    required
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm bg-[#F9F9FB]"
                  placeholder="john@example.com"
                  required
                  readOnly
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                  placeholder="(555) 123-4567"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Preferred Contact Method *
                </label>
                <select
                  value={preferredContact}
                  onChange={e => setPreferredContact(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
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

              <div className="p-4 bg-[#0B1F33]/5 rounded-lg">
                <div className="flex gap-3">
                  <i className="ri-shield-check-line text-[#0B1F33] text-xl flex-shrink-0"></i>
                  <div>
                    <p
                      className="text-sm text-[#6B7C8F]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Your contact information is only shared with homeowners when you
                      accept a job. We never sell your data.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!firstName || !lastName || !email || !phone || !preferredContact}
              className="w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'business' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2
              className="text-3xl font-bold text-[#0B1F33] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Business Information
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              This helps us match you with the right jobs in the marketplace and build your
              professional profile.
            </p>

            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Business Name *
                </label>
                <input
                  type="text"
                  value={businessName}
                  onChange={e => setBusinessName(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                  placeholder="Your Business Name"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Company Type *
                </label>
                <select
                  value={companyType}
                  onChange={e => setCompanyType(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select company type</option>
                  <option value="solo">Solo Operator</option>
                  <option value="small-team">Small Team (2-5)</option>
                  <option value="multi-crew">Multi-Crew (6+)</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Primary Trade *
                </label>
                <select
                  value={primaryTrade}
                  onChange={e => setPrimaryTrade(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select primary trade</option>
                  {tradeOptions.map(trade => (
                    <option key={trade} value={trade}>
                      {trade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Secondary Trades (Optional)
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-[#E5E7EB] rounded-lg p-3">
                  {tradeOptions
                    .filter(t => t !== primaryTrade)
                    .map(trade => (
                      <label key={trade} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={secondaryTrades.includes(trade)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSecondaryTrades([...secondaryTrades, trade]);
                            } else {
                              setSecondaryTrades(secondaryTrades.filter(t => t !== trade));
                            }
                          }}
                          className="w-4 h-4 rounded border-[#E5E7EB]"
                        />
                        <span
                          className="text-sm text-[#333645]"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          {trade}
                        </span>
                      </label>
                    ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Years in Business *
                </label>
                <input
                  type="number"
                  value={yearsInBusiness}
                  onChange={e => setYearsInBusiness(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                  placeholder="5"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!businessName || !companyType || !primaryTrade || !yearsInBusiness}
              className="w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'service-area' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2
              className="text-3xl font-bold text-[#0B1F33] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Service Area
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Define where you work so we show you relevant jobs in the marketplace. You&apos;ll only
              see leads that match your area.
            </p>

            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Service ZIP Codes or Cities *
                </label>
                <textarea
                  value={serviceZips}
                  onChange={e => setServiceZips(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                  placeholder={`Enter ZIP codes or city names, separated by commas
Example: 90210, 90211, Beverly Hills, Los Angeles`}
                  rows={4}
                  required
                  maxLength={500}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Travel Radius *
                </label>
                <select
                  value={travelRadius}
                  onChange={e => setTravelRadius(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
                  required
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select travel radius</option>
                  <option value="10">Within 10 miles</option>
                  <option value="25">Within 25 miles</option>
                  <option value="50">Within 50 miles</option>
                  <option value="100">Within 100 miles</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              <div className="border border-[#E5E7EB] rounded-lg p-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emergencyAvailable}
                    onChange={e => setEmergencyAvailable(e.target.checked)}
                    className="w-5 h-5 rounded border-[#E5E7EB]"
                  />
                  <div>
                    <span
                      className="text-sm font-medium text-[#333645] block"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Available for Emergency or After-Hours Work
                    </span>
                    <span
                      className="text-xs text-[#6B7C8F]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Emergency jobs often have higher budgets and less competition
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <button
              onClick={handleNext}
              disabled={!serviceZips || !travelRadius}
              className="w-full mt-8 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 'credentials' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2
              className="text-3xl font-bold text-[#0B1F33] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Credentials &amp; Experience
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Credential information builds trust with homeowners and can improve your win rate on
              leads. You can skip this and add details later.
            </p>

            <div className="space-y-5">
              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Licensing Status
                </label>
                <select
                  value={licensed}
                  onChange={e => setLicensed(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select licensing status</option>
                  <option value="licensed">Licensed</option>
                  <option value="not-required">Not Required in My Area</option>
                  <option value="in-progress">In Progress</option>
                  <option value="not-licensed">Not Licensed</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Insurance Status
                </label>
                <select
                  value={insured}
                  onChange={e => setInsured(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm cursor-pointer"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <option value="">Select insurance status</option>
                  <option value="general-liability">General Liability</option>
                  <option value="full-coverage">
                    General Liability + Workers Comp
                  </option>
                  <option value="not-insured">Not Insured</option>
                </select>
              </div>

              <div>
                <label
                  className="block text-sm font-medium text-[#333645] mb-2"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Certifications or Specialties
                </label>
                <textarea
                  value={certifications}
                  onChange={e => setCertifications(e.target.value)}
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B1F33] text-sm"
                  placeholder={`List any certifications, specialties, or training
Example: EPA Lead-Safe Certified, OSHA 10, Energy Star Partner`}
                  rows={4}
                  maxLength={500}
                  style={{ fontFamily: 'Inter, sans-serif' }}
                />
              </div>

              <div className="p-4 bg-[#0B1F33]/5 rounded-lg">
                <div className="flex gap-3">
                  <i className="ri-information-line text-[#0B1F33] text-xl flex-shrink-0"></i>
                  <div>
                    <p
                      className="text-sm font-medium text-[#333645] mb-1"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      Why credentials matter
                    </p>
                    <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Contractors with verified credentials have a{' '}
                      <strong className="text-[#0B1F33]">40% higher win rate</strong> on leads.
                      Homeowners trust verified professionals, which means your $15 per lead goes
                      further.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleSkip}
                className="flex-1 border border-[#E5E7EB] text-[#333645] py-3 rounded-lg font-semibold hover:bg-[#F9F9FB] transition-colors whitespace-nowrap cursor-pointer"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Skip for Now
              </button>
              <button
                onClick={handleNext}
                className="flex-1 bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap cursor-pointer"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {currentStep === 'plan' && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2
              className="text-3xl font-bold text-[#0B1F33] mb-2"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Choose How You Want to Grow
            </h2>
            <p className="text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              Start flexible with pay-per-lead, or go unlimited with Premium. You can switch anytime.
            </p>

            {/* Plan Selection */}
            <div className="space-y-4 mb-8">
              {/* Core Plan */}
              <button
                onClick={() => setSelectedPlan('core')}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedPlan === 'core'
                    ? 'border-[#0B1F33] bg-[#0B1F33]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'core' ? 'border-[#0B1F33] bg-[#0B1F33]' : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'core' && <i className="ri-check-line text-white text-sm"></i>}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Contractor Core
                      </h3>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Pay-per-lead &bull; No monthly fees
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0B1F33]">$15</p>
                    <p className="text-xs text-[#6B7C8F]">per lead</p>
                  </div>
                </div>
                <div className="ml-9 space-y-1.5">
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    Browse marketplace jobs for free
                  </p>
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    Pay 1 credit ($15) to unlock and quote a lead
                  </p>
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    Active job management and shared workspaces
                  </p>
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    Credits never expire
                  </p>
                </div>
              </button>

              {/* Premium Plan */}
              <button
                onClick={() => setSelectedPlan('premium')}
                className={`w-full text-left p-5 rounded-xl border-2 transition-all cursor-pointer relative ${
                  selectedPlan === 'premium'
                    ? 'border-[#D4B483] bg-[#D4B483]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="absolute -top-3 right-4 bg-[#D4B483] text-[#0B1F33] px-3 py-0.5 rounded-full text-xs font-bold whitespace-nowrap">
                  Best Value at 7+ leads/mo
                </div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        selectedPlan === 'premium' ? 'border-[#D4B483] bg-[#D4B483]' : 'border-gray-300'
                      }`}
                    >
                      {selectedPlan === 'premium' && (
                        <i className="ri-check-line text-[#0B1F33] text-sm"></i>
                      )}
                    </div>
                    <div>
                      <h3
                        className="text-lg font-bold text-[#0B1F33] flex items-center gap-2"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        Contractor Premium
                        <i className="ri-vip-crown-line text-[#D4B483]"></i>
                      </h3>
                      <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Unlimited leads &bull; Full business toolkit
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-[#0B1F33]">$99</p>
                    <p className="text-xs text-[#6B7C8F]">per month</p>
                  </div>
                </div>
                <div className="ml-9 space-y-1.5">
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    <strong className="text-[#333645]">Unlimited</strong> marketplace access —
                    no per-lead cost
                  </p>
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    CRM, pipeline management, and automated follow-ups
                  </p>
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    Multi-job calendar and scheduling tools
                  </p>
                  <p className="text-sm text-[#6B7C8F] flex items-center gap-2">
                    <i className="ri-check-line text-[#D4B483] text-base"></i>
                    Business analytics, marketing, and growth insights
                  </p>
                </div>
              </button>
            </div>

            {/* Starter Credit Pack (only for Core) */}
            {selectedPlan === 'core' && (
              <div className="mb-8">
                <h3
                  className="text-lg font-bold text-[#0B1F33] mb-2"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Choose Your Starter Credit Pack
                </h3>
                <p className="text-sm text-[#6B7C8F] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Buy credits now to start quoting jobs immediately. You can always buy more later.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {creditPacks.map(pack => (
                    <button
                      key={pack.credits}
                      onClick={() => setStarterPack(pack.credits)}
                      className={`p-4 rounded-xl border-2 transition-all cursor-pointer text-left ${
                        starterPack === pack.credits
                          ? 'border-[#D4B483] bg-[#D4B483]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#0B1F33] text-sm">{pack.label}</span>
                        {pack.popular && (
                          <span className="px-2 py-0.5 bg-[#D4B483] text-[#0B1F33] text-[10px] font-bold rounded-full whitespace-nowrap">
                            Popular
                          </span>
                        )}
                      </div>
                      <p className="text-lg font-bold text-[#0B1F33]">${pack.price}</p>
                      {pack.savings ? (
                        <p className="text-xs text-green-600 font-semibold">{pack.savings}</p>
                      ) : (
                        <p className="text-xs text-[#6B7C8F]">${pack.perLead}/lead</p>
                      )}
                    </button>
                  ))}
                </div>

                <div className="mt-4 bg-[#F9F9FB] rounded-lg p-3 flex items-start gap-2">
                  <i className="ri-information-line text-[#6B7C8F] mt-0.5 flex-shrink-0"></i>
                  <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Credits never expire. Each credit unlocks one lead in the marketplace, giving you
                    full access to scope details, homeowner contact, and the ability to submit your
                    quote.
                  </p>
                </div>
              </div>
            )}

            {/* The Math */}
            <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-5 mb-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <i className="ri-calculator-line text-[#D4B483]"></i>
                <p className="text-sm font-bold text-white">When does Premium make sense?</p>
              </div>
              <p className="text-sm text-white/80">
                At $15/lead, pursuing <strong className="text-white">7 leads per month</strong>{' '}
                costs $105. Premium gives you{' '}
                <strong className="text-[#D4B483]">unlimited leads for $99/mo</strong> — plus CRM,
                automation, analytics, and invoicing tools.
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {selectedPlan === 'core'
                ? `Continue with Core — ${starterPack} Credits for $${
                    creditPacks.find(p => p.credits === starterPack)?.price
                  }`
                : 'Continue with Premium — $99/mo'}
            </button>

            <p className="text-center text-xs text-[#6B7C8F] mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
              You can change your plan anytime from your dashboard.{' '}
              <Link to="/contractor-plans" className="text-[#D4B483] font-semibold hover:underline">
                Full plan comparison
              </Link>
            </p>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-[#0B1F33]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="ri-check-line text-5xl text-[#0B1F33]"></i>
            </div>

            <h2
              className="text-3xl font-bold text-[#0B1F33] mb-3"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              {selectedPlan === 'core' ? "You're Ready to Start Quoting!" : 'Welcome to Contractor Premium!'}
            </h2>
            <p className="text-lg text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
              {selectedPlan === 'core'
                ? `Your ${starterPack} lead credits are loaded. Browse the marketplace, find jobs that match your trade, and start submitting quotes.`
                : 'You have unlimited marketplace access plus your full business toolkit. Start browsing jobs and building your pipeline.'}
            </p>

            {selectedPlan === 'core' ? (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="w-12 h-12 bg-[#D4B483]/15 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-copper-coin-line text-[#D4B483] text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {starterPack} Credits Loaded
                  </h3>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Each credit unlocks one lead to quote
                  </p>
                </div>
                <div className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-store-3-line text-teal-600 text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Browse Free
                  </h3>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    See all job details before spending a credit
                  </p>
                </div>
                <div className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="w-12 h-12 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-briefcase-line text-[#0B1F33] text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Manage Jobs
                  </h3>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Track active jobs in your dashboard
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="w-12 h-12 bg-[#D4B483]/15 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-infinity-line text-[#D4B483] text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Unlimited Leads
                  </h3>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Quote on any job — no credit cost
                  </p>
                </div>
                <div className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-contacts-line text-teal-600 text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Full CRM
                  </h3>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Track customers and automate follow-ups
                  </p>
                </div>
                <div className="p-4 bg-[#F9F9FB] rounded-lg">
                  <div className="w-12 h-12 bg-[#0B1F33]/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <i className="ri-line-chart-line text-[#0B1F33] text-2xl"></i>
                  </div>
                  <h3 className="font-semibold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Analytics &amp; Growth
                  </h3>
                  <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Revenue insights and business intelligence
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={saving}
              className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-colors whitespace-nowrap mb-4 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              {saving ? 'Saving...' : 'Go to My Dashboard'}
            </button>

            {selectedPlan === 'core' && (
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Pursuing 7+ leads/month?{' '}
                <Link to="/contractor-plans" className="text-[#D4B483] font-semibold hover:underline">
                  Premium saves you money at $99/mo unlimited
                </Link>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
