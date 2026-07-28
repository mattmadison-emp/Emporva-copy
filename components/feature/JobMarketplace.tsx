
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../contexts/AuthContext";
import QuoteBuilder from "./QuoteBuilder";

type Job = {
  id: string;
  title: string;
  description: string;
  trades: string[];
  urgency: string;
  isNew: boolean;
  location: string;
  budget: string;
  postedDate: string;
  homeownerName: string;
  propertyType: string;
  photos?: string[];
};

type QAThread = {
  jobId: string;
  questionId: string;
  askerName: string;
  askerCompany: string;
  question: string;
  topic: string;
  askedAt: string;
  status: "answered" | "pending";
  answer?: string;
  answeredAt?: string;
};

type Props = {
  qaThreads?: QAThread[];
};

const TOPIC_OPTIONS = [
  { value: "Access", icon: "ri-door-open-line", label: "Access" },
  { value: "Materials", icon: "ri-tools-line", label: "Materials" },
  { value: "Timeline", icon: "ri-calendar-line", label: "Timeline" },
  { value: "Scope", icon: "ri-file-list-3-line", label: "Scope" },
  { value: "Budget", icon: "ri-money-dollar-circle-line", label: "Budget" },
  { value: "Other", icon: "ri-question-line", label: "Other" },
];

function getAISuggestedQuestions(job: Job): { topic: string; question: string }[] {
  const title = job.title.toLowerCase();
  const suggestions: { topic: string; question: string }[] = [];

  if (
    title.includes("plumb") ||
    title.includes("sink") ||
    title.includes("faucet") ||
    title.includes("leak")
  ) {
    suggestions.push(
      {
        topic: "Materials",
        question: "What type of pipes do you currently have — copper, PVC, or PEX?",
      },
      {
        topic: "Access",
        question:
          "Is there easy access to the shut-off valves and the area behind the fixture?",
      },
      {
        topic: "Scope",
        question:
          "Have you noticed any water damage to surrounding cabinets or flooring?",
      }
    );
  } else if (
    title.includes("hvac") ||
    title.includes("heat") ||
    title.includes("furnace") ||
    title.includes("air")
  ) {
    suggestions.push(
      {
        topic: "Timeline",
        question: "When was the system last serviced or inspected?",
      },
      {
        topic: "Materials",
        question: "What is the make and model of your current HVAC unit?",
      },
      {
        topic: "Scope",
        question: "Are there any unusual sounds or smells coming from the unit?",
      }
    );
  } else if (
    title.includes("electric") ||
    title.includes("outlet") ||
    title.includes("panel") ||
    title.includes("wiring")
  ) {
    suggestions.push(
      {
        topic: "Scope",
        question:
          "How many outlets or circuits are affected by this issue?",
      },
      {
        topic: "Materials",
        question:
          "Do you know the age and amperage of your current electrical panel?",
      },
      {
        topic: "Access",
        question:
          "Is the electrical panel easily accessible, and is there clearance around it?",
      }
    );
  } else if (title.includes("fan") || title.includes("install")) {
    suggestions.push(
      {
        topic: "Materials",
        question:
          "Have you already purchased the fixture, or do you need me to source it?",
      },
      {
        topic: "Access",
        question:
          "Is there an existing electrical box at the installation location rated for the weight?",
      },
      {
        topic: "Scope",
        question:
          "Does the current wiring support a fan with a light kit, or is it single-switch only?",
      }
    );
  } else {
    suggestions.push(
      {
        topic: "Scope",
        question:
          "Can you describe the full extent of the issue — is it limited to what's described or are there related problems?",
      },
      {
        topic: "Access",
        question: "Will the work area be clear and accessible when I arrive?",
      },
      {
        topic: "Timeline",
        question:
          "Is there a preferred timeframe or deadline for completing this work?",
      }
    );
  }

  return suggestions;
}

