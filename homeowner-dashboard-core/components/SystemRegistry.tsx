import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { exportToPDF } from '../../../utils/pdfExport';
import QuickAddWizard, { type QuickSetupResult } from './QuickAddWizard';
import BuildSystemFromDocModal from './BuildSystemFromDocModal';
import SystemGallery from './SystemGallery';
import { getEstimatedLifespan } from '../../../utils/systemLifespans';
import { analyzeDocument, askDocument } from '../../../services/documentAiService';

interface SystemDocument {
  id: string;
  name: string;
  type: 'manual' | 'warranty' | 'receipt' | 'other';
  fileName: string;
  fileSize: string;
  uploadDate: string;
  storagePath: string;
  aiProcessed?: boolean;
  aiInsights?: string[];
}

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // 25 MB (kept under OpenAI's ~32MB PDF ceiling)
const ALLOWED_DOCUMENT_MIME_PREFIXES = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument', 'application/vnd.ms-excel', 'text/plain'];

// PHASE_1_GTM caps — applied to Core + Premium for now; relax on Premium when contractor side resumes
const MAX_SYSTEMS_PER_USER = 5;
const MAX_DOCUMENTS_PER_SYSTEM = 6;

function isAllowedMime(file: File): boolean {
  if (!file.type) return true; // some browsers don't set type for less common extensions; permit
  return ALLOWED_DOCUMENT_MIME_PREFIXES.some(prefix => file.type === prefix || file.type.startsWith(prefix));
}

interface System {
  id: string;
  name: string;
  category: string;
  type: string;
  installYear: number;
  lastService: string;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  warrantyExpiry?: string;
  estimatedLifespan?: number;
  maintenanceSchedule?: string;
  documents?: SystemDocument[];
}

interface AIChatMessage {
  id: string;
  role: 'user' | 'ai';
  text: string;
  timestamp: Date;
}

