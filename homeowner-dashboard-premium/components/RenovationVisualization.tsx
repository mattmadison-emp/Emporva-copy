import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  estimated_budget: number | null;
  progress: number;
}

interface Scenario {
  id: string;
  job_id: string;
  name: string;
  style_description: string;
  generated_image_url: string;
  source_photo_url: string;
  estimated_cost_low: number | null;
  estimated_cost_high: number | null;
  estimated_timeline: string;
  roi_estimate: string;
  status: string;
  created_at: string;
}

interface BeforePhoto {
  id: string;
  job_id: string;
  url: string;
  caption: string | null;
}

const STYLE_OPTIONS = [
  { name: 'Modern Minimalist', icon: 'ri-layout-line', desc: 'Clean lines, neutral palette, open spaces' },
  { name: 'Classic Traditional', icon: 'ri-home-2-line', desc: 'Timeless elegance, rich woods, detailed trim' },
  { name: 'Industrial Chic', icon: 'ri-building-4-line', desc: 'Exposed elements, metal accents, urban feel' },
  { name: 'Farmhouse', icon: 'ri-plant-line', desc: 'Warm textures, shiplap, rustic charm' },
  { name: 'Contemporary Luxury', icon: 'ri-vip-diamond-line', desc: 'High-end finishes, statement pieces, bold design' },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export default function RenovationVisualization() {
  const { user } = useAuth();

  // Data
  const [projects, setProjects] = useState<Project[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [beforePhotos, setBeforePhotos] = useState<BeforePhoto[]>([]);
  const [property, setProperty] = useState<{ property_type: string; square_footage: number | null } | null>(null);

  // UI state
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState(0);
  const [error, setError] = useState('');
  const [inspirationMode, setInspirationMode] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState<File | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState('');
  const [inspirationTitle, setInspirationTitle] = useState('');
  const [generateDescription, setGenerateDescription] = useState('');

  // Fetch projects and their scenarios
  const fetchData = useCallback(async () => {
    if (!user) return;

    // Fetch active projects
    const { data: projectRows } = await supabase
      .from('jobs')
      .select('id, title, category, description, estimated_budget, progress')
      .eq('user_id', user.id)
      .eq('is_project', true)
      .order('updated_at', { ascending: false });

    const projs = projectRows || [];
    setProjects(projs);

    if (projs.length > 0) {
      const jobIds = projs.map(p => p.id);

      // Fetch scenarios and before photos in parallel
      const [scenariosRes, photosRes, propertyRes] = await Promise.all([
        supabase
          .from('renovation_scenarios')
          .select('*')
          .eq('user_id', user.id)
          .in('job_id', jobIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('project_photos')
          .select('id, job_id, url, caption')
          .in('job_id', jobIds)
          .eq('category', 'before'),
        supabase
          .from('properties')
          .select('property_type, square_footage')
          .eq('user_id', user.id)
          .limit(1)
          .single(),
      ]);

      setScenarios(scenariosRes.data || []);
      setBeforePhotos(photosRes.data || []);
      if (propertyRes.data) setProperty(propertyRes.data);

      // Auto-select first project
      if (!selectedProject) setSelectedProject(projs[0].id);
    }

    setLoading(false);
  }, [user, selectedProject]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-select first scenario for selected project
  useEffect(() => {
    if (selectedProject) {
      const projScenarios = scenarios.filter(s => s.job_id === selectedProject);
      if (projScenarios.length > 0 && !projScenarios.find(s => s.id === selectedScenario)) {
        setSelectedScenario(projScenarios[0].id);
      }
    }
  }, [selectedProject, scenarios, selectedScenario]);

  // Generate a new scenario
  const handleGenerate = async () => {
    if (!user || !selectedProject) return;
    setGenerating(true);
    setError('');

    const project = projects.find(p => p.id === selectedProject);
    if (!project) { setGenerating(false); return; }

    const style = STYLE_OPTIONS[selectedStyle];
    const projectBeforePhotos = beforePhotos.filter(p => p.job_id === selectedProject);
    const sourcePhoto = projectBeforePhotos.length > 0 ? projectBeforePhotos[0].url : '';

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch('/api/generate-renovation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          sourcePhotoUrl: sourcePhoto,
          projectTitle: project.title,
          projectCategory: project.category,
          styleName: style.name,
          description: generateDescription.trim(),
          propertyType: property?.property_type || '',
          squareFootage: property?.square_footage || null,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Generation failed');
      }

      const result = await response.json();

      // Save to DB
      const { data: newScenario } = await supabase
        .from('renovation_scenarios')
        .insert({
          user_id: user.id,
          job_id: selectedProject,
          source_photo_url: sourcePhoto,
          name: result.name,
          style_description: result.styleDescription,
          generated_image_url: result.generatedImageUrl || '',
          estimated_cost_low: result.estimatedCostLow,
          estimated_cost_high: result.estimatedCostHigh,
          estimated_timeline: result.estimatedTimeline,
          roi_estimate: result.roiEstimate,
          status: 'completed',
        })
        .select()
        .single();

      if (newScenario) {
        setScenarios(prev => [newScenario, ...prev]);
        setSelectedScenario(newScenario.id);
      }

      setShowGenerateModal(false);
      setGenerateDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setGenerating(false);
    }
  };

  // Delete a scenario
  const handleDelete = async (id: string) => {
    await supabase.from('renovation_scenarios').delete().eq('id', id);
    setScenarios(prev => prev.filter(s => s.id !== id));
    if (selectedScenario === id) setSelectedScenario(null);
  };

  // Derived data
  const selectedProjectData = projects.find(p => p.id === selectedProject);
  const projectScenarios = scenarios.filter(s => s.job_id === selectedProject);
  const currentScenario = scenarios.find(s => s.id === selectedScenario);
  const projectBeforePhoto = beforePhotos.find(p => p.job_id === selectedProject);

  // Loading
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // No projects
  if (projects.length === 0 && !inspirationMode) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-magic-line text-3xl text-[#D4B483]"></i>
        </div>
        <h3 className="text-lg font-bold text-[#0B1F33] mb-2">Renovation Visualization</h3>
        <p className="text-sm text-[#6B7C8F] max-w-md mx-auto mb-6">
          See AI-generated design ideas for any room in your home. Upload a photo to get started, or create a project first for full tracking.
        </p>
        <button
          onClick={() => setInspirationMode(true)}
          className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer"
        >
          <i className="ri-image-add-line mr-2"></i>
          Upload a Photo for Inspiration
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-5 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33] mb-1 sm:mb-2">Renovation Visualization</h2>
            <p className="text-xs sm:text-sm text-[#6B7C8F]">AI-generated design scenarios for your projects</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setInspirationMode(false); setShowGenerateModal(true); setGenerateDescription(''); setUploadedPhoto(null); setUploadedPhotoUrl(''); setInspirationTitle(''); }}
              className="bg-[#0B1F33] text-white px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm hover:bg-[#1a3a52] transition-colors flex items-center gap-1.5"
            >
              <i className="ri-sparkling-line"></i>
              Generate New
            </button>
            <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full">
              <i className="ri-vip-crown-line text-[#0B1F33] text-xs sm:text-sm"></i>
              <span className="text-[10px] sm:text-xs font-bold text-[#0B1F33]">Premium</span>
            </div>
          </div>
        </div>

        {/* Project Selector */}
        {projects.length > 1 && (
          <div className="mb-5 sm:mb-6">
            <label className="text-xs font-semibold text-[#6B7C8F] mb-2 block">Select Project</label>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {projects.map(proj => (
                <button
                  key={proj.id}
                  onClick={() => { setSelectedProject(proj.id); setSelectedScenario(null); }}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
                    selectedProject === proj.id
                      ? 'bg-[#0B1F33] text-white'
                      : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                  }`}
                >
                  {proj.title}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Scenario Tabs */}
        {projectScenarios.length > 0 && (
          <div className="flex gap-2 sm:gap-3 mb-5 sm:mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {projectScenarios.map(scenario => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm whitespace-nowrap cursor-pointer transition-all ${
                  selectedScenario === scenario.id
                    ? 'bg-[#14B8A6] text-white'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        )}

        {/* No scenarios yet */}
        {projectScenarios.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl mb-6">
            <div className="w-14 h-14 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-magic-line text-2xl text-[#D4B483]"></i>
            </div>
            <h3 className="font-bold text-[#0B1F33] mb-1">No Visualizations Yet</h3>
            <p className="text-sm text-[#6B7C8F] mb-4 max-w-sm mx-auto">
              Generate AI design scenarios to see what your {selectedProjectData?.title || 'project'} could look like in different styles.
            </p>
            <button
              onClick={() => { setInspirationMode(true); setShowGenerateModal(true); setGenerateDescription(''); }}
              className="bg-[#0B1F33] text-white px-6 py-2.5 rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors inline-flex items-center gap-2"
            >
              <i className="ri-sparkling-line"></i>
              Generate First Scenario
            </button>
          </div>
        )}

        {/* Current Scenario Display */}
        {currentScenario && (
          <>
            {/* Before / After Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Before */}
              <div>
                <h3 className="text-sm sm:text-lg font-bold text-[#0B1F33] mb-2 sm:mb-3">
                  Current — {selectedProjectData?.title}
                </h3>
                <div className="w-full h-56 sm:h-80 bg-gray-100 rounded-lg overflow-hidden">
                  {projectBeforePhoto ? (
                    <img
                      src={projectBeforePhoto.url}
                      alt={projectBeforePhoto.caption || 'Before'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6B7C8F]">
                      <div className="text-center">
                        <i className="ri-image-line text-4xl mb-2 block"></i>
                        <p className="text-sm">No before photo uploaded</p>
                        <p className="text-xs mt-1">Upload a photo in the project Photos tab</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* After (generated) */}
              <div>
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <h3 className="text-sm sm:text-lg font-bold text-[#0B1F33]">
                    {currentScenario.name} Vision
                  </h3>
                  <button
                    onClick={() => handleDelete(currentScenario.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium"
                  >
                    <i className="ri-delete-bin-line mr-1"></i>Remove
                  </button>
                </div>
                <div className="w-full h-56 sm:h-80 bg-gray-100 rounded-lg overflow-hidden">
                  {currentScenario.generated_image_url ? (
                    <img
                      src={currentScenario.generated_image_url}
                      alt={currentScenario.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] text-white">
                      <div className="text-center">
                        <i className="ri-sparkling-line text-4xl mb-2 block text-[#D4B483]"></i>
                        <p className="text-sm font-semibold">AI Visualization</p>
                        <p className="text-xs text-white/70 mt-1">{currentScenario.name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Style Description */}
            {currentScenario.style_description && (
              <div className="mt-4 bg-[#F9F9FB] rounded-lg p-3 sm:p-4">
                <p className="text-sm text-[#6B7C8F] leading-relaxed">
                  <i className="ri-palette-line text-[#D4B483] mr-1.5"></i>
                  {currentScenario.style_description}
                </p>
              </div>
            )}

            {/* Scenario Stats */}
            <div className="mt-5 sm:mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-lg p-3 sm:p-4 text-white">
                <p className="text-xs sm:text-sm text-white/70 mb-1">Estimated Cost</p>
                <p className="text-lg sm:text-xl font-bold">
                  {currentScenario.estimated_cost_low && currentScenario.estimated_cost_high
                    ? `${formatCurrency(currentScenario.estimated_cost_low)} - ${formatCurrency(currentScenario.estimated_cost_high)}`
                    : '—'}
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-lg p-3 sm:p-4 text-white">
                <p className="text-xs sm:text-sm text-white/70 mb-1">Timeline</p>
                <p className="text-lg sm:text-xl font-bold">{currentScenario.estimated_timeline || '—'}</p>
              </div>
              <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-lg p-3 sm:p-4 text-white">
                <p className="text-xs sm:text-sm text-white/70 mb-1">ROI Potential</p>
                <p className="text-lg sm:text-xl font-bold text-emerald-400">{currentScenario.roi_estimate || '—'}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              {currentScenario.generated_image_url && (
                <a
                  href={currentScenario.generated_image_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-[#0B1F33] text-white py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors whitespace-nowrap cursor-pointer text-xs sm:text-sm text-center"
                >
                  <i className="ri-download-line mr-1.5 sm:mr-2"></i>
                  View Full Image
                </a>
              )}
              <button
                onClick={() => { setInspirationMode(true); setShowGenerateModal(true); setGenerateDescription(''); }}
                className="flex-1 bg-[#F9F9FB] text-[#0B1F33] py-2.5 sm:py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors whitespace-nowrap cursor-pointer text-xs sm:text-sm"
              >
                <i className="ri-sparkling-line mr-1.5 sm:mr-2"></i>
                Generate Another Style
              </button>
              {/* PHASE_1_GTM: "Post Job for Bids" paused — restore for Phase 2 */}
            </div>
          </>
        )}
      </div>

      {/* Generate Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0B1F33]">{!inspirationMode ? 'Generate New Visualization' : 'Generate Renovation Scenario'}</h3>
                <p className="text-xs text-[#6B7C8F] mt-1">
                  {!inspirationMode ? 'Upload a photo and describe what you want to visualize' : `For: ${selectedProjectData?.title || 'Project'}`}
                </p>
              </div>
              <button
                onClick={() => { setShowGenerateModal(false); setError(''); setUploadedPhoto(null); setUploadedPhotoUrl(''); setInspirationTitle(''); setGenerateDescription(''); }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Photo upload for "Generate New" (standalone) mode */}
              {!inspirationMode && (
                <>
                  <div>
                    <label className="text-sm font-semibold text-[#0B1F33] block mb-2">Room / Area Name *</label>
                    <input
                      type="text"
                      value={inspirationTitle}
                      onChange={e => setInspirationTitle(e.target.value)}
                      placeholder="e.g., Kitchen, Master Bathroom, Living Room"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-[#0B1F33] block mb-2">Upload Current Photo *</label>
                    {uploadedPhotoUrl ? (
                      <div className="relative">
                        <img src={uploadedPhotoUrl} alt="Upload" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                        <button
                          onClick={() => { setUploadedPhoto(null); setUploadedPhotoUrl(''); }}
                          className="absolute top-2 right-2 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-md cursor-pointer"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-400 cursor-pointer transition-colors bg-gray-50">
                        <i className="ri-image-add-line text-3xl text-[#6B7C8F] mb-2"></i>
                        <span className="text-sm text-[#6B7C8F] font-medium">Click to upload photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setUploadedPhoto(file);
                              setUploadedPhotoUrl(URL.createObjectURL(file));
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                </>
              )}

              {/* Existing project before photo preview for project-based generation */}
              {inspirationMode && projectBeforePhoto && (
                <div>
                  <label className="text-sm font-semibold text-[#0B1F33] block mb-2">Current Photo — {selectedProjectData?.title}</label>
                  <img src={projectBeforePhoto.url} alt="Before" className="w-full h-48 object-cover rounded-lg border border-gray-200" />
                </div>
              )}
              {inspirationMode && !projectBeforePhoto && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-sm text-amber-700"><i className="ri-error-warning-line mr-1"></i>No before photo found for this project. Upload one in the project Photos tab for best results.</p>
                </div>
              )}

              {/* Mandatory description for AI context */}
              <div>
                <label className="text-sm font-semibold text-[#0B1F33] block mb-2">Describe What You Want <span className="font-normal text-[#6B7C8F]">(optional — or just pick a style below)</span></label>
                <textarea
                  value={generateDescription}
                  onChange={e => setGenerateDescription(e.target.value)}
                  placeholder="e.g., I want a modern open-concept kitchen with an island and white cabinets..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                />
                <div className="text-xs text-gray-500 mt-1">{generateDescription.length}/500 characters</div>
              </div>

              <label className="text-sm font-semibold text-[#0B1F33] block">Choose a Design Style</label>
              <div className="space-y-2">
                {STYLE_OPTIONS.map((style, idx) => (
                  <button
                    key={style.name}
                    onClick={() => setSelectedStyle(idx)}
                    className={`w-full p-3 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${
                      selectedStyle === idx
                        ? 'border-[#14B8A6] bg-teal-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      selectedStyle === idx ? 'bg-[#14B8A6] text-white' : 'bg-gray-100 text-[#6B7C8F]'
                    }`}>
                      <i className={`${style.icon} text-xl`}></i>
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${selectedStyle === idx ? 'text-[#0B1F33]' : 'text-[#6B7C8F]'}`}>
                        {style.name}
                      </p>
                      <p className="text-xs text-[#6B7C8F]">{style.desc}</p>
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700"><i className="ri-error-warning-line mr-1"></i>{error}</p>
                </div>
              )}

              <button
                onClick={async () => {
                  // Description is optional — the user can either describe what
                  // they want OR just pick a design style below (not both).
                  if (!inspirationMode) {
                    // "Generate New" — standalone with uploaded photo
                    if (!uploadedPhoto || !inspirationTitle.trim() || !user) return;
                    setGenerating(true);
                    setError('');
                    try {
                      // Upload photo to storage
                      const filePath = `${user.id}/inspiration/${Date.now()}-${uploadedPhoto.name}`;
                      const { error: uploadErr } = await supabase.storage.from('renovation-photos').upload(filePath, uploadedPhoto);
                      if (uploadErr) throw uploadErr;
                      const { data: urlData } = supabase.storage.from('renovation-photos').getPublicUrl(filePath);
                      const photoUrl = urlData.publicUrl;

                      const { data: { session } } = await supabase.auth.getSession();
                      if (!session) throw new Error('Not authenticated');

                      const style = STYLE_OPTIONS[selectedStyle];
                      const response = await fetch('/api/generate-renovation', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                        body: JSON.stringify({
                          sourcePhotoUrl: photoUrl,
                          projectTitle: inspirationTitle,
                          projectCategory: 'Inspiration',
                          styleName: style.name,
                          description: generateDescription.trim(),
                          propertyType: property?.property_type || '',
                          squareFootage: property?.square_footage || null,
                        }),
                      });
                      if (!response.ok) { const err = await response.json(); throw new Error(err.error || 'Generation failed'); }
                      const result = await response.json();

                      // Create a temporary job to link the scenario
                      const { data: tempJob } = await supabase.from('jobs').insert({
                        user_id: user.id,
                        title: `Inspiration: ${inspirationTitle}`,
                        category: 'Renovation',
                        description: generateDescription.trim(),
                        location: '',
                        is_project: true,
                      }).select('id').single();

                      if (tempJob) {
                        const { data: newScenario } = await supabase.from('renovation_scenarios').insert({
                          user_id: user.id,
                          job_id: tempJob.id,
                          source_photo_url: photoUrl,
                          name: result.name,
                          style_description: result.styleDescription,
                          generated_image_url: result.generatedImageUrl || '',
                          estimated_cost_low: result.estimatedCostLow,
                          estimated_cost_high: result.estimatedCostHigh,
                          estimated_timeline: result.estimatedTimeline,
                          roi_estimate: result.roiEstimate,
                          status: 'completed',
                        }).select().single();

                        if (newScenario) {
                          setScenarios(prev => [newScenario, ...prev]);
                          setSelectedScenario(newScenario.id);
                          setProjects(prev => [...prev, { id: tempJob.id, title: `Inspiration: ${inspirationTitle}`, category: 'Renovation', description: '', estimated_budget: null, progress: 0 }]);
                          setSelectedProject(tempJob.id);
                        }
                      }
                      setShowGenerateModal(false);
                      setUploadedPhoto(null);
                      setUploadedPhotoUrl('');
                      setInspirationTitle('');
                      setGenerateDescription('');
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Something went wrong');
                    } finally {
                      setGenerating(false);
                    }
                  } else {
                    // Project-based generation — use existing project before photo
                    handleGenerate();
                  }
                }}
                disabled={generating || (!inspirationMode && (!uploadedPhoto || !inspirationTitle.trim())) || !generateDescription.trim()}
                className="w-full bg-[#0B1F33] text-white py-3 rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Generating with AI...
                  </>
                ) : (
                  <>
                    <i className="ri-sparkling-line"></i>
                    Generate {STYLE_OPTIONS[selectedStyle].name} Scenario
                  </>
                )}
              </button>

              <p className="text-[10px] text-center text-[#6B7C8F]">
                Pricing may vary based on materials, labor, and your location. Our AI estimates are always improving — we recommend confirming costs with a contractor.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
