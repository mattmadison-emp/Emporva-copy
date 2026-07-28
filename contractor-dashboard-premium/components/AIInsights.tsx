import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

interface Insight {
  id: number;
  type: 'opportunity' | 'action' | 'warning' | 'trend';
  title: string;
  description: string;
  metric?: string;
  metricLabel?: string;
  ctaLabel?: string;
  ctaAction?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  isNew?: boolean;
  details?: InsightDetail;
}

interface InsightDetail {
  summary: string;
  recommendations: string[];
  relatedData: { label: string; value: string }[];
  impact: string;
}

const _insightsPlaceholder: Insight[] = [
  {
    id: 1,
    type: 'opportunity',
    title: 'placeholder',
    description: 'placeholder',
    metric: '$22,000',
    metricLabel: 'Potential Revenue',
    ctaLabel: 'Go to Pipeline',
    ctaAction: 'pipeline',
    priority: 'high',
    timestamp: '2 min ago',
    isNew: true,
    details: {
      summary: 'David Thompson requested a full roof replacement with architectural shingles. Insurance claim is pending approval. The property at 654 Cedar Ln has an older roof showing significant wear.',
      recommendations: [
        'Send a detailed quote within the next 24 hours to maximize close probability',
        'Include a financing option — leads in this price range convert 22% more with payment plans',
        'Mention your insurance claim experience to build trust',
        'Offer a free gutter inspection as an add-on to increase deal value'
      ],
      relatedData: [
        { label: 'Client', value: 'David Thompson' },
        { label: 'Property', value: '654 Cedar Ln, Austin TX' },
        { label: 'Days in Stage', value: '4 days (Ready to Quote)' },
        { label: 'Similar Jobs Won', value: '6 of 8 (75% close rate)' },
        { label: 'Avg Quote-to-Close', value: '3.2 days' },
        { label: 'Insurance Status', value: 'Claim Pending' }
      ],
      impact: 'Closing this deal would add $22,000 to your monthly revenue and strengthen your roofing portfolio.'
    }
  },
  {
    id: 2,
    type: 'trend',
    title: 'Revenue Trending Up 18%',
    description: 'Your month-to-date revenue is $48K, up 18% from last month at this point. You\'re on track to hit $62K if current pace holds.',
    metric: '+18%',
    metricLabel: 'vs Last Month',
    ctaAction: 'analytics',
    priority: 'medium',
    timestamp: '1 hr ago',
    details: {
      summary: 'Your revenue growth is accelerating. January MTD is $48,200 compared to $40,800 at the same point last month. The increase is driven by higher average job values and faster pipeline conversion.',
      recommendations: [
        'Maintain your current quoting speed — it\'s the primary driver of improved conversion',
        'Consider hiring an additional crew member to handle increased volume',
        'Review your pricing — strong demand may support a 5-10% rate increase'
      ],
      relatedData: [
        { label: 'MTD Revenue', value: '$48,200' },
        { label: 'Last Month Same Period', value: '$40,800' },
        { label: 'Projected Month End', value: '$62,000' },
        { label: 'Avg Job Value', value: '$10,450 (+12%)' },
        { label: 'Jobs Completed MTD', value: '5' },
        { label: 'Pipeline Value', value: '$103,550' }
      ],
      impact: 'At this pace, you\'ll exceed your quarterly target by approximately $18,000.'
    }
  },
  {
    id: 3,
    type: 'action',
    title: '3 Follow-Ups Overdue',
    description: 'Sarah Mitchell (Gutter Cleaning), Lisa Wong (Fence Repair), and 1 other client haven\'t been contacted in 7+ days. Timely follow-ups recover 25% of stalled leads.',
    metric: '3',
    metricLabel: 'Overdue',
    ctaLabel: 'View Tasks',
    ctaAction: 'crm',
    priority: 'high',
    timestamp: '3 hrs ago',
    isNew: true,
    details: {
      summary: 'Three clients in your pipeline have not received any communication in over 7 days. Industry data shows that leads contacted within 7 days have a 25% higher conversion rate than those left longer.',
      recommendations: [
        'Call Sarah Mitchell today — she\'s a repeat client with high lifetime value',
        'Send Lisa Wong a quick text with an updated timeline for her fence repair',
        'Set up automated follow-up reminders in the Automation Hub to prevent future gaps',
        'Consider a batch email campaign for all stalled leads'
      ],
      relatedData: [
        { label: 'Sarah Mitchell', value: 'Gutter Cleaning — $450 — 14 days no contact' },
        { label: 'Lisa Wong', value: 'Fence Repair — $3,500 — 10 days no contact' },
        { label: 'Marcus Chen', value: 'Deck Construction — $15,000 — 8 days no contact' },
        { label: 'Recovery Rate', value: '25% of stalled leads convert after follow-up' },
        { label: 'Revenue at Risk', value: '$18,950' },
        { label: 'Suggested Action', value: 'Phone call + personalized message' }
      ],
      impact: 'Following up on these 3 leads could recover up to $18,950 in potential revenue.'
    }
  },
  {
    id: 4,
    type: 'opportunity',
    title: 'Upsell Opportunity Detected',
    description: 'Jennifer Rodriguez\'s HVAC installation ($9.8K) is a great candidate for a maintenance plan upsell. Similar clients accept 62% of the time.',
    metric: '+$1,200/yr',
    metricLabel: 'Recurring Revenue',
    ctaLabel: 'View Job',
    ctaAction: 'jobs',
    priority: 'medium',
    timestamp: '5 hrs ago',
    details: {
      summary: 'Jennifer Rodriguez is scheduled for a 3-ton HVAC installation next Tuesday. Clients who purchase a new HVAC system are 62% likely to accept a maintenance plan when offered at the time of installation. This represents a recurring revenue opportunity.',
      recommendations: [
        'Prepare a maintenance plan proposal before the installation date',
        'Offer a discounted first-year rate ($80/month vs $100) as an installation bundle',
        'Include filter replacements and bi-annual inspections in the plan',
        'Mention energy savings — maintained systems use 15-25% less energy'
      ],
      relatedData: [
        { label: 'Client', value: 'Jennifer Rodriguez' },
        { label: 'Current Job', value: 'HVAC Installation — $9,800' },
        { label: 'Maintenance Plan Value', value: '$1,200/year recurring' },
        { label: 'Acceptance Rate', value: '62% for similar clients' },
        { label: 'Installation Date', value: 'Next Tuesday' },
        { label: 'System Type', value: '3-ton residential unit' }
      ],
      impact: 'Adding this maintenance plan would generate $1,200/year in predictable recurring revenue with minimal additional effort.'
    }
  },
  {
    id: 5,
    type: 'warning',
    title: 'Basement Finishing Behind Schedule',
    description: 'Amanda Garcia\'s project has been in progress for 12 days — 3 days longer than your average. Consider checking in to avoid scope creep.',
    metric: '12 days',
    metricLabel: 'In Progress',
    ctaLabel: 'View Job',
    ctaAction: 'jobs',
    priority: 'high',
    timestamp: '6 hrs ago',
    details: {
      summary: 'The basement finishing project for Amanda Garcia at 258 Willow Rd has been in progress for 12 days, exceeding your average completion time of 9 days for similar projects. The client recently added a home theater request which may be contributing to the delay.',
      recommendations: [
        'Schedule a check-in call with Amanda to discuss timeline expectations',
        'Evaluate whether the home theater addition needs a formal change order',
        'Review crew allocation — consider adding a second team for parallel work',
        'Document the scope change to protect against disputes'
      ],
      relatedData: [
        { label: 'Client', value: 'Amanda Garcia' },
        { label: 'Property', value: '258 Willow Rd, Austin TX' },
        { label: 'Job Value', value: '$18,500' },
        { label: 'Days in Progress', value: '12 (avg is 9)' },
        { label: 'Current Phase', value: 'Electrical rough-in' },
        { label: 'Scope Change', value: 'Home theater addition requested' }
      ],
      impact: 'Delays beyond 15 days historically lead to a 30% increase in client complaints and a 15% drop in review scores.'
    }
  },
  {
    id: 6,
    type: 'trend',
    title: 'Your Close Rate is Climbing',
    description: 'You\'ve closed 68% of quoted jobs this month, up from 54% last quarter. Your quoting speed improvement is the likely driver.',
    metric: '68%',
    metricLabel: 'Close Rate',
    ctaAction: 'analytics',
    priority: 'low',
    timestamp: '12 hrs ago',
    details: {
      summary: 'Your close rate has improved significantly from 54% last quarter to 68% this month. Analysis suggests the primary driver is your improved quoting speed — you\'re now sending quotes an average of 1.2 days after initial contact, down from 3.4 days.',
      recommendations: [
        'Continue prioritizing fast quote turnaround — it\'s your biggest competitive advantage',
        'Share your quoting templates with any new team members to maintain speed',
        'Consider A/B testing quote formats to push close rate even higher'
      ],
      relatedData: [
        { label: 'Current Close Rate', value: '68%' },
        { label: 'Last Quarter', value: '54%' },
        { label: 'Industry Average', value: '45%' },
        { label: 'Avg Quote Turnaround', value: '1.2 days (was 3.4)' },
        { label: 'Quotes Sent MTD', value: '19' },
        { label: 'Quotes Won MTD', value: '13' }
      ],
      impact: 'A 68% close rate puts you in the top 10% of contractors on the platform.'
    }
  },
  {
    id: 7,
    type: 'action',
    title: 'Review Request Opportunity',
    description: 'Michael Brown\'s window replacement was completed recently. Requesting a review within 48 hours of completion gets 3x more responses.',
    metric: '4.9★',
    metricLabel: 'Current Rating',
    ctaLabel: 'Send Request',
    ctaAction: 'reviews',
    priority: 'medium',
    timestamp: '1 day ago',
    details: {
      summary: 'Michael Brown\'s window replacement at 369 Ash Dr was completed and passed final inspection. The optimal window for requesting a review is within 48 hours of project completion — response rates drop by 67% after that window.',
      recommendations: [
        'Send a personalized review request via email and SMS today',
        'Reference specific project details (8 windows, passed inspection) to prompt a detailed review',
        'Include a direct link to your review page to minimize friction',
        'Follow up with a thank-you message regardless of whether they leave a review'
      ],
      relatedData: [
        { label: 'Client', value: 'Michael Brown' },
        { label: 'Job', value: 'Window Replacement — $7,200' },
        { label: 'Completion Status', value: 'Inspection passed' },
        { label: 'Current Rating', value: '4.9★ (47 reviews)' },
        { label: 'Review Response Rate', value: '72% within 48 hrs' },
        { label: 'Time Since Completion', value: '~1 day' }
      ],
      impact: 'Maintaining a 4.9+ rating keeps you in the "Top Rated" badge tier, which increases lead volume by an estimated 35%.'
    }
  },
  {
    id: 8,
    type: 'opportunity',
    title: '5 New Marketplace Jobs Match Your Trades',
    description: 'There are 5 new jobs in the marketplace matching Plumbing, HVAC, and Electrical within your service area. Early bidders win 40% more jobs.',
    metric: '5',
    metricLabel: 'New Matches',
    ctaLabel: 'View Marketplace',
    ctaAction: 'marketplace',
    priority: 'high',
    timestamp: '30 min ago',
    isNew: true,
    details: {
      summary: 'Five new jobs have been posted in the Emporva marketplace that match your registered trades (Plumbing, HVAC, Electrical) and are within your Austin, TX service area. Data shows that contractors who submit quotes within the first 2 hours win 40% more jobs.',
      recommendations: [
        'Review and bid on the highest-value jobs first',
        'Use your AI-powered quote builder for faster turnaround',
        'Highlight your 4.9★ rating and completion track record in your proposals',
        'Set up marketplace alerts in Automation Hub to get notified instantly'
      ],
      relatedData: [
        { label: 'New Matches', value: '5 jobs' },
        { label: 'Matching Trades', value: 'Plumbing, HVAC, Electrical' },
        { label: 'Service Area', value: 'Austin, TX (25 mi radius)' },
        { label: 'Estimated Total Value', value: '$34,500' },
        { label: 'Early Bid Advantage', value: '40% higher win rate' },
        { label: 'Your Win Rate', value: '52% on marketplace bids' }
      ],
      impact: 'Bidding on all 5 jobs could yield 2-3 new projects worth an estimated $18,000-$24,000.'
    }
  },
];

