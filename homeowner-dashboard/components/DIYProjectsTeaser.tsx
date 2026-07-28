import { Link } from 'react-router-dom';

export default function DIYProjectsTeaser() {
  return (
    <div className="space-y-6">
      {/* Premium Feature Lock */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border-2 border-purple-200 overflow-hidden">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="ri-tools-line text-white text-4xl"></i>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#D4B483] to-[#c4a473] rounded-full mb-4">
            <i className="ri-vip-crown-line text-[#0B1F33] text-lg"></i>
            <span className="font-bold text-[#0B1F33] text-sm">Premium Feature</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">DIY Projects</h2>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto leading-relaxed">
            Plan and track DIY projects, estimate material costs, get AI-guided steps, and hand off to a pro when needed.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-6 text-left border border-purple-200">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-sparkling-line text-purple-600 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI-Powered Planning</h3>
              <p className="text-sm text-gray-700">
                Get step-by-step task lists, materials suggestions, complexity ratings, and time estimates powered by AI.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-left border border-purple-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-checkbox-circle-line text-blue-600 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Track Your Progress</h3>
              <p className="text-sm text-gray-700">
                Manage materials lists, check off tasks, track costs, and document your work with photos.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-left border border-purple-200">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-video-line text-teal-600 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Helpful Resources</h3>
              <p className="text-sm text-gray-700">
                Access curated video tutorials and articles that show you exactly how to complete similar projects.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 text-left border border-purple-200">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <i className="ri-user-star-line text-orange-600 text-2xl"></i>
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Easy Contractor Handoff</h3>
              <p className="text-sm text-gray-700">
                Stuck or need help? Connect to a professional contractor with one click and share all your project details.
              </p>
            </div>
          </div>

          {/* Example Projects Preview */}
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Example DIY Projects You Can Track</h3>
            <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {[
                { icon: 'ri-lightbulb-line', title: 'Smart Home Upgrades', color: 'bg-yellow-100 text-yellow-600' },
                { icon: 'ri-paint-brush-line', title: 'Interior Painting', color: 'bg-pink-100 text-pink-600' },
                { icon: 'ri-hammer-line', title: 'Minor Repairs', color: 'bg-blue-100 text-blue-600' },
                { icon: 'ri-plant-line', title: 'Outdoor Projects', color: 'bg-green-100 text-green-600' },
                { icon: 'ri-layout-line', title: 'Flooring Updates', color: 'bg-purple-100 text-purple-600' },
                { icon: 'ri-archive-line', title: 'Storage Solutions', color: 'bg-orange-100 text-orange-600' }
              ].map((project, idx) => (
                <div key={idx} className="bg-white rounded-lg p-4 border border-gray-200">
                  <div className={`w-10 h-10 ${project.color} rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                    <i className={`${project.icon} text-xl`}></i>
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{project.title}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Integration Benefits */}
          <div className="bg-white rounded-xl p-6 mb-8 max-w-3xl mx-auto border border-purple-200">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <i className="ri-star-line text-purple-600"></i>
              Integrated with Property Memory
            </h3>
            <p className="text-sm text-gray-700">
              Completed DIY projects are automatically saved to your Property Memory and can be included in your resale packet, 
              adding value when you sell your home.
            </p>
          </div>

          {/* CTA */}
          <Link
            to="/homeowner-plans"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-bold text-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg whitespace-nowrap"
          >
            <i className="ri-vip-crown-line text-xl"></i>
            Upgrade to Premium
          </Link>
          <p className="text-sm text-gray-600 mt-4">
            Unlock DIY Projects and all premium features
          </p>
        </div>
      </div>

      {/* What You'll Get */}
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">What You'll Get with Premium</h3>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[
            { icon: 'ri-tools-line', title: 'Unlimited DIY Projects', desc: 'Create and track as many projects as you need' },
            { icon: 'ri-sparkling-line', title: 'AI Project Planning', desc: 'Get intelligent suggestions for every project' },
            { icon: 'ri-money-dollar-circle-line', title: 'Cost Estimation', desc: 'Track materials and budget accurately' },
            { icon: 'ri-time-line', title: 'Time Estimates', desc: 'Know how long each project will take' },
            { icon: 'ri-video-line', title: 'Video Tutorials', desc: 'Access relevant how-to videos and guides' },
            { icon: 'ri-user-star-line', title: 'Pro Handoff', desc: 'Connect to contractors when you need help' },
            { icon: 'ri-history-line', title: 'Property History', desc: 'All projects saved to Property Memory' },
            { icon: 'ri-star-fill', title: 'Resale Value', desc: 'Mark important projects for resale packet' }
          ].map((feature, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className={`${feature.icon} text-purple-600 text-xl`}></i>
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-700">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
