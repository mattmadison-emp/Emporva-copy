import { useState } from 'react';

interface DIYProject {
  id: string;
  name: string;
  category: string;
  description: string;
  status: 'Not started' | 'In progress' | 'Paused' | 'Completed';
  complexity?: 'Easy' | 'Moderate' | 'Advanced';
  estimatedTime?: string;
  startDate?: string;
  targetDate?: string;
  totalCost: number;
  materials: Material[];
  tasks: Task[];
  photos: string[];
  aiSuggested: boolean;
  handedOffToContractor: boolean;
  contractorJobId?: string;
  importantForResale: boolean;
  resources: Resource[];
}

interface Material {
  id: string;
  name: string;
  quantity: number;
  estimatedCost: number;
}

interface Task {
  id: string;
  description: string;
  completed: boolean;
}

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: 'article' | 'guide';
}

const mockProjects: DIYProject[] = [
  {
    id: '1',
    name: 'Install Smart Thermostat',
    category: 'Minor Electrical',
    description: 'Replace old thermostat with Nest Learning Thermostat to improve energy efficiency',
    status: 'In progress',
    complexity: 'Moderate',
    estimatedTime: '2-3 hours',
    startDate: '2025-01-15',
    targetDate: '2025-01-16',
    totalCost: 285,
    materials: [
      { id: 'm1', name: 'Nest Learning Thermostat', quantity: 1, estimatedCost: 249 },
      { id: 'm2', name: 'Wire labels', quantity: 1, estimatedCost: 8 },
      { id: 'm3', name: 'Screwdriver set', quantity: 1, estimatedCost: 28 }
    ],
    tasks: [
      { id: 't1', description: 'Turn off power at breaker', completed: true },
      { id: 't2', description: 'Remove old thermostat and label wires', completed: true },
      { id: 't3', description: 'Install new mounting plate', completed: false },
      { id: 't4', description: 'Connect wires to new thermostat', completed: false },
      { id: 't5', description: 'Attach thermostat display and test', completed: false }
    ],
    photos: [
      'https://readdy.ai/api/search-image?query=modern%20smart%20thermostat%20installation%20on%20white%20wall%20with%20visible%20wiring%20connections%20clean%20home%20interior%20professional%20lighting%20high%20quality%20detailed%20view&width=400&height=300&seq=diy1&orientation=landscape'
    ],
    aiSuggested: true,
    handedOffToContractor: false,
    importantForResale: true,
    resources: [
      {
        id: 'r1',
        title: 'How to Install a Smart Thermostat',
        description: 'Step-by-step guide for installing Nest thermostats',
        url: 'https://example.com/smart-thermostat-guide',
        type: 'guide'
      },
      {
        id: 'r2',
        title: 'Thermostat Wiring Guide',
        description: 'Complete guide to understanding thermostat wire colors',
        url: 'https://example.com/thermostat-wiring',
        type: 'article'
      }
    ]
  },
  {
    id: '2',
    name: 'Kitchen Backsplash Tile',
    category: 'Cosmetic',
    description: 'Install subway tile backsplash behind kitchen stove and sink area',
    status: 'Not started',
    complexity: 'Advanced',
    estimatedTime: 'One weekend',
    startDate: '2025-02-01',
    targetDate: '2025-02-03',
    totalCost: 420,
    materials: [
      { id: 'm4', name: 'White subway tiles (box of 48)', quantity: 3, estimatedCost: 89 },
      { id: 'm5', name: 'Tile adhesive', quantity: 2, estimatedCost: 35 },
      { id: 'm6', name: 'Grout (white)', quantity: 2, estimatedCost: 24 },
      { id: 'm7', name: 'Tile spacers', quantity: 1, estimatedCost: 12 },
      { id: 'm8', name: 'Notched trowel', quantity: 1, estimatedCost: 18 }
    ],
    tasks: [
      { id: 't6', description: 'Measure and plan tile layout', completed: false },
      { id: 't7', description: 'Prepare wall surface', completed: false },
      { id: 't8', description: 'Apply adhesive and set tiles', completed: false },
      { id: 't9', description: 'Allow adhesive to cure 24 hours', completed: false },
      { id: 't10', description: 'Apply grout and seal', completed: false }
    ],
    photos: [],
    aiSuggested: true,
    handedOffToContractor: false,
    importantForResale: true,
    resources: []
  },
  {
    id: '3',
    name: 'Fix Leaky Bathroom Faucet',
    category: 'Minor Plumbing',
    description: 'Replace worn washers and O-rings in master bathroom sink faucet',
    status: 'Completed',
    complexity: 'Easy',
    estimatedTime: '1-2 hours',
    startDate: '2025-01-05',
    targetDate: '2025-01-05',
    totalCost: 35,
    materials: [
      { id: 'm9', name: 'Faucet repair kit', quantity: 1, estimatedCost: 18 },
      { id: 'm10', name: 'Plumber\'s grease', quantity: 1, estimatedCost: 9 },
      { id: 'm11', name: 'Adjustable wrench', quantity: 1, estimatedCost: 8 }
    ],
    tasks: [
      { id: 't11', description: 'Turn off water supply', completed: true },
      { id: 't12', description: 'Disassemble faucet handle', completed: true },
      { id: 't13', description: 'Replace washers and O-rings', completed: true },
      { id: 't14', description: 'Reassemble and test', completed: true }
    ],
    photos: [
      'https://readdy.ai/api/search-image?query=bathroom%20sink%20faucet%20repair%20with%20tools%20and%20replacement%20parts%20on%20counter%20clean%20modern%20bathroom%20detailed%20close%20up%20professional%20lighting&width=400&height=300&seq=diy2&orientation=landscape'
    ],
    aiSuggested: false,
    handedOffToContractor: false,
    importantForResale: false,
    resources: []
  }
];