export default function SystemRegistry() {
  const { user } = useAuth();
  const [systems, setSystems] = useState<System[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  const fetchSystems = useCallback(async () => {
    if (!user) return;

    // Get property ID
    const { data: prop } = await supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .single();

    if (prop) setPropertyId(prop.id);

    const { data } = await supabase
      .from('property_systems')
      .select('*')
      .eq('user_id', user.id)
      .order('category', { ascending: true });

    if (data) {
      const systemIds = data.map(s => s.id);
      const docsBySystem = new Map<string, SystemDocument[]>();
      if (systemIds.length > 0) {
        const { data: docs } = await supabase
          .from('property_system_documents')
          .select('*')
          .in('system_id', systemIds)
          .order('created_at', { ascending: false });
        for (const d of docs || []) {
          const list = docsBySystem.get(d.system_id) || [];
          list.push({
            id: d.id,
            name: d.name,
            type: d.type,
            fileName: d.file_name,
            fileSize: formatFileSize(Number(d.file_size_bytes) || 0),
            uploadDate: d.upload_date,
            storagePath: d.storage_path,
            aiProcessed: d.ai_processed,
            aiInsights: Array.isArray(d.ai_insights) ? d.ai_insights : [],
          });
          docsBySystem.set(d.system_id, list);
        }
      }

      setSystems(data.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        type: s.type || '',
        installYear: s.install_year || new Date().getFullYear(),
        lastService: s.last_service_date || '',
        condition: s.condition || 'good',
        notes: s.notes || undefined,
        // Stored estimate if set, else fall back to the type-based lookup.
        estimatedLifespan: s.estimated_lifespan_years ?? getEstimatedLifespan(s.category, s.type),
        documents: docsBySystem.get(s.id) || [],
      })));
    }
  }, [user]);

  useEffect(() => {
    fetchSystems();
  }, [fetchSystems]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSystem, setSelectedSystem] = useState<System | null>(null);
  const [mainView, setMainView] = useState<'systems' | 'gallery'>('systems');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'age' | 'condition' | 'nextService'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [detailTab, setDetailTab] = useState<'overview' | 'documents'>('overview');
  const [uploadDocType, setUploadDocType] = useState<'manual' | 'warranty' | 'receipt' | 'other'>('manual');
  const [showUploadArea, setShowUploadArea] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aiProcessingId, setAiProcessingId] = useState<string | null>(null);
  const [docFilterType, setDocFilterType] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<System>>({});

  // AI Chat state
  const [aiChatMessages, setAiChatMessages] = useState<AIChatMessage[]>([]);
  const [aiChatInput, setAiChatInput] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Schedule Service Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleOption, setScheduleOption] = useState<'choose' | 'marketplace' | 'favorite'>('choose');
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [serviceNote, setServiceNote] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [scheduleSubmitted, setScheduleSubmitted] = useState(false);
  const [marketplaceSubmitted, setMarketplaceSubmitted] = useState(false);

  // Quick Add Wizard state
  const [showWizard, setShowWizard] = useState(false);

  // Build-from-document state
  const [showBuildFromDoc, setShowBuildFromDoc] = useState(false);

  // Tracks whether the user has manually edited the lifespan, so type-based
  // prefill doesn't clobber their value.
  const [lifespanTouched, setLifespanTouched] = useState(false);

  const [newSystem, setNewSystem] = useState({
    name: '',
    category: '',
    type: '',
    installYear: new Date().getFullYear(),
    lastService: '',
    condition: 'good' as const,
    notes: '',
    warrantyExpiry: '',
    estimatedLifespan: 15,
    maintenanceSchedule: ''
  });

  const categories = [
    { id: 'HVAC', icon: 'ri-temp-cold-line', color: 'bg-blue-50 text-blue-600' },
    { id: 'Plumbing', icon: 'ri-drop-line', color: 'bg-cyan-50 text-cyan-600' },
    { id: 'Electrical', icon: 'ri-flashlight-line', color: 'bg-yellow-50 text-yellow-600' },
    { id: 'Roofing', icon: 'ri-home-4-line', color: 'bg-red-50 text-red-600' },
    { id: 'Exterior', icon: 'ri-building-2-line', color: 'bg-stone-50 text-stone-600' },
    { id: 'Pool & Spa', icon: 'ri-water-flash-line', color: 'bg-sky-50 text-sky-600' },
    { id: 'Landscaping & Irrigation', icon: 'ri-plant-line', color: 'bg-emerald-50 text-emerald-600' },
    { id: 'Windows & Doors', icon: 'ri-door-open-line', color: 'bg-indigo-50 text-indigo-600' },
    { id: 'Kitchen', icon: 'ri-restaurant-line', color: 'bg-orange-50 text-orange-600' },
    { id: 'Laundry', icon: 'ri-shirt-line', color: 'bg-purple-50 text-purple-600' },
    { id: 'Flooring', icon: 'ri-layout-grid-line', color: 'bg-amber-50 text-amber-600' },
    { id: 'Fireplace & Chimney', icon: 'ri-fire-line', color: 'bg-rose-50 text-rose-600' },
    { id: 'Security', icon: 'ri-shield-check-line', color: 'bg-green-50 text-green-600' },
    { id: 'Garage', icon: 'ri-car-line', color: 'bg-gray-50 text-gray-600' },
    { id: 'Septic & Well', icon: 'ri-recycle-line', color: 'bg-lime-50 text-lime-600' },
    { id: 'Fencing & Gates', icon: 'ri-layout-column-line', color: 'bg-warmGray-50 text-zinc-600' },
    { id: 'Driveway & Walkways', icon: 'ri-road-map-line', color: 'bg-neutral-50 text-neutral-600' },
    { id: 'Solar & Energy', icon: 'ri-sun-line', color: 'bg-yellow-50 text-yellow-700' },
    { id: 'Other', icon: 'ri-tools-line', color: 'bg-teal-50 text-teal-600' }
  ];

  const conditionColors = {
    excellent: 'bg-green-50 text-green-700 border-green-200',
    good: 'bg-blue-50 text-blue-700 border-blue-200',
    fair: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    poor: 'bg-red-50 text-red-700 border-red-200'
  };

  const docTypeConfig = {
    manual: { label: 'Manual', icon: 'ri-book-open-line', color: 'bg-blue-50 text-blue-600', borderColor: 'border-blue-200' },
    warranty: { label: 'Warranty', icon: 'ri-shield-check-line', color: 'bg-green-50 text-green-600', borderColor: 'border-green-200' },
    receipt: { label: 'Service Receipt', icon: 'ri-receipt-line', color: 'bg-orange-50 text-orange-600', borderColor: 'border-orange-200' },
    other: { label: 'Other', icon: 'ri-file-line', color: 'bg-gray-50 text-gray-600', borderColor: 'border-gray-200' }
  };

  const handleAddSystem = async () => {
    if (!newSystem.name || !newSystem.category || !newSystem.type || !user) return;
    if (systems.length >= MAX_SYSTEMS_PER_USER) {
      // Cap guard — UI also disables the trigger, this is a defensive check.
      return;
    }

    const { data, error } = await supabase
      .from('property_systems')
      .insert({
        property_id: propertyId,
        user_id: user.id,
        name: newSystem.name,
        category: newSystem.category,
        type: newSystem.type,
        install_year: newSystem.installYear || null,
        last_service_date: newSystem.lastService || null,
        condition: newSystem.condition,
        notes: newSystem.notes || null,
        estimated_lifespan_years: newSystem.estimatedLifespan || null,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error adding system:', error);
      return;
    }

    const system: System = {
      id: data.id,
      ...newSystem,
      documents: []
    };

    setSystems([system, ...systems]);
    setShowAddModal(false);
    setLifespanTouched(false);
    setNewSystem({
      name: '',
      category: '',
      type: '',
      installYear: new Date().getFullYear(),
      lastService: '',
      condition: 'good',
      notes: '',
      warrantyExpiry: '',
      estimatedLifespan: 15,
      maintenanceSchedule: ''
    });
  };

  const getSystemAge = (installYear: number) => {
    return new Date().getFullYear() - installYear;
  };

  const getLifespanPercentage = (system: System) => {
    const age = getSystemAge(system.installYear);
    const lifespan = system.estimatedLifespan || getEstimatedLifespan(system.category, system.type);
    return Math.min((age / lifespan) * 100, 100);
  };

  const getWarrantyStatus = (warrantyExpiry?: string) => {
    if (!warrantyExpiry) return null;
    const expiry = new Date(warrantyExpiry);
    const now = new Date();
    const daysLeft = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: 'expired', text: 'Expired', color: 'text-red-600' };
    if (daysLeft < 90) return { status: 'expiring', text: `${daysLeft} days left`, color: 'text-orange-600' };
    return { status: 'active', text: 'Active', color: 'text-green-600' };
  };

  const filteredSystems = systems.filter(system =>
    filterCategory === 'all' || system.category === filterCategory
  );

  const sortedSystems = [...filteredSystems].sort((a, b) => {
    switch (sortBy) {
      case 'age':
        return getSystemAge(b.installYear) - getSystemAge(a.installYear);
      case 'condition': {
        const conditionOrder = { poor: 0, fair: 1, good: 2, excellent: 3 };
        return conditionOrder[a.condition] - conditionOrder[b.condition];
      }
      case 'nextService':
        return new Date(b.lastService).getTime() - new Date(a.lastService).getTime();
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const handleExport = (format: 'pdf' | 'csv') => {
    setShowExportMenu(false);
    const headerFields = ['Name', 'Category', 'Type', 'Install Year', 'Last Service', 'Condition', 'Warranty', 'Notes'];
    const dataRows = systems.map(s => [
      s.name, s.category, s.type, s.installYear, s.lastService, s.condition, s.warrantyExpiry || '', (s.notes || ''),
    ]);

    if (format === 'csv') {
      const header = headerFields.join(',');
      const rows = dataRows.map(r => r.map(v => `"${String(v).replace(/,/g, ';')}"`).join(','));
      const csv = [header, ...rows].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `home-systems-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      exportToPDF({
        title: 'Systems & Appliances Registry',
        subtitle: 'All major home systems, warranties, and maintenance schedules',
        headers: headerFields,
        rows: dataRows.map(r => r.map(String)),
        summaryLines: [
          `Total Systems: ${systems.length}`,
          `Needs Attention: ${systems.filter(s => s.condition === 'poor' || s.condition === 'fair').length}`,
        ],
        filename: `home-systems-${new Date().toISOString().split('T')[0]}.pdf`,
      });
    }
  };

  const getCategoryStats = () => {
    const stats: { [key: string]: number } = {};
    systems.forEach(system => {
      stats[system.category] = (stats[system.category] || 0) + 1;
    });
    return stats;
  };

  const categoryStats = getCategoryStats();

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || !selectedSystem || !user) return;

    const targetSystemId = selectedSystem.id;
    const docType = uploadDocType;
    const incoming = Array.from(files);

    setUploadError(null);
    let lastError: string | null = null;
    const persisted: SystemDocument[] = [];
    const existingDocCount = selectedSystem.documents?.length || 0;
    let availableSlots = Math.max(0, MAX_DOCUMENTS_PER_SYSTEM - existingDocCount);

    for (const file of incoming) {
      if (availableSlots <= 0) {
        console.warn(`[system-docs] skipping ${file.name} — system at ${MAX_DOCUMENTS_PER_SYSTEM}-document cap`);
        lastError = `This system already has the maximum of ${MAX_DOCUMENTS_PER_SYSTEM} documents. Delete one to add another.`;
        break;
      }
      if (file.size > MAX_DOCUMENT_BYTES) {
        console.warn(`[system-docs] skipping ${file.name} — exceeds 25MB limit`);
        lastError = `"${file.name}" is ${formatFileSize(file.size)} — larger than the 25MB limit.`;
        continue;
      }
      if (!isAllowedMime(file)) {
        console.warn(`[system-docs] skipping ${file.name} — mime type not allowed (${file.type})`);
        lastError = `"${file.name}" isn't a supported type${file.type ? ` (${file.type})` : ''}. Upload a PDF, image, or text file.`;
        continue;
      }

      const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')) : '';
      const tempId = (typeof crypto !== 'undefined' && 'randomUUID' in crypto) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const storagePath = `${user.id}/${targetSystemId}/${tempId}${ext}`;

      const upload = await supabase.storage
        .from('system-documents')
        .upload(storagePath, file, { contentType: file.type || undefined, upsert: false });
      if (upload.error) {
        console.error('[system-docs] upload failed:', upload.error);
        lastError = `Couldn't upload "${file.name}" — ${upload.error.message || 'storage blocked it'}.`;
        continue;
      }

      const isManual = docType === 'manual';
      const insert = await supabase
        .from('property_system_documents')
        .insert({
          system_id: targetSystemId,
          user_id: user.id,
          name: file.name.replace(/\.[^/.]+$/, ''),
          type: docType,
          file_name: file.name,
          file_size_bytes: file.size,
          storage_path: storagePath,
          ai_processed: false,
          ai_insights: [],
        })
        .select('*')
        .single();
      if (insert.error || !insert.data) {
        console.error('[system-docs] insert failed:', insert.error);
        lastError = `Couldn't save "${file.name}" — ${insert.error?.message || 'the database rejected it'}.`;
        await supabase.storage.from('system-documents').remove([storagePath]);
        continue;
      }
      const row = insert.data;
      persisted.push({
        id: row.id,
        name: row.name,
        type: row.type,
        fileName: row.file_name,
        fileSize: formatFileSize(Number(row.file_size_bytes) || 0),
        uploadDate: row.upload_date,
        storagePath: row.storage_path,
        aiProcessed: row.ai_processed,
        aiInsights: isManual ? [] : undefined,
      });
      availableSlots -= 1;
    }

    if (persisted.length === 0) {
      // Surface the specific reason instead of silently closing, so the user
      // knows exactly why nothing saved (size, type, cap, or a save error).
      setUploadError(lastError || 'No documents were saved. Please try again.');
      return;
    }

    const applyDocs = (sys: System): System => ({
      ...sys,
      documents: [...(sys.documents || []), ...persisted],
    });
    setSystems(prev => prev.map(s => (s.id === targetSystemId ? applyDocs(s) : s)));
    setSelectedSystem(prev => (prev && prev.id === targetSystemId ? applyDocs(prev) : prev));
    setShowUploadArea(false);

    // Run real AI analysis on each uploaded document (reads the file server-side,
    // extracts key content, and stores genuine insights + text for the chat).
    for (const pdoc of persisted) {
      setAiProcessingId(pdoc.id);
      try {
        const result = await analyzeDocument(pdoc.id);
        const insights = result.insights || [];
        const applyInsights = (sys: System): System => ({
          ...sys,
          documents: sys.documents?.map(d =>
            d.id === pdoc.id ? { ...d, aiProcessed: true, aiInsights: insights } : d,
          ),
        });
        setSystems(prev => prev.map(s => (s.id === targetSystemId ? applyInsights(s) : s)));
        setSelectedSystem(prev => (prev && prev.id === targetSystemId ? applyInsights(prev) : prev));
      } catch (err) {
        console.error('[system-docs] AI analysis failed:', err);
        // Leave the document un-processed; the user can retry by re-uploading.
      }
    }
    setAiProcessingId(null);
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!selectedSystem) return;
    const doc = selectedSystem.documents?.find(d => d.id === docId);

    const targetSystemId = selectedSystem.id;
    const removeDoc = (sys: System): System => ({
      ...sys,
      documents: sys.documents?.filter(d => d.id !== docId) || [],
    });
    setSystems(prev => prev.map(s => (s.id === targetSystemId ? removeDoc(s) : s)));
    setSelectedSystem(prev => (prev && prev.id === targetSystemId ? removeDoc(prev) : prev));

    const { error: dbError } = await supabase
      .from('property_system_documents')
      .delete()
      .eq('id', docId);
    if (dbError) {
      console.error('[system-docs] delete failed:', dbError);
      return;
    }
    if (doc?.storagePath) {
      const { error: storageError } = await supabase.storage
        .from('system-documents')
        .remove([doc.storagePath]);
      if (storageError) console.error('[system-docs] storage cleanup failed:', storageError);
    }
  };

  const getFilteredDocs = () => {
    if (!selectedSystem?.documents) return [];
    if (docFilterType === 'all') return selectedSystem.documents;
    return selectedSystem.documents.filter(d => d.type === docFilterType);
  };

  const getDocCountByType = (type: string) => {
    if (!selectedSystem?.documents) return 0;
    if (type === 'all') return selectedSystem.documents.length;
    return selectedSystem.documents.filter(d => d.type === type).length;
  };

  const openDetail = (system: System) => {
    setSelectedSystem(system);
    setDetailTab('overview');
    setShowUploadArea(false);
    setDocFilterType('all');
    setIsEditing(false);
    setEditForm({});
    setAiChatMessages([]);
    setAiChatInput('');
    setShowAiChat(false);
    setShowDetailModal(true);
    setShowScheduleModal(false);
  };

  const startEditing = () => {
    if (!selectedSystem) return;
    setEditForm({
      name: selectedSystem.name,
      category: selectedSystem.category,
      type: selectedSystem.type,
      installYear: selectedSystem.installYear,
      lastService: selectedSystem.lastService,
      condition: selectedSystem.condition,
      notes: selectedSystem.notes || '',
      warrantyExpiry: selectedSystem.warrantyExpiry || '',
      estimatedLifespan: selectedSystem.estimatedLifespan || 15,
      maintenanceSchedule: selectedSystem.maintenanceSchedule || ''
    });
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const saveEditing = async () => {
    if (!selectedSystem || !editForm.name || !editForm.type) return;
    const updatedSystem: System = {
      ...selectedSystem,
      name: editForm.name || selectedSystem.name,
      category: editForm.category || selectedSystem.category,
      type: editForm.type || selectedSystem.type,
      installYear: editForm.installYear || selectedSystem.installYear,
      lastService: editForm.lastService || selectedSystem.lastService,
      condition: editForm.condition || selectedSystem.condition,
      notes: editForm.notes,
      warrantyExpiry: editForm.warrantyExpiry,
      estimatedLifespan: editForm.estimatedLifespan,
      maintenanceSchedule: editForm.maintenanceSchedule
    };

    await supabase
      .from('property_systems')
      .update({
        name: updatedSystem.name,
        category: updatedSystem.category,
        type: updatedSystem.type,
        install_year: updatedSystem.installYear || null,
        last_service_date: updatedSystem.lastService || null,
        condition: updatedSystem.condition,
        notes: updatedSystem.notes || null,
        estimated_lifespan_years: updatedSystem.estimatedLifespan || null,
      })
      .eq('id', selectedSystem.id);

    setSystems(prev => prev.map(s => (s.id === selectedSystem.id ? updatedSystem : s)));
    setSelectedSystem(updatedSystem);
    setIsEditing(false);
    setEditForm({});
  };

  const handleDeleteSystem = async () => {
    if (!selectedSystem) return;
    await supabase
      .from('property_systems')
      .delete()
      .eq('id', selectedSystem.id);

    setSystems(prev => prev.filter(s => s.id !== selectedSystem.id));
    setShowDetailModal(false);
    setSelectedSystem(null);
  };

  const handleAiChatSend = async () => {
    if (!aiChatInput.trim() || aiChatLoading || !selectedSystem) return;

    const question = aiChatInput.trim();
    const userMsg: AIChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: question,
      timestamp: new Date()
    };

    setAiChatMessages(prev => [...prev, userMsg]);
    setAiChatInput('');
    setAiChatLoading(true);

    try {
      const answer = await askDocument(selectedSystem.id, question);
      setAiChatMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        text: answer || "I couldn't find an answer to that. Try uploading the owner's manual or warranty for this system.",
        timestamp: new Date(),
      }]);
    } catch (err) {
      console.error('[system-docs] AI chat failed:', err);
      setAiChatMessages(prev => [...prev, {
        id: `msg-${Date.now()}-ai`,
        role: 'ai',
        text: "Sorry — I couldn't reach the AI assistant just now. Please try again in a moment.",
        timestamp: new Date(),
      }]);
    } finally {
      setAiChatLoading(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const openScheduleService = () => {
    setScheduleOption('choose');
    setSelectedContractor(null);
    setServiceNote('');
    setPreferredDate('');
    setPreferredTime('');
    setScheduleSubmitted(false);
    setMarketplaceSubmitted(false);
    setShowScheduleModal(true);
  };

  const handleMarketplacePost = () => {
    setMarketplaceSubmitted(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setShowDetailModal(false);
    }, 2000);
  };

  const handleDirectSchedule = () => {
    if (!selectedContractor || !preferredDate) return;
    setScheduleSubmitted(true);
    setTimeout(() => {
      setShowScheduleModal(false);
      setShowDetailModal(false);
    }, 2500);
  };

  const getRelevantContractors = () => {
    if (!selectedSystem) return favoriteContractors;
    const systemCat = selectedSystem.category;
    const catToSpecialty: Record<string, string[]> = {
      'HVAC': ['HVAC'],
      'Plumbing': ['Plumbing'],
      'Electrical': ['Electrical'],
      'Roofing': ['Roofing'],
      'Exterior': ['Roofing', 'Plumbing'],
      'Pool & Spa': ['Plumbing'],
      'Landscaping & Irrigation': ['Plumbing'],
      'Windows & Doors': ['Roofing'],
      'Kitchen': ['Plumbing', 'Electrical'],
      'Laundry': ['Plumbing', 'Electrical'],
      'Flooring': [],
      'Fireplace & Chimney': ['HVAC'],
      'Security': ['Electrical'],
      'Garage': ['Electrical'],
      'Septic & Well': ['Plumbing'],
      'Fencing & Gates': [],
      'Driveway & Walkways': [],
      'Solar & Energy': ['Electrical'],
      'Other': []
    };
    const relevant = catToSpecialty[systemCat] || [];
    const matched = favoriteContractors.filter(c => relevant.includes(c.specialty));
    const others = favoriteContractors.filter(c => !relevant.includes(c.specialty));
    return [...matched, ...others];
  };

  const favoriteContractors = [
    {
      id: 'fav-1',
      name: 'Elite Plumbing Solutions',
      specialty: 'Plumbing',
      rating: 4.9,
      reviews: 247,
      image: 'https://readdy.ai/api/search-image?query=Professional%20plumber%20headshot%20portrait%20clean%20uniform%20friendly%20smile%20neutral%20studio%20background&width=100&height=100&seq=fav-contractor-001&orientation=squarish',
      lastHired: '2024-09-15',
      jobsDone: 3,
      responseTime: '~30 min',
      availability: 'Available Today'
    },
    {
      id: 'fav-2',
      name: 'Bright Spark Electrical',
      specialty: 'Electrical',
      rating: 4.8,
      reviews: 189,
      image: 'https://readdy.ai/api/search-image?query=Professional%20electrician%20headshot%20portrait%20clean%20uniform%20confident%20expression%20neutral%20studio%20background&width=100&height=100&seq=fav-contractor-002&orientation=squarish',
      lastHired: '2024-07-22',
      jobsDone: 2,
      responseTime: '~1 hour',
      availability: 'Available Tomorrow'
    },
    {
      id: 'fav-3',
      name: 'Precision HVAC Services',
      specialty: 'HVAC',
      rating: 4.9,
      reviews: 312,
      image: 'https://readdy.ai/api/search-image?query=Professional%20HVAC%20technician%20headshot%20portrait%20clean%20uniform%20warm%20smile%20neutral%20studio%20background&width=100&height=100&seq=fav-contractor-003&orientation=squarish',
      lastHired: '2024-10-01',
      jobsDone: 4,
      responseTime: '~45 min',
      availability: 'Available Today'
    },
    {
      id: 'fav-4',
      name: 'Precision Roofing Co',
      specialty: 'Roofing',
      rating: 4.9,
      reviews: 198,
      image: 'https://readdy.ai/api/search-image?query=Professional%20roofing%20contractor%20headshot%20portrait%20safety%20gear%20friendly%20expression%20neutral%20studio%20background&width=100&height=100&seq=fav-contractor-004&orientation=squarish',
      lastHired: '2024-05-10',
      jobsDone: 1,
      responseTime: '~1.5 hours',
      availability: 'Available This Week'
    }
  ];

  const handleWizardComplete = async (result: QuickSetupResult) => {
    if (!user) {
      setShowWizard(false);
      return;
    }

    // 1) Persist Step-1 property basics + the denormalized headline systems
    //    (only fields the user actually answered, so we never null out existing data).
    const propUpdate = Object.fromEntries(
      Object.entries(result.property).filter(([, v]) => v !== undefined && v !== null && v !== ''),
    );
    if (Object.keys(propUpdate).length > 0) {
      const { error: propErr } = await supabase
        .from('properties')
        .update(propUpdate)
        .eq('user_id', user.id);
      if (propErr) console.error('Quick Setup: failed to update property', propErr);
    }

    // 2) Insert every selected system/feature/appliance. Onboarding intentionally
    //    bypasses MAX_SYSTEMS_PER_USER (the cap still applies to manual "Add System").
    if (result.systems.length > 0) {
      const rows = result.systems.map(s => ({
        property_id: propertyId,
        user_id: user.id,
        name: s.name,
        category: s.category,
        type: s.type || null,
        install_year: s.installYear || null,
        last_service_date: null,
        condition: s.condition,
        notes: s.notes || null,
        estimated_lifespan_years: s.estimatedLifespan || null,
      }));
      const { error: sysErr } = await supabase.from('property_systems').insert(rows);
      if (sysErr) console.error('Quick Setup: failed to add systems', sysErr);
    }

    // 3) Reload from the DB so the registry shows the persisted rows (with real IDs).
    await fetchSystems();
    setShowWizard(false);
  };

  const handleWizardSkip = () => {
    setShowWizard(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-6">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0B1F33] mb-1">Systems Profile</h2>
          <p className="text-xs sm:text-sm text-[#6B7C8F]">Everything in your home, tracked and maintained</p>
        </div>
        {/* Keep all four actions on a single row from sm up; only phones may wrap. */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm font-semibold text-[#0B1F33] hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              <i className="ri-download-line"></i>
              Export
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => handleExport('pdf')}
                  className="w-full px-4 py-2 text-left text-sm text-[#0B1F33] hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                >
                  <i className="ri-file-pdf-line text-red-600"></i>
                  Export as PDF
                </button>
                <button
                  onClick={() => handleExport('csv')}
                  className="w-full px-4 py-2 text-left text-sm text-[#0B1F33] hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                >
                  <i className="ri-file-excel-line text-green-600"></i>
                  Export as CSV
                </button>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowBuildFromDoc(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border-2 border-[#D4B483]/60 bg-[#D4B483]/10 text-[#0B1F33] rounded-lg text-xs sm:text-sm font-semibold hover:bg-[#D4B483]/20 transition-colors cursor-pointer whitespace-nowrap"
          >
            <i className="ri-sparkling-2-line"></i>
            <span className="hidden sm:inline">Build from Document</span>
            <span className="sm:hidden">From Doc</span>
          </button>
          <button
            onClick={() => setShowWizard(true)}
            disabled={systems.length >= MAX_SYSTEMS_PER_USER}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 border-2 border-teal-200 bg-teal-50 text-teal-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-teal-100 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-50"
            title={systems.length >= MAX_SYSTEMS_PER_USER ? `Limit reached (${MAX_SYSTEMS_PER_USER} systems)` : undefined}
          >
            <i className="ri-magic-line"></i>
            <span className="hidden sm:inline">Quick Setup</span>
            <span className="sm:hidden">Setup</span>
          </button>
          <button
            onClick={() => { setLifespanTouched(false); setShowAddModal(true); }}
            disabled={systems.length >= MAX_SYSTEMS_PER_USER}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-teal-600"
            title={systems.length >= MAX_SYSTEMS_PER_USER ? `Limit reached (${MAX_SYSTEMS_PER_USER} systems)` : undefined}
          >
            <i className="ri-add-line"></i>
            <span className="hidden sm:inline">Add System</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Systems / Gallery view toggle */}
      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
        <button
          onClick={() => setMainView('systems')}
          className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap ${
            mainView === 'systems' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
          }`}
        >
          <i className="ri-tools-line mr-1.5"></i>Systems
        </button>
        <button
          onClick={() => setMainView('gallery')}
          className={`px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors whitespace-nowrap ${
            mainView === 'gallery' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
          }`}
        >
          <i className="ri-gallery-line mr-1.5"></i>Gallery
        </button>
      </div>

      {mainView === 'gallery' && (
        <SystemGallery systems={systems} userId={user?.id ?? null} />
      )}

      {mainView === 'systems' && (
      <>
      {/* Systems cap banner */}
      {systems.length >= MAX_SYSTEMS_PER_USER && (
        <div className="mb-4 sm:mb-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <i className="ri-information-line text-amber-600 text-lg mt-0.5"></i>
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-semibold text-amber-900">You've reached the {MAX_SYSTEMS_PER_USER}-system limit.</p>
            <p className="text-amber-800">Remove a system to add another. Higher limits are coming soon.</p>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-tools-fill text-xl sm:text-2xl text-blue-600"></i>
            <span className="text-xl sm:text-2xl font-bold text-blue-900">{systems.length}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B7C8F]">Total Systems</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-shield-check-line text-xl sm:text-2xl text-green-600"></i>
            <span className="text-xl sm:text-2xl font-bold text-green-900">
              {systems.filter(s => s.warrantyExpiry && new Date(s.warrantyExpiry) > new Date()).length}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-green-700">Under Warranty</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-alert-line text-xl sm:text-2xl text-orange-600"></i>
            <span className="text-xl sm:text-2xl font-bold text-orange-900">
              {systems.filter(s => {
                const age = getSystemAge(s.installYear);
                const lifespan = s.estimatedLifespan || 15;
                return age / lifespan > 0.75;
              }).length}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-orange-700">Aging Systems</p>
        </div>
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <i className="ri-file-text-line text-xl sm:text-2xl text-teal-600"></i>
            <span className="text-xl sm:text-2xl font-bold text-teal-900">
              {systems.reduce((acc, s) => acc + (s.documents?.length || 0), 0)}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-semibold text-teal-700">Documents</p>
        </div>
      </div>

      {/* Filters and View Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 pb-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs sm:text-sm font-semibold text-[#6B7C8F]">Category:</label>
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-[#0B1F33] cursor-pointer"
            >
              <option value="all">All ({systems.length})</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.id} ({categoryStats[cat.id] || 0})
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <label className="text-xs sm:text-sm font-semibold text-[#6B7C8F]">Sort by:</label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-2 sm:px-3 py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-[#0B1F33] cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="age">Age (Oldest First)</option>
              <option value="condition">Condition (Worst First)</option>
              <option value="nextService">Last Service</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
              viewMode === 'grid' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
            }`}
          >
            <i className="ri-grid-line"></i>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
              viewMode === 'list' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
            }`}
          >
            <i className="ri-list-check"></i>
          </button>
        </div>
      </div>

      {/* Systems Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {sortedSystems.map(system => {
            const age = getSystemAge(system.installYear);
            const lifespanPercent = getLifespanPercentage(system);
            const warrantyStatus = getWarrantyStatus(system.warrantyExpiry);
            const categoryInfo = categories.find(c => c.id === system.category);
            const docCount = system.documents?.length || 0;

            return (
              <div
                key={system.id}
                onClick={() => openDetail(system)}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${categoryInfo?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${categoryInfo?.icon} text-lg sm:text-xl`}></i>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    {docCount > 0 && (
                      <span className="flex items-center gap-1 px-1.5 sm:px-2 py-0.5 bg-gray-50 rounded-md text-[10px] sm:text-xs text-[#6B7C8F]">
                        <i className="ri-file-text-line text-[10px] sm:text-xs"></i>
                        {docCount}
                      </span>
                    )}
                    <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold border ${conditionColors[system.condition]}`}>
                      {system.condition}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-[#0B1F33] mb-1 text-sm sm:text-base line-clamp-2">{system.name}</h3>
                <p className="text-xs sm:text-sm text-[#6B7C8F] mb-3 truncate">{system.type}</p>

                {/* Lifespan Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] sm:text-xs text-[#6B7C8F]">Lifespan</span>
                    <span className="text-[10px] sm:text-xs font-bold text-[#0B1F33]">{age} / {system.estimatedLifespan || 15} years</span>
                  </div>
                  <div className="w-full h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        lifespanPercent < 50 ? 'bg-green-500' :
                          lifespanPercent < 75 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${lifespanPercent}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-xs">
                  <div className="flex items-center gap-1 text-[#6B7C8F]">
                    <i className="ri-calendar-line"></i>
                    <span>Installed {system.installYear}</span>
                  </div>
                  {warrantyStatus && (
                    <div className={`flex items-center gap-1 font-semibold ${warrantyStatus.color}`}>
                      <i className="ri-shield-check-line"></i>
                      <span className="truncate max-w-[80px] sm:max-w-none">{warrantyStatus.text}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {sortedSystems.map(system => {
            const age = getSystemAge(system.installYear);
            const lifespanPercent = getLifespanPercentage(system);
            const warrantyStatus = getWarrantyStatus(system.warrantyExpiry);
            const categoryInfo = categories.find(c => c.id === system.category);
            const docCount = system.documents?.length || 0;

            return (
              <div
                key={system.id}
                onClick={() => openDetail(system)}
                className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${categoryInfo?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${categoryInfo?.icon} text-lg sm:text-xl`}></i>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                      <h3 className="font-bold text-[#0B1F33] text-sm sm:text-base truncate">{system.name}</h3>
                      <span className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md text-[10px] sm:text-xs font-bold border ${conditionColors[system.condition]}`}>
                        {system.condition}
                      </span>
                      {warrantyStatus && (
                        <div className={`flex items-center gap-1 text-[10px] sm:text-xs font-semibold ${warrantyStatus.color}`}>
                          <i className="ri-shield-check-line"></i>
                          <span className="hidden sm:inline">{warrantyStatus.text}</span>
                        </div>
                      )}
                      {docCount > 0 && (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[10px] sm:text-xs font-semibold flex-shrink-0">
                          <i className="ri-file-text-line text-[10px]"></i>
                          {docCount} docs
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-6 text-xs sm:text-sm text-[#6B7C8F]">
                      <span className="truncate max-w-[120px] sm:max-w-none">{system.type}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="truncate">{system.category}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="whitespace-nowrap">Installed {system.installYear} ({age} years old)</span>
                      {system.maintenanceSchedule && (
                        <>
                          <span className="hidden lg:inline">•</span>
                          <span className="hidden lg:inline">Maintenance: {system.maintenanceSchedule}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="hidden sm:block w-32 lg:w-48 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] sm:text-xs text-[#6B7C8F]">Lifespan</span>
                      <span className="text-[10px] sm:text-xs font-bold text-[#0B1F33]">{age} / {system.estimatedLifespan || 15} years</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          lifespanPercent < 50 ? 'bg-green-500' :
                            lifespanPercent < 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${lifespanPercent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* AI Recommendations */}
      <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 border border-teal-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-lightbulb-flash-line text-white text-2xl"></i>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
              Smart Recommendations
              <span className="px-2 py-0.5 bg-teal-600 text-white text-xs font-bold rounded-full">AI</span>
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-alert-line text-orange-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B1F33] mb-1">
                    Water Heater Approaching End of Life
                  </p>
                  <p className="text-sm text-[#6B7C8F] mb-2">
                    Your water heater is 4 years old (33% of expected lifespan). Consider budgeting for replacement in 6-8 years.
                  </p>
                  <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap">
                    Get Replacement Quotes →
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-book-open-line text-blue-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B1F33] mb-1">
                    AI Learned from Your AC Manual
                  </p>
                  <p className="text-sm text-[#6B7C8F] mb-2">
                    Based on your Carrier 24ACC6 manual, filter replacement is recommended every 60-90 days. Your last service was 3 months ago — time to check the filter.
                  </p>
                  <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap">
                    View Manual Insights →
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <i className="ri-money-dollar-circle-line text-green-600 text-sm"></i>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#0B1F33] mb-1">
                    Warranty Expiring Soon
                  </p>
                  <p className="text-sm text-[#6B7C8F] mb-2">
                    Your sump pump warranty expires in 45 days. Schedule an inspection to identify any issues before coverage ends.
                  </p>
                  <button className="text-sm font-semibold text-teal-600 hover:text-teal-700 cursor-pointer whitespace-nowrap">
                    Schedule Inspection →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </>
      )}

      {/* Add System Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">Add New System</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
              </button>
            </div>
            <div className="p-4 sm:p-6">
              {/* Category Selection */}
              <div className="mb-5 sm:mb-6">
                <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-3">
                  Category <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setNewSystem(s => ({
                        ...s,
                        category: cat.id,
                        estimatedLifespan: lifespanTouched ? s.estimatedLifespan : getEstimatedLifespan(cat.id, s.type),
                      }))}
                      className={`p-3 sm:p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        newSystem.category === cat.id
                          ? 'border-teal-600 bg-teal-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 ${cat.color} rounded-lg flex items-center justify-center mx-auto mb-1.5 sm:mb-2`}>
                        <i className={`${cat.icon} text-lg sm:text-xl`}></i>
                      </div>
                      <p className="text-[10px] sm:text-sm font-semibold text-[#0B1F33] text-center line-clamp-2">{cat.id}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-5 sm:mb-6">
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">
                    System Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSystem.name}
                    onChange={e => setNewSystem({ ...newSystem, name: e.target.value })}
                    placeholder="e.g., Central AC Unit"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">
                    Type/Model <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newSystem.type}
                    onChange={e => setNewSystem(s => ({
                      ...s,
                      type: e.target.value,
                      estimatedLifespan: lifespanTouched ? s.estimatedLifespan : getEstimatedLifespan(s.category, e.target.value),
                    }))}
                    placeholder="e.g., Carrier 24ACC6"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Install Year</label>
                  <input
                    type="number"
                    value={newSystem.installYear}
                    onChange={e => setNewSystem({ ...newSystem, installYear: parseInt(e.target.value) })}
                    min="1900"
                    max={new Date().getFullYear()}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Estimated Lifespan (years)</label>
                  <input
                    type="number"
                    value={newSystem.estimatedLifespan}
                    onChange={e => { setLifespanTouched(true); setNewSystem({ ...newSystem, estimatedLifespan: parseInt(e.target.value) }); }}
                    min="1"
                    max="100"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Last Service Date</label>
                  <input
                    type="date"
                    value={newSystem.lastService}
                    onChange={e => setNewSystem({ ...newSystem, lastService: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Warranty Expiry Date</label>
                  <input
                    type="date"
                    value={newSystem.warrantyExpiry}
                    onChange={e => setNewSystem({ ...newSystem, warrantyExpiry: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Condition</label>
                  <select
                    value={newSystem.condition}
                    onChange={e => setNewSystem({ ...newSystem, condition: e.target.value as any })}
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm cursor-pointer"
                  >
                    <option value="excellent">Excellent</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Maintenance Schedule</label>
                  <input
                    type="text"
                    value={newSystem.maintenanceSchedule}
                    onChange={e => setNewSystem({ ...newSystem, maintenanceSchedule: e.target.value })}
                    placeholder="e.g., Twice yearly"
                    className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm"
                  />
                </div>
              </div>

              <div className="mb-5 sm:mb-6">
                <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Notes</label>
                <textarea
                  value={newSystem.notes}
                  onChange={e => setNewSystem({ ...newSystem, notes: e.target.value })}
                  placeholder="Additional information about this system..."
                  rows={3}
                  maxLength={500}
                  className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 rounded-lg font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSystem}
                  className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                >
                  Add System
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal with Tabs */}
      {showDetailModal && selectedSystem && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 z-10">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 ${categories.find(c => c.id === selectedSystem.category)?.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <i className={`${categories.find(c => c.id === selectedSystem.category)?.icon} text-xl sm:text-2xl`}></i>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base sm:text-xl font-bold text-[#0B1F33] truncate">{selectedSystem.name}</h3>
                    <p className="text-xs sm:text-sm text-[#6B7C8F] truncate">{selectedSystem.type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
                </button>
              </div>
              {/* Tabs */}
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => { setDetailTab('overview'); setIsEditing(false); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                    detailTab === 'overview' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F] hover:text-[#0B1F33]'
                  }`}
                >
                  <i className="ri-information-line"></i>
                  <span className="hidden sm:inline">Overview</span>
                </button>
                <button
                  onClick={() => { setDetailTab('documents'); setIsEditing(false); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                    detailTab === 'documents' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F] hover:text-[#0B1F33]'
                  }`}
                >
                  <i className="ri-file-text-line"></i>
                  <span className="hidden sm:inline">Documents</span>
                  {(selectedSystem.documents?.length || 0) > 0 && (
                    <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] sm:text-xs font-bold rounded-full">
                      {selectedSystem.documents?.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {/* Overview Tab */}
              {detailTab === 'overview' && !isEditing && (
                <>
                  {/* Status Cards */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-5 sm:mb-6">
                    <div className="bg-gray-50 rounded-lg p-2.5 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1">Condition</p>
                      <p className={`text-sm sm:text-lg font-bold capitalize ${
                        selectedSystem.condition === 'excellent' ? 'text-green-600' :
                          selectedSystem.condition === 'good' ? 'text-blue-600' :
                            selectedSystem.condition === 'fair' ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {selectedSystem.condition}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1">Age</p>
                      <p className="text-sm sm:text-lg font-bold text-[#0B1F33]">
                        {getSystemAge(selectedSystem.installYear)} years
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2.5 sm:p-4">
                      <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-1">Warranty</p>
                      <p className={`text-sm sm:text-lg font-bold truncate ${getWarrantyStatus(selectedSystem.warrantyExpiry)?.color || 'text-gray-400'}`}>
                        {getWarrantyStatus(selectedSystem.warrantyExpiry)?.text || 'None'}
                      </p>
                    </div>
                  </div>

                  {/* Lifespan Progress */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-[#6B7C8F]">Lifespan</span>
                      <span className="text-sm font-bold text-[#0B1F33]">
                        {getSystemAge(selectedSystem.installYear)} / {selectedSystem.estimatedLifespan || 15} years
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          getLifespanPercentage(selectedSystem) < 50 ? 'bg-green-500' :
                            getLifespanPercentage(selectedSystem) < 75 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${getLifespanPercentage(selectedSystem)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#6B7C8F]">
                      {getLifespanPercentage(selectedSystem) < 50 ? 'System is in early life stage' :
                        getLifespanPercentage(selectedSystem) < 75 ? 'System is in mid-life stage' :
                          'System is approaching end of expected lifespan'}
                    </p>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#6B7C8F] mb-1">Category</p>
                      <p className="text-sm sm:text-lg text-[#0B1F33]">{selectedSystem.category}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#6B7C8F] mb-1">Install Year</p>
                      <p className="text-sm sm:text-lg text-[#0B1F33]">{selectedSystem.installYear}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#6B7C8F] mb-1">Last Service</p>
                      <p className="text-sm sm:text-lg text-[#0B1F33]">
                        {selectedSystem.lastService ? new Date(selectedSystem.lastService).toLocaleDateString() : 'Not recorded'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-[#6B7C8F] mb-1">Maintenance Schedule</p>
                      <p className="text-sm sm:text-lg text-[#0B1F33]">{selectedSystem.maintenanceSchedule || 'Not set'}</p>
                    </div>
                    {selectedSystem.warrantyExpiry && (
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-[#6B7C8F] mb-1">Warranty Expiry</p>
                        <p className="text-sm sm:text-lg text-[#0B1F33]">
                          {new Date(selectedSystem.warrantyExpiry).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedSystem.notes && (
                    <div className="bg-blue-50 rounded-lg p-4 mb-6">
                      <p className="text-xs sm:text-sm font-bold text-[#0B1F33] mb-1">Notes</p>
                      <p className="text-sm sm:text-lg text-[#6B7C8F]">{selectedSystem.notes}</p>
                    </div>
                  )}

                  {/* AI Insights */}
                  {selectedSystem.documents?.some(d => d.aiProcessed && d.aiInsights?.length) && (
                    <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-brain-line text-white text-lg"></i>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
                            AI Insights from Your Manuals
                            <span className="px-2 py-0.5 bg-teal-600/30 text-teal-300 text-xs font-bold rounded-full">AI</span>
                          </p>
                          <p className="text-xs text-[#6B7C8F] mt-0.5">
                            {selectedSystem.documents?.filter(d => d.aiProcessed).length} manual(s) processed •{' '}
                            {selectedSystem.documents?.filter(d => d.aiProcessed).reduce((acc, d) => acc + (d.aiInsights?.length || 0), 0)} insights extracted •{' '}
                            Powering personalized recommendations
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={openScheduleService}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      <i className="ri-calendar-check-line"></i>
                      Schedule Service
                    </button>
                    <button
                      onClick={startEditing}
                      className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-200 rounded-lg font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      <i className="ri-edit-line"></i>
                      <span className="hidden sm:inline">Edit Details</span>
                      <span className="sm:hidden">Edit</span>
                    </button>
                    <button
                      onClick={handleDeleteSystem}
                      className="sm:flex-initial px-3 sm:px-4 py-2.5 sm:py-3 border border-red-200 rounded-lg font-semibold text-red-600 hover:bg-red-50 cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      <i className="ri-delete-bin-line"></i>
                      <span className="hidden sm:inline ml-1.5">Delete</span>
                    </button>
                  </div>
                </>
              )}

              {/* Edit Mode */}
              {detailTab === 'overview' && isEditing && (
                <>
                  <div className="flex items-center gap-2 mb-4 sm:mb-5 pb-4 border-b border-gray-200">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                      <i className="ri-edit-line text-teal-600 text-sm sm:text-base"></i>
                    </div>
                    <h4 className="font-bold text-[#0B1F33] text-sm sm:text-base">Edit System Details</h4>
                  </div>

                  {/* Category Selection */}
                  <div className="mb-4 sm:mb-5">
                    <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-3">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setEditForm({ ...editForm, category: cat.id })}
                          className={`p-2 sm:p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            editForm.category === cat.id
                              ? 'border-teal-600 bg-teal-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-7 h-7 sm:w-8 sm:h-8 ${cat.color} rounded-lg flex items-center justify-center mx-auto mb-1`}>
                            <i className={`${cat.icon} text-base sm:text-lg`}></i>
                          </div>
                          <p className="text-[10px] sm:text-xs font-semibold text-[#0B1F33] text-center line-clamp-2">{cat.id}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Edit Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">
                        System Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">
                        Type/Model <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editForm.type || ''}
                        onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Install Year</label>
                      <input
                        type="number"
                        value={editForm.installYear || ''}
                        onChange={e => setEditForm({ ...editForm, installYear: parseInt(e.target.value) })}
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Estimated Lifespan (years)</label>
                      <input
                        type="number"
                        value={editForm.estimatedLifespan || ''}
                        onChange={e => setEditForm({ ...editForm, estimatedLifespan: parseInt(e.target.value) })}
                        min="1"
                        max="100"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Last Service Date</label>
                      <input
                        type="date"
                        value={editForm.lastService || ''}
                        onChange={e => setEditForm({ ...editForm, lastService: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Warranty Expiry Date</label>
                      <input
                        type="date"
                        value={editForm.warrantyExpiry || ''}
                        onChange={e => setEditForm({ ...editForm, warrantyExpiry: e.target.value })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Condition</label>
                      <select
                        value={editForm.condition || 'good'}
                        onChange={e => setEditForm({ ...editForm, condition: e.target.value as System['condition'] })}
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm cursor-pointer focus:outline-none focus:border-teal-500"
                      >
                        <option value="excellent">Excellent</option>
                        <option value="good">Good</option>
                        <option value="fair">Fair</option>
                        <option value="poor">Poor</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Maintenance Schedule</label>
                      <input
                        type="text"
                        value={editForm.maintenanceSchedule || ''}
                        onChange={e => setEditForm({ ...editForm, maintenanceSchedule: e.target.value })}
                        placeholder="e.g., Twice yearly"
                        className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm focus:outline-none focus:border-teal-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4 sm:mb-5">
                    <label className="block text-xs sm:text-sm font-bold text-[#0B1F33] mb-2">Notes</label>
                    <textarea
                      value={editForm.notes || ''}
                      onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                      placeholder="Additional information about this system..."
                      rows={3}
                      maxLength={500}
                      className="w-full px-3 sm:px-4 py-2 border border-gray-200 rounded-lg text-xs sm:text-sm resize-none focus:outline-none focus:border-teal-500"
                    ></textarea>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                    <button
                      onClick={cancelEditing}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-200 rounded-lg font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEditing}
                      className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    >
                      <i className="ri-check-line"></i>
                      Save Changes
                    </button>
                  </div>
                </>
              )}

              {/* Documents Tab */}
              {detailTab === 'documents' && (
                <>
                  {/* Document Type Filter */}
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-4 flex-wrap overflow-x-auto pb-1 sm:pb-0 -mx-1 px-1 sm:mx-0 sm:px-0 scrollbar-hide">
                    {(['all', 'manual', 'warranty', 'receipt', 'other'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setDocFilterType(type)}
                        className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-semibold cursor-pointer transition-colors whitespace-nowrap ${
                          docFilterType === type
                            ? 'bg-teal-600 text-white'
                            : 'bg-gray-100 text-[#6B7C8F] hover:bg-gray-200'
                        }`}
                      >
                        {type === 'all' ? 'All' : docTypeConfig[type].label}
                        <span className="ml-1 opacity-80">({getDocCountByType(type)})</span>
                      </button>
                    ))}
                  </div>

                  {/* Upload Area */}
                  {(() => {
                    const docCount = selectedSystem?.documents?.length || 0;
                    const atDocCap = docCount >= MAX_DOCUMENTS_PER_SYSTEM;
                    if (atDocCap) {
                      return (
                        <div className="w-full mb-4 p-4 border-2 border-dashed border-amber-300 bg-amber-50 rounded-lg flex items-center gap-3">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <i className="ri-information-line text-xl text-amber-600"></i>
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-semibold text-amber-900">Document limit reached ({docCount}/{MAX_DOCUMENTS_PER_SYSTEM})</p>
                            <p className="text-xs text-amber-800">Delete a document to upload another. Higher limits are coming soon.</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  {!showUploadArea ? (
                    <button
                      onClick={() => setShowUploadArea(true)}
                      disabled={(selectedSystem?.documents?.length || 0) >= MAX_DOCUMENTS_PER_SYSTEM}
                      className="w-full mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer flex items-center justify-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-300 disabled:hover:bg-transparent"
                    >
                      <div className="w-10 h-10 bg-gray-100 group-hover:bg-teal-100 rounded-lg flex items-center justify-center transition-colors">
                        <i className="ri-upload-cloud-line text-xl text-[#6B7C8F] group-hover:text-teal-600 transition-colors"></i>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-semibold text-[#0B1F33]">Upload Documents <span className="font-normal text-[#6B7C8F]">({selectedSystem?.documents?.length || 0}/{MAX_DOCUMENTS_PER_SYSTEM})</span></p>
                        <p className="text-xs text-[#6B7C8F]">Manuals, warranties, service receipts (PDF, images)</p>
                      </div>
                    </button>
                  ) : (
                    <div className="mb-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-sm text-[#0B1F33]">Upload Document</h4>
                        <button
                          onClick={() => { setShowUploadArea(false); setUploadError(null); }}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer"
                        >
                          <i className="ri-close-line text-[#6B7C8F]"></i>
                        </button>
                      </div>

                      {uploadError && (
                        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-xs text-red-700"><i className="ri-error-warning-line mr-1"></i>{uploadError}</p>
                        </div>
                      )}

                      {/* Document Type Selector */}
                      <div className="mb-4">
                        <label className="block text-xs font-bold text-[#6B7C8F] mb-2">Document Type</label>
                        <div className="grid grid-cols-4 gap-2">
                          {(['manual', 'warranty', 'receipt', 'other'] as const).map(type => {
                            const config = docTypeConfig[type];
                            return (
                              <button
                                key={type}
                                onClick={() => setUploadDocType(type)}
                                className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                                  uploadDocType === type
                                    ? 'border-teal-600 bg-teal-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                              >
                                <div className={`w-8 h-8 ${config.color} rounded-lg flex items-center justify-center mx-auto mb-1.5`}>
                                  <i className={`${config.icon} text-base`}></i>
                                </div>
                                <p className="text-xs font-semibold text-[#0B1F33]">{config.label}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* AI Learning Notice for Manuals */}
                      {uploadDocType === 'manual' && (
                        <div className="mb-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-3 border border-teal-100 flex items-start gap-3">
                          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <i className="ri-brain-line text-white text-sm"></i>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-teal-800 mb-0.5">AI Will Learn From This Manual</p>
                            <p className="text-xs text-teal-700">
                              Our AI will read and extract maintenance schedules, troubleshooting tips, safety info, and specifications to give you personalized recommendations.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Drop Zone */}
                      <div
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={e => {
                          e.preventDefault();
                          setIsDragging(false);
                          handleFileUpload(e.dataTransfer.files);
                        }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all cursor-pointer ${
                          isDragging ? 'border-teal-500 bg-teal-50' : 'border-gray-300 hover:border-teal-400'
                        }`}
                      >
                        <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-teal-50 rounded-full">
                          <i className="ri-upload-cloud-line text-2xl text-teal-600"></i>
                        </div>
                        <p className="text-sm font-semibold text-[#0B1F33] mb-1">
                          Drag &amp; drop files here, or click to browse
                        </p>
                        <p className="text-xs text-[#6B7C8F]">
                          PDF, JPG, PNG up to 25MB
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          multiple
                          onChange={e => handleFileUpload(e.target.files)}
                          className="hidden"
                        />
                      </div>
                    </div>
                  )}

                  {/* Documents List */}
                  {getFilteredDocs().length > 0 ? (
                    <div className="space-y-2 sm:space-y-3">
                      {getFilteredDocs().map(doc => {
                        const config = docTypeConfig[doc.type];
                        const isProcessing = aiProcessingId === doc.id;

                        return (
                          <div
                            key={doc.id}
                            className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-all"
                          >
                            <div className="flex items-start gap-2 sm:gap-3">
                              <div className={`w-8 h-8 sm:w-10 sm:h-10 ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                                <i className={`${config.icon} text-base sm:text-lg`}></i>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                  <h4 className="text-xs sm:text-sm font-bold text-[#0B1F33] truncate">{doc.name}</h4>
                                  <span className={`px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold border ${config.color} ${config.borderColor}`}>
                                    {config.label}
                                  </span>
                                  {doc.aiProcessed && (
                                    <span className="px-1.5 sm:px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1">
                                      <i className="ri-brain-line text-[10px] sm:text-xs"></i>
                                      <span className="hidden sm:inline">AI Learned</span>
                                    </span>
                                  )}
                                  {isProcessing && (
                                    <span className="px-1.5 sm:px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] sm:text-xs font-semibold flex items-center gap-1 animate-pulse">
                                      <i className="ri-loader-4-line text-[10px] sm:text-xs animate-spin"></i>
                                      <span className="hidden sm:inline">AI Processing...</span>
                                    </span>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 sm:gap-3 text-[10px] sm:text-xs text-[#6B7C8F]">
                                  <span className="truncate max-w-[120px] sm:max-w-none">{doc.fileName}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span>{doc.fileSize}</span>
                                  <span className="hidden sm:inline">•</span>
                                  <span className="whitespace-nowrap">Uploaded {new Date(doc.uploadDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                </div>

                                {/* AI Insights */}
                                {doc.aiProcessed && doc.aiInsights && doc.aiInsights.length > 0 && (
                                  <div className="mt-3 bg-teal-50/50 rounded-lg p-2.5 sm:p-3 border border-teal-100">
                                    <p className="text-[10px] sm:text-xs font-bold text-teal-800 mb-2 flex items-center gap-1">
                                      <i className="ri-lightbulb-line text-[10px] sm:text-xs"></i>
                                      AI Extracted Insights
                                    </p>
                                    <div className="space-y-1.5">
                                      {doc.aiInsights.map((insight, idx) => (
                                        <div key={idx} className="flex items-start gap-1.5 sm:gap-2">
                                          <i className="ri-check-line text-teal-600 text-[10px] sm:text-xs mt-0.5 flex-shrink-0"></i>
                                          <p className="text-[10px] sm:text-xs text-teal-900 break-words">{insight}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer text-[#6B7C8F] hover:text-[#0B1F33] transition-colors">
                                  <i className="ri-download-line text-sm sm:text-base"></i>
                                </button>
                                <button
                                  onClick={() => handleDeleteDocument(doc.id)}
                                  className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-red-50 cursor-pointer text-[#6B7C8F] hover:text-red-600 transition-colors"
                                >
                                  <i className="ri-delete-bin-line text-sm sm:text-base"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8 sm:py-12">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="ri-file-text-line text-2xl sm:text-3xl text-[#6B7C8F]"></i>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1">
                        {docFilterType === 'all' ? 'No documents yet' : `No ${docTypeConfig[docFilterType as keyof typeof docTypeConfig]?.label || ''} documents`}
                      </p>
                      <p className="text-[10px] sm:text-xs text-[#6B7C8F] mb-4">
                        Upload manuals, warranties, and service receipts to keep everything organized
                      </p>
                      <button
                        onClick={() => setShowUploadArea(true)}
                        className="px-3 sm:px-4 py-2 bg-teal-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap"
                      >
                        Upload First Document
                      </button>
                    </div>
                  )}

                  {/* AI Knowledge Summary */}
                  {(selectedSystem.documents?.filter(d => d.aiProcessed).length || 0) > 0 && (
                    <div className="mt-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg p-4 border border-teal-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <i className="ri-brain-line text-white text-lg"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-[#0B1F33] flex items-center gap-2">
                            AI Knowledge Base
                            <span className="px-2 py-0.5 bg-teal-600/30 text-teal-300 text-xs font-bold rounded-full">Active</span>
                          </p>
                          <p className="text-xs text-[#6B7C8F] mt-0.5">
                            {selectedSystem.documents?.filter(d => d.aiProcessed).length} manual(s) processed •{' '}
                            {selectedSystem.documents?.filter(d => d.aiProcessed).reduce((acc, d) => acc + (d.aiInsights?.length || 0), 0)} insights extracted •{' '}
                            Powering personalized recommendations
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Quick Ask AI Chat */}
                  <div className="mt-5">
                    {!showAiChat ? (
                      <button
                        onClick={() => setShowAiChat(true)}
                        className="w-full p-4 bg-gradient-to-r from-[#0B1F33] to-[#1a3a5c] rounded-xl hover:from-[#0d2640] hover:to-[#1f4570] transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-white/15 transition-colors">
                            <i className="ri-chat-smile-ai-line text-xl text-teal-400"></i>
                          </div>
                          <div className="text-left flex-1">
                            <p className="text-sm font-bold text-white flex items-center gap-2">
                              Quick Ask AI
                              <span className="px-2 py-0.5 bg-teal-500/30 text-teal-300 text-xs font-bold rounded-full">Beta</span>
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              Ask questions about your {selectedSystem.name} — maintenance tips, troubleshooting, warranty info &amp; more
                            </p>
                          </div>
                          <i className="ri-arrow-right-s-line text-xl text-gray-400 group-hover:text-white transition-colors"></i>
                        </div>
                      </button>
                    ) : (
                      <div className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Chat Header */}
                        <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a5c] px-4 py-3 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                              <i className="ri-chat-smile-ai-line text-lg text-teal-400"></i>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white flex items-center gap-2">
                                Quick Ask AI
                                <span className="px-1.5 py-0.5 bg-teal-500/30 text-teal-300 text-xs font-bold rounded-full">Beta</span>
                              </p>
                              <p className="text-[11px] text-gray-400">Powered by your uploaded manuals</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setShowAiChat(false)}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer"
                          >
                            <i className="ri-subtract-line text-gray-400"></i>
                          </button>
                        </div>

                        {/* Chat Messages */}
                        <div className="h-64 overflow-y-auto p-4 bg-gray-50/50 space-y-3">
                          {aiChatMessages.length === 0 && (
                            <div className="text-center py-6">
                              <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="ri-question-answer-line text-2xl text-teal-600"></i>
                              </div>
                              <p className="text-sm font-semibold text-[#0B1F33] mb-1">Ask me anything about your {selectedSystem.name}</p>
                              <p className="text-xs text-[#6B7C8F] mb-4 max-w-sm mx-auto">
                                I can help with maintenance schedules, troubleshooting, warranty details, and more — all based on your uploaded documents.
                              </p>
                              <div className="flex flex-wrap justify-center gap-2">
                                {[
                                  'When should I service it?',
                                  'What does the warranty cover?',
                                  'How long will it last?',
                                  'Any safety tips?'
                                ].map((suggestion, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      setAiChatInput(suggestion);
                                    }}
                                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-semibold text-[#0B1F33] hover:border-teal-400 hover:bg-teal-50 cursor-pointer transition-colors whitespace-nowrap"
                                  >
                                    {suggestion}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {aiChatMessages.map(msg => (
                            <div
                              key={msg.id}
                              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                                {msg.role === 'ai' && (
                                  <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-5 h-5 bg-teal-600 rounded-md flex items-center justify-center">
                                      <i className="ri-brain-line text-white text-[10px]"></i>
                                    </div>
                                    <span className="text-[11px] text-[#6B7C8F]">AI Assistant</span>
                                  </div>
                                )}
                                <div
                                  className={`px-3.5 py-2.5 rounded-xl text-sm leading-relaxed ${
                                    msg.role === 'user'
                                      ? 'bg-teal-600 text-white rounded-br-md'
                                      : 'bg-white border border-gray-200 text-[#0B1F33] rounded-bl-md shadow-sm'
                                  }`}
                                >
                                  {msg.text}
                                </div>
                                <p className={`text-[10px] text-[#6B7C8F] mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
                                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                            </div>
                          ))}

                          {aiChatLoading && (
                            <div className="flex justify-start">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1">
                                  <div className="w-5 h-5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                  <div className="w-5 h-5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                  <div className="w-5 h-5 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl rounded-bl-md px-4 py-3 shadow-sm">
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          <div ref={chatEndRef}></div>
                        </div>

                        {/* Chat Input */}
                        <div className="border-t border-gray-200 p-3 bg-white">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={aiChatInput}
                              onChange={e => setAiChatInput(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAiChatSend(); } }}
                              placeholder={`Ask about your ${selectedSystem.name}...`}
                              className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 focus:bg-white transition-colors"
                            />
                            <button
                              onClick={handleAiChatSend}
                              disabled={!aiChatInput.trim() || aiChatLoading}
                              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer whitespace-nowrap ${
                                aiChatInput.trim() && !aiChatLoading
                                  ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                                  : 'bg-gray-100 text-gray-400'
                              }`}
                            >
                              <i className="ri-send-plane-fill text-base"></i>
                            </button>
                          </div>
                          {(selectedSystem.documents?.filter(d => d.aiProcessed).length || 0) > 0 ? (
                            <p className="text-[10px] text-[#6B7C8F] mt-2 flex items-center gap-1">
                              <i className="ri-brain-line text-teal-600 text-[10px]"></i>
                              Answers powered by {selectedSystem.documents?.filter(d => d.aiProcessed).length} processed manual(s)
                            </p>
                          ) : (
                            <p className="text-[10px] text-[#6B7C8F] mt-2 flex items-center gap-1">
                              <i className="ri-information-line text-[10px]"></i>
                              Upload manuals for more accurate, personalized answers
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Service Modal */}
      {showScheduleModal && selectedSystem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                {scheduleOption !== 'choose' && !scheduleSubmitted && !marketplaceSubmitted && (
                  <button
                    onClick={() => setScheduleOption('choose')}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <i className="ri-arrow-left-line text-lg text-[#6B7C8F]"></i>
                  </button>
                )}
                <div>
                  <h3 className="text-xl font-bold text-[#0B1F33]">Schedule Service</h3>
                  <p className="text-sm text-[#6B7C8F]">{selectedSystem.name} — {selectedSystem.type}</p>
                </div>
              </div>
              <button
                onClick={() => setShowScheduleModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <i className="ri-close-line text-xl text-[#6B7C8F]"></i>
              </button>
            </div>

            <div className="p-6">
              {/* Option Chooser */}
              {scheduleOption === 'choose' && (
                <div className="space-y-4">
                  <p className="text-sm text-[#6B7C8F] mb-2">How would you like to get this serviced?</p>

                  {/* Option 1: Post to Marketplace */}
                  <button
                    onClick={() => setScheduleOption('marketplace')}
                    className="w-full text-left border-2 border-gray-200 rounded-xl p-5 hover:border-teal-400 hover:bg-teal-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-teal-100 transition-colors">
                        <i className="ri-store-2-line text-2xl text-teal-600"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#0B1F33] mb-1 text-lg">Post to Job Marketplace</h4>
                        <p className="text-sm text-[#6B7C8F] mb-3">
                          Share this service request with qualified contractors in your area. Receive bids and compare quotes.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#6B7C8F]">
                          <span className="flex items-center gap-1">
                            <i className="ri-group-line text-teal-600"></i>
                            Multiple bids
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-shield-check-line text-teal-600"></i>
                            Verified contractors
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-sparkling-line text-teal-600"></i>
                            AI-matched
                          </span>
                        </div>
                      </div>
                      <i className="ri-arrow-right-s-line text-xl text-gray-400 group-hover:text-teal-600 transition-colors mt-1"></i>
                    </div>
                  </button>

                  {/* Option 2: Schedule with Favorite */}
                  <button
                    onClick={() => setScheduleOption('favorite')}
                    className="w-full text-left border-2 border-gray-200 rounded-xl p-5 hover:border-[#D4B483] hover:bg-amber-50/30 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-amber-100 transition-colors">
                        <i className="ri-heart-3-line text-2xl text-[#D4B483]"></i>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-[#0B1F33] mb-1 text-lg">Schedule with a Favorite Contractor</h4>
                        <p className="text-sm text-[#6B7C8F] mb-3">
                          Book directly with a contractor you&apos;ve worked with before. Fast, familiar, and trusted.
                        </p>
                        <div className="flex items-center gap-4 text-xs text-[#6B7C8F]">
                          <span className="flex items-center gap-1">
                            <i className="ri-time-line text-[#D4B483]"></i>
                            Faster booking
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-star-line text-[#D4B483]"></i>
                            Trusted pros
                          </span>
                          <span className="flex items-center gap-1">
                            <i className="ri-history-line text-[#D4B483]"></i>
                            Knows your home
                          </span>
                        </div>
                      </div>
                      <i className="ri-arrow-right-s-line text-xl text-gray-400 group-hover:text-[#D4B483] transition-colors mt-1"></i>
                    </div>
                  </button>

                  {/* PHASE_1_GTM: contractor marketplace paused — restore "or" divider + Browse All Contractors link for Phase 2
                  <div className="flex items-center gap-3 pt-2">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-[#6B7C8F]">or</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  <a
                    href="/providers"
                    onClick={(e) => { e.preventDefault(); navigate('/providers'); }}
                    className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#0B1F33] hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <i className="ri-search-line"></i>
                    Browse All Contractors in Your Area
                    <i className="ri-external-link-line text-[#6B7C8F]"></i>
                  </a>
                  */}
                </div>
              )}

              {/* Marketplace Post Flow */}
              {scheduleOption === 'marketplace' && !marketplaceSubmitted && (
                <div className="space-y-5">
                  {/* Pre-filled system info */}
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${categories.find(c => c.id === selectedSystem.category)?.color} rounded-lg flex items-center justify-center`}>
                        <i className={`${categories.find(c => c.id === selectedSystem.category)?.icon} text-xl`}></i>
                      </div>
                      <div>
                        <p className="font-bold text-[#0B1F33] text-sm">{selectedSystem.name}</p>
                        <p className="text-xs text-[#6B7C8F]">{selectedSystem.type} · Installed {selectedSystem.installYear} · Condition: {selectedSystem.condition}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-teal-700 bg-teal-50 rounded-lg px-3 py-2">
                      <i className="ri-sparkling-line"></i>
                      <span>System details will be auto-included in your job posting for accurate quotes</span>
                    </div>
                  </div>

                  {/* Service description */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B1F33] mb-2">
                      Describe the service needed <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={serviceNote}
                      onChange={e => setServiceNote(e.target.value)}
                      placeholder={`e.g., Annual maintenance for ${selectedSystem.name}, unusual noise during operation, performance check...`}
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                    />
                    <p className="text-xs text-[#6B7C8F] mt-1">{serviceNote.length}/500 characters</p>
                  </div>

                  {/* Urgency & Date */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0B1F33] mb-2">Preferred Date</label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B1F33] mb-2">Preferred Time</label>
                      <select
                        value={preferredTime}
                        onChange={e => setPreferredTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="">Flexible</option>
                        <option value="morning">Morning (8am–12pm)</option>
                        <option value="afternoon">Afternoon (12pm–5pm)</option>
                        <option value="evening">Evening (5pm–8pm)</option>
                      </select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setScheduleOption('choose')}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleMarketplacePost}
                      disabled={!serviceNote.trim()}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                        serviceNote.trim()
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <i className="ri-send-plane-line"></i>
                      Post to Marketplace
                    </button>
                  </div>

                  {/* PHASE_1_GTM: contractor marketplace paused — restore "browse contractors directly" link for Phase 2
                  <div className="text-center pt-1">
                    <a
                      href="/providers"
                      onClick={(e) => { e.preventDefault(); navigate('/providers'); }}
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      Or browse contractors to reach out directly
                      <i className="ri-arrow-right-line"></i>
                    </a>
                  </div>
                  */}
                </div>
              )}

              {/* Marketplace Success */}
              {scheduleOption === 'marketplace' && marketplaceSubmitted && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-check-line text-3xl text-green-600"></i>
                  </div>
                  <h4 className="text-xl font-bold text-[#0B1F33] mb-2">Posted to Marketplace!</h4>
                  <p className="text-sm text-[#6B7C8F] max-w-sm mx-auto">
                    Your service request for <strong>{selectedSystem.name}</strong> is now live. Qualified contractors in your area will be notified and can submit quotes.
                  </p>
                </div>
              )}

              {/* Favorite Contractor Flow */}
              {scheduleOption === 'favorite' && !scheduleSubmitted && (
                <div className="space-y-5">
                  {/* Contractor Selection */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B1F33] mb-3">
                      Select a contractor <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      {getRelevantContractors().map(contractor => {
                        const isSelected = selectedContractor === contractor.id;
                        const isRelevant = selectedSystem && (() => {
                          const catMap: Record<string, string[]> = {
                            'HVAC': ['HVAC'], 'Plumbing': ['Plumbing'], 'Electrical': ['Electrical'],
                            'Roofing': ['Roofing'], 'Kitchen': ['Plumbing', 'Electrical'],
                            'Laundry': ['Plumbing', 'Electrical'], 'Security': ['Electrical'],
                            'Garage': ['Electrical'], 'Other': []
                          };
                          return (catMap[selectedSystem.category] || []).includes(contractor.specialty);
                        })();

                        return (
                          <button
                            key={contractor.id}
                            onClick={() => setSelectedContractor(contractor.id)}
                            className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50/50'
                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                            }`}
                          >
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-100">
                              <img src={contractor.image} alt={contractor.name} className="w-full h-full object-cover object-top" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-[#0B1F33] text-sm truncate">{contractor.name}</h4>
                                {isRelevant && (
                                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 text-xs font-bold rounded-full whitespace-nowrap flex-shrink-0">
                                    Best Match
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#6B7C8F]">
                                <span className="flex items-center gap-1">
                                  <i className="ri-star-fill text-amber-400"></i>
                                  {contractor.rating} ({contractor.reviews})
                                </span>
                                <span>•</span>
                                <span>{contractor.specialty}</span>
                                <span>•</span>
                                <span>{contractor.jobsDone} past jobs</span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-[#6B7C8F] mt-1">
                                <span className="flex items-center gap-1">
                                  <i className="ri-time-line"></i>
                                  {contractor.responseTime}
                                </span>
                                <span className={`font-semibold ${
                                  contractor.availability === 'Available Today' ? 'text-green-600' :
                                  contractor.availability === 'Available Tomorrow' ? 'text-teal-600' : 'text-[#6B7C8F]'
                                }`}>
                                  {contractor.availability}
                                </span>
                              </div>
                            </div>
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                              isSelected ? 'border-teal-500 bg-teal-500' : 'border-gray-300'
                            }`}>
                              {isSelected && <i className="ri-check-line text-white text-sm"></i>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Service details */}
                  <div>
                    <label className="block text-sm font-bold text-[#0B1F33] mb-2">
                      Service details / notes
                    </label>
                    <textarea
                      value={serviceNote}
                      onChange={e => setServiceNote(e.target.value)}
                      placeholder={`e.g., Annual maintenance for ${selectedSystem.name}, check performance, any concerns...`}
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 resize-none"
                    />
                  </div>

                  {/* Date & Time */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-[#0B1F33] mb-2">
                        Preferred Date <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        value={preferredDate}
                        onChange={e => setPreferredDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-[#0B1F33] mb-2">Preferred Time</label>
                      <select
                        value={preferredTime}
                        onChange={e => setPreferredTime(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 cursor-pointer"
                      >
                        <option value="">Flexible</option>
                        <option value="morning">Morning (8am–12pm)</option>
                        <option value="afternoon">Afternoon (12pm–5pm)</option>
                        <option value="evening">Evening (5pm–8pm)</option>
                      </select>
                    </div>
                  </div>

                  {/* System info summary */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="flex items-center gap-2 text-xs text-[#6B7C8F]">
                      <i className="ri-information-line text-teal-600"></i>
                      <span>Your system details ({selectedSystem.name}, {selectedSystem.type}, condition: {selectedSystem.condition}) will be shared with the contractor.</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={() => setScheduleOption('choose')}
                      className="flex-1 px-6 py-3 border border-gray-200 rounded-lg font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleDirectSchedule}
                      disabled={!selectedContractor || !preferredDate}
                      className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold cursor-pointer whitespace-nowrap transition-colors ${
                        selectedContractor && preferredDate
                          ? 'bg-teal-600 text-white hover:bg-teal-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <i className="ri-calendar-check-line"></i>
                      Send Service Request
                    </button>
                  </div>

                  {/* PHASE_1_GTM: contractor marketplace paused — restore "Browse all providers" link for Phase 2
                  <div className="text-center pt-1">
                    <a
                      href="/providers"
                      onClick={(e) => { e.preventDefault(); navigate('/providers'); }}
                      className="text-sm font-semibold text-teal-600 hover:text-teal-700 cursor-pointer inline-flex items-center gap-1"
                    >
                      Don&apos;t see your contractor? Browse all providers
                      <i className="ri-arrow-right-line"></i>
                    </a>
                  </div>
                  */}
                </div>
              )}

              {/* Favorite Schedule Success */}
              {scheduleOption === 'favorite' && scheduleSubmitted && (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i className="ri-calendar-check-fill text-3xl text-green-600"></i>
                  </div>
                  <h4 className="text-xl font-bold text-[#0B1F33] mb-2">Service Request Sent!</h4>
                  <p className="text-sm text-[#6B7C8F] max-w-sm mx-auto mb-4">
                    Your request for <strong>{selectedSystem.name}</strong> service has been sent to <strong>{favoriteContractors.find(c => c.id === selectedContractor)?.name}</strong>. They&apos;ll confirm your appointment shortly.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg text-sm text-[#6B7C8F]">
                    <i className="ri-calendar-line text-teal-600"></i>
                    {preferredDate && new Date(preferredDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                    {preferredTime && ` · ${preferredTime === 'morning' ? 'Morning' : preferredTime === 'afternoon' ? 'Afternoon' : preferredTime === 'evening' ? 'Evening' : 'Flexible'}`}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Wizard */}
      {showWizard && (
        <QuickAddWizard
          onComplete={handleWizardComplete}
          onSkip={handleWizardSkip}
        />
      )}

      {/* Build system record from a document */}
      {showBuildFromDoc && user && (
        <BuildSystemFromDocModal
          userId={user.id}
          propertyId={propertyId}
          systems={systems.map(s => ({ id: s.id, name: s.name, type: s.type, category: s.category }))}
          categories={categories.map(c => c.id)}
          atCap={systems.length >= MAX_SYSTEMS_PER_USER}
          onClose={() => setShowBuildFromDoc(false)}
          onDone={fetchSystems}
        />
      )}
    </div>
  );
}