// Format budget_range from DB value to display string
function formatBudgetRange(range: string | null): string {
  switch (range) {
    case 'under-1000': return 'Under $1,000';
    case '1000-5000': return '$1,000 – $5,000';
    case '5000-10000': return '$5,000 – $10,000';
    case '10000-25000': return '$10,000 – $25,000';
    case '25000-plus': return '$25,000+';
    default: return 'Not specified';
  }
}

// Format timeline from DB value to display string
function formatTimeline(timeline: string | null): string {
  switch (timeline) {
    case 'asap': return 'ASAP';
    case 'within-1-week': return 'Within 1 week';
    case 'within-1-month': return 'Within 1 month';
    case 'within-3-months': return 'Within 3 months';
    case 'flexible': return 'Flexible';
    default: return 'Not specified';
  }
}

// Map timeline to urgency level
function timelineToUrgency(timeline: string | null): string {
  switch (timeline) {
    case 'asap': return 'high';
    case 'within-1-week': return 'high';
    case 'within-1-month': return 'medium';
    case 'within-3-months': return 'low';
    case 'flexible': return 'low';
    default: return 'medium';
  }
}

export default function JobMarketplace({
  qaThreads: initialQAThreads = [],
}: Props) {
  const { user } = useAuth();
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [contractorTrades, setContractorTrades] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    trade: "all",
    urgency: "all",
    showNewOnly: false,
  });
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [activeTab, setActiveTab] = useState<"details" | "qa">("details");
  const [showQuoteBuilder, setShowQuoteBuilder] = useState(false);
  const [quoteJobData, setQuoteJobData] = useState<{
    id: string;
    title: string;
    description: string;
    trades?: string[];
    budget?: string;
  } | null>(null);

  // Q&A state
  const [qaThreads, setQaThreads] = useState<QAThread[]>(initialQAThreads);
  const [askingJobId, setAskingJobId] = useState<string | null>(null);
  const [questionText, setQuestionText] = useState("");
  const [questionTopic, setQuestionTopic] = useState("Scope");
  const [isSending, setIsSending] = useState(false);
  const [showAISuggestions, setShowAISuggestions] = useState(true);

  // Fetch contractor trades and matching jobs from Supabase
  useEffect(() => {
    if (!user) return;

    async function fetchData() {
      setLoading(true);

      // 1. Get contractor's trades from contractor_profiles
      const { data: contractorProfile } = await supabase
        .from('contractor_profiles')
        .select('primary_trade, secondary_trades')
        .eq('user_id', user!.id)
        .single();

      const trades: string[] = [];
      if (contractorProfile) {
        if (contractorProfile.primary_trade) {
          trades.push(contractorProfile.primary_trade);
        }
        if (contractorProfile.secondary_trades && Array.isArray(contractorProfile.secondary_trades)) {
          trades.push(...contractorProfile.secondary_trades);
        }
      }
      setContractorTrades(trades);

      // 2. Fetch open jobs – filter by contractor's trades (category matches any of their trades)
      let query = supabase
        .from('jobs')
        .select('*, profiles:user_id(first_name, last_name)')
        .eq('status', 'open')
        .neq('user_id', user!.id) // Don't show contractor's own jobs
        .order('created_at', { ascending: false });

      // If contractor has trades, filter jobs to matching categories
      if (trades.length > 0) {
        query = query.in('category', trades);
      }

      const { data: jobs } = await query;

      if (jobs) {
        const now = new Date();
        const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

        const mapped: Job[] = jobs.map((job: any) => ({
          id: job.id,
          title: job.title,
          description: job.description,
          trades: [job.category],
          urgency: timelineToUrgency(job.timeline),
          isNew: new Date(job.created_at) > twoDaysAgo,
          location: job.location,
          budget: formatBudgetRange(job.budget_range),
          postedDate: job.created_at,
          homeownerName: job.profiles
            ? `${job.profiles.first_name} ${job.profiles.last_name}`
            : 'Homeowner',
          propertyType: formatTimeline(job.timeline),
          photos: job.photos || [],
        }));

        setAllJobs(mapped);
      }

      setLoading(false);
    }

    fetchData();
  }, [user]);

  const filteredJobs = allJobs.filter((job) => {
    if (filters.trade !== "all" && !job.trades.includes(filters.trade))
      return false;
    if (filters.urgency !== "all" && job.urgency !== filters.urgency) return false;
    if (filters.showNewOnly && !job.isNew) return false;
    return true;
  });

  const getMyJobQuestions = (jobId: string) =>
    qaThreads.filter((t) => t.jobId === jobId && t.askerName === "Your Company");

  const getJobAnsweredCount = (jobId: string) =>
    qaThreads.filter(
      (t) => t.jobId === jobId && t.status === "answered" && t.askerName === "Your Company"
    ).length;

  const getMyAnsweredQuestions = (jobId: string) =>
    qaThreads.filter(
      (t) => t.jobId === jobId && t.askerName === "Your Company" && t.status === "answered"
    );

  const handleSubmitQuote = (job: Job) => {
    setQuoteJobData({
      id: job.id,
      title: job.title,
      description: job.description,
      trades: job.trades,
      budget: job.budget,
    });
    setShowQuoteBuilder(true);
    setSelectedJob(null);
  };

  const handleQuoteSubmit = (quote: any) => {
    setShowQuoteBuilder(false);
    setQuoteJobData(null);

    const toast = document.createElement("div");
    toast.textContent =
      quote.status === "draft"
        ? "Quote saved as draft!"
        : "Quote sent to homeowner!";
    toast.className =
      "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-lg z-50";
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  };

  const handleSendQuestion = (jobId: string) => {
    if (!questionText.trim()) return;
    setIsSending(true);

    setTimeout(() => {
      const newThread: QAThread = {
        jobId,
        questionId: `q-${Date.now()}`,
        askerName: "Your Company",
        askerCompany: "Anderson Plumbing",
        question: questionText.trim(),
        topic: questionTopic,
        askedAt: new Date().toISOString(),
        status: "pending",
      };
      setQaThreads((prev) => [...prev, newThread]);
      setQuestionText("");
      setQuestionTopic("Scope");
      setIsSending(false);
      setAskingJobId(null);
      setShowAISuggestions(true);

      const toast = document.createElement("div");
      toast.textContent = "Question sent to homeowner!";
      toast.className =
        "fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-teal-600 text-white px-6 py-3 rounded-lg shadow-lg z-50";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    }, 1200);
  };

  const handleUseSuggestion = (suggestion: { topic: string; question: string }) => {
    setQuestionTopic(suggestion.topic);
    setQuestionText(suggestion.question);
    setShowAISuggestions(false);
  };

  const openAskPanel = (jobId: string, fromModal?: boolean) => {
    setAskingJobId(jobId);
    setQuestionText("");
    setQuestionTopic("Scope");
    setShowAISuggestions(true);
    if (fromModal) {
      setActiveTab("qa");
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high":
        return "bg-red-100 text-red-700 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "low":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Inline Ask Question composer component
  const QuestionComposer = ({
    jobId,
    inline,
  }: {
    jobId: string;
    inline?: boolean;
  }) => {
    const job = allJobs.find((j) => j.id === jobId);
    const suggestions = job ? getAISuggestedQuestions(job) : [];
    const alreadyAsked = getMyJobQuestions(jobId).map((q) => q.question);
    const filteredSuggestions = suggestions.filter(
      (s) => !alreadyAsked.includes(s.question)
    );

    return (
      <div
        className={`${
          inline ? "border border-teal-200 bg-teal-50/50" : "bg-white border border-gray-200"
        } rounded-xl p-5 space-y-4`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center bg-teal-100 rounded-lg">
              <i className="ri-questionnaire-line text-teal-600"></i>
            </div>
            <h4 className="font-bold text-[#0B1F33] text-sm">Ask the Homeowner</h4>
          </div>
          <button
            onClick={() => {
              setAskingJobId(null);
              setQuestionText("");
              setShowAISuggestions(true);
            }}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
          >
            <i className="ri-close-line text-gray-500"></i>
          </button>
        </div>

        {/* AI Suggested Questions */}
        {showAISuggestions && filteredSuggestions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <i className="ri-sparkling-line text-amber-500 text-sm"></i>
              <span className="text-xs font-semibold text-amber-700">
                AI-Suggested Questions
              </span>
            </div>
            <div className="space-y-1.5">
              {filteredSuggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleUseSuggestion(s)}
                  className="w-full text-left flex items-start gap-3 px-3 py-2.5 bg-white border border-amber-200 rounded-lg hover:border-amber-400 hover:bg-amber-50 transition-all cursor-pointer group"
                >
                  <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs rounded font-medium whitespace-nowrap mt-0.5">
                    {s.topic}
                  </span>
                  <span className="text-sm text-gray-700 group-hover:text-gray-900 flex-1">
                    {s.question}
                  </span>
                  <i className="ri-arrow-right-s-line text-gray-400 group-hover:text-teal-600 mt-0.5 flex-shrink-0"></i>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 pt-1">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-xs text-gray-400">or write your own</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
          </div>
        )}

        {/* Topic Selector */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Topic
          </label>
          <div className="flex flex-wrap gap-1.5">
            {TOPIC_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setQuestionTopic(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  questionTopic === opt.value
                    ? "bg-[#0B1F33] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <i className={`${opt.icon} text-xs`}></i>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-2">
            Your Question
          </label>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type your question for the homeowner..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none text-sm"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-1.5">
            <span className="text-xs text-gray-400">
              {questionText.length}/500
            </span>
          </div>
        </div>

        {/* Send Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setAskingJobId(null);
              setQuestionText("");
              setShowAISuggestions(true);
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
          >
            Cancel
          </button>
          <button
            onClick={() => handleSendQuestion(jobId)}
            disabled={!questionText.trim() || isSending}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg font-semibold text-sm transition-all cursor-pointer whitespace-nowrap ml-auto ${
              questionText.trim() && !isSending
                ? "bg-teal-600 text-white hover:bg-teal-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSending ? (
              <>
                <i className="ri-loader-4-line animate-spin"></i>
                Sending...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line"></i>
                Send Question
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[#0B1F33] mb-2">Job Marketplace</h2>
        <p className="text-sm text-[#6B7C8F]">Browse and quote on available jobs in your area</p>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <i className="ri-loader-4-line animate-spin text-4xl text-teal-600 mb-4"></i>
          <p className="text-sm text-[#6B7C8F]">Loading jobs matching your trades...</p>
        </div>
      )}

      {!loading && (
      <>
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-gray-200">
        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          value={filters.trade}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, trade: e.target.value }))
          }
        >
          <option value="all">All Trades</option>
          {contractorTrades.map((trade) => (
            <option key={trade} value={trade}>{trade}</option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
          value={filters.urgency}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, urgency: e.target.value }))
          }
        >
          <option value="all">All Urgencies</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>

        <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={filters.showNewOnly}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                showNewOnly: e.target.checked,
              }))
            }
            className="w-4 h-4 text-teal-600 cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
            New Jobs Only
          </span>
        </label>

        <div className="ml-auto flex items-center gap-2 text-sm text-[#6B7C8F]">
          <i className="ri-filter-3-line"></i>
          <span>{filteredJobs.length} jobs found</span>
        </div>
      </div>

      {/* Job list */}
      <div className="grid gap-4">
        {filteredJobs.map((job) => {
          const myQuestions = getMyJobQuestions(job.id);
          const answeredCount = getJobAnsweredCount(job.id);
          const isAskingThis = askingJobId === job.id && !selectedJob;

          return (
            <div
              key={job.id}
              className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
            >
              {/* Job Photos */}
              {job.photos && job.photos.length > 0 && (
                <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
                  {job.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200"
                    >
                      <img
                        src={photo}
                        alt={`${job.title} - Photo ${index + 1}`}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold text-[#0B1F33]">{job.title}</h3>
                    {job.isNew && (
                      <span className="px-2 py-1 bg-teal-100 text-teal-700 text-xs font-bold rounded-full whitespace-nowrap">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#6B7C8F] mb-3">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {job.trades.map((trade) => (
                      <span
                        key={trade}
                        className="px-3 py-1 bg-[#0B1F33] text-white text-xs font-semibold rounded-full whitespace-nowrap"
                      >
                        {trade}
                      </span>
                    ))}
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getUrgencyColor(
                        job.urgency
                      )}`}
                    >
                      {job.urgency.charAt(0).toUpperCase() + job.urgency.slice(1)} Priority
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-[#6B7C8F]">
                      <i className="ri-map-pin-line"></i>
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7C8F]">
                      <i className="ri-money-dollar-circle-line"></i>
                      <span>{job.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7C8F]">
                      <i className="ri-user-line"></i>
                      <span>{job.homeownerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#6B7C8F]">
                      <i className="ri-home-line"></i>
                      <span>{job.propertyType}</span>
                    </div>
                  </div>

                  {myQuestions.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm">
                        <i className="ri-question-answer-line text-teal-600"></i>
                        <span className="text-[#6B7C8F]">
                          Your Questions:{" "}
                          <strong className="text-[#0B1F33]">{answeredCount}</strong> answered /{" "}
                          <strong className="text-[#0B1F33]">{myQuestions.length}</strong> total
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setActiveTab("details");
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-eye-line"></i>
                  View Details
                </button>
                <button
                  onClick={() => openAskPanel(job.id)}
                  className="flex items-center gap-2 px-4 py-2 text-amber-600 hover:bg-amber-50 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                >
                  <i className="ri-questionnaire-line"></i>
                  Ask Question
                </button>
                {myQuestions.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setActiveTab("qa");
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-lg font-semibold text-sm transition-colors cursor-pointer whitespace-nowrap"
                  >
                    <i className="ri-chat-check-line"></i>
                    View Q&amp;A ({answeredCount})
                  </button>
                )}
                <button
                  onClick={() => handleSubmitQuote(job)}
                  className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap ml-auto"
                >
                  <i className="ri-send-plane-line"></i>
                  Submit Quote
                </button>
              </div>

              {/* Inline Ask Question Panel */}
              {isAskingThis && (
                <div className="mt-4">
                  <QuestionComposer jobId={job.id} inline />
                </div>
              )}
            </div>
          );
        })}
        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <i className="ri-inbox-line text-6xl text-gray-300 mb-4"></i>
            {allJobs.length === 0 ? (
              <>
                <p className="text-lg text-[#6B7C8F] mb-2">No jobs available right now</p>
                <p className="text-sm text-[#6B7C8F]">
                  {contractorTrades.length > 0
                    ? `We'll notify you when new ${contractorTrades.join(', ')} jobs are posted.`
                    : 'Check back soon for new job postings in your area.'}
                </p>
              </>
            ) : (
              <>
                <p className="text-lg text-[#6B7C8F] mb-2">No jobs match your filters</p>
                <p className="text-sm text-[#6B7C8F]">Try adjusting your search criteria</p>
              </>
            )}
          </div>
        )}
      </div>
      </>
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold text-[#0B1F33]">Job Details</h2>
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setAskingJobId(null);
                }}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <i className="ri-close-line text-xl text-gray-600"></i>
              </button>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-4 border-b border-gray-200 flex gap-2">
              <button
                onClick={() => setActiveTab("details")}
                className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === "details"
                    ? "bg-[#0B1F33] text-white"
                    : "text-[#6B7C8F] hover:bg-gray-100"
                }`}
              >
                <i className="ri-file-list-3-line mr-2"></i>
                Job Details
              </button>
              <button
                onClick={() => setActiveTab("qa")}
                className={`px-4 py-2 font-semibold text-sm rounded-t-lg transition-colors cursor-pointer whitespace-nowrap relative ${
                  activeTab === "qa"
                    ? "bg-[#0B1F33] text-white"
                    : "text-[#6B7C8F] hover:bg-gray-100"
                }`}
              >
                <i className="ri-question-answer-line mr-2"></i>
                Q&amp;A
                {getMyJobQuestions(selectedJob.id).length > 0 && (
                  <span
                    className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
                      getJobAnsweredCount(selectedJob.id) > 0
                        ? "bg-green-500 text-white"
                        : "bg-gray-400 text-white"
                    }`}
                  >
                    {getMyJobQuestions(selectedJob.id).length}
                  </span>
                )}
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Job Photos in Detail View */}
                  {selectedJob.photos && selectedJob.photos.length > 0 && (
                    <div>
                      <h4 className="font-bold text-[#0B1F33] mb-3 text-sm">
                        Job Photos
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedJob.photos.map((photo, index) => (
                          <div
                            key={index}
                            className="w-full h-40 rounded-lg overflow-hidden border border-gray-200"
                          >
                            <img
                              src={photo}
                              alt={`${selectedJob.title} - Photo ${index + 1}`}
                              className="w-full h-full object-cover object-top cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(photo, "_blank")}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-[#0B1F33] mb-2">
                          {selectedJob.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedJob.trades.map((trade) => (
                            <span
                              key={trade}
                              className="px-3 py-1 bg-[#0B1F33] text-white text-xs font-semibold rounded-full whitespace-nowrap"
                            >
                              {trade}
                            </span>
                          ))}
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full border whitespace-nowrap ${getUrgencyColor(
                              selectedJob.urgency
                            )}`}
                          >
                            {selectedJob.urgency.charAt(0).toUpperCase() +
                              selectedJob.urgency.slice(1)}{" "}
                            Priority
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-[#0B1F33] mb-2">Description</h4>
                      <p className="text-sm text-[#6B7C8F]">{selectedJob.description}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-map-pin-line text-teal-600"></i>
                          <h4 className="font-bold text-[#0B1F33] text-sm">
                            Location
                          </h4>
                        </div>
                        <p className="text-sm text-[#6B7C8F]">{selectedJob.location}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-money-dollar-circle-line text-teal-600"></i>
                          <h4 className="font-bold text-[#0B1F33] text-sm">
                            Budget Range
                          </h4>
                        </div>
                        <p className="text-sm text-[#6B7C8F]">{selectedJob.budget}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-user-line text-teal-600"></i>
                          <h4 className="font-bold text-[#0B1F33] text-sm">
                            Homeowner
                          </h4>
                        </div>
                        <p className="text-sm text-[#6B7C8F]">{selectedJob.homeownerName}</p>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <i className="ri-home-line text-teal-600"></i>
                          <h4 className="font-bold text-[#0B1F33] text-sm">
                            Property Type
                          </h4>
                        </div>
                        <p className="text-sm text-[#6B7C8F]">{selectedJob.propertyType}</p>
                      </div>
                    </div>

                    {getMyAnsweredQuestions(selectedJob.id).length > 0 && (
                      <div className="mt-6 bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <i className="ri-information-line text-teal-600 text-xl"></i>
                          <div>
                            <h4 className="font-bold text-teal-900 text-sm mb-1">
                              Homeowner Answered Your Questions
                            </h4>
                            <p className="text-xs text-teal-700">
                              Review the responses in the Q&amp;A tab before
                              submitting your quote
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick Ask CTA on Details tab */}
                    {askingJobId !== selectedJob.id && (
                      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <i className="ri-questionnaire-line text-amber-600 text-xl"></i>
                            <div>
                              <h4 className="font-bold text-amber-900 text-sm mb-0.5">
                                Have questions before quoting?
                              </h4>
                              <p className="text-xs text-amber-700">
                                Ask the homeowner for clarification — AI will
                                suggest relevant questions
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => openAskPanel(selectedJob.id, true)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg font-semibold text-sm hover:bg-amber-700 transition-colors cursor-pointer whitespace-nowrap"
                          >
                            <i className="ri-questionnaire-line"></i>
                            Ask Question
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "qa" && (
                <div className="space-y-4">
                  {/* Ask Question Composer in Modal */}
                  {askingJobId === selectedJob.id ? (
                    <QuestionComposer jobId={selectedJob.id} />
                  ) : (
                    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <i className="ri-questionnaire-line text-teal-600 text-lg"></i>
                        <span className="text-sm font-semibold text-[#0B1F33]">
                          Need more info from the homeowner?
                        </span>
                      </div>
                      <button
                        onClick={() => openAskPanel(selectedJob.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap"
                      >
                        <i className="ri-add-line"></i>
                        Ask a Question
                      </button>
                    </div>
                  )}

                  {getMyJobQuestions(selectedJob.id).length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <i className="ri-lightbulb-line text-blue-600 text-xl"></i>
                        <div>
                          <h4 className="font-bold text-blue-900 text-sm mb-1">
                            Your Questions &amp; Homeowner Responses
                          </h4>
                          <p className="text-xs text-blue-700">
                            Review the homeowner&apos;s answers to create a
                            more accurate quote
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {getMyJobQuestions(selectedJob.id).map((thread) => (
                    <div
                      key={thread.questionId}
                      className={`border rounded-lg p-4 ${
                        thread.status === "answered"
                          ? "border-green-200 bg-green-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-8 h-8 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="ri-user-line text-white text-sm"></i>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-[#0B1F33] text-sm">
                              You
                            </span>
                            <span className="text-xs text-[#6B7C8F]">
                              ({thread.askerCompany})
                            </span>
                            <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full whitespace-nowrap">
                              {thread.topic}
                            </span>
                          </div>
                          <p className="text-sm text-[#0B1F33]">{thread.question}</p>
                          <p className="text-xs text-[#6B7C8F] mt-1">
                            {new Date(thread.askedAt).toLocaleDateString()} at{" "}
                            {new Date(thread.askedAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>

                      {thread.status === "answered" && thread.answer && (
                        <div className="ml-11 pl-4 border-l-2 border-green-400">
                          <div className="bg-white rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-2">
                              <i className="ri-chat-check-line text-green-600"></i>
                              <span className="font-bold text-green-900 text-sm">
                                Homeowner Response
                              </span>
                              <span className="ml-auto text-xs text-green-700">
                                {new Date(thread.answeredAt!).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-800">{thread.answer}</p>
                          </div>
                        </div>
                      )}

                      {thread.status === "pending" && (
                        <div className="ml-11 pl-4 border-l-2 border-gray-300">
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-2 text-[#6B7C8F]">
                              <i className="ri-time-line"></i>
                              <span className="text-sm">
                                Waiting for homeowner response...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {getMyJobQuestions(selectedJob.id).length === 0 && askingJobId !== selectedJob.id && (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mx-auto mb-4">
                        <i className="ri-question-answer-line text-3xl text-gray-400"></i>
                      </div>
                      <p className="text-[#6B7C8F] text-sm mb-1">
                        No questions asked yet
                      </p>
                      <p className="text-[#6B7C8F] text-xs">
                        Ask the homeowner a question to get more details before
                        quoting
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setAskingJobId(null);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
              >
                Close
              </button>
              <button
                onClick={() => handleSubmitQuote(selectedJob)}
                className="flex items-center gap-2 px-6 py-2 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 transition-colors cursor-pointer whitespace-nowrap ml-auto"
              >
                <i className="ri-send-plane-line"></i>
                Submit Quote
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quote Builder Modal */}
      {showQuoteBuilder && quoteJobData && (
        <QuoteBuilder
          jobId={quoteJobData.id}
          jobTitle={quoteJobData.title}
          jobDescription={quoteJobData.description}
          trades={quoteJobData.trades}
          budgetRange={quoteJobData.budget}
          onClose={() => {
            setShowQuoteBuilder(false);
            setQuoteJobData(null);
          }}
          onSubmit={handleQuoteSubmit}
        />
      )}
    </div>
  );
}
