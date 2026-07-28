export default function RiskForecasting() {
  const risks = [
    {
      system: 'Water Heater',
      riskLevel: 'critical',
      probability: 85,
      timeframe: '6-12 months',
      age: 11,
      expectedLife: '12-15 years',
      indicators: [
        'Age entering failure window',
        'Sediment buildup detected',
        'Minor temperature fluctuations'
      ],
      impact: 'High - Potential flooding and water damage',
      estimatedCost: '$1,200-$1,800',
      recommendation: 'Schedule diagnostic inspection within 30 days. Budget for replacement.',
      preventiveActions: [
        'Flush tank to remove sediment',
        'Test pressure relief valve',
        'Inspect anode rod',
        'Get replacement quotes'
      ]
    },
    {
      system: 'Roof Shingles',
      riskLevel: 'moderate',
      probability: 45,
      timeframe: '2-4 years',
      age: 16,
      expectedLife: '20-25 years',
      indicators: [
        'Minor granule loss observed',
        'Some curling on south-facing slope',
        'Age approaching typical replacement window'
      ],
      impact: 'High - Potential leaks and interior damage',
      estimatedCost: '$8,500-$12,000',
      recommendation: 'Annual inspections recommended. Plan replacement budget for 2026-2027.',
      preventiveActions: [
        'Annual professional inspection',
        'Keep gutters clean',
        'Trim overhanging branches',
        'Monitor for leaks after storms'
      ]
    },
    {
      system: 'Crawlspace Moisture',
      riskLevel: 'moderate',
      probability: 60,
      timeframe: 'Ongoing',
      age: null,
      expectedLife: null,
      indicators: [
        'High humidity readings in spring',
        'Poor drainage around foundation',
        'Inadequate vapor barrier'
      ],
      impact: 'Medium - Mold risk, structural damage, pest attraction',
      estimatedCost: '$2,500-$5,000',
      recommendation: 'Install vapor barrier and improve drainage. Consider dehumidification.',
      preventiveActions: [
        'Improve exterior grading',
        'Install vapor barrier',
        'Add crawlspace ventilation',
        'Monitor humidity levels'
      ]
    },
    {
      system: 'Sewer Line',
      riskLevel: 'low',
      probability: 25,
      timeframe: '3-5 years',
      age: 16,
      expectedLife: '50-100 years (cast iron)',
      indicators: [
        'Slow drains occasionally',
        'Age of home suggests cast iron',
        'Trees near sewer line path'
      ],
      impact: 'High - Backup risk, expensive repair',
      estimatedCost: '$3,000-$8,000',
      recommendation: 'Schedule camera inspection. Consider root treatment if trees present.',
      preventiveActions: [
        'Camera inspection every 3-5 years',
        'Root treatment if needed',
        'Avoid flushing wipes/grease',
        'Monitor drain performance'
      ]
    }
  ];

  const weatherRisks = [
    {
      type: 'Freeze Risk',
      season: 'Winter',
      probability: 'High',
      systems: ['Pipes', 'Outdoor faucets', 'HVAC condensate line'],
      action: 'Winterization protocol active'
    },
    {
      type: 'Storm Damage',
      season: 'Spring/Summer',
      probability: 'Moderate',
      systems: ['Roof', 'Siding', 'Trees'],
      action: 'Pre-season inspection recommended'
    },
    {
      type: 'Humidity & Mold',
      season: 'Summer',
      probability: 'Moderate',
      systems: ['Crawlspace', 'Attic', 'Basement'],
      action: 'Monitor humidity levels'
    }
  ];

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'moderate':
        return 'bg-[#D4B483]/10 text-[#D4B483] border-[#D4B483]/20';
      case 'low':
        return 'bg-[#6B7C8F]/10 text-[#6B7C8F] border-[#6B7C8F]/20';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
        return 'ri-error-warning-line';
      case 'moderate':
        return 'ri-alert-line';
      case 'low':
        return 'ri-information-line';
      default:
        return 'ri-information-line';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Risk Forecasting
            </h2>
            <p className="text-white/90 mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
              Predictive analysis based on system age, local conditions, and maintenance history
            </p>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-4xl font-bold">{risks.filter(r => r.riskLevel === 'critical').length}</div>
                <div className="text-sm text-white/80">Critical Risks</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{risks.filter(r => r.riskLevel === 'moderate').length}</div>
                <div className="text-sm text-white/80">Moderate Risks</div>
              </div>
              <div>
                <div className="text-4xl font-bold">{risks.filter(r => r.riskLevel === 'low').length}</div>
                <div className="text-sm text-white/80">Low Risks</div>
              </div>
            </div>
          </div>
          <div className="w-24 h-24 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full">
            <i className="ri-shield-check-line text-5xl"></i>
          </div>
        </div>
      </div>

      {/* Risk Cards */}
      <div className="space-y-4">
        {risks.map((risk, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border-2 border-gray-100 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${getRiskColor(risk.riskLevel)}`}>
                  <i className={`${getRiskIcon(risk.riskLevel)} text-2xl`}></i>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#0B1F33] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {risk.system}
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getRiskColor(risk.riskLevel)}`}>
                      {risk.riskLevel.toUpperCase()} RISK
                    </span>
                    <span className="text-sm text-[#333645]">
                      {risk.probability}% probability • {risk.timeframe}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#0B1F33] mb-1">
                  {risk.estimatedCost}
                </div>
                <div className="text-xs text-gray-500">Estimated cost</div>
              </div>
            </div>

            {risk.age && (
              <div className="bg-[#F9F9FB] rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Current age: <strong>{risk.age} years</strong></span>
                  <span className="text-gray-600">Expected life: <strong>{risk.expectedLife}</strong></span>
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-2 gap-6 mb-4">
              <div>
                <h4 className="font-bold text-[#2D2A74] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Risk Indicators
                </h4>
                <ul className="space-y-2">
                  {risk.indicators.map((indicator, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#333645]">
                      <i className="ri-checkbox-circle-line text-[#D4B483] mt-0.5"></i>
                      <span>{indicator}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-[#2D2A74] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Preventive Actions
                </h4>
                <ul className="space-y-2">
                  {risk.preventiveActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-[#333645]">
                      <i className="ri-arrow-right-s-line text-[#D4B483] mt-0.5"></i>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <i className="ri-lightbulb-line text-xl text-blue-600 mt-0.5"></i>
                <div>
                  <h4 className="font-bold text-blue-900 mb-1">Recommendation</h4>
                  <p className="text-sm text-blue-800">{risk.recommendation}</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex items-start gap-3">
                <i className="ri-alert-line text-xl text-red-600 mt-0.5"></i>
                <div>
                  <h4 className="font-bold text-red-900 mb-1">Potential Impact</h4>
                  <p className="text-sm text-red-800">{risk.impact}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-6 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-colors font-semibold whitespace-nowrap cursor-pointer">
                Schedule Inspection
              </button>
              <button className="flex-1 px-6 py-3 border-2 border-gray-200 text-[#333645] rounded-lg hover:border-[#D4B483] hover:text-[#D4B483] transition-colors font-semibold whitespace-nowrap cursor-pointer">
                Get Quotes
              </button>
              <button className="px-6 py-3 border-2 border-gray-200 text-[#333645] rounded-lg hover:border-[#D4B483] hover:text-[#D4B483] transition-colors font-semibold whitespace-nowrap cursor-pointer">
                <i className="ri-more-line text-xl"></i>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Weather-Based Risks */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-[#0B1F33] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Seasonal & Weather Risks
        </h2>
        <div className="grid lg:grid-cols-3 gap-4">
          {weatherRisks.map((risk, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                {risk.type}
              </h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-500">Season:</span>
                  <span className="font-semibold text-[#333645]">{risk.season}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Probability:</span>
                  <span className="font-semibold text-[#333645]">{risk.probability}</span>
                </div>
              </div>
              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-2">Affected Systems:</div>
                <div className="flex flex-wrap gap-1">
                  {risk.systems.map((system, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#D4B483]/10 text-[#D4B483] rounded text-xs font-semibold">
                      {system}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-xs text-[#333645] bg-[#F9F9FB] p-2 rounded">
                <strong>Action:</strong> {risk.action}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
