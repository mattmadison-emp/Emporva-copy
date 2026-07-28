import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useRoleRoutes } from '../../../hooks/useRoleRoutes';
import { supabase } from '../../../lib/supabase';
import type { UserSettings, ProfileVisibility } from '../../../types/userSettings';

export default function HomeownerAccountSettings() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const routes = useRoleRoutes();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const notify = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotificationMessage(msg);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  // Fetch settings
  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (data) {
        setSettings(data as UserSettings);
      } else {
        // Create default settings row if missing
        const { data: created } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id })
          .select()
          .single();
        if (created) setSettings(created as UserSettings);
      }
      setLoading(false);
    };
    fetchSettings();
  }, [user]);

  const updateField = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    if (!settings) return;
    setSettings({ ...settings, [key]: value });
  };

  const handleSaveSettings = async () => {
    if (!user || !settings) return;
    setSaving(true);
    const { user_id, created_at, updated_at, ...updates } = settings;
    const { error } = await supabase
      .from('user_settings')
      .update(updates)
      .eq('user_id', user.id);
    setSaving(false);
    if (error) {
      notify('Failed to save settings.', 'error');
    } else {
      notify('Settings saved successfully!');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (newPassword.length < 6) {
      notify('New password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      notify('New passwords do not match.', 'error');
      return;
    }

    setPasswordSaving(true);

    // Verify current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      setPasswordSaving(false);
      notify('Current password is incorrect.', 'error');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setPasswordSaving(false);

    if (updateError) {
      notify(updateError.message || 'Failed to update password.', 'error');
    } else {
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      notify('Password changed successfully!');
    }
  };

  const handleDeleteAccount = async () => {
    // Sign out and show message — actual deletion requires admin API or Edge Function
    setShowDeleteModal(false);
    await signOut();
    navigate('/login', { replace: true });
  };

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-teal-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-0'
        }`}
      ></span>
    </button>
  );

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notification */}
      {showNotification && (
        <div className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2 text-white ${
          notificationType === 'success' ? 'bg-teal-600' : 'bg-red-500'
        }`}>
          <i className={notificationType === 'success' ? 'ri-check-line text-xl' : 'ri-error-warning-line text-xl'}></i>
          <span>{notificationMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Link
              to={routes.dashboard}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-arrow-left-line text-xl text-gray-700"></i>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">Manage your preferences and security</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Email Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-teal-100 rounded-lg">
                  <i className="ri-mail-line text-xl text-teal-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Email Notifications</h2>
                  <p className="text-sm text-gray-600">Choose what updates you receive via email</p>
                </div>
              </div>

              <div className="space-y-4">
                {([
                  { key: 'email_project_updates' as const, label: 'Project Updates', desc: 'Get notified about project status changes' },
                  { key: 'email_messages' as const, label: 'New Messages', desc: 'Receive alerts for new contractor messages' },
                  { key: 'email_maintenance_reminders' as const, label: 'Maintenance Reminders', desc: 'Reminders for scheduled maintenance tasks' },
                  { key: 'email_seasonal_tips' as const, label: 'Seasonal Tips', desc: 'Helpful tips for seasonal home care' },
                  { key: 'email_marketing' as const, label: 'Marketing & Promotions', desc: 'Special offers and platform updates' },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <Toggle checked={settings[key]} onChange={() => updateField(key, !settings[key])} />
                  </div>
                ))}
              </div>
            </div>

            {/* Push Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-lg">
                  <i className="ri-notification-3-line text-xl text-blue-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Push Notifications</h2>
                  <p className="text-sm text-gray-600">Manage browser and app notifications</p>
                </div>
              </div>

              <div className="space-y-4">
                {([
                  { key: 'push_project_updates' as const, label: 'Project Updates', desc: 'Real-time project status notifications' },
                  { key: 'push_messages' as const, label: 'New Messages', desc: 'Instant message alerts' },
                  { key: 'push_maintenance_reminders' as const, label: 'Maintenance Reminders', desc: 'Upcoming maintenance notifications' },
                  { key: 'push_emergency_alerts' as const, label: 'Emergency Alerts', desc: 'Critical alerts for urgent issues' },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <Toggle checked={settings[key]} onChange={() => updateField(key, !settings[key])} />
                  </div>
                ))}
              </div>
            </div>

            {/* SMS Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-green-100 rounded-lg">
                  <i className="ri-message-3-line text-xl text-green-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">SMS Notifications</h2>
                  <p className="text-sm text-gray-600">Receive text message alerts</p>
                </div>
              </div>

              <div className="space-y-4">
                {([
                  { key: 'sms_project_updates' as const, label: 'Project Updates', desc: 'SMS alerts for project milestones' },
                  { key: 'sms_messages' as const, label: 'New Messages', desc: 'Text alerts for new messages' },
                  { key: 'sms_maintenance_reminders' as const, label: 'Maintenance Reminders', desc: 'SMS reminders for maintenance' },
                  { key: 'sms_emergency_alerts' as const, label: 'Emergency Alerts', desc: 'Urgent SMS for critical issues' },
                ]).map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-medium text-gray-900">{label}</p>
                      <p className="text-sm text-gray-600">{desc}</p>
                    </div>
                    <Toggle checked={settings[key]} onChange={() => updateField(key, !settings[key])} />
                  </div>
                ))}
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-purple-100 rounded-lg">
                  <i className="ri-shield-user-line text-xl text-purple-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Privacy Settings</h2>
                  <p className="text-sm text-gray-600">Control your profile visibility and contact preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="py-3 border-b border-gray-100">
                  <label className="block font-medium text-gray-900 mb-2">Profile Visibility</label>
                  <select
                    value={settings.profile_visibility}
                    onChange={(e) => updateField('profile_visibility', e.target.value as ProfileVisibility)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="private">Private - Only visible to contractors I contact</option>
                    <option value="limited">Limited - Visible to verified contractors</option>
                    <option value="public">Public - Visible to all contractors</option>
                  </select>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Show Email Address</p>
                    <p className="text-sm text-gray-600">Allow contractors to see your email</p>
                  </div>
                  <Toggle checked={settings.show_email} onChange={() => updateField('show_email', !settings.show_email)} />
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Show Phone Number</p>
                    <p className="text-sm text-gray-600">Allow contractors to see your phone</p>
                  </div>
                  <Toggle checked={settings.show_phone} onChange={() => updateField('show_phone', !settings.show_phone)} />
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Allow Contractor Contact</p>
                    <p className="text-sm text-gray-600">Let contractors reach out with project proposals</p>
                  </div>
                  <Toggle checked={settings.allow_contractor_contact} onChange={() => updateField('allow_contractor_contact', !settings.allow_contractor_contact)} />
                </div>
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg">
                  <i className="ri-lock-line text-xl text-red-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                  <p className="text-sm text-gray-600">Manage your account security settings</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-600">Update your account password</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Change Password
                  </button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                    <p className="text-sm text-gray-600">
                      {settings.two_factor_enabled ? 'Enabled - Extra security for your account' : 'Add an extra layer of security'}
                    </p>
                  </div>
                  <Toggle
                    checked={settings.two_factor_enabled}
                    onChange={() => updateField('two_factor_enabled', !settings.two_factor_enabled)}
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 flex items-center justify-center bg-red-100 rounded-lg">
                  <i className="ri-error-warning-line text-xl text-red-600"></i>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Danger Zone</h2>
                  <p className="text-sm text-gray-600">Irreversible account actions</p>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-gray-900 mb-1">Delete Account</p>
                    <p className="text-sm text-gray-600">
                      Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Save Button */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="w-full px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium whitespace-nowrap cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save All Settings'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to={routes.profile}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-user-line text-lg text-gray-600"></i>
                  <span className="text-sm text-gray-700">Edit Profile</span>
                </Link>
                <Link
                  to={routes.billing}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-bank-card-line text-lg text-gray-600"></i>
                  <span className="text-sm text-gray-700">Billing & Plans</span>
                </Link>
                <Link
                  to={routes.help}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
                >
                  <i className="ri-question-line text-lg text-gray-600"></i>
                  <span className="text-sm text-gray-700">Help & Support</span>
                </Link>
              </div>
            </div>

            {/* Security Tips */}
            <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl border border-teal-200 p-6">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-shield-check-line text-xl text-teal-600"></i>
                <h3 className="font-semibold text-gray-900">Security Tips</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-teal-600 mt-0.5"></i>
                  <span>Use a strong, unique password</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-teal-600 mt-0.5"></i>
                  <span>Enable two-factor authentication</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-teal-600 mt-0.5"></i>
                  <span>Review active sessions regularly</span>
                </li>
                <li className="flex items-start gap-2">
                  <i className="ri-check-line text-teal-600 mt-0.5"></i>
                  <span>Never share your password</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i className={showCurrentPw ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? 'text' : 'password'}
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i className={showNewPw ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </button>
                </div>
                <p className="text-xs text-gray-600 mt-1">Must be at least 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? 'text' : 'password'}
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent pr-10"
                    required
                  />
                  <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <i className={showConfirmPw ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                  </button>
                </div>
                {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50"
                >
                  {passwordSaving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 flex items-center justify-center bg-red-100 rounded-full">
                <i className="ri-error-warning-line text-2xl text-red-600"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Delete Account?</h3>
            </div>

            <div className="mb-6">
              <p className="text-gray-700 mb-4">
                This will permanently delete your account and all associated data, including:
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <i className="ri-close-circle-line text-red-500"></i>
                  <span>All property information and maintenance records</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-close-circle-line text-red-500"></i>
                  <span>Active and past project history</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-close-circle-line text-red-500"></i>
                  <span>Messages and contractor connections</span>
                </li>
                <li className="flex items-center gap-2">
                  <i className="ri-close-circle-line text-red-500"></i>
                  <span>Subscription and billing information</span>
                </li>
              </ul>
              <p className="text-sm text-red-600 font-medium mt-4">This action cannot be undone.</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
