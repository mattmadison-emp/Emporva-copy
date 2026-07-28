import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Terms of Service
          </h1>
          <p className="text-[#333645] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Last Updated: January 2025
          </p>

          <div className="space-y-8 text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                1. Acceptance of Terms
              </h2>
              <p className="leading-relaxed mb-4">
                By accessing or using Emporva's platform, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using this service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                2. Description of Service
              </h2>
              <p className="leading-relaxed mb-4">
                Emporva is a platform that connects property owners with verified contractors and provides AI-powered diagnostic and workflow tools. We facilitate connections but do not directly provide contracting services.
              </p>
              <p className="leading-relaxed">
                <strong>Important:</strong> Emporva is a marketplace and technology platform. We are not a contractor, and we do not perform any construction, repair, or maintenance work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                3. User Accounts
              </h2>
              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Account Creation</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You must be at least 18 years old to create an account</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You must notify us immediately of any unauthorized access</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Account Termination</h3>
              <p className="leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or misuse the platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                4. For Homeowners
              </h2>
              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Your Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Provide accurate information about your property and issues</li>
                <li>Communicate clearly and professionally with contractors</li>
                <li>Pay contractors according to agreed terms</li>
                <li>Leave honest reviews based on actual experiences</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">What We Don't Guarantee</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Specific project outcomes or timelines</li>
                <li>Contractor availability or pricing</li>
                <li>That AI diagnostics are 100% accurate (see AI Disclosure)</li>
                <li>Resolution of disputes between you and contractors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                5. For Contractors
              </h2>
              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Your Responsibilities</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Maintain all required licenses, insurance, and certifications</li>
                <li>Provide accurate information about your qualifications</li>
                <li>Respond to leads in a timely manner</li>
                <li>Perform work according to industry standards and local codes</li>
                <li>Communicate clearly with homeowners throughout projects</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Verification and Compliance</h3>
              <p className="leading-relaxed mb-4">
                By joining Emporva, you agree to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Submit to background checks and verification processes</li>
                <li>Maintain current licenses and insurance</li>
                <li>Comply with our Contractor Standards (see separate document)</li>
                <li>Allow us to remove you from the platform if standards are not met</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                6. Payments and Fees
              </h2>
              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">For Homeowners</h3>
              <p className="leading-relaxed mb-4">
                Using Emporva to find contractors is free. You pay contractors directly for their services according to your agreement with them.
              </p>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">For Contractors</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Free tier: Basic listing with standard payment processing fees</li>
                <li>Sponsored listings: Pay-per-lead model</li>
                <li>Pro subscription: Monthly fee for premium features</li>
              </ul>
              <p className="leading-relaxed">
                All fees are subject to change with 30 days notice. See our pricing page for current rates.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                7. AI Diagnostics and Guidance
              </h2>
              <p className="leading-relaxed mb-4">
                Emporva uses AI to analyze property issues and suggest workflows. However:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>AI diagnostics are guidance only, not professional advice</li>
                <li>Always consult with licensed professionals before making decisions</li>
                <li>We are not liable for decisions made based on AI recommendations</li>
                <li>Contractors should verify all AI-generated information</li>
              </ul>
              <p className="leading-relaxed">
                See our AI Use Disclosure for complete details.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                8. Intellectual Property
              </h2>
              <p className="leading-relaxed mb-4">
                The Emporva platform, including all content, features, and functionality, is owned by Emporva and protected by copyright, trademark, and other intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You retain ownership of content you upload (photos, descriptions, etc.) but grant us a license to use it to provide our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                9. Prohibited Conduct
              </h2>
              <p className="leading-relaxed mb-4">You may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Use the platform for any illegal purpose</li>
                <li>Impersonate another person or entity</li>
                <li>Harass, threaten, or abuse other users</li>
                <li>Post false or misleading information</li>
                <li>Attempt to circumvent our payment systems</li>
                <li>Scrape or copy content without permission</li>
                <li>Interfere with the platform's operation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                10. Limitation of Liability
              </h2>
              <p className="leading-relaxed mb-4">
                To the maximum extent permitted by law, Emporva shall not be liable for:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Any indirect, incidental, or consequential damages</li>
                <li>Work performed by contractors found through our platform</li>
                <li>Disputes between homeowners and contractors</li>
                <li>Inaccuracies in AI diagnostics or recommendations</li>
                <li>Loss of data or business interruption</li>
              </ul>
              <p className="leading-relaxed">
                Our total liability shall not exceed the amount you paid to Emporva in the past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                11. Dispute Resolution
              </h2>
              <p className="leading-relaxed mb-4">
                Any disputes arising from these terms shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
              <p className="leading-relaxed">
                You waive your right to participate in class action lawsuits against Emporva.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                12. Changes to Terms
              </h2>
              <p className="leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                13. Contact Information
              </h2>
              <p className="leading-relaxed mb-4">
                For questions about these Terms of Service, please contact:
              </p>
              <div className="bg-[#F9F9FB] rounded-lg p-6">
                <p className="mb-2"><strong>Email:</strong> legal@emporva.com</p>
                <p className="mb-2"><strong>Mail:</strong> Emporva Legal Department, [Address]</p>
                <p><strong>Phone:</strong> [Phone Number]</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}