import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '../../../lib/supabase';
import BeforeAfterSlider from './BeforeAfterSlider';

// HomeGallery renders general home photos (exterior, rooms, yard — anything
// not tied to a specific system) uploaded from the dashboard Overview tab, and
// lets the user build "before / after" comparison pairs. Photos are rows in
// home_photos stored under the private property-photos bucket at
// {userId}/home/{file} and shown via short-lived signed URLs. Pairs persist in
// home_photo_pairs (migration 059).

interface HomePhoto {
  id: string;
  name: string;
  storagePath: string;
}

interface PhotoPair {
  id: string;
  beforePhotoId: string;
  afterPhotoId: string;
  title: string | null;
}

interface HomeGalleryProps {
  userId: string | null;
  propertyId: string | null;
}

const BUCKET = 'property-photos';

export default function HomeGallery({ userId, propertyId }: HomeGalleryProps) {
  const [photos, setPhotos] = useState<HomePhoto[]>([]);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [pairs, setPairs] = useState<PhotoPair[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sideBySide, setSideBySide] = useState<Record<string, boolean>>({});
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Create-comparison modal state
  const [showCreate, setShowCreate] = useState(false);
  const [beforePhotoId, setBeforePhotoId] = useState('');
  const [afterPhotoId, setAfterPhotoId] = useState('');
  const [pairTitle, setPairTitle] = useState('');
  const [saving, setSaving] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchPhotos = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const [photoRes, pairRes] = await Promise.all([
      supabase
        .from('home_photos')
        .select('id, name, storage_path')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
      supabase
        .from('home_photo_pairs')
        .select('id, before_photo_id, after_photo_id, title')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);
    setPhotos((photoRes.data || []).map(p => ({ id: p.id, name: p.name || 'Photo', storagePath: p.storage_path })));
    setPairs(
      (pairRes.data || []).map(p => ({
        id: p.id,
        beforePhotoId: p.before_photo_id,
        afterPhotoId: p.after_photo_id,
        title: p.title,
      })),
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  // Resolve signed URLs for every photo.
  const pathKey = useMemo(() => photos.map(p => p.storagePath).join('|'), [photos]);
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (photos.length === 0) {
        setSignedUrls({});
        return;
      }
      const { data } = await supabase.storage.from(BUCKET).createSignedUrls(photos.map(p => p.storagePath), 3600);
      if (cancelled || !data) return;
      const byPath: Record<string, string> = {};
      for (const r of data) {
        if (r.signedUrl && r.path) byPath[r.path] = r.signedUrl;
      }
      const byId: Record<string, string> = {};
      for (const p of photos) {
        const url = byPath[p.storagePath];
        if (url) byId[p.id] = url;
      }
      setSignedUrls(byId);
    };
    run();
    return () => { cancelled = true; };
    // pathKey captures the set of photo paths; photos is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathKey]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0 || !userId) return;
    setUploading(true);
    setError('');
    const inserted: HomePhoto[] = [];
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        setError('Only image files can be added to the gallery.');
        continue;
      }
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const storagePath = `${userId}/home/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, file);
      if (uploadError) {
        setError(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }
      const { data, error: insertError } = await supabase
        .from('home_photos')
        .insert({ user_id: userId, property_id: propertyId, name: file.name, storage_path: storagePath })
        .select('id, name, storage_path')
        .single();
      if (insertError || !data) {
        // Roll back the orphaned upload so storage and the table stay in sync.
        await supabase.storage.from(BUCKET).remove([storagePath]);
        setError(`Could not save ${file.name}. Please try again.`);
        continue;
      }
      inserted.push({ id: data.id, name: data.name || 'Photo', storagePath: data.storage_path });
    }
    if (inserted.length > 0) setPhotos(prev => [...inserted, ...prev]);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeletePhoto = async (photo: HomePhoto) => {
    const { error: delError } = await supabase.from('home_photos').delete().eq('id', photo.id);
    if (delError) return;
    await supabase.storage.from(BUCKET).remove([photo.storagePath]);
    setPhotos(prev => prev.filter(p => p.id !== photo.id));
    // Drop any pairs that referenced the deleted photo (DB cascades; mirror locally).
    setPairs(prev => prev.filter(p => p.beforePhotoId !== photo.id && p.afterPhotoId !== photo.id));
  };

  const openCreate = () => {
    setBeforePhotoId('');
    setAfterPhotoId('');
    setPairTitle('');
    setCreateError('');
    setShowCreate(true);
  };

  const handleCreatePair = async () => {
    if (!userId || !beforePhotoId || !afterPhotoId) return;
    if (beforePhotoId === afterPhotoId) {
      setCreateError('Pick two different photos for before and after.');
      return;
    }
    setSaving(true);
    setCreateError('');
    const { data, error: insertError } = await supabase
      .from('home_photo_pairs')
      .insert({
        user_id: userId,
        before_photo_id: beforePhotoId,
        after_photo_id: afterPhotoId,
        title: pairTitle.trim() || null,
      })
      .select('id, before_photo_id, after_photo_id, title')
      .single();
    if (insertError || !data) {
      setCreateError('Could not save the comparison. Please try again.');
      setSaving(false);
      return;
    }
    setPairs(prev => [
      { id: data.id, beforePhotoId: data.before_photo_id, afterPhotoId: data.after_photo_id, title: data.title },
      ...prev,
    ]);
    setSaving(false);
    setShowCreate(false);
  };

  const handleDeletePair = async (id: string) => {
    const { error: delError } = await supabase.from('home_photo_pairs').delete().eq('id', id);
    if (delError) return;
    setPairs(prev => prev.filter(p => p.id !== id));
  };

  // Only render pairs whose images are still present and have signed URLs.
  const resolvablePairs = pairs.filter(p => signedUrls[p.beforePhotoId] && signedUrls[p.afterPhotoId]);

  const uploadButton = (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={e => handleFiles(e.target.files)}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-2 px-4 py-2 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <i className={uploading ? 'ri-loader-4-line animate-spin' : 'ri-upload-2-line'}></i>
        {uploading ? 'Uploading...' : 'Upload Photo'}
      </button>
    </>
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 space-y-6">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[#0B1F33]">Home Photos</h3>
          <p className="text-xs sm:text-sm text-[#6B7C8F]">
            {photos.length > 0
              ? `${photos.length} photo${photos.length !== 1 ? 's' : ''} of your home`
              : 'General photos of your home — exterior, rooms, yard, and projects'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={openCreate}
            disabled={photos.length < 2}
            title={photos.length < 2 ? 'Add at least two photos first' : undefined}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-[#0B1F33] rounded-lg font-semibold text-sm hover:bg-[#F9F9FB] transition-colors cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="ri-contrast-2-line"></i>
            Create Before / After
          </button>
          {uploadButton}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-700"><i className="ri-error-warning-line mr-1"></i>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="py-10 text-center text-[#6B7C8F]">
          <i className="ri-loader-4-line animate-spin text-2xl"></i>
        </div>
      ) : photos.length === 0 ? (
        <div className="bg-[#F9F9FB] rounded-xl p-8 sm:p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-image-line text-3xl text-gray-400"></i>
          </div>
          <p className="font-bold text-[#0B1F33] mb-1">No photos yet</p>
          <p className="text-sm text-[#6B7C8F] max-w-md mx-auto mb-4">
            Upload photos of your home. Add a before and an after to build an interactive comparison slider.
          </p>
          <div className="flex justify-center">{uploadButton}</div>
        </div>
      ) : (
        <>
          {/* Comparisons */}
          {resolvablePairs.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-3">
                Before / After Comparisons
              </h4>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {resolvablePairs.map(pair => {
                  const beforeUrl = signedUrls[pair.beforePhotoId];
                  const afterUrl = signedUrls[pair.afterPhotoId];
                  const isSplit = sideBySide[pair.id];
                  return (
                    <div key={pair.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-3 gap-2">
                        <p className="font-bold text-[#0B1F33] text-sm truncate min-w-0">
                          {pair.title || 'Before / After'}
                        </p>
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

          {/* All photos */}
          <div>
            <h4 className="text-xs font-semibold text-[#6B7C8F] uppercase tracking-wider mb-3">All Photos</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-3">
              {photos.map(p => {
                const url = signedUrls[p.id];
                return (
                  <div key={p.id} className="group relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <button
                      onClick={() => url && setLightbox({ url, name: p.name })}
                      className="w-full h-full cursor-pointer"
                    >
                      {url ? (
                        <img src={url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <i className="ri-loader-4-line animate-spin text-gray-400"></i>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePhoto(p)}
                      title="Delete photo"
                      className="absolute top-1.5 right-1.5 w-7 h-7 flex items-center justify-center rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500 transition-all cursor-pointer"
                    >
                      <i className="ri-delete-bin-line text-sm"></i>
                    </button>
                    <span className="absolute inset-x-0 bottom-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent text-white text-[10px] font-medium truncate text-left pointer-events-none">
                      {p.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

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
                {(['before', 'after'] as const).map(slot => {
                  const selected = slot === 'before' ? beforePhotoId : afterPhotoId;
                  const setSelected = slot === 'before' ? setBeforePhotoId : setAfterPhotoId;
                  return (
                    <div key={slot}>
                      <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5 capitalize">
                        {slot} photo
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {photos.map(p => {
                          const url = signedUrls[p.id];
                          const active = selected === p.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => setSelected(p.id)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                                active ? 'border-[#0B1F33] ring-2 ring-[#0B1F33]/20' : 'border-transparent hover:border-gray-300'
                              }`}
                            >
                              {url ? (
                                <img src={url} alt={p.name} className="w-full h-full object-cover" />
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

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#0B1F33] mb-1.5">
                    Title <span className="font-normal text-[#6B7C8F]">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pairTitle}
                    onChange={e => setPairTitle(e.target.value)}
                    placeholder="e.g. Backyard makeover 2026"
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
                  disabled={saving || !beforePhotoId || !afterPhotoId || beforePhotoId === afterPhotoId}
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
