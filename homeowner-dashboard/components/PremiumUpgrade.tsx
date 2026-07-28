import { Link } from 'react-router-dom';

export default function PremiumUpgrade() {
  return (
    <div className="bg-gradient-to-br from-[#D4B483] to-[#D4B483]/80 rounded-xl p-8 text-white">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <i className="ri-vip-crown-line text-2xl"></i>
        </div>
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">Upgrade to Premium</h3>
          <p className="text-white/90 mb-6">
            Plan ahead and avoid expensive surprises with unlimited AI diagnosis, renovation visualization, cost forecasting, and predictive maintenance scheduling.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-xl flex-shrink-0 mt-1"></i>
              <span className="text-sm">Unlimited AI diagnosis and clarification</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-xl flex-shrink-0 mt-1"></i>
              <span className="text-sm">Advanced renovation visualization</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-xl flex-shrink-0 mt-1"></i>
              <span className="text-sm">Labor & materials cost ranges</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-xl flex-shrink-0 mt-1"></i>
              <span className="text-sm">System lifecycle forecasting</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-xl flex-shrink-0 mt-1"></i>
              <span className="text-sm">Interactive project timelines</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-xl flex-shrink-0 mt-1"></i>
              <span className="text-sm">Priority contractor matching</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              to="/homeowner-plans"
              className="bg-white text-[#D4B483] px-6 py-3 rounded-lg font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
            >
              View Premium Benefits
            </Link>
            <span className="text-2xl font-bold">$29/month</span>
          </div>
        </div>
      </div>
    </div>
  );
}