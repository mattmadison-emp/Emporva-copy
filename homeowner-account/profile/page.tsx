
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useProfile } from '../../../hooks/useProfile';
import { useRoleRoutes } from '../../../hooks/useRoleRoutes';
import { supabase } from '../../../lib/supabase';
import type { Property } from '../../../types/property';
import SystemRegistry from '../../homeowner-dashboard-core/components/SystemRegistry';

const propertyTypeLabels: Record<string, string> = {
  'single-family': 'Single Family Home',
  'townhouse': 'Townhouse',
  'condo': 'Condo',
  'multi-unit': 'Multi-Unit',
  'other': 'Other',
};

const roleLabels: Record<string, string> = {
  'homeowner': 'Homeowner',
  'multi-unit': 'Multi-Unit Owner',
  'contractor': 'Contractor',
};

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

const HomeownerProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { profile, refetch: refetchProfile } = useProfile();
  const routes = useRoleRoutes();
  const role = profile?.role || 'homeowner';
  const isMultiUnit = role === 'multi-unit';

  const [activeTab, setActiveTab] = useState<'personal' | 'property' | 'systems' | 'security'>('personal');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  // All properties for this user
  const [properties, setProperties] = useState<Property[]>([]);
  // Currently selected property (for editing / systems view)
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  const [propertyForm, setPropertyForm] = useState({
    address: '',
    property_type: 'single-family',
    year_built: '',
    square_footage: '',
    floors: '1',
    unit_count: '1',
  });

  const selectedProperty = properties.find(p => p.id === selectedPropertyId) || null;

  // Load profile data into form
  useEffect(() => {
    if (profile) {
      setPersonalInfo({
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  // Load all properties
  useEffect(() => {
    if (!user) return;
    const fetchProperties = async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      if (data && data.length > 0) {
        const props = data as Property[];
        setProperties(props);
        // Auto-select first property
        if (!selectedPropertyId) {
          selectProperty(props[0]);
        }
      }
    };
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const selectProperty = (prop: Property) => {
    setSelectedPropertyId(prop.id);
    setPropertyForm({
      address: prop.address,
      property_type: prop.property_type,
      year_built: prop.year_built?.toString() || '',
      square_footage: prop.square_footage?.toString() || '',
      floors: prop.floors,
      unit_count: prop.unit_count?.toString() || '1',
    });
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const showErrorNotification = (msg: string) => {
    setErrorMessage(msg);
    setShowError(true);
    setTimeout(() => setShowError(false), 4000);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadingPhoto(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = await supabase.storage
        .from('property-photos')
        .createSignedUrl(path, 60 * 60 * 24 * 365);

      if (urlData?.signedUrl) {
        await supabase
          .from('profiles')
          .update({ avatar_url: urlData.signedUrl })
          .eq('id', user.id);
        await refetchProfile();
        const { logActivity } = await import('../../../lib/activityLog');
        await logActivity({
          userId: user.id,
          action: 'photo_uploaded',
          description: 'Updated profile photo',
          homeownerProfileId: selectedProperty?.homeowner_profile_id,
        });
        showNotification('Profile photo updated!');
      }
    } catch {
      showNotification('Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSavePersonal = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        first_name: personalInfo.firstName.trim(),
        last_name: personalInfo.lastName.trim(),
        phone: personalInfo.phone.trim() || null,
      })
      .eq('id', user.id);
    setSaving(false);
    if (error) {
      showNotification('Failed to save. Please try again.');
    } else {
      await refetchProfile();
      const { logActivity } = await import('../../../lib/activityLog');
      await logActivity({
        userId: user.id,
        action: 'profile_updated',
        description: 'Updated personal information',
        homeownerProfileId: selectedProperty?.homeowner_profile_id,
      });
      showNotification('Personal info updated!');
    }
  };

  const handleSaveProperty = async () => {
    if (!user || !selectedPropertyId) return;
    setSaving(true);
    const updates: Record<string, unknown> = {
      address: propertyForm.address.trim(),
      property_type: propertyForm.property_type,
      year_built: propertyForm.year_built ? parseInt(propertyForm.year_built) : null,
      square_footage: propertyForm.square_footage ? parseInt(propertyForm.square_footage) : null,
      floors: propertyForm.floors,
    };
    if (isMultiUnit) {
      updates.unit_count = propertyForm.unit_count ? parseInt(propertyForm.unit_count) : 1;
    }
    const { error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', selectedPropertyId);
    setSaving(false);
    if (error) {
      showNotification('Failed to save. Please try again.');
    } else {
      // Refresh local state
      setProperties(prev => prev.map(p =>
        p.id === selectedPropertyId
          ? { ...p, ...updates, year_built: updates.year_built as number | null, square_footage: updates.square_footage as number | null }
          : p
      ));
      const { logActivity } = await import('../../../lib/activityLog');
      await logActivity({
        userId: user.id,
        action: 'property_updated',
        description: 'Updated property details',
        homeownerProfileId: selectedProperty?.homeowner_profile_id,
        multiUnitProfileId: selectedProperty?.multi_unit_profile_id,
      });
      showNotification('Property details updated!');
    }
  };

  const handleChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      showErrorNotification('Please fill in all password fields.');
      return;
    }
    if (newPassword.length < 6) {
      showErrorNotification('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorNotification('New passwords do not match.');
      return;
    }

    setSaving(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: profile?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      setSaving(false);
      showErrorNotification('Current password is incorrect.');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setSaving(false);

    if (updateError) {
      showErrorNotification(updateError.message || 'Failed to update password.');
    } else {
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      const { logActivity } = await import('../../../lib/activityLog');
      await logActivity({
        userId: user!.id,
        action: 'password_changed',
        description: 'Changed account password',
        homeownerProfileId: selectedProperty?.homeowner_profile_id,
      });
      showNotification('Password changed successfully!');
    }
  };

  const handleSave = () => {
    if (activeTab === 'personal') handleSavePersonal();
    else if (activeTab === 'property') handleSaveProperty();
    else if (activeTab === 'systems') return; // SystemRegistry handles its own saves
    else if (activeTab === 'security') handleChangePassword();
  };

  const tierLabel = profile?.tier === 'premium' ? 'Premium Plan' : 'Core Plan';
  const tierColor = profile?.tier === 'premium' ? 'bg-amber-50 text-amber-700' : 'bg-teal-50 text-teal-700';

  // Build tabs based on role
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: 'ri-user-line' },
    { id: 'property', label: isMultiUnit ? 'Properties' : 'Property Details', icon: isMultiUnit ? 'ri-building-line' : 'ri-home-4-line' },
    { id: 'systems', label: 'Home Systems', icon: 'ri-settings-3-line' },
    { id: 'security', label: 'Security', icon: 'ri-lock-line' },
  ];

  // Property selector for multi-unit (used in both property and systems tabs)
  const PropertySelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-gray-700 mb-2">Select Property</label>
      <select
        value={selectedPropertyId || ''}
        onChange={(e) => {
          const prop = properties.find(p => p.id === e.target.value);
          if (prop) selectProperty(prop);
        }}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
      >
        {properties.map(p => (
          <option key={p.id} value={p.id}>
            {p.address} — {propertyTypeLabels[p.property_type] || p.property_type} ({p.unit_count} unit{p.unit_count !== 1 ? 's' : ''})
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={routes.dashboard} className="text-gray-600 hover:text-gray-900">
                <i className="ri-arrow-left-line text-xl"></i>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-sm text-gray-600">
                  {isMultiUnit
                    ? 'Manage your personal info, properties, and systems'
                    : 'Manage your personal info, property, and home systems'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed top-6 right-6 bg-teal-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <i className="ri-check-circle-fill text-xl"></i>
          <span className="font-medium">{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {showError && (
        <div className="fixed top-6 right-6 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in">
          <i className="ri-error-warning-fill text-xl"></i>
          <span className="font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Profile Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-start gap-6">
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-2xl border-4 border-gray-100">
                    {profile ? `${profile.first_name.charAt(0)}${profile.last_name.charAt(0)}`.toUpperCase() : ''}
                  </div>
                )}
                <label className={`absolute bottom-0 right-0 bg-teal-500 text-white w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-teal-600 transition-colors ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                  {uploadingPhoto ? (
                    <i className="ri-loader-4-line text-sm animate-spin"></i>
                  ) : (
                    <i className="ri-camera-line text-sm"></i>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                </label>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900">
                  {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
                </h2>
                <p className="text-sm text-gray-600 mt-1">{profile?.email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${tierColor}`}>{tierLabel}</span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                    {roleLabels[role] || role}
                  </span>
                  {isMultiUnit && properties.length > 0 && (
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                      {properties.length} propert{properties.length !== 1 ? 'ies' : 'y'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 overflow-x-auto">
            <div className="flex gap-1 px-8 min-w-max">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`py-4 px-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <i className={tab.icon}></i>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {/* Personal Information Tab */}
            {activeTab === 'personal' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      value={personalInfo.firstName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, firstName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      value={personalInfo.lastName}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, lastName: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-400 mt-1">Email cannot be changed here</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Property Details Tab */}
            {activeTab === 'property' && (
              <div className="space-y-6">
                {properties.length > 0 ? (
                  <>
                    {/* Multi-unit: property selector */}
                    {isMultiUnit && properties.length > 1 && <PropertySelector />}

                    {/* Edit form for selected property */}
                    {selectedPropertyId && (
                      <>
                        {isMultiUnit && (
                          <div className="flex items-center gap-2 pb-2 border-b border-gray-200 mb-4">
                            <i className="ri-edit-line text-teal-600"></i>
                            <h3 className="text-sm font-semibold text-gray-700">
                              Editing: {propertyForm.address || 'Selected Property'}
                            </h3>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <input
                            type="text"
                            value={propertyForm.address}
                            onChange={(e) => setPropertyForm(prev => ({ ...prev, address: e.target.value }))}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                            <select
                              value={propertyForm.property_type}
                              onChange={(e) => setPropertyForm(prev => ({ ...prev, property_type: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            >
                              <option value="single-family">Single Family Home</option>
                              <option value="townhouse">Townhouse</option>
                              <option value="condo">Condo</option>
                              <option value="multi-unit">Multi-Unit</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Floors</label>
                            <select
                              value={propertyForm.floors}
                              onChange={(e) => setPropertyForm(prev => ({ ...prev, floors: e.target.value }))}
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            >
                              <option value="1">1</option>
                              <option value="2">2</option>
                              <option value="3">3</option>
                              <option value="4+">4+</option>
                            </select>
                          </div>
                        </div>
                        <div className={`grid grid-cols-1 ${isMultiUnit ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6`}>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Year Built</label>
                            <input
                              type="number"
                              value={propertyForm.year_built}
                              onChange={(e) => setPropertyForm(prev => ({ ...prev, year_built: e.target.value }))}
                              placeholder="e.g., 2005"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Square Footage</label>
                            <input
                              type="number"
                              value={propertyForm.square_footage}
                              onChange={(e) => setPropertyForm(prev => ({ ...prev, square_footage: e.target.value }))}
                              placeholder="e.g., 2400"
                              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                            />
                          </div>
                          {isMultiUnit && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">Unit Count</label>
                              <input
                                type="number"
                                value={propertyForm.unit_count}
                                onChange={(e) => setPropertyForm(prev => ({ ...prev, unit_count: e.target.value }))}
                                placeholder="e.g., 16"
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <i className="ri-home-line text-4xl text-gray-300"></i>
                    <p className="text-gray-500 mt-3">No property information found.</p>
                    <p className="text-sm text-gray-400 mt-1">Complete your enrollment to add property details.</p>
                  </div>
                )}
              </div>
            )}

            {/* Home Systems Tab */}
            {activeTab === 'systems' && (
              <SystemRegistry />
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <p className="text-sm text-gray-600 mt-1">Update your password to keep your account secure.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={showCurrentPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={showNewPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <i className={showConfirmPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                  {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-gray-50 border-t border-gray-200 flex items-center justify-between rounded-b-lg">
            <Link
              to={routes.dashboard}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium whitespace-nowrap"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium text-sm whitespace-nowrap disabled:opacity-50"
            >
              {saving ? 'Saving...' : activeTab === 'security' ? 'Change Password' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeownerProfilePage;
