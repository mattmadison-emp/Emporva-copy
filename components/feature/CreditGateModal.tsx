interface CreditGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  creditType?: 'ai_diagnostic' | 'utility_upload' | 'export';
}

const creditTypeLabels = {
  ai_diagnostic: 'AI Diagnostic Credits',
  utility_upload: 'Utility Upload Credits',
  export: 'Export Credits',
};

const creditTypeDescriptions = {
  ai_diagnostic: 'Upload photos and get AI-powered diagnosis of your property issues.',
  utility_upload: 'Track utility bills to monitor usage patterns and catch anomalies.',
  export: 'Generate comprehensive property history reports for resale or refinancing.',
};

export default function CreditGateModal({
  isOpen,
  onClose,
  onUpgrade,
  creditType = 'ai_diagnostic',
}: CreditGateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <i className="ri-close-line text-2xl"></i>
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-[#D4B483]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="ri-information-line text-3xl text-[#D4B483]"></i>
          </div>
          <h2 className="text-3xl font-bold text-[#0B1F33] mb-2">
            You've Used All Your {creditTypeLabels[creditType]}
          </h2>
          <p className="text-lg text-[#6B7C8F]">
            {creditTypeDescriptions[creditType]}
          </p>
        </div>

        <div className="bg-[#F9F9FB] rounded-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-[#0B1F33] mb-4">Upgrade to Premium for Unlimited Access</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
              <span className="text-[#333645]"><strong>Unlimited AI diagnostics</strong> - Diagnose issues without limits</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
              <span className="text-[#333645]"><strong>Unlimited utility uploads</strong> - Track all your bills</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
              <span className="text-[#333645]"><strong>Unlimited exports</strong> - Generate reports anytime</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
              <span className="text-[#333645]"><strong>Property Memory</strong> - Complete property history tracking</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
              <span className="text-[#333645]"><strong>Utility Insights</strong> - Predictions and anomaly detection</span>
            </div>
            <div className="flex items-start gap-3">
              <i className="ri-check-line text-[#D4B483] text-xl flex-shrink-0 mt-1"></i>
              <span className="text-[#333645]"><strong>Unlimited storage</strong> - Never worry about space</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-2xl font-bold text-[#0B1F33] mb-1">$12/month or $120/year</p>
            <p className="text-sm text-[#6B7C8F]">Annual plan saves 2 months</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors whitespace-nowrap cursor-pointer"
          >
            Maybe Later
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 bg-[#D4B483] text-[#0B1F33] py-3 rounded-lg font-semibold hover:bg-[#c4a473] transition-colors whitespace-nowrap cursor-pointer"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}
