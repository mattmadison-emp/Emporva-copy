import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';
import { useSEO, generateWebPageSchema } from '../../utils/seo';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ContractorProfile {
  business_name: string | null;
  company_type: string | null;
  primary_trade: string | null;
  secondary_trades: string[] | null;
  years_in_business: number | null;
  service_zips: string | null;
  travel_radius: number | null;
  emergency_available: boolean | null;
  licensing_status: string | null;
  insurance_status: string | null;
  certifications: string | string[] | null;
}

interface Profile {
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
}

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  sentiment: string | null;
  verified: boolean | null;
  reviewer_first_name?: string | null;
  reviewer_last_name?: string | null;
}

interface Credential {
  id: string;
  title: string;
  status: string | null;
  credential_number: string | null;
  expiry_date: string | null;
  verified_at: string | null;
}

interface ReviewStats {
  avgRating: number;
  totalReviews: number;
  responseRate: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
}

interface RatingDist {
  stars: number;
  count: number;
  pct: number;
}

function getTeamSize(companyType: string | null): string {
  switch (companyType) {
    case 'solo': return '1';
    case 'small-team': return '2-5';
    case 'multi-crew': return '6+';
    default: return '—';
  }
}

function getInitials(firstName: string | null, lastName: string | null): string {
  const f = firstName?.charAt(0)?.toUpperCase() || '';
  const l = lastName?.charAt(0)?.toUpperCase() || '';
  return f + l || '??';
}

function computeReviewStats(reviews: Review[]): ReviewStats {
  if (reviews.length === 0) {
    return { avgRating: 0, totalReviews: 0, responseRate: 0, sentimentPositive: 0, sentimentNeutral: 0, sentimentNegative: 0 };
  }
  const total = reviews.length;
  const avgRating = Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10;
  const positive = reviews.filter(r => r.sentiment === 'positive').length;
  const neutral = reviews.filter(r => r.sentiment === 'neutral').length;
  const negative = reviews.filter(r => r.sentiment === 'negative').length;
  const sentimentTotal = positive + neutral + negative;
  return {
    avgRating,
    totalReviews: total,
    responseRate: 0, // We don't track response rate in the DB
    sentimentPositive: sentimentTotal > 0 ? Math.round((positive / sentimentTotal) * 100) : 0,
    sentimentNeutral: sentimentTotal > 0 ? Math.round((neutral / sentimentTotal) * 100) : 0,
    sentimentNegative: sentimentTotal > 0 ? Math.round((negative / sentimentTotal) * 100) : 0,
  };
}

function computeRatingDistribution(reviews: Review[]): RatingDist[] {
  const total = reviews.length;
  return [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => Math.round(r.rating) === stars).length;
    return { stars, count, pct: total > 0 ? Math.round((count / total) * 100) : 0 };
  });
}

function generateBio(
  businessName: string,
  primaryTrade: string | null,
  yearsInBusiness: number | null,
  companyType: string | null,
  emergencyAvailable: boolean | null
): string {
  const parts: string[] = [];
  parts.push(`${businessName} is a professional${primaryTrade ? ` ${primaryTrade.toLowerCase()}` : ''} service provider`);
  if (yearsInBusiness) {
    parts[0] += ` with over ${yearsInBusiness} years of experience`;
  }
  parts[0] += '.';
  if (companyType === 'multi-crew') {
    parts.push('With a multi-crew team, we handle projects of all sizes.');
  } else if (companyType === 'small-team') {
    parts.push('Our dedicated small team provides personalized attention to every project.');
  } else if (companyType === 'solo') {
    parts.push('As a solo operator, you get direct communication and hands-on craftsmanship.');
  }
  if (emergencyAvailable) {
    parts.push('Emergency services are available 24/7.');
  }
  parts.push('We pride ourselves on quality workmanship, clear communication, and building lasting relationships with our clients.');
  return parts.join(' ');
}

