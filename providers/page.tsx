import { useState, useEffect } from 'react';
import Navbar from '../home/components/Navbar';
import FilterSidebar from './components/FilterSidebar';
import ProviderCard from './components/ProviderCard';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema } from '../../utils/seo';
import { supabase } from '../../lib/supabase';

export interface ProviderData {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  location: string;
  specialties: string[];
  hireCount: number;
  badges: string[];
  image: string;
  yearsInBusiness: number;
  companyType: string;
  emergencyAvailable: boolean;
  profileId: string;
}

export default function Providers() {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilters, setSelectedFilters] = useState({
    service: 'All Services',
    location: '',
    rating: 0,
    verified: false,
  });

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';

  useSEO({
    title: 'Find Verified Contractors - Emporva Provider Directory',
    description: 'Find verified professionals ranked by quality, reliability, and local relevance. Browse licensed contractors for plumbing, electrical, roofing, renovation, and more.',
    keywords: 'find contractors, verified professionals, local contractors, home service providers, licensed contractors',
    canonical: '/providers',
    schema: generateWebPageSchema(
      'Find Verified Contractors',
      'Find verified professionals ranked by quality, reliability, and local relevance.',
      `${siteUrl}/providers`
    )
  });

  useEffect(() => {
    const fetchProviders = async () => {
      // Fetch contractor profiles joined with profiles
      const { data: contractors, error } = await supabase
        .from('contractor_profiles')
        .select(`
          id,
          user_id,
          business_name,
          primary_trade,
          secondary_trades,
          service_zips,
          years_in_business,
          company_type,
          licensing_status,
          insurance_status,
          emergency_available
        `);

      if (error || !contractors) {
        console.error('Error fetching contractors:', error);
        setLoading(false);
        return;
      }

      // Fetch profile info separately
      const userIds = contractors.map(c => c.user_id);
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, avatar_url')
        .in('id', userIds);

      const profileMap: Record<string, { first_name: string; last_name: string; avatar_url: string | null }> = {};
      if (profilesData) {
        for (const p of profilesData) {
          profileMap[p.id] = p;
        }
      }

      // Fetch review stats for all contractors
      const { data: reviewStats } = await supabase
        .from('reviews')
        .select('contractor_id, rating')
        .in('contractor_id', userIds);

      // Fetch completed work item counts
      const { data: workItems } = await supabase
        .from('work_items')
        .select('contractor_id')
        .in('contractor_id', userIds)
        .eq('status', 'completed');

      // Build review stats map
      const reviewMap: Record<string, { total: number; sum: number }> = {};
      if (reviewStats) {
        for (const r of reviewStats) {
          if (!reviewMap[r.contractor_id]) reviewMap[r.contractor_id] = { total: 0, sum: 0 };
          reviewMap[r.contractor_id].total++;
          reviewMap[r.contractor_id].sum += r.rating;
        }
      }

      // Build hire count map
      const hireMap: Record<string, number> = {};
      if (workItems) {
        for (const wi of workItems) {
          if (wi.contractor_id) {
            hireMap[wi.contractor_id] = (hireMap[wi.contractor_id] || 0) + 1;
          }
        }
      }

      const mapped: ProviderData[] = contractors.map(c => {
        const profile = profileMap[c.user_id];
        const firstName = profile?.first_name || '';
        const lastName = profile?.last_name || '';
        const displayName = c.business_name || `${firstName} ${lastName}`.trim() || 'Contractor';

        const stats = reviewMap[c.user_id] || { total: 0, sum: 0 };
        const avgRating = stats.total > 0 ? Math.round((stats.sum / stats.total) * 10) / 10 : 0;

        const specialties = [c.primary_trade, ...(c.secondary_trades || [])].filter(Boolean);

        const badges: string[] = [];
        if (c.licensing_status === 'licensed') badges.push('Licensed');
        if (c.insurance_status === 'general-liability' || c.insurance_status === 'full-coverage') badges.push('Insured');
        if (c.licensing_status === 'licensed' && c.insurance_status !== 'not-insured') badges.push('Verified');

        return {
          id: c.id,
          name: displayName,
          rating: avgRating,
          reviews: stats.total,
          location: c.service_zips || '—',
          specialties,
          hireCount: hireMap[c.user_id] || 0,
          badges,
          image: profile?.avatar_url || '',
          yearsInBusiness: c.years_in_business || 0,
          companyType: c.company_type || '',
          emergencyAvailable: c.emergency_available || false,
          profileId: c.user_id,
        };
      });

      // Sort by rating descending, then by reviews
      mapped.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);

      setProviders(mapped);
      setLoading(false);
    };

    fetchProviders();
  }, []);

  // Apply filters
  const filtered = providers.filter(p => {
    if (selectedFilters.service !== 'All Services' && !p.specialties.includes(selectedFilters.service)) return false;
    if (selectedFilters.rating > 0 && p.rating < selectedFilters.rating) return false;
    if (selectedFilters.verified && !p.badges.includes('Verified')) return false;
    if (selectedFilters.location && !p.location.toLowerCase().includes(selectedFilters.location.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar activePage="providers" />

      <div className="pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0B1F33] mb-2 sm:mb-3">
              Find Your Perfect Contractor
            </h1>
            <p className="text-base sm:text-lg text-[#6B7C8F]">
              Verified professionals ranked by quality, reliability, and local relevance
            </p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-1">
              <FilterSidebar
                filters={selectedFilters}
                onFilterChange={setSelectedFilters}
              />
            </div>

            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-sm font-semibold text-[#333645] hover:border-[#D4B483] transition-colors">
                <i className="ri-filter-3-line text-lg"></i>
                Filters
              </button>
            </div>

            {/* Results */}
            <div className="lg:col-span-3">
              <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs sm:text-sm text-[#333645]">
                  {loading ? (
                    <span>Loading contractors...</span>
                  ) : (
                    <><strong>{filtered.length} contractor{filtered.length !== 1 ? 's' : ''}</strong> found</>
                  )}
                </p>
                <select className="px-3 sm:px-4 py-2 rounded-lg border-2 border-gray-200 text-xs sm:text-sm focus:border-[#D4B483] focus:outline-none cursor-pointer">
                  <option>Best Match</option>
                  <option>Highest Rated</option>
                  <option>Most Reviews</option>
                </select>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <div className="w-10 h-10 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-[#6B7C8F]">Finding contractors...</p>
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                  <i className="ri-user-search-line text-5xl text-gray-300 mb-4"></i>
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-2">No Contractors Found</h3>
                  <p className="text-sm text-[#6B7C8F]">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {filtered.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
