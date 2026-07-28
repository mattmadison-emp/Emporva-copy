import { useState, useEffect, useCallback } from 'react';
import PropertyEditModal from './PropertyEditModal';
import HomeGallery from './HomeGallery';
import AIDiagnosisChat from '../../../components/feature/AIDiagnosisChat';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Property } from '../../../types/property';

interface ActivityEntry {
  id: string;
  action: string;
  description: string;
  metadata: Record<string, unknown>;
  created_at: string;
}


interface PropertyOverviewProps {
  isCore?: boolean;
}

const propertyTypeLabels: Record<string, string> = {
  'single-family': 'Single Family Home',
  'townhouse': 'Townhouse',
  'condo': 'Condominium',
  'multi-unit': 'Multi-Unit',
  'other': 'Other',
};

const hvacTypeLabels: Record<string, string> = {
  'central-ac': 'Central AC',
  'heat-pump': 'Heat Pump',
  'furnace': 'Furnace',
  'mini-split': 'Mini-Split',
  'other': 'Other',
};

const roofingTypeLabels: Record<string, string> = {
  'asphalt-shingles': 'Asphalt Shingle',
  'metal': 'Metal',
  'tile': 'Tile',
  'slate': 'Slate',
  'flat': 'Flat',
};

const waterHeaterTypeLabels: Record<string, string> = {
  'tank': 'Tank',
  'tankless': 'Tankless',
  'heat-pump': 'Heat Pump',
  'solar': 'Solar',
};

const activityIcon = (action: string): string => {
  switch (action) {
    case 'job_posted': return 'ri-megaphone-line text-[#14B8A6]';
    case 'job_deleted': return 'ri-delete-bin-line text-red-500';
    case 'job_status_changed': return 'ri-refresh-line text-blue-500';
    case 'property_updated': return 'ri-home-gear-line text-[#0B1F33]';
    case 'systems_updated': return 'ri-settings-3-line text-[#0B1F33]';
    case 'profile_updated': return 'ri-user-settings-line text-[#0B1F33]';
    case 'photo_uploaded': return 'ri-camera-line text-[#D4B483]';
    case 'password_changed': return 'ri-lock-line text-[#6B7C8F]';
    default: return 'ri-circle-line text-[#6B7C8F]';
  }
};

const activityTitle = (action: string): string => {
  switch (action) {
    case 'job_posted': return 'Job Posted';
    case 'job_deleted': return 'Job Deleted';
    case 'job_status_changed': return 'Job Status Changed';
    case 'property_updated': return 'Property Updated';
    case 'systems_updated': return 'Home Systems Updated';
    case 'profile_updated': return 'Profile Updated';
    case 'photo_uploaded': return 'Photo Uploaded';
    case 'password_changed': return 'Password Changed';
    default: return 'Activity';
  }
};

const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  return `${months} month${months !== 1 ? 's' : ''} ago`;
};

