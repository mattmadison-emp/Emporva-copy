import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useRoleRoutes } from '../../../hooks/useRoleRoutes';
import { useFaqList } from '../../../hooks/useStoryblok';
import { faqContentToSections } from '../../../components/base/FaqSection';

const HomeownerAccountHelp: React.FC = () => {
  const routes = useRoleRoutes();
  const { data: faqStory } = useFaqList('homeowner-help');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const categories = [
    { icon: 'ri-rocket-line', name: 'Getting Started', count: 12 },
    { icon: 'ri-tools-line', name: 'Projects & Jobs', count: 18 },
    { icon: 'ri-bank-card-line', name: 'Billing & Plans', count: 8 },
    { icon: 'ri-home-4-line', name: 'Property Management', count: 15 },
    { icon: 'ri-message-3-line', name: 'Messaging', count: 10 },
    { icon: 'ri-shield-check-line', name: 'Safety & Security', count: 7 }
  ];

  const fallbackFaqSections = [
    {
      section: 'Account & Plans',
      items: [
        {
          question: 'What is the difference between the Core and Premium plans?',
          answer: `The Core plan is free and includes basic job posting, messaging with contractors, and access to your Property Overview dashboard with system registry and task tracking. Premium ($12/month) adds AI-powered predictive maintenance, Property Memory with full document vault, DIY project guides, renovation visualization tools, utility insights, and dedicated support with faster response times. You can compare all features side-by-side on the Plans page.`
        },
        {
          question: 'How do I upgrade from Core to Premium?',
          answer: `Go to Billing & Plans from your account menu (top-right avatar), then click "Upgrade to Premium." You will see the full pricing and a feature comparison. Your upgrade takes effect immediately. All your existing property data, jobs, and documents carry over seamlessly.`
        },
        {
          question: 'Can I cancel my Premium subscription at any time?',
          answer: `Absolutely. You can cancel anytime from the Billing & Plans page. Your Premium access continues until the end of your current billing period. After cancellation, your account automatically reverts to the free Core plan.`
        },
        {
          question: 'How do I update my personal information?',
          answer: `Click your profile avatar in the top-right corner and select "Profile." From there you can update your name, email, phone number, and mailing address. You can also upload a profile photo. Changes save immediately — just click "Save Changes" at the bottom of the page.`
        },
        {
          question: 'How do I change my password?',
          answer: `Go to Settings from your account menu. Under the Security section, click "Change Password." You will need to enter your current password, then create and confirm your new password. For your security, passwords must be at least 8 characters and include a mix of letters, numbers, and symbols.`
        },
        {
          question: 'How do notifications work?',
          answer: `Your notification bell in the top navigation shows all alerts in real time — new contractor messages, job status updates, upcoming maintenance reminders, and system alerts. Red badge counts show unread items. You can customize which notifications you receive by going to Settings > Notifications and toggling each category on or off.`
        },
        {
          question: 'Can I share my dashboard with a spouse or family member?',
          answer: `Currently each account is designed for a single user. We are actively building a household sharing feature that will let you invite family members to view and manage your property, each with their own login and permission level. This is planned for a future release. In the meantime, you can export your property information as a PDF from the Property Overview page to share.`
        }
      ]
    },
    {
      section: 'Property Overview',
      items: [
        {
          question: 'What information does the Property Overview show me?',
          answer: `The Overview tab is your command center. The Summary view shows your property stats (square footage, year built, systems count, upcoming tasks), an AI-powered health diagnosis, and recent activity on your home. The Gallery tab shows all your property photos organized by room.`
        },
        {
          question: 'How does the AI property diagnosis work?',
          answer: `Our AI analyzes your property's age, location, system registry, maintenance history, and utility patterns to generate a real-time health score and diagnosis. It flags systems nearing end-of-life, identifies energy efficiency gaps, and surfaces potential issues before they become emergencies. The more data you add (systems, maintenance records, utility bills), the more accurate and personalized the diagnosis becomes.`
        },
        {
          question: 'How do I edit my property\'s details?',
          answer: `From the Overview tab, click the "Edit Property" button. A modal opens where you can update the property type, year built, square footage, number of bedrooms and bathrooms, lot size, and number of stories. Changes save immediately and are reflected across all dashboard tabs.`
        }
      ]
    },
    {
      section: 'Property Memory',
      items: [
        {
          question: 'What is Property Memory and why should I use it?',
          answer: `Property Memory is a complete digital record of everything that has ever been done to your home — repairs, renovations, installations, inspections, and maintenance. Think of it as your home's permanent medical record. It logs every contractor visit, stores all documents and photos, and creates a searchable timeline. When you eventually sell your home, having a complete Property Memory can significantly increase buyer confidence and your home's value.`
        },
        {
          question: 'What types of documents should I upload to the Document Vault?',
          answer: `We recommend uploading: property deed and title documents, home insurance policies, tax assessments, inspection reports (roof, foundation, pest, HVAC), warranties for all appliances and systems, permits from past renovations, HOA documents and bylaws, purchase and closing documents, appliance manuals, and any insurance claims history. The vault organizes everything by category so you can find what you need instantly.`
        },
        {
          question: 'How does Property Memory help when selling my home?',
          answer: `A complete Property Memory gives buyers confidence that the home has been well-maintained. You can generate a "Home History Report" that shows every system replaced, every repair documented, and every regular maintenance performed — with dates, receipts, and contractor information. This transparency often translates to higher offers, faster sales, and fewer negotiation issues during inspection.`
        },
        {
          question: 'How do I upload documents to the Document Vault?',
          answer: `Open the Property Memory tab and switch to "Document Vault." You will see category cards for Warranties, Inspections, Tax & Assessments, Insurance, Permits, Appraisals, HOA, Purchase Docs, Manuals, and Other. Click any card to upload directly to that category. You can also use the "Upload" button at the top to add documents with a name, category, and optional notes.`
        },
        {
          question: 'Can I search through my documents?',
          answer: `Yes. The Document Vault has a search bar at the top that searches across all document names and notes. You can also filter by category using the filter bar. This makes it easy to find a specific warranty, inspection report, or insurance document without digging through physical files.`
        },
        {
          question: 'Is my Property Memory data backed up and secure?',
          answer: `Yes. All Property Memory data is stored securely in the cloud with encryption at rest and in transit. Your documents, photos, and records are backed up across multiple data centers.`
        }
      ]
    },
    {
      section: 'Systems & Appliances',
      items: [
        {
          question: 'How do I add my home\'s systems and appliances?',
          answer: `Go to the Systems & Appliances tab in your dashboard and click "Add System." Enter the system name, category (HVAC, plumbing, electrical, roofing, appliances, etc.), brand, model number, installation date, and warranty expiration. You can also add the installing contractor's information and upload the warranty document. Each system is tracked independently for maintenance scheduling and predictive lifespan analysis.`
        },
        {
          question: 'What is Predictive Maintenance and how accurate is it?',
          answer: `Predictive Maintenance (Premium feature) uses AI to analyze your home's age, system types, brand reliability data, local climate, usage patterns, maintenance history, and warranty coverage to predict when each major system is likely to need service or replacement. It is typically 85-90% accurate for major systems like HVAC, roofing, and water heaters. This helps you budget for future replacements and schedule proactive maintenance before failures occur.`
        },
        {
          question: 'How do I track warranties for my appliances and systems?',
          answer: `When you add a system to your registry, enter the warranty expiration date and upload the warranty document. The system automatically tracks warranty status — you will see "Active" badges for systems still under warranty and "Expired" warnings for those no longer covered. You will receive a notification 90 days and 30 days before a warranty expires so you can schedule a final covered service if needed.`
        },
        {
          question: 'What do the system health statuses mean?',
          answer: `Each system is assigned one of three statuses based on age, maintenance history, and condition reports: "Good" (green) means the system is within its expected lifespan and has a clean maintenance record. "Needs Attention" (amber) means the system is approaching end-of-life, has missed recent maintenance, or shows early warning signs. "Critical" (red) means the system is past its expected lifespan, has a history of issues, or has been flagged for immediate attention.`
        },
        {
          question: 'Can I add custom systems not in the default categories?',
          answer: `Yes. When adding a system, the category dropdown includes the main categories (HVAC, plumbing, electrical, roofing, exterior, appliances, security) but you can also choose "Other" and type in a custom category name. Examples might include: irrigation system, pool equipment, generator, solar panels, or elevator.`
        },
        {
          question: 'How does the system timeline help with budgeting?',
          answer: `The Systems & Appliances view (Premium) includes a timeline showing when each major system is projected to need replacement, along with estimated costs based on average pricing in your area. This lets you plan capital expenses years in advance — for example, if your HVAC has 3 years of expected life remaining and a replacement costs roughly $8,000 in your area, you can start setting aside about $220 per month now.`
        }
      ]
    },
    {
      section: 'Utilities & Insights',
      items: [
        {
          question: 'How do I track my utility usage?',
          answer: `The Utilities tab lets you log your monthly electricity, gas, water, and other utility bills. Enter the billing period, usage amount (kWh, therms, gallons), and total cost. Over time, the system builds a usage history that you can view as charts — monthly trends, year-over-year comparisons, and seasonal patterns. This makes it easy to spot unusual spikes that might indicate a problem.`
        },
        {
          question: 'What do Utility Insights (Premium) show me?',
          answer: `Utility Insights takes your logged utility data and runs an AI analysis to identify patterns, inefficiencies, and savings opportunities. It compares your usage to similar homes in your climate zone, flags months with unusually high consumption, estimates the impact of specific upgrades (e.g., adding insulation, replacing windows), and projects your annual energy costs. You will get actionable recommendations like "Your water usage in July was 40% above your neighborhood average — consider checking for leaks or irrigation inefficiency."`
        },
        {
          question: 'Can I track solar panel production?',
          answer: `If your home has solar panels, you can log your monthly solar production (kWh generated) in the Utilities tab. The system tracks both production and grid consumption side-by-side, showing your net energy usage and the financial value of your solar generation. This is especially useful for understanding your true energy costs and payback period.`
        },
        {
          question: 'How do I manually enter utility bills?',
          answer: `In the Utilities tab, click "Add Entry." Select the utility type (electric, gas, water, trash, internet, or custom), enter the billing period dates, usage amount and unit, total cost, and any notes. You can also upload a photo or PDF of the bill for your records. For recurring bills, check the "Recurring" option to set up a monthly reminder.`
        },
        {
          question: 'How far back should I log utility data?',
          answer: `The more data, the better the insights. We recommend entering at least 12 months of history for meaningful year-over-year comparisons. If you have older bills available, entering 24-36 months of data gives the AI a much richer dataset for pattern detection and seasonal analysis. You can enter past bills manually or upload PDFs for your records.`
        }
      ]
    },
    {
      section: 'Premium Features',
      items: [
        {
          question: 'How does Renovation Preview work?',
          answer: `Renovation Preview (Premium) lets you visualize potential renovations before committing to them. Upload a photo of the space you want to renovate, select the type of renovation (kitchen, bathroom, exterior, flooring, paint), and describe what you want to change. Our AI generates a realistic preview of the finished result. You can compare multiple design options side-by-side and share them with contractors for more accurate quoting.`
        },
        {
          question: 'What kind of DIY project guides are available?',
          answer: `The DIY Projects tab (Premium) includes step-by-step guides for common home improvement projects that most homeowners can tackle themselves. Categories include painting, basic plumbing fixes, electrical safety and simple replacements, drywall repair, flooring installation, weatherproofing, landscaping basics, and smart home installations. Each guide includes estimated time, required tools list, material costs, and safety precautions.`
        },
        {
          question: 'How does Utility Insights save me money?',
          answer: `Utility Insights (Premium) runs an AI analysis on your logged utility bills and compares your consumption to similar homes in your climate zone and to your own historical patterns. It identifies months where usage spiked unusually, estimates the cost impact of specific efficiency upgrades, and projects your future bills. Many homeowners discover issues like HVAC inefficiency, water leaks, or poor insulation through these insights — catching these early can save hundreds or thousands of dollars.`
        },
        {
          question: 'Are the DIY guides safe for a complete beginner?',
          answer: `Each guide is explicit about when you should hire a professional instead — for example, electrical work beyond replacing a light fixture or outlet is clearly marked as "Hire a Pro." Safety warnings are prominently displayed at the top of every guide. When in doubt, the guide will always recommend consulting a licensed professional.`
        }
      ]
    },
    {
      section: 'Maintenance & Tasks',
      items: [
        {
          question: 'How does seasonal maintenance tracking work?',
          answer: `The Seasonal Tasks tab shows a month-by-month checklist of recommended maintenance for your home, customized to your climate zone and property type. Tasks are organized by season — spring (AC tune-up, gutter cleaning), summer (deck sealing, pest inspection), fall (furnace check, chimney sweep), winter (pipe insulation, ice dam prevention). Each task has a recommended timeframe, difficulty level, and estimated cost. Check off tasks as you complete them to build your maintenance history.`
        },
        {
          question: 'What is the Task Board and how do I use it?',
          answer: `The Task Board is a Kanban-style view for managing all your home projects and to-dos. Tasks are organized into columns: To Do, In Progress, and Done. Each task card shows the task name, due date, priority level, and assigned category. Drag cards between columns as work progresses. This works great for managing multiple home projects simultaneously — from a bathroom remodel to simple touch-up painting.`
        },
        {
          question: 'Can I export my maintenance checklist?',
          answer: `Yes. From the Seasonal Tasks tab, click the "Export" button to download your current checklist as a PDF. This is useful for sharing with a spouse, property manager, or new homeowner if you sell. The PDF includes task names, recommended months, completion status, and any notes you have added.`
        },
        {
          question: 'How do I mark a task as complete?',
          answer: `Click the checkbox next to any task in the Seasonal Tasks list or on the Task Board. Completed tasks move to the "Done" column on the Task Board and show a strikethrough with a completion date on the Seasonal Tasks view. Completed tasks are automatically recorded in your Property Memory Work History.`
        },
        {
          question: 'What if I miss a seasonal task?',
          answer: `No problem — overdue tasks remain visible in your list with an "Overdue" label so you do not lose track of them. You can still complete them and check them off. The system will not penalize you, but your maintenance score will reflect overdue items until they are completed. The goal is to keep you informed, not stressed.`
        }
      ]
    }
  ];

  const sbSections = faqContentToSections(faqStory?.content);
  const faqSections = sbSections.length ? sbSections : fallbackFaqSections;

  const query = searchQuery.trim().toLowerCase();
  const filteredSections = faqSections
    .map((section) => ({
      ...section,
      items: query
        ? section.items.filter(
            (faq) =>
              faq.question.toLowerCase().includes(query) ||
              faq.answer.toLowerCase().includes(query)
          )
        : section.items
    }))
    .filter((section) => section.items.length > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    setFormData({ subject: '', message: '' });
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to={routes.dashboard} 
                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <i className="ri-arrow-left-line text-xl"></i>
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <i className="ri-time-line"></i>
                <span>Avg. response: 2 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Help &amp; Support</h1>
          <p className="text-slate-600">Find answers, get help, and learn how to make the most of Emporva</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-2xl">
            <i className="ri-search-line absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400"></i>
            <input
              type="text"
              placeholder="Search help articles, FAQs, and guides..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Help Categories */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <button
                key={index}
                className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl hover:border-teal-500 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 flex items-center justify-center bg-teal-50 rounded-lg group-hover:bg-teal-100 transition-colors">
                  <i className={`${category.icon} text-2xl text-teal-600`}></i>
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-slate-900 mb-1">{category.name}</div>
                  <div className="text-sm text-slate-500">{category.count} articles</div>
                </div>
                <i className="ri-arrow-right-line text-xl text-slate-400 group-hover:text-teal-600 transition-colors"></i>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* FAQ Section */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-lg">
                  <i className="ri-question-line text-xl text-teal-600"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h2>
              </div>

              {filteredSections.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <i className="ri-search-line text-3xl mb-2 block"></i>
                  No FAQs match &ldquo;{searchQuery}&rdquo;. Try a different search or contact support below.
                </div>
              ) : (
                <div className="space-y-8">
                  {filteredSections.map((section, si) => (
                    <div key={section.section}>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-3">
                        {section.section}
                      </h3>
                      <div className="space-y-3">
                        {section.items.map((faq, ii) => {
                          const key = `${si}-${ii}`;
                          return (
                            <div key={key} className="border border-slate-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => setExpandedFaq(expandedFaq === key ? null : key)}
                                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
                              >
                                <span className="font-medium text-slate-900 pr-4">{faq.question}</span>
                                <i className={`ri-arrow-${expandedFaq === key ? 'up' : 'down'}-s-line text-xl text-slate-400 flex-shrink-0`}></i>
                              </button>
                              {expandedFaq === key && (
                                <div className="px-4 pb-4 pt-2 text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line">
                                  {faq.answer}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-lg">
                  <i className="ri-mail-line text-xl text-teal-600"></i>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Contact Support</h2>
              </div>

              {showSuccess && (
                <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-lg flex items-start gap-3">
                  <i className="ri-checkbox-circle-fill text-xl text-teal-600 flex-shrink-0 mt-0.5"></i>
                  <div>
                    <div className="font-semibold text-teal-900 mb-1">Message Sent Successfully!</div>
                    <div className="text-sm text-teal-700">Our support team will respond within 2-4 hours during business hours.</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select a subject...</option>
                    <option value="account">Account &amp; Billing</option>
                    <option value="project">Project &amp; Jobs</option>
                    <option value="contractor">Contractor Issues</option>
                    <option value="technical">Technical Support</option>
                    <option value="feature">Feature Request</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                    maxLength={500}
                    placeholder="Describe your issue or question in detail..."
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                  ></textarea>
                  <div className="text-sm text-slate-500 mt-2">
                    {formData.message.length}/500 characters
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors whitespace-nowrap"
                >
                  Send Message
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-lg flex-shrink-0">
                    <i className="ri-mail-line text-xl text-teal-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Email Support</div>
                    <a href="mailto:support@emporva.com" className="text-sm text-teal-600 hover:text-teal-700">
                      support@emporva.com
                    </a>
                    <div className="text-xs text-slate-500 mt-1">Response in 2-4 hours</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-lg flex-shrink-0">
                    <i className="ri-phone-line text-xl text-teal-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Phone Support</div>
                    <a href="tel:1-800-EMPORVA" className="text-sm text-teal-600 hover:text-teal-700">
                      1-800-EMPORVA
                    </a>
                    <div className="text-xs text-slate-500 mt-1">Mon-Fri, 8am-8pm EST</div>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-teal-50 rounded-lg flex-shrink-0">
                    <i className="ri-chat-3-line text-xl text-teal-600"></i>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-700 mb-1">Live Chat</div>
                    <button className="text-sm text-teal-600 hover:text-teal-700">
                      Start a conversation
                    </button>
                    <div className="text-xs text-slate-500 mt-1">Available now</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to={routes.profile}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <i className="ri-user-line text-lg text-slate-600 group-hover:text-teal-600"></i>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Edit Profile</span>
                </Link>
                <Link
                  to={routes.billing}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <i className="ri-bank-card-line text-lg text-slate-600 group-hover:text-teal-600"></i>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Billing &amp; Plans</span>
                </Link>
                <Link
                  to={routes.settings}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors group"
                >
                  <i className="ri-settings-3-line text-lg text-slate-600 group-hover:text-teal-600"></i>
                  <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Settings</span>
                </Link>
              </div>
            </div>

            {/* Support Hours */}
            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <i className="ri-time-line text-xl text-teal-600"></i>
                <h3 className="font-bold text-slate-900">Support Hours</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Monday - Friday</span>
                  <span className="font-medium text-slate-900">8am - 8pm EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Saturday</span>
                  <span className="font-medium text-slate-900">10am - 6pm EST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Sunday</span>
                  <span className="font-medium text-slate-900">Closed</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-teal-200">
                <div className="flex items-center gap-2 text-sm text-teal-700">
                  <div className="w-2 h-2 bg-teal-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">Support team is online</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeownerAccountHelp;