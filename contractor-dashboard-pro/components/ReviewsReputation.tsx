
import { useState, useRef, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';

interface Review {
  id: string;
  client: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  jobTitle: string;
  responded: boolean;
  response?: string;
  responseDate?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  helpful: number;
  verified: boolean;
  platform: 'google' | 'yelp' | 'facebook' | 'emporva';
}

function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const responseTemplates = [
  { id: 'thank', label: 'Thank You', text: 'Thank you so much for your kind words, {name}! We truly appreciate you taking the time to share your experience. It was a pleasure working on your {job} project.' },
  { id: 'address', label: 'Address Concern', text: 'Hi {name}, thank you for your feedback on the {job} project. We take your concerns seriously and would love the opportunity to make things right. Please reach out to us directly so we can discuss this further.' },
  { id: 'followup', label: 'Follow Up', text: 'Hi {name}, we\'re glad you\'re happy with the {job} work! If you ever need anything else or have questions about maintenance, don\'t hesitate to reach out. We\'re always here to help.' },
  { id: 'referral', label: 'Referral Ask', text: 'Thank you for the wonderful review, {name}! We\'re so glad you love the results of your {job}. If you know anyone who could use our services, we\'d be honored by the referral!' },
];

const aiSuggestions: Record<string, string[]> = {
  positive: [
    'Express genuine gratitude for their time',
    'Reference a specific detail from their review',
    'Invite them to reach out for future projects',
  ],
  neutral: [
    'Acknowledge the positive aspects they mentioned',
    'Address any concerns directly and professionally',
    'Offer a follow-up call to resolve issues',
  ],
  negative: [
    'Apologize sincerely for the experience',
    'Take responsibility without making excuses',
    'Provide a direct contact for resolution',
  ],
};

export default function ReviewsReputation() {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'dashboard' | 'reviews'>('dashboard');
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' });
  const [expandedReview, setExpandedReview] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const responseRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!user) return;
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Get contractor_profile_id for the current user
      const { data: cp } = await supabase
        .from('contractor_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!cp) { setLoading(false); return; }

      // Fetch reviews with reviewer profile info
      const { data, error } = await supabase
        .from('reviews')
        .select('*, reviewer:profiles!reviewer_id(first_name, last_name)')
        .eq('contractor_profile_id', cp.id)
        .order('created_at', { ascending: false });

      if (error) { console.error('Error fetching reviews:', error); setLoading(false); return; }

      const mapped: Review[] = (data || []).map((r: any) => {
        const firstName = r.reviewer?.first_name || '';
        const lastName = r.reviewer?.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim() || 'Anonymous';
        return {
          id: r.id,
          client: fullName,
          avatar: getInitials(fullName),
          rating: r.rating,
          comment: r.comment,
          date: formatDate(r.created_at),
          jobTitle: r.job_title || 'General',
          responded: !!r.response,
          response: r.response || undefined,
          responseDate: r.response_date ? formatDate(r.response_date) : undefined,
          sentiment: r.sentiment,
          helpful: r.helpful_count,
          verified: r.verified,
          platform: r.platform || 'emporva',
        };
      });

      setReviews(mapped);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
    setLoading(false);
  };

  const showToast = (message: string, type: string = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: '' }), 3000);
  };

  // Compute analytics from real data
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10 : 0;
  const respondedCount = reviews.filter(r => r.responded).length;
  const responseRate = totalReviews > 0 ? Math.round((respondedCount / totalReviews) * 100) : 0;

  const sentimentCounts = {
    positive: reviews.filter(r => r.sentiment === 'positive').length,
    neutral: reviews.filter(r => r.sentiment === 'neutral').length,
    negative: reviews.filter(r => r.sentiment === 'negative').length,
  };
  const sentimentPositive = totalReviews > 0 ? Math.round((sentimentCounts.positive / totalReviews) * 100) : 0;
  const sentimentNeutral = totalReviews > 0 ? Math.round((sentimentCounts.neutral / totalReviews) * 100) : 0;
  const sentimentNegative = totalReviews > 0 ? Math.round((sentimentCounts.negative / totalReviews) * 100) : 0;

  // Rating distribution from real data
  const ratingDistribution = [5, 4, 3, 2, 1].map(stars => {
    const count = reviews.filter(r => r.rating === stars).length;
    return { stars, count, pct: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0 };
  });

  // Monthly trend from real data (last 6 months)
  const monthlyData = (() => {
    const months: { month: string; reviews: number; avg: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = d.toLocaleDateString('en-US', { month: 'short' });
      const monthReviews = reviews.filter(r => {
        const rd = new Date(r.date);
        return rd.getMonth() === d.getMonth() && rd.getFullYear() === d.getFullYear();
      });
      const count = monthReviews.length;
      const avg = count > 0 ? Math.round((monthReviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
      months.push({ month: monthStr, reviews: count, avg });
    }
    return months;
  })();

  const filteredReviews = reviews
    .filter(r => filterRating === 'all' || r.rating === parseInt(filterRating))
    .filter(r => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'responded') return r.responded;
      if (filterStatus === 'pending') return !r.responded;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.rating - a.rating;
      if (sortBy === 'lowest') return a.rating - b.rating;
      return 0;
    });

  const pendingCount = reviews.filter(r => !r.responded).length;

  const handleSendResponse = async (reviewId: string) => {
    if (!responseText.trim()) return;

    const { error } = await supabase
      .from('reviews')
      .update({ response: responseText.trim(), response_date: new Date().toISOString() })
      .eq('id', reviewId);

    if (error) {
      console.error('Error saving response:', error);
      showToast('Failed to publish response', 'error');
      return;
    }

    setReviews(prev => prev.map(r =>
      r.id === reviewId ? { ...r, responded: true, response: responseText, responseDate: 'Just now' } : r
    ));
    setRespondingTo(null);
    setResponseText('');
    setShowTemplates(false);
    showToast('Response published successfully!');
  };

  const applyTemplate = (template: typeof responseTemplates[0], review: Review) => {
    const text = template.text
      .replace('{name}', review.client.split(' ')[0])
      .replace('{job}', review.jobTitle);
    setResponseText(text);
    setShowTemplates(false);
    responseRef.current?.focus();
  };

  const getSentimentColor = (s: string) => {
    if (s === 'positive') return 'bg-green-100 text-green-700';
    if (s === 'neutral') return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getSentimentIcon = (s: string) => {
    if (s === 'positive') return 'ri-emotion-happy-line';
    if (s === 'neutral') return 'ri-emotion-normal-line';
    return 'ri-emotion-unhappy-line';
  };

  const maxBarHeight = 120;
  const maxReviews = Math.max(...monthlyData.map(m => m.reviews), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="ri-loader-4-line text-3xl text-teal-600 animate-spin"></i>
          <p className="text-sm text-[#6B7C8F] mt-3">Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[100] animate-slide-in">
          <div className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl border ${
            toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <i className={`${toast.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-lg`}></i>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#0B1F33]">Reviews &amp; Reputation</h2>
            <p className="text-sm text-[#6B7C8F] mt-1">Monitor, respond, and grow your online reputation</p>
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <button
                onClick={() => { setActiveSection('reviews'); setFilterStatus('pending'); }}
                className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-semibold text-sm hover:bg-amber-100 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-chat-new-line"></i>
                {pendingCount} Awaiting Response
              </button>
            )}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="px-6 border-t border-gray-100">
          <div className="flex gap-1">
            {[
              { id: 'dashboard' as const, label: 'Analytics Dashboard', icon: 'ri-pie-chart-line' },
              { id: 'reviews' as const, label: 'All Reviews', icon: 'ri-chat-quote-line' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  activeSection === tab.id
                    ? 'border-[#0B1F33] text-[#0B1F33]'
                    : 'border-transparent text-[#6B7C8F] hover:text-[#0B1F33]'
                }`}
              >
                <i className={`${tab.icon} text-base`}></i>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ANALYTICS DASHBOARD */}
      {activeSection === 'dashboard' && (
        <div className="space-y-6">
          {/* Top Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <i className="ri-star-fill text-yellow-500 text-xl"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Average Rating</p>
              </div>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-[#0B1F33]">{avgRating}</p>
                <div className="flex mb-1">
                  {[1,2,3,4,5].map(s => (
                    <i key={s} className={`ri-star-fill text-sm ${s <= Math.round(avgRating) ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                  ))}
                </div>
              </div>
              <p className="text-xs text-[#6B7C8F] font-semibold mt-1">out of 5.0</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                  <i className="ri-chat-quote-line text-teal-600 text-xl"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Total Reviews</p>
              </div>
              <p className="text-3xl font-bold text-[#0B1F33]">{totalReviews}</p>
              <p className="text-xs text-[#6B7C8F] font-semibold mt-1">across all platforms</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                  <i className="ri-reply-line text-indigo-600 text-xl"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Response Rate</p>
              </div>
              <p className="text-3xl font-bold text-[#0B1F33]">{responseRate}%</p>
              <p className="text-xs text-[#6B7C8F] font-semibold mt-1">{respondedCount} of {totalReviews} replied</p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <i className="ri-mail-send-line text-orange-600 text-xl"></i>
                </div>
                <p className="text-xs text-[#6B7C8F] font-medium">Responses Sent</p>
              </div>
              <p className="text-3xl font-bold text-[#0B1F33]">{respondedCount}</p>
              <p className="text-xs text-[#6B7C8F] font-semibold mt-1">{respondedCount} of {totalReviews} responded</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Rating Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0B1F33] mb-5">Rating Distribution</h3>
              <div className="space-y-3">
                {ratingDistribution.map(r => (
                  <div key={r.stars} className="flex items-center gap-3">
                    <div className="flex items-center gap-1 w-16 flex-shrink-0">
                      <span className="text-sm font-bold text-[#0B1F33]">{r.stars}</span>
                      <i className="ri-star-fill text-yellow-500 text-sm"></i>
                    </div>
                    <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          r.stars >= 4 ? 'bg-green-500' : r.stars === 3 ? 'bg-yellow-500' : 'bg-red-400'
                        }`}
                        style={{ width: `${r.pct}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-[#0B1F33] w-10 text-right">{r.count}</span>
                    <span className="text-xs text-[#6B7C8F] w-10 text-right">{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Sentiment Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0B1F33] mb-5">Sentiment Analysis</h3>
              <div className="flex items-center justify-center gap-8 mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mb-2 mx-auto border-4 border-green-200">
                    <span className="text-2xl font-bold text-green-700">{sentimentPositive}%</span>
                  </div>
                  <p className="text-xs font-semibold text-green-700">Positive</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-yellow-50 flex items-center justify-center mb-2 mx-auto border-4 border-yellow-200">
                    <span className="text-lg font-bold text-yellow-700">{sentimentNeutral}%</span>
                  </div>
                  <p className="text-xs font-semibold text-yellow-700">Neutral</p>
                </div>
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-2 mx-auto border-4 border-red-200">
                    <span className="text-base font-bold text-red-600">{sentimentNegative}%</span>
                  </div>
                  <p className="text-xs font-semibold text-red-600">Negative</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${sentimentPositive}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${sentimentNeutral}%` }}></div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-400"></div>
                  <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${sentimentNegative}%` }}></div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-xs text-green-800 font-semibold"><i className="ri-thumb-up-line mr-1"></i> Top keywords: "professional", "on time", "quality", "communicative"</p>
              </div>
            </div>
          </div>

          {/* Monthly Trend */}
          <div className="grid md:grid-cols-1 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-[#0B1F33] mb-5">Monthly Review Trend</h3>
              <div className="flex items-end gap-4 h-40 mb-3">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-bold text-[#0B1F33]">{m.reviews}</span>
                    <div
                      className="w-full bg-gradient-to-t from-teal-600 to-teal-400 rounded-t-md transition-all duration-500"
                      style={{ height: `${(m.reviews / maxReviews) * maxBarHeight}px` }}
                    ></div>
                  </div>
                ))}
              </div>
              <div className="flex gap-4">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex-1 text-center">
                    <p className="text-xs text-[#6B7C8F] font-medium">{m.month}</p>
                    <p className="text-[10px] text-yellow-600 font-semibold">{m.avg}<i className="ri-star-fill text-[8px] ml-0.5"></i></p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Platform Breakdown */}
          {reviews.length > 0 && (() => {
            const platformConfig: Record<string, { label: string; icon: string; color: string; bg: string }> = {
              google: { label: 'Google', icon: 'ri-google-fill', color: 'text-blue-600', bg: 'bg-blue-50' },
              yelp: { label: 'Yelp', icon: 'ri-star-smile-line', color: 'text-red-600', bg: 'bg-red-50' },
              facebook: { label: 'Facebook', icon: 'ri-facebook-circle-fill', color: 'text-blue-700', bg: 'bg-blue-50' },
              emporva: { label: 'Emporva', icon: 'ri-tools-line', color: 'text-teal-600', bg: 'bg-teal-50' },
            };
            const platforms = Object.keys(platformConfig) as (keyof typeof platformConfig)[];
            const breakdown = platforms.map(p => {
              const pReviews = reviews.filter(r => r.platform === p);
              const count = pReviews.length;
              const avg = count > 0 ? Math.round((pReviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : 0;
              return { key: p, ...platformConfig[p], count, avg };
            }).filter(p => p.count > 0);

            return breakdown.length > 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-[#0B1F33] mb-5">Platform Breakdown</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {breakdown.map(p => (
                    <div key={p.key} className="rounded-xl border border-gray-100 p-4 text-center">
                      <div className={`w-10 h-10 ${p.bg} rounded-lg flex items-center justify-center mx-auto mb-3`}>
                        <i className={`${p.icon} ${p.color} text-xl`}></i>
                      </div>
                      <p className="text-sm font-bold text-[#0B1F33]">{p.label}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <span className="text-xl font-bold text-[#0B1F33]">{p.avg}</span>
                        <i className="ri-star-fill text-yellow-500 text-sm"></i>
                      </div>
                      <p className="text-xs text-[#6B7C8F] mt-0.5">{p.count} review{p.count !== 1 ? 's' : ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })()}

          {/* Needs Attention */}
          {reviews.filter(r => !r.responded).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                  <i className="ri-alarm-warning-line text-amber-600 text-xl"></i>
                </div>
                <div>
                  <h3 className="font-bold text-[#0B1F33]">Needs Your Response</h3>
                  <p className="text-xs text-[#6B7C8F]">{pendingCount} reviews awaiting a reply — responding boosts your ranking</p>
                </div>
              </div>
              <div className="space-y-3">
                {reviews.filter(r => !r.responded).slice(0, 3).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#0B1F33] flex items-center justify-center text-white text-xs font-bold">{r.avatar}</div>
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F33]">{r.client} — <span className="font-normal text-[#6B7C8F]">{r.jobTitle}</span></p>
                        <div className="flex items-center gap-1">
                          {[1,2,3,4,5].map(s => (
                            <i key={s} className={`ri-star-fill text-xs ${s <= r.rating ? 'text-yellow-500' : 'text-gray-300'}`}></i>
                          ))}
                          <span className="text-xs text-[#6B7C8F] ml-1">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => { setActiveSection('reviews'); setRespondingTo(r.id); setFilterStatus('pending'); }}
                      className="px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap"
                    >
                      Respond Now
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ALL REVIEWS */}
      {activeSection === 'reviews' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#6B7C8F]">Rating</label>
                <select
                  value={filterRating}
                  onChange={e => setFilterRating(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-[#0B1F33] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All Ratings</option>
                  <option value="5">5 Stars</option>
                  <option value="4">4 Stars</option>
                  <option value="3">3 Stars</option>
                  <option value="2">2 Stars</option>
                  <option value="1">1 Star</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#6B7C8F]">Status</label>
                <select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-[#0B1F33] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="all">All</option>
                  <option value="responded">Responded</option>
                  <option value="pending">Pending Response</option>
                </select>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <label className="text-xs font-semibold text-[#6B7C8F]">Sort</label>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-2 text-[#0B1F33] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rated</option>
                  <option value="lowest">Lowest Rated</option>
                </select>
              </div>
              <span className="text-xs text-[#6B7C8F] font-medium">{filteredReviews.length} reviews</span>
            </div>
          </div>

          {/* Review Cards */}
          <div className="space-y-4">
            {filteredReviews.map(review => (
              <div key={review.id} className={`bg-white rounded-xl shadow-sm border ${!review.responded ? 'border-amber-200' : 'border-gray-100'} overflow-hidden`}>
                {/* Review Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#0B1F33] flex items-center justify-center text-white font-bold text-sm">{review.avatar}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-[#0B1F33]">{review.client}</p>
                          {review.verified && (
                            <span className="text-[10px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded font-semibold flex items-center gap-0.5">
                              <i className="ri-verified-badge-fill text-[10px]"></i> Verified
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex">
                            {[1,2,3,4,5].map(s => (
                              <i key={s} className={`ri-star-fill text-sm ${s <= review.rating ? 'text-yellow-500' : 'text-gray-200'}`}></i>
                            ))}
                          </div>
                          <span className="text-xs text-[#6B7C8F]">{review.date}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getSentimentColor(review.sentiment)}`}>
                            <i className={`${getSentimentIcon(review.sentiment)} mr-0.5`}></i>
                            {review.sentiment}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {review.responded ? (
                        <span className="text-[10px] bg-green-50 text-green-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                          <i className="ri-check-line mr-0.5"></i> Responded
                        </span>
                      ) : (
                        <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                          <i className="ri-time-line mr-0.5"></i> Pending
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Review Body */}
                  <p className="text-sm text-[#0B1F33] leading-relaxed mb-3">{review.comment}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-[#F9F9FB] text-[#6B7C8F] px-2.5 py-1 rounded-md font-medium">
                      <i className="ri-briefcase-line mr-1"></i>{review.jobTitle}
                    </span>
                    <span className="text-xs text-[#6B7C8F]">
                      <i className="ri-thumb-up-line mr-1"></i>{review.helpful} found helpful
                    </span>
                  </div>

                  {/* Existing Response */}
                  {review.responded && review.response && (
                    <div className="mt-4 ml-6 p-4 bg-[#F9F9FB] rounded-lg border-l-3 border-[#0B1F33]">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-reply-line text-[#0B1F33] text-sm"></i>
                        <span className="text-xs font-bold text-[#0B1F33]">Your Response</span>
                        <span className="text-xs text-[#6B7C8F]">· {review.responseDate}</span>
                      </div>
                      <p className="text-sm text-[#0B1F33] leading-relaxed">{review.response}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-2">
                    {!review.responded && (
                      <button
                        onClick={() => { setRespondingTo(respondingTo === review.id ? null : review.id); setResponseText(''); setShowTemplates(false); }}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-reply-line"></i>
                        Write Response
                      </button>
                    )}
                    {review.responded && (
                      <button
                        onClick={() => { setRespondingTo(respondingTo === review.id ? null : review.id); setResponseText(review.response || ''); setShowTemplates(false); }}
                        className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-edit-line"></i>
                        Edit Response
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedReview(expandedReview === review.id ? null : review.id)}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-share-line"></i>
                      Share
                    </button>
                    <button
                      onClick={() => showToast('Review flagged for internal review')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-200 transition-all cursor-pointer whitespace-nowrap"
                    >
                      <i className="ri-flag-line"></i>
                      Flag
                    </button>
                  </div>

                  {/* Share Options */}
                  {expandedReview === review.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg flex items-center gap-3">
                      <span className="text-xs text-[#6B7C8F] font-medium">Share to:</span>
                      <button onClick={() => showToast('Copied to clipboard!')} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B1F33] hover:bg-gray-100 cursor-pointer whitespace-nowrap">
                        <i className="ri-file-copy-line"></i> Copy Link
                      </button>
                      <button onClick={() => showToast('Added to website testimonials!')} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B1F33] hover:bg-gray-100 cursor-pointer whitespace-nowrap">
                        <i className="ri-global-line"></i> Website
                      </button>
                      <button onClick={() => showToast('Shared to social media!')} className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-[#0B1F33] hover:bg-gray-100 cursor-pointer whitespace-nowrap">
                        <i className="ri-share-forward-line"></i> Social
                      </button>
                    </div>
                  )}
                </div>

                {/* Response Composer */}
                {respondingTo === review.id && (
                  <div className="border-t border-gray-100 p-5 bg-[#FAFBFC]">
                    {/* AI Suggestions */}
                    <div className="mb-4 p-3 bg-gradient-to-r from-teal-50 to-green-50 rounded-lg border border-teal-100">
                      <div className="flex items-center gap-2 mb-2">
                        <i className="ri-sparkling-line text-teal-600"></i>
                        <span className="text-xs font-bold text-teal-800">AI Response Tips</span>
                      </div>
                      <ul className="space-y-1">
                        {(aiSuggestions[review.sentiment] || aiSuggestions.positive).map((tip, i) => (
                          <li key={i} className="text-xs text-teal-700 flex items-start gap-1.5">
                            <i className="ri-checkbox-circle-line text-teal-500 mt-0.5 flex-shrink-0"></i>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Templates */}
                    <div className="mb-3">
                      <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[#0B1F33] hover:text-teal-700 transition-colors cursor-pointer"
                      >
                        <i className={`ri-file-list-3-line`}></i>
                        Quick Templates
                        <i className={`ri-arrow-${showTemplates ? 'up' : 'down'}-s-line`}></i>
                      </button>
                      {showTemplates && (
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          {responseTemplates.map(t => (
                            <button
                              key={t.id}
                              onClick={() => applyTemplate(t, review)}
                              className="text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer"
                            >
                              <p className="text-xs font-bold text-[#0B1F33] mb-1">{t.label}</p>
                              <p className="text-[10px] text-[#6B7C8F] line-clamp-2">{t.text.replace('{name}', review.client.split(' ')[0]).replace('{job}', review.jobTitle)}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Textarea */}
                    <textarea
                      ref={responseRef}
                      value={responseText}
                      onChange={e => setResponseText(e.target.value)}
                      placeholder={`Write your response to ${review.client}...`}
                      maxLength={500}
                      className="w-full border border-gray-200 rounded-lg p-3 text-sm text-[#0B1F33] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-xs font-medium ${responseText.length > 450 ? 'text-amber-600' : 'text-[#6B7C8F]'}`}>
                        {responseText.length}/500 characters
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setRespondingTo(null); setResponseText(''); setShowTemplates(false); }}
                          className="px-4 py-2 text-xs font-semibold text-[#6B7C8F] hover:text-[#0B1F33] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSendResponse(review.id)}
                          disabled={!responseText.trim()}
                          className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                            responseText.trim()
                              ? 'bg-[#0B1F33] text-white hover:bg-[#1a3a52]'
                              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          <i className="ri-send-plane-line"></i>
                          Publish Response
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {filteredReviews.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                <i className="ri-chat-off-line text-4xl text-gray-300 mb-3"></i>
                <p className="text-sm font-semibold text-[#0B1F33]">No reviews match your filters</p>
                <p className="text-xs text-[#6B7C8F] mt-1">Try adjusting your filter criteria</p>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .border-l-3 { border-left-width: 3px; }
      `}</style>
    </div>
  );
}