export default function PropertyOverview({ isCore = false }: PropertyOverviewProps) {
  const { user } = useAuth();
  const [showDiagnosisModal, setShowDiagnosisModal] = useState(false);
  const [showPropertyEdit, setShowPropertyEdit] = useState(false);
  const [property, setProperty] = useState<Property | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [activeJobCount, setActiveJobCount] = useState(0);
  const [systemsCount, setSystemsCount] = useState(0);
  const [maintenanceTaskCount, setMaintenanceTaskCount] = useState(0);
  const [activities, setActivities] = useState<ActivityEntry[]>([]);

  const fetchActivities = useCallback((homeownerProfileId: string) => {
    supabase
      .from('activity_log')
      .select('id, action, description, metadata, created_at')
      .eq('homeowner_profile_id', homeownerProfileId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setActivities(data as ActivityEntry[]);
      });
  }, []);

  const fetchProperty = () => {
    if (!user) return;
    supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data) {
          setProperty(data);
          const firstPhoto = data.photos?.[0];
          if (firstPhoto) {
            supabase.storage
              .from('property-photos')
              .createSignedUrl(firstPhoto, 3600)
              .then(({ data: signed }) => {
                if (signed?.signedUrl) setPhotoUrl(signed.signedUrl);
              });
          } else {
            setPhotoUrl(null);
          }
          if (data.homeowner_profile_id) {
            fetchActivities(data.homeowner_profile_id);
          }
        }
      });
  };

  useEffect(() => {
    if (!user) return;
    fetchProperty();
    supabase
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .in('status', ['open', 'in-progress'])
      .then(({ count }) => {
        setActiveJobCount(count ?? 0);
      });
    supabase
      .from('property_systems')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => {
        setSystemsCount(count ?? 0);
      });
    supabase
      .from('homeowner_tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('completed', false)
      .then(({ count }) => {
        setMaintenanceTaskCount(count ?? 0);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className="space-y-6">
      {/* Property Profile */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={property?.address || 'Property'}
            className="w-full h-40 sm:h-48 object-cover rounded-lg mb-6"
          />
        ) : (
          <div className="w-full h-32 sm:h-40 rounded-lg mb-6 bg-gradient-to-br from-[#F9F9FB] to-[#eef0f4] border border-gray-100 flex flex-col items-center justify-center text-[#6B7C8F]">
            <i className="ri-home-4-line text-3xl mb-1"></i>
            <span className="text-xs">Add a property photo via Edit Property</span>
          </div>
        )}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">
              {property?.address || 'Your Property'}
            </h2>
            <p className="text-[#6B7C8F]">
              {[
                property?.property_type ? propertyTypeLabels[property.property_type] : null,
                property?.year_built ? `Built ${property.year_built}` : null,
                property?.square_footage ? `${property.square_footage.toLocaleString()} sq ft` : null,
              ].filter(Boolean).join(' • ') || 'Complete your profile to see property details'}
            </p>
          </div>
          <button
            onClick={() => setShowPropertyEdit(true)}
            className="px-4 py-2 bg-[#F9F9FB] text-[#0B1F33] rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer"
          >
            <i className="ri-edit-line mr-2"></i>
            Edit Property
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#F9F9FB] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <i className="ri-tools-line text-[#0B1F33] text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-[#6B7C8F]">Systems Tracked</p>
                <p className="text-2xl font-bold text-[#0B1F33]">{systemsCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F9F9FB] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <i className="ri-calendar-check-line text-[#0B1F33] text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-[#6B7C8F]">Maintenance Tasks</p>
                <p className="text-2xl font-bold text-[#0B1F33]">{maintenanceTaskCount}</p>
              </div>
            </div>
          </div>

          <div className="bg-[#F9F9FB] rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <i className="ri-briefcase-line text-[#0B1F33] text-xl"></i>
              </div>
              <div>
                <p className="text-sm text-[#6B7C8F]">Active Jobs</p>
                <p className="text-2xl font-bold text-[#0B1F33]">{activeJobCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Diagnosis */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[#0B1F33]">AI Issue Diagnosis</h3>
          {isCore && (
            <span className="text-xs bg-[#F9F9FB] text-[#6B7C8F] px-3 py-1 rounded-full">
              3 of 5 uses remaining
            </span>
          )}
        </div>
        <p className="text-[#6B7C8F] mb-4">
          Describe an issue or upload photos to get instant AI-powered diagnosis and recommendations.
        </p>
        <button
          onClick={() => setShowDiagnosisModal(true)}
          className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer"
        >
          <i className="ri-sparkling-line mr-2"></i>
          Start AI Diagnosis
        </button>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Recent Activity</h3>
        {activities.length === 0 ? (
          <div className="text-center py-8">
            <i className="ri-history-line text-3xl text-gray-300"></i>
            <p className="text-sm text-[#6B7C8F] mt-2">No activity yet for this property.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, idx) => (
              <div
                key={activity.id}
                className={`flex items-start gap-4 ${idx < activities.length - 1 ? 'pb-4 border-b border-gray-100' : ''}`}
              >
                <div className="w-10 h-10 bg-[#F9F9FB] rounded-lg flex items-center justify-center flex-shrink-0">
                  <i className={`${activityIcon(activity.action)} text-xl`}></i>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#0B1F33]">{activityTitle(activity.action)}</p>
                  <p className="text-sm text-[#6B7C8F]">{activity.description}</p>
                  <p className="text-xs text-[#6B7C8F] mt-1">{timeAgo(activity.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Home Photos gallery — general home photos with before/after comparisons */}
      <HomeGallery userId={user?.id ?? null} propertyId={property?.id ?? null} />

      {/* AI Diagnosis Chat Modal */}
      <AIDiagnosisChat
        isOpen={showDiagnosisModal}
        onClose={() => setShowDiagnosisModal(false)}
      />

      {/* Property Edit Modal */}
      <PropertyEditModal
        isOpen={showPropertyEdit}
        onClose={() => setShowPropertyEdit(false)}
        onSave={fetchProperty}
      />
    </div>
  );
}
