import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';


const standards = [
  {
    icon: 'ri-shield-check-line',
    title: 'Licensing & Insurance',
    requirements: [
      'Valid state/local contractor license for your trade',
      'General liability insurance (minimum $1M coverage)',
      'Workers\' compensation insurance (if applicable)',
      'Proof of bonding (for certain project types)',
      'All documentation must be current and verifiable'
    ]
  },
  {
    icon: 'ri-user-search-line',
    title: 'Background Verification',
    requirements: [
      'Pass criminal background check',
      'No history of contractor fraud or license violations',
      'Verification of business registration',
      'Reference checks from previous clients',
      'Identity verification'
    ]
  },
  {
    icon: 'ri-star-line',
    title: 'Quality Standards',
    requirements: [
      'Maintain minimum 4.0 star rating (after first 5 reviews)',
      'Complete projects according to agreed timelines',
      'Follow all local building codes and regulations',
      'Use quality materials and workmanship',
      'Provide warranties on work performed'
    ]
  },
  {
    icon: 'ri-chat-3-line',
    title: 'Communication',
    requirements: [
      'Respond to leads within 24 hours',
      'Provide clear, detailed quotes',
      'Keep homeowners updated on project progress',
      'Document all work with photos',
      'Professional and respectful communication at all times'
    ]
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Documentation',
    requirements: [
      'Provide detailed scope of work for all projects',
      'Submit progress photos at key milestones',
      'Maintain accurate project timelines',
      'Issue proper invoices and receipts',
      'Keep records for warranty and compliance purposes'
    ]
  },
  {
    icon: 'ri-shield-star-line',
    title: 'Safety & Compliance',
    requirements: [
      'Follow OSHA safety guidelines',
      'Maintain clean and safe work sites',
      'Properly dispose of materials and debris',
      'Obtain necessary permits before starting work',
      'Comply with environmental regulations'
    ]
  }
];

const violations = [
  {
    level: 'Minor Violation',
    color: '#D4B483',
    examples: [
      'Late response to homeowner inquiry (24-48 hours)',
      'Missing project documentation',
      'Minor communication issues'
    ],
    consequence: 'Warning and required corrective action'
  },
  {
    level: 'Moderate Violation',
    color: '#FF6B6B',
    examples: [
      'Repeated late responses',
      'Rating drops below 4.0 stars',
      'Failure to complete agreed-upon work',
      'Unprofessional conduct'
    ],
    consequence: 'Temporary suspension and mandatory training'
  },
  {
    level: 'Severe Violation',
    color: '#C92A2A',
    examples: [
      'Fraud or misrepresentation',
      'Safety violations',
      'Unlicensed work',
      'Harassment or discrimination',
      'Abandoning projects'
    ],
    consequence: 'Immediate removal from platform'
  }
];

export default function ContractorStandards() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 bg-gradient-to-br from-[#0B1F33] to-[#6B7C8F]">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Contractor Standards & Compliance
          </h1>
          <p className="text-xl text-white/95 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Our commitment to quality, safety, and professionalism
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <p className="text-lg text-[#333645] leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            Emporva maintains high standards for all contractors on our platform. These standards protect homeowners, ensure quality work, and help contractors build successful businesses.
          </p>
          <p className="text-lg text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            By joining Emporva, you agree to meet and maintain these standards. Failure to comply may result in suspension or removal from the platform.
          </p>
        </div>
      </section>

      {/* Standards */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Required Standards
            </h2>
            <p className="text-lg text-[#333645] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              All contractors must meet these requirements to join and remain on the platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {standards.map((standard, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 bg-[#D4B483]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <i className={`${standard.icon} text-2xl text-[#D4B483]`}></i>
                  </div>
                  <h3 className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {standard.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {standard.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                      <span className="text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {req}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification Process */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Verification Process
            </h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Initial Application
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Submit your application with business information, licenses, insurance, and references. Our team reviews all applications within 3-5 business days.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Background Check
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  We conduct criminal background checks and verify your business registration, licenses, and insurance through third-party services.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Reference Verification
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  We contact your references to verify work quality, professionalism, and reliability.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 bg-[#0B1F33] rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-[#0B1F33] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Ongoing Monitoring
                </h3>
                <p className="text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  We continuously monitor ratings, reviews, and compliance. Annual re-verification of licenses and insurance is required.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Violations */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Violation Policy
            </h2>
            <p className="text-lg text-[#333645] max-w-2xl mx-auto" style={{ fontFamily: 'Inter, sans-serif' }}>
              We take violations seriously to maintain platform quality and user safety
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {violations.map((violation, index) => (
              <div key={index} className="bg-white rounded-xl p-8 shadow-lg border-t-4" style={{ borderColor: violation.color }}>
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {violation.level}
                </h3>
                <div className="mb-6">
                  <p className="text-sm font-semibold text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Examples:
                  </p>
                  <ul className="space-y-2">
                    {violation.examples.map((example, idx) => (
                      <li key={idx} className="text-[#333645] text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                        • {example}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm font-semibold text-[#333645] mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Consequence:
                  </p>
                  <p className="text-[#333645] font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {violation.consequence}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Appeals */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-[#0B1F33] mb-6 text-center" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Appeals Process
          </h2>
          <p className="text-lg text-[#333645] leading-relaxed mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            If you believe a violation was issued in error or wish to appeal a decision, you may submit an appeal within 14 days. Include:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-8 text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <li>Detailed explanation of the situation</li>
            <li>Supporting documentation or evidence</li>
            <li>Steps you've taken to address the issue</li>
          </ul>
          <p className="text-lg text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
            Appeals are reviewed by our compliance team within 7 business days. Decisions are final.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-12 text-center shadow-xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Questions About Standards?
          </h2>
          <p className="text-white/95 text-lg mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Our contractor success team is here to help you understand and meet our standards
          </p>
          <div className="bg-white/10 rounded-lg p-6 text-white">
            <p className="mb-2"><strong>Email:</strong> contractors@emporva.com</p>
            <p><strong>Phone:</strong> [Phone Number]</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}