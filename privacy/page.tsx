import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Privacy Policy
          </h1>
          <p className="text-[#333645] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Last Updated: January 2025
          </p>

          <div className="space-y-8 text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                1. Introduction
              </h2>
              <p className="leading-relaxed mb-4">
                Emporva ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform.
              </p>
              <p className="leading-relaxed">
                By using Emporva, you agree to the collection and use of information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                2. Information We Collect
              </h2>
              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Personal Information</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Name, email address, phone number</li>
                <li>Property address and location data</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Profile photos and verification documents (for contractors)</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Project Information</h3>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Photos and descriptions of property issues</li>
                <li>Project details, timelines, and documentation</li>
                <li>Messages and communications between users</li>
                <li>Reviews and ratings</li>
              </ul>

              <h3 className="text-xl font-semibold text-[#0B1F33] mb-3 mt-4">Technical Information</h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Device information and IP address</li>
                <li>Browser type and version</li>
                <li>Usage data and analytics</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                3. How We Use Your Information
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To process transactions and send notifications</li>
                <li>To match homeowners with qualified contractors</li>
                <li>To improve our AI diagnostic and workflow systems</li>
                <li>To communicate with you about your projects</li>
                <li>To detect and prevent fraud or abuse</li>
                <li>To comply with legal obligations</li>
                <li>To send marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                4. AI and Data Processing
              </h2>
              <p className="leading-relaxed mb-4">
                Emporva uses artificial intelligence to analyze property issues and generate diagnostic recommendations. When you submit photos or descriptions:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Your data is processed by our AI systems to provide diagnostics</li>
                <li>Anonymized project data may be used to improve our AI models</li>
                <li>We do not sell your personal data to third parties</li>
                <li>You retain ownership of all photos and content you upload</li>
              </ul>
              <p className="leading-relaxed">
                See our AI Use Disclosure for more details on how AI is used in our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                5. Information Sharing
              </h2>
              <p className="leading-relaxed mb-4">We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Contractors:</strong> When you request a quote, relevant project details are shared with matched contractors</li>
                <li><strong>Service Providers:</strong> Third-party vendors who help us operate our platform (payment processors, hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                6. Data Security
              </h2>
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                7. Your Rights
              </h2>
              <p className="leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access and receive a copy of your personal data</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your data (subject to legal obligations)</li>
                <li>Opt-out of marketing communications</li>
                <li>Withdraw consent for data processing</li>
                <li>File a complaint with a data protection authority</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                8. Cookies and Tracking
              </h2>
              <p className="leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience, analyze usage, and deliver personalized content. You can control cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                9. Children's Privacy
              </h2>
              <p className="leading-relaxed">
                Emporva is not intended for users under 18 years of age. We do not knowingly collect personal information from children.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                10. Changes to This Policy
              </h2>
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                11. Contact Us
              </h2>
              <p className="leading-relaxed mb-4">
                If you have questions about this Privacy Policy or wish to exercise your rights, please contact us:
              </p>
              <div className="bg-[#F9F9FB] rounded-lg p-6">
                <p className="mb-2"><strong>Email:</strong> privacy@emporva.com</p>
                <p className="mb-2"><strong>Mail:</strong> Emporva Privacy Team, [Address]</p>
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