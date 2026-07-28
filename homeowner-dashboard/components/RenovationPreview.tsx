import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface RenovationProject {
  id: string;
  name: string;
  spaceType: string;
  originalPhoto: string;
  previewPhotos: string[];
  selectedStyle: string;
  squareFootage?: number;
  budget?: string;
  goals: string[];
  scope: {
    description: string;
    laborCostRange: { min: number; max: number };
    materialsCostRange: { min: number; max: number };
    timeline: string;
    tradesRequired: string[];
  };
  materials: {
    category: string;
    examples: string[];
    notes?: string;
  }[];
  dependencies: string[];
  systemWarnings: string[];
  resaleImpact?: string;
  createdAt: string;
  status: 'preview' | 'project' | 'archived';
}

export default function RenovationPreview() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'upload' | 'generating' | 'preview' | 'scope'>('upload');
  const [uploadedPhotos, setUploadedPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [isPremium] = useState(true); // Replace with actual premium status check
  
  // Form state
  const [spaceType, setSpaceType] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [homeAge, setHomeAge] = useState('');
  const [budget, setBudget] = useState('');
  const [goals, setGoals] = useState<string[]>([]);
  const [selectedStyle, setSelectedStyle] = useState('modern');
  
  // Preview state
  const [currentProject, setCurrentProject] = useState<RenovationProject | null>(null);
  const [savedProjects, setSavedProjects] = useState<RenovationProject[]>([
    {
      id: 'proj-1',
      name: 'Kitchen Modernization',
      spaceType: 'Kitchen',
      originalPhoto: 'https://readdy.ai/api/search-image?query=dated%20traditional%20kitchen%20with%20old%20oak%20cabinets%20laminate%20countertops%20and%20fluorescent%20lighting%20showing%20worn%20appearance%20and%20outdated%20finishes%20in%20residential%20home%20interior%20space&width=800&height=600&seq=kitchen-before-1&orientation=landscape',
      previewPhotos: [
        'https://readdy.ai/api/search-image?query=modern%20renovated%20kitchen%20with%20white%20shaker%20cabinets%20quartz%20countertops%20stainless%20appliances%20subway%20tile%20backsplash%20and%20recessed%20lighting%20in%20bright%20clean%20residential%20space&width=800&height=600&seq=kitchen-modern-1&orientation=landscape',
        'https://readdy.ai/api/search-image?query=contemporary%20kitchen%20renovation%20with%20dark%20navy%20cabinets%20brass%20hardware%20marble%20countertops%20and%20pendant%20lighting%20in%20sophisticated%20residential%20interior%20design&width=800&height=600&seq=kitchen-contemporary-1&orientation=landscape',
        'https://readdy.ai/api/search-image?query=transitional%20kitchen%20remodel%20with%20gray%20cabinets%20white%20countertops%20farmhouse%20sink%20and%20warm%20wood%20accents%20in%20inviting%20residential%20home%20space&width=800&height=600&seq=kitchen-transitional-1&orientation=landscape',
      ],
      selectedStyle: 'Modern',
      squareFootage: 180,
      budget: '$40,000 - $60,000',
      goals: ['Full Renovation', 'Resale Prep'],
      scope: {
        description: 'Complete kitchen renovation including cabinet replacement, countertop installation, backsplash, flooring, lighting upgrades, and appliance installation.',
        laborCostRange: { min: 18000, max: 28000 },
        materialsCostRange: { min: 22000, max: 32000 },
        timeline: '6-8 weeks',
        tradesRequired: ['Carpentry', 'Electrical', 'Plumbing', 'Tile/Flooring', 'Painting'],
      },
      materials: [
        {
          category: 'Cabinets',
          examples: ['Shaker-style painted', 'Semi-custom construction', 'Soft-close hardware'],
        },
        {
          category: 'Countertops',
          examples: ['Quartz engineered stone', 'Undermount sink cutout', 'Polished edge'],
        },
        {
          category: 'Backsplash',
          examples: ['Ceramic subway tile', 'Standard installation', 'Grout sealing'],
        },
        {
          category: 'Flooring',
          examples: ['Luxury vinyl plank', 'Water-resistant core', 'Click-lock installation'],
        },
      ],
      dependencies: [
        'Electrical work must be completed before drywall and backsplash',
        'Plumbing rough-in required before cabinet installation',
        'Flooring installed after cabinets to avoid damage',
      ],
      systemWarnings: [
        'Electrical panel may need upgrade for new appliance load',
        'Plumbing venting should be inspected during wall opening',
      ],
      resaleImpact: 'Kitchen renovations typically return 60-80% of investment and significantly improve marketability',
      createdAt: '2024-01-15',
      status: 'preview',
    },
  ]);

  const spaceTypes = [
    { id: 'kitchen', label: 'Kitchen', icon: 'ri-restaurant-line' },
    { id: 'bathroom', label: 'Bathroom', icon: 'ri-drop-line' },
    { id: 'living-room', label: 'Living Room', icon: 'ri-sofa-line' },
    { id: 'bedroom', label: 'Bedroom', icon: 'ri-hotel-bed-line' },
    { id: 'basement', label: 'Basement', icon: 'ri-building-line' },
    { id: 'exterior', label: 'Exterior', icon: 'ri-home-line' },
    { id: 'bathroom-master', label: 'Master Bath', icon: 'ri-water-flash-line' },
    { id: 'outdoor', label: 'Outdoor Space', icon: 'ri-plant-line' },
  ];

  const goalOptions = [
    'Refresh',
    'Full Renovation',
    'Resale Prep',
    'Functional Upgrade',
    'Modernization',
    'Accessibility',
  ];

  const styleOptions = [
    { id: 'modern', label: 'Modern', description: 'Clean lines, minimal ornamentation' },
    { id: 'traditional', label: 'Traditional', description: 'Classic details, warm finishes' },
    { id: 'contemporary', label: 'Contemporary', description: 'Current trends, bold choices' },
    { id: 'transitional', label: 'Transitional', description: 'Balanced blend of styles' },
    { id: 'farmhouse', label: 'Farmhouse', description: 'Rustic charm, natural materials' },
    { id: 'industrial', label: 'Industrial', description: 'Exposed elements, urban feel' },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    setUploadedPhotos(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const url = URL.createObjectURL(file);
      setPhotoUrls(prev => [...prev, url]);
    });
  };

  const handleGeneratePreview = async () => {
    if (!spaceType || uploadedPhotos.length === 0) {
      alert('Please select a space type and upload at least one photo');
      return;
    }

    setStep('generating');
    
    // Simulate AI generation
    setTimeout(() => {
      const mockProject: RenovationProject = {
        id: `proj-${Date.now()}`,
        name: `${spaceType} Renovation`,
        spaceType,
        originalPhoto: photoUrls[0],
        previewPhotos: [
          `https://readdy.ai/api/search-image?query=beautifully%20renovated%20$%7BspaceType.toLowerCase%28%29%7D%20with%20modern%20finishes%20clean%20design%20and%20professional%20quality%20in%20residential%20home%20interior%20space%20showing%20updated%20materials&width=800&height=600&seq=${spaceType}-preview-1&orientation=landscape`,
          `https://readdy.ai/api/search-image?query=contemporary%20$%7BspaceType.toLowerCase%28%29%7D%20remodel%20with%20stylish%20fixtures%20quality%20materials%20and%20sophisticated%20design%20in%20residential%20property%20interior%20renovation&width=800&height=600&seq=${spaceType}-preview-2&orientation=landscape`,
          `https://readdy.ai/api/search-image?query=transitional%20$%7BspaceType.toLowerCase%28%29%7D%20renovation%20with%20neutral%20palette%20timeless%20finishes%20and%20functional%20layout%20in%20residential%20home%20interior%20upgrade&width=800&height=600&seq=${spaceType}-preview-3&orientation=landscape`,
        ],
        selectedStyle: selectedStyle,
        squareFootage: squareFootage ? parseInt(squareFootage) : undefined,
        budget: budget || undefined,
        goals,
        scope: {
          description: `Complete ${spaceType.toLowerCase()} renovation including structural updates, finish installation, and system upgrades as needed.`,
          laborCostRange: { min: 12000, max: 22000 },
          materialsCostRange: { min: 15000, max: 28000 },
          timeline: '4-6 weeks',
          tradesRequired: ['Carpentry', 'Electrical', 'Painting'],
        },
        materials: [
          {
            category: 'Finishes',
            examples: ['Quality materials', 'Professional installation', 'Warranty included'],
          },
        ],
        dependencies: ['Electrical work before finish installation'],
        systemWarnings: [],
        createdAt: new Date().toISOString(),
        status: 'preview',
      };
      
      setCurrentProject(mockProject);
      setStep('preview');
    }, 3000);
  };

  const handleConvertToProject = () => {
    if (!currentProject) return;
    
    // Save to projects list
    setSavedProjects(prev => [...prev, { ...currentProject, status: 'project' }]);
    
    // Navigate to AI intake with pre-filled data
    navigate('/ai-intake', {
      state: {
        renovationProject: currentProject,
        description: `Renovation project: ${currentProject.scope.description}`,
        photos: [currentProject.originalPhoto],
      },
    });
  };

  const handleSaveProject = () => {
    if (!currentProject) return;
    setSavedProjects(prev => [...prev, currentProject]);
    alert('Project saved to your gallery!');
  };

  if (!isPremium && step === 'upload') {
    return (
      <div className="bg-gradient-to-br from-[#D4B483]/10 to-[#6B7C8F]/10 rounded-xl border-2 border-[#D4B483] p-12 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-magic-line text-white text-4xl"></i>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            AI Renovation Preview
          </h2>
          <p className="text-lg text-gray-700 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Visualize your renovation before it happens. Upload photos, explore design options, and get instant cost and scope intelligence.
          </p>
          <div className="bg-white rounded-lg p-6 mb-8 text-left">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Premium Features Include:</h3>
            <ul className="space-y-3">
              {[
                'Unlimited renovation previews',
                'Multiple design style variations',
                'Detailed cost and scope intelligence',
                'Save and compare renovation scenarios',
                'One-click conversion to scoped projects',
                'Priority contractor matching',
                'Resale impact analysis',
              ].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0"></i>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setStep('upload')}
            className="bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            <i className="ri-vip-crown-line mr-2"></i>
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <i className="ri-magic-line text-3xl"></i>
              <h1 className="text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                AI Renovation Preview
              </h1>
            </div>
            <p className="text-lg opacity-90" style={{ fontFamily: 'Inter, sans-serif' }}>
              Turn inspiration into action. Visualize, plan, and execute with confidence.
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="flex items-center gap-2">
              <i className="ri-vip-crown-fill text-[#D4B483] text-xl"></i>
              <span className="font-bold">Premium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Projects Gallery */}
      {savedProjects.length > 0 && step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Your Renovation Gallery
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedProjects.map((project) => (
              <div
                key={project.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                onClick={() => {
                  setCurrentProject(project);
                  setStep('preview');
                }}
              >
                <div className="relative aspect-video">
                  <img
                    src={project.previewPhotos[0]}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                  {project.status === 'project' && (
                    <div className="absolute top-2 right-2 bg-[#D4B483] text-white px-3 py-1 rounded-full text-xs font-bold">
                      Active Project
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 mb-1">{project.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{project.spaceType}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    <span className="text-[#D4B483] font-medium">View Details →</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 1: Upload and Context */}
      {step === 'upload' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Start Your Renovation Preview
          </h2>

          <div className="space-y-6">
            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Upload Photos of Your Space <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D4B483] transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="renovation-photo-upload"
                />
                <label htmlFor="renovation-photo-upload" className="cursor-pointer">
                  <i className="ri-image-add-line text-5xl text-gray-400 mb-3"></i>
                  <p className="text-gray-700 font-medium mb-1">Click to upload photos</p>
                  <p className="text-sm text-gray-500">Upload multiple angles for best results</p>
                </label>
              </div>
              {photoUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {photoUrls.map((url, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                      <img src={url} alt="Upload" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setPhotoUrls(prev => prev.filter((_, i) => i !== idx));
                          setUploadedPhotos(prev => prev.filter((_, i) => i !== idx));
                        }}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                      >
                        <i className="ri-close-line text-sm"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Space Type */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                What space are you renovating? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {spaceTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSpaceType(type.label)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      spaceType === type.label
                        ? 'border-[#D4B483] bg-[#D4B483]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <i className={`${type.icon} text-2xl mb-2 ${spaceType === type.label ? 'text-[#D4B483]' : 'text-gray-600'}`}></i>
                    <p className={`text-sm font-medium ${spaceType === type.label ? 'text-[#0B1F33]' : 'text-gray-700'}`}>
                      {type.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Optional Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Square Footage (Optional)
                </label>
                <input
                  type="number"
                  value={squareFootage}
                  onChange={(e) => setSquareFootage(e.target.value)}
                  placeholder="e.g., 180"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age of Home (Optional)
                </label>
                <input
                  type="text"
                  value={homeAge}
                  onChange={(e) => setHomeAge(e.target.value)}
                  placeholder="e.g., 1985"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (Optional)
                </label>
                <select
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4B483] focus:border-transparent text-sm"
                >
                  <option value="">Select range</option>
                  <option value="Under $10,000">Under $10,000</option>
                  <option value="$10,000 - $25,000">$10,000 - $25,000</option>
                  <option value="$25,000 - $50,000">$25,000 - $50,000</option>
                  <option value="$50,000 - $100,000">$50,000 - $100,000</option>
                  <option value="Over $100,000">Over $100,000</option>
                </select>
              </div>
            </div>

            {/* Goals */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                What are your goals?
              </label>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map((goal) => (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => {
                      if (goals.includes(goal)) {
                        setGoals(prev => prev.filter(g => g !== goal));
                      } else {
                        setGoals(prev => [...prev, goal]);
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      goals.includes(goal)
                        ? 'bg-[#D4B483] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </div>

            {/* Style Preference */}
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-3">
                Preferred Style
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {styleOptions.map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      selectedStyle === style.id
                        ? 'border-[#D4B483] bg-[#D4B483]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className={`font-bold mb-1 ${selectedStyle === style.id ? 'text-[#0B1F33]' : 'text-gray-900'}`}>
                      {style.label}
                    </p>
                    <p className="text-xs text-gray-600">{style.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePreview}
              disabled={!spaceType || uploadedPhotos.length === 0}
              className="w-full bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] text-white py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-magic-line text-xl"></i>
              Generate AI Preview
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Generating */}
      {step === 'generating' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <i className="ri-magic-line text-white text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Creating Your Renovation Preview
            </h2>
            <p className="text-gray-600 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Our AI is analyzing your space and generating realistic renovation options...
            </p>
            <div className="space-y-3 text-left">
              {[
                'Analyzing room dimensions and layout',
                'Identifying structural elements',
                'Generating design variations',
                'Calculating cost estimates',
                'Determining trade requirements',
              ].map((task, idx) => (
                <div key={idx} className="flex items-center gap-3 text-sm text-gray-700">
                  <div className="w-5 h-5 bg-[#D4B483] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="ri-check-line text-white text-xs"></i>
                  </div>
                  {task}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Preview Results */}
      {step === 'preview' && currentProject && (
        <div className="space-y-6">
          {/* Before/After Comparison */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Your Renovation Preview
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProject}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-save-line"></i>
                  Save to Gallery
                </button>
                <button
                  onClick={() => setStep('scope')}
                  className="px-4 py-2 bg-[#D4B483] text-white rounded-lg hover:bg-[#D4B483]/90 transition-colors flex items-center gap-2 whitespace-nowrap"
                >
                  <i className="ri-file-list-line"></i>
                  View Full Scope
                </button>
              </div>
            </div>

            {/* Before Photo */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Current Space</h3>
              <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={currentProject.originalPhoto}
                  alt="Before"
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-bold">
                  Before
                </div>
              </div>
            </div>

            {/* Style Variations */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Design Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentProject.previewPhotos.map((photo, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border-2 border-[#D4B483] hover:shadow-lg transition-all cursor-pointer">
                    <img
                      src={photo}
                      alt={`Option ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-[#D4B483] text-white px-3 py-1 rounded-full text-sm font-bold">
                      {['Modern', 'Contemporary', 'Transitional'][idx]}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                      <p className="text-white text-sm font-medium">Click to enlarge</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">
                * These are conceptual visualizations for planning purposes, not architectural drawings
              </p>
            </div>
          </div>

          {/* Quick Cost Overview */}
          <div className="bg-gradient-to-br from-[#D4B483]/10 to-[#6B7C8F]/10 rounded-xl border border-[#D4B483] p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Estimated Investment</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Labor Cost Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentProject.scope.laborCostRange.min.toLocaleString()} - ${currentProject.scope.laborCostRange.max.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Materials Cost Range</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${currentProject.scope.materialsCostRange.min.toLocaleString()} - ${currentProject.scope.materialsCostRange.max.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Total Estimated Range</p>
                <p className="text-2xl font-bold text-[#D4B483]">
                  ${(currentProject.scope.laborCostRange.min + currentProject.scope.materialsCostRange.min).toLocaleString()} - ${(currentProject.scope.laborCostRange.max + currentProject.scope.materialsCostRange.max).toLocaleString()}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              <i className="ri-information-line mr-1"></i>
              Costs shown as realistic ranges. Final pricing determined by contractor quotes and material selections.
            </p>
          </div>

          {/* Convert to Project CTA */}
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ready to Make This Real?
            </h3>
            <p className="text-lg opacity-90 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Convert this preview into a scoped project and get matched with qualified contractors
            </p>
            <button
              onClick={handleConvertToProject}
              className="bg-white text-[#0B1F33] px-8 py-4 rounded-lg font-bold text-lg hover:shadow-lg transition-all whitespace-nowrap"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-rocket-line mr-2"></i>
              Turn This Into a Project
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Full Scope View */}
      {step === 'scope' && currentProject && (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setStep('preview')}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <i className="ri-arrow-left-line"></i>
              Back to Preview
            </button>
            <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Complete Scope & Cost Intelligence
            </h2>
          </div>

          {/* Scope Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Project Scope</h3>
            <p className="text-gray-700 leading-relaxed">{currentProject.scope.description}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Timeline</p>
                <p className="text-lg font-bold text-gray-900">{currentProject.scope.timeline}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-600 mb-1">Trades Required</p>
                <p className="text-lg font-bold text-gray-900">{currentProject.scope.tradesRequired.length}</p>
              </div>
              {currentProject.squareFootage && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Square Footage</p>
                  <p className="text-lg font-bold text-gray-900">{currentProject.squareFootage} sq ft</p>
                </div>
              )}
              {currentProject.budget && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-xs text-gray-600 mb-1">Your Budget</p>
                  <p className="text-lg font-bold text-gray-900">{currentProject.budget}</p>
                </div>
              )}
            </div>
          </div>

          {/* Trades Required */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Required Trades</h3>
            <div className="flex flex-wrap gap-3">
              {currentProject.scope.tradesRequired.map((trade, idx) => (
                <div key={idx} className="flex items-center gap-2 px-4 py-2 bg-[#D4B483]/10 text-[#D4B483] rounded-full border border-[#D4B483]">
                  <i className="ri-tools-line"></i>
                  <span className="font-medium">{trade}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Materials & Finishes</h3>
            <div className="space-y-4">
              {currentProject.materials.map((material, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-bold text-gray-900 mb-2">{material.category}</h4>
                  <ul className="space-y-1">
                    {material.examples.map((example, exIdx) => (
                      <li key={exIdx} className="flex items-start gap-2 text-sm text-gray-700">
                        <i className="ri-checkbox-circle-line text-[#D4B483] flex-shrink-0 mt-0.5"></i>
                        {example}
                      </li>
                    ))}
                  </ul>
                  {material.notes && (
                    <p className="text-xs text-gray-600 mt-2 italic">
                      <i className="ri-information-line mr-1"></i>
                      {material.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-4 italic">
              * Material examples shown for planning. Final selections made with contractor.
            </p>
          </div>

          {/* Dependencies */}
          {currentProject.dependencies.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <i className="ri-git-branch-line text-blue-600 text-2xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-lg font-bold text-blue-900 mb-1">Work Sequence & Dependencies</h3>
                  <p className="text-sm text-blue-700">These steps must happen in order for proper execution</p>
                </div>
              </div>
              <div className="space-y-2">
                {currentProject.dependencies.map((dep, idx) => (
                  <div key={idx} className="flex items-start gap-3 bg-white rounded-lg p-3">
                    <div className="w-6 h-6 bg-[#0B1F33] text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-gray-700 pt-0.5">{dep}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* System Warnings */}
          {currentProject.systemWarnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-start gap-3 mb-4">
                <i className="ri-alert-line text-yellow-600 text-2xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-1">System Considerations</h3>
                  <p className="text-sm text-yellow-700">These systems may be affected during renovation</p>
                </div>
              </div>
              <ul className="space-y-2">
                {currentProject.systemWarnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-yellow-900 bg-white rounded-lg p-3">
                    <i className="ri-error-warning-line flex-shrink-0 mt-0.5"></i>
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Resale Impact */}
          {currentProject.resaleImpact && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <i className="ri-line-chart-line text-green-600 text-2xl flex-shrink-0"></i>
                <div>
                  <h3 className="text-lg font-bold text-green-900 mb-2">Resale Impact</h3>
                  <p className="text-sm text-green-700">{currentProject.resaleImpact}</p>
                </div>
              </div>
            </div>
          )}

          {/* Convert to Project */}
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Everything Looks Good?
            </h3>
            <p className="text-lg opacity-90 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Convert this into a scoped project and get matched with qualified contractors who can execute this work
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setStep('preview')}
                className="bg-white/20 backdrop-blur-sm text-white px-6 py-3 rounded-lg font-bold hover:bg-white/30 transition-all whitespace-nowrap"
              >
                <i className="ri-arrow-left-line mr-2"></i>
                Back to Preview
              </button>
              <button
                onClick={handleConvertToProject}
                className="bg-white text-[#0B1F33] px-8 py-3 rounded-lg font-bold hover:shadow-lg transition-all whitespace-nowrap"
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-rocket-line mr-2"></i>
                Turn This Into a Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