const typeConfig = {
  opportunity: {
    icon: 'ri-lightbulb-flash-line',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    label: 'Opportunity',
  },
  action: {
    icon: 'ri-alarm-warning-line',
    color: 'text-rose-600',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-700',
    label: 'Action Needed',
  },
  warning: {
    icon: 'ri-error-warning-line',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    badge: 'bg-orange-100 text-orange-700',
    label: 'Heads Up',
  },
  trend: {
    icon: 'ri-line-chart-line',
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    badge: 'bg-teal-100 text-teal-700',
    label: 'Trend',
  },
};

interface AIInsightsProps {
  onNavigate?: (tab: string) => void;
}

export default function AIInsights({ onNavigate }: AIInsightsProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<'all' | 'opportunity' | 'action' | 'warning' | 'trend'>('all');
  const [dismissedIds, setDismissedIds] = useState<number[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [insightsData, setInsightsData] = useState<Insight[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const fetchInsights = useCallback(async () => {
    if (!user) return;
    const insights: Insight[] = [];
    let nextId = 1;

    // Fetch contractor data
    const [wiRes, payRes, reviewsRes, jobsRes] = await Promise.all([
      supabase.from('work_items').select('id, job_id, trade, status, agreed_price, updated_at').eq('contractor_id', user.id),
      supabase.from('payments').select('amount, created_at, status').eq('payee_id', user.id).eq('status', 'completed'),
      supabase.from('contractor_profiles').select('id').eq('user_id', user.id).single().then(async ({ data: cp }) => {
        if (!cp) return { data: [] };
        return supabase.from('reviews').select('rating').eq('contractor_profile_id', cp.id);
      }),
      supabase.from('jobs').select('id, title, category, status, created_at').eq('status', 'open').neq('user_id', user.id).order('created_at', { ascending: false }).limit(10),
    ]);

    const workItems = wiRes.data || [];
    const payments = (payRes.data || []).map(p => ({ ...p, amount: Number(p.amount) }));
    const reviews = reviewsRes.data || [];
    const openJobs = jobsRes.data || [];

    // 1. Revenue trend insight
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthRevenue = payments.filter(p => new Date(p.created_at) >= thisMonthStart).reduce((s, p) => s + p.amount, 0);
    const lastMonthRevenue = payments.filter(p => { const d = new Date(p.created_at); return d >= lastMonthStart && d < thisMonthStart; }).reduce((s, p) => s + p.amount, 0);

    if (lastMonthRevenue > 0) {
      const change = Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100);
      insights.push({
        id: nextId++, type: 'trend',
        title: change >= 0 ? `Revenue ${change > 0 ? 'Up' : 'Flat'} ${Math.abs(change)}%` : `Revenue Down ${Math.abs(change)}%`,
        description: `Your month-to-date revenue is $${thisMonthRevenue.toLocaleString()}, ${change >= 0 ? 'up' : 'down'} ${Math.abs(change)}% from last month's $${lastMonthRevenue.toLocaleString()}.`,
        metric: `${change >= 0 ? '+' : ''}${change}%`, metricLabel: 'vs Last Month',
        ctaAction: 'analytics', priority: Math.abs(change) > 15 ? 'high' : 'medium', timestamp: 'Today',
      });
    }

    // 2. Stalled work items (in open/quoted for too long)
    const stalledWIs = workItems.filter(w => {
      if (w.status !== 'open' && w.status !== 'quoted') return false;
      const days = Math.floor((Date.now() - new Date(w.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      return days > 5;
    });
    if (stalledWIs.length > 0) {
      const totalValue = stalledWIs.reduce((s, w) => s + (Number(w.agreed_price) || 0), 0);
      insights.push({
        id: nextId++, type: 'action',
        title: `${stalledWIs.length} Lead${stalledWIs.length > 1 ? 's' : ''} Need Attention`,
        description: `You have ${stalledWIs.length} work item${stalledWIs.length > 1 ? 's' : ''} that haven't moved in over 5 days. Timely follow-ups recover 25% of stalled leads.`,
        metric: String(stalledWIs.length), metricLabel: 'Stalled',
        ctaLabel: 'View Pipeline', ctaAction: 'pipeline',
        priority: 'high', timestamp: 'Today', isNew: true,
        details: {
          summary: `${stalledWIs.length} work items are sitting in open or quoted status for more than 5 days.`,
          recommendations: ['Follow up with homeowners on pending quotes', 'Consider adjusting pricing if win rate is low', 'Use the pipeline view to prioritize these leads'],
          relatedData: [{ label: 'Stalled Items', value: String(stalledWIs.length) }, { label: 'Revenue at Risk', value: `$${totalValue.toLocaleString()}` }],
          impact: `Following up could recover up to $${totalValue.toLocaleString()} in potential revenue.`,
        },
      });
    }

    // 3. New marketplace matches
    if (openJobs.length > 0) {
      insights.push({
        id: nextId++, type: 'opportunity',
        title: `${openJobs.length} New Marketplace Job${openJobs.length > 1 ? 's' : ''}`,
        description: `There are ${openJobs.length} new jobs in the marketplace matching your trades. Early bidders win 40% more jobs.`,
        metric: String(openJobs.length), metricLabel: 'New Matches',
        ctaLabel: 'View Marketplace', ctaAction: 'marketplace',
        priority: 'high', timestamp: 'Today', isNew: true,
      });
    }

    // 4. Review rating insight
    if (reviews.length > 0) {
      const avgRating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
      insights.push({
        id: nextId++, type: 'trend',
        title: `Your Rating: ${avgRating}★ (${reviews.length} reviews)`,
        description: avgRating >= 4.5
          ? `Excellent! Your ${avgRating}★ rating puts you in the top tier. This increases your lead volume by an estimated 35%.`
          : `Your ${avgRating}★ rating across ${reviews.length} reviews. Aim for 4.5+ to unlock "Top Rated" badge benefits.`,
        metric: `${avgRating}★`, metricLabel: `${reviews.length} Reviews`,
        ctaAction: 'reviews', priority: 'low', timestamp: 'Today',
      });
    }

    // 5. Completion rate insight
    const completedWIs = workItems.filter(w => w.status === 'completed').length;
    const totalWIs = workItems.length;
    if (totalWIs > 3) {
      const completionRate = Math.round((completedWIs / totalWIs) * 100);
      insights.push({
        id: nextId++, type: 'trend',
        title: `${completionRate}% Job Completion Rate`,
        description: `You've completed ${completedWIs} of ${totalWIs} work items. ${completionRate >= 70 ? 'Great pace!' : 'Consider focusing on closing out in-progress jobs.'}`,
        metric: `${completionRate}%`, metricLabel: 'Completion',
        ctaAction: 'analytics', priority: completionRate < 50 ? 'high' : 'low', timestamp: 'Today',
      });
    }

    // 6. In-progress items taking too long
    const longRunning = workItems.filter(w => {
      if (w.status !== 'in-progress') return false;
      const days = Math.floor((Date.now() - new Date(w.updated_at).getTime()) / (1000 * 60 * 60 * 24));
      return days > 14;
    });
    if (longRunning.length > 0) {
      insights.push({
        id: nextId++, type: 'warning',
        title: `${longRunning.length} Job${longRunning.length > 1 ? 's' : ''} Running Long`,
        description: `${longRunning.length} job${longRunning.length > 1 ? 's have' : ' has'} been in progress for over 2 weeks. Check in to avoid scope creep and client concerns.`,
        metric: String(longRunning.length), metricLabel: 'Overdue',
        ctaLabel: 'View Jobs', ctaAction: 'jobs',
        priority: 'high', timestamp: 'Today',
      });
    }

    // Sort: high priority first, then by isNew
    insights.sort((a, b) => {
      const pOrder = { high: 0, medium: 1, low: 2 };
      if (pOrder[a.priority] !== pOrder[b.priority]) return pOrder[a.priority] - pOrder[b.priority];
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return 0;
    });

    setInsightsData(insights);
    setLoadingInsights(false);
  }, [user]);

  useEffect(() => { fetchInsights(); }, [fetchInsights]);
  const [animatingIds, setAnimatingIds] = useState<number[]>([]);
  const [detailInsight, setDetailInsight] = useState<Insight | null>(null);

  const filtered = insightsData
    .filter((i) => !dismissedIds.includes(i.id))
    .filter((i) => filter === 'all' || i.type === filter);

  const newCount = insightsData.filter((i) => i.isNew && !dismissedIds.includes(i.id)).length;

  const dismiss = (id: number) => {
    setAnimatingIds((prev) => [...prev, id]);
    setTimeout(() => {
      setDismissedIds((prev) => [...prev, id]);
      setAnimatingIds((prev) => prev.filter((x) => x !== id));
      if (expandedId === id) setExpandedId(null);
    }, 300);
  };

  // Typing animation for the greeting
  const [greeting, setGreeting] = useState('');
  const fullGreeting = 'Here\'s what needs your attention today.';
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      setGreeting(fullGreeting.slice(0, idx + 1));
      idx++;
      if (idx >= fullGreeting.length) clearInterval(interval);
    }, 25);
    return () => clearInterval(interval);
  }, []);

  const filterButtons: { id: typeof filter; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'ri-apps-line' },
    { id: 'opportunity', label: 'Opportunities', icon: 'ri-lightbulb-flash-line' },
    { id: 'action', label: 'Actions', icon: 'ri-alarm-warning-line' },
    { id: 'warning', label: 'Warnings', icon: 'ri-error-warning-line' },
    { id: 'trend', label: 'Trends', icon: 'ri-line-chart-line' },
  ];

  const handleCtaClick = (e: React.MouseEvent, insight: Insight) => {
    e.stopPropagation();
    if (insight.ctaAction && onNavigate) {
      onNavigate(insight.ctaAction);
    } else {
      setDetailInsight(insight);
    }
  };

  const handleViewDetails = (e: React.MouseEvent, insight: Insight) => {
    e.stopPropagation();
    setDetailInsight(insight);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] via-[#132d47] to-[#0B1F33] p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4B483] to-[#c4a060] flex items-center justify-center shadow-lg">
              <i className="ri-sparkling-2-fill text-[#0B1F33] text-2xl"></i>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  AI Insights
                </h2>
                {newCount > 0 && (
                  <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full animate-pulse">
                    {newCount} new
                  </span>
                )}
              </div>
              <p className="text-white/70 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                {greeting}
                <span className="inline-block w-0.5 h-4 bg-[#D4B483] ml-0.5 animate-pulse align-middle" />
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-white/10 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-xs text-white/80 font-medium">Live</span>
            </div>
          </div>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-4 gap-3 mt-5">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-lightbulb-flash-line text-amber-400 text-sm"></i>
              <span className="text-xs text-white/60">Opportunities</span>
            </div>
            <p className="text-lg font-bold text-white">
              {insightsData.filter((i) => i.type === 'opportunity' && !dismissedIds.includes(i.id)).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-alarm-warning-line text-rose-400 text-sm"></i>
              <span className="text-xs text-white/60">Actions Needed</span>
            </div>
            <p className="text-lg font-bold text-white">
              {insightsData.filter((i) => i.type === 'action' && !dismissedIds.includes(i.id)).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-error-warning-line text-orange-400 text-sm"></i>
              <span className="text-xs text-white/60">Warnings</span>
            </div>
            <p className="text-lg font-bold text-white">
              {insightsData.filter((i) => i.type === 'warning' && !dismissedIds.includes(i.id)).length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <i className="ri-line-chart-line text-teal-400 text-sm"></i>
              <span className="text-xs text-white/60">Positive Trends</span>
            </div>
            <p className="text-lg font-bold text-white">
              {insightsData.filter((i) => i.type === 'trend' && !dismissedIds.includes(i.id)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="px-6 py-3 border-b border-gray-100 bg-[#F9F9FB]">
        <div className="flex items-center gap-2">
          {filterButtons.map((btn) => (
            <button
              key={btn.id}
              onClick={() => setFilter(btn.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                filter === btn.id
                  ? 'bg-[#0B1F33] text-white shadow-sm'
                  : 'text-[#6B7C8F] hover:bg-white hover:shadow-sm'
              }`}
            >
              <i className={`${btn.icon} text-sm`}></i>
              {btn.label}
            </button>
          ))}
          <div className="flex-1" />
          <span className="text-xs text-[#6B7C8F]">
            {filtered.length} insight{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Insights List */}
      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <i className="ri-check-double-line text-3xl text-gray-400"></i>
            </div>
            <p className="text-sm font-semibold text-[#0B1F33] mb-1">All caught up!</p>
            <p className="text-xs text-[#6B7C8F]">No insights in this category right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((insight) => {
              const config = typeConfig[insight.type];
              const isExpanded = expandedId === insight.id;
              const isAnimating = animatingIds.includes(insight.id);

              return (
                <div
                  key={insight.id}
                  className={`group border rounded-xl transition-all duration-300 ${
                    isAnimating
                      ? 'opacity-0 -translate-x-4 max-h-0 overflow-hidden border-transparent p-0 m-0'
                      : `${config.border} hover:shadow-md`
                  } ${isExpanded ? 'shadow-md' : ''}`}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                    className="flex items-start gap-4 p-4 cursor-pointer"
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 ${config.bg} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <i className={`${config.icon} ${config.color} text-xl`}></i>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${config.badge}`}>
                          {config.label}
                        </span>
                        {insight.isNew && (
                          <span className="px-1.5 py-0.5 bg-teal-100 text-teal-700 rounded-full text-[10px] font-bold uppercase">
                            New
                          </span>
                        )}
                        {insight.priority === 'high' && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">
                            High Priority
                          </span>
                        )}
                        <span className="text-[10px] text-[#6B7C8F] ml-auto flex-shrink-0">{insight.timestamp}</span>
                      </div>
                      <h4 className="text-sm font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {insight.title}
                      </h4>
                      <p className={`text-xs text-[#6B7C8F] leading-relaxed ${isExpanded ? '' : 'line-clamp-2'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
                        {insight.description}
                      </p>
                    </div>

                    {/* Metric */}
                    {insight.metric && (
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <p className="text-lg font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {insight.metric}
                        </p>
                        {insight.metricLabel && (
                          <p className="text-[10px] text-[#6B7C8F]">{insight.metricLabel}</p>
                        )}
                      </div>
                    )}

                    {/* Expand Arrow */}
                    <div className="flex-shrink-0 mt-1">
                      <i className={`ri-arrow-down-s-line text-[#6B7C8F] text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}></i>
                    </div>
                  </div>

                  {/* Expanded Actions */}
                  {isExpanded && (
                    <div className={`px-4 pb-4 pt-0 flex items-center gap-2 border-t ${config.border} mx-4 pt-3`}>
                      {insight.ctaLabel && (
                        <button
                          onClick={(e) => handleCtaClick(e, insight)}
                          className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap"
                        >
                          <i className="ri-arrow-right-line text-sm"></i>
                          {insight.ctaLabel}
                        </button>
                      )}
                      <button
                        onClick={(e) => handleViewDetails(e, insight)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-file-text-line text-sm"></i>
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismiss(insight.id);
                        }}
                        className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-[#6B7C8F] rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-close-line text-sm"></i>
                        Dismiss
                      </button>
                      {insight.metric && (
                        <div className="ml-auto sm:hidden">
                          <p className="text-sm font-bold text-[#0B1F33]">{insight.metric}</p>
                          {insight.metricLabel && (
                            <p className="text-[10px] text-[#6B7C8F]">{insight.metricLabel}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insight Detail Modal */}
      {detailInsight && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDetailInsight(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            style={{ animation: 'fadeScaleIn 0.2s ease-out' }}
          >
            {/* Modal Header */}
            <div className={`p-6 border-b border-gray-100 ${typeConfig[detailInsight.type].bg}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    detailInsight.type === 'opportunity' ? 'bg-amber-100' :
                    detailInsight.type === 'action' ? 'bg-rose-100' :
                    detailInsight.type === 'warning' ? 'bg-orange-100' : 'bg-teal-100'
                  }`}>
                    <i className={`${typeConfig[detailInsight.type].icon} ${typeConfig[detailInsight.type].color} text-3xl`}></i>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${typeConfig[detailInsight.type].badge}`}>
                        {typeConfig[detailInsight.type].label}
                      </span>
                      {detailInsight.priority === 'high' && (
                        <span className="px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-bold uppercase">
                          High Priority
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {detailInsight.title}
                    </h3>
                    <p className="text-xs text-[#6B7C8F] mt-0.5">{detailInsight.timestamp}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDetailInsight(null)}
                  className="w-10 h-10 bg-white/80 rounded-lg flex items-center justify-center hover:bg-white transition-colors cursor-pointer flex-shrink-0"
                >
                  <i className="ri-close-line text-[#0B1F33] text-xl"></i>
                </button>
              </div>

              {/* Metric highlight */}
              {detailInsight.metric && (
                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-white rounded-xl px-5 py-3 shadow-sm border border-gray-100">
                    <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {detailInsight.metric}
                    </p>
                    {detailInsight.metricLabel && (
                      <p className="text-xs text-[#6B7C8F]">{detailInsight.metricLabel}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Summary */}
              {detailInsight.details?.summary && (
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33] mb-2 flex items-center gap-2">
                    <i className="ri-file-text-line text-[#6B7C8F]"></i>
                    Summary
                  </h4>
                  <p className="text-sm text-[#0B1F33] leading-relaxed bg-[#F9F9FB] rounded-xl p-4">
                    {detailInsight.details.summary}
                  </p>
                </div>
              )}

              {/* Related Data */}
              {detailInsight.details?.relatedData && detailInsight.details.relatedData.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
                    <i className="ri-database-2-line text-[#6B7C8F]"></i>
                    Key Data
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {detailInsight.details.relatedData.map((item, idx) => (
                      <div key={idx} className="bg-[#F9F9FB] rounded-xl p-3 border border-gray-100">
                        <p className="text-[10px] text-[#6B7C8F] uppercase tracking-wide font-semibold mb-0.5">{item.label}</p>
                        <p className="text-sm font-semibold text-[#0B1F33]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {detailInsight.details?.recommendations && detailInsight.details.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
                    <i className="ri-sparkling-line text-[#D4B483]"></i>
                    AI Recommendations
                  </h4>
                  <div className="space-y-2">
                    {detailInsight.details.recommendations.map((rec, idx) => (
                      <div key={idx} className="flex items-start gap-3 p-3 bg-gradient-to-r from-[#F9F9FB] to-white rounded-xl border border-gray-100">
                        <div className="w-6 h-6 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-[10px] font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-sm text-[#0B1F33] leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Impact */}
              {detailInsight.details?.impact && (
                <div className={`rounded-xl p-4 border ${
                  detailInsight.type === 'opportunity' ? 'bg-amber-50 border-amber-200' :
                  detailInsight.type === 'action' ? 'bg-rose-50 border-rose-200' :
                  detailInsight.type === 'warning' ? 'bg-orange-50 border-orange-200' : 'bg-teal-50 border-teal-200'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      detailInsight.type === 'opportunity' ? 'bg-amber-100' :
                      detailInsight.type === 'action' ? 'bg-rose-100' :
                      detailInsight.type === 'warning' ? 'bg-orange-100' : 'bg-teal-100'
                    }`}>
                      <i className={`ri-flashlight-line ${typeConfig[detailInsight.type].color}`}></i>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#0B1F33] mb-1 uppercase tracking-wide">Projected Impact</p>
                      <p className="text-sm text-[#0B1F33] leading-relaxed">{detailInsight.details.impact}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-100 flex gap-3 bg-[#F9F9FB] rounded-b-2xl">
              {detailInsight.ctaLabel && detailInsight.ctaAction && onNavigate && (
                <button
                  onClick={() => {
                    setDetailInsight(null);
                    onNavigate(detailInsight.ctaAction!);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-arrow-right-line"></i>
                  {detailInsight.ctaLabel}
                </button>
              )}
              <button
                onClick={(_e) => {
                  const id = detailInsight.id;
                  setDetailInsight(null);
                  dismiss(id);
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-white transition-colors cursor-pointer whitespace-nowrap"
              >
                <i className="ri-close-line"></i>
                Dismiss
              </button>
              <button
                onClick={() => setDetailInsight(null)}
                className={`${detailInsight.ctaLabel ? '' : 'flex-1'} px-5 py-3 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-white transition-colors cursor-pointer whitespace-nowrap`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeScaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
