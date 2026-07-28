
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';

type Platform = 'instagram' | 'facebook' | 'linkedin' | 'nextdoor' | 'tiktok';
type ContentType = 'before-after' | 'completed-job' | 'tip' | 'testimonial' | 'milestone' | 'seasonal';
type ContentStatus = 'ready' | 'scheduled' | 'posted' | 'draft';

interface CompanyJob {
  id: string;
  title: string;
  client: string;
  completedDate: string;
  category: string;
  rating: number;
  review?: string;
  photos: string[];
}

interface ContentSuggestion {
  id: string;
  type: ContentType;
  sourceJobId: string;
  sourceJobTitle: string;
  platform: Platform;
  caption: string;
  hashtags: string[];
  imageUrl: string;
  secondaryImageUrl?: string;
  status: ContentStatus;
  scheduledDate?: string;
  engagementTip: string;
  bestTimeToPost: string;
  createdAt: string;
}

const platformConfig: Record<
  Platform,
  { label: string; icon: string; color: string; bg: string; charLimit: number }
> = {
  instagram: {
    label: 'Instagram',
    icon: 'ri-instagram-line',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    charLimit: 2200,
  },
  facebook: {
    label: 'Facebook',
    icon: 'ri-facebook-fill',
    color: 'text-[#1877F2]',
    bg: 'bg-blue-50',
    charLimit: 5000,
  },
  linkedin: {
    label: 'LinkedIn',
    icon: 'ri-linkedin-fill',
    color: 'text-[#0A66C2]',
    bg: 'bg-blue-50',
    charLimit: 3000,
  },
  nextdoor: {
    label: 'Nextdoor',
    icon: 'ri-home-heart-line',
    color: 'text-green-700',
    bg: 'bg-green-50',
    charLimit: 2000,
  },
  tiktok: {
    label: 'TikTok',
    icon: 'ri-tiktok-line',
    color: 'text-gray-900',
    bg: 'bg-gray-50',
    charLimit: 2200,
  },
};

const contentTypeConfig: Record<
  ContentType,
  { label: string; icon: string; color: string; bg: string }
> = {
  'before-after': {
    label: 'Before & After',
    icon: 'ri-contrast-2-line',
    color: 'text-teal-700',
    bg: 'bg-teal-50',
  },
  'completed-job': {
    label: 'Completed Job',
    icon: 'ri-check-double-line',
    color: 'text-green-700',
    bg: 'bg-green-50',
  },
  tip: {
    label: 'Pro Tip',
    icon: 'ri-lightbulb-line',
    color: 'text-amber-700',
    bg: 'bg-amber-50',
  },
  testimonial: {
    label: 'Client Review',
    icon: 'ri-chat-quote-line',
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
  },
  milestone: {
    label: 'Milestone',
    icon: 'ri-trophy-line',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
  },
  seasonal: {
    label: 'Seasonal',
    icon: 'ri-sun-line',
    color: 'text-orange-700',
    bg: 'bg-orange-50',
  },
};

function generateCaptionForJob(
  job: CompanyJob,
  type: ContentType,
  _platform: Platform
): string {
  const companyName = 'Our Team';
  if (type === 'before-after') {
    return `Swipe to see the transformation! ✨

This ${job.title.toLowerCase()} project went from outdated to absolutely stunning.

${job.review ? `The homeowner said: "${job.review}"` : 'Another happy client!'}

Ready to transform your space? DM us or visit our website for a free estimate!

${companyName}`;
  }
  if (type === 'completed-job') {
    return `Another project wrapped up! ✅

We just completed this ${job.title.toLowerCase()}.

From start to finish, our team focused on quality craftsmanship and clear communication. The result speaks for itself.

Looking for a contractor you can trust? Let's talk about your next project.

${companyName}`;
  }
  if (type === 'testimonial') {
    if (job.review) {
      return `Nothing makes our day like hearing from happy clients! ⭐

"${job.review}" — ${job.client}

This was from our recent ${job.title.toLowerCase()} project. We take pride in every job, big or small.

Thank you, ${job.client.split(' ')[0]}, for trusting us with your home!

${companyName}`;
    }
    return `We love what we do! ⭐

Our recent ${job.title.toLowerCase()} project for ${job.client} turned out amazing. We take pride in every job, big or small.

${companyName}`;
  }
  if (type === 'tip') {
    return `Pro Tip: Planning a home project? 💡

Here are 3 things we always tell our clients:

1️⃣ Set aside 10-15% of your budget for unexpected discoveries
2️⃣ Choose materials before demolition day — lead times can surprise you
3️⃣ Live in your space for a week and note every frustration before designing

We learned these lessons across hundreds of projects like this ${job.title.toLowerCase()} we recently completed.

${companyName}`;
  }
  if (type === 'milestone') {
    return `🎉 Milestone Alert!

This ${job.title.toLowerCase()} is one we're especially proud of.

Thank you to every client who has trusted us with their home. Here's to many more transformations!

${companyName}`;
  }
  return `🌱 Spring is the perfect time for home improvements!

Whether it's a ${job.title.toLowerCase()} or a simple refresh, now is the time to plan.

Book your free consultation today and let's make your vision a reality.

${companyName}`;
}

