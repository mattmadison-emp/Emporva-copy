
import { Link } from 'react-router-dom';

export default function PremiumUpsellBanner() {
  const features = [
    { icon: 'ri-store-3-line', title: 'Unlimited Marketplace', desc: 'No per-lead cost — browse and quote freely' },
    { icon: 'ri-contacts-line', title: 'Full CRM', desc: 'Track every customer and interaction' },
    { icon: 'ri-flow-chart', title: 'Pipeline Management', desc: 'Manage leads through completion' },
    { icon: 'ri-robot-line', title: 'Automation', desc: 'Auto follow-ups, reminders, campaigns' },
    { icon: 'ri-line-chart-line', title: 'Business Analytics', desc: 'Revenue insights and growth data' },
    { icon: 'ri-calendar-2-line', title: 'Multi-Job Calendar', desc: 'See all jobs in one schedule view' },
  ];

  return (
    <div className="bg-gradient-to-br from-[#0B1F33] via-[#1a3a52] to-[#0B1F33] rounded-xl p-8 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4B483]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4B483]/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-[#D4B483] rounded-full flex items-center justify-center">
            <i className="ri-vip-crown-line text-[#0B1F33] text-2xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Stop Paying Per Lead</h2>
            <p className="text-white/70 text-sm">Upgrade to Premium and unlock your full business toolkit</p>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-6 border border-white/10">
          <div className="flex items-center gap-3 mb-2">
            <i className="ri-calculator-line text-[#D4B483] text-lg"></i>
            <p className="text-sm font-semibold text-white">The math is simple</p>
          </div>
          <p className="text-sm text-white/80">
            At <strong className="text-white">$15/lead</strong>, just <strong className="text-white">7 leads per month</strong> costs more than Premium.
            With Premium at <strong className="text-[#D4B483]">$99/month</strong>, you get <strong className="text-white">unlimited leads</strong> plus
            CRM, automation, analytics, and everything else you need to grow.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-3 mb-6">
          {features.map((f, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/10">
              <i className={`${f.icon} text-[#D4B483] text-xl mb-1.5 block`}></i>
              <h4 className="font-semibold text-sm mb-0.5 text-white">{f.title}</h4>
              <p className="text-xs text-white/60">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            to="/contractor-plans"
            className="inline-flex items-center gap-2 bg-[#D4B483] text-[#0B1F33] px-6 py-3 rounded-lg font-bold text-sm hover:bg-[#c4a473] transition-all whitespace-nowrap cursor-pointer"
          >
            <i className="ri-vip-crown-line"></i>
            Upgrade to Premium — $99/mo
          </Link>
          <Link
            to="/contractor-plans"
            className="text-sm text-[#D4B483] hover:text-white font-semibold whitespace-nowrap cursor-pointer transition-colors"
          >
            Compare Plans <i className="ri-arrow-right-s-line"></i>
          </Link>
        </div>
      </div>
    </div>
  );
}
