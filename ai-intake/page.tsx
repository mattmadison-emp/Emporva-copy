import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { emporvaApi, IntakeResponse, FollowUpResponse, JobConfirmResponse } from '../../services/emporvaApi';
import MediaUpload from '../../components/base/MediaUpload';

export default function AIIntakePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState<'intake' | 'followup' | 'review' | 'matching'>('intake');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Intake form state
  const [description, setDescription] = useState('');
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [zipCode, setZipCode] = useState('');
  const [prefilledCategory, setPrefilledCategory] = useState<string | null>(null);

  const categoryLabels: Record<string, { label: string; icon: string }> = useMemo(() => ({
    plumbing: { label: 'Plumbing', icon: 'ri-drop-line' },
    electrical: { label: 'Electrical', icon: 'ri-flashlight-line' },
    hvac: { label: 'HVAC', icon: 'ri-temp-cold-line' },
    roofing: { label: 'Roofing', icon: 'ri-home-4-line' },
    appliance: { label: 'Appliances', icon: 'ri-fridge-line' },
    exterior: { label: 'Exterior', icon: 'ri-landscape-line' },
    pool: { label: 'Pool & Spa', icon: 'ri-water-flash-line' },
    general: { label: 'Other / Not Sure', icon: 'ri-tools-line' },
  }), []);

  // Pre-fill from URL params (passed from diagnosis modal)
  useEffect(() => {
    const paramDesc = searchParams.get('description');
    const paramCat = searchParams.get('category');
    if (paramDesc) setDescription(paramDesc);
    if (paramCat && categoryLabels[paramCat]) setPrefilledCategory(paramCat);
  }, [categoryLabels, searchParams]);

  // AI Response state
  const [intakeResponse, setIntakeResponse] = useState<IntakeResponse | null>(null);
  const [followUpResponse, setFollowUpResponse] = useState<FollowUpResponse | null>(null);
  const [jobResponse, setJobResponse] = useState<JobConfirmResponse | null>(null);
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<string, any>>({});

  const handleMediaUpload = async (files: File[]) => {
    setMediaFiles(prev => [...prev, ...files]);

    // Upload to backend
    for (const file of files) {
      try {
        const { url } = await emporvaApi.uploadMedia(file);
        setMediaUrls(prev => [...prev, url]);
      } catch (err) {
        console.error('Media upload failed:', err);
        setError('Failed to upload media. Please try again.');
      }
    }
  };

  const handleMediaRemove = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitIntake = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !zipCode.trim()) {
      setError('Please fill in all required fields');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await emporvaApi.submitIntake({
        homeownerId: 'user-123', // Replace with actual logged-in user ID
        propertyId: 'property-456', // Replace with actual property ID
        description,
        photos: mediaUrls,
        videos: [],
        locationZip: zipCode,
      });

      setIntakeResponse(response);

      if (response.followUpQuestions && response.followUpQuestions.length > 0) {
        setStep('followup');
      } else {
        setStep('review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit intake');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await emporvaApi.submitFollowUp({
        sessionId: intakeResponse!.sessionId,
        homeownerId: 'user-123',
        answers: followUpAnswers,
      });

      setFollowUpResponse(response);

      if (response.additionalQuestions && response.additionalQuestions.length > 0) {
        setIntakeResponse(prev => ({
          ...prev!,
          followUpQuestions: response.additionalQuestions,
        }));
        setFollowUpAnswers({});
      } else {
        setStep('review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit follow-up');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmJob = async (autoMatch: boolean = true) => {
    setLoading(true);
    setError(null);

    try {
      const response = await emporvaApi.confirmJob({
        sessionId: intakeResponse!.sessionId,
        homeownerId: 'user-123',
        propertyId: 'property-456',
        autoMatch,
      });

      setJobResponse(response);
      setStep('matching');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm job');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectContractor = async (_contractorId: string) => {
    try {
      // Navigate to homeowner dashboard with new job
      navigate('/homeowner-dashboard?tab=jobs&newJob=' + jobResponse!.jobId);
    } catch (_err) {
      setError('Failed to navigate to dashboard');
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'EMERGENCY': return 'bg-red-100 text-red-800 border-red-300';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Header */}
      <div className="bg-[#0B1F33] border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Emporva AI Assistant</h1>
              <p className="text-sm text-white/80 mt-1">Digital General Contractor powered by AI</p>
            </div>
            <button
              onClick={() => navigate('/homeowner-dashboard')}
              className="px-4 py-2 text-sm text-white hover:text-[#D4B483] flex items-center gap-2"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className={`flex items-center gap-3 ${step === 'intake' ? 'text-[#0B1F33]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'intake' ? 'bg-[#0B1F33] text-white' : 'bg-gray-200'}`}>
              <i className="ri-file-text-line text-lg"></i>
            </div>
            <span className="text-sm font-medium">Describe Issue</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-3 ${step === 'followup' ? 'text-[#0B1F33]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'followup' ? 'bg-[#0B1F33] text-white' : 'bg-gray-200'}`}>
              <i className="ri-question-line text-lg"></i>
            </div>
            <span className="text-sm font-medium">Follow-up</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-3 ${step === 'review' ? 'text-[#0B1F33]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-[#0B1F33] text-white' : 'bg-gray-200'}`}>
              <i className="ri-check-line text-lg"></i>
            </div>
            <span className="text-sm font-medium">Review</span>
          </div>
          <div className="flex-1 h-0.5 bg-gray-200 mx-4"></div>
          <div className={`flex items-center gap-3 ${step === 'matching' ? 'text-[#0B1F33]' : 'text-gray-400'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${step === 'matching' ? 'bg-[#0B1F33] text-white' : 'bg-gray-200'}`}>
              <i className="ri-team-line text-lg"></i>
            </div>
            <span className="text-sm font-medium">Match Contractor</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3">
            <i className="ri-error-warning-line text-red-600 text-xl"></i>
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Step 1: Intake Form */}
        {step === 'intake' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Describe Your Home Issue or Upcoming Project</h2>

            {/* Pre-filled category badge */}
            {prefilledCategory && categoryLabels[prefilledCategory] && (
              <div className="mb-6 flex items-center gap-3">
                <span className="text-sm text-[#6B7C8F]">Category:</span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B1F33]/5 border-2 border-[#0B1F33] rounded-lg text-sm font-semibold text-[#0B1F33]">
                  <i className={`${categoryLabels[prefilledCategory].icon}`}></i>
                  {categoryLabels[prefilledCategory].label}
                  <button
                    type="button"
                    onClick={() => setPrefilledCategory(null)}
                    className="ml-1 w-5 h-5 flex items-center justify-center rounded-full hover:bg-[#0B1F33]/10 transition-colors cursor-pointer"
                  >
                    <i className="ri-close-line text-sm"></i>
                  </button>
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitIntake} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What's happening? <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  rows={6}
                  placeholder="Example: I noticed water pooling under my kitchen sink. The cabinet floor feels damp and there's a musty smell. It seems to happen after running the dishwasher."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">Be as detailed as possible. Include when it started, what you've noticed, and any patterns.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Photos (Optional)
                </label>
                <MediaUpload
                  onFilesSelected={handleMediaUpload}
                  accept="image"
                  multiple={true}
                  maxFiles={15}
                  existingFiles={mediaFiles}
                  onRemove={handleMediaRemove}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Property ZIP Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  required
                  placeholder="12345"
                  maxLength={5}
                  pattern="\d{5}"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-medium hover:bg-[#0B1F33]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    <i className="ri-sparkling-line"></i>
                    Analyze Issue
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Follow-up Questions */}
        {step === 'followup' && intakeResponse && (
          <div className="space-y-6">
            {/* AI Diagnosis Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#D4B483]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-robot-line text-[#D4B483] text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-2">Initial Diagnosis</h3>
                  <p className="text-sm text-[#333645] leading-relaxed">{intakeResponse.issueSummary}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Urgency Level</p>
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(intakeResponse.urgency)}`}>
                    <i className="ri-alert-line"></i>
                    {intakeResponse.urgency}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-2">Category</p>
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#D4B483]/10 text-[#D4B483] border border-[#D4B483]/30">
                    <i className="ri-tools-line"></i>
                    {intakeResponse.category}
                  </span>
                </div>
              </div>

              {intakeResponse.systemsAffected && intakeResponse.systemsAffected.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500 mb-2">Systems Affected</p>
                  <div className="flex flex-wrap gap-2">
                    {intakeResponse.systemsAffected.map((system, idx) => (
                      <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {system}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {intakeResponse.safetyWarnings && intakeResponse.safetyWarnings.length > 0 && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <i className="ri-error-warning-line text-red-600 text-xl flex-shrink-0"></i>
                    <div>
                      <p className="text-sm font-medium text-red-900 mb-2">Safety Warnings</p>
                      <ul className="space-y-1">
                        {intakeResponse.safetyWarnings.map((warning, idx) => (
                          <li key={idx} className="text-sm text-red-700">• {warning}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Follow-up Questions Form */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">A Few More Questions</h2>
              <form onSubmit={handleSubmitFollowUp} className="space-y-6">
                {intakeResponse.followUpQuestions?.map((question) => (
                  <div key={question.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {question.question}
                      {question.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {question.type === 'text' && (
                      <input
                        type="text"
                        required={question.required}
                        value={followUpAnswers[question.id] || ''}
                        onChange={(e) => setFollowUpAnswers(prev => ({ ...prev, [question.id]: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                      />
                    )}

                    {question.type === 'yesno' && (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => setFollowUpAnswers(prev => ({ ...prev, [question.id]: true }))}
                          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                            followUpAnswers[question.id] === true
                              ? 'border-[#0B1F33] bg-[#0B1F33]/5 text-[#0B1F33]'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          Yes
                        </button>
                        <button
                          type="button"
                          onClick={() => setFollowUpAnswers(prev => ({ ...prev, [question.id]: false }))}
                          className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                            followUpAnswers[question.id] === false
                              ? 'border-[#0B1F33] bg-[#0B1F33]/5 text-[#0B1F33]'
                              : 'border-gray-300 hover:border-gray-400'
                          }`}
                        >
                          No
                        </button>
                      </div>
                    )}

                    {question.type === 'number' && (
                      <input
                        type="number"
                        required={question.required}
                        value={followUpAnswers[question.id] || ''}
                        onChange={(e) => setFollowUpAnswers(prev => ({ ...prev, [question.id]: parseFloat(e.target.value) }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                      />
                    )}

                    {question.type === 'multiple-choice' && question.options && (
                      <div className="space-y-2">
                        {question.options.map((option, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setFollowUpAnswers(prev => ({ ...prev, [question.id]: option }))}
                            className={`w-full px-4 py-3 rounded-lg border-2 text-left transition-all ${
                              followUpAnswers[question.id] === option
                                ? 'border-[#0B1F33] bg-[#0B1F33]/5 text-[#0B1F33]'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-medium hover:bg-[#0B1F33]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  {loading ? (
                    <>
                      <i className="ri-loader-4-line animate-spin"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue
                      <i className="ri-arrow-right-line"></i>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {step === 'review' && intakeResponse && (
          <div className="space-y-6">
            {/* Refined Diagnosis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-[#D4B483]/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-double-line text-[#D4B483] text-2xl"></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-2">Complete Diagnosis</h3>
                  <p className="text-sm text-[#333645] leading-relaxed">
                    {followUpResponse?.refinedDiagnosis || intakeResponse.issueSummary}
                  </p>
                </div>
              </div>

              {/* Cost Estimate */}
              <div className="bg-gradient-to-br from-[#D4B483]/10 to-[#D4B483]/5 rounded-lg p-6 mb-6">
                <p className="text-sm text-[#6B7C8F] mb-2">Estimated Cost Range</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-[#0B1F33]">
                    ${followUpResponse?.updatedCostRange?.min?.toLocaleString() || intakeResponse.estimatedCostRange?.min?.toLocaleString()}
                  </span>
                  <span className="text-xl text-gray-600">—</span>
                  <span className="text-3xl font-bold text-[#0B1F33]">
                    ${followUpResponse?.updatedCostRange?.max?.toLocaleString() || intakeResponse.estimatedCostRange?.max?.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[#6B7C8F] mt-2">Final quote will be provided by matched contractor</p>
              </div>

              {/* Workflow Plan */}
              {(followUpResponse?.updatedWorkflow || intakeResponse.workflowPlan)?.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Recommended Workflow</h4>
                  <div className="space-y-3">
                    {(followUpResponse?.updatedWorkflow || intakeResponse.workflowPlan).map((step, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-[#0B1F33] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                          {idx + 1}
                        </div>
                        <p className="text-sm text-[#333645] pt-0.5">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials List */}
              {followUpResponse?.materialsList && followUpResponse.materialsList.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Materials Needed</h4>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#6B7C8F]">Material</th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-[#6B7C8F]">Quantity</th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-[#6B7C8F]">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {followUpResponse.materialsList.map((material) => (
                          <tr key={material.id}>
                            <td className="px-4 py-3 text-[#0B1F33]">{material.name}</td>
                            <td className="px-4 py-3 text-[#333645]">{material.quantity} {material.unit}</td>
                            <td className="px-4 py-3 text-right text-[#0B1F33] font-medium">${material.estimatedCost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Measurements */}
              {followUpResponse?.measurements && (
                <div className="grid grid-cols-3 gap-4">
                  {followUpResponse.measurements.squareFootage && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-[#6B7C8F] mb-1">Square Footage</p>
                      <p className="text-xl font-bold text-[#0B1F33]">{followUpResponse.measurements.squareFootage} sq ft</p>
                    </div>
                  )}
                  {followUpResponse.measurements.linearFeet && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-[#6B7C8F] mb-1">Linear Feet</p>
                      <p className="text-xl font-bold text-[#0B1F33]">{followUpResponse.measurements.linearFeet} ft</p>
                    </div>
                  )}
                  {followUpResponse.measurements.units && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-xs text-[#6B7C8F] mb-1">Units</p>
                      <p className="text-xl font-bold text-[#0B1F33]">{followUpResponse.measurements.units}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Recommended Trades */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h4 className="text-sm font-bold text-[#0B1F33] mb-3">Recommended Trades</h4>
              <div className="flex flex-wrap gap-2">
                {intakeResponse.recommendedTrades.map((trade, idx) => (
                  <span key={idx} className="px-4 py-2 bg-[#D4B483]/10 text-[#D4B483] rounded-full text-sm font-medium border border-[#D4B483]/30">
                    <i className="ri-tools-line mr-2"></i>
                    {trade}
                  </span>
                ))}
              </div>
            </div>

            {/* Confirm Button */}
            <button
              onClick={() => handleConfirmJob(true)}
              disabled={loading}
              className="w-full bg-[#0B1F33] text-white py-4 rounded-lg font-medium hover:bg-[#0B1F33]/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg whitespace-nowrap"
            >
              {loading ? (
                <>
                  <i className="ri-loader-4-line animate-spin"></i>
                  Creating Job...
                </>
              ) : (
                <>
                  <i className="ri-check-line"></i>
                  Confirm & Match Contractors
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Contractor Matching */}
        {step === 'matching' && jobResponse && (
          <div className="space-y-6">
            {/* Success Message */}
            <div className="bg-gradient-to-br from-[#D4B483]/10 to-[#D4B483]/5 rounded-xl border border-[#D4B483]/30 p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                  <i className="ri-check-line text-white text-2xl"></i>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-2">Job Created Successfully!</h3>
                  <p className="text-sm text-[#333645] mb-3">
                    Job ID: <span className="font-mono font-medium">{jobResponse.jobId}</span>
                  </p>
                  <p className="text-sm text-[#333645]">
                    We've matched you with {jobResponse.matchedContractors?.length || 0} qualified contractors in your area.
                  </p>
                </div>
              </div>
            </div>

            {/* Matched Contractors */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-[#0B1F33] mb-6">Matched Contractors</h3>
              <div className="space-y-4">
                {jobResponse.matchedContractors?.map((contractor) => (
                  <div key={contractor.contractorId} className="border border-gray-200 rounded-lg p-6 hover:border-[#D4B483] transition-colors">
                    <div className="flex items-start gap-4">
                      <img
                        src={contractor.photo}
                        alt={contractor.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="text-lg font-bold text-[#0B1F33]">{contractor.name}</h4>
                            <p className="text-sm text-[#6B7C8F]">{contractor.company}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <i className="ri-star-fill text-yellow-500"></i>
                            <span className="text-sm font-bold text-[#0B1F33]">{contractor.rating}</span>
                            <span className="text-sm text-[#6B7C8F]">({contractor.reviewCount})</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {contractor.tradeSpecialty.map((trade, idx) => (
                            <span key={idx} className="px-2 py-1 bg-[#D4B483]/10 text-[#D4B483] rounded text-xs font-medium">
                              {trade}
                            </span>
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-[#6B7C8F]">
                            <i className="ri-shield-check-line text-[#D4B483]"></i>
                            <span>Reliability: {contractor.reliabilityScore}/100</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#6B7C8F]">
                            <i className="ri-time-line text-[#D4B483]"></i>
                            <span>Response: {contractor.estimatedResponseTime}</span>
                          </div>
                          {contractor.emergencyAvailable && (
                            <div className="flex items-center gap-2 text-sm text-red-600">
                              <i className="ri-alarm-warning-line"></i>
                              <span className="font-medium">Emergency Available</span>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleSelectContractor(contractor.contractorId)}
                            className="flex-1 bg-[#0B1F33] text-white py-2 rounded-lg font-medium hover:bg-[#0B1F33]/90 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                          >
                            <i className="ri-check-line"></i>
                            Select Contractor
                          </button>
                          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                            <i className="ri-phone-line"></i>
                            {contractor.phone}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Multi-Trade Info */}
            {jobResponse.multiTrade && jobResponse.trades && (
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                <div className="flex items-start gap-3 mb-4">
                  <i className="ri-team-line text-purple-600 text-2xl"></i>
                  <div>
                    <h4 className="text-sm font-bold text-purple-900 mb-1">Multi-Trade Project</h4>
                    <p className="text-sm text-purple-700">
                      This job requires {jobResponse.trades.length} specialized trades working in sequence.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {jobResponse.trades.map((trade, idx) => (
                    <div key={trade.tradeId} className="flex items-center gap-3 text-sm">
                      <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {idx + 1}
                      </div>
                      <span className="text-purple-900 font-medium">{trade.tradeName}</span>
                      {trade.dependencies && trade.dependencies.length > 0 && (
                        <span className="text-purple-600 text-xs">
                          (after {trade.dependencies.join(', ')})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