export default function ContractorProfile() {
  const { contractorId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contractorProfile, setContractorProfile] = useState<ContractorProfile | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [completedJobsCount, setCompletedJobsCount] = useState(0);

  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageSent, setMessageSent] = useState(false);

  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://emporva.com';

  useEffect(() => {
    if (!contractorId) {
      setError('No contractor ID provided.');
      setLoading(false);
      return;
    }

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // Fetch all data in parallel
        const [profileRes, contractorRes, reviewsRes, credentialsRes, jobsCountRes] = await Promise.all([
          supabase.from('profiles').select('first_name, last_name, email, phone, avatar_url').eq('id', contractorId!).single(),
          supabase.from('contractor_profiles').select('business_name, company_type, primary_trade, secondary_trades, years_in_business, service_zips, travel_radius, emergency_available, licensing_status, insurance_status, certifications').eq('user_id', contractorId!).single(),
          supabase.from('reviews').select('id, rating, comment, created_at, sentiment, verified, reviewer_id').eq('contractor_id', contractorId!).order('created_at', { ascending: false }),
          supabase.from('contractor_credentials').select('id, title, status, credential_number, expiry_date, verified_at').eq('user_id', contractorId!),
          supabase.from('work_items').select('id', { count: 'exact', head: true }).eq('contractor_id', contractorId!).eq('status', 'completed'),
        ]);

        // Profile is required
        if (profileRes.error || !profileRes.data) {
          setError('Contractor not found.');
          setLoading(false);
          return;
        }

        setProfile(profileRes.data);
        setContractorProfile(contractorRes.data || null);
        setCompletedJobsCount(jobsCountRes.count || 0);
        setCredentials(credentialsRes.data || []);

        // Enrich reviews with reviewer names
        const rawReviews = reviewsRes.data || [];
        if (rawReviews.length > 0) {
          const reviewerIds = Array.from(new Set(rawReviews.map((r: { reviewer_id: string }) => r.reviewer_id).filter(Boolean)));
          let reviewerMap: Record<string, { first_name: string | null; last_name: string | null }> = {};
          if (reviewerIds.length > 0) {
            const { data: reviewerProfiles } = await supabase
              .from('profiles')
              .select('id, first_name, last_name')
              .in('id', reviewerIds);
            if (reviewerProfiles) {
              reviewerMap = Object.fromEntries(reviewerProfiles.map((p: { id: string; first_name: string | null; last_name: string | null }) => [p.id, p]));
            }
          }
          const enrichedReviews: Review[] = rawReviews.map((r: { id: string; rating: number; comment: string | null; created_at: string; sentiment: string | null; verified: boolean | null; reviewer_id: string }) => ({
            id: r.id,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
            sentiment: r.sentiment,
            verified: r.verified,
            reviewer_first_name: reviewerMap[r.reviewer_id]?.first_name || null,
            reviewer_last_name: reviewerMap[r.reviewer_id]?.last_name || null,
          }));
          setReviews(enrichedReviews);
        } else {
          setReviews([]);
        }
      } catch {
        setError('An error occurred while loading the contractor profile.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [contractorId]);

  // Check if contractor is already favorited
  useEffect(() => {
    if (!user || !contractorId) return;
    supabase
      .from('favorite_contractors')
      .select('id')
      .eq('user_id', user.id)
      .eq('contractor_id', contractorId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setIsSaved(true);
      });
  }, [user, contractorId]);

  // Derived data
  const businessName = contractorProfile?.business_name || (profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Contractor');
  const primaryTrade = contractorProfile?.primary_trade || null;
  const secondaryTrades = contractorProfile?.secondary_trades || [];
  const services = [primaryTrade, ...secondaryTrades].filter(Boolean) as string[];
  const yearsInBusiness = contractorProfile?.years_in_business || null;
  const teamSize = getTeamSize(contractorProfile?.company_type || null);
  const emergencyAvailable = contractorProfile?.emergency_available || false;
  const isLicensed = contractorProfile?.licensing_status === 'licensed';
  const isInsured = contractorProfile?.insurance_status ? contractorProfile.insurance_status !== 'not-insured' : false;
  const certifications: string[] = (() => {
    const raw = contractorProfile?.certifications;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    // Column is text type — may be comma-separated string
    return raw.split(',').map((s: string) => s.trim()).filter(Boolean);
  })();
  const zipCodes = contractorProfile?.service_zips ? contractorProfile.service_zips.split(',').map(z => z.trim()).filter(Boolean) : [];
  const travelRadius = contractorProfile?.travel_radius || null;
  const bio = generateBio(businessName, primaryTrade, yearsInBusiness, contractorProfile?.company_type || null, emergencyAvailable);

  const reviewStats = computeReviewStats(reviews);
  const ratingDistribution = computeRatingDistribution(reviews);
  const hasReviews = reviewStats.totalReviews > 0;

  useSEO({
    title: loading ? 'Loading...' : `${businessName} — Verified Provider on Emporva`,
    description: loading ? '' : `${bio.substring(0, 150)}... Professional ${primaryTrade || 'contractor'} services${yearsInBusiness ? ` with ${yearsInBusiness}+ years experience` : ''}.`,
    keywords: `${primaryTrade || 'contractor'}, contractor, verified provider`,
    canonical: `/contractor/${contractorId}`,
    schema: generateWebPageSchema(
      businessName,
      bio,
      `${siteUrl}/contractor/${contractorId}`
    )
  });

  const handleStartProject = () => {
    navigate('/ai-intake', { state: { preferredContractor: contractorId } });
  };

  const handleSendMessage = async () => {
    if (!user || !contractorId || !messageText.trim()) return;
    setSendingMessage(true);

    try {
      // Check for existing direct conversation between these two users
      const { data: existingConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

      let conversationId: string | null = null;

      if (existingConvos && existingConvos.length > 0) {
        const convoIds = existingConvos.map(c => c.conversation_id);
        const { data: sharedConvos } = await supabase
          .from('conversation_participants')
          .select('conversation_id')
          .eq('user_id', contractorId)
          .in('conversation_id', convoIds);

        if (sharedConvos && sharedConvos.length > 0) {
          // Verify it's a direct conversation
          const { data: convo } = await supabase
            .from('conversations')
            .select('id')
            .eq('id', sharedConvos[0].conversation_id)
            .eq('type', 'direct')
            .single();
          if (convo) conversationId = convo.id;
        }
      }

      // Create new conversation if none exists
      if (!conversationId) {
        const { data: newConvo, error: convoError } = await supabase
          .from('conversations')
          .insert({ type: 'direct', created_by: user.id })
          .select('id')
          .single();

        if (convoError || !newConvo) throw convoError;
        conversationId = newConvo.id;

        // Add both participants
        await supabase.from('conversation_participants').insert([
          { conversation_id: conversationId, user_id: user.id },
          { conversation_id: conversationId, user_id: contractorId },
        ]);
      }

      // Send the message
      const { error: msgError } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText.trim(),
        message_type: 'text',
      });

      if (msgError) throw msgError;

      setMessageText('');
      setMessageSent(true);
      setTimeout(() => setMessageSent(false), 4000);
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleSaveContractor = async () => {
    if (!user || !contractorId) return;
    if (isSaved) {
      setIsSaved(false);
      await supabase
        .from('favorite_contractors')
        .delete()
        .eq('user_id', user.id)
        .eq('contractor_id', contractorId);
    } else {
      setIsSaved(true);
      await supabase
        .from('favorite_contractors')
        .insert({ user_id: user.id, contractor_id: contractorId });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#D4B483] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Loading contractor profile...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 flex items-center justify-center bg-red-50 rounded-full mx-auto mb-6">
              <i className="ri-error-warning-line text-red-400 text-4xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contractor Not Found
            </h2>
            <p className="text-[#6B7C8F] mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              {error || 'The contractor profile you are looking for does not exist or may have been removed.'}
            </p>
            <button
              onClick={() => navigate('/providers')}
              className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-colors font-semibold cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-arrow-left-line mr-2"></i>
              Browse Providers
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Credentials Badge Display Component
  const CredentialsBadgeDisplay = () => {
    const activeCredentials = credentials.filter(c => c.status === 'active' || c.status === 'verified');
    const hasActiveCredentials = activeCredentials.length > 0;

    if (!hasActiveCredentials && !isLicensed && !isInsured) {
      return null;
    }

    return (
      <div className="bg-gradient-to-br from-[#F9F9FB] to-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center bg-gradient-to-br from-[#D4B483] to-[#c5a574] rounded-xl">
              <i className="ri-verified-badge-fill text-white text-xl"></i>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Verified Credentials
              </h3>
              <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Documentation verified by Emporva
              </p>
            </div>
          </div>
          {hasActiveCredentials && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-xs font-semibold text-green-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {activeCredentials.length} Active
              </span>
            </div>
          )}
        </div>

        {/* Credential Badges Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          {credentials.map((credential) => {
            const isActive = credential.status === 'active' || credential.status === 'verified';
            const icon = credential.title.toLowerCase().includes('license') ? 'ri-shield-check-fill'
              : credential.title.toLowerCase().includes('insurance') || credential.title.toLowerCase().includes('liability') ? 'ri-shield-star-fill'
              : credential.title.toLowerCase().includes('bond') ? 'ri-award-fill'
              : credential.title.toLowerCase().includes('worker') ? 'ri-user-heart-fill'
              : 'ri-file-shield-2-fill';

            return (
              <div
                key={credential.id}
                className="group relative bg-white rounded-xl p-4 border-2 border-gray-100 hover:border-[#D4B483] transition-all cursor-pointer hover:shadow-md"
              >
                {/* Verified Check */}
                {isActive && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-green-500 rounded-full border-2 border-white shadow-sm">
                    <i className="ri-check-line text-white text-xs"></i>
                  </div>
                )}

                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-[#D4B483]/20 to-[#D4B483]/5 rounded-xl mb-3 group-hover:from-[#D4B483]/30 group-hover:to-[#D4B483]/10 transition-all">
                  <i className={`${icon} text-[#D4B483] text-2xl`}></i>
                </div>

                {/* Info */}
                <h4 className="text-sm font-bold text-[#0B1F33] mb-1 leading-tight" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  {credential.title}
                </h4>

                {credential.credential_number && (
                  <p className="text-xs text-[#6B7C8F] mb-1 truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                    #{credential.credential_number}
                  </p>
                )}

                {credential.verified_at && (
                  <p className="text-[10px] text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Verified {new Date(credential.verified_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                )}

                {/* Hover Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-2 w-48 p-3 bg-[#0B1F33] rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20 pointer-events-none">
                  <div className="text-xs text-white space-y-1.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Status:</span>
                      <span className="font-medium">{credential.status || '—'}</span>
                    </div>
                    {credential.expiry_date && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">Valid until:</span>
                        <span className="font-medium text-green-400">
                          {new Date(credential.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-[#0B1F33]"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-100">
          {isLicensed && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1F33]/5 rounded-full">
              <i className="ri-shield-check-line text-[#0B1F33] text-sm"></i>
              <span className="text-xs font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Licensed
              </span>
            </div>
          )}
          {isInsured && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1F33]/5 rounded-full">
              <i className="ri-shield-star-line text-[#0B1F33] text-sm"></i>
              <span className="text-xs font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                Insured
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0B1F33]/5 rounded-full">
            <i className="ri-file-search-line text-[#0B1F33] text-sm"></i>
            <span className="text-xs font-medium text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
              Documents Verified
            </span>
          </div>
          <button
            onClick={() => setActiveTab('credentials')}
            className="ml-auto text-xs font-semibold text-[#D4B483] hover:text-[#c5a574] transition-colors cursor-pointer flex items-center gap-1"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            View Details
            <i className="ri-arrow-right-line"></i>
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="pt-20">
        {/* Cover Image */}
        <div className="relative w-full h-80 overflow-hidden bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F]">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <i className="ri-building-2-line text-white/20 text-8xl"></i>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60"></div>
        </div>

        {/* Profile Header */}
        <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              {/* Logo / Avatar */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl overflow-hidden bg-white shadow-lg border-4 border-white">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={`${businessName} Logo`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F] flex items-center justify-center">
                      <span className="text-white text-3xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {getInitials(profile.first_name, profile.last_name)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-4xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {businessName}
                    </h1>
                    {primaryTrade && (
                      <p className="text-lg text-[#D4B483] font-semibold mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                        Professional {primaryTrade} Services
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {primaryTrade && (
                        <span className="px-4 py-1.5 bg-[#D4B483] text-white rounded-full text-sm font-semibold" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          {primaryTrade}
                        </span>
                      )}
                      {secondaryTrades.map((trade) => (
                        <span key={trade} className="px-4 py-1.5 bg-[#F9F9FB] text-[#333645] rounded-full text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {trade}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleSaveContractor}
                    className="px-4 py-2 border-2 border-gray-200 rounded-lg hover:border-[#D4B483] transition-all cursor-pointer"
                  >
                    <i className={`${isSaved ? 'ri-heart-fill text-[#D4B483]' : 'ri-heart-line text-gray-400'} text-2xl`}></i>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                  <div className="text-center p-4 bg-[#F9F9FB] rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#D4B483]/10 rounded-full mx-auto mb-2">
                      <i className="ri-star-fill text-[#D4B483] text-xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {hasReviews ? reviewStats.avgRating : '—'}
                    </div>
                    {hasReviews && (
                      <div className="flex items-center justify-center gap-0.5 mb-0.5">
                        {[1,2,3,4,5].map(s => (
                          <i key={s} className={`ri-star-fill text-xs ${s <= Math.round(reviewStats.avgRating) ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {hasReviews ? `${reviewStats.totalReviews} Reviews` : 'No reviews yet'}
                    </div>
                  </div>

                  <div className="text-center p-4 bg-[#F9F9FB] rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#D4B483]/10 rounded-full mx-auto mb-2">
                      <i className="ri-briefcase-line text-[#D4B483] text-xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {completedJobsCount}
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Jobs Completed
                    </div>
                  </div>

                  <div className="text-center p-4 bg-[#F9F9FB] rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#D4B483]/10 rounded-full mx-auto mb-2">
                      <i className="ri-emotion-happy-line text-[#D4B483] text-xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {hasReviews ? `${reviewStats.sentimentPositive}%` : '—'}
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Positive Sentiment
                    </div>
                  </div>

                  <div className="text-center p-4 bg-[#F9F9FB] rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#D4B483]/10 rounded-full mx-auto mb-2">
                      <i className="ri-shield-check-line text-[#D4B483] text-xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {isLicensed ? 'Yes' : '—'}
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Licensed
                    </div>
                  </div>

                  <div className="text-center p-4 bg-[#F9F9FB] rounded-lg">
                    <div className="flex items-center justify-center w-12 h-12 bg-[#D4B483]/10 rounded-full mx-auto mb-2">
                      <i className="ri-calendar-check-line text-[#D4B483] text-xl"></i>
                    </div>
                    <div className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {yearsInBusiness ? `${yearsInBusiness}+` : '—'}
                    </div>
                    <div className="text-xs text-gray-500" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Years Experience
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <button
                    onClick={handleStartProject}
                    className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-colors font-semibold whitespace-nowrap cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-file-list-3-line mr-2"></i>
                    Request a Scoped Job
                  </button>
                  <button
                    className="px-6 py-3 border-2 border-gray-200 text-[#333645] rounded-lg hover:border-[#D4B483] hover:text-[#D4B483] transition-all font-semibold whitespace-nowrap cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-file-text-line mr-2"></i>
                    Request Quote
                  </button>
                </div>

                {/* Message Contractor */}
                {user && user.id !== contractorId ? (
                  <div className="bg-[#F9F9FB] rounded-xl p-4">
                    <label className="block text-sm font-semibold text-[#0B1F33] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      <i className="ri-message-3-line mr-1 text-[#D4B483]"></i>
                      Message {businessName}
                    </label>
                    {messageSent ? (
                      <div className="flex items-center gap-2 py-3 text-green-700">
                        <i className="ri-check-double-line text-xl"></i>
                        <span className="text-sm font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>Message sent! They'll be notified.</span>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <textarea
                          value={messageText}
                          onChange={(e) => setMessageText(e.target.value)}
                          placeholder="Hi, I'm interested in your services..."
                          rows={4}
                          className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm focus:border-[#D4B483] focus:outline-none resize-none"
                          style={{ fontFamily: 'Inter, sans-serif' }}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={sendingMessage || !messageText.trim()}
                          className="px-5 py-2.5 bg-[#D4B483] text-white rounded-lg hover:bg-[#c5a574] transition-colors font-semibold whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed self-end"
                          style={{ fontFamily: 'Montserrat, sans-serif' }}
                        >
                          {sendingMessage ? (
                            <i className="ri-loader-4-line animate-spin text-lg"></i>
                          ) : (
                            <>
                              <i className="ri-send-plane-fill mr-1"></i>
                              Send
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                ) : !user ? (
                  <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                    <p className="text-sm text-[#6B7C8F] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Sign in to message this contractor
                    </p>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-5 py-2 bg-[#D4B483] text-white rounded-lg hover:bg-[#c5a574] transition-colors font-semibold text-sm cursor-pointer"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      Sign In
                    </button>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Credentials Badge Display */}
            <div className="mt-8 pt-8 border-t border-gray-100">
              <CredentialsBadgeDisplay />
            </div>
          </div>
        </div>

        {/* Tabs & Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {[
              { id: 'overview', label: 'Overview', icon: 'ri-information-line' },
              { id: 'reviews', label: 'Reviews', icon: 'ri-star-line' },
              { id: 'services', label: 'Services', icon: 'ri-tools-line' },
              { id: 'portfolio', label: 'Portfolio', icon: 'ri-gallery-line' },
              { id: 'credentials', label: 'Credentials', icon: 'ri-shield-check-line' },
              { id: 'area', label: 'Service Area', icon: 'ri-map-pin-line' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-white text-[#333645] hover:bg-[#F9F9FB]'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className={`${tab.icon} mr-2`}></i>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  About {businessName}
                </h2>
                <p className="text-[#333645] leading-relaxed mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {bio}
                </p>

                {/* Review Snapshot on Overview */}
                <div className="mb-8 p-6 bg-[#F9F9FB] rounded-xl border border-gray-100">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-star-fill text-yellow-500 mr-2"></i>
                      Review Snapshot
                    </h3>
                    <button
                      onClick={() => setActiveTab('reviews')}
                      className="text-sm font-semibold text-[#D4B483] hover:text-[#c5a574] transition-colors cursor-pointer flex items-center gap-1"
                      style={{ fontFamily: 'Montserrat, sans-serif' }}
                    >
                      See All Reviews
                      <i className="ri-arrow-right-line"></i>
                    </button>
                  </div>
                  {hasReviews ? (
                    <>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Rating Summary */}
                        <div className="flex flex-col items-center justify-center">
                          <div className="text-5xl font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                            {reviewStats.avgRating}
                          </div>
                          <div className="flex items-center gap-0.5 mb-0.5">
                            {[1,2,3,4,5].map(s => (
                              <i key={s} className={`ri-star-fill text-xs ${s <= Math.round(reviewStats.avgRating) ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                            ))}
                          </div>
                          <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Based on {reviewStats.totalReviews} reviews
                          </p>
                        </div>
                        {/* Rating Distribution */}
                        <div className="space-y-2">
                          {ratingDistribution.map(r => (
                            <div key={r.stars} className="flex items-center gap-2">
                              <div className="flex items-center gap-0.5 w-10 flex-shrink-0">
                                <span className="text-xs font-bold text-[#0B1F33]">{r.stars}</span>
                                <i className="ri-star-fill text-yellow-500 text-xs"></i>
                              </div>
                              <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${r.stars >= 4 ? 'bg-green-500' : r.stars === 3 ? 'bg-yellow-500' : 'bg-red-400'}`}
                                  style={{ width: `${r.pct}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-semibold text-[#6B7C8F] w-8 text-right">{r.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Featured Review Peek */}
                      {reviews.length > 0 && reviews[0].comment && (
                        <div className="mt-5 pt-5 border-t border-gray-200">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#0B1F33] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {getInitials(reviews[0].reviewer_first_name || null, reviews[0].reviewer_last_name || null)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-sm font-bold text-[#0B1F33]">
                                  {[reviews[0].reviewer_first_name, reviews[0].reviewer_last_name].filter(Boolean).join(' ') || 'Anonymous'}
                                </span>
                                <div className="flex">
                                  {[1,2,3,4,5].map(s => (
                                    <i key={s} className={`ri-star-fill text-xs ${s <= reviews[0].rating ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                                  ))}
                                </div>
                                {reviews[0].verified && (
                                  <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-semibold">Verified</span>
                                )}
                              </div>
                              <p className="text-sm text-[#333645] leading-relaxed line-clamp-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                                &ldquo;{reviews[0].comment}&rdquo;
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <i className="ri-star-line text-gray-300 text-4xl mb-3 block"></i>
                      <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>No reviews yet</p>
                    </div>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="p-6 bg-[#F9F9FB] rounded-xl">
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-team-line text-[#D4B483] mr-2"></i>
                      Team Information
                    </h3>
                    <div className="space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Team Size:</span>
                        <span className="font-semibold text-[#333645]">{teamSize !== '—' ? `${teamSize} professionals` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Years in Business:</span>
                        <span className="font-semibold text-[#333645]">{yearsInBusiness ? `${yearsInBusiness} years` : '—'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergency Service:</span>
                        <span className="font-semibold text-[#D4B483]">
                          {emergencyAvailable ? 'Available 24/7' : 'Business Hours Only'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-[#F9F9FB] rounded-xl">
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-trophy-line text-[#D4B483] mr-2"></i>
                      Quick Facts
                    </h3>
                    <div className="space-y-2">
                      {isLicensed && (
                        <div className="flex items-center gap-2">
                          <i className="ri-checkbox-circle-fill text-[#D4B483]"></i>
                          <span className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Licensed Professional
                          </span>
                        </div>
                      )}
                      {isInsured && (
                        <div className="flex items-center gap-2">
                          <i className="ri-checkbox-circle-fill text-[#D4B483]"></i>
                          <span className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            Fully Insured
                          </span>
                        </div>
                      )}
                      {completedJobsCount > 0 && (
                        <div className="flex items-center gap-2">
                          <i className="ri-checkbox-circle-fill text-[#D4B483]"></i>
                          <span className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {completedJobsCount} Jobs Completed on Emporva
                          </span>
                        </div>
                      )}
                      {services.length > 0 && (
                        <div className="flex items-center gap-2">
                          <i className="ri-checkbox-circle-fill text-[#D4B483]"></i>
                          <span className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {services.length} Service{services.length > 1 ? 's' : ''} Offered
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-[#D4B483]/10 to-[#0B1F33]/10 rounded-xl border-2 border-[#D4B483]/20">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-16 h-16 bg-[#0B1F33] rounded-full flex-shrink-0">
                      <i className="ri-phone-line text-white text-2xl"></i>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Ready to Get Started?
                      </h3>
                      <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Contact us directly or start a scoped project through Emporva&apos;s AI workflow
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {profile.phone || '—'}
                      </div>
                      <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {profile.email || '—'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Customer Reviews
                </h2>

                {hasReviews ? (
                  <>
                    {/* Aggregate Stats Bar */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-[#0B1F33] mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{reviewStats.avgRating}</div>
                        <div className="flex items-center justify-center gap-0.5 mb-1">
                          {[1,2,3,4,5].map(s => (
                            <i key={s} className={`ri-star-fill text-sm ${s <= Math.round(reviewStats.avgRating) ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                          ))}
                        </div>
                        <p className="text-xs text-[#6B7C8F]">Average Rating</p>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-[#0B1F33] mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{reviewStats.totalReviews}</div>
                        <p className="text-xs text-[#6B7C8F] mt-1">Total Reviews</p>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-[#0B1F33] mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{reviewStats.sentimentPositive}%</div>
                        <p className="text-xs text-[#6B7C8F] mt-1">Positive Sentiment</p>
                      </div>
                      <div className="bg-[#F9F9FB] rounded-xl p-4 text-center">
                        <div className="text-3xl font-bold text-[#0B1F33] mb-0.5" style={{ fontFamily: 'Poppins, sans-serif' }}>{completedJobsCount}</div>
                        <p className="text-xs text-[#6B7C8F] mt-1">Jobs Completed</p>
                      </div>
                    </div>

                    {/* Rating Distribution */}
                    <div className="mb-8">
                      <div className="p-6 bg-[#F9F9FB] rounded-xl">
                        <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          Rating Distribution
                        </h3>
                        <div className="space-y-3">
                          {ratingDistribution.map(r => (
                            <div key={r.stars} className="flex items-center gap-3">
                              <div className="flex items-center gap-1 w-12 flex-shrink-0">
                                <span className="text-sm font-bold text-[#0B1F33]">{r.stars}</span>
                                <i className="ri-star-fill text-yellow-500 text-sm"></i>
                              </div>
                              <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all duration-700 ${
                                    r.stars >= 4 ? 'bg-green-500' : r.stars === 3 ? 'bg-yellow-500' : 'bg-red-400'
                                  }`}
                                  style={{ width: `${r.pct}%` }}
                                ></div>
                              </div>
                              <span className="text-sm font-semibold text-[#0B1F33] w-8 text-right">{r.count}</span>
                              <span className="text-xs text-[#6B7C8F] w-10 text-right">{r.pct}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Sentiment Summary */}
                    {(reviewStats.sentimentPositive > 0 || reviewStats.sentimentNeutral > 0 || reviewStats.sentimentNegative > 0) && (
                      <div className="mb-8 p-5 bg-gradient-to-r from-green-50 via-yellow-50 to-red-50 rounded-xl border border-gray-100">
                        <h3 className="text-sm font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          <i className="ri-emotion-line text-[#D4B483] mr-2"></i>
                          Sentiment Analysis
                        </h3>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            <span className="text-sm font-semibold text-green-700">{reviewStats.sentimentPositive}% Positive</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="text-sm font-semibold text-yellow-700">{reviewStats.sentimentNeutral}% Neutral</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <span className="text-sm font-semibold text-red-600">{reviewStats.sentimentNegative}% Negative</span>
                          </div>
                        </div>
                        <div className="mt-3 flex h-3 rounded-full overflow-hidden">
                          <div className="bg-green-500" style={{ width: `${reviewStats.sentimentPositive}%` }}></div>
                          <div className="bg-yellow-500" style={{ width: `${reviewStats.sentimentNeutral}%` }}></div>
                          <div className="bg-red-400" style={{ width: `${reviewStats.sentimentNegative}%` }}></div>
                        </div>
                      </div>
                    )}

                    {/* All Reviews */}
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      All Reviews
                    </h3>
                    <div className="space-y-4">
                      {reviews.map(review => (
                        <div key={review.id} className="p-5 bg-white border-2 border-gray-100 rounded-xl hover:border-[#D4B483]/40 transition-all">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {getInitials(review.reviewer_first_name || null, review.reviewer_last_name || null)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center flex-wrap gap-2 mb-1.5">
                                <span className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                  {[review.reviewer_first_name, review.reviewer_last_name].filter(Boolean).join(' ') || 'Anonymous'}
                                </span>
                                {review.verified && (
                                  <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                                    <i className="ri-verified-badge-fill text-[10px]"></i> Verified
                                  </span>
                                )}
                                <i className="ri-shield-star-fill text-teal-600 text-sm"></i>
                              </div>
                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex">
                                  {[1,2,3,4,5].map(s => (
                                    <i key={s} className={`ri-star-fill text-sm ${s <= review.rating ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                                  ))}
                                </div>
                                <span className="text-xs text-[#6B7C8F]">
                                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-sm text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                                  &ldquo;{review.comment}&rdquo;
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-16">
                    <i className="ri-star-line text-gray-300 text-6xl mb-4 block"></i>
                    <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>No reviews yet</h3>
                    <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Be the first to work with {businessName} and leave a review.
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div className="mt-8 p-6 bg-gradient-to-r from-[#D4B483]/10 to-[#0B1F33]/10 rounded-xl border-2 border-[#D4B483]/20 text-center">
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {hasReviews ? 'Impressed by the Reviews?' : 'Ready to Get Started?'}
                  </h3>
                  <p className="text-sm text-[#333645] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Start a scoped project with {businessName} through Emporva&apos;s AI-powered workflow.
                  </p>
                  <button
                    onClick={handleStartProject}
                    className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-colors font-semibold whitespace-nowrap cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-file-list-3-line mr-2"></i>
                    Request a Scoped Job
                  </button>
                </div>
              </div>
            )}

            {/* Services Tab */}
            {activeTab === 'services' && (
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Services Offered
                </h2>
                {services.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {services.map((service) => (
                      <div key={service} className="p-4 bg-[#F9F9FB] rounded-lg hover:bg-[#D4B483]/10 transition-colors border-2 border-transparent hover:border-[#D4B483]">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 bg-[#D4B483] rounded-lg flex-shrink-0">
                            <i className="ri-check-line text-white text-xl"></i>
                          </div>
                          <span className="font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {service}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <i className="ri-tools-line text-gray-300 text-5xl mb-3 block"></i>
                    <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>No services listed yet.</p>
                  </div>
                )}

                <div className="mt-8 p-6 bg-[#0B1F33]/5 rounded-xl">
                  <h3 className="text-lg font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <i className="ri-lightbulb-line text-[#D4B483] mr-2"></i>
                    Service Types
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {emergencyAvailable && (
                      <div className="flex items-start gap-3">
                        <i className="ri-flashlight-line text-[#D4B483] text-xl mt-1"></i>
                        <div>
                          <div className="font-semibold text-[#333645] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            Emergency & Rapid Response
                          </div>
                          <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                            24/7 availability for urgent issues
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <i className="ri-calendar-check-line text-[#D4B483] text-xl mt-1"></i>
                      <div>
                        <div className="font-semibold text-[#333645] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Scheduled Work
                        </div>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Planned projects and maintenance
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-hammer-line text-[#D4B483] text-xl mt-1"></i>
                      <div>
                        <div className="font-semibold text-[#333645] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Renovation & Upgrades
                        </div>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                          Complete system replacements and improvements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <i className="ri-file-list-3-line text-[#D4B483] text-xl mt-1"></i>
                      <div>
                        <div className="font-semibold text-[#333645] mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                          Scope-Ready Projects
                        </div>
                        <p className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                          AI-scoped jobs with clear timelines and costs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Tab */}
            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Portfolio
                </h2>
                <div className="text-center py-16">
                  <div className="w-20 h-20 flex items-center justify-center bg-[#F9F9FB] rounded-full mx-auto mb-6">
                    <i className="ri-gallery-line text-[#D4B483] text-4xl"></i>
                  </div>
                  <h3 className="text-xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Coming Soon
                  </h3>
                  <p className="text-[#6B7C8F] max-w-md mx-auto mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Portfolio showcasing will be available soon. In the meantime, you can view this contractor&apos;s reviews and credentials to learn more about their work quality.
                  </p>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0a1a2a] transition-colors font-semibold cursor-pointer"
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                  >
                    <i className="ri-star-line mr-2"></i>
                    View Reviews Instead
                  </button>
                </div>
              </div>
            )}

            {/* Credentials Tab */}
            {activeTab === 'credentials' && (
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Verified Experience & Credentials
                </h2>

                <div className="grid md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-6 bg-[#F9F9FB] rounded-xl">
                    <div className={`flex items-center justify-center w-16 h-16 ${isLicensed ? 'bg-[#D4B483]' : 'bg-gray-300'} rounded-full mx-auto mb-4`}>
                      <i className="ri-shield-check-fill text-white text-3xl"></i>
                    </div>
                    <div className="text-lg font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {isLicensed ? 'Licensed' : 'Not Verified'}
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {isLicensed ? 'Documentation Verified' : 'License not on file'}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-[#F9F9FB] rounded-xl">
                    <div className={`flex items-center justify-center w-16 h-16 ${isInsured ? 'bg-[#D4B483]' : 'bg-gray-300'} rounded-full mx-auto mb-4`}>
                      <i className="ri-shield-star-fill text-white text-3xl"></i>
                    </div>
                    <div className="text-lg font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {isInsured ? 'Insured' : 'Not Verified'}
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {isInsured ? 'Liability Coverage Active' : 'Insurance not on file'}
                    </div>
                  </div>

                  <div className="text-center p-6 bg-[#F9F9FB] rounded-xl">
                    <div className={`flex items-center justify-center w-16 h-16 ${yearsInBusiness ? 'bg-[#D4B483]' : 'bg-gray-300'} rounded-full mx-auto mb-4`}>
                      <i className="ri-award-fill text-white text-3xl"></i>
                    </div>
                    <div className="text-lg font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {yearsInBusiness ? `${yearsInBusiness}+ Years` : '—'}
                    </div>
                    <div className="text-sm text-gray-600" style={{ fontFamily: 'Inter, sans-serif' }}>
                      In Business
                    </div>
                  </div>
                </div>

                {/* Verified Credentials from DB */}
                {credentials.length > 0 && (
                  <div className="p-6 bg-[#F9F9FB] rounded-xl mb-8">
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-file-list-3-line text-[#D4B483] mr-2"></i>
                      Verified Credentials
                    </h3>
                    <div className="space-y-3">
                      {credentials.map((cred) => (
                        <div key={cred.id} className="flex items-center justify-between gap-3 p-3 bg-white rounded-lg">
                          <div className="flex items-center gap-3">
                            <i className={`${cred.status === 'active' || cred.status === 'verified' ? 'ri-checkbox-circle-fill text-[#D4B483]' : 'ri-checkbox-blank-circle-line text-gray-300'} text-xl`}></i>
                            <div>
                              <span className="font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                                {cred.title}
                              </span>
                              {cred.credential_number && (
                                <p className="text-xs text-[#6B7C8F]">#{cred.credential_number}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {cred.expiry_date && (
                              <p className="text-xs text-[#6B7C8F]">
                                Expires {new Date(cred.expiry_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </p>
                            )}
                            {cred.verified_at && (
                              <p className="text-[10px] text-green-600 font-medium">
                                Verified {new Date(cred.verified_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications from contractor_profiles */}
                {certifications.length > 0 && (
                  <div className="p-6 bg-[#F9F9FB] rounded-xl mb-8">
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-medal-line text-[#D4B483] mr-2"></i>
                      Certifications
                    </h3>
                    <div className="space-y-3">
                      {certifications.map((cert) => (
                        <div key={cert} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                          <i className="ri-checkbox-circle-fill text-[#D4B483] text-xl"></i>
                          <span className="font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                            {cert}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-6 bg-gradient-to-r from-[#D4B483]/10 to-[#0B1F33]/10 rounded-xl border-2 border-[#D4B483]/20">
                  <div className="flex items-start gap-4">
                    <i className="ri-information-line text-[#D4B483] text-3xl"></i>
                    <div>
                      <h3 className="text-lg font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        Documentation Verified by Emporva
                      </h3>
                      <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        All licensing, insurance, and certification documents have been reviewed and verified by the Emporva platform.
                        We do not display private legal documents publicly, but confirm that this contractor meets our verification standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Service Area Tab */}
            {activeTab === 'area' && (
              <div>
                <h2 className="text-2xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Service Area Coverage
                </h2>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-map-2-line text-[#D4B483] mr-2"></i>
                      ZIP Codes Covered
                    </h3>
                    {zipCodes.length > 0 ? (
                      <div className="grid grid-cols-3 gap-3">
                        {zipCodes.map((zip) => (
                          <div key={zip} className="text-center p-3 bg-[#F9F9FB] rounded-lg">
                            <span className="text-sm font-bold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                              {zip}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[#6B7C8F] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>No ZIP codes listed.</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      <i className="ri-compass-line text-[#D4B483] mr-2"></i>
                      Coverage Details
                    </h3>
                    <div className="space-y-3 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {travelRadius && (
                        <div className="flex justify-between p-3 bg-[#F9F9FB] rounded-lg">
                          <span className="text-gray-600">Travel Radius:</span>
                          <span className="font-semibold text-[#333645]">{travelRadius} miles</span>
                        </div>
                      )}
                      <div className="flex justify-between p-3 bg-[#F9F9FB] rounded-lg">
                        <span className="text-gray-600">Emergency Service:</span>
                        <span className="font-semibold text-[#D4B483]">
                          {emergencyAvailable ? 'Available 24/7' : 'Business Hours Only'}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-[#F9F9FB] rounded-lg">
                        <span className="text-gray-600">ZIP Codes:</span>
                        <span className="font-semibold text-[#333645]">{zipCodes.length} areas</span>
                      </div>
                    </div>
                  </div>
                </div>

                {zipCodes.length === 0 && !travelRadius && (
                  <div className="text-center py-12">
                    <i className="ri-map-pin-line text-gray-300 text-5xl mb-3 block"></i>
                    <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Service area details have not been provided yet. Contact this contractor for availability in your area.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-7xl mx-auto px-6 pb-16">
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Ready to Start Your Project?
            </h2>
            <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              Work with {businessName} through Emporva&apos;s AI-powered workflow. Get a clear scope, transparent pricing, and coordinated execution.
            </p>
            <button
              onClick={handleStartProject}
              className="px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-colors font-bold text-lg whitespace-nowrap cursor-pointer"
              style={{ fontFamily: 'Montserrat, sans-serif' }}
            >
              <i className="ri-rocket-line mr-2"></i>
              Start a Project with This Contractor
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
