import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { getEstimatedLifespan } from '../../utils/systemLifespans';
import {
  uploadToStaging,
  classifyStagedDocument,
  fileStagedDocument,
  discardStaged,
  type IntakeClassification,
} from '../../services/smartIntakeService';

// Smart Intake — the "front door" for building a home's intelligence. The
// homeowner drops any document (manual, warranty, receipt, insurance, permit…),
// AI reads it and suggests a home for it, and one confirmation files it into
// the Systems Profile or the Document Vault with the AI insights attached.

interface UserSystem {
  id: string;
  name: string | null;
  type: string | null;
  category: string | null;
}

interface FiledDoc {
  title: string;
  destinationLabel: string;
}

const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024; // 10 MB — matches the Document Vault
const ALLOWED_MIME_PREFIXES = [
  'image/',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument',
  'application/vnd.ms-excel',
  'text/plain',
];

const SYSTEM_DOC_TYPES = ['manual', 'warranty', 'receipt', 'other'] as const;
const VAULT_CATEGORIES = [
  'Insurance', 'Warranty', 'Inspection', 'Permit', 'Receipt',
  'Appliance Manual', 'Tax Document', 'Appraisal', 'Contract', 'Other',
];

type Phase = 'idle' | 'uploading' | 'classifying' | 'confirm' | 'filing';

function isAllowedMime(file: File): boolean {
  if (!file.type) return true; // some browsers omit type for less common extensions
  return ALLOWED_MIME_PREFIXES.some(p => file.type === p || file.type.startsWith(p));
}

