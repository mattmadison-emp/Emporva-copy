export default function PremiumUpsellCards() {
  const premiumFeatures = [
    {
      icon: 'ri-home-heart-line',
      title: 'Home Valuation',
      description: 'Track your property value, equity, and mortgage payoff timeline with AI-powered insights',
      color: 'from-[#14B8A6] to-[#0ea89a]'
    },
    {
      icon: 'ri-line-chart-line',
      title: 'Property Analytics',
      description: 'Comprehensive cost tracking, maintenance forecasting, and ROI analysis for all improvements',
      color: 'from-[#0B1F33] to-[#1a3a52]'
    },
    {
      icon: 'ri-magic-line',
      title: 'Renovation Inspiration',
      description: 'AI-generated visualizations of potential renovations with cost estimates and ROI projections',
      color: 'from-[#D4B483] to-[#b89563]'
    },
    {
      icon: 'ri-tools-line',
      title: 'DIY Projects with AI Planning',
      description: 'Manage DIY projects with AI-generated step-by-step plans, or hand off to contractors when needed',
      color: 'from-[#14B8A6] to-[#0ea89a]'
    },
    {
      icon: 'ri-database-2-line',
      title: 'Property Memory',
      description: 'Complete digital record of all work, warranties, manuals, and maintenance history in one place',
      color: 'from-[#0B1F33] to-[#1a3a52]'
    },
    {
      icon: 'ri-flashlight-line',
      title: 'Utility Insights',
      description: 'Track energy usage, identify savings opportunities, and monitor utility costs over time',
      color: 'from-[#D4B483] to-[#b89563]'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Unlock Premium Features
        </h2>
        <p className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
          Take your property management to the next level
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {premiumFeatures.map((feature, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 hover:shadow-lg transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                <i className={`${feature.icon} text-white text-xl`}></i>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {feature.title}
                  </h3>
                  <div className="w-5 h-5 bg-[#D4B483]/10 rounded-full flex items-center justify-center">
                    <i className="ri-lock-line text-[#D4B483] text-xs"></i>
                  </div>
                </div>
                <p className="text-sm text-[#6B7C8F] mb-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {feature.description}
                </p>
                <div className="flex items-center gap-2 text-[#D4B483] text-sm font-semibold group-hover:gap-3 transition-all">
                  <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Learn More</span>
                  <i className="ri-arrow-right-line"></i>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-[#0B1F33] to-[#1a3a52] rounded-xl p-8 text-center text-white">
        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-vip-crown-line text-[#D4B483] text-3xl"></i>
        </div>
        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Ready to Upgrade?
        </h3>
        <p className="text-white mb-6 max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
          Get access to all premium features for just $12/month. Unlock home valuation, property analytics, renovation inspiration, DIY project planning, and more.
        </p>
        <a
          href="/homeowner-plans"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#D4B483] to-[#b89563] text-white rounded-lg font-bold text-lg hover:shadow-xl transition-all cursor-pointer whitespace-nowrap"
          style={{ fontFamily: 'Montserrat, sans-serif' }}
        >
          <i className="ri-vip-crown-line"></i>
          View Premium Plans
        </a>
      </div>
    </div>
  );
}
