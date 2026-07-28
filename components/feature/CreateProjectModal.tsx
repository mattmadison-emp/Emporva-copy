import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { CONTRACTOR_TRADES } from '../../constants/trades';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface WorkItemRow {
  trade: string;
  description: string;
  budget: string;
}

const emptyWorkItem = (): WorkItemRow => ({ trade: '', description: '', budget: '' });

export default function CreateProjectModal({ isOpen, onClose, onSuccess }: CreateProjectModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Step 1: Project Basics
  const [projectName, setProjectName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  // Step 2: Budget & Timeline
  const [estimatedBudget, setEstimatedBudget] = useState('');
  const [startDate, setStartDate] = useState('');
  const [targetCompletion, setTargetCompletion] = useState('');

  // Step 3: Work Breakdown
  const [workItems, setWorkItems] = useState<WorkItemRow[]>([emptyWorkItem()]);

  // Auto-populate location from property address
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
    setStep(1);
    setProjectName('');
    setCategory('');
    setDescription('');
    setLocation('');
    setEstimatedBudget('');
    setStartDate('');
    setTargetCompletion('');
    setWorkItems([emptyWorkItem()]);
    setError('');
    setSubmitting(false);
    setShowSuccess(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const validateStep1 = () => {
    if (!projectName.trim()) { setError('Project name is required'); return false; }
    if (!category) { setError('Please select a category'); return false; }
    if (!location.trim()) { setError('Location is required'); return false; }
    setError('');
    return true;
  };

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return;
    setError('');
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const updateWorkItem = (index: number, field: keyof WorkItemRow, value: string) => {
    setWorkItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addWorkItem = () => {
    setWorkItems(prev => [...prev, emptyWorkItem()]);
  };

  const removeWorkItem = (index: number) => {
    setWorkItems(prev => prev.length <= 1 ? [emptyWorkItem()] : prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!user) return;
    setSubmitting(true);
    setError('');

    try {
      // Get homeowner profile id
      const { data: profileData } = await supabase
        .from('homeowner_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Insert the project into jobs
      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .insert({
          user_id: user.id,
          homeowner_profile_id: profileData?.id || null,
          multi_unit_profile_id: null,
          title: projectName,
          category,
          description,
          location,
          budget_range: null,
          timeline: null,
          photos: [],
          status: 'open',
          is_project: true,
          estimated_budget: estimatedBudget ? parseFloat(estimatedBudget) : null,
          actual_spend: 0,
          progress: 0,
          start_date: startDate || null,
          estimated_completion: targetCompletion || null,
        })
        .select('id')
        .single();

      if (jobError) {
        setError(jobError.message);
        setSubmitting(false);
        return;
      }

      // Insert work items (filter out empty rows)
      const validWorkItems = workItems.filter(wi => wi.trade);
      if (validWorkItems.length > 0 && jobData) {
        const { error: wiError } = await supabase
          .from('work_items')
          .insert(
            validWorkItems.map(wi => ({
              job_id: jobData.id,
              title: wi.description || wi.trade,
              description: wi.description || null,
              trade: wi.trade,
              status: 'open',
              estimated_budget: wi.budget || null,
            }))
          );

        if (wiError) {
          console.error('Error inserting work items:', wiError);
          // Project was still created, just log the error
        }
      }

      // Log activity
      try {
        const { logActivity } = await import('../../lib/activityLog');
        await logActivity({
          userId: user.id,
          action: 'job_posted',
          description: `Posted new project: ${projectName}`,
          homeownerProfileId: profileData?.id || undefined,
          metadata: { title: projectName, category, is_project: true },
        });
      } catch {
        // Activity logging is non-critical
      }

      setShowSuccess(true);
      setTimeout(() => {
        resetForm();
        onSuccess();
      }, 1500);
    } catch (err) {
      setError('Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const hasWorkItems = workItems.some(wi => wi.trade);

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
        <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl overflow-hidden">
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-[#14B8A6]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="ri-check-line text-3xl text-[#14B8A6]"></i>
            </div>
            <h3 className="text-xl font-bold text-[#0B1F33] mb-2">Project Created!</h3>
            <p className="text-sm text-[#6B7C8F]">
              Your project is ready. Share it with contractors or manage it from your dashboard.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Create New Project</h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {[
              { num: 1, label: 'Basics' },
              { num: 2, label: 'Budget & Timeline' },
              { num: 3, label: 'Work Items' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    step > s.num ? 'bg-[#14B8A6] text-white'
                    : step === s.num ? 'bg-[#0B1F33] text-white'
                    : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <i className="ri-check-line text-sm"></i> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${
                    step >= s.num ? 'text-[#0B1F33]' : 'text-gray-400'
                  }`}>{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`h-0.5 w-4 sm:w-8 flex-shrink-0 ${step > s.num ? 'bg-[#14B8A6]' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Step 1: Project Basics */}
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g., Kitchen Renovation, Master Bath Remodel"
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Primary Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white cursor-pointer"
                >
                  <option value="">Select a category</option>
                  {CONTRACTOR_TRADES.map((trade) => (
                    <option key={trade} value={trade}>{trade}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the scope of your project — what work needs to be done, any specific requirements or preferences..."
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State or ZIP"
                  className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                />
              </div>
            </>
          )}

          {/* Step 2: Budget & Timeline */}
          {step === 2 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Estimated Budget
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={estimatedBudget}
                    onChange={(e) => setEstimatedBudget(e.target.value)}
                    placeholder="0"
                    className="w-full pl-7 pr-3 sm:pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Your total budget for the entire project</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    min={today}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Target Completion
                  </label>
                  <input
                    type="date"
                    value={targetCompletion}
                    min={startDate || today}
                    onChange={(e) => setTargetCompletion(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg">
                <i className="ri-information-line text-lg text-blue-600 flex-shrink-0 mt-0.5"></i>
                <div>
                  <p className="text-xs sm:text-sm text-blue-900 font-medium mb-1">All fields optional</p>
                  <p className="text-xs sm:text-sm text-blue-700">
                    You can set budget and dates now or update them later once you've discussed with your contractor.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Step 3: Work Breakdown */}
          {step === 3 && (
            <>
              <div>
                <p className="text-sm text-gray-900 font-medium mb-1">Add Trades & Work Items</p>
                <p className="text-xs text-gray-500 mb-4">
                  Break your project down by trade. This helps match you with the right contractors. You can skip this and add them later.
                </p>
              </div>

              <div className="space-y-3">
                {workItems.map((item, index) => (
                  <div key={index} className="bg-[#F9F9FB] rounded-xl p-4 space-y-3 relative">
                    {(workItems.length > 1 || item.trade) && (
                      <button
                        onClick={() => removeWorkItem(index)}
                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <i className="ri-close-line text-lg"></i>
                      </button>
                    )}
                    <div className="pr-8">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Trade</label>
                      <select
                        value={item.trade}
                        onChange={(e) => updateWorkItem(index, 'trade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white cursor-pointer"
                      >
                        <option value="">Select trade</option>
                        {CONTRACTOR_TRADES.map((trade) => (
                          <option key={trade} value={trade}>{trade}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Scope of Work</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateWorkItem(index, 'description', e.target.value)}
                        placeholder="e.g., Move sink, add dishwasher line"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Budget (optional)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs">$</span>
                        <input
                          type="number"
                          min="0"
                          step="100"
                          value={item.budget}
                          onChange={(e) => updateWorkItem(index, 'budget', e.target.value)}
                          placeholder="0"
                          className="w-full pl-6 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={addWorkItem}
                className="w-full py-2.5 border-2 border-dashed border-gray-300 rounded-xl text-sm font-medium text-gray-500 hover:border-[#14B8A6] hover:text-[#14B8A6] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <i className="ri-add-line"></i>
                Add Another Trade
              </button>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 sm:px-6 py-4 flex-shrink-0">
          <div className="flex flex-col-reverse sm:flex-row gap-3">
            {step > 1 ? (
              <button
                onClick={handleBack}
                disabled={submitting}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer disabled:opacity-50"
              >
                <i className="ri-arrow-left-line mr-1"></i>
                Back
              </button>
            ) : (
              <button
                onClick={handleClose}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
              >
                Cancel
              </button>
            )}

            {step < 3 ? (
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#1a3a52] transition-colors text-sm font-medium cursor-pointer flex items-center justify-center gap-1"
              >
                Next
                <i className="ri-arrow-right-line"></i>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-[#14B8A6] text-white rounded-lg hover:bg-[#0ea89a] transition-colors text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="ri-add-circle-line"></i>
                    {hasWorkItems ? 'Create Project' : 'Skip & Create Project'}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
