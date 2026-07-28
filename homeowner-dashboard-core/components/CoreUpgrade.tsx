export default function CoreUpgrade() {
  return (
    <div className="mt-8 bg-gradient-to-br from-[#0B1F33] via-[#1a3a52] to-[#0B1F33] rounded-xl p-8 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 bg-[#D4B483] rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-vip-crown-line text-[#0B1F33] text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-white">Unlock Property Intelligence</h2>
        <p className="text-lg text-white mb-6">
          Upgrade to Premium for unlimited AI diagnostics, Property Memory, Utility Insights, and resale-ready history reports.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <i className="ri-database-2-line text-[#D4B483] text-3xl mb-2"></i>
            <h4 className="font-semibold mb-1 text-white">Property Memory</h4>
            <p className="text-sm text-white">Complete history for resale or refinancing</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <i className="ri-line-chart-line text-[#D4B483] text-3xl mb-2"></i>
            <h4 className="font-semibold mb-1 text-white">Utility Insights</h4>
            <p className="text-sm text-white">Predictions and anomaly detection</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <i className="ri-sparkling-line text-[#D4B483] text-3xl mb-2"></i>
            <h4 className="font-semibold mb-1 text-white">Unlimited AI</h4>
            <p className="text-sm text-white">Diagnose and clarify without limits</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-2xl font-bold text-[#D4B483] mb-2">$12/month or $120/year</p>
          <p className="text-sm text-white">Annual plan saves 2 months</p>
        </div>

        <a
          href="/homeowner-plans"
          className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#c4a473] transition-all whitespace-nowrap cursor-pointer"
        >
          View Premium Features
        </a>
      </div>
    </div>
  );
}