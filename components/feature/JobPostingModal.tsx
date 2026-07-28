import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CONTRACTOR_TRADES } from '../../constants/trades';
import type { BudgetRange, JobTimeline } from '../../types/job';

interface JobPostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: 'homeowner' | 'multi-unit';
  onSubmit: (jobData: JobPostingData) => void;
}

export interface JobPostingData {
  title: string;
  category: JobCategory;
  description: string;
  location: string;
  budgetRange: BudgetRange | null;
  timeline: JobTimeline | null;
  photos: string[];
}

const budgetLabels: Record<BudgetRange, string> = {
  'under-1000': 'Under $1,000',
  '1000-5000': '$1,000 - $5,000',
  '5000-10000': '$5,000 - $10,000',
  '10000-25000': '$10,000 - $25,000',
  '25000-plus': '$25,000+',
};

const timelineLabels: Record<JobTimeline, string> = {
  'asap': 'ASAP',
  'within-1-week': 'Within 1 week',
  'within-1-month': 'Within 1 month',
  'within-3-months': 'Within 3 months',
  'flexible': 'Flexible',
};

const categories = [...CONTRACTOR_TRADES];

export default function JobPostingModal({ isOpen, onClose, userType, onSubmit }: JobPostingModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [budgetRange, setBudgetRange] = useState('');
  const [timeline, setTimeline] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Pre-populate location from homeowner profile address
  useEffect(() => {
    if (!isOpen || !user) return;
    supabase
      .from('properties')
      .select('address')
      .eq('user_id', user.id)
      .limit(1)
      .single()
      .then(({ data }) => {
        if (data?.address && !location) {
          setLocation(data.address);
        }
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, user]);

  if (!isOpen) return null;

  const resetForm = () => {
    setTitle('');
    setCategory('');
    setDescription('');
    setLocation('');
    setBudgetRange('');
    setTimeline('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    try {
      // Get profile id based on user type
      let homeownerProfileId: string | null = null;
      let multiUnitProfileId: string | null = null;

      if (userType === 'homeowner') {
        const { data } = await supabase
          .from('homeowner_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        homeownerProfileId = data?.id || null;
      } else {
        const { data } = await supabase
          .from('multi_unit_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        multiUnitProfileId = data?.id || null;
      }

      const { error: insertError } = await supabase.from('jobs').insert({
        user_id: user.id,
        homeowner_profile_id: homeownerProfileId,
        multi_unit_profile_id: multiUnitProfileId,
        title,
        category,
        description,
        location,
        budget_range: budgetRange || null,
        timeline: timeline || null,
        photos: [],
        status: 'open',
      });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      // Log activity
      const { logActivity } = await import('../../lib/activityLog');
      await logActivity({
        userId: user.id,
        action: 'job_posted',
        description: `Posted new job: ${title}`,
        homeownerProfileId: homeownerProfileId,
        multiUnitProfileId: multiUnitProfileId,
        metadata: { title, category },
      });

      const jobData: JobPostingData = {
        title,
        category: category as JobCategory,
        description,
        location,
        budgetRange: (budgetRange || null) as BudgetRange | null,
        timeline: (timeline || null) as JobTimeline | null,
        photos: [],
      };

      resetForm();
      onSubmit(jobData);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Post a New Job</h2>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Job Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kitchen Renovation"
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the work you need done..."
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
            ></textarea>
          </div>

          {/* Budget & Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Budget Range
              </label>
              <select
                value={budgetRange}
                onChange={(e) => setBudgetRange(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Select budget</option>
                {(Object.entries(budgetLabels) as [BudgetRange, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Timeline
              </label>
              <select
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
              >
                <option value="">Select timeline</option>
                {(Object.entries(timelineLabels) as [JobTimeline, string][]).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City, State or ZIP"
              className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Photos (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-teal-400 transition-colors">
              <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 flex items-center justify-center bg-gray-100 rounded-full">
                <i className="ri-image-add-line text-xl sm:text-2xl text-gray-400"></i>
              </div>
              <p className="text-xs sm:text-sm text-gray-600 mb-2">
                Add photos to help contractors understand the job
              </p>
              <input
                type="file"
                id="job-photos"
                multiple
                accept="image/*"
                className="hidden"
              />
              <label
                htmlFor="job-photos"
                className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer text-sm font-medium"
              >
                <i className="ri-upload-2-line"></i>
                Upload Photos
              </label>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
            <i className="ri-information-line text-lg sm:text-xl text-blue-600 flex-shrink-0 mt-0.5"></i>
            <div>
              <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">
                How it works
              </p>
              <p className="text-xs sm:text-sm text-blue-700">
                After posting, qualified contractors will submit quotes. You can review their profiles, compare quotes, and choose the best fit for your project.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white -mx-4 sm:-mx-6 px-4 sm:px-6 pb-4 sm:pb-0">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
