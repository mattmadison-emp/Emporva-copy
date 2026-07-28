import { useState, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import { getEstimatedLifespan } from '../../../utils/systemLifespans';
import {
  uploadToStaging,
  classifyStagedDocument,
  fileStagedDocument,
  discardStaged,
  type IntakeClassification,
} from '../../../services/smartIntakeService';

// Build a system record from its documentation: the homeowner drops a manual,
// receipt, warranty or a photo of the unit's label; AI reads it and prefills
// the whole system record (name, category, type, brand/model, install year,
// lifespan). One save creates the system AND attaches the document with its
// AI insights — or attaches the document to an existing matching system.

interface RegisteredSystem {
  id: string;
  name: string;
  type: string;
  category: string;
}

interface BuildSystemFromDocModalProps {
  userId: string;
  propertyId: string | null;
  systems: RegisteredSystem[];
  categories: string[];
  atCap: boolean;
  onClose: () => void;
  onDone: () => void | Promise<void>;
}

const MAX_DOCUMENT_BYTES = 25 * 1024 * 1024; // matches the system-docs upload limit
const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel',
  'text/plain',
];
const DOC_TYPES = ['manual', 'warranty', 'receipt', 'other'] as const;

function isAllowedMime(file: File): boolean {
  if (!file.type) return true;
  return ALLOWED_MIME_PREFIXES.some(p => file.type === p || file.type.startsWith(p));
}

type Phase = 'pick' | 'reading' | 'form' | 'saving';

