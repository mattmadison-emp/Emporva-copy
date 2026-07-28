
export default function CoreUpgrade() {
  return (
    <div className="mt-8 bg-gradient-to-br from-[#0B1F33] via-[#1a3a52] to-[#0B1F33] rounded-xl p-8 text-white">
      <div className="max-w-3xl mx-auto text-center">
        <div className="w-16 h-16 bg-[#D4B483] rounded-full flex items-center justify-center mx-auto mb-4">
          <i className="ri-vip-crown-line text-[#0B1F33] text-3xl"></i>
        </div>
        <h2 className="text-3xl font-bold mb-4">Ready to Scale Your Business?</h2>
        <p className="text-lg text-white/90 mb-6">
          Upgrade to Contractor Premium and unlock unlimited leads, full CRM, pipeline management, automated follow-ups, 
          scheduling tools, and business analytics — all for $99/month.
        </p>
        
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <i className="ri-infinity-line text-[#D4B483] text-3xl mb-2"></i>
            <h4 className="font-semibold mb-1">Unlimited Leads</h4>
            <p className="text-sm text-white/80">No per-lead cost ever</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <i className="ri-contacts-line text-[#D4B483] text-3xl mb-2"></i>
            <h4 className="font-semibold mb-1">Full CRM &amp; Pipeline</h4>
            <p className="text-sm text-white/80">Track customers and deals</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <i className="ri-robot-line text-[#D4B483] text-3xl mb-2"></i>
            <h4 className="font-semibold mb-1">Automation</h4>
            <p className="text-sm text-white/80">Email, SMS, and follow-ups</p>
          </div>
        </div>

        <a
          href="/contractor-plans"
          className="inline-block bg-[#D4B483] text-[#0B1F33] px-8 py-4 rounded-lg font-bold text-lg hover:bg-[#c4a473] transition-all whitespace-nowrap cursor-pointer"
        >
          View Premium Features
        </a>
      </div>
    </div>
  );
}
