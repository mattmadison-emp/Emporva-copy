import InputWidget from './InputWidget';

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" aria-label="Hero section">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://readdy.ai/api/search-image?query=Modern%20minimalist%20architectural%20interior%20with%20clean%20lines%20and%20natural%20lighting%20showcasing%20professional%20home%20renovation%20and%20construction%20quality%20with%20subtle%20warm%20tones%20and%20sophisticated%20design%20elements%20creating%20sense%20of%20trust%20and%20innovation&width=1920&height=1080&seq=hero-bg-001&orientation=landscape"
          alt="Modern home interior showcasing professional renovation quality - Emporva AI property services"
          title="Professional Home Renovation Services by Emporva"
          className="w-full h-full object-cover object-top"
          loading="eager"
          width="1920"
          height="1080"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/40"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-20 text-center w-full">
        
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
          The AI-Powered Homeowner Platform
        </h2>

        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
          Emporva helps you organize your home, understand your systems, plan projects, and stay ahead of maintenance—all in one place. Ask questions, upload documents, and build a living record of your home.
        </p>

        {/* Input Widget */}
        <InputWidget />

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 text-white/80">
          <div className="flex items-center gap-2">
            <i className="ri-shield-check-line text-[#D4B483] text-xl" aria-hidden="true"></i>
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Proactive Home Care</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-lightbulb-line text-[#D4B483] text-xl" aria-hidden="true"></i>
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Personalized AI Guidance</span>
          </div>
          <div className="flex items-center gap-2">
            <i className="ri-file-list-3-line text-[#D4B483] text-xl" aria-hidden="true"></i>
            <span className="text-sm font-medium" style={{ fontFamily: 'Inter, sans-serif' }}>Your Home's Digital Memory</span>
          </div>
        </div>
      </div>
    </section>
  );
}