export default function BuildSystemFromDocModal({
  userId,
  propertyId,
  systems,
  categories,
  atCap,
  onClose,
  onDone,
}: BuildSystemFromDocModalProps) {
  const [phase, setPhase] = useState<Phase>('pick');
  const [file, setFile] = useState<File | null>(null);
  const [stagingPath, setStagingPath] = useState<string | null>(null);
  const [classification, setClassification] = useState<IntakeClassification | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 'new' builds a fresh record; a system id attaches the doc to that system.
  const [mode, setMode] = useState<'new' | string>('new');

  // System form, prefilled from the AI reading.
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [installYear, setInstallYear] = useState<number | ''>('');
  const [condition, setCondition] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [notes, setNotes] = useState('');
  const [lifespan, setLifespan] = useState<number | ''>('');
  const [lifespanTouched, setLifespanTouched] = useState(false);

  // Document details.
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState<string>('manual');

  const refreshLifespan = (cat: string, t: string) => {
    if (!lifespanTouched) setLifespan(getEstimatedLifespan(cat, t));
  };

  const handleFile = async (picked: File | null) => {
    if (!picked || phase !== 'pick') return;
    setError(null);
    if (picked.size > MAX_DOCUMENT_BYTES) {
      setError('File exceeds the 25 MB limit.');
      return;
    }
    if (!isAllowedMime(picked)) {
      setError('That file type is not supported. Use a PDF, image, or text file.');
      return;
    }

    setFile(picked);
    setPhase('reading');
    try {
      const path = await uploadToStaging(picked, userId);
      setStagingPath(path);
      const result = await classifyStagedDocument(path, picked.name);
      const c = result.classification;
      setClassification(c);
      setAiNote(result.message || null);

      const s = c.suggestedNewSystem;
      const matched = c.matchedSystemId ? systems.find(sys => sys.id === c.matchedSystemId) : null;
      setMode(matched ? matched.id : 'new');
      setName(s?.name || matched?.name || '');
      setCategory(s?.category && categories.includes(s.category) ? s.category : matched?.category || '');
      setType(s?.type || matched?.type || '');
      setInstallYear(s?.installYear ?? '');
      setNotes(s?.brandModel ? `Brand/model: ${s.brandModel}` : '');
      setLifespan(getEstimatedLifespan(s?.category || matched?.category, s?.type || matched?.type));
      setLifespanTouched(false);
      setDocTitle(c.title);
      setDocType(c.systemDocType || 'other');
      setPhase('form');
    } catch (err) {
      console.error('[build-system] reading failed:', err);
      setError(err instanceof Error ? err.message : 'Could not read the document. Please try again.');
      setFile(null);
      setPhase('pick');
    }
  };

  const handleCancel = async () => {
    if (stagingPath) await discardStaged(stagingPath);
    onClose();
  };

  const creatingNew = mode === 'new';
  const canSave =
    phase === 'form' &&
    docTitle.trim() &&
    (creatingNew ? Boolean(name.trim() && category && type.trim() && !atCap) : true);

  const handleSave = async () => {
    if (!canSave || !file || !stagingPath || !classification) return;
    setPhase('saving');
    setError(null);

    try {
      let systemId = creatingNew ? null : mode;

      if (creatingNew) {
        if (!propertyId) throw new Error('Complete your property setup before adding systems.');
        const { data: created, error: sysErr } = await supabase
          .from('property_systems')
          .insert({
            property_id: propertyId,
            user_id: userId,
            name: name.trim(),
            category,
            type: type.trim(),
            install_year: installYear || null,
            last_service_date: null,
            condition,
            notes: notes.trim() || null,
            estimated_lifespan_years: lifespan || null,
          })
          .select('id')
          .single();
        if (sysErr || !created) throw new Error(sysErr?.message || 'Could not create the system.');
        systemId = created.id;
      }

      await fileStagedDocument({
        stagingPath,
        fileName: file.name,
        fileSizeBytes: file.size,
        destination: 'system',
        title: docTitle.trim(),
        systemDocType: docType,
        systemId,
        extractedText: classification.extractedText,
        insights: classification.insights,
      });

      await onDone();
      onClose();
    } catch (err) {
      console.error('[build-system] save failed:', err);
      setError(err instanceof Error ? err.message : 'Could not save. Please try again.');
      setPhase('form');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-[#0B1F33] rounded-lg flex items-center justify-center">
                <i className="ri-sparkling-2-line text-lg text-[#D4B483]"></i>
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">Build from Document</h3>
                <p className="text-xs text-[#6B7C8F]">
                  Upload a manual, receipt, warranty or unit-label photo — we&apos;ll build the system
                  record for you.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer flex-shrink-0"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Step 1: pick / read */}
          {(phase === 'pick' || phase === 'reading') && (
            <div
              onDragOver={e => {
                e.preventDefault();
                if (phase === 'pick') setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => {
                e.preventDefault();
                setDragActive(false);
                handleFile(e.dataTransfer.files?.[0] || null);
              }}
              onClick={() => phase === 'pick' && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-colors ${
                phase === 'reading'
                  ? 'border-gray-200 bg-[#F9F9FB] cursor-wait'
                  : dragActive
                    ? 'border-teal-400 bg-teal-50 cursor-pointer'
                    : 'border-gray-300 hover:border-teal-400 hover:bg-[#F9F9FB] cursor-pointer'
              }`}
            >
              {phase === 'reading' ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm font-semibold text-[#0B1F33]">
                    Reading &quot;{file?.name}&quot; with AI...
                  </p>
                  <p className="text-xs text-[#6B7C8F]">
                    Extracting brand, model, dates and specs. This usually takes a few seconds.
                  </p>
                </div>
              ) : (
                <>
                  <i className="ri-upload-cloud-2-line text-3xl text-[#6B7C8F]"></i>
                  <p className="mt-2 text-sm font-semibold text-[#0B1F33]">
                    Drag &amp; drop a document here, or click to browse
                  </p>
                  <p className="text-xs text-[#6B7C8F] mt-1">PDF, image, or text file. Max 25 MB.</p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={e => handleFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </div>
          )}

          {/* Step 2: confirm the built record */}
          {(phase === 'form' || phase === 'saving') && classification && (
            <div className="space-y-4">
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-start gap-2.5">
                <i className="ri-sparkling-2-line text-teal-600 mt-0.5"></i>
                <div>
                  <p className="text-sm text-[#0B1F33]">{classification.reason}</p>
                  {aiNote && <p className="text-xs text-[#6B7C8F] mt-1">{aiNote}</p>}
                </div>
              </div>

              {/* Existing-system match: attach vs create */}
              {classification.matchedSystemId && (
                <div className="space-y-2">
                  {[
                    {
                      value: classification.matchedSystemId,
                      label: `Attach to existing: ${
                        systems.find(s => s.id === classification.matchedSystemId)?.name || 'system'
                      }`,
                      hint: 'Just files the document under the system you already track.',
                    },
                    {
                      value: 'new',
                      label: 'Create a new system record',
                      hint: 'Builds a separate record from this document.',
                    },
                  ].map(opt => (
                    <label
                      key={opt.value}
                      className={`flex items-start gap-2.5 border rounded-lg p-3 cursor-pointer transition-colors ${
                        mode === opt.value ? 'border-teal-400 bg-teal-50/50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={mode === opt.value}
                        onChange={() => setMode(opt.value)}
                        className="mt-0.5 accent-teal-600"
                      />
                      <span>
                        <span className="block text-sm font-semibold text-[#0B1F33]">{opt.label}</span>
                        <span className="block text-xs text-[#6B7C8F]">{opt.hint}</span>
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {creatingNew && atCap && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs sm:text-sm text-amber-900">
                  <i className="ri-information-line mr-1"></i>
                  You&apos;ve reached the system limit, so a new record can&apos;t be created — but you can
                  still attach this document to an existing system above.
                </div>
              )}

              {creatingNew && !atCap && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">System name *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      maxLength={80}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={e => {
                        setCategory(e.target.value);
                        refreshLifespan(e.target.value, type);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="">Select...</option>
                      {categories.map(c => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Type *</label>
                    <input
                      type="text"
                      value={type}
                      onChange={e => {
                        setType(e.target.value);
                        refreshLifespan(category, e.target.value);
                      }}
                      maxLength={80}
                      placeholder="e.g. Gas furnace"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Install year</label>
                    <input
                      type="number"
                      value={installYear}
                      onChange={e => setInstallYear(e.target.value ? parseInt(e.target.value, 10) : '')}
                      min={1900}
                      max={new Date().getFullYear()}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Condition</label>
                    <select
                      value={condition}
                      onChange={e => setCondition(e.target.value as typeof condition)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    >
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="fair">Fair</option>
                      <option value="poor">Poor</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">
                      Estimated lifespan (years)
                    </label>
                    <input
                      type="number"
                      value={lifespan}
                      onChange={e => {
                        setLifespanTouched(true);
                        setLifespan(e.target.value ? parseInt(e.target.value, 10) : '');
                      }}
                      min={1}
                      max={100}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Notes</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      maxLength={200}
                      placeholder="Brand, model, serial..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

              {/* Document details */}
              <div className="border-t border-gray-100 pt-3 grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Document name *</label>
                  <input
                    type="text"
                    value={docTitle}
                    onChange={e => setDocTitle(e.target.value)}
                    maxLength={120}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Document type</label>
                  <select
                    value={docType}
                    onChange={e => setDocType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  >
                    {DOC_TYPES.map(t => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {classification.insights.length > 0 && (
                <div className="bg-[#F9F9FB] rounded-lg p-3">
                  <p className="text-xs font-semibold text-[#0B1F33] mb-1.5">
                    <i className="ri-lightbulb-line text-[#D4B483] mr-1"></i>
                    What we found in this document
                  </p>
                  <ul className="space-y-1">
                    {classification.insights.map((line, i) => (
                      <li key={i} className="text-xs text-[#6B7C8F] flex gap-1.5">
                        <span className="text-teal-600">•</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-1">
                <button
                  onClick={handleCancel}
                  disabled={phase === 'saving'}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!canSave || phase === 'saving'}
                  className="flex-1 px-4 py-2.5 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {phase === 'saving' ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-1.5"></i>
                      Saving...
                    </>
                  ) : creatingNew ? (
                    'Create system & attach document'
                  ) : (
                    'Attach document'
                  )}
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">
                <i className="ri-error-warning-line mr-1"></i>
                {error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