const categories = [
  'Cosmetic',
  'Minor Plumbing',
  'Minor Electrical',
  'Painting',
  'Outdoor',
  'Flooring',
  'Storage',
  'Other'
];

export default function DIYProjects() {
  const [projects, setProjects] = useState<DIYProject[]>(mockProjects);
  const [selectedProject, setSelectedProject] = useState<DIYProject | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIPlanModal, setShowAIPlanModal] = useState(false);
  const [showHandoffModal, setShowHandoffModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredProjects = filterStatus === 'all' 
    ? projects 
    : projects.filter(p => p.status === filterStatus);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Paused': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getComplexityColor = (complexity?: string) => {
    switch (complexity) {
      case 'Easy': return 'text-emerald-600';
      case 'Moderate': return 'text-amber-600';
      case 'Advanced': return 'text-rose-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateProject = () => {
    setShowCreateModal(true);
  };

  const handlePlanWithAI = (project: DIYProject) => {
    setSelectedProject(project);
    setShowAIPlanModal(true);
  };

  const handleConnectContractor = (project: DIYProject) => {
    setSelectedProject(project);
    setShowHandoffModal(true);
  };

  const handleToggleResale = (projectId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, importantForResale: !p.importantForResale } : p
    ));
  };

  const handleToggleTask = (projectId: string, taskId: string) => {
    setProjects(projects.map(p => 
      p.id === projectId 
        ? {
            ...p,
            tasks: p.tasks.map(t => 
              t.id === taskId ? { ...t, completed: !t.completed } : t
            )
          }
        : p
    ));
  };

  if (selectedProject && !showAIPlanModal && !showHandoffModal) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedProject(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <i className="ri-arrow-left-line text-xl"></i>
            <span className="font-medium">Back to Projects</span>
          </button>
          <div className="flex items-center gap-3">
            {selectedProject.handedOffToContractor && (
              <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium border border-teal-200">
                <i className="ri-user-star-line mr-2"></i>
                Handed off to contractor
              </span>
            )}
            <button
              onClick={() => handleToggleResale(selectedProject.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedProject.importantForResale
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <i className={`${selectedProject.importantForResale ? 'ri-star-fill' : 'ri-star-line'} mr-2`}></i>
              {selectedProject.importantForResale ? 'Marked for resale' : 'Mark for resale'}
            </button>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedProject.name}</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-medium">
                    {selectedProject.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full font-medium border ${getStatusColor(selectedProject.status)}`}>
                    {selectedProject.status}
                  </span>
                  {selectedProject.complexity && (
                    <span className={`font-semibold ${getComplexityColor(selectedProject.complexity)}`}>
                      {selectedProject.complexity}
                    </span>
                  )}
                  {selectedProject.estimatedTime && (
                    <span className="text-gray-600">
                      <i className="ri-time-line mr-1"></i>
                      {selectedProject.estimatedTime}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                <div className="text-3xl font-bold text-gray-900">${selectedProject.totalCost}</div>
              </div>
            </div>

            <p className="text-gray-700 mb-6 leading-relaxed">{selectedProject.description}</p>

            {/* Photos */}
            {selectedProject.photos.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                <div className="grid grid-cols-3 gap-4">
                  {selectedProject.photos.map((photo, idx) => (
                    <div key={idx} className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
                      <img src={photo} alt={`Project photo ${idx + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dates */}
            {(selectedProject.startDate || selectedProject.targetDate) && (
              <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
                {selectedProject.startDate && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Start Date</div>
                    <div className="font-semibold text-gray-900">{new Date(selectedProject.startDate).toLocaleDateString()}</div>
                  </div>
                )}
                {selectedProject.targetDate && (
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Target Completion</div>
                    <div className="font-semibold text-gray-900">{new Date(selectedProject.targetDate).toLocaleDateString()}</div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mb-8">
              <button
                onClick={() => handlePlanWithAI(selectedProject)}
                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg font-semibold hover:from-teal-700 hover:to-teal-800 transition-all shadow-sm whitespace-nowrap"
              >
                <i className="ri-sparkling-line mr-2"></i>
                {selectedProject.aiSuggested ? 'Update AI Plan' : 'Plan with AI'}
              </button>
              {!selectedProject.handedOffToContractor && (
                <button
                  onClick={() => handleConnectContractor(selectedProject)}
                  className="px-6 py-3 bg-white text-teal-700 border-2 border-teal-600 rounded-lg font-semibold hover:bg-teal-50 transition-all whitespace-nowrap"
                >
                  <i className="ri-user-star-line mr-2"></i>
                  Connect to a contractor
                </button>
              )}
            </div>

            {/* Tasks Checklist */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Tasks Checklist</h3>
              <div className="space-y-2">
                {selectedProject.tasks.map((task) => (
                  <label
                    key={task.id}
                    className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleTask(selectedProject.id, task.id)}
                      className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    />
                    <span className={`flex-1 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.description}
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 text-sm text-gray-600">
                {selectedProject.tasks.filter(t => t.completed).length} of {selectedProject.tasks.length} tasks completed
              </div>
            </div>

            {/* Materials List */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Materials List</h3>
              <div className="bg-gray-50 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Quantity</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Cost</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedProject.materials.map((material) => (
                      <tr key={material.id} className="hover:bg-gray-100 transition-colors">
                        <td className="px-4 py-3 text-gray-900">{material.name}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{material.quantity}</td>
                        <td className="px-4 py-3 text-right font-semibold text-gray-900">${material.estimatedCost}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td className="px-4 py-3 text-gray-900" colSpan={2}>Total Estimated Cost</td>
                      <td className="px-4 py-3 text-right text-gray-900">${selectedProject.totalCost}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Helpful Resources */}
            {selectedProject.resources.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Helpful Resources</h3>
                <div className="space-y-3">
                  {selectedProject.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <i className={`${resource.type === 'guide' ? 'ri-book-open-line' : 'ri-article-line'} text-white text-xl`}></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{resource.title}</h4>
                        <p className="text-sm text-gray-700">{resource.description}</p>
                      </div>
                      <i className="ri-external-link-line text-blue-600 text-xl flex-shrink-0"></i>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">DIY Projects</h2>
          <p className="text-sm sm:text-base text-gray-600">Plan, track, and manage your home improvement projects</p>
        </div>
        <button
          onClick={handleCreateProject}
          className="px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all shadow-sm whitespace-nowrap text-xs sm:text-sm"
        >
          <i className="ri-add-line mr-1.5 sm:mr-2"></i>
          <span className="hidden sm:inline">Create New Project</span>
          <span className="sm:hidden">New Project</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
        <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs sm:text-sm font-medium">Total Projects</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
              <i className="ri-tools-line text-teal-400 text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">{projects.length}</div>
        </div>
        <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs sm:text-sm font-medium">In Progress</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
              <i className="ri-hammer-line text-[#D4B483] text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            {projects.filter(p => p.status === 'In progress').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs sm:text-sm font-medium">Completed</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
              <i className="ri-checkbox-circle-line text-emerald-400 text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            {projects.filter(p => p.status === 'Completed').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#0B1F33] to-[#1a3a5c] rounded-xl p-4 sm:p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-xs sm:text-sm font-medium">Total Investment</span>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/15 rounded-lg flex items-center justify-center">
              <i className="ri-money-dollar-circle-line text-[#D4B483] text-lg sm:text-xl"></i>
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold">
            ${projects.reduce((sum, p) => sum + p.totalCost, 0)}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
        <span className="text-xs sm:text-sm font-medium text-gray-700">Filter by status:</span>
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
          {['all', 'Not started', 'In progress', 'Paused', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                filterStatus === status
                  ? 'bg-teal-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'All Projects' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-12 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-tools-line text-gray-400 text-3xl sm:text-4xl"></i>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No projects found</h3>
          <p className="text-sm sm:text-base text-gray-600 mb-6">Start your first DIY project and track your progress</p>
          <button
            onClick={handleCreateProject}
            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all whitespace-nowrap text-xs sm:text-sm"
          >
            <i className="ri-add-line mr-2"></i>
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all cursor-pointer"
              onClick={() => setSelectedProject(project)}
            >
              {project.photos.length > 0 && (
                <div className="w-full h-40 sm:h-48">
                  <img src={project.photos[0]} alt={project.name} className="w-full h-full object-cover object-top" />
                </div>
              )}
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-xl font-bold text-gray-900 mb-2 line-clamp-2">{project.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-[10px] sm:text-sm font-medium">
                        {project.category}
                      </span>
                      <span className={`px-2 sm:px-3 py-1 rounded-full font-medium border text-[10px] sm:text-sm ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      {project.complexity && (
                        <span className={`text-[10px] sm:text-sm font-semibold ${getComplexityColor(project.complexity)}`}>
                          {project.complexity}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">${project.totalCost}</div>
                    {project.importantForResale && (
                      <span className="inline-flex items-center text-[10px] sm:text-xs text-purple-600 font-medium mt-1">
                        <i className="ri-star-fill mr-1"></i>
                        For resale
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-700 text-xs sm:text-sm mb-3 sm:mb-4 line-clamp-2">{project.description}</p>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 sm:gap-4 text-gray-600">
                    {project.estimatedTime && (
                      <span className="flex items-center gap-1">
                        <i className="ri-time-line"></i>
                        <span className="truncate max-w-[80px] sm:max-w-none">{project.estimatedTime}</span>
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <i className="ri-checkbox-line"></i>
                      {project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks
                    </span>
                  </div>
                  {project.handedOffToContractor && (
                    <span className="text-teal-600 font-medium text-[10px] sm:text-xs whitespace-nowrap">
                      <i className="ri-user-star-line mr-1"></i>
                      <span className="hidden sm:inline">With contractor</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Create New DIY Project</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-2xl text-gray-600"></i>
                </button>
              </div>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Project Name</label>
                  <input
                    type="text"
                    placeholder="e.g., Install Smart Thermostat"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Category</label>
                  <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm">
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea
                    rows={4}
                    placeholder="Describe what you want to accomplish..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                    maxLength={500}
                  ></textarea>
                  <div className="text-xs text-gray-500 mt-1">Maximum 500 characters</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">Target Completion</label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Photos (Optional)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-teal-500 transition-colors cursor-pointer">
                    <i className="ri-image-add-line text-4xl text-gray-400 mb-2"></i>
                    <p className="text-sm text-gray-600">Click to upload inspiration photos</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all whitespace-nowrap"
                  >
                    Create Project
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* AI Plan Modal */}
      {showAIPlanModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <i className="ri-sparkling-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">AI Project Plan</h3>
                    <p className="text-sm text-gray-600">Generated for: {selectedProject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIPlanModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-2xl text-gray-600"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* AI Analysis */}
                <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-6 border border-teal-200">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <i className="ri-lightbulb-line text-teal-600"></i>
                    AI Analysis
                  </h4>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Complexity</div>
                      <div className={`font-bold ${getComplexityColor(selectedProject.complexity)}`}>
                        {selectedProject.complexity || 'Moderate'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Estimated Time</div>
                      <div className="font-bold text-gray-900">{selectedProject.estimatedTime || '2-4 hours'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Estimated Cost</div>
                      <div className="font-bold text-gray-900">${selectedProject.totalCost}</div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Based on your project description, this is a {selectedProject.complexity?.toLowerCase()} level project that requires basic electrical knowledge. 
                    Make sure to turn off power at the breaker before starting. The installation process is straightforward if you follow the manufacturer's instructions carefully.
                  </p>
                </div>

                {/* Suggested Tasks */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Suggested Step-by-Step Tasks</h4>
                  <div className="space-y-2">
                    {selectedProject.tasks.map((task, idx) => (
                      <div key={task.id} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                          {idx + 1}
                        </div>
                        <span className="flex-1 text-gray-900">{task.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Suggested Materials */}
                <div>
                  <h4 className="font-bold text-gray-900 mb-3">Suggested Materials</h4>
                  <div className="bg-gray-50 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Item</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Qty</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Est. Cost</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {selectedProject.materials.map((material) => (
                          <tr key={material.id}>
                            <td className="px-4 py-3 text-gray-900">{material.name}</td>
                            <td className="px-4 py-3 text-center text-gray-700">{material.quantity}</td>
                            <td className="px-4 py-3 text-right font-semibold text-gray-900">${material.estimatedCost}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowAIPlanModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap"
                  >
                    Discard
                  </button>
                  <button
                    onClick={() => {
                      setShowAIPlanModal(false);
                      // In real implementation, this would update the project with AI suggestions
                    }}
                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all whitespace-nowrap"
                  >
                    <i className="ri-check-line mr-2"></i>
                    Accept AI Plan
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Handoff to Contractor Modal */}
      {showHandoffModal && selectedProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-teal-600 rounded-lg flex items-center justify-center">
                    <i className="ri-user-star-line text-white text-2xl"></i>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Connect to a Contractor</h3>
                    <p className="text-sm text-gray-600">Get professional help with: {selectedProject.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowHandoffModal(false)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <i className="ri-close-line text-2xl text-gray-600"></i>
                </button>
              </div>

              <div className="space-y-6">
                {/* Reason Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-3">Why do you need professional help?</label>
                  <div className="space-y-2">
                    {[
                      { value: 'stuck', label: 'I\'m stuck on a particular step', icon: 'ri-question-line' },
                      { value: 'safety', label: 'I\'m worried about safety concerns', icon: 'ri-shield-line' },
                      { value: 'prefer', label: 'I prefer to have a professional handle it', icon: 'ri-user-star-line' },
                      { value: 'time', label: 'I don\'t have enough time', icon: 'ri-time-line' }
                    ].map((reason) => (
                      <label
                        key={reason.value}
                        className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 cursor-pointer transition-all"
                      >
                        <input type="radio" name="reason" value={reason.value} className="w-5 h-5 text-teal-600" />
                        <i className={`${reason.icon} text-xl text-gray-600`}></i>
                        <span className="flex-1 font-medium text-gray-900">{reason.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Additional Notes (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Any specific concerns or requirements..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm resize-none"
                    maxLength={500}
                  ></textarea>
                </div>

                {/* Project Summary */}
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-bold text-gray-900 mb-3">Project Summary to Share</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-semibold text-gray-900">{selectedProject.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-semibold text-gray-900">{selectedProject.category}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Estimated Cost:</span>
                      <span className="font-semibold text-gray-900">${selectedProject.totalCost}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Tasks Completed:</span>
                      <span className="font-semibold text-gray-900">
                        {selectedProject.tasks.filter(t => t.completed).length} of {selectedProject.tasks.length}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <i className="ri-information-line mr-1"></i>
                      Your project details, photos, materials list, and progress will be shared with matched contractors.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={() => setShowHandoffModal(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all whitespace-nowrap"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // In real implementation, this would create a job request
                      setProjects(projects.map(p => 
                        p.id === selectedProject.id 
                          ? { ...p, handedOffToContractor: true, contractorJobId: 'job-123' }
                          : p
                      ));
                      setShowHandoffModal(false);
                      setSelectedProject(null);
                    }}
                    className="flex-1 px-6 py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-all whitespace-nowrap"
                  >
                    <i className="ri-send-plane-line mr-2"></i>
                    Connect to Contractors
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
