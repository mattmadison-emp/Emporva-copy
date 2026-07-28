import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

export default function AIDisclosure() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      <div className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            AI Use Disclosure & Guidance Limits
          </h1>
          <p className="text-[#333645] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Last Updated: January 2025
          </p>

          <div className="space-y-8 text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                1. How Emporva Uses AI
              </h2>
              <p className="leading-relaxed mb-4">
                Emporva uses artificial intelligence to help homeowners and contractors understand property issues and plan projects more effectively. Our AI systems analyze photos, descriptions, and historical data to provide diagnostic insights and workflow recommendations.
              </p>
              <p className="leading-relaxed font-semibold">
                Important: AI is a tool to assist decision-making, not a replacement for professional expertise.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                2. What Our AI Does
              </h2>
              <div className="bg-white rounded-xl shadow-sm p-8">
                <h3 className="text-2xl font-bold text-[#0B1F33] mb-6">What Our AI Does</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Issue Analysis:</strong> Examines photos and descriptions to identify potential problems</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Workflow Generation:</strong> Suggests logical sequences for repair and improvement projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Contractor Matching:</strong> Connects homeowners with qualified professionals based on project needs</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Cost Estimation:</strong> Provides rough budget ranges based on similar projects</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-checkbox-circle-fill text-[#D4B483] text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Documentation:</strong> Organizes project information and tracks progress</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                3. What Our AI Does NOT Do
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6 mb-4">
                <h3 className="text-xl font-semibold text-red-900 mb-3">Critical Limitations:</h3>
                <ul className="space-y-2 text-red-900">
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-fill text-red-500 text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Not a Licensed Professional:</strong> AI cannot replace licensed contractors, engineers, or inspectors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-fill text-red-500 text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Not a Guarantee:</strong> AI diagnostics are educated guesses, not definitive answers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-fill text-red-500 text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Not a Safety Inspector:</strong> AI cannot assess structural integrity or immediate safety hazards</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-fill text-red-500 text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Not a Legal Authority:</strong> AI recommendations do not constitute professional advice or code compliance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <i className="ri-close-circle-fill text-red-500 text-lg flex-shrink-0 mt-1"></i>
                    <span><strong>Not Infallible:</strong> AI can make mistakes, especially with complex or unusual situations</span>
                  </li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                4. How AI Learns and Improves
              </h2>
              <p className="leading-relaxed mb-4">
                Our AI systems improve over time by learning from:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Completed projects and their outcomes</li>
                <li>Contractor feedback and corrections</li>
                <li>Homeowner satisfaction ratings</li>
                <li>Industry best practices and building codes</li>
              </ul>
              <p className="leading-relaxed">
                All learning data is anonymized and aggregated. We never share individual project details without permission.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                5. When to Trust AI vs. When to Get Professional Help
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-900 mb-3 flex items-center gap-2">
                    <i className="ri-thumb-up-line text-green-600"></i>
                    Good Uses of AI Guidance
                  </h3>
                  <ul className="space-y-2 text-green-900 text-sm">
                    <li>• Getting a general sense of what might be wrong</li>
                    <li>• Understanding typical project sequences</li>
                    <li>• Preparing questions for contractors</li>
                    <li>• Rough budget planning</li>
                    <li>• Organizing project documentation</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3 flex items-center gap-2">
                    <i className="ri-alert-line text-orange-600"></i>
                    Always Consult a Professional
                  </h3>
                  <ul className="space-y-2 text-orange-900 text-sm">
                    <li>• Structural issues or foundation problems</li>
                    <li>• Electrical or gas system concerns</li>
                    <li>• Water damage or mold</li>
                    <li>• Roof or major system failures</li>
                    <li>• Anything affecting safety or code compliance</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                6. Accuracy and Reliability
              </h2>
              <p className="leading-relaxed mb-4">
                While we strive for accuracy, AI diagnostics should be considered preliminary guidance only:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>AI accuracy improves with clear photos and detailed descriptions</li>
                <li>Complex or unusual issues may require in-person assessment</li>
                <li>Local building codes and conditions vary—always verify with local professionals</li>
                <li>AI cannot detect hidden problems not visible in photos</li>
              </ul>
              <p className="leading-relaxed font-semibold">
                Contractors should always verify AI recommendations before beginning work.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                7. Liability and Disclaimers
              </h2>
              <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-6">
                <p className="leading-relaxed mb-4 font-semibold">
                  Emporva is not liable for:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Decisions made based on AI recommendations</li>
                  <li>Inaccuracies in AI diagnostics or cost estimates</li>
                  <li>Work performed by contractors, even if matched through our platform</li>
                  <li>Damages resulting from following AI guidance without professional verification</li>
                </ul>
                <p className="leading-relaxed mt-4">
                  By using Emporva's AI features, you acknowledge that you understand these limitations and will seek appropriate professional advice for your specific situation.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                8. For Contractors: Using AI Responsibly
              </h2>
              <p className="leading-relaxed mb-4">
                Contractors using Emporva should:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Treat AI diagnostics as a starting point, not a final answer</li>
                <li>Conduct your own thorough assessment before quoting or starting work</li>
                <li>Correct any AI errors you identify to help improve the system</li>
                <li>Never rely solely on AI for safety-critical decisions</li>
                <li>Communicate clearly with homeowners about what you've verified vs. what AI suggested</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                9. Transparency and Control
              </h2>
              <p className="leading-relaxed mb-4">
                You have control over how your data is used:
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>You can opt out of having your project data used to train AI models</li>
                <li>You can request to see what data was used to generate recommendations</li>
                <li>You can report AI errors or concerns to help us improve</li>
                <li>You can delete your project data at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                10. Emergency Situations
              </h2>
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-6">
                <p className="leading-relaxed font-semibold text-red-900 mb-4">
                  ⚠️ DO NOT rely on AI for emergencies:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-red-900">
                  <li>Gas leaks: Call your gas company immediately</li>
                  <li>Electrical fires or sparking: Call 911</li>
                  <li>Major water leaks: Shut off water and call a plumber</li>
                  <li>Structural collapse: Evacuate and call 911</li>
                  <li>Carbon monoxide alarms: Evacuate and call 911</li>
                </ul>
                <p className="leading-relaxed mt-4 text-red-900">
                  Emporva is for planning and coordination, not emergency response.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                11. Questions or Concerns
              </h2>
              <p className="leading-relaxed mb-4">
                If you have questions about how AI is used on Emporva, or if you believe AI provided incorrect or dangerous guidance, please contact us immediately:
              </p>
              <div className="bg-[#F9F9FB] rounded-lg p-6">
                <p className="mb-2"><strong>Email:</strong> ai-safety@emporva.com</p>
                <p className="mb-2"><strong>Phone:</strong> [Phone Number]</p>
                <p><strong>Report an Issue:</strong> Use the "Report AI Error" button in your dashboard</p>
              </div>
            </section>

            <section className="bg-[#0B1F33]/5 rounded-lg p-8 mt-8">
              <h2 className="text-2xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Our Commitment
              </h2>
              <p className="leading-relaxed">
                Emporva is committed to using AI responsibly and transparently. We continuously work to improve accuracy, reduce errors, and ensure our AI serves as a helpful tool—never a replacement for human expertise and judgment.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}