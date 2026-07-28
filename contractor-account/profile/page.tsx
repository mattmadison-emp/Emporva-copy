import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { CONTRACTOR_TRADES } from '../../../constants/trades';
import TeamMembers from './TeamMembers';

type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  coverPhotoUrl: string;
  tier: string;
  // contractor_profiles fields
  businessName: string;
  companyType: string;
  primaryTrade: string;
  secondaryTrades: string[];
  yearsInBusiness: number;
  serviceZips: string;
  travelRadius: string;
  emergencyAvailable: boolean;
  licensingStatus: string;
  insuranceStatus: string;
  certifications: string;
  selectedPlan: string;
};

const COMPANY_TYPE_LABELS: Record<string, string> = {
  'solo': 'Solo Operator',
  'small-team': 'Small Team (2–5)',
  'multi-crew': 'Multi-Crew (6+)',
};

const TRAVEL_RADIUS_LABELS: Record<string, string> = {
  '10': '10 miles',
  '25': '25 miles',
  '50': '50 miles',
  '100': '100 miles',
  'unlimited': 'Unlimited',
};

const LICENSING_LABELS: Record<string, string> = {
  'licensed': 'Licensed',
  'not-required': 'Not Required',
  'in-progress': 'In Progress',
  'not-licensed': 'Not Licensed',
};

const INSURANCE_LABELS: Record<string, string> = {
  'general-liability': 'General Liability',
  'full-coverage': 'Full Coverage',
  'not-insured': 'Not Insured',
};

