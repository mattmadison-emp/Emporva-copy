export const mockMarketplaceJobs = [
  {
    id: 'job-001',
    title: 'Kitchen Sink Leak Repair',
    description: 'Persistent leak under kitchen sink, water pooling in cabinet',
    trades: ['Plumbing'],
    urgency: 'high',
    isNew: true,
    location: 'Austin, TX 78701',
    budget: '$200-500',
    postedDate: '2024-01-15',
    homeownerName: 'Jennifer Martinez',
    propertyType: 'Single Family Home',
    photos: [
      'https://readdy.ai/api/search-image?query=kitchen%20sink%20cabinet%20interior%20showing%20water%20leak%20damage%20and%20pooling%20water%20under%20pipes%20with%20visible%20plumbing%20connections%20realistic%20home%20maintenance%20issue%20clear%20lighting%20detailed%20view&width=400&height=400&seq=kitchen-leak-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=close%20up%20view%20of%20leaking%20pipe%20connection%20under%20kitchen%20sink%20with%20water%20droplets%20and%20corrosion%20visible%20realistic%20plumbing%20problem%20detailed%20macro%20photography&width=400&height=400&seq=kitchen-leak-2&orientation=squarish',
      'https://readdy.ai/api/search-image?query=water%20damage%20stains%20on%20cabinet%20floor%20under%20kitchen%20sink%20showing%20moisture%20and%20warping%20realistic%20home%20damage%20documentation%20clear%20detailed%20view&width=400&height=400&seq=kitchen-leak-3&orientation=squarish'
    ]
  },
  {
    id: 'job-002',
    title: 'HVAC System Not Heating',
    description: 'Furnace not producing heat, thermostat shows correct temp but no warm air',
    trades: ['HVAC'],
    urgency: 'high',
    isNew: true,
    location: 'Austin, TX 78704',
    budget: '$300-800',
    postedDate: '2024-01-15',
    homeownerName: 'Tom Bradley',
    propertyType: 'Single Family Home',
    photos: [
      'https://readdy.ai/api/search-image?query=residential%20furnace%20unit%20in%20basement%20or%20utility%20room%20showing%20front%20panel%20and%20control%20board%20realistic%20home%20hvac%20system%20clear%20lighting%20detailed%20view&width=400&height=400&seq=hvac-furnace-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=home%20thermostat%20on%20wall%20displaying%20temperature%20settings%20modern%20digital%20display%20realistic%20residential%20interior%20clear%20detailed%20view&width=400&height=400&seq=hvac-thermostat-1&orientation=squarish'
    ]
  },
  {
    id: 'job-003',
    title: 'Electrical Outlet Not Working',
    description: 'Multiple outlets in living room stopped working, circuit breaker not tripped',
    trades: ['Electrical'],
    urgency: 'medium',
    isNew: true,
    location: 'Austin, TX 78702',
    budget: '$150-400',
    postedDate: '2024-01-14',
    homeownerName: 'Sarah Chen',
    propertyType: 'Condo',
    photos: [
      'https://readdy.ai/api/search-image?query=electrical%20outlet%20on%20living%20room%20wall%20showing%20standard%20duplex%20receptacle%20realistic%20residential%20interior%20clear%20lighting%20detailed%20view&width=400&height=400&seq=electrical-outlet-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=residential%20electrical%20circuit%20breaker%20panel%20box%20open%20showing%20breaker%20switches%20and%20labels%20realistic%20home%20electrical%20system%20clear%20detailed%20view&width=400&height=400&seq=electrical-panel-1&orientation=squarish'
    ]
  },
  {
    id: 'job-004',
    title: 'Bathroom Faucet Replacement',
    description: 'Old faucet leaking, needs replacement with new modern fixture',
    trades: ['Plumbing'],
    urgency: 'low',
    isNew: false,
    location: 'Austin, TX 78705',
    budget: '$250-600',
    postedDate: '2024-01-13',
    homeownerName: 'Michael Roberts',
    propertyType: 'Single Family Home',
    photos: [
      'https://readdy.ai/api/search-image?query=old%20bathroom%20sink%20faucet%20showing%20wear%20and%20water%20stains%20with%20visible%20leak%20at%20base%20realistic%20residential%20bathroom%20clear%20lighting%20detailed%20view&width=400&height=400&seq=bathroom-faucet-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=bathroom%20vanity%20sink%20area%20showing%20countertop%20and%20faucet%20installation%20location%20realistic%20residential%20bathroom%20interior%20clear%20detailed%20view&width=400&height=400&seq=bathroom-vanity-1&orientation=squarish'
    ]
  },
  {
    id: 'job-005',
    title: 'Ceiling Fan Installation',
    description: 'Install new ceiling fan in master bedroom, existing light fixture to be removed',
    trades: ['Electrical'],
    urgency: 'low',
    isNew: false,
    location: 'Austin, TX 78703',
    budget: '$200-450',
    postedDate: '2024-01-12',
    homeownerName: 'Lisa Thompson',
    propertyType: 'Single Family Home',
    photos: [
      'https://readdy.ai/api/search-image?query=bedroom%20ceiling%20with%20existing%20light%20fixture%20showing%20installation%20location%20for%20ceiling%20fan%20realistic%20residential%20interior%20clear%20lighting%20detailed%20view&width=400&height=400&seq=ceiling-location-1&orientation=squarish',
      'https://readdy.ai/api/search-image?query=new%20modern%20ceiling%20fan%20product%20still%20life%20showing%20blades%20and%20light%20kit%20ready%20for%20installation%20clean%20white%20background%20detailed%20product%20photography&width=400&height=400&seq=ceiling-fan-product-1&orientation=squarish'
    ]
  }
];

export const mockQAThreads = [
  {
    jobId: 'job-001',
    questionId: 'q-001',
    askerName: 'Your Company',
    askerCompany: 'Anderson Plumbing',
    question: 'Can you provide access to the crawlspace under the kitchen?',
    topic: 'Access',
    askedAt: '2024-01-15T10:30:00Z',
    status: 'answered' as const,
    answer: 'Yes, there is a crawlspace access panel in the hallway closet. I can clear it out before you arrive.',
    answeredAt: '2024-01-15T14:20:00Z'
  },
  {
    jobId: 'job-001',
    questionId: 'q-002',
    askerName: 'Your Company',
    askerCompany: 'Anderson Plumbing',
    question: 'What type of pipes do you have - copper, PVC, or PEX?',
    topic: 'Materials',
    askedAt: '2024-01-15T10:32:00Z',
    status: 'answered' as const,
    answer: 'They are copper pipes. The house was built in 1995.',
    answeredAt: '2024-01-15T14:22:00Z'
  },
  {
    jobId: 'job-002',
    questionId: 'q-003',
    askerName: 'Your Company',
    askerCompany: 'Anderson Plumbing',
    question: 'When was the last time the furnace was serviced?',
    topic: 'Timeline',
    askedAt: '2024-01-15T11:15:00Z',
    status: 'answered' as const,
    answer: 'It was serviced about 8 months ago in May 2023. The technician said everything looked good at that time.',
    answeredAt: '2024-01-15T15:45:00Z'
  },
  {
    jobId: 'job-003',
    questionId: 'q-004',
    askerName: 'Rodriguez Electric',
    askerCompany: 'Rodriguez Electric',
    question: 'Are there any GFCI outlets in the affected circuit?',
    topic: 'Scope',
    askedAt: '2024-01-14T09:20:00Z',
    status: 'pending' as const
  }
];
