import { useState } from 'react';

export default function EmergencyProtocol() {
  const [selectedProtocol, setSelectedProtocol] = useState<number | null>(null);

  const protocols = [
    {
      id: 1,
      title: 'Pipe Burst',
      icon: 'ri-drop-line',
      color: 'bg-blue-500',
      severity: 'Critical',
      immediateSteps: [
        'Shut off main water valve immediately',
        'Turn off electricity if water near outlets',
        'Open faucets to drain remaining water',
        'Move valuables away from water'
      ],
      nextSteps: [
        'Document damage with photos',
        'Contact insurance company',
        'Call emergency plumber',
        'Begin water extraction if safe'
      ],
      prevention: [
        'Insulate exposed pipes',
        'Keep heat on during freezing weather',
        'Know location of main shutoff valve',
        'Install leak detection sensors'
      ],
      emergencyContacts: [
        { type: 'Main Water Shutoff', location: 'Basement near water heater' },
        { type: 'Emergency Plumber', info: 'Request contractor through Emporva' },
        { type: 'Insurance', info: 'File claim immediately' }
      ]
    },
    {
      id: 2,
      title: 'Power Outage',
      icon: 'ri-flashlight-line',
      color: 'bg-[#FDC500]',
      severity: 'High',
      immediateSteps: [
        'Check if outage is localized or widespread',
        'Turn off major appliances to prevent surge damage',
        'Keep refrigerator and freezer closed',
        'Use flashlights, not candles'
      ],
      nextSteps: [
        'Contact utility company to report outage',
        'Check circuit breakers and fuses',
        'If extended, move perishables to coolers',
        'Run generator outside only if available'
      ],
      prevention: [
        'Keep flashlights and batteries accessible',
        'Consider backup generator',
        'Surge protectors on electronics',
        'Know location of electrical panel'
      ],
      emergencyContacts: [
        { type: 'Electrical Panel', location: 'Garage wall' },
        { type: 'Utility Company', info: '1-800-XXX-XXXX' },
        { type: 'Electrician', info: 'Request through Emporva if needed' }
      ]
    },
    {
      id: 3,
      title: 'Flooded Crawlspace',
      icon: 'ri-water-flash-line',
      color: 'bg-blue-600',
      severity: 'High',
      immediateSteps: [
        'Do not enter if water is deep or electrical hazard exists',
        'Turn off power to affected area',
        'Identify source of water if possible',
        'Check for sewer backup (do not touch if sewage)'
      ],
      nextSteps: [
        'Call professional if sewage or deep water',
        'Begin water extraction with pump',
        'Set up fans and dehumidifiers',
        'Document damage for insurance'
      ],
      prevention: [
        'Install sump pump with battery backup',
        'Improve exterior drainage and grading',
        'Install vapor barrier',
        'Regular gutter cleaning'
      ],
      emergencyContacts: [
        { type: 'Sump Pump Location', location: 'Crawlspace access in laundry room' },
        { type: 'Water Damage Restoration', info: 'Request through Emporva' },
        { type: 'Insurance', info: 'File claim within 24 hours' }
      ]
    },
    {
      id: 4,
      title: 'HVAC Failure in Extreme Temps',
      icon: 'ri-temp-hot-line',
      color: 'bg-red-500',
      severity: 'High',
      immediateSteps: [
        'Check thermostat settings and batteries',
        'Verify circuit breaker hasn\'t tripped',
        'Check air filter - replace if clogged',
        'Ensure outdoor unit is clear of debris'
      ],
      nextSteps: [
        'Close blinds and doors to retain temperature',
        'Use space heaters or fans as temporary solution',
        'Contact HVAC technician immediately',
        'Consider temporary lodging if extreme conditions'
      ],
      prevention: [
        'Schedule maintenance twice yearly',
        'Replace filters every 1-3 months',
        'Keep outdoor unit clear',
        'Know location of emergency shutoff'
      ],
      emergencyContacts: [
        { type: 'HVAC Shutoff', location: 'Outdoor unit and electrical panel' },
        { type: 'Emergency HVAC', info: 'Request through Emporva' },
        { type: 'Filter Size', info: '16x25x1' }
      ]
    },
    {
      id: 5,
      title: 'Well Pump Failure',
      icon: 'ri-water-percent-line',
      color: 'bg-teal-500',
      severity: 'High',
      immediateSteps: [
        'Check circuit breaker for well pump',
        'Verify pressure tank gauge reading',
        'Do not run water if pump is cycling rapidly',
        'Check for visible leaks at pressure tank'
      ],
      nextSteps: [
        'Contact well pump specialist',
        'Store water for essential needs',
        'Avoid running appliances that use water',
        'Document issue for service call'
      ],
      prevention: [
        'Annual well pump inspection',
        'Monitor pressure tank gauge regularly',
        'Replace pressure tank every 10-15 years',
        'Keep well area accessible'
      ],
      emergencyContacts: [
        { type: 'Well Pump Breaker', location: 'Electrical panel - labeled' },
        { type: 'Pressure Tank', location: 'Basement utility room' },
        { type: 'Well Service', info: 'Request through Emporva' }
      ]
    },
    {
      id: 6,
      title: 'Storm Damage Response',
      icon: 'ri-thunderstorms-line',
      color: 'bg-gray-600',
      severity: 'Variable',
      immediateSteps: [
        'Stay indoors until storm passes',
        'Check for immediate hazards (downed wires, gas leaks)',
        'Document all damage with photos',
        'Cover any roof leaks with tarps if safe'
      ],
      nextSteps: [
        'Contact insurance company immediately',
        'Get emergency repairs for safety hazards',
        'Remove standing water to prevent mold',
        'Schedule full damage assessment'
      ],
      prevention: [
        'Trim trees near house regularly',
        'Secure outdoor items before storms',
        'Keep gutters and drains clear',
        'Annual roof inspection'
      ],
      emergencyContacts: [
        { type: 'Insurance', info: 'File claim within 24-48 hours' },
        { type: 'Emergency Repairs', info: 'Request through Emporva' },
        { type: 'Utility Company', info: 'Report downed lines immediately' }
      ]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-red-500/10 text-red-600 border-red-200';
      case 'High':
        return 'bg-orange-500/10 text-orange-600 border-orange-200';
      case 'Variable':
        return 'bg-gray-500/10 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Emergency Protocols
            </h2>
            <p className="text-white/90 text-lg mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
              Three steps. One button to request help if needed.
            </p>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 inline-flex">
              <i className="ri-phone-line text-xl"></i>
              <span className="font-semibold">Emergency? Call 911 first for life-threatening situations</span>
            </div>
          </div>
          <div className="w-24 h-24 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full">
            <i className="ri-first-aid-kit-line text-5xl"></i>
          </div>
        </div>
      </div>

      {/* Protocol Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {protocols.map((protocol) => (
          <div
            key={protocol.id}
            className={`bg-white rounded-xl shadow-sm border-2 p-6 cursor-pointer transition-all ${
              selectedProtocol === protocol.id ? 'border-[#00B8A9]' : 'border-gray-100 hover:border-[#00B8A9]/50'
            }`}
            onClick={() => setSelectedProtocol(selectedProtocol === protocol.id ? null : protocol.id)}
          >
            {/* Protocol Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 flex items-center justify-center ${protocol.color} rounded-xl text-white`}>
                  <i className={`${protocol.icon} text-3xl`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#2D2A74] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {protocol.title}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(protocol.severity)}`}>
                    {protocol.severity.toUpperCase()}
                  </span>
                </div>
              </div>
              <i className={`ri-arrow-${selectedProtocol === protocol.id ? 'up' : 'down'}-s-line text-2xl text-gray-400`}></i>
            </div>

            {/* Expanded Content */}
            {selectedProtocol === protocol.id && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                {/* Immediate Steps */}
                <div>
                  <h4 className="font-bold text-[#2D2A74] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="w-6 h-6 flex items-center justify-center bg-red-500 text-white rounded-full text-xs">1</span>
                    Immediate Steps
                  </h4>
                  <ul className="space-y-2">
                    {protocol.immediateSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#333645]">
                        <i className="ri-alert-line text-red-500 mt-0.5 flex-shrink-0"></i>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="font-bold text-[#2D2A74] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="w-6 h-6 flex items-center justify-center bg-[#FDC500] text-white rounded-full text-xs">2</span>
                    Next Steps
                  </h4>
                  <ul className="space-y-2">
                    {protocol.nextSteps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#333645]">
                        <i className="ri-arrow-right-s-line text-[#FDC500] mt-0.5 flex-shrink-0"></i>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Prevention */}
                <div>
                  <h4 className="font-bold text-[#2D2A74] mb-3 flex items-center gap-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    <span className="w-6 h-6 flex items-center justify-center bg-[#00B8A9] text-white rounded-full text-xs">3</span>
                    Prevention
                  </h4>
                  <ul className="space-y-2">
                    {protocol.prevention.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-[#333645]">
                        <i className="ri-shield-check-line text-[#00B8A9] mt-0.5 flex-shrink-0"></i>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Emergency Contacts */}
                <div className="bg-[#F9F9FB] rounded-lg p-4">
                  <h4 className="font-bold text-[#2D2A74] mb-3" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                    Emergency Reference
                  </h4>
                  <div className="space-y-2">
                    {protocol.emergencyContacts.map((contact, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-semibold text-[#2D2A74]">{contact.type}:</span>{' '}
                        <span className="text-[#333645]">{contact.location || contact.info}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <button className="w-full px-6 py-4 bg-[#00B8A9] text-white rounded-lg hover:bg-[#00a89a] transition-colors font-bold text-lg whitespace-nowrap cursor-pointer">
                  <i className="ri-customer-service-line mr-2"></i>
                  Request Emergency Help Now
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Reference Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-[#2D2A74] mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
          Essential Shutoff Locations
        </h2>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center bg-blue-500/10 rounded-lg">
                <i className="ri-drop-line text-xl text-blue-500"></i>
              </div>
              <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Main Water Valve
              </h3>
            </div>
            <p className="text-sm text-[#333645] mb-2">
              <strong>Location:</strong> Basement near water heater
            </p>
            <p className="text-xs text-gray-500">
              Turn clockwise to shut off. Test quarterly to ensure it works.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center bg-[#FDC500]/10 rounded-lg">
                <i className="ri-flashlight-line text-xl text-[#FDC500]"></i>
              </div>
              <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Electrical Panel
              </h3>
            </div>
            <p className="text-sm text-[#333645] mb-2">
              <strong>Location:</strong> Garage wall
            </p>
            <p className="text-xs text-gray-500">
              Main breaker at top. Label all circuits for quick identification.
            </p>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 flex items-center justify-center bg-orange-500/10 rounded-lg">
                <i className="ri-fire-line text-xl text-orange-500"></i>
              </div>
              <h3 className="font-bold text-[#2D2A74]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Gas Shutoff
              </h3>
            </div>
            <p className="text-sm text-[#333645] mb-2">
              <strong>Location:</strong> Meter outside near foundation
            </p>
            <p className="text-xs text-gray-500">
              Requires wrench. Only shut off if you smell gas or emergency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