export default function ContractorAccountProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    avatarUrl: '',
    coverPhotoUrl: '',
    tier: 'core',
    businessName: '',
    companyType: '',
    primaryTrade: '',
    secondaryTrades: [],
    yearsInBusiness: 0,
    serviceZips: '',
    travelRadius: '25',
    emergencyAvailable: false,
    licensingStatus: '',
    insuranceStatus: '',
    certifications: '',
    selectedPlan: 'core',
  });

  const coverPhotoInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Credentials from database
  type Credential = {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileSize: string;
    status: string;
    credentialNumber: string;
    expiryDate: string;
    verifiedAt: string;
  };

  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [contractorProfileId, setContractorProfileId] = useState<string | null>(null);

  // New credential upload form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCredTitle, setNewCredTitle] = useState('');
  const [newCredNumber, setNewCredNumber] = useState('');
  const [newCredExpiry, setNewCredExpiry] = useState('');
  const [newCredFile, setNewCredFile] = useState<File | null>(null);
  const [uploadingCred, setUploadingCred] = useState(false);

  const newCredFileRef = useRef<HTMLInputElement | null>(null);

  // Fetch profile data from Supabase
  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      setLoading(true);

      const [profileResult, contractorResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('first_name, last_name, email, phone, avatar_url, tier')
          .eq('id', user!.id)
          .single(),
        supabase
          .from('contractor_profiles')
          .select('*')
          .eq('user_id', user!.id)
          .single(),
      ]);

      if (profileResult.data) {
        const p = profileResult.data;
        const c = contractorResult.data;

        setProfileData({
          firstName: p.first_name || '',
          lastName: p.last_name || '',
          email: p.email || '',
          phone: p.phone || '',
          avatarUrl: p.avatar_url || '',
          coverPhotoUrl: c?.cover_photo_url || '',
          tier: p.tier || 'core',
          businessName: c?.business_name || '',
          companyType: c?.company_type || '',
          primaryTrade: c?.primary_trade || '',
          secondaryTrades: c?.secondary_trades || [],
          yearsInBusiness: c?.years_in_business || 0,
          serviceZips: c?.service_zips || '',
          travelRadius: c?.travel_radius || '25',
          emergencyAvailable: c?.emergency_available || false,
          licensingStatus: c?.licensing_status || '',
          insuranceStatus: c?.insurance_status || '',
          certifications: c?.certifications || '',
          selectedPlan: c?.selected_plan || 'core',
        });

        if (c) {
          setContractorProfileId(c.id);

          // Fetch credentials from the database
          const { data: creds } = await supabase
            .from('contractor_credentials')
            .select('*')
            .eq('contractor_profile_id', c.id)
            .order('created_at', { ascending: false });

          if (creds) {
            setCredentials(creds.map((cr: any) => ({
              id: cr.id,
              title: cr.title,
              fileName: cr.file_name,
              fileUrl: cr.file_url,
              fileSize: cr.file_size || '',
              status: cr.status,
              credentialNumber: cr.credential_number || '',
              expiryDate: cr.expiry_date || '',
              verifiedAt: cr.verified_at || '',
            })));
          }
        }
      }

      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleCoverPhotoUpload = async (file: File) => {
    if (!user) return;
    setUploadingCover(true);

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const filePath = `${user.id}/cover.${ext}`;

    // Upload to storage (upsert to replace existing)
    const { error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      setUploadingCover(false);
      return;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(filePath);

    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

    // Save URL to contractor_profiles
    await supabase
      .from('contractor_profiles')
      .update({ cover_photo_url: publicUrl })
      .eq('user_id', user.id);

    setProfileData(prev => ({ ...prev, coverPhotoUrl: publicUrl }));
    setUploadingCover(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddCredential = async () => {
    if (!user || !contractorProfileId || !newCredFile || !newCredTitle.trim()) return;
    setUploadingCred(true);

    const filePath = `${user.id}/${Date.now()}-${newCredFile.name}`;
    const fileSize = newCredFile.size < 1024 * 1024
      ? `${(newCredFile.size / 1024).toFixed(0)} KB`
      : `${(newCredFile.size / (1024 * 1024)).toFixed(1)} MB`;

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('contractor-credentials')
      .upload(filePath, newCredFile, { upsert: true });

    if (uploadError) {
      console.error('Upload failed:', uploadError);
      setUploadingCred(false);
      return;
    }

    // Get signed URL (private bucket)
    const { data: urlData } = await supabase.storage
      .from('contractor-credentials')
      .createSignedUrl(filePath, 60 * 60 * 24 * 365 * 10); // 10 year signed URL

    const fileUrl = urlData?.signedUrl || filePath;

    // Insert into credentials table
    const { data: inserted, error: insertError } = await supabase
      .from('contractor_credentials')
      .insert({
        contractor_profile_id: contractorProfileId,
        user_id: user.id,
        title: newCredTitle.trim(),
        file_url: fileUrl,
        file_name: newCredFile.name,
        file_size: fileSize,
        credential_number: newCredNumber.trim() || null,
        expiry_date: newCredExpiry || null,
      })
      .select()
      .single();

    if (!insertError && inserted) {
      setCredentials(prev => [{
        id: inserted.id,
        title: inserted.title,
        fileName: inserted.file_name,
        fileUrl: inserted.file_url,
        fileSize: inserted.file_size || '',
        status: inserted.status,
        credentialNumber: inserted.credential_number || '',
        expiryDate: inserted.expiry_date || '',
        verifiedAt: inserted.verified_at || '',
      }, ...prev]);
    }

    // Reset form
    setNewCredTitle('');
    setNewCredNumber('');
    setNewCredExpiry('');
    setNewCredFile(null);
    setShowAddForm(false);
    setUploadingCred(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleRemoveCredential = async (credentialId: string) => {
    if (!user) return;

    // Delete from database (cascade will not remove storage file, so do it manually)
    const cred = credentials.find(c => c.id === credentialId);

    await supabase
      .from('contractor_credentials')
      .delete()
      .eq('id', credentialId);

    // Try to remove from storage if we can extract the path
    if (cred?.fileUrl) {
      // Extract storage path from signed URL or direct path
      const pathMatch = cred.fileUrl.match(/contractor-credentials\/([^?]+)/);
      if (pathMatch) {
        await supabase.storage
          .from('contractor-credentials')
          .remove([pathMatch[1]]);
      }
    }

    setCredentials(prev => prev.filter(c => c.id !== credentialId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-medium flex items-center gap-1">
            <i className="ri-checkbox-circle-fill"></i>
            Active
          </span>
        );
      case 'verified':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
            <i className="ri-shield-check-fill"></i>
            Verified
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium flex items-center gap-1">
            <i className="ri-time-fill"></i>
            Pending Review
          </span>
        );
      case 'expired':
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium flex items-center gap-1">
            <i className="ri-error-warning-fill"></i>
            Expired
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium flex items-center gap-1">
            <i className="ri-upload-2-line"></i>
            Not Uploaded
          </span>
        );
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        phone: profileData.phone,
      })
      .eq('id', user.id);

    // Update contractor_profiles table
    const { error: contractorError } = await supabase
      .from('contractor_profiles')
      .update({
        business_name: profileData.businessName,
        company_type: profileData.companyType,
        primary_trade: profileData.primaryTrade,
        secondary_trades: profileData.secondaryTrades,
        years_in_business: profileData.yearsInBusiness,
        service_zips: profileData.serviceZips,
        travel_radius: profileData.travelRadius,
        emergency_available: profileData.emergencyAvailable,
        certifications: profileData.certifications,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (!profileError && !contractorError) {
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#D4B483] mb-4"></i>
          <p className="text-[#6B7C8F]">Loading profile...</p>
        </div>
      </div>
    );
  }

  const dashboardPath = profileData.tier === 'premium' ? '/contractor-dashboard-premium' : '/contractor-dashboard-core';

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img
              src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
              alt="Emporva Logo"
              className="w-10 h-10"
            />
            <span className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emporva
            </span>
          </Link>
          <Link
            to={dashboardPath}
            className="flex items-center gap-2 text-[#0B1F33] hover:text-[#D4B483] transition-colors cursor-pointer"
          >
            <i className="ri-arrow-left-line"></i>
            <span className="font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Back to Dashboard</span>
          </Link>
        </div>
      </nav>

      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          {showSuccess && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
              <i className="ri-checkbox-circle-fill text-green-500 text-xl"></i>
              <span className="text-green-700 font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Profile updated successfully!</span>
            </div>
          )}

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
            {/* Cover Photo */}
            <div className="relative h-48 bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F]">
              {profileData.coverPhotoUrl && (
                <img
                  src={profileData.coverPhotoUrl}
                  alt="Cover"
                  className="w-full h-full object-cover object-center"
                />
              )}
              {uploadingCover && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <div className="flex items-center gap-2 text-white">
                    <i className="ri-loader-4-line animate-spin text-xl"></i>
                    <span className="text-sm font-medium">Uploading...</span>
                  </div>
                </div>
              )}
              {!uploadingCover && (
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.accept = 'image/jpeg,image/png,image/webp';
                    input.onchange = (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) handleCoverPhotoUpload(file);
                    };
                    input.click();
                  }}
                  className="absolute bottom-4 right-4 z-20 px-4 py-2 bg-white/90 rounded-lg text-sm font-medium text-[#0B1F33] hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-camera-line mr-2"></i>
                  {profileData.coverPhotoUrl ? 'Change Cover' : 'Upload Cover'}
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row gap-6 -mt-16 relative z-10">
                <div className="relative">
                  {profileData.avatarUrl ? (
                    <img
                      src={profileData.avatarUrl}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                      className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-xl border-4 border-white shadow-lg bg-[#0B1F33] flex items-center justify-center">
                      <span className="text-4xl font-bold text-white">
                        {profileData.firstName.charAt(0)}{profileData.lastName.charAt(0)}
                      </span>
                    </div>
                  )}
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 w-8 h-8 bg-[#D4B483] rounded-full flex items-center justify-center text-white hover:bg-[#c5a574] transition-colors cursor-pointer">
                      <i className="ri-camera-line text-sm"></i>
                    </button>
                  )}
                </div>
                <div className="flex-1 pt-4 md:pt-8">
                  <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {profileData.firstName} {profileData.lastName}
                  </h1>
                  <div className="flex items-center justify-between mt-1 flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>{profileData.businessName}</p>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        profileData.tier === 'premium'
                          ? 'bg-gradient-to-r from-[#D4B483] to-[#c4a473] text-[#0B1F33]'
                          : 'bg-teal-100 text-teal-700'
                      }`}>
                        <i className={`${profileData.tier === 'premium' ? 'ri-vip-crown-line' : 'ri-shield-check-line'} mr-1`}></i>
                        {profileData.tier === 'premium' ? 'Premium Plan' : 'Core Plan'}
                      </span>
                      <span className="px-3 py-1 bg-[#0B1F33] text-white rounded-full text-xs font-medium">
                        {profileData.primaryTrade}
                      </span>
                    </div>
                    <button
                      onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                      disabled={saving}
                      className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap cursor-pointer transition-colors disabled:opacity-50 ${
                        isEditing
                          ? 'bg-[#D4B483] text-white hover:bg-[#c5a574]'
                          : 'bg-[#0B1F33] text-white hover:bg-[#0a1a2a]'
                      }`}
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      {saving ? (
                        <>
                          <i className="ri-loader-4-line animate-spin mr-2"></i>
                          Saving...
                        </>
                      ) : isEditing ? (
                        <>
                          <i className="ri-check-line mr-2"></i>
                          Save Changes
                        </>
                      ) : (
                        <>
                          <i className="ri-edit-line mr-2"></i>
                          Edit Profile
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {[
              { id: 'personal', label: 'Personal Info', icon: 'ri-user-line' },
              { id: 'business', label: 'Business Info', icon: 'ri-building-line' },
              { id: 'service', label: 'Service Area', icon: 'ri-map-pin-line' },
              { id: 'credentials', label: 'Credentials', icon: 'ri-file-shield-2-line' },
              { id: 'team', label: 'Team', icon: 'ri-team-line' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-white text-[#333645] hover:bg-gray-50'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      disabled
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none transition-all text-[#6B7C8F]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <p className="text-xs text-[#6B7C8F] mt-1">Email is managed through your account settings</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'business' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Business Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Business Name
                    </label>
                    <input
                      type="text"
                      value={profileData.businessName}
                      onChange={(e) => setProfileData({ ...profileData, businessName: e.target.value })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Company Type
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.companyType}
                        onChange={(e) => setProfileData({ ...profileData, companyType: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all cursor-pointer"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="solo">Solo Operator</option>
                        <option value="small-team">Small Team (2–5)</option>
                        <option value="multi-crew">Multi-Crew (6+)</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={COMPANY_TYPE_LABELS[profileData.companyType] || profileData.companyType}
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Years in Business
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={profileData.yearsInBusiness}
                      onChange={(e) => setProfileData({ ...profileData, yearsInBusiness: parseInt(e.target.value) || 0 })}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Trades & Specialties
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Primary Trade
                      </label>
                      {isEditing ? (
                        <select
                          value={profileData.primaryTrade}
                          onChange={(e) => {
                            const newPrimary = e.target.value;
                            setProfileData({
                              ...profileData,
                              primaryTrade: newPrimary,
                              secondaryTrades: profileData.secondaryTrades.filter(t => t !== newPrimary),
                            });
                          }}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all cursor-pointer"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                          <option value="">Select primary trade</option>
                          {CONTRACTOR_TRADES.map(trade => (
                            <option key={trade} value={trade}>{trade}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          value={profileData.primaryTrade}
                          disabled
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Secondary Trades (Optional)
                      </label>
                      {isEditing ? (
                        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                          {CONTRACTOR_TRADES
                            .filter(t => t !== profileData.primaryTrade)
                            .map(trade => (
                              <label key={trade} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={profileData.secondaryTrades.includes(trade)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setProfileData({ ...profileData, secondaryTrades: [...profileData.secondaryTrades, trade] });
                                    } else {
                                      setProfileData({ ...profileData, secondaryTrades: profileData.secondaryTrades.filter(t => t !== trade) });
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-[#E5E7EB]"
                                />
                                <span className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>{trade}</span>
                              </label>
                            ))}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={profileData.secondaryTrades.length > 0 ? profileData.secondaryTrades.join(', ') : 'None'}
                          disabled
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Trade badges display */}
                  {!isEditing && (profileData.primaryTrade || profileData.secondaryTrades.length > 0) && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {profileData.primaryTrade && (
                        <span className="px-3 py-1.5 bg-[#0B1F33] text-white text-xs font-semibold rounded-full">
                          {profileData.primaryTrade} (Primary)
                        </span>
                      )}
                      {profileData.secondaryTrades.map((trade) => (
                        <span key={trade} className="px-3 py-1.5 bg-[#6B7C8F] text-white text-xs font-semibold rounded-full">
                          {trade}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Certifications
                  </h3>
                  <textarea
                    value={profileData.certifications}
                    onChange={(e) => setProfileData({ ...profileData, certifications: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    placeholder={isEditing ? 'List any certifications, licenses, or special qualifications' : 'No certifications listed'}
                    className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all resize-none`}
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
            )}

            {activeTab === 'service' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Service Area
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Service ZIP Codes
                    </label>
                    <input
                      type="text"
                      value={profileData.serviceZips}
                      onChange={(e) => setProfileData({ ...profileData, serviceZips: e.target.value })}
                      disabled={!isEditing}
                      placeholder={isEditing ? 'e.g. 94102, 94103, 94104' : ''}
                      className={`w-full px-4 py-3 rounded-lg border ${isEditing ? 'border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20' : 'border-gray-200 bg-gray-50'} outline-none transition-all`}
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Travel Radius
                    </label>
                    {isEditing ? (
                      <select
                        value={profileData.travelRadius}
                        onChange={(e) => setProfileData({ ...profileData, travelRadius: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all cursor-pointer"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      >
                        <option value="10">10 miles</option>
                        <option value="25">25 miles</option>
                        <option value="50">50 miles</option>
                        <option value="100">100 miles</option>
                        <option value="unlimited">Unlimited</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={TRAVEL_RADIUS_LABELS[profileData.travelRadius] || profileData.travelRadius}
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Emergency Services
                    </label>
                    {isEditing ? (
                      <label className="flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors">
                        <input
                          type="checkbox"
                          checked={profileData.emergencyAvailable}
                          onChange={(e) => setProfileData({ ...profileData, emergencyAvailable: e.target.checked })}
                          className="w-5 h-5 text-[#D4B483] rounded cursor-pointer"
                        />
                        <span className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Available for emergency calls
                        </span>
                      </label>
                    ) : (
                      <input
                        type="text"
                        value={profileData.emergencyAvailable ? 'Available for emergencies' : 'Not available for emergencies'}
                        disabled
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 outline-none"
                        style={{ fontFamily: 'Inter, sans-serif' }}
                      />
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Status Overview
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 bg-[#F9F9FB] rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-shield-check-line text-teal-600"></i>
                        <span className="text-sm font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Licensing</span>
                      </div>
                      <p className="text-sm font-semibold text-[#0B1F33]">
                        {LICENSING_LABELS[profileData.licensingStatus] || 'Not set'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#F9F9FB] rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-shield-star-line text-teal-600"></i>
                        <span className="text-sm font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Insurance</span>
                      </div>
                      <p className="text-sm font-semibold text-[#0B1F33]">
                        {INSURANCE_LABELS[profileData.insuranceStatus] || 'Not set'}
                      </p>
                    </div>
                    <div className="p-4 bg-[#F9F9FB] rounded-xl border border-gray-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-copper-coin-line text-[#D4B483]"></i>
                        <span className="text-sm font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Plan</span>
                      </div>
                      <p className="text-sm font-semibold text-[#0B1F33] capitalize">
                        {profileData.selectedPlan}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'team' && (
              <TeamMembers />
            )}
            {activeTab === 'credentials' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      Credentials & Documents
                    </h2>
                    <p className="text-sm text-[#6B7C8F] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Upload and manage your professional credentials
                    </p>
                  </div>
                </div>

                {/* Info Banner */}
                <div className="p-4 bg-[#0B1F33]/5 rounded-xl flex items-start gap-3">
                  <i className="ri-information-line text-[#0B1F33] text-xl mt-0.5"></i>
                  <div>
                    <p className="text-sm text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Verified credentials build trust with homeowners
                    </p>
                    <p className="text-xs text-[#6B7C8F] mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Documents are reviewed within 1-2 business days. Accepted formats: PDF, JPG, PNG (max 10MB)
                    </p>
                  </div>
                </div>

                {/* Credentials List */}
                <div className="space-y-4">
                  {credentials.length === 0 && !showAddForm && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                        <i className="ri-file-shield-2-line text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-[#6B7C8F] text-sm mb-1">No credentials uploaded yet</p>
                      <p className="text-[#6B7C8F] text-xs">Add your licenses, insurance, and certifications to build trust with homeowners</p>
                    </div>
                  )}

                  {credentials.map((credential) => (
                    <div
                      key={credential.id}
                      className={`p-5 rounded-xl border-2 transition-all ${
                        credential.status === 'active'
                          ? 'border-teal-200 bg-teal-50/30'
                          : credential.status === 'verified'
                          ? 'border-green-200 bg-green-50/30'
                          : credential.status === 'pending'
                          ? 'border-amber-200 bg-amber-50/30'
                          : credential.status === 'rejected'
                          ? 'border-red-200 bg-red-50/30'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            credential.status === 'active'
                              ? 'bg-teal-100'
                              : credential.status === 'verified'
                              ? 'bg-green-100'
                              : credential.status === 'pending'
                              ? 'bg-amber-100'
                              : credential.status === 'rejected'
                              ? 'bg-red-100'
                              : 'bg-gray-100'
                          }`}>
                            <i className={`ri-file-shield-2-fill text-2xl ${
                              credential.status === 'active'
                                ? 'text-teal-600'
                                : credential.status === 'verified'
                                ? 'text-green-600'
                                : credential.status === 'pending'
                                ? 'text-amber-600'
                                : credential.status === 'rejected'
                                ? 'text-red-600'
                                : 'text-gray-400'
                            }`}></i>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {credential.title}
                              </h3>
                              {getStatusBadge(credential.status)}
                            </div>

                            <div className="space-y-2 mt-3">
                              {credential.credentialNumber && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Number:</span>
                                  <span className="text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>{credential.credentialNumber}</span>
                                </div>
                              )}
                              {credential.expiryDate && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Expires:</span>
                                  <span className="text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {new Date(credential.expiryDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              )}
                              {credential.verifiedAt && (
                                <div className="flex items-center gap-2 text-sm">
                                  <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Verified:</span>
                                  <span className="text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {new Date(credential.verifiedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-3 mt-3 p-3 bg-white rounded-lg border border-gray-200">
                                <i className="ri-file-pdf-2-line text-red-500 text-xl"></i>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[#333645] truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                                    {credential.fileName}
                                  </p>
                                  {credential.fileSize && (
                                    <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                                      {credential.fileSize}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <a
                                    href={credential.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 flex items-center justify-center text-[#6B7C8F] hover:text-[#0B1F33] hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <i className="ri-download-line"></i>
                                  </a>
                                  <button
                                    onClick={() => handleRemoveCredential(credential.id)}
                                    className="w-8 h-8 flex items-center justify-center text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <i className="ri-delete-bin-line"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Credential Form */}
                {showAddForm && (
                  <div className="p-6 border-2 border-[#D4B483] rounded-xl bg-[#D4B483]/5">
                    <h3 className="font-semibold text-[#0B1F33] mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Add New Credential
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Credential Title *
                        </label>
                        <input
                          type="text"
                          value={newCredTitle}
                          onChange={(e) => setNewCredTitle(e.target.value)}
                          placeholder="e.g. Contractor License, General Liability Insurance, EPA Certification"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Credential / License Number
                        </label>
                        <input
                          type="text"
                          value={newCredNumber}
                          onChange={(e) => setNewCredNumber(e.target.value)}
                          placeholder="e.g. CA-123456789"
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Expiry Date
                        </label>
                        <input
                          type="date"
                          value={newCredExpiry}
                          onChange={(e) => setNewCredExpiry(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-[#D4B483] focus:ring-2 focus:ring-[#D4B483]/20 outline-none transition-all cursor-pointer"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Document *
                        </label>
                        {newCredFile ? (
                          <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
                            <i className="ri-file-pdf-2-line text-red-500 text-xl"></i>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#333645] truncate">{newCredFile.name}</p>
                              <p className="text-xs text-[#6B7C8F]">
                                {newCredFile.size < 1024 * 1024
                                  ? `${(newCredFile.size / 1024).toFixed(0)} KB`
                                  : `${(newCredFile.size / (1024 * 1024)).toFixed(1)} MB`}
                              </p>
                            </div>
                            <button
                              onClick={() => setNewCredFile(null)}
                              className="w-8 h-8 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <i className="ri-close-line"></i>
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => newCredFileRef.current?.click()}
                            className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-[#6B7C8F] hover:border-[#D4B483] hover:text-[#D4B483] transition-colors cursor-pointer flex items-center justify-center gap-2"
                          >
                            <i className="ri-upload-2-line text-lg"></i>
                            <span className="text-sm font-medium">Choose file (PDF, JPG, PNG — max 10MB)</span>
                          </button>
                        )}
                        <input
                          ref={newCredFileRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setNewCredFile(file);
                          }}
                          className="hidden"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-6">
                      <button
                        onClick={() => {
                          setShowAddForm(false);
                          setNewCredTitle('');
                          setNewCredNumber('');
                          setNewCredExpiry('');
                          setNewCredFile(null);
                        }}
                        className="px-5 py-2 text-[#6B7C8F] hover:text-[#333645] font-semibold text-sm transition-colors cursor-pointer"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCredential}
                        disabled={!newCredTitle.trim() || !newCredFile || uploadingCred}
                        className="flex items-center gap-2 px-5 py-2 bg-[#D4B483] text-white rounded-lg font-semibold text-sm hover:bg-[#c5a574] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ fontFamily: 'Montserrat, sans-serif' }}
                      >
                        {uploadingCred ? (
                          <>
                            <i className="ri-loader-4-line animate-spin"></i>
                            Uploading...
                          </>
                        ) : (
                          <>
                            <i className="ri-upload-2-line"></i>
                            Upload Credential
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Add More Credentials Button */}
                {!showAddForm && (
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowAddForm(true)}
                      className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-[#6B7C8F] hover:border-[#D4B483] hover:text-[#D4B483] transition-colors cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i className="ri-add-line text-xl"></i>
                      <span className="font-medium" style={{ fontFamily: 'Montserrat, sans-serif' }}>Add Credential</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
