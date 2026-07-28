const steps = [
  {
    number: '01',
    icon: 'ri-chat-4-line',
    title: 'Describe Your Issue',
    description: 'Tell us what\'s wrong with your property in plain language—no technical jargon needed.',
    color: 'bg-[#0B1F33]'
  },
  {
    number: '02',
    icon: 'ri-brain-line',
    title: 'AI Diagnosis & Breakdown',
    description: 'Our patent-pending AI analyzes your issue, identifies root causes, and sequences the work needed.',
    color: 'bg-[#6B7C8F]'
  },
  {
    number: '03',
    icon: 'ri-team-line',
    title: 'Get Matched with Pros',
    description: 'We connect you with verified contractors who specialize in your specific needs.',
    color: 'bg-[#D4B483]'
  },
  {
    number: '04',
    icon: 'ri-checkbox-circle-line',
    title: 'Track & Complete',
    description: 'Monitor progress, communicate with your team, and get the job done right.',
    color: 'bg-[#0B1F33]'
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-[#F9F9FB]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B1F33] mb-3 sm:mb-4 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            How Emporva Works
          </h2>
          <p className="text-base sm:text-lg text-[#333645] max-w-2xl mx-auto px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            From problem to solution in four simple steps—powered by AI, guided by experts.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-12 sm:mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connector Line - Hidden on mobile */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#D4B483]/30 to-transparent"></div>
              )}
              
              <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10">
                {/* Step Number */}
                <div className="absolute -top-3 -left-3 sm:-top-4 sm:-left-4 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-[#0B1F33] rounded-full shadow-lg">
                  <span className="text-white font-bold text-base sm:text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div 
                  className="w-14 h-14 sm:w-16 sm:h-16 mb-4 sm:mb-6 flex items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${step.color}15` }}
                >
                  <i className={`${step.icon} text-2xl sm:text-3xl`} style={{ color: step.color }}></i>
                </div>

                {/* Content */}
                <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33] mb-3 sm:mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base text-[#333645] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-[#0B1F33] to-[#6B7C8F] rounded-2xl p-8 sm:p-12 shadow-xl">
          <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Ready to Get Started?
          </h3>
          <p className="text-white/90 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Join thousands of property owners who trust Emporva for their home improvement needs
          </p>
          <button className="px-8 sm:px-10 py-3 sm:py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-50 transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Start Your Project Now
          </button>
        </div>
      </div>
    </section>
  );
}