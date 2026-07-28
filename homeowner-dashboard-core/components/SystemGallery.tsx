import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import BeforeAfterSlider from './BeforeAfterSlider';

// SystemGallery renders every image uploaded across the user's systems and lets
// them build "before / after" comparison pairs (persisted in system_photo_pairs,
// migration 057). Photos are image-type rows in property_system_documents; the
// system-documents bucket is private, so display uses short-lived signed URLs.

export interface GalleryDocument {
  id: string;
  name: string;
  fileName: string;
  storagePath: string;
}

export interface GallerySystem {
  id: string;
  name: string;
  category: string;
  documents?: GalleryDocument[];
}

interface PhotoPair {
  id: string;
  systemId: string;
  beforeDocId: string;
  afterDocId: string;
  title: string | null;
}

interface SystemGalleryProps {
  systems: GallerySystem[];
  userId: string | null;
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|heic|heif|bmp|avif)$/i;
const isImage = (fileName: string) => IMAGE_EXT.test(fileName || '');

export default function SystemGallery({ systems, userId }: SystemGalleryProps) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [pairs, setPairs] = useState<PhotoPair[]>([]);
  const [loadingPairs, setLoadingPairs] = useState(true);
  const [sideBySide, setSideBySide] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);

  // Create-comparison modal state
  const [showCreate, setShowCreate] = useState(false);
  const [createSystemId, setCreateSystemId] = useState('');
  const [beforeDocId, setBeforeDocId] = useState('');
  const [afterDocId, setAfterDocId] = useState('');
  const [pairTitle, setPairTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  // Flatten all image documents, tagged with their system.
  const imageDocs = useMemo(() => {
    const out: { systemId: string; systemName: string; doc: GalleryDocument }[] = [];
    for (const s of systems) {
      for (const d of s.documents || []) {
        if (isImage(d.fileName)) out.push({ systemId: s.id, systemName: s.name, doc: d });
      }
    }
    return out;
  }, [systems]);

  // Systems that have at least two photos — the only ones that can form a pair.
  const pairableSystems = useMemo(
    () => systems.filter(s => (s.documents || []).filter(d => isImage(d.fileName)).length >= 2),
    [systems],
  );

  // Resolve signed URLs for every image (covers both the grid and the pairs).
  const pathKey = useMemo(() => imageDocs.map(i => i.doc.storagePath).join('|'), [imageDocs]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const paths = imageDocs.map(i => i.doc.storagePath);
      if (paths.length === 0) {
        setSignedUrls({});
        return;
      }
      const { data } = await supabase.storage.from('system-documents').createSignedUrls(paths, 3600);
      if (cancelled || !data) return;
      const byPath: Record<string, string> = {};
      for (const r of data) {
        if (r.signedUrl && r.path) byPath[r.path] = r.signedUrl;
      }
      const byDoc: Record<string, string> = {};
      for (const item of imageDocs) {
        const url = byPath[item.doc.storagePath];
        if (url) byDoc[item.doc.id] = url;
      }
      setSignedUrls(byDoc);
    };
    run();
    return () => { cancelled = true; };
    // pathKey captures the set of image paths; imageDocs is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey]);

  const fetchPairs = useCallback(async () => {
    if (!userId) {
      setLoadingPairs(false);
      return;
    }
    setLoadingPairs(true);
    const { data } = await supabase
      .from('system_photo_pairs')
      .select('id, system_id, before_doc_id, after_doc_id, title')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setPairs(
      (data || []).map(p => ({
        id: p.id,
        systemId: p.system_id,
        beforeDocId: p.before_doc_id,
        afterDocId: p.after_doc_id,
        title: p.title,
      })),
    );
    setLoadingPairs(false);
  }, [userId]);

  useEffect(() => {
    fetchPairs();
  }, [fetchPairs]);

  const openCreate = () => {
    const first = pairableSystems[0];
    setCreateSystemId(first?.id || '');
    setBeforeDocId('');
    setAfterDocId('');
    setPairTitle('');
    setCreateError('');
    setShowCreate(true);
  };

  const createSystemImages = useMemo(
    () => imageDocs.filter(i => i.systemId === createSystemId),
    [imageDocs, createSystemId],
  );

  const handleCreatePair = async () => {
    if (!userId || !createSystemId || !beforeDocId || !afterDocId) return;
    if (beforeDocId === afterDocId) {
      setCreateError('Pick two different photos for before and after.');
      return;
    }
    setSaving(true);
    setCreateError('');
    const { data, error } = await supabase
      .from('system_photo_pairs')
      .insert({
        user_id: userId,
        system_id: createSystemId,
        before_doc_id: beforeDocId,
        after_doc_id: afterDocId,
        title: pairTitle.trim() || null,
      })
      .select('id, system_id, before_doc_id, after_doc_id, title')
      .single();
    if (error || !data) {
      setCreateError('Could not save the comparison. Please try again.');
      setSaving(false);
      return;
    }
    setPairs(prev => [
      { id: data.id, systemId: data.system_id, beforeDocId: data.before_doc_id, afterDocId: data.after_doc_id, title: data.title },
      ...prev,
    ]);
    setSaving(false);
    setShowCreate(false);
  };

  const handleDeletePair = async (id: string) => {
    const { error } = await supabase.from('system_photo_pairs').delete().eq('id', id);
    if (error) return;
    setPairs(prev => prev.filter(p => p.id !== id));
  };

  // Only render pairs whose images are still present and have signed URLs.
  const resolvablePairs = pairs.filter(
    p => signedUrls[p.beforeDocId] && signedUrls[p.afterDocId],
  );

  if (imageDocs.length === 0) {
    return (
      <div className="bg-[#F9F9FB] rounded-xl p-8 sm:p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-image-line text-3xl text-gray-400"></i>
        </div>
        <p className="font-bold text-[#0B1F33] mb-1">No photos yet</p>
        <p className="text-sm text-[#6B7C8F] max-w-md mx-auto">
          Upload photos to a system (open a system → Documents → upload an image) and they'll appear
          here. Add a before and an after to build a comparison slider.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Photo Gallery</h3>
          <p className="text-xs sm:text-sm text-[#6B7C8F]">
            {imageDocs.length} photo{imageDocs.length !== 1 ? 's' : ''} across your systems
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={pairableSystems.length === 0}
          title={pairableSystems.length === 0 ? 'Add at least two photos to one system first' : undefined}
          className="flex items-center gap-2 px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <i className="ri-contrast-2-line"></i>
          Create Before / After
        </button>
      </div>

      {/* Comparisons */}
      {!loadingPairs && resolvablePairs.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-3">
            Before / After Comparisons
          </h4>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {resolvablePairs.map(pair => {
              const sys = systems.find(s => s.id === pair.systemId);
              const beforeUrl = signedUrls[pair.beforeDocId];
              const afterUrl = signedUrls[pair.afterDocId];
              const isSplit = sideBySide[pair.id];
              return (
                <div key={pair.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
                  <div className="flex items-center justify-between mb-3 gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-[#0B1F33] text-sm truncate">
                        {pair.title || `${sys?.name || 'System'} — Before / After`}
                      </p>
                      {sys && <p className="text-xs text-[#6B7C8F] truncate">{sys.name}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => setSideBySide(prev => ({ ...prev, [pair.id]: !prev[pair.id] }))}
                        title={isSplit ? 'Show slider' : 'Show side by side'}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#0B1F33] hover:bg-[#F9F9FB] cursor-pointer transition-colors"
                      >
                        <i className={isSplit ? 'ri-contrast-2-line' : 'ri-layout-column-line'}></i>
                      </button>
                      <button
                        onClick={() => handleDeletePair(pair.id)}
                        title="Delete comparison"
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </div>

                  {isSplit ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="relative">
                        <img src={beforeUrl} alt="Before" className="w-full aspect-[4/3] object-cover rounded-lg bg-gray-100" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">BEFORE</span>
                      </div>
                      <div className="relative">
                        <img src={afterUrl} alt="After" className="w-full aspect-[4/3] object-cover rounded-lg bg-gray-100" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">AFTER</span>
                      </div>
                    </div>
                  ) : (
                    <BeforeAfterSlider beforeUrl={beforeUrl} afterUrl={afterUrl} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All photos grouped by system */}
      <div>
        <h4 className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-3">All Photos</h4>
        <div className="space-y-5">
          {systems
            .filter(s => (s.documents || []).some(d => isImage(d.fileName)))
            .map(s => {
              const imgs = (s.documents || []).filter(d => isImage(d.fileName));
              return (
                <div key={s.id}>
                  <p className="text-sm font-semibold text-[#0B1F33] mb-2">
                    {s.name} <span className="text-[#6B7C8F] font-normal">· {imgs.length}</span>
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
                    {imgs.map(d => {
                      const url = signedUrls[d.id];
                      return (
                        <button
                          key={d.id}
                          onClick={() => url && setLightbox({ url, name: d.name })}
                          className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 cursor-pointer"
                        >
                          {url ? (
                            <img src={url} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                            </div>
                          )}
                          <span className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium truncate text-left">
                            {d.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={lightbox.url} alt={lightbox.name} className="max-w-full max-h-[80vh] object-contain rounded-lg" />
            <div className="mt-3 flex items-center gap-3">
              <span className="text-white text-sm">{lightbox.name}</span>
              <button
                onClick={() => setLightbox(null)}
                className="px-3 py-1.5 bg-white/10 text-white rounded-lg text-sm font-semibold hover:bg-white/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create comparison modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33]">Create Before / After</h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <i className="ri-close-line text-xl"></i>
                </button>
              </div>

              <div className="space-y-4">
                {/* System picker */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">System</label>
                  <select
                    value={createSystemId}
                    onChange={e => { setCreateSystemId(e.target.value); setBeforeDocId(''); setAfterDocId(''); }}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  >
                    {pairableSystems.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Before / After pickers as thumbnail grids */}
                {(['before', 'after'] as const).map(slot => {
                  const selected = slot === 'before' ? beforeDocId : afterDocId;
                  const setSelected = slot === 'before' ? setBeforeDocId : setAfterDocId;
                  return (
                    <div key={slot}>
                      <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5 capitalize">
                        {slot} photo
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {createSystemImages.map(({ doc }) => {
                          const url = signedUrls[doc.id];
                          const active = selected === doc.id;
                          return (
                            <button
                              key={doc.id}
                              onClick={() => setSelected(doc.id)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                active ? 'border-[#0B1F33] ring-2 ring-[#0B1F33]/20' : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              {url ? (
                                <img src={url} alt={doc.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                  <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                                </div>
                              )}
                              {active && (
                                <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#0B1F33] text-white flex items-center justify-center">
                                  <i className="ri-check-line text-xs"></i>
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}

                {/* Optional title */}
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                    Title <span className="font-normal text-[#6B7C8F]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pairTitle}
                    onChange={e => setPairTitle(e.target.value)}
                    placeholder="e.g. Roof replacement 2026"
                    maxLength={120}
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0B1F33] focus:border-transparent"
                  />
                </div>
              </div>

              {createError && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-700"><i className="ri-error-warning-line mr-1"></i>{createError}</p>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePair}
                  disabled={saving || !beforeDocId || !afterDocId || beforeDocId === afterDocId}
                  className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Comparison'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
