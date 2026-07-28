import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import type { Property, PropertyType, HvacType, WaterHeaterType, RoofingType, FloorCount } from '../../../types/property';

interface PropertyEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function PropertyEditModal({ isOpen, onClose, onSave }: PropertyEditModalProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'gallery'>('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [propertyId, setPropertyId] = useState<string | null>(null);
  const [homeownerProfileId, setHomeownerProfileId] = useState<string | null>(null);
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType>('single-family');
  const [yearBuilt, setYearBuilt] = useState('');
  const [squareFootage, setSquareFootage] = useState('');
  const [floors, setFloors] = useState<FloorCount>('1');
  const [hvacType, setHvacType] = useState('');
  const [hvacAge, setHvacAge] = useState('');
  const [waterHeaterType, setWaterHeaterType] = useState('');
  const [waterHeaterAge, setWaterHeaterAge] = useState('');
  const [roofingType, setRoofingType] = useState('');
  const [roofingAge, setRoofingAge] = useState('');

  const [photoPaths, setPhotoPaths] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setLoading(true);
    setError('');
    setActiveTab('details');
    supabase
      .from('properties')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .single()
      .then(async ({ data, error: fetchError }) => {
        if (fetchError) {
          setError('Failed to load property data');
          setLoading(false);
          return;
        }
        if (data) {
          const prop = data as Property;
          setPropertyId(prop.id);
          setHomeownerProfileId(prop.homeowner_profile_id);
          setAddress(prop.address || '');
          setPropertyType(prop.property_type || 'single-family');
          setYearBuilt(prop.year_built?.toString() || '');
          setSquareFootage(prop.square_footage?.toString() || '');
          setFloors(prop.floors || '1');
          setHvacType(prop.hvac_type || '');
          setHvacAge(prop.hvac_age?.toString() || '');
          setWaterHeaterType(prop.water_heater_type || '');
          setWaterHeaterAge(prop.water_heater_age?.toString() || '');
          setRoofingType(prop.roofing_type || '');
          setRoofingAge(prop.roofing_age?.toString() || '');
          const paths = prop.photos || [];
          setPhotoPaths(paths);
          if (paths.length > 0) {
            const urlMap: Record<string, string> = {};
            for (const path of paths) {
              const { data } = await supabase.storage
                .from('property-photos')
                .createSignedUrl(path, 3600);
              if (data?.signedUrl) {
                urlMap[path] = data.signedUrl;
              }
            }
            setPhotoUrls(urlMap);
          }
        }
        setLoading(false);
      });
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError('');

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        address,
        property_type: propertyType,
        year_built: yearBuilt ? Number(yearBuilt) : null,
        square_footage: squareFootage ? Number(squareFootage) : null,
        floors,
        hvac_type: (hvacType || null) as HvacType | null,
        hvac_age: hvacAge ? Number(hvacAge) : null,
        water_heater_type: (waterHeaterType || null) as WaterHeaterType | null,
        water_heater_age: waterHeaterAge ? Number(waterHeaterAge) : null,
        roofing_type: (roofingType || null) as RoofingType | null,
        roofing_age: roofingAge ? Number(roofingAge) : null,
        photos: photoPaths,
      })
      .eq('id', propertyId);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    const { logActivity } = await import('../../../lib/activityLog');
    await logActivity({
      userId: user.id,
      action: 'property_updated',
      description: 'Updated property details',
      homeownerProfileId: homeownerProfileId,
    });

    onSave();
    onClose();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !user) return;
    setUploading(true);
    setError('');

    const newPaths: string[] = [];
    const newUrls: Record<string, string> = {};

    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const filePath = `${user.id}/property/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('property-photos')
        .upload(filePath, file);

      if (uploadError) {
        setError(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
      }

      const { data } = await supabase.storage
        .from('property-photos')
        .createSignedUrl(filePath, 3600);

      if (data?.signedUrl) {
        newPaths.push(filePath);
        newUrls[filePath] = data.signedUrl;
      }
    }

    if (newPaths.length > 0) {
      setPhotoPaths(prev => [...prev, ...newPaths]);
      setPhotoUrls(prev => ({ ...prev, ...newUrls }));
    }

    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoPaths(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Property Information</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-4 sm:px-6 flex-shrink-0">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'details'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Property Details
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'gallery'
                  ? 'border-teal-600 text-teal-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Photo Gallery
              {photoPaths.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                  {photoPaths.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Details Tab */}
              {activeTab === 'details' && (
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                    />
                  </div>

                  {/* Property Type & Year Built */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Property Type
                      </label>
                      <select
                        value={propertyType}
                        onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="single-family">Single Family Home</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="condo">Condominium</option>
                        <option value="multi-unit">Multi-Unit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Year Built
                      </label>
                      <input
                        type="number"
                        value={yearBuilt}
                        onChange={(e) => setYearBuilt(e.target.value)}
                        placeholder="e.g., 2005"
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {/* Square Footage & Floors */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Square Footage
                      </label>
                      <input
                        type="number"
                        value={squareFootage}
                        onChange={(e) => setSquareFootage(e.target.value)}
                        placeholder="e.g., 2400"
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">
                        Floors
                      </label>
                      <select
                        value={floors}
                        onChange={(e) => setFloors(e.target.value as FloorCount)}
                        className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                      >
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4+">4+</option>
                      </select>
                    </div>
                  </div>

                  {/* Section: HVAC */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-temp-hot-line text-gray-500"></i>
                      HVAC System
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
                        <select
                          value={hvacType}
                          onChange={(e) => setHvacType(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                        >
                          <option value="">Not specified</option>
                          <option value="central-ac">Central AC</option>
                          <option value="heat-pump">Heat Pump</option>
                          <option value="furnace">Furnace</option>
                          <option value="mini-split">Mini-Split</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Age (years)</label>
                        <input
                          type="number"
                          value={hvacAge}
                          onChange={(e) => setHvacAge(e.target.value)}
                          placeholder="e.g., 5"
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Water Heater */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-drop-line text-gray-500"></i>
                      Water Heater
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
                        <select
                          value={waterHeaterType}
                          onChange={(e) => setWaterHeaterType(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                        >
                          <option value="">Not specified</option>
                          <option value="tank">Tank</option>
                          <option value="tankless">Tankless</option>
                          <option value="heat-pump">Heat Pump</option>
                          <option value="solar">Solar</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Age (years)</label>
                        <input
                          type="number"
                          value={waterHeaterAge}
                          onChange={(e) => setWaterHeaterAge(e.target.value)}
                          placeholder="e.g., 3"
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section: Roofing */}
                  <div className="pt-2">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <i className="ri-home-line text-gray-500"></i>
                      Roofing
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Type</label>
                        <select
                          value={roofingType}
                          onChange={(e) => setRoofingType(e.target.value)}
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm bg-white"
                        >
                          <option value="">Not specified</option>
                          <option value="asphalt-shingles">Asphalt Shingles</option>
                          <option value="metal">Metal</option>
                          <option value="tile">Tile</option>
                          <option value="slate">Slate</option>
                          <option value="flat">Flat</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-900 mb-2">Age (years)</label>
                        <input
                          type="number"
                          value={roofingAge}
                          onChange={(e) => setRoofingAge(e.target.value)}
                          placeholder="e.g., 10"
                          className="w-full px-3 sm:px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Gallery Tab */}
              {activeTab === 'gallery' && (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 sm:p-8 text-center hover:border-teal-400 transition-colors">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 flex items-center justify-center bg-teal-100 rounded-full">
                      <i className="ri-image-add-line text-2xl sm:text-3xl text-teal-600"></i>
                    </div>
                    <p className="text-sm sm:text-base font-medium text-gray-900 mb-1 sm:mb-2">
                      Add photos of your property
                    </p>
                    <p className="text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4">
                      Upload photos of rooms, systems, exterior, and more
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="property-photo-upload"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <label
                      htmlFor="property-photo-upload"
                      className={`inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer text-sm font-medium ${
                        uploading ? 'opacity-50 pointer-events-none' : ''
                      }`}
                    >
                      {uploading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <i className="ri-upload-2-line"></i>
                          Upload Photos
                        </>
                      )}
                    </label>
                  </div>

                  {/* Photo Grid */}
                  {photoPaths.length > 0 ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm sm:text-base font-bold text-gray-900">
                          Property Photos
                        </h3>
                        <span className="text-xs sm:text-sm text-gray-500">
                          {photoPaths.length} photo{photoPaths.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {photoPaths.map((path, idx) => (
                          <div key={idx} className="relative group aspect-square">
                            {photoUrls[path] ? (
                              <img
                                src={photoUrls[path]}
                                alt={`Property photo ${idx + 1}`}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRemovePhoto(idx)}
                                className="w-8 h-8 flex items-center justify-center bg-white text-red-600 rounded-lg hover:bg-gray-100 transition-colors"
                              >
                                <i className="ri-delete-bin-line"></i>
                              </button>
                            </div>
                          </div>
                        ))}
                        <label
                          htmlFor="property-photo-upload"
                          className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-teal-400 transition-colors cursor-pointer"
                        >
                          <i className="ri-add-line text-2xl text-gray-400"></i>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center bg-gray-100 rounded-full">
                        <i className="ri-image-line text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-sm text-gray-600">No photos uploaded yet</p>
                    </div>
                  )}

                  {/* Save Photos Button */}
                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={async () => {
                        if (!user) return;
                        setSaving(true);
                        setError('');
                        const { error: updateError } = await supabase
                          .from('properties')
                          .update({ photos: photoPaths })
                          .eq('id', propertyId);
                        setSaving(false);
                        if (updateError) {
                          setError(updateError.message);
                          return;
                        }
                        onSave();
                        onClose();
                      }}
                      className="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? 'Saving...' : 'Save Photos'}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
