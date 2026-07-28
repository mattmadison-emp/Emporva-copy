
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { QuoteData, QuoteLineItem } from '../../../mocks/contractorQuotes';
import type { QuoteTemplate } from '../../../mocks/quoteTemplates';
import { generateQuotePDF } from '../../../utils/quotePdf';
import { aiAgentService } from '../../../services/aiAgentService';

type ViewState = 'list' | 'create' | 'detail' | 'templates';
type FilterStatus = 'all' | 'draft' | 'sent' | 'accepted' | 'declined' | 'expired';

interface AIGeneratedContent {
  scopeSummary: string;
  workSteps: string[];
  lineItems: QuoteLineItem[];
  materials: string[];
  assumptions: string;
  exclusions: string;
  estimatedDuration: string;
}

interface AcceptanceNotification {
  id: string;
  quoteId: string;
  jobTitle: string;
  clientName: string;
  total: number;
  acceptedAt: string;
  pipelineCreated: boolean;
  read: boolean;
}

function generateAIFromJobDetails(title: string, trade: string, description?: string): AIGeneratedContent {
  const t = `${title} ${description || ''}`.toLowerCase();

  // Use a simple hash of the description to vary quantities/pricing so different scopes produce different quotes
  const descHash = (description || title).split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0);
  const vary = (base: number, range: number) => {
    const offset = ((Math.abs(descHash) % (range * 2 + 1)) - range);
    return Math.max(0.5, Math.round((base + offset) * 100) / 100);
  };
  const varyInt = (base: number, range: number) => {
    const offset = ((Math.abs(descHash) % (range * 2 + 1)) - range);
    return Math.max(1, base + offset);
  };

  // Extract scope details from description to customize the summary
  const descSnippet = description ? ` Scope includes: ${description.slice(0, 120).toLowerCase()}.` : '';

  if (t.includes('sink') || t.includes('leak') || t.includes('faucet') || t.includes('plumb') || t.includes('drain') || t.includes('water') || t.includes('toilet') || trade === 'Plumbing') {
    const laborHrs = vary(2.5, 2);
    const partsRate = varyInt(65, 30);
    const connectors = varyInt(2, 2);
    return {
      scopeSummary: `Complete ${title.toLowerCase()} including inspection of existing connections, removal and replacement of faulty components, new fitting installation, and thorough leak testing.${descSnippet} All work by licensed plumber per local codes.`,
      workSteps: ['Shut off water supply and drain lines', 'Remove and inspect existing components', 'Identify root cause of issue', 'Install replacement parts with proper seals', 'Reconnect supply lines and test connections', 'Run 15-minute pressure leak test', 'Clean work area and dispose of old materials'],
      lineItems: [
        { id: '1', description: 'Licensed plumber labor', quantity: laborHrs, unit: 'hours', unitCost: 95, total: Math.round(laborHrs * 95 * 100) / 100 },
        { id: '2', description: 'Replacement parts and fittings', quantity: 1, unit: 'lot', unitCost: partsRate, total: partsRate },
        { id: '3', description: 'Supply line connectors', quantity: connectors, unit: 'ea', unitCost: 18, total: connectors * 18 },
        { id: '4', description: 'Sealant and tape supplies', quantity: 1, unit: 'lot', unitCost: 12, total: 12 },
        { id: '5', description: 'Cleanup and disposal', quantity: 1, unit: 'ea', unitCost: 25, total: 25 },
      ],
      materials: ['Replacement fittings and hardware', 'Braided stainless supply lines', 'Plumber\'s putty', 'PTFE thread seal tape', 'Silicone caulk'],
      assumptions: 'Shut-off valves are functional. No hidden corrosion behind walls. Standard pipe sizes and connections.',
      exclusions: 'Valve replacement, pipe rerouting, drywall repair, or cabinet restoration not included.',
      estimatedDuration: laborHrs <= 2 ? '1.5-2 hours' : laborHrs <= 4 ? '2-4 hours' : '4-6 hours',
    };
  }
  if (t.includes('hvac') || t.includes('heat') || t.includes('furnace') || t.includes('ac ') || t.includes('air condition') || t.includes('cool') || trade === 'HVAC') {
    const diagHrs = vary(1.5, 1);
    const repairHrs = vary(2, 1);
    const partsRate = varyInt(120, 50);
    return {
      scopeSummary: `Full HVAC diagnostic and repair for ${title.toLowerCase()}.${descSnippet} Includes system inspection, component testing, part replacement as needed, and verification of proper operation across all modes.`,
      workSteps: ['Perform full system diagnostic and error code check', 'Inspect thermostat wiring and calibration', 'Test igniter, flame sensor, and gas valve', 'Check blower motor and capacitor', 'Replace faulty components', 'Test system through full heating/cooling cycle', 'Verify airflow at all vents'],
      lineItems: [
        { id: '1', description: 'HVAC technician - diagnostic', quantity: diagHrs, unit: 'hours', unitCost: 110, total: Math.round(diagHrs * 110 * 100) / 100 },
        { id: '2', description: 'HVAC technician - repair', quantity: repairHrs, unit: 'hours', unitCost: 110, total: Math.round(repairHrs * 110 * 100) / 100 },
        { id: '3', description: 'Replacement components', quantity: 1, unit: 'lot', unitCost: partsRate, total: partsRate },
        { id: '4', description: 'Service call fee', quantity: 1, unit: 'ea', unitCost: 75, total: 75 },
      ],
      materials: ['Flame sensor', 'Igniter assembly', 'Electrical contact cleaner', 'Replacement filter'],
      assumptions: 'Standard gas furnace under 15 years old. Gas supply functioning. Ductwork intact.',
      exclusions: 'Heat exchanger replacement, full system replacement, ductwork repair, thermostat upgrade.',
      estimatedDuration: (diagHrs + repairHrs) <= 3 ? '2-3 hours' : '3-5 hours',
    };
  }
  if (t.includes('electric') || t.includes('outlet') || t.includes('panel') || t.includes('fan') || t.includes('wiring') || t.includes('light') || t.includes('switch') || trade === 'Electrical') {
    const laborHrs = vary(2, 1);
    const partsRate = varyInt(45, 20);
    return {
      scopeSummary: `Professional electrical work for ${title.toLowerCase()}.${descSnippet} Includes circuit testing, component installation, code-compliant wiring, and full safety verification. All work by licensed electrician.`,
      workSteps: ['De-energize circuit at breaker and verify', 'Remove existing fixture/component', 'Inspect wiring and connections', 'Install new component with proper mounting', 'Make all electrical connections per code', 'Restore power and test operation', 'Clean up and verify safety'],
      lineItems: [
        { id: '1', description: 'Licensed electrician labor', quantity: laborHrs, unit: 'hours', unitCost: 95, total: Math.round(laborHrs * 95 * 100) / 100 },
        { id: '2', description: 'Electrical components', quantity: 1, unit: 'lot', unitCost: partsRate, total: partsRate },
        { id: '3', description: 'Mounting hardware', quantity: 1, unit: 'lot', unitCost: 15, total: 15 },
        { id: '4', description: 'Wire and connectors', quantity: 1, unit: 'lot', unitCost: 12, total: 12 },
      ],
      materials: ['Electrical box (rated)', 'Wire nuts and connectors', 'Mounting hardware', 'Electrical tape'],
      assumptions: 'Existing wiring is in good condition. Standard ceiling/wall height. No additional circuits needed.',
      exclusions: 'New circuit runs, panel upgrades, drywall repair, painting, or fixture cost.',
      estimatedDuration: laborHrs <= 2 ? '1.5-2 hours' : '2-3 hours',
    };
  }
  // General / other trades
  const laborHrs = varyInt(8, 4);
  const materialsRate = varyInt(350, 150);
  const equipRate = varyInt(75, 30);
  return {
    scopeSummary: `Complete ${title.toLowerCase()} project including all necessary labor, materials, and cleanup.${descSnippet} Work performed by licensed professionals following local codes and industry best practices.`,
    workSteps: ['Initial site assessment and measurements', 'Material procurement and delivery', 'Preparation and protection of work area', 'Primary installation/construction work', 'Quality inspection and adjustments', 'Final cleanup and walkthrough with client'],
    lineItems: [
      { id: '1', description: 'Skilled labor', quantity: laborHrs, unit: 'hours', unitCost: 85, total: laborHrs * 85 },
      { id: '2', description: 'Materials and supplies', quantity: 1, unit: 'lot', unitCost: materialsRate, total: materialsRate },
      { id: '3', description: 'Equipment', quantity: 1, unit: 'lot', unitCost: equipRate, total: equipRate },
      { id: '4', description: 'Permits and fees', quantity: 1, unit: 'ea', unitCost: 125, total: 125 },
      { id: '5', description: 'Cleanup and disposal', quantity: 1, unit: 'ea', unitCost: 50, total: 50 },
    ],
    materials: ['Primary materials per specifications', 'Fasteners and adhesives', 'Protective coverings', 'Cleanup supplies'],
    assumptions: 'Work area is accessible. All utilities functional. No hidden conditions.',
    exclusions: 'Structural repairs, upgrades beyond scope, or unforeseen conditions.',
    estimatedDuration: laborHrs <= 6 ? '1-2 days' : laborHrs <= 10 ? '2-3 days' : '3-5 days',
  };
}

