import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function HowCreditsWork() {
  const [dismissed, setDismissed] = useState(false);
  const [expandedStep, setExpandedStep] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (dismissed) return null;

  const steps = [
    {
      icon: 'ri-search-eye-line',
      title: 'Browse for Free',
      short: 'Explore the Job Marketplace at no cost.',
      detail:
        'See job titles, trade categories, locations, budget ranges, and scope summaries. Ask questions in the public Q&A before committing any credits.',
    },
    {
      icon: 'ri-copper-coin-line',
      title: 'Spend 1 Credit to Unlock',
      short: 'Use one credit ($15) to access full lead details.',
      detail:
        'Unlocking reveals the homeowner\u2019s contact info, full AI-generated scope, photos, timeline, and lets you submit a quote directly. Only you and a limited number of other contractors see the lead.',
    },
    {
      icon: 'ri-file-text-line',
      title: 'Submit Your Quote',
      short: 'Send a detailed quote to the homeowner.',
      detail:
        'Use the built-in quote builder to itemize labor, materials, and timeline. The homeowner reviews all quotes side-by-side and picks the best fit.',
    },
    {
      icon: 'ri-trophy-line',
      title: 'Win the Job',
      short: 'Get selected and start working.',
      detail:
        'Once chosen, the job moves to your Active Jobs tab with a shared workspace for communication, approvals, progress tracking, and payments.',
    },
  ];

  const faqs = [
    {
      q: 'Do credits expire?',
      a: 'No. Credits never expire — use them whenever you\u2019re ready.',
    },
    {
      q: 'How much does a credit cost?',
      a: '$15 per credit. Buy in bulk (25+) for up to 10% off.',
    },
    {
      q: 'Can I get a refund on a credit?',
      a: 'Credits are non-refundable once used. Unused credits stay in your account indefinitely.',
    },
    {
      q: 'When does Premium make more sense?',
      a: 'If you\u2019re unlocking 7+ leads per month ($105+), Premium at $99/mo saves money and includes unlimited leads plus CRM, pipeline, and automation tools.',
    },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#D4B483]/20 rounded-lg flex items-center justify-center">
            <i className="ri-lightbulb-line text-[#D4B483] text-lg"></i>
          </div>
          <div>
            <h3 className="text-base font-bold text-white">How Credits Work</h3>
            <p className="text-xs text-white/60">New here? Here\u2019s the quick rundown.</p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          aria-label="Dismiss"
        >
          <i className="ri-close-line text-white/60 text-lg"></i>
        </button>
      </div>

      <div className="p-5">
        {/* Steps */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {steps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setExpandedStep(expandedStep === idx ? null : idx)}
              className={`text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                expandedStep === idx
                  ? 'border-[#D4B483] bg-[#D4B483]/5'
                  : 'border-gray-100 hover:border-gray-200 bg-[#F9F9FB]'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 bg-[#0B1F33] text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="w-7 h-7 flex items-center justify-center">
                  <i className={`${step.icon} text-[#D4B483] text-lg`}></i>
                </div>
              </div>
              <h4 className="text-sm font-bold text-[#0B1F33] mb-1">{step.title}</h4>
              <p className="text-xs text-[#6B7C8F] leading-relaxed">{step.short}</p>
              {expandedStep === idx && (
                <p className="text-xs text-[#333645] mt-2 pt-2 border-t border-gray-200 leading-relaxed">
                  {step.detail}
                </p>
              )}
              <span className="text-[10px] text-[#D4B483] font-semibold mt-2 inline-block">
                {expandedStep === idx ? 'Show less' : 'Learn more'}
              </span>
            </button>
          ))}
        </div>

        {/* Visual cost breakdown */}
        <div className="bg-[#F9F9FB] rounded-xl p-4 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-8">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <i className="ri-copper-coin-line text-[#D4B483] text-lg"></i>
                  <span className="text-2xl font-bold text-[#0B1F33]">1</span>
                </div>
                <p className="text-[10px] text-[#6B7C8F] font-semibold uppercase tracking-wider">Credit</p>
              </div>
              <div className="text-[#6B7C8F] text-lg">=</div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#0B1F33]">$15</p>
                <p className="text-[10px] text-[#6B7C8F] font-semibold uppercase tracking-wider">Cost</p>
              </div>
              <div className="text-[#6B7C8F] text-lg">=</div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <i className="ri-user-star-line text-teal-600 text-lg"></i>
                  <span className="text-2xl font-bold text-[#0B1F33]">1</span>
                </div>
                <p className="text-[10px] text-[#6B7C8F] font-semibold uppercase tracking-wider">Lead Unlocked</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-[#D4B483]/10 border border-[#D4B483]/20 rounded-lg px-3 py-2">
              <i className="ri-vip-crown-line text-[#D4B483] text-sm"></i>
              <p className="text-xs text-[#0B1F33]">
                <strong>7+ leads/mo?</strong>{' '}
                <Link to="/contractor-plans" className="text-[#D4B483] font-semibold hover:underline cursor-pointer">
                  Premium saves you money
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Mini FAQ */}
        <div>
          <h4 className="text-sm font-bold text-[#0B1F33] mb-3 flex items-center gap-2">
            <i className="ri-question-line text-[#6B7C8F]"></i>
            Common Questions
          </h4>
          <div className="space-y-2">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left cursor-pointer hover:bg-[#F9F9FB] transition-colors"
                >
                  <span className="text-sm font-semibold text-[#0B1F33]">{faq.q}</span>
                  <i
                    className={`ri-arrow-down-s-line text-[#6B7C8F] transition-transform ${
                      openFaq === idx ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-3">
                    <p className="text-xs text-[#6B7C8F] leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