function generateHashtags(
  job: CompanyJob,
  type: ContentType,
  platform: Platform
): string[] {
  const base = ['#HomeImprovement', '#Contractor'];
  const categoryTags: Record<string, string[]> = {
    Remodeling: ['#HomeRemodel', '#Renovation', '#InteriorDesign', '#BeforeAndAfter'],
    Outdoor: ['#OutdoorLiving', '#BackyardGoals', '#DeckLife', '#PatioDesign'],
    Conversion: ['#GarageConversion', '#HomeOffice', '#ADU', '#SpaceTransformation'],
    Plumbing: ['#Plumbing', '#PlumbingRepair', '#HomeRepair'],
    Electrical: ['#Electrical', '#ElectricalWork', '#HomeWiring'],
    HVAC: ['#HVAC', '#HeatingAndCooling', '#HomeComfort'],
    Roofing: ['#Roofing', '#NewRoof', '#RoofRepair'],
    Painting: ['#Painting', '#InteriorPainting', '#ExteriorPainting'],
    Landscaping: ['#Landscaping', '#YardGoals', '#OutdoorDesign'],
  };
  const typeTags: Record<string, string[]> = {
    'before-after': ['#TransformationTuesday', '#BeforeAndAfter', '#Makeover'],
    'completed-job': ['#ProjectComplete', '#QualityCraftsmanship', '#NewBuild'],
    tip: ['#ProTip', '#HomeownerTips', '#DIYorHireAPro'],
    testimonial: ['#ClientLove', '#FiveStarReview', '#HappyHomeowner'],
    milestone: ['#MilestoneAchieved', '#GrowingBusiness', '#Grateful'],
    seasonal: ['#SpringProjects', '#HomeRefresh', '#SeasonalMaintenance'],
  };
  const jobSpecific = job.title.replace(/\s+/g, '');
  const all = [
    ...base,
    ...(categoryTags[job.category] || []),
    ...(typeTags[type] || []),
    `#${jobSpecific}`,
  ];
  if (platform === 'linkedin') return all.slice(0, 5);
  if (platform === 'tiktok') return all.slice(0, 6);
  return all.slice(0, 10);
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  const diffMonths = Math.floor(diffDays / 30);
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

export default function SocialContentHub() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [companyJobs, setCompanyJobs] = useState<CompanyJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | ContentType>('all');
  const [activePlatformFilter, setActivePlatformFilter] = useState<
    'all' | Platform
  >('all');
  const [selectedSuggestion, setSelectedSuggestion] = useState<
    ContentSuggestion | null
  >(null);
  const [editingCaption, setEditingCaption] = useState(false);
  const [editCaptionText, setEditCaptionText] = useState('');
  const [editingHashtags, setEditingHashtags] = useState(false);
  const [editHashtagText, setEditHashtagText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info';
  } | null>(null);
  const [generating, setGenerating] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [genJob, setGenJob] = useState<string>('');
  const [genType, setGenType] = useState<ContentType>('before-after');
  const [genPlatform, setGenPlatform] = useState<Platform>('instagram');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('10:00');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  // Fetch completed jobs for this contractor
  const fetchCompanyJobs = useCallback(async () => {
    if (!user) return;
    const { data: workItems } = await supabase
      .from('work_items')
      .select(`
        id,
        job_id,
        title,
        trade,
        status,
        agreed_price,
        start_date,
        end_date,
        jobs!inner (
          id,
          title,
          category,
          status,
          photos,
          created_at
        )
      `)
      .eq('contractor_id', user.id)
      .eq('status', 'completed');

    if (!workItems || workItems.length === 0) {
      setCompanyJobs([]);
      return;
    }

    // Get unique job ids for reviews lookup
    const jobIds = Array.from(new Set(workItems.map((wi: any) => wi.job_id)));

    // Fetch contractor profile for reviews
    const { data: contractorProfile } = await supabase
      .from('contractor_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let reviewsMap: Record<string, { rating: number; comment: string; reviewerName: string }> = {};
    if (contractorProfile) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          job_id,
          rating,
          comment,
          reviewer_id,
          profiles!reviews_reviewer_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('contractor_profile_id', contractorProfile.id)
        .in('job_id', jobIds);

      if (reviews) {
        reviews.forEach((r: any) => {
          const profile = r.profiles;
          reviewsMap[r.job_id] = {
            rating: r.rating,
            comment: r.comment,
            reviewerName: profile ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() : 'Client',
          };
        });
      }
    }

    // Get job user ids for client names
    const { data: jobsWithUsers } = await supabase
      .from('jobs')
      .select('id, user_id')
      .in('id', jobIds);

    let clientNamesMap: Record<string, string> = {};
    if (jobsWithUsers) {
      const userIds = Array.from(new Set(jobsWithUsers.map((j: any) => j.user_id)));
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (profiles) {
        const profileMap: Record<string, string> = {};
        profiles.forEach((p: any) => {
          profileMap[p.id] = `${p.first_name || ''} ${p.last_name || ''}`.trim() || 'Client';
        });
        jobsWithUsers.forEach((j: any) => {
          clientNamesMap[j.id] = profileMap[j.user_id] || 'Client';
        });
      }
    }

    const jobs: CompanyJob[] = workItems.map((wi: any) => {
      const job = wi.jobs as any;
      const review = reviewsMap[wi.job_id];
      const photos = Array.isArray(job.photos) ? job.photos : [];
      return {
        id: wi.job_id,
        title: job.title || wi.title,
        client: clientNamesMap[wi.job_id] || 'Client',
        completedDate: wi.end_date
          ? new Date(wi.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '',
        category: job.category || wi.trade || '',
        rating: review?.rating || 0,
        review: review?.comment,
        photos,
      };
    });

    // Deduplicate by job_id (multiple work_items can reference same job)
    const seen = new Set<string>();
    const uniqueJobs = jobs.filter((j) => {
      if (seen.has(j.id)) return false;
      seen.add(j.id);
      return true;
    });

    setCompanyJobs(uniqueJobs);
    if (uniqueJobs.length > 0 && !genJob) {
      setGenJob(uniqueJobs[0].id);
    }
  }, [user, genJob]);

  // Fetch social content from DB
  const fetchContent = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('social_content')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      const mapped: ContentSuggestion[] = data.map((row: any) => ({
        id: row.id,
        type: row.type as ContentType,
        sourceJobId: row.job_id || '',
        sourceJobTitle: row.source_job_title || '',
        platform: row.platform as Platform,
        caption: row.caption || '',
        hashtags: Array.isArray(row.hashtags) ? row.hashtags : [],
        imageUrl: row.image_url || '',
        secondaryImageUrl: row.secondary_image_url || undefined,
        status: row.status as ContentStatus,
        scheduledDate: row.scheduled_date
          ? new Date(row.scheduled_date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })
          : undefined,
        engagementTip: row.engagement_tip || '',
        bestTimeToPost: row.best_time_to_post || '',
        createdAt: row.created_at,
      }));
      setSuggestions(mapped);
    }
  }, [user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCompanyJobs(), fetchContent()]);
      setLoading(false);
    };
    loadData();
  }, [fetchCompanyJobs, fetchContent]);

  const showToast = (
    message: string,
    type: 'success' | 'info' = 'success'
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showToast('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSuggestions = suggestions
    .filter((s) => activeFilter === 'all' || s.type === activeFilter)
    .filter(
      (s) => activePlatformFilter === 'all' || s.platform === activePlatformFilter
    );

  const handleGenerateNew = async () => {
    if (!user) return;
    const job = companyJobs.find((j) => j.id === genJob);
    if (!job) return;

    setGenerating(true);

    const caption = generateCaptionForJob(job, genType, genPlatform);
    const hashtags = generateHashtags(job, genType, genPlatform);
    const imageUrl = job.photos.length > 0 ? job.photos[job.photos.length - 1] : '';
    const secondaryImageUrl = genType === 'before-after' && job.photos.length > 1 ? job.photos[0] : null;

    const engagementTips = [
      'Fresh content performs best — post within 24 hours of generation!',
      'Posts with before & after photos get 3x more engagement',
      'Ask a question in your caption to boost comments',
      'Tag your location for local visibility',
      'Use carousel posts for higher reach on Instagram',
      'Share client testimonials to build trust with new followers',
    ];
    const bestTimes = ['Tue 10:00 AM', 'Wed 12:00 PM', 'Thu 9:00 AM', 'Fri 11:00 AM', 'Sat 10:00 AM'];

    const engagementTip = engagementTips[Math.floor(Math.random() * engagementTips.length)];
    const bestTimeToPost = bestTimes[Math.floor(Math.random() * bestTimes.length)];

    const { data, error } = await supabase
      .from('social_content')
      .insert({
        user_id: user.id,
        job_id: job.id,
        source_job_title: job.title,
        type: genType,
        platform: genPlatform,
        caption,
        hashtags,
        image_url: imageUrl,
        secondary_image_url: secondaryImageUrl,
        status: 'ready',
        engagement_tip: engagementTip,
        best_time_to_post: bestTimeToPost,
      })
      .select()
      .single();

    if (error) {
      console.error('Error generating content:', error);
      showToast('Failed to generate content', 'info');
      setGenerating(false);
      return;
    }

    if (data) {
      const newSuggestion: ContentSuggestion = {
        id: data.id,
        type: data.type as ContentType,
        sourceJobId: data.job_id || '',
        sourceJobTitle: data.source_job_title || '',
        platform: data.platform as Platform,
        caption: data.caption || '',
        hashtags: Array.isArray(data.hashtags) ? data.hashtags : [],
        imageUrl: data.image_url || '',
        secondaryImageUrl: data.secondary_image_url || undefined,
        status: data.status as ContentStatus,
        scheduledDate: undefined,
        engagementTip: data.engagement_tip || '',
        bestTimeToPost: data.best_time_to_post || '',
        createdAt: data.created_at,
      };
      setSuggestions((prev) => [newSuggestion, ...prev]);
    }

    setGenerating(false);
    setShowGenerateModal(false);
    showToast('New content recommendation generated!');
  };

  const handleRegenerateCaption = async (suggestion: ContentSuggestion) => {
    const job = companyJobs.find((j) => j.id === suggestion.sourceJobId);
    if (!job) return;
    const variants: ContentType[] = [
      'before-after',
      'completed-job',
      'testimonial',
      'tip',
    ];
    const altType = variants.find((t) => t !== suggestion.type) || 'completed-job';
    const newCaption = generateCaptionForJob(job, altType, suggestion.platform);

    const { error } = await supabase
      .from('social_content')
      .update({ caption: newCaption, updated_at: new Date().toISOString() })
      .eq('id', suggestion.id);

    if (error) {
      console.error('Error regenerating caption:', error);
      showToast('Failed to regenerate caption', 'info');
      return;
    }

    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === suggestion.id
          ? { ...s, caption: newCaption }
          : s
      )
    );
    if (selectedSuggestion?.id === suggestion.id) {
      setSelectedSuggestion((prev) =>
        prev ? { ...prev, caption: newCaption } : null
      );
    }
    showToast('Caption regenerated!');
  };

  const handleSaveCaption = async (id: string) => {
    const { error } = await supabase
      .from('social_content')
      .update({ caption: editCaptionText, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error saving caption:', error);
      showToast('Failed to save caption', 'info');
      return;
    }

    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, caption: editCaptionText } : s))
    );
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion((prev) =>
        prev ? { ...prev, caption: editCaptionText } : null
      );
    }
    setEditingCaption(false);
    showToast('Caption updated!');
  };

  const handleSaveHashtags = async (id: string) => {
    const tags = editHashtagText
      .split(/[\s,]+/)
      .filter((t) => t.startsWith('#') && t.length > 1);

    const { error } = await supabase
      .from('social_content')
      .update({ hashtags: tags, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error saving hashtags:', error);
      showToast('Failed to save hashtags', 'info');
      return;
    }

    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, hashtags: tags } : s))
    );
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion((prev) =>
        prev ? { ...prev, hashtags: tags } : null
      );
    }
    setEditingHashtags(false);
    showToast('Hashtags updated!');
  };

  const handleSchedule = async (id: string) => {
    if (!scheduleDate) return;
    const scheduledDatetime = new Date(`${scheduleDate}T${scheduleTime}`).toISOString();
    const displayStr = new Date(`${scheduleDate}T${scheduleTime}`).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const { error } = await supabase
      .from('social_content')
      .update({
        status: 'scheduled',
        scheduled_date: scheduledDatetime,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Error scheduling content:', error);
      showToast('Failed to schedule content', 'info');
      return;
    }

    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, status: 'scheduled' as ContentStatus, scheduledDate: displayStr }
          : s
      )
    );
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion((prev) =>
        prev ? { ...prev, status: 'scheduled' as ContentStatus, scheduledDate: displayStr } : null
      );
    }
    setShowScheduleModal(false);
    setScheduleDate('');
    setScheduleTime('10:00');
    showToast(`Scheduled for ${displayStr}`);
  };

  const handleMarkPosted = async (id: string) => {
    const { error } = await supabase
      .from('social_content')
      .update({ status: 'posted', updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error marking as posted:', error);
      showToast('Failed to mark as posted', 'info');
      return;
    }

    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'posted' as ContentStatus } : s))
    );
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion((prev) =>
        prev ? { ...prev, status: 'posted' as ContentStatus } : null
      );
    }
    showToast('Marked as posted!');
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('social_content')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting content:', error);
      showToast('Failed to remove content', 'info');
      return;
    }

    setSuggestions((prev) => prev.filter((s) => s.id !== id));
    if (selectedSuggestion?.id === id) setSelectedSuggestion(null);
    setShowDeleteConfirm(null);
    showToast('Content removed', 'info');
  };

  const handleChangePlatform = async (id: string, platform: Platform) => {
    const suggestion = suggestions.find((s) => s.id === id);
    if (!suggestion) return;
    const job = companyJobs.find((j) => j.id === suggestion.sourceJobId);
    const newHashtags = job
      ? generateHashtags(job, suggestion.type, platform)
      : suggestion.hashtags;

    const { error } = await supabase
      .from('social_content')
      .update({ platform, hashtags: newHashtags, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error changing platform:', error);
      showToast('Failed to change platform', 'info');
      return;
    }

    setSuggestions((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, platform, hashtags: newHashtags } : s
      )
    );
    if (selectedSuggestion?.id === id) {
      setSelectedSuggestion((prev) =>
        prev ? { ...prev, platform, hashtags: newHashtags } : null
      );
    }
    showToast(`Switched to ${platformConfig[platform].label}`);
  };

  const stats = {
    ready: suggestions.filter((s) => s.status === 'ready').length,
    scheduled: suggestions.filter((s) => s.status === 'scheduled').length,
    posted: suggestions.filter((s) => s.status === 'posted').length,
    total: suggestions.length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <i className="ri-loader-4-line animate-spin text-4xl text-[#0B1F33] mb-4 block"></i>
          <p className="text-sm text-[#6B7C8F] font-medium">Loading social content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-6 right-6 z-[100]"
          style={{ animation: 'slideIn 0.3s ease-out' }}
        >
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg border ${
              toast.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-[#0B1F33] border-[#0B1F33] text-white'
            }`}
          >
            <i
              className={`${
                toast.type === 'success'
                  ? 'ri-check-line text-green-600'
                  : 'ri-information-line text-[#D4B483]'
              } text-lg`}
            ></i>
            <span className="text-sm font-semibold">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#0B1F33]">
                Social Content Recommendations
              </h2>
              <p className="text-sm text-[#6B7C8F] mt-1">
                AI-generated content from your completed jobs, photos &amp;
                reviews
              </p>
            </div>
            <button
              onClick={() => setShowGenerateModal(true)}
              disabled={companyJobs.length === 0}
              className="bg-[#0B1F33] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i className="ri-sparkling-line"></i>
              Generate New
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="p-4 border-b border-gray-100 bg-[#F9F9FB]">
          <div className="grid grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-50 rounded-lg flex items-center justify-center">
                <i className="ri-file-list-3-line text-teal-600 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F]">Total Content</p>
                <p className="text-lg font-bold text-[#0B1F33]">
                  {stats.total}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <i className="ri-check-line text-green-600 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F]">Ready to Post</p>
                <p className="text-lg font-bold text-[#0B1F33]">
                  {stats.ready}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-check-line text-amber-600 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F]">Scheduled</p>
                <p className="text-lg font-bold text-[#0B1F33]">
                  {stats.scheduled}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <i className="ri-send-plane-line text-green-600 text-lg"></i>
              </div>
              <div>
                <p className="text-xs text-[#6B7C8F]">Posted</p>
                <p className="text-lg font-bold text-[#0B1F33]">
                  {stats.posted}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-4 border-b border-gray-100 bg-teal-50/50">
          <div className="flex items-start gap-3">
            <i className="ri-sparkling-line text-teal-600 text-xl mt-0.5"></i>
            <div>
              <p className="text-sm text-teal-900 font-semibold mb-1">
                How it works
              </p>
              <p className="text-xs text-teal-800 leading-relaxed">
                We analyze your completed jobs, before &amp; after photos,
                client reviews, and project highlights to automatically
                generate ready-to-post social media content. Copy the text,
                download images, and post to your preferred platforms.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#6B7C8F] mr-1">
                Type:
              </span>
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeFilter === 'all'
                    ? 'bg-[#0B1F33] text-white'
                    : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                }`}
              >
                All
              </button>
              {(Object.keys(contentTypeConfig) as ContentType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setActiveFilter(type)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                    activeFilter === type
                      ? `${contentTypeConfig[type].bg} ${contentTypeConfig[type].color}`
                      : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                  }`}
                >
                  <i className={`${contentTypeConfig[type].icon} text-xs`}></i>
                  {contentTypeConfig[type].label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6B7C8F] mr-1">
                Platform:
              </span>
              <select
                value={activePlatformFilter}
                onChange={(e) =>
                  setActivePlatformFilter(e.target.value as 'all' | Platform)
                }
                className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 text-[#0B1F33] font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="all">All Platforms</option>
                {(Object.keys(platformConfig) as Platform[]).map((p) => (
                  <option key={p} value={p}>
                    {platformConfig[p].label}
                  </option>
                ))}
              </select>
              <div className="flex bg-[#F9F9FB] rounded-lg p-0.5 ml-2">
                <button
                  onClick={() => setViewMode('list')}
                  className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all ${
                    viewMode === 'list'
                      ? 'bg-white shadow-sm text-[#0B1F33]'
                      : 'text-[#6B7C8F]'
                  }`}
                >
                  <i className="ri-list-check text-sm"></i>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white shadow-sm text-[#0B1F33]'
                      : 'text-[#6B7C8F]'
                  }`}
                >
                  <i className="ri-grid-line text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-6">
          {filteredSuggestions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#F9F9FB] rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="ri-file-list-3-line text-[#6B7C8F] text-3xl"></i>
              </div>
              <p className="font-semibold text-[#0B1F33] mb-1">
                {suggestions.length === 0
                  ? 'No content yet'
                  : 'No content matches your filters'}
              </p>
              <p className="text-sm text-[#6B7C8F]">
                {suggestions.length === 0
                  ? 'Generate your first social content from a completed job'
                  : 'Try adjusting your filters or generate new content'}
              </p>
              {suggestions.length === 0 && companyJobs.length > 0 && (
                <button
                  onClick={() => setShowGenerateModal(true)}
                  className="mt-4 bg-[#0B1F33] text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <i className="ri-sparkling-line"></i>
                  Generate Content
                </button>
              )}
              {suggestions.length === 0 && companyJobs.length === 0 && (
                <p className="text-xs text-[#6B7C8F] mt-2">
                  Complete some jobs first to generate social content from them.
                </p>
              )}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSuggestions.map((suggestion) => (
                <GridCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSelect={() => setSelectedSuggestion(suggestion)}
                  onCopy={(text, id) => copyToClipboard(text, id)}
                  copiedId={copiedId}
                  onMarkPosted={() => handleMarkPosted(suggestion.id)}
                  onDelete={() => setShowDeleteConfirm(suggestion.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              {filteredSuggestions.map((suggestion) => (
                <ListCard
                  key={suggestion.id}
                  suggestion={suggestion}
                  onSelect={() => setSelectedSuggestion(suggestion)}
                  onCopy={(text, id) => copyToClipboard(text, id)}
                  copiedId={copiedId}
                  onMarkPosted={() => handleMarkPosted(suggestion.id)}
                  onDelete={() => setShowDeleteConfirm(suggestion.id)}
                  onRegenerate={() => handleRegenerateCaption(suggestion)}
                  onSchedule={() => {
                    setSelectedSuggestion(suggestion);
                    setShowScheduleModal(true);
                  }}
                  onChangePlatform={(p) =>
                    handleChangePlatform(suggestion.id, p)
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSuggestion && !showScheduleModal && !showGenerateModal && (
        <DetailModal
          suggestion={selectedSuggestion}
          onClose={() => {
            setSelectedSuggestion(null);
            setEditingCaption(false);
            setEditingHashtags(false);
          }}
          onCopy={(text, id) => copyToClipboard(text, id)}
          copiedId={copiedId}
          editingCaption={editingCaption}
          editCaptionText={editCaptionText}
          onStartEditCaption={() => {
            setEditingCaption(true);
            setEditCaptionText(selectedSuggestion.caption);
          }}
          onCancelEditCaption={() => setEditingCaption(false)}
          onSaveCaption={() => handleSaveCaption(selectedSuggestion.id)}
          onEditCaptionChange={setEditCaptionText}
          editingHashtags={editingHashtags}
          editHashtagText={editHashtagText}
          onStartEditHashtags={() => {
            setEditingHashtags(true);
            setEditHashtagText(selectedSuggestion.hashtags.join(' '));
          }}
          onCancelEditHashtags={() => setEditingHashtags(false)}
          onSaveHashtags={() => handleSaveHashtags(selectedSuggestion.id)}
          onEditHashtagChange={setEditHashtagText}
          onRegenerate={() => handleRegenerateCaption(selectedSuggestion)}
          onSchedule={() => setShowScheduleModal(true)}
          onMarkPosted={() => handleMarkPosted(selectedSuggestion.id)}
          onDelete={() => setShowDeleteConfirm(selectedSuggestion.id)}
          onChangePlatform={(p) => handleChangePlatform(selectedSuggestion.id, p)}
        />
      )}

      {/* Schedule Modal */}
      {showScheduleModal && selectedSuggestion && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowScheduleModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0B1F33]">
                  Schedule Post
                </h3>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 p-3 bg-[#F9F9FB] rounded-lg">
                <i
                  className={`${platformConfig[selectedSuggestion.platform].icon} ${platformConfig[selectedSuggestion.platform].color} text-xl`}
                ></i>
                <div>
                  <p className="text-sm font-semibold text-[#0B1F33]">
                    {selectedSuggestion.sourceJobTitle}
                  </p>
                  <p className="text-xs text-[#6B7C8F]">
                    {contentTypeConfig[selectedSuggestion.type].label} •{' '}
                    {platformConfig[selectedSuggestion.platform].label}
                  </p>
                </div>
              </div>
              <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 flex items-start gap-2">
                <i className="ri-time-line text-teal-600 mt-0.5"></i>
                <p className="text-xs text-teal-800">
                  <strong>Best time to post:</strong>{' '}
                  {selectedSuggestion.bestTimeToPost}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1.5 block">
                  DATE
                </label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-1.5 block">
                  TIME
                </label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowScheduleModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSchedule(selectedSuggestion.id)}
                disabled={!scheduleDate}
                className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <i className="ri-calendar-check-line"></i>
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Modal */}
      {showGenerateModal && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4"
          onClick={() => !generating && setShowGenerateModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-[#0B1F33]">
                  Generate New Content
                </h3>
                <button
                  onClick={() => !generating && setShowGenerateModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
                >
                  <i className="ri-close-line text-xl text-gray-500"></i>
                </button>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-2 block">
                  SELECT COMPLETED JOB
                </label>
                {companyJobs.length === 0 ? (
                  <div className="p-4 bg-[#F9F9FB] rounded-lg text-center">
                    <p className="text-sm text-[#6B7C8F]">No completed jobs found.</p>
                    <p className="text-xs text-[#6B7C8F] mt-1">Complete some jobs first to generate social content.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {companyJobs.map((job) => (
                      <button
                        key={job.id}
                        onClick={() => setGenJob(job.id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all cursor-pointer ${
                          genJob === job.id
                            ? 'border-teal-500 bg-teal-50/50'
                            : 'border-gray-100 hover:border-gray-200'
                        }`}
                      >
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                          {job.photos.length > 0 ? (
                            <img
                              src={job.photos[job.photos.length - 1]}
                              alt={job.title}
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <i className="ri-image-line text-gray-400 text-xl"></i>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0B1F33] truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-[#6B7C8F]">
                            {job.client} • {job.completedDate}
                          </p>
                        </div>
                        {job.rating > 0 && (
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <i
                                key={s}
                                className={`ri-star-fill text-xs ${
                                  s <= job.rating
                                    ? 'text-yellow-500'
                                    : 'text-gray-200'
                                }`}
                              ></i>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-2 block">
                  CONTENT TYPE
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.keys(contentTypeConfig) as ContentType[]).map(
                    (type) => (
                      <button
                        key={type}
                        onClick={() => setGenType(type)}
                        className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer ${
                          genType === type
                            ? `${contentTypeConfig[type].bg} ${contentTypeConfig[type].color} border-current`
                            : 'border-gray-100 text-[#6B7C8F] hover:border-gray-200'
                        }`}
                      >
                        <i className={`${contentTypeConfig[type].icon} text-lg`}></i>
                        {contentTypeConfig[type].label}
                      </button>
                    )
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#6B7C8F] mb-2 block">
                  TARGET PLATFORM
                </label>
                <div className="flex gap-2 flex-wrap">
                  {(Object.keys(platformConfig) as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setGenPlatform(p)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        genPlatform === p
                          ? `${platformConfig[p].bg} ${platformConfig[p].color} border-current`
                          : 'border-gray-100 text-[#6B7C8F] hover:border-gray-200'
                      }`}
                    >
                      <i className={`${platformConfig[p].icon}`}></i>
                      {platformConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowGenerateModal(false)}
                disabled={generating}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateNew}
                disabled={generating || companyJobs.length === 0}
                className="flex-1 px-4 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {generating ? (
                  <>
                    <i className="ri-loader-4-line animate-spin"></i>{' '}
                    Generating...
                  </>
                ) : (
                  <>
                    <i className="ri-sparkling-line"></i> Generate Content
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm !== null && (
        <div
          className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4"
          onClick={() => setShowDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-5">
              <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <i className="ri-delete-bin-line text-red-500 text-2xl"></i>
              </div>
              <h3 className="text-lg font-bold text-[#0B1F33] mb-1">
                Remove Content?
              </h3>
              <p className="text-sm text-[#6B7C8F]">
                This content recommendation will be permanently removed.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 cursor-pointer whitespace-nowrap"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-semibold text-sm hover:bg-red-600 cursor-pointer whitespace-nowrap"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}

/* ============================================================
   LIST CARD
   ============================================================ */
function ListCard({
  suggestion,
  onSelect,
  onCopy,
  copiedId,
  onMarkPosted,
  onDelete,
  onRegenerate,
  onSchedule,
  onChangePlatform,
}: {
  suggestion: ContentSuggestion;
  onSelect: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onMarkPosted: () => void;
  onDelete: () => void;
  onRegenerate: () => void;
  onSchedule: () => void;
  onChangePlatform: (p: Platform) => void;
}) {
  const [showPlatformPicker, setShowPlatformPicker] = useState(false);
  const typeConf = contentTypeConfig[suggestion.type];
  const platConf = platformConfig[suggestion.platform];

  return (
    <div className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all">
      <div className="grid md:grid-cols-[280px_1fr] gap-0">
        {/* Image */}
        <div className="relative bg-gray-100 cursor-pointer" onClick={onSelect}>
          <div className="w-full h-64 md:h-full">
            {suggestion.imageUrl ? (
              <img
                src={suggestion.imageUrl}
                alt={suggestion.sourceJobTitle}
                className="w-full h-full object-cover object-top"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <i className="ri-image-line text-gray-400 text-4xl"></i>
              </div>
            )}
          </div>
          {suggestion.secondaryImageUrl && (
            <div className="absolute bottom-3 left-3 w-16 h-16 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <img
                src={suggestion.secondaryImageUrl}
                alt="Before"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">BEFORE</span>
              </div>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <span
              className={`px-2 py-1 rounded-md text-[10px] font-bold ${typeConf.bg} ${typeConf.color} flex items-center gap-1`}
            >
              <i className={`${typeConf.icon} text-xs`}></i>
              {typeConf.label}
            </span>
          </div>
          <div className="absolute top-3 right-3">
            <span
              className={`px-2 py-1 rounded-md text-[10px] font-bold ${
                suggestion.status === 'ready'
                  ? 'bg-green-100 text-green-700'
                  : suggestion.status === 'scheduled'
                  ? 'bg-amber-100 text-amber-700'
                  : suggestion.status === 'posted'
                  ? 'bg-teal-100 text-teal-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {suggestion.status === 'ready'
                ? 'Ready'
                : suggestion.status === 'scheduled'
                ? 'Scheduled'
                : suggestion.status === 'posted'
                ? 'Posted'
                : 'Draft'}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-bold text-[#0B1F33] text-sm mb-1">
                {suggestion.sourceJobTitle}
              </h3>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowPlatformPicker(!showPlatformPicker)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold ${platConf.bg} ${platConf.color} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    <i className={`${platConf.icon} text-sm`}></i>
                    {platConf.label}
                    <i className="ri-arrow-down-s-line text-xs"></i>
                  </button>
                  {showPlatformPicker && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPlatformPicker(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 w-36">
                        {(Object.keys(platformConfig) as Platform[]).map((p) => (
                          <button
                            key={p}
                            onClick={() => {
                              onChangePlatform(p);
                              setShowPlatformPicker(false);
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-gray-50 cursor-pointer ${
                              suggestion.platform === p
                                ? 'bg-gray-50 text-[#0B1F33]'
                                : 'text-[#6B7C8F]'
                            }`}
                          >
                            <i className={`${platformConfig[p].icon} ${platformConfig[p].color}`}></i>
                            {platformConfig[p].label}
                            {suggestion.platform === p && (
                              <i className="ri-check-line text-teal-600 ml-auto"></i>
                            )}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <span className="text-xs text-[#6B7C8F]">
                  Generated {timeAgo(suggestion.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Caption Preview */}
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1.5">
              <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wide">
                Caption
              </p>
              <button
                onClick={() =>
                  onCopy(
                    suggestion.caption + '\n\n' + suggestion.hashtags.join(' '),
                    `full-${suggestion.id}`
                  )
                }
                className="text-xs text-[#0B1F33] font-semibold hover:text-teal-600 cursor-pointer flex items-center gap-1"
              >
                {copiedId === `full-${suggestion.id}` ? (
                  <>
                    <i className="ri-check-line"></i> Copied!
                  </>
                ) : (
                  <>
                    <i className="ri-file-copy-line"></i> Copy All
                  </>
                )}
              </button>
            </div>
            <div
              className="bg-[#F9F9FB] rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
              onClick={onSelect}
            >
              <p className="text-xs text-[#0B1F33] leading-relaxed line-clamp-3">
                {suggestion.caption}
              </p>
            </div>
          </div>

          {/* Hashtags */}
          <div className="mb-3">
            <div className="flex flex-wrap gap-1.5">
              {suggestion.hashtags.slice(0, 6).map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-[#F9F9FB] text-[#6B7C8F] rounded text-[10px] font-medium"
                >
                  {tag}
                </span>
              ))}
              {suggestion.hashtags.length > 6 && (
                <span className="px-2 py-0.5 text-[#6B7C8F] text-[10px] font-medium">
                  +{suggestion.hashtags.length - 6} more
                </span>
              )}
            </div>
          </div>

          {/* Engagement Tip */}
          {suggestion.engagementTip && (
            <div className="mb-4 flex items-start gap-2 p-2 bg-amber-50/50 rounded-lg">
              <i className="ri-lightbulb-line text-amber-500 text-sm mt-0.5"></i>
              <p className="text-[10px] text-amber-800">
                {suggestion.engagementTip}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onCopy(suggestion.caption, `cap-${suggestion.id}`)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] transition-all cursor-pointer whitespace-nowrap"
            >
              {copiedId === `cap-${suggestion.id}` ? (
                <>
                  <i className="ri-check-line"></i> Copied!
                </>
              ) : (
                <>
                  <i className="ri-file-copy-line"></i> Copy Caption
                </>
              )}
            </button>
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-refresh-line"></i> Regenerate
            </button>
            {suggestion.status === 'ready' && (
              <button
                onClick={onSchedule}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-calendar-line"></i> Schedule
              </button>
            )}
            {suggestion.status !== 'posted' && (
              <button
                onClick={onMarkPosted}
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-50 transition-all cursor-pointer whitespace-nowrap"
              >
                <i className="ri-check-double-line"></i> Mark Posted
              </button>
            )}
            <button
              onClick={onSelect}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all cursor-pointer whitespace-nowrap"
            >
              <i className="ri-edit-line"></i> Edit
            </button>
            <button
              onClick={onDelete}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 transition-all cursor-pointer whitespace-nowrap ml-auto"
            >
              <i className="ri-delete-bin-line"></i>
            </button>
          </div>

          {suggestion.status === 'scheduled' && suggestion.scheduledDate && (
            <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
              <i className="ri-calendar-check-line"></i>
              <span className="font-semibold">
                Scheduled: {suggestion.scheduledDate}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   GRID CARD
   ============================================================ */
function GridCard({
  suggestion,
  onSelect,
  onCopy,
  copiedId,
  onMarkPosted: _onMarkPosted,
  onDelete,
}: {
  suggestion: ContentSuggestion;
  onSelect: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  onMarkPosted: () => void;
  onDelete: () => void;
}) {
  const typeConf = contentTypeConfig[suggestion.type];
  const platConf = platformConfig[suggestion.platform];

  return (
    <div className="border-2 border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-all">
      <div className="relative w-full h-48 bg-gray-100 cursor-pointer" onClick={onSelect}>
        {suggestion.imageUrl ? (
          <img
            src={suggestion.imageUrl}
            alt={suggestion.sourceJobTitle}
            className="w-full h-full object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <i className="ri-image-line text-gray-400 text-4xl"></i>
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${typeConf.bg} ${typeConf.color}`}>
            {typeConf.label}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
            suggestion.status === 'ready'
              ? 'bg-green-100 text-green-700'
              : suggestion.status === 'scheduled'
              ? 'bg-amber-100 text-amber-700'
              : 'bg-teal-100 text-teal-700'
          }`}>
            {suggestion.status}
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${platConf.bg} ${platConf.color}`}>
            <i className={`${platConf.icon} text-[10px]`}></i>
            {platConf.label}
          </span>
        </div>
      </div>
      <div className="p-3">
        <p className="text-xs font-bold text-[#0B1F33] mb-1 truncate">
          {suggestion.sourceJobTitle}
        </p>
        <p className="text-[10px] text-[#6B7C8F] line-clamp-2 mb-3 leading-relaxed">
          {suggestion.caption}
        </p>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() =>
              onCopy(
                suggestion.caption + '\n\n' + suggestion.hashtags.join(' '),
                `grid-${suggestion.id}`
              )
            }
            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#0B1F33] text-white rounded-md text-[10px] font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap"
          >
            {copiedId === `grid-${suggestion.id}` ? (
              <>
                <i className="ri-check-line"></i> Copied
              </>
            ) : (
              <>
                <i className="ri-file-copy-line"></i> Copy
              </>
            )}
          </button>
          <button
            onClick={onSelect}
            className="px-2 py-1.5 border border-gray-200 rounded-md text-[10px] font-semibold text-[#0B1F33] hover:bg-gray-50 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-edit-line"></i>
          </button>
          <button
            onClick={onDelete}
            className="px-2 py-1.5 border border-gray-200 rounded-md text-[10px] font-semibold text-red-500 hover:bg-red-50 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   DETAIL MODAL
   ============================================================ */
function DetailModal({
  suggestion,
  onClose,
  onCopy,
  copiedId,
  editingCaption,
  editCaptionText,
  onStartEditCaption,
  onCancelEditCaption,
  onSaveCaption,
  onEditCaptionChange,
  editingHashtags,
  editHashtagText,
  onStartEditHashtags,
  onCancelEditHashtags,
  onSaveHashtags,
  onEditHashtagChange,
  onRegenerate,
  onSchedule,
  onMarkPosted,
  onDelete,
  onChangePlatform,
}: {
  suggestion: ContentSuggestion;
  onClose: () => void;
  onCopy: (text: string, id: string) => void;
  copiedId: string | null;
  editingCaption: boolean;
  editCaptionText: string;
  onStartEditCaption: () => void;
  onCancelEditCaption: () => void;
  onSaveCaption: () => void;
  onEditCaptionChange: (v: string) => void;
  editingHashtags: boolean;
  editHashtagText: string;
  onStartEditHashtags: () => void;
  onCancelEditHashtags: () => void;
  onSaveHashtags: () => void;
  onEditHashtagChange: (v: string) => void;
  onRegenerate: () => void;
  onSchedule: () => void;
  onMarkPosted: () => void;
  onDelete: () => void;
  onChangePlatform: (p: Platform) => void;
}) {
  const typeConf = contentTypeConfig[suggestion.type];
  const platConf = platformConfig[suggestion.platform];

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <span
              className={`px-2.5 py-1 rounded-md text-xs font-bold ${typeConf.bg} ${typeConf.color} flex items-center gap-1`}
            >
              <i className={`${typeConf.icon}`}></i>
              {typeConf.label}
            </span>
            <h3 className="text-lg font-bold text-[#0B1F33]">
              {suggestion.sourceJobTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            <i className="ri-close-line text-xl text-gray-500"></i>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Image Side */}
            <div className="bg-gray-50 p-5">
              <div className="w-full aspect-square rounded-xl overflow-hidden bg-gray-100 mb-3">
                {suggestion.imageUrl ? (
                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.sourceJobTitle}
                    className="w-full h-full object-cover object-top"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <i className="ri-image-line text-gray-400 text-5xl"></i>
                  </div>
                )}
              </div>
              {suggestion.secondaryImageUrl && (
                <div className="flex items-center gap-3">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 border-2 border-white shadow">
                    <img
                      src={suggestion.secondaryImageUrl}
                      alt="Before"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#0B1F33]">
                      Before Photo
                    </p>
                    <p className="text-[10px] text-[#6B7C8F]">
                      Use as carousel or side-by-side
                    </p>
                  </div>
                </div>
              )}
              {suggestion.engagementTip && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-gray-100">
                  <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wide mb-2">
                    Engagement Tip
                  </p>
                  <div className="flex items-start gap-2">
                    <i className="ri-lightbulb-line text-amber-500 mt-0.5"></i>
                    <p className="text-xs text-[#0B1F33] leading-relaxed">
                      {suggestion.engagementTip}
                    </p>
                  </div>
                </div>
              )}
              {suggestion.bestTimeToPost && (
                <div className="mt-3 p-3 bg-white rounded-lg border border-gray-100">
                  <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wide mb-1">
                    Best Time to Post
                  </p>
                  <p className="text-sm font-bold text-[#0B1F33] flex items-center gap-1.5">
                    <i className="ri-time-line text-teal-600"></i>
                    {suggestion.bestTimeToPost}
                  </p>
                </div>
              )}
            </div>

            {/* Content Side */}
            <div className="p-5 space-y-4">
              {/* Platform Selector */}
              <div>
                <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wide mb-2">
                  Platform
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {(Object.keys(platformConfig) as Platform[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => onChangePlatform(p)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                        suggestion.platform === p
                          ? `${platformConfig[p].bg} ${platformConfig[p].color} ring-2 ring-current/20`
                          : 'bg-[#F9F9FB] text-[#6B7C8F] hover:bg-gray-200'
                      }`}
                    >
                      <i className={`${platformConfig[p].icon}`}></i>
                      {platformConfig[p].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Caption */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wide">
                    Caption
                  </p>
                  <div className="flex items-center gap-2">
                    {!editingCaption && (
                      <>
                        <button
                          onClick={onStartEditCaption}
                          className="text-[10px] text-[#0B1F33] font-semibold hover:text-teal-600 cursor-pointer flex items-center gap-0.5"
                        >
                          <i className="ri-edit-line"></i> Edit
                        </button>
                        <button
                          onClick={onRegenerate}
                          className="text-[10px] text-[#0B1F33] font-semibold hover:text-teal-600 cursor-pointer flex items-center gap-0.5"
                        >
                          <i className="ri-refresh-line"></i> Regenerate
                        </button>
                        <button
                          onClick={() =>
                            onCopy(
                              suggestion.caption,
                              `detail-cap-${suggestion.id}`
                            )
                          }
                          className="text-[10px] text-[#0B1F33] font-semibold hover:text-teal-600 cursor-pointer flex items-center gap-0.5"
                        >
                          {copiedId === `detail-cap-${suggestion.id}` ? (
                            <>
                              <i className="ri-check-line"></i> Copied
                            </>
                          ) : (
                            <>
                              <i className="ri-file-copy-line"></i> Copy
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingCaption ? (
                  <div>
                    <textarea
                      value={editCaptionText}
                      onChange={(e) =>
                        onEditCaptionChange(
                          e.target.value.slice(0, platConf.charLimit)
                        )
                      }
                      className="w-full border border-gray-200 rounded-lg p-3 text-xs text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none leading-relaxed"
                      rows={8}
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-[10px] text-[#6B7C8F]">
                        {editCaptionText.length}/{platConf.charLimit}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={onCancelEditCaption}
                          className="text-[10px] text-[#6B7C8F] font-semibold hover:text-[#0B1F33] cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={onSaveCaption}
                          className="text-[10px] text-teal-600 font-bold hover:text-teal-700 cursor-pointer"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#F9F9FB] rounded-lg p-3 max-h-48 overflow-y-auto">
                    <p className="text-xs text-[#0B1F33] leading-relaxed whitespace-pre-line">
                      {suggestion.caption}
                    </p>
                  </div>
                )}
              </div>

              {/* Hashtags */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold text-[#6B7C8F] uppercase tracking-wide">
                    Hashtags
                  </p>
                  <div className="flex items-center gap-2">
                    {!editingHashtags && (
                      <>
                        <button
                          onClick={onStartEditHashtags}
                          className="text-[10px] text-[#0B1F33] font-semibold hover:text-teal-600 cursor-pointer flex items-center gap-0.5"
                        >
                          <i className="ri-edit-line"></i> Edit
                        </button>
                        <button
                          onClick={() =>
                            onCopy(
                              suggestion.hashtags.join(' '),
                              `detail-hash-${suggestion.id}`
                            )
                          }
                          className="text-[10px] text-[#0B1F33] font-semibold hover:text-teal-600 cursor-pointer flex items-center gap-0.5"
                        >
                          {copiedId === `detail-hash-${suggestion.id}` ? (
                            <>
                              <i className="ri-check-line"></i> Copied
                            </>
                          ) : (
                            <>
                              <i className="ri-file-copy-line"></i> Copy
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {editingHashtags ? (
                  <div>
                    <textarea
                      value={editHashtagText}
                      onChange={(e) =>
                        onEditHashtagChange(e.target.value.slice(0, 500))
                      }
                      className="w-full border border-gray-200 rounded-lg p-3 text-xs text-[#0B1F33] focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                      rows={3}
                      placeholder="#hashtag1 #hashtag2 #hashtag3"
                    />
                    <div className="flex items-center justify-end mt-1.5 gap-2">
                      <button
                        onClick={onCancelEditHashtags}
                        className="text-[10px] text-[#6B7C8F] font-semibold hover:text-[#0B1F33] cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onSaveHashtags}
                        className="text-[10px] text-teal-600 font-bold hover:text-teal-700 cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {suggestion.hashtags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-[#F9F9FB] text-[#0B1F33] rounded text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              {suggestion.status === 'scheduled' && suggestion.scheduledDate && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <i className="ri-calendar-check-line text-amber-600"></i>
                  <span className="text-xs font-semibold text-amber-800">
                    Scheduled: {suggestion.scheduledDate}
                  </span>
                </div>
              )}
              {suggestion.status === 'posted' && (
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                  <i className="ri-check-double-line text-green-600"></i>
                  <span className="text-xs font-semibold text-green-800">
                    This content has been posted
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center gap-2 flex-shrink-0 bg-[#F9F9FB]">
          <button
            onClick={() =>
              onCopy(
                suggestion.caption + '\n\n' + suggestion.hashtags.join(' '),
                `modal-all-${suggestion.id}`
              )
            }
            className="flex items-center gap-1.5 px-4 py-2 bg-[#0B1F33] text-white rounded-lg text-xs font-semibold hover:bg-[#1a3a52] cursor-pointer whitespace-nowrap"
          >
            {copiedId === `modal-all-${suggestion.id}` ? (
              <>
                <i className="ri-check-line"></i> Copied!
              </>
            ) : (
              <>
                <i className="ri-file-copy-line"></i> Copy All
              </>
            )}
          </button>
          {suggestion.status === 'ready' && (
            <button
              onClick={onSchedule}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-white cursor-pointer whitespace-nowrap"
            >
              <i className="ri-calendar-line"></i> Schedule
            </button>
          )}
          {suggestion.status !== 'posted' && (
            <button
              onClick={onMarkPosted}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-green-700 rounded-lg text-xs font-semibold hover:bg-green-50 cursor-pointer whitespace-nowrap"
            >
              <i className="ri-check-double-line"></i> Mark Posted
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onDelete}
            className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-50 cursor-pointer whitespace-nowrap"
          >
            <i className="ri-delete-bin-line"></i> Remove
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-[#0B1F33] rounded-lg text-xs font-semibold hover:bg-gray-300 cursor-pointer whitespace-nowrap"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