function generateAIFromFreeform(title: string, description: string): AIGeneratedContent {
  const text = `${title} ${description}`.toLowerCase();
  let trade = 'General';
  if (text.includes('plumb') || text.includes('pipe') || text.includes('faucet') || text.includes('drain') || text.includes('water') || text.includes('leak') || text.includes('sink') || text.includes('toilet')) trade = 'Plumbing';
  else if (text.includes('hvac') || text.includes('heat') || text.includes('cool') || text.includes('furnace') || text.includes('ac ') || text.includes('air condition')) trade = 'HVAC';
  else if (text.includes('electric') || text.includes('outlet') || text.includes('wire') || text.includes('panel') || text.includes('light') || text.includes('fan') || text.includes('switch')) trade = 'Electrical';
  else if (text.includes('paint') || text.includes('stain') || text.includes('coat')) trade = 'Painting';
  else if (text.includes('tile') || text.includes('grout') || text.includes('floor')) trade = 'Tile Work';
  else if (text.includes('roof') || text.includes('shingle') || text.includes('gutter')) trade = 'Roofing';
  return generateAIFromJobDetails(title, trade, description);
}

export default function QuotesHub() {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [view, setView] = useState<ViewState>('list');
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedQuote, setSelectedQuote] = useState<QuoteData | null>(null);
  const [editingQuote, setEditingQuote] = useState<QuoteData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [activeJobs, setActiveJobs] = useState<Array<{ id: string; title: string; client: string; trade: string; address: string; description: string }>>([]);

  // Acceptance notifications
  const [acceptanceNotifs, setAcceptanceNotifs] = useState<AcceptanceNotification[]>([]);
  const [showAcceptanceBanner, setShowAcceptanceBanner] = useState<AcceptanceNotification | null>(null);
  const [showAcceptancePanel, setShowAcceptancePanel] = useState(false);

  // Template state
  const [templates, setTemplates] = useState<QuoteTemplate[]>([]);

  // Fetch quotes, templates, and active jobs from DB
  const fetchData = useCallback(async () => {
    if (!user) return;

    const [quotesRes, templatesRes, wiRes] = await Promise.all([
      supabase.from('quotes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('quote_templates').select('*').eq('user_id', user.id).order('updated_at', { ascending: false }),
      supabase.from('work_items').select('job_id, trade').eq('contractor_id', user.id).in('status', ['open', 'quoted', 'assigned', 'in-progress']),
    ]);

    // Map quotes from DB to QuoteData shape
    if (quotesRes.data) {
      setQuotes(quotesRes.data.map(q => ({
        id: q.id,
        jobId: q.job_id || undefined,
        jobTitle: q.job_title,
        clientName: q.client_name,
        clientEmail: q.client_email || '',
        clientPhone: q.client_phone || '',
        clientAddress: q.client_address || '',
        scopeSummary: q.scope_summary || '',
        workSteps: (q.work_steps as string[]) || [],
        lineItems: (q.line_items as QuoteLineItem[]) || [],
        materials: (q.materials as string[]) || [],
        assumptions: q.assumptions || '',
        exclusions: q.exclusions || '',
        validityDays: q.validity_days || 30,
        paymentTerms: q.payment_terms || '',
        estimatedDuration: q.estimated_duration || '',
        total: Number(q.total) || 0,
        status: q.status as QuoteData['status'],
        createdAt: q.created_at,
        sentAt: q.sent_at || undefined,
        respondedAt: q.responded_at || undefined,
        contractorNotes: q.contractor_notes || '',
      })));
    }

    // Map templates
    if (templatesRes.data) {
      setTemplates(templatesRes.data.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        description: t.description || '',
        scopeSummary: t.scope_summary || '',
        workSteps: (t.work_steps as string[]) || [],
        lineItems: (t.line_items as QuoteLineItem[]) || [],
        materials: (t.materials as string[]) || [],
        assumptions: t.assumptions || '',
        exclusions: t.exclusions || '',
        estimatedDuration: t.estimated_duration || '',
        paymentTerms: t.payment_terms || '',
        validityDays: t.validity_days || 30,
        usageCount: t.usage_count || 0,
        lastUsed: t.last_used || '',
        createdAt: t.created_at,
      })));
    }

    // Build active jobs list from work items
    if (wiRes.data && wiRes.data.length > 0) {
      const jobIds = [...new Set(wiRes.data.map(w => w.job_id))];
      const { data: jobs } = await supabase.from('jobs').select('id, title, user_id, location, category, description').in('id', jobIds);
      const homeownerIds = [...new Set((jobs || []).map(j => j.user_id))];
      const { data: profiles } = await supabase.from('profiles').select('id, first_name, last_name').in('id', homeownerIds);
      const nameMap = Object.fromEntries((profiles || []).map(p => [p.id, `${p.first_name} ${p.last_name}`]));

      setActiveJobs((jobs || []).map(j => ({
        id: j.id,
        title: j.title,
        client: nameMap[j.user_id] || 'Unknown',
        trade: j.category || 'General',
        address: j.location || '',
        description: j.description || '',
      })));
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategory, setTemplateCategory] = useState('all');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState('');
  const [saveTemplateCategory, setSaveTemplateCategory] = useState('General');
  const [saveTemplateDesc, setSaveTemplateDesc] = useState('');
  const [templateDeleteConfirm, setTemplateDeleteConfirm] = useState<string | null>(null);
  const [_editingTemplate, _setEditingTemplate] = useState<QuoteTemplate | null>(null);

  // Create form state
  const [createMode, setCreateMode] = useState<'choose' | 'from-job' | 'freeform' | 'from-template' | 'building'>('choose');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [freeformTitle, setFreeformTitle] = useState('');
  const [freeformDescription, setFreeformDescription] = useState('');
  const [freeformClientName, setFreeformClientName] = useState('');
  const [freeformClientEmail, setFreeformClientEmail] = useState('');
  const [freeformClientPhone, setFreeformClientPhone] = useState('');
  const [freeformClientAddress, setFreeformClientAddress] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);

  // Builder state
  const [bScopeSummary, setBScopeSummary] = useState('');
  const [bWorkSteps, setBWorkSteps] = useState<string[]>(['']);
  const [bLineItems, setBLineItems] = useState<QuoteLineItem[]>([{ id: '1', description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }]);
  const [bMaterials, setBMaterials] = useState<string[]>(['']);
  const [bAssumptions, setBAssumptions] = useState('');
  const [bExclusions, setBExclusions] = useState('');
  const [bEstDuration, setBEstDuration] = useState('');
  const [bValidityDays, setBValidityDays] = useState(30);
  const [bPaymentTerms, setBPaymentTerms] = useState('50% deposit, 50% upon completion');
  const [bContractorNotes, setBContractorNotes] = useState('');
  const [bJobTitle, setBJobTitle] = useState('');
  const [bClientName, setBClientName] = useState('');
  const [bClientEmail, setBClientEmail] = useState('');
  const [bClientPhone, setBClientPhone] = useState('');
  const [bClientAddress, setBClientAddress] = useState('');
  const [bJobId, setBJobId] = useState<string | undefined>(undefined);
  const [aiFlags, setAiFlags] = useState<Record<string, boolean>>({});

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Simulate client acceptance notifications (runs once on mount)
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const sentQuotes = quotes.filter(q => q.status === 'sent');
    if (sentQuotes.length === 0) return;
    const timer = setTimeout(() => {
      const quoteToAccept = sentQuotes[0];
      if (!quoteToAccept) return;
      const notif: AcceptanceNotification = {
        id: `an-${Date.now()}`,
        quoteId: quoteToAccept.id,
        jobTitle: quoteToAccept.jobTitle,
        clientName: quoteToAccept.clientName,
        total: quoteToAccept.total,
        acceptedAt: new Date().toISOString(),
        pipelineCreated: true,
        read: false,
      };
      setAcceptanceNotifs(prev => [notif, ...prev]);
      setShowAcceptanceBanner(notif);
      // Auto-update quote status
      setQuotes(prev => prev.map(q =>
        q.id === quoteToAccept.id
          ? { ...q, status: 'accepted' as const, respondedAt: new Date().toISOString() }
          : q
      ));
    }, 10000);
    return () => clearTimeout(timer);
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  const dismissAcceptanceBanner = () => setShowAcceptanceBanner(null);
  const markNotifRead = (id: string) => setAcceptanceNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const unreadAcceptanceCount = acceptanceNotifs.filter(n => !n.read).length;

  const filteredQuotes = quotes.filter(q => {
    const matchesFilter = filter === 'all' || q.status === filter;
    const matchesSearch = searchTerm === '' || q.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) || q.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: quotes.length,
    draft: quotes.filter(q => q.status === 'draft').length,
    sent: quotes.filter(q => q.status === 'sent').length,
    accepted: quotes.filter(q => q.status === 'accepted').length,
    declined: quotes.filter(q => q.status === 'declined').length,
    totalValue: quotes.reduce((s, q) => s + q.total, 0),
    acceptedValue: quotes.filter(q => q.status === 'accepted').reduce((s, q) => s + q.total, 0),
  };

  const resetCreateForm = () => {
    setCreateMode('choose');
    setSelectedJobId('');
    setFreeformTitle('');
    setFreeformDescription('');
    setFreeformClientName('');
    setFreeformClientEmail('');
    setFreeformClientPhone('');
    setFreeformClientAddress('');
    setIsAIGenerating(false);
    resetBuilder();
  };

  const resetBuilder = () => {
    setBScopeSummary('');
    setBWorkSteps(['']);
    setBLineItems([{ id: '1', description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }]);
    setBMaterials(['']);
    setBAssumptions('');
    setBExclusions('');
    setBEstDuration('');
    setBValidityDays(30);
    setBPaymentTerms('50% deposit, 50% upon completion');
    setBContractorNotes('');
    setBJobTitle('');
    setBClientName('');
    setBClientEmail('');
    setBClientPhone('');
    setBClientAddress('');
    setBJobId(undefined);
    setAiFlags({});
  };

  const applyAIResult = (ai: AIGeneratedContent) => {
    setBScopeSummary(ai.scopeSummary);
    setBWorkSteps(ai.workSteps);
    setBLineItems(ai.lineItems);
    setBMaterials(ai.materials);
    setBAssumptions(ai.assumptions);
    setBExclusions(ai.exclusions);
    setBEstDuration(ai.estimatedDuration);
    setAiFlags({ scopeSummary: true, workSteps: true, lineItems: true, materials: true, assumptions: true, exclusions: true, estimatedDuration: true });
    setIsAIGenerating(false);
    setCreateMode('building');
  };

  const startFromJob = async () => {
    if (!selectedJobId) return;
    const job = activeJobs.find(j => j.id === selectedJobId);
    if (!job) return;
    setIsAIGenerating(true);
    setBJobId(job.id);
    setBJobTitle(job.title);
    setBClientName(job.client);
    setBClientAddress(job.address);
    setBClientEmail('');
    setBClientPhone('');

    try {
      const ai = await aiAgentService.generateQuote({
        jobTitle: job.title,
        trade: job.trade,
        description: job.description,
      });
      applyAIResult(ai);
    } catch (err) {
      console.warn('[QuotesHub] AI agent quote failed, using fallback:', err);
      const ai = generateAIFromJobDetails(job.title, job.trade, job.description);
      applyAIResult(ai);
    }
  };

  const startFreeform = async () => {
    if (!freeformTitle.trim()) return;
    setIsAIGenerating(true);
    setBJobTitle(freeformTitle);
    setBClientName(freeformClientName);
    setBClientEmail(freeformClientEmail);
    setBClientPhone(freeformClientPhone);
    setBClientAddress(freeformClientAddress);
    setBJobId(undefined);

    try {
      const ai = await aiAgentService.generateQuote({
        jobTitle: freeformTitle,
        trade: 'General',
        description: freeformDescription,
      });
      applyAIResult(ai);
    } catch (err) {
      console.warn('[QuotesHub] AI agent quote failed, using fallback:', err);
      const ai = generateAIFromFreeform(freeformTitle, freeformDescription);
      applyAIResult(ai);
    }
  };

  const startFromTemplate = (template: QuoteTemplate) => {
    setBJobTitle('');
    setBClientName('');
    setBClientEmail('');
    setBClientPhone('');
    setBClientAddress('');
    setBJobId(undefined);
    setBScopeSummary(template.scopeSummary);
    setBWorkSteps([...template.workSteps]);
    setBLineItems(template.lineItems.map(li => ({ ...li, id: `${Date.now()}-${li.id}` })));
    setBMaterials([...template.materials]);
    setBAssumptions(template.assumptions);
    setBExclusions(template.exclusions);
    setBEstDuration(template.estimatedDuration);
    setBValidityDays(template.validityDays);
    setBPaymentTerms(template.paymentTerms);
    setBContractorNotes('');
    setAiFlags({});
    // Update template usage
    setTemplates(prev => prev.map(t => t.id === template.id ? { ...t, usageCount: t.usageCount + 1, lastUsed: new Date().toISOString() } : t));
    setCreateMode('building');
    setView('create');
    showToast(`Template "${template.name}" loaded`, 'info');
  };

  const clearAiFlag = (f: string) => setAiFlags(prev => ({ ...prev, [f]: false }));
  const calcTotal = () => bLineItems.reduce((s, i) => s + i.total, 0);

  const addLineItem = () => { clearAiFlag('lineItems'); setBLineItems([...bLineItems, { id: Date.now().toString(), description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }]); };
  const removeLineItem = (id: string) => { if (bLineItems.length > 1) { clearAiFlag('lineItems'); setBLineItems(bLineItems.filter(i => i.id !== id)); } };
  const updateLineItem = (id: string, field: keyof QuoteLineItem, value: string | number) => {
    clearAiFlag('lineItems');
    setBLineItems(bLineItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitCost') updated.total = Number(updated.quantity) * Number(updated.unitCost);
        return updated;
      }
      return item;
    }));
  };

  const addWorkStep = () => { clearAiFlag('workSteps'); setBWorkSteps([...bWorkSteps, '']); };
  const removeWorkStep = (i: number) => { if (bWorkSteps.length > 1) { clearAiFlag('workSteps'); setBWorkSteps(bWorkSteps.filter((_, idx) => idx !== i)); } };
  const updateWorkStep = (i: number, v: string) => { clearAiFlag('workSteps'); const u = [...bWorkSteps]; u[i] = v; setBWorkSteps(u); };

  const addMaterial = () => { clearAiFlag('materials'); setBMaterials([...bMaterials, '']); };
  const removeMaterial = (i: number) => { if (bMaterials.length > 1) { clearAiFlag('materials'); setBMaterials(bMaterials.filter((_, idx) => idx !== i)); } };
  const updateMaterial = (i: number, v: string) => { clearAiFlag('materials'); const u = [...bMaterials]; u[i] = v; setBMaterials(u); };

  const saveQuote = async (status: 'draft' | 'sent') => {
    const newQuote: QuoteData = {
      id: `qt-${Date.now()}`,
      jobId: bJobId,
      jobTitle: bJobTitle,
      clientName: bClientName,
      clientEmail: bClientEmail,
      clientPhone: bClientPhone,
      clientAddress: bClientAddress,
      scopeSummary: bScopeSummary,
      workSteps: bWorkSteps.filter(s => s.trim()),
      lineItems: bLineItems,
      materials: bMaterials.filter(m => m.trim()),
      assumptions: bAssumptions,
      exclusions: bExclusions,
      validityDays: bValidityDays,
      paymentTerms: bPaymentTerms,
      estimatedDuration: bEstDuration,
      total: calcTotal(),
      status,
      createdAt: new Date().toISOString(),
      sentAt: status === 'sent' ? new Date().toISOString() : undefined,
      contractorNotes: bContractorNotes,
    };
    if (editingQuote) {
      setQuotes(quotes.map(q => q.id === editingQuote.id ? { ...newQuote, id: editingQuote.id, createdAt: editingQuote.createdAt } : q));
      showToast(status === 'sent' ? 'Quote updated and sent!' : 'Quote updated!');
    } else {
      setQuotes([newQuote, ...quotes]);
      showToast(status === 'sent' ? 'Quote created and sent!' : 'Quote saved as draft!');
    }
    // Auto-create CRM contact from quote client info
    if (bClientEmail.trim() && user?.id) {
      try {
        const { data: existing } = await supabase
          .from('contractor_contacts')
          .select('id')
          .eq('user_id', user.id)
          .eq('email', bClientEmail.trim())
          .single();

        if (!existing) {
          await supabase.from('contractor_contacts').insert({
            user_id: user.id,
            name: bClientName.trim(),
            email: bClientEmail.trim(),
            phone: bClientPhone || null,
            address: bClientAddress || null,
            source: 'quote',
            tags: [],
            last_contacted: new Date().toISOString(),
          });
        }
      } catch {
        // Silent — background convenience action
      }
    }

    setEditingQuote(null);
    resetCreateForm();
    setView('list');
  };

  // Save current builder state as template
  const handleSaveAsTemplate = () => {
    if (!saveTemplateName.trim()) return;
    const newTemplate: QuoteTemplate = {
      id: `tpl-${Date.now()}`,
      name: saveTemplateName.trim(),
      category: saveTemplateCategory,
      description: saveTemplateDesc.trim() || `Template for ${saveTemplateName.trim()}`,
      scopeSummary: bScopeSummary,
      workSteps: bWorkSteps.filter(s => s.trim()),
      lineItems: bLineItems.map((li, idx) => ({ ...li, id: String(idx + 1) })),
      materials: bMaterials.filter(m => m.trim()),
      assumptions: bAssumptions,
      exclusions: bExclusions,
      estimatedDuration: bEstDuration,
      paymentTerms: bPaymentTerms,
      validityDays: bValidityDays,
      usageCount: 0,
      lastUsed: '',
      createdAt: new Date().toISOString(),
    };
    setTemplates(prev => [newTemplate, ...prev]);
    setShowSaveTemplate(false);
    setSaveTemplateName('');
    setSaveTemplateCategory('General');
    setSaveTemplateDesc('');
    showToast('Template saved!');
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    setTemplateDeleteConfirm(null);
    showToast('Template deleted');
  };

  const loadQuoteForEdit = (quote: QuoteData) => {
    setEditingQuote(quote);
    setBJobId(quote.jobId);
    setBJobTitle(quote.jobTitle);
    setBClientName(quote.clientName);
    setBClientEmail(quote.clientEmail);
    setBClientPhone(quote.clientPhone);
    setBClientAddress(quote.clientAddress);
    setBScopeSummary(quote.scopeSummary);
    setBWorkSteps(quote.workSteps.length ? quote.workSteps : ['']);
    setBLineItems(quote.lineItems.length ? quote.lineItems : [{ id: '1', description: '', quantity: 1, unit: 'ea', unitCost: 0, total: 0 }]);
    setBMaterials(quote.materials.length ? quote.materials : ['']);
    setBAssumptions(quote.assumptions);
    setBExclusions(quote.exclusions);
    setBEstDuration(quote.estimatedDuration);
    setBValidityDays(quote.validityDays);
    setBPaymentTerms(quote.paymentTerms);
    setBContractorNotes(quote.contractorNotes);
    setAiFlags({});
    setCreateMode('building');
    setView('create');
  };

  const deleteQuote = (id: string) => { setQuotes(quotes.filter(q => q.id !== id)); setDeleteConfirm(null); showToast('Quote deleted'); };
  const duplicateQuote = (quote: QuoteData) => {
    const dup: QuoteData = { ...quote, id: `qt-${Date.now()}`, status: 'draft', createdAt: new Date().toISOString(), sentAt: undefined, respondedAt: undefined };
    setQuotes([dup, ...quotes]);
    showToast('Quote duplicated as draft');
  };

  const getStatusColor = (s: string) => {
    switch (s) { case 'draft': return 'bg-gray-100 text-gray-700'; case 'sent': return 'bg-teal-50 text-teal-700'; case 'accepted': return 'bg-green-100 text-green-700'; case 'declined': return 'bg-red-100 text-red-700'; case 'expired': return 'bg-yellow-100 text-yellow-700'; default: return 'bg-gray-100 text-gray-700'; }
  };
  const getStatusIcon = (s: string) => {
    switch (s) { case 'draft': return 'ri-draft-line'; case 'sent': return 'ri-send-plane-line'; case 'accepted': return 'ri-check-double-line'; case 'declined': return 'ri-close-circle-line'; case 'expired': return 'ri-time-line'; default: return 'ri-file-line'; }
  };
  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatCurrency = (n: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n);

  const AiBadge = ({ field }: { field: string }) => {
    if (!aiFlags[field]) return null;
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full ml-2">
        <i className="ri-sparkling-line text-xs"></i>AI-suggested
      </span>
    );
  };

  const templateCategories = ['all', ...Array.from(new Set(templates.map(t => t.category)))];
  const filteredTemplates = templates.filter(t => {
    const matchesCat = templateCategory === 'all' || t.category === templateCategory;
    const matchesSearch = templateSearch === '' || t.name.toLowerCase().includes(templateSearch.toLowerCase()) || t.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ─── ACCEPTANCE NOTIFICATION BANNER ───
  const renderAcceptanceBanner = () => {
    if (!showAcceptanceBanner) return null;
    return (
      <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white shadow-lg animate-[slideDown_0.4s_ease-out] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <i className="ri-check-double-line text-3xl"></i>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold">Quote Accepted!</h3>
              <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-semibold">Just now</span>
            </div>
            <p className="text-white/90 text-sm mb-3">
              <strong>{showAcceptanceBanner.clientName}</strong> accepted your quote for <strong>{showAcceptanceBanner.jobTitle}</strong> — {formatCurrency(showAcceptanceBanner.total)} confirmed.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-lg text-xs font-semibold">
                <i className="ri-check-line"></i>Status auto-updated to Accepted
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/15 rounded-lg text-xs font-semibold">
                <i className="ri-flow-chart"></i>Pipeline entry created in &quot;Scheduled&quot;
              </div>
            </div>
          </div>
          <button onClick={dismissAcceptanceBanner} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors cursor-pointer flex-shrink-0">
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>
      </div>
    );
  };

  // ─── ACCEPTANCE HISTORY PANEL ───
  const renderAcceptancePanel = () => {
    if (!showAcceptancePanel) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-lg w-full mx-4 shadow-2xl max-h-[80vh] flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><i className="ri-check-double-line text-green-600 text-xl"></i></div>
              <div>
                <h3 className="font-bold text-gray-900">Acceptance Notifications</h3>
                <p className="text-xs text-gray-500">{acceptanceNotifs.length} total</p>
              </div>
            </div>
            <button onClick={() => setShowAcceptancePanel(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"><i className="ri-close-line text-xl text-gray-500"></i></button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {acceptanceNotifs.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3"><i className="ri-notification-off-line text-gray-400 text-2xl"></i></div>
                <p className="text-sm text-gray-500">No acceptance notifications yet</p>
              </div>
            ) : (
              acceptanceNotifs.map(n => (
                <div key={n.id} onClick={() => markNotifRead(n.id)} className={`px-6 py-4 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-green-50/50' : ''}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"><i className="ri-check-double-line text-green-600"></i></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>{n.clientName} accepted</p>
                        {!n.read && <div className="w-2 h-2 bg-green-500 rounded-full"></div>}
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{n.jobTitle} — {formatCurrency(n.total)}</p>
                      <div className="flex items-center gap-3 text-[10px] text-gray-400">
                        <span>{formatDate(n.acceptedAt)}</span>
                        {n.pipelineCreated && <span className="flex items-center gap-1 text-teal-600"><i className="ri-flow-chart text-xs"></i>Pipeline entry created</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── TEMPLATE LIBRARY VIEW ───
  const renderTemplates = () => (
    <div className="space-y-6">
      <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>Back to Quotes</button>

      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Quote Template Library</h2>
          <p className="text-sm text-gray-500 mt-1">Save and reuse common quote formats for recurring job types</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white border border-gray-100 rounded-lg px-4 py-2.5">
          <i className="ri-archive-line text-lg"></i>
          <span className="font-semibold">{templates.length} templates</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {templateCategories.map(cat => (
            <button key={cat} onClick={() => setTemplateCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${templateCategory === cat ? 'bg-[#0B1F33] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {cat === 'all' ? 'All' : cat}
            </button>
          ))}
        </div>
        <div className="relative flex-1 md:w-64 md:flex-none">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" value={templateSearch} onChange={e => setTemplateSearch(e.target.value)} placeholder="Search templates..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
        </div>
      </div>

      {/* Template Cards */}
      {filteredTemplates.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-archive-line text-3xl text-gray-400"></i></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-500 text-sm">Create a quote and save it as a template to get started.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filteredTemplates.map(tpl => (
            <div key={tpl.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-bold text-gray-900 truncate">{tpl.name}</h3>
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold whitespace-nowrap">{tpl.category}</span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-2">{tpl.description}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">{tpl.lineItems.length} line items</span>
                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">{tpl.workSteps.length} steps</span>
                <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded text-xs font-medium">{tpl.estimatedDuration}</span>
                <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium">{formatCurrency(tpl.lineItems.reduce((s, li) => s + li.total, 0))} base</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><i className="ri-repeat-line"></i>Used {tpl.usageCount}x</span>
                  {tpl.lastUsed && <span className="flex items-center gap-1"><i className="ri-time-line"></i>Last {formatDate(tpl.lastUsed)}</span>}
                </div>
                <div className="flex gap-1.5">
                  {templateDeleteConfirm === tpl.id ? (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => deleteTemplate(tpl.id)} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 cursor-pointer whitespace-nowrap">Delete</button>
                      <button onClick={() => setTemplateDeleteConfirm(null)} className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap">Cancel</button>
                    </div>
                  ) : (
                    <>
                      <button onClick={() => setTemplateDeleteConfirm(tpl.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" title="Delete"><i className="ri-delete-bin-line text-sm"></i></button>
                      <button onClick={() => startFromTemplate(tpl)} className="px-4 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap transition-colors">
                        <i className="ri-add-line mr-1"></i>Use Template
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── LIST VIEW ───
  const renderList = () => (
    <div className="space-y-6">
      {/* Acceptance Banner */}
      {renderAcceptanceBanner()}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center"><i className="ri-file-list-3-line text-white text-lg"></i></div>
            <div><p className="text-xs text-gray-500">Total Quotes</p><p className="text-xl font-bold text-[#0B1F33]">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center"><i className="ri-send-plane-line text-teal-600 text-lg"></i></div>
            <div><p className="text-xs text-gray-500">Pending</p><p className="text-xl font-bold text-[#0B1F33]">{stats.sent}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center"><i className="ri-check-double-line text-green-600 text-lg"></i></div>
            <div><p className="text-xs text-gray-500">Won</p><p className="text-xl font-bold text-green-700">{formatCurrency(stats.acceptedValue)}</p></div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><i className="ri-money-dollar-circle-line text-amber-600 text-lg"></i></div>
            <div><p className="text-xs text-gray-500">Total Value</p><p className="text-xl font-bold text-[#0B1F33]">{formatCurrency(stats.totalValue)}</p></div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap">
          {(['all', 'draft', 'sent', 'accepted', 'declined'] as FilterStatus[]).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer whitespace-nowrap transition-all ${filter === s ? 'bg-[#0B1F33] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({s === 'all' ? stats.total : (stats as any)[s]})</span>
            </button>
          ))}
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Acceptance bell */}
          <button onClick={() => setShowAcceptancePanel(true)} className="relative w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" title="Acceptance Notifications">
            <i className="ri-notification-3-line text-lg text-gray-600"></i>
            {unreadAcceptanceCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadAcceptanceCount}</span>}
          </button>
          {/* Template library */}
          <button onClick={() => setView('templates')} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap transition-colors">
            <i className="ri-archive-line text-lg"></i>Templates
            <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-bold">{templates.length}</span>
          </button>
          <div className="relative flex-1 md:w-64">
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
            <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search quotes..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
          </div>
          <button onClick={() => { resetCreateForm(); setEditingQuote(null); setView('create'); }} className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap text-sm">
            <i className="ri-add-line text-lg"></i>New Quote
          </button>
        </div>
      </div>

      {/* Quote Cards */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-file-list-3-line text-3xl text-gray-400"></i></div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{searchTerm || filter !== 'all' ? 'No matching quotes' : 'No Quotes Yet'}</h3>
          <p className="text-gray-500 text-sm mb-4">Create your first quote to get started.</p>
          <button onClick={() => { resetCreateForm(); setEditingQuote(null); setView('create'); }} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 cursor-pointer whitespace-nowrap text-sm"><i className="ri-add-line mr-1"></i>Create Quote</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map(q => (
            <div key={q.id} className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-base font-bold text-gray-900 truncate">{q.jobTitle}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusColor(q.status)}`}>
                      <i className={`${getStatusIcon(q.status)} text-xs`}></i>{q.status.charAt(0).toUpperCase() + q.status.slice(1)}
                    </span>
                    {q.jobId && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">Linked Job</span>}
                    {q.status === 'accepted' && q.respondedAt && (
                      <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-xs font-medium flex items-center gap-1">
                        <i className="ri-flow-chart text-xs"></i>In Pipeline
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{q.clientName} &bull; {q.clientAddress || 'No address'}</p>
                  <p className="text-sm text-gray-600 line-clamp-1">{q.scopeSummary}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-teal-600">{formatCurrency(q.total)}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{q.lineItems.length} items</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                <div className="flex items-center gap-5 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><i className="ri-calendar-line"></i>{formatDate(q.createdAt)}</span>
                  {q.sentAt && <span className="flex items-center gap-1"><i className="ri-send-plane-line"></i>Sent {formatDate(q.sentAt)}</span>}
                  {q.respondedAt && <span className="flex items-center gap-1"><i className="ri-check-double-line text-green-600"></i>Accepted {formatDate(q.respondedAt)}</span>}
                  <span className="flex items-center gap-1"><i className="ri-time-line"></i>{q.estimatedDuration}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => generateQuotePDF(q)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" title="Download PDF"><i className="ri-download-2-line text-lg"></i></button>
                  <button onClick={() => duplicateQuote(q)} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors" title="Duplicate"><i className="ri-file-copy-line text-lg"></i></button>
                  {q.status === 'draft' && (
                    <button onClick={() => loadQuoteForEdit(q)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg cursor-pointer transition-colors" title="Edit"><i className="ri-edit-line text-lg"></i></button>
                  )}
                  <button onClick={() => { setSelectedQuote(q); setView('detail'); }} className="px-4 py-1.5 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#162d45] cursor-pointer whitespace-nowrap transition-colors">View</button>
                  {q.status === 'draft' && (
                    <button onClick={() => setDeleteConfirm(q.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors" title="Delete"><i className="ri-delete-bin-line text-lg"></i></button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // ─── DETAIL VIEW ───
  const renderDetail = () => {
    if (!selectedQuote) return null;
    const q = selectedQuote;
    const expiry = new Date(q.createdAt);
    expiry.setDate(expiry.getDate() + q.validityDays);
    return (
      <div className="space-y-6">
        <button onClick={() => { setView('list'); setSelectedQuote(null); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>Back to Quotes</button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1"><h2 className="text-2xl font-bold text-gray-900">{q.jobTitle}</h2><span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(q.status)}`}><i className={`${getStatusIcon(q.status)} mr-1`}></i>{q.status.charAt(0).toUpperCase() + q.status.slice(1)}</span>
              {q.status === 'accepted' && <span className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold flex items-center gap-1"><i className="ri-flow-chart"></i>Pipeline Entry Created</span>}
              </div>
              <p className="text-sm text-gray-500">Quote #{q.id.toUpperCase()} &bull; {q.clientName}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => generateQuotePDF(q)} className="flex items-center gap-2 px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#162d45] cursor-pointer whitespace-nowrap"><i className="ri-download-2-line"></i>Download PDF</button>
              {q.status === 'draft' && <button onClick={() => loadQuoteForEdit(q)} className="flex items-center gap-2 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 cursor-pointer whitespace-nowrap"><i className="ri-edit-line"></i>Edit</button>}
            </div>
          </div>
          <div className="px-8 py-6 space-y-8">
            {/* Acceptance info */}
            {q.status === 'accepted' && q.respondedAt && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0"><i className="ri-check-double-line text-green-600 text-xl"></i></div>
                <div>
                  <h4 className="text-sm font-bold text-green-900 mb-0.5">Client Accepted This Quote</h4>
                  <p className="text-xs text-green-700">Accepted on {formatDate(q.respondedAt)}. A pipeline entry has been automatically created in the &quot;Scheduled&quot; stage for this job.</p>
                </div>
              </div>
            )}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client</p>
                <p className="font-semibold text-gray-900">{q.clientName}</p>
                {q.clientEmail && <p className="text-sm text-gray-600 mt-1">{q.clientEmail}</p>}
                {q.clientPhone && <p className="text-sm text-gray-600">{q.clientPhone}</p>}
                {q.clientAddress && <p className="text-sm text-gray-600">{q.clientAddress}</p>}
              </div>
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quote Info</p>
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <span className="text-gray-500">Created:</span><span className="text-gray-900 font-medium text-right">{formatDate(q.createdAt)}</span>
                  <span className="text-gray-500">Valid Until:</span><span className="text-gray-900 font-medium text-right">{formatDate(expiry.toISOString())}</span>
                  <span className="text-gray-500">Duration:</span><span className="text-gray-900 font-medium text-right">{q.estimatedDuration}</span>
                  <span className="text-gray-500">Payment:</span><span className="text-gray-900 font-medium text-right">{q.paymentTerms}</span>
                </div>
              </div>
            </div>
            <div><h3 className="text-sm font-bold text-gray-700 mb-2">Scope of Work</h3><p className="text-gray-800 leading-relaxed text-sm">{q.scopeSummary}</p></div>
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Work Sequence</h3>
              <div className="space-y-2">
                {q.workSteps.map((step, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <div className="w-7 h-7 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                    <p className="text-sm text-gray-800 pt-0.5">{step}</p>
                  </div>
                ))}
              </div>
            </div>
            {q.materials.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">Materials</h3>
                <div className="flex flex-wrap gap-2">{q.materials.map((m, i) => <span key={i} className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">{m}</span>)}</div>
              </div>
            )}
            <div>
              <h3 className="text-sm font-bold text-gray-700 mb-3">Pricing Breakdown</h3>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50"><tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Unit Cost</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase">Total</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {q.lineItems.map(item => (
                      <tr key={item.id}><td className="px-4 py-3 text-sm text-gray-900">{item.description}</td><td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity} {item.unit}</td><td className="px-4 py-3 text-sm text-gray-600 text-right">{formatCurrency(item.unitCost)}</td><td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">{formatCurrency(item.total)}</td></tr>
                    ))}
                  </tbody>
                  <tfoot><tr className="bg-[#0B1F33]"><td colSpan={3} className="px-4 py-4 text-right font-bold text-white">Total Estimate:</td><td className="px-4 py-4 text-right font-bold text-teal-400 text-xl">{formatCurrency(q.total)}</td></tr></tfoot>
                </table>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {q.assumptions && <div className="bg-sky-50 border border-sky-200 rounded-lg p-4"><h4 className="text-xs font-bold text-sky-800 uppercase mb-2">Assumptions</h4><p className="text-sm text-sky-900 leading-relaxed">{q.assumptions}</p></div>}
              {q.exclusions && <div className="bg-red-50 border border-red-200 rounded-lg p-4"><h4 className="text-xs font-bold text-red-800 uppercase mb-2">Exclusions</h4><p className="text-sm text-red-900 leading-relaxed">{q.exclusions}</p></div>}
            </div>
            {q.contractorNotes && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4"><h4 className="text-xs font-bold text-amber-800 uppercase mb-2">Internal Notes</h4><p className="text-sm text-amber-900">{q.contractorNotes}</p></div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // ─── CREATE VIEW ───
  const renderCreate = () => {
    if (isAIGenerating) {
      return (
        <div className="space-y-6">
          <button onClick={() => { resetCreateForm(); setView('list'); }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>Back to Quotes</button>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center max-w-lg mx-auto">
            <div className="relative w-16 h-16 mx-auto mb-5">
              <div className="w-16 h-16 border-4 border-teal-200 rounded-full"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center"><i className="ri-sparkling-line text-teal-600 text-xl"></i></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">AI is Building Your Quote</h3>
            <p className="text-gray-500 text-sm mb-6">Analyzing project details and generating scope, materials, and pricing...</p>
            <div className="space-y-3 text-left max-w-xs mx-auto">
              <div className="flex items-center gap-2 text-sm text-teal-700"><i className="ri-checkbox-circle-fill"></i>Reading project details</div>
              <div className="flex items-center gap-2 text-sm text-teal-700"><i className="ri-checkbox-circle-fill"></i>Identifying work steps</div>
              <div className="flex items-center gap-2 text-sm text-gray-400 animate-pulse"><i className="ri-loader-4-line animate-spin"></i>Estimating materials &amp; pricing</div>
            </div>
          </div>
        </div>
      );
    }

    if (createMode === 'choose') {
      return (
        <div className="space-y-6">
          <button onClick={() => setView('list')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>Back to Quotes</button>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Create a New Quote</h2>
            <p className="text-gray-500 text-center mb-8">Choose how you want to start. AI will pre-fill the quote either way.</p>
            <div className="grid md:grid-cols-3 gap-6">
              <button onClick={() => setCreateMode('from-job')} className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-8 text-left transition-all cursor-pointer group">
                <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-200 transition-colors"><i className="ri-briefcase-line text-teal-600 text-2xl"></i></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">From Existing Job</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Select a job from your system. AI will pull in all details and pre-fill the entire proposal.</p>
              </button>
              <button onClick={() => setCreateMode('freeform')} className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-8 text-left transition-all cursor-pointer group">
                <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors"><i className="ri-sparkling-line text-amber-600 text-2xl"></i></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">New / Standalone</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Enter basic project info. AI will analyze and generate a full quote with steps, materials, and pricing.</p>
              </button>
              <button onClick={() => setView('templates')} className="bg-white border-2 border-gray-200 hover:border-teal-500 rounded-xl p-8 text-left transition-all cursor-pointer group">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors"><i className="ri-archive-line text-indigo-600 text-2xl"></i></div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">From Template</h3>
                <p className="text-sm text-gray-500 leading-relaxed">Use a saved template for recurring job types. Pre-fills scope, steps, pricing — just add client info.</p>
                <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-semibold"><i className="ri-archive-line"></i>{templates.length} templates saved</div>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (createMode === 'from-job') {
      return (
        <div className="space-y-6">
          <button onClick={() => setCreateMode('choose')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>Back</button>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-1">Select a Job</h2>
            <p className="text-gray-500 text-sm mb-6">AI will pull in the job details and pre-fill your quote.</p>
            <div className="space-y-3 mb-6">
              {activeJobs.map(job => (
                <button key={job.id} onClick={() => setSelectedJobId(job.id)} className={`w-full text-left p-4 rounded-lg border-2 transition-all cursor-pointer ${selectedJobId === job.id ? 'border-teal-500 bg-teal-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{job.title}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{job.client} &bull; {job.trade} &bull; {job.address}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedJobId === job.id ? 'border-teal-500 bg-teal-500' : 'border-gray-300'}`}>
                      {selectedJobId === job.id && <i className="ri-check-line text-white text-xs"></i>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={startFromJob} disabled={!selectedJobId} className={`w-full py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${selectedJobId ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <i className="ri-sparkling-line mr-2"></i>Generate Quote with AI
            </button>
          </div>
        </div>
      );
    }

    if (createMode === 'freeform') {
      return (
        <div className="space-y-6">
          <button onClick={() => setCreateMode('choose')} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>Back</button>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-1">New Quote Details</h2>
            <p className="text-gray-500 text-sm mb-6">Enter the basics — AI will analyze and build the full proposal.</p>
            <div className="space-y-5 bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Project Title <span className="text-red-500">*</span></label>
                <input type="text" value={freeformTitle} onChange={e => setFreeformTitle(e.target.value)} placeholder="e.g., Kitchen Sink Repair, Deck Construction..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5">Project Description</label>
                <textarea value={freeformDescription} onChange={e => setFreeformDescription(e.target.value)} placeholder="Describe the work needed..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" rows={3} maxLength={500} />
              </div>
              <div className="border-t border-gray-100 pt-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Information</p>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Client Name</label><input type="text" value={freeformClientName} onChange={e => setFreeformClientName(e.target.value)} placeholder="Full name" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                  <div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Email</label><input type="email" value={freeformClientEmail} onChange={e => setFreeformClientEmail(e.target.value)} placeholder="email@example.com" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                  <div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Phone</label><input type="tel" value={freeformClientPhone} onChange={e => setFreeformClientPhone(e.target.value)} placeholder="(555) 555-0000" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                  <div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Address</label><input type="text" value={freeformClientAddress} onChange={e => setFreeformClientAddress(e.target.value)} placeholder="Full address" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                </div>
              </div>
            </div>
            <button onClick={startFreeform} disabled={!freeformTitle.trim()} className={`w-full py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors mt-4 ${freeformTitle.trim() ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <i className="ri-sparkling-line mr-2"></i>Generate Quote with AI
            </button>
          </div>
        </div>
      );
    }

    // BUILDING MODE
    return (
      <div className="space-y-6">
        <button onClick={() => { if (editingQuote) { setEditingQuote(null); resetCreateForm(); setView('list'); } else { setCreateMode('choose'); } }} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 cursor-pointer font-semibold"><i className="ri-arrow-left-line"></i>{editingQuote ? 'Back to Quotes' : 'Back'}</button>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">{editingQuote ? 'Edit Quote' : 'Build Your Quote'}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{bJobTitle}{bJobId ? ' (linked to job)' : ''}</p>
            {Object.values(aiFlags).some(Boolean) && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2.5">
                <i className="ri-sparkling-line text-amber-600 mt-0.5"></i>
                <p className="text-xs text-amber-800">AI has pre-filled this quote. Review and edit any section. Fields marked &quot;AI-suggested&quot; were auto-generated.</p>
              </div>
            )}
          </div>

          <div className="px-8 py-6 space-y-7">
            {/* Client Info */}
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Client Information</p>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Name</label><input type="text" value={bClientName} onChange={e => setBClientName(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Email</label><input type="email" value={bClientEmail} onChange={e => setBClientEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Phone</label><input type="tel" value={bClientPhone} onChange={e => setBClientPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
                <div><label className="block text-xs font-semibold text-gray-700 mb-1">Address</label><input type="text" value={bClientAddress} onChange={e => setBClientAddress(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
              </div>
            </div>

            {/* Job Title (editable when from template) */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Job Title</label>
              <input type="text" value={bJobTitle} onChange={e => setBJobTitle(e.target.value)} placeholder="e.g., Kitchen Sink Repair" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Scope of Work<AiBadge field="scopeSummary" /></label>
              <textarea value={bScopeSummary} onChange={e => { setBScopeSummary(e.target.value); clearAiFlag('scopeSummary'); }} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" rows={3} maxLength={500} />
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Estimated Duration<AiBadge field="estimatedDuration" /></label>
              <input type="text" value={bEstDuration} onChange={e => { setBEstDuration(e.target.value); clearAiFlag('estimatedDuration'); }} placeholder="e.g., 2-3 days" className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>

            {/* Work Steps */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-800">Work Steps<AiBadge field="workSteps" /></label>
                <button onClick={addWorkStep} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"><i className="ri-add-line mr-1"></i>Add Step</button>
              </div>
              <div className="space-y-2">
                {bWorkSteps.map((step, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-7 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0">{i + 1}</div>
                    <input type="text" value={step} onChange={e => updateWorkStep(i, e.target.value)} placeholder="Describe this step..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                    {bWorkSteps.length > 1 && <button onClick={() => removeWorkStep(i)} className="px-2 text-red-400 hover:text-red-600 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>}
                  </div>
                ))}
              </div>
            </div>

            {/* Materials */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-800">Materials<AiBadge field="materials" /></label>
                <button onClick={addMaterial} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"><i className="ri-add-line mr-1"></i>Add Material</button>
              </div>
              <div className="space-y-2">
                {bMaterials.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <div className="w-7 h-9 bg-teal-50 rounded-lg flex items-center justify-center flex-shrink-0"><i className="ri-tools-line text-teal-600 text-xs"></i></div>
                    <input type="text" value={m} onChange={e => updateMaterial(i, e.target.value)} placeholder="Material name..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
                    {bMaterials.length > 1 && <button onClick={() => removeMaterial(i)} className="px-2 text-red-400 hover:text-red-600 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>}
                  </div>
                ))}
              </div>
            </div>

            {/* Line Items */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold text-gray-800">Pricing<AiBadge field="lineItems" /></label>
                <button onClick={addLineItem} className="text-xs text-teal-600 hover:text-teal-700 font-semibold cursor-pointer whitespace-nowrap"><i className="ri-add-line mr-1"></i>Add Item</button>
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50"><tr>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500">Description</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 w-20">Qty</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 w-20">Unit</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 w-28">Unit Cost</th>
                      <th className="px-3 py-2.5 text-left text-xs font-bold text-gray-500 w-28">Total</th>
                      <th className="px-3 py-2.5 w-10"></th>
                    </tr></thead>
                    <tbody className="divide-y divide-gray-100">
                      {bLineItems.map(item => (
                        <tr key={item.id}>
                          <td className="px-3 py-2"><input type="text" value={item.description} onChange={e => updateLineItem(item.id, 'description', e.target.value)} placeholder="Item" className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></td>
                          <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={e => updateLineItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" min="0" step="0.1" /></td>
                          <td className="px-3 py-2"><select value={item.unit} onChange={e => updateLineItem(item.id, 'unit', e.target.value)} className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm cursor-pointer focus:ring-2 focus:ring-teal-500 focus:border-transparent"><option value="ea">ea</option><option value="hours">hours</option><option value="days">days</option><option value="sqft">sqft</option><option value="lf">lf</option><option value="lot">lot</option></select></td>
                          <td className="px-3 py-2"><div className="relative"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">$</span><input type="number" value={item.unitCost} onChange={e => updateLineItem(item.id, 'unitCost', parseFloat(e.target.value) || 0)} className="w-full pl-5 pr-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" min="0" step="0.01" /></div></td>
                          <td className="px-3 py-2 font-semibold text-gray-900 text-sm">${item.total.toFixed(2)}</td>
                          <td className="px-3 py-2">{bLineItems.length > 1 && <button onClick={() => removeLineItem(item.id)} className="text-red-400 hover:text-red-600 cursor-pointer"><i className="ri-delete-bin-line text-sm"></i></button>}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr className="bg-gray-50"><td colSpan={4} className="px-3 py-3 text-right font-bold text-gray-900 text-sm">Total:</td><td className="px-3 py-3 font-bold text-teal-600 text-lg">${calcTotal().toFixed(2)}</td><td></td></tr></tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Assumptions */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Assumptions<AiBadge field="assumptions" /></label>
              <textarea value={bAssumptions} onChange={e => { setBAssumptions(e.target.value); clearAiFlag('assumptions'); }} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" rows={2} maxLength={500} />
            </div>

            {/* Exclusions */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Exclusions<AiBadge field="exclusions" /></label>
              <textarea value={bExclusions} onChange={e => { setBExclusions(e.target.value); clearAiFlag('exclusions'); }} className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" rows={2} maxLength={500} />
            </div>

            {/* Terms */}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Valid For (Days)</label><input type="number" value={bValidityDays} onChange={e => setBValidityDays(parseInt(e.target.value) || 30)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" min="1" /></div>
              <div><label className="block text-sm font-semibold text-gray-800 mb-1.5">Payment Terms</label><input type="text" value={bPaymentTerms} onChange={e => setBPaymentTerms(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" /></div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Internal Notes <span className="text-xs text-gray-400 font-normal">(not visible to client)</span></label>
              <textarea value={bContractorNotes} onChange={e => setBContractorNotes(e.target.value)} placeholder="Private notes for your records..." className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" rows={2} maxLength={500} />
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-5 border-t border-gray-100 flex items-center gap-3 bg-gray-50 rounded-b-xl">
            <button onClick={() => { if (editingQuote) { setEditingQuote(null); } resetCreateForm(); setView('list'); }} className="px-5 py-2.5 text-gray-600 hover:text-gray-800 font-semibold text-sm cursor-pointer whitespace-nowrap">Cancel</button>
            <div className="flex-1"></div>
            {/* Save as Template */}
            <button onClick={() => setShowSaveTemplate(true)} className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-lg font-semibold text-sm hover:bg-white cursor-pointer whitespace-nowrap transition-colors" title="Save as reusable template">
              <i className="ri-archive-line"></i>Save as Template
            </button>
            <button onClick={() => saveQuote('draft')} className="px-5 py-2.5 border border-gray-200 text-gray-700 rounded-lg font-semibold text-sm hover:bg-white cursor-pointer whitespace-nowrap"><i className="ri-save-line mr-1.5"></i>Save Draft</button>
            <button onClick={() => saveQuote('sent')} className="px-5 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 cursor-pointer whitespace-nowrap"><i className="ri-send-plane-line mr-1.5"></i>Send to Client</button>
          </div>
        </div>
      </div>
    );
  };

  // ─── SAVE AS TEMPLATE MODAL ───
  const renderSaveTemplateModal = () => {
    if (!showSaveTemplate) return null;
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl max-w-md w-full mx-4 shadow-2xl">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center"><i className="ri-archive-line text-indigo-600 text-xl"></i></div>
            <div>
              <h3 className="font-bold text-gray-900">Save as Template</h3>
              <p className="text-xs text-gray-500">Reuse this quote format for future jobs</p>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Template Name <span className="text-red-500">*</span></label>
              <input type="text" value={saveTemplateName} onChange={e => setSaveTemplateName(e.target.value)} placeholder="e.g., Standard Plumbing Repair" className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Category</label>
              <select value={saveTemplateCategory} onChange={e => setSaveTemplateCategory(e.target.value)} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm cursor-pointer focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                <option value="General">General</option>
                <option value="Plumbing">Plumbing</option>
                <option value="HVAC">HVAC</option>
                <option value="Electrical">Electrical</option>
                <option value="Painting">Painting</option>
                <option value="Tile Work">Tile Work</option>
                <option value="Roofing">Roofing</option>
                <option value="Carpentry">Carpentry</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-1.5">Description</label>
              <textarea value={saveTemplateDesc} onChange={e => setSaveTemplateDesc(e.target.value)} placeholder="Brief description of when to use this template..." className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none" rows={2} maxLength={500} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <p className="text-xs text-gray-500 mb-2 font-semibold">Template will include:</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">Scope of work</span>
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">{bWorkSteps.filter(s => s.trim()).length} work steps</span>
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">{bLineItems.length} line items</span>
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">{bMaterials.filter(m => m.trim()).length} materials</span>
                <span className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600">Terms &amp; conditions</span>
              </div>
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3 justify-end bg-gray-50 rounded-b-xl">
            <button onClick={() => { setShowSaveTemplate(false); setSaveTemplateName(''); setSaveTemplateDesc(''); }} className="px-5 py-2.5 text-gray-600 font-semibold text-sm cursor-pointer whitespace-nowrap hover:text-gray-800">Cancel</button>
            <button onClick={handleSaveAsTemplate} disabled={!saveTemplateName.trim()} className={`px-5 py-2.5 rounded-lg font-semibold text-sm whitespace-nowrap transition-colors ${saveTemplateName.trim() ? 'bg-teal-600 text-white hover:bg-teal-700 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
              <i className="ri-archive-line mr-1.5"></i>Save Template
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-28 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-lg shadow-lg text-sm font-semibold animate-[slideIn_0.3s_ease] ${toast.type === 'success' ? 'bg-green-600 text-white' : toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-[#0B1F33] text-white'}`}>
          <i className={toast.type === 'success' ? 'ri-check-line' : toast.type === 'error' ? 'ri-error-warning-line' : 'ri-information-line'}></i>{toast.message}
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><i className="ri-delete-bin-line text-red-600 text-xl"></i></div>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Delete Quote?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-lg font-semibold text-sm text-gray-700 hover:bg-gray-50 cursor-pointer whitespace-nowrap">Cancel</button>
              <button onClick={() => deleteQuote(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 cursor-pointer whitespace-nowrap">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Save Template Modal */}
      {renderSaveTemplateModal()}

      {/* Acceptance Panel */}
      {renderAcceptancePanel()}

      {view === 'list' && renderList()}
      {view === 'detail' && renderDetail()}
      {view === 'create' && renderCreate()}
      {view === 'templates' && renderTemplates()}

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(16px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
