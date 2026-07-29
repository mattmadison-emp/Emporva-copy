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
            Last Updated: July 2026
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
                Emporva is an AI-powered homeowner platform designed to help users organize, understand, and manage their homes. The platform provides tools and resources that may include AI-powered guidance, property organization, document storage, maintenance tracking, project planning, educational content, and other homeowner-focused features.
              </p>
              <p className="leading-relaxed">
                <strong>Important:</strong> Emporva is intended to assist homeowners in making informed decisions about their property. Information provided through the platform is for general informational purposes only and should not be considered professional, legal, financial, engineering, or licensed contractor advice. Users are responsible for evaluating recommendations and determining the most appropriate course of action for their specific circumstances.
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
                <li>Provide accurate information.</li>
                <li>Keep your account information up to date.</li>
                <li>Protect your password.</li>
                <li>Notify us immediately of any unauthorized use of your account.</li>
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
                6. Subscriptions and Payments
              </h2>
              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">For Homeowners</h3>
              <p className="leading-relaxed mb-4">
                Certain features may require a paid subscription.
              </p>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">For Contractors</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>FSubscription pricing, billing terms, renewal policies, and cancellation procedures will be presented at the time of purchase.</li>
                <li>Unless otherwise stated, subscriptions automatically renew until canceled.</li>
                <li>Failure to pay applicable fees may result in suspension or termination of premium features.</li>
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
                Emporva uses artificial intelligence to provide homeowner guidance and educational information. While we strive to provide helpful and accurate responses, AI-generated content may be incomplete, inaccurate, or outdated.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>AI responses are provided for informational purposes only.</li>
                <li>AI recommendations should not replace professional judgment.</li>
                <li>We are not liable for decisions made based on AI recommendations</li>
                <li>You are solely responsible for decisions made based on information provided by the Platform./li>
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
                The Emporva Platform, including its software, design, branding, graphics, text, logos, AI workflows, and proprietary technology, is owned by Emporva or its licensors and is protected by applicable intellectual property laws.
              </p>
              <p className="leading-relaxed">
                You may not copy, reproduce, distribute, modify, or create derivative works without prior written permission.
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
                To the maximum extent permitted by law, Emporva, its owners, employees, affiliates, partners, and licensors shall not be liable for any indirect, incidental, consequential, special, exemplary, or punitive damages arising out of or relating to your use of the Platform.
              </p>
              <p className="leading-relaxed">
                Our total liability for any claim shall not exceed the amount you paid to Emporva during the twelve (12) months preceding the claim, or $100 if no payment has been made.
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
                13. Termination
              </h2>
              <p className="leading-relaxed">
                You may stop using Emporva at any time. We reserve the right to suspend or terminate access if these Terms are violated or if continued access could harm the Platform or its user
              </p>
            </section>
              
            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                14. Contact Information
              </h2>
              <p className="leading-relaxed mb-4">
                For questions about these Terms of Service, please contact:
              </p>
              <div className="bg-[#F9F9FB] rounded-lg p-6">
                <p className="mb-2"><strong>Email:</strong> support@emporva.com</p>
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