export default function SmartIntakeCard() {
  const { user } = useAuth();
  const [phase, setPhase] = useState<Phase>('idle');
  const [queue, setQueue] = useState<File[]>([]);
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [stagingPath, setStagingPath] = useState<string | null>(null);
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filed, setFiled] = useState<FiledDoc[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [systems, setSystems] = useState<UserSystem[]>([]);
  const [propertyId, setPropertyId] = useState<string | null>(null);

  // Confirm-step form state, seeded from the AI classification.
  const [classification, setClassification] = useState<IntakeClassification | null>(null);
  const [title, setTitle] = useState('');
  const [destination, setDestination] = useState<'system' | 'property'>('property');
  const [systemChoice, setSystemChoice] = useState(''); // system id, or 'new'
  const [docType, setDocType] = useState<string>('other');
  const [vaultCategory, setVaultCategory] = useState('Other');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('property_systems')
      .select('id, name, type, category')
      .eq('user_id', user.id)
      .then(({ data }) => setSystems(data || []));
    supabase
      .from('properties')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()
      .then(({ data }) => setPropertyId(data?.id || null));
  }, [user]);

  const startNext = useCallback(
    async (files: File[]) => {
      if (!user || files.length === 0) {
        setPhase('idle');
        setCurrentFile(null);
        return;
      }
      const [file, ...rest] = files;
      setQueue(rest);
      setCurrentFile(file);
      setError(null);
      setAiNote(null);
      setPhase('uploading');

      try {
        const path = await uploadToStaging(file, user.id);
        setStagingPath(path);
        setPhase('classifying');

        const result = await classifyStagedDocument(path, file.name);
        const c = result.classification;
        setClassification(c);
        setAiNote(result.message || null);

        setTitle(c.title);
        setDestination(c.destination);
        setDocType(c.systemDocType || 'other');
        setVaultCategory(c.vaultCategory || 'Other');
        setSystemChoice(c.matchedSystemId || (c.suggestedNewSystem ? 'new' : ''));
        setPhase('confirm');
      } catch (err) {
        console.error('[smart-intake] intake failed:', err);
        setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
        setPhase('idle');
        setCurrentFile(null);
      }
    },
    [user],
  );

  const handleFiles = (list: FileList | File[] | null) => {
    if (!list || phase !== 'idle') return;
    setError(null);
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        setError(`"${file.name}" exceeds the 10 MB limit and was skipped.`);
        continue;
      }
      if (!isAllowedMime(file)) {
        setError(`"${file.name}" is not a supported file type and was skipped.`);
        continue;
      }
      accepted.push(file);
    }
    if (accepted.length > 0) startNext(accepted);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const advanceQueue = () => {
    setStagingPath(null);
    setClassification(null);
    if (queue.length > 0) {
      startNext(queue);
    } else {
      setPhase('idle');
      setCurrentFile(null);
    }
  };

  const handleSkip = async () => {
    if (stagingPath) await discardStaged(stagingPath);
    advanceQueue();
  };

  const handleConfirm = async () => {
    if (!user || !currentFile || !stagingPath || !classification) return;
    if (destination === 'system' && !systemChoice) return;
    setPhase('filing');
    setError(null);

    try {
      let systemId = destination === 'system' ? systemChoice : null;

      // "Create new" — register the suggested system first, then file into it.
      if (destination === 'system' && systemChoice === 'new') {
        const s = classification.suggestedNewSystem;
        if (!s || !propertyId) throw new Error('Complete your property setup before adding systems.');
        const { data: created, error: sysErr } = await supabase
          .from('property_systems')
          .insert({
            property_id: propertyId,
            user_id: user.id,
            name: s.name,
            category: s.category,
            type: s.type,
            install_year: s.installYear || null,
            condition: 'good',
            notes: s.brandModel ? `Brand/model: ${s.brandModel}` : null,
            estimated_lifespan_years: getEstimatedLifespan(s.category, s.type) || null,
          })
          .select('id, name, type, category')
          .single();
        if (sysErr || !created) throw new Error(sysErr?.message || 'Could not create the system.');
        setSystems(prev => [...prev, created]);
        systemId = created.id;
      }

      await fileStagedDocument({
        stagingPath,
        fileName: currentFile.name,
        fileSizeBytes: currentFile.size,
        destination,
        title,
        systemDocType: destination === 'system' ? docType : null,
        vaultCategory: destination === 'property' ? vaultCategory : null,
        systemId,
        extractedText: classification.extractedText,
        insights: classification.insights,
      });

      const systemLabel =
        destination === 'system'
          ? systems.find(s => s.id === systemId)?.name ||
            classification.suggestedNewSystem?.name ||
            'system'
          : null;
      setFiled(prev => [
        {
          title: title || currentFile.name,
          destinationLabel:
            destination === 'system'
              ? `Systems Profile · ${systemLabel}`
              : `Property Memory · ${vaultCategory}`,
        },
        ...prev,
      ]);
      advanceQueue();
    } catch (err) {
      console.error('[smart-intake] filing failed:', err);
      setError(err instanceof Error ? err.message : 'Could not file the document. Please try again.');
      setPhase('confirm');
    }
  };

  const busy = phase === 'uploading' || phase === 'classifying';
  const suggested = classification?.suggestedNewSystem;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div className="p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 bg-[#0B1F33] rounded-lg flex items-center justify-center flex-shrink-0">
            <i className="ri-sparkling-2-line text-xl text-[#D4B483]"></i>
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">
              Build your home&apos;s intelligence
            </h3>
            <p className="text-xs sm:text-sm text-[#6B7C8F]">
              Drop any manual, warranty, receipt, insurance policy or permit — we&apos;ll read it and
              file it into your Systems Profile or Property Memory.
            </p>
          </div>
        </div>

        {/* Dropzone / progress */}
        {(phase === 'idle' || busy) && (
          <div
            onDragOver={e => {
              e.preventDefault();
              if (phase === 'idle') setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={e => {
              e.preventDefault();
              setDragActive(false);
              handleFiles(e.dataTransfer.files);
            }}
            onClick={() => phase === 'idle' && fileInputRef.current?.click()}
            className={`mt-4 border-2 border-dashed rounded-xl p-6 sm:p-8 text-center transition-colors ${
              busy
                ? 'border-gray-200 bg-[#F9F9FB] cursor-wait'
                : dragActive
                  ? 'border-[#D4B483] bg-[#D4B483]/10 cursor-pointer'
                  : 'border-gray-300 hover:border-[#D4B483] hover:bg-[#F9F9FB] cursor-pointer'
            }`}
          >
            {busy ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-semibold text-[#0B1F33]">
                  {phase === 'uploading'
                    ? `Uploading "${currentFile?.name}"...`
                    : `Reading "${currentFile?.name}" with AI...`}
                </p>
                {phase === 'classifying' && (
                  <p className="text-xs text-[#6B7C8F]">This usually takes a few seconds.</p>
                )}
              </div>
            ) : (
              <>
                <i className="ri-upload-cloud-2-line text-3xl text-[#6B7C8F]"></i>
                <p className="mt-2 text-sm font-semibold text-[#0B1F33]">
                  Drag &amp; drop files here, or click to browse
                </p>
                <p className="text-xs text-[#6B7C8F] mt-1">PDF, image, or document file. Max 10 MB each.</p>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
              onChange={e => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>
        )}

        {/* Confirm step */}
        {(phase === 'confirm' || phase === 'filing') && classification && (
          <div className="mt-4 border border-[#D4B483]/50 bg-[#D4B483]/5 rounded-xl p-4 sm:p-5">
            <div className="flex items-start gap-2.5 mb-4">
              <i className="ri-sparkling-2-line text-lg text-[#D4B483] mt-0.5"></i>
              <div>
                <p className="text-sm text-[#0B1F33] font-medium">{classification.reason}</p>
                {aiNote && <p className="text-xs text-[#6B7C8F] mt-1">{aiNote}</p>}
                <p className="text-xs text-[#6B7C8F] mt-1 truncate">File: {currentFile?.name}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Document name</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  maxLength={120}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0B1F33] mb-1">File into</label>
                <select
                  value={destination}
                  onChange={e => setDestination(e.target.value as 'system' | 'property')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                >
                  <option value="system">Systems Profile</option>
                  <option value="property">Property Memory (Document Vault)</option>
                </select>
              </div>

              {destination === 'system' ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">System</label>
                    <select
                      value={systemChoice}
                      onChange={e => setSystemChoice(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                    >
                      <option value="">Select a system...</option>
                      {suggested && (
                        <option value="new">
                          + Add new: {suggested.name} ({suggested.category})
                        </option>
                      )}
                      {systems.map(s => (
                        <option key={s.id} value={s.id}>
                          {[s.name, s.type].filter(Boolean).join(' — ')}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Document type</label>
                    <select
                      value={docType}
                      onChange={e => setDocType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                    >
                      {SYSTEM_DOC_TYPES.map(t => (
                        <option key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-[#0B1F33] mb-1">Category</label>
                  <select
                    value={vaultCategory}
                    onChange={e => setVaultCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  >
                    {VAULT_CATEGORIES.map(c => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {classification.insights.length > 0 && (
              <div className="mt-3 bg-white rounded-lg border border-gray-100 p-3">
                <p className="text-xs font-semibold text-[#0B1F33] mb-1.5">
                  <i className="ri-lightbulb-line text-[#D4B483] mr-1"></i>
                  What we found
                </p>
                <ul className="space-y-1">
                  {classification.insights.map((line, i) => (
                    <li key={i} className="text-xs text-[#6B7C8F] flex gap-1.5">
                      <span className="text-[#14B8A6]">•</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 mt-4">
              <button
                onClick={handleSkip}
                disabled={phase === 'filing'}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Don&apos;t keep this file
              </button>
              <button
                onClick={handleConfirm}
                disabled={
                  phase === 'filing' || !title.trim() || (destination === 'system' && !systemChoice)
                }
                className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {phase === 'filing' ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-1.5"></i>
                    Filing...
                  </>
                ) : (
                  'Looks right — file it'
                )}
              </button>
            </div>
            {queue.length > 0 && (
              <p className="text-xs text-[#6B7C8F] mt-2 text-center">
                {queue.length} more {queue.length === 1 ? 'file' : 'files'} waiting
              </p>
            )}
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

        {/* Session results */}
        {filed.length > 0 && (
          <div className="mt-4 space-y-1.5">
            {filed.map((doc, i) => (
              <div key={i} className="flex items-center gap-2 text-xs sm:text-sm">
                <i className="ri-checkbox-circle-fill text-[#14B8A6]"></i>
                <span className="font-semibold text-[#0B1F33] truncate">{doc.title}</span>
                <span className="text-[#6B7C8F] whitespace-nowrap">→ {doc.destinationLabel}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
