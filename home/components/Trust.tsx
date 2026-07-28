export default function Trust() {
  return (
    <section id="trust" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <div className="inline-block px-4 py-2 bg-[#D4B483]/10 rounded-full mb-6">
              <span className="text-[#D4B483] font-semibold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                PATENT-PENDING TECHNOLOGY
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-[#0B1F33] mb-6 leading-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Built on Intelligence You Can Trust
            </h2>
            <p className="text-lg text-[#333645] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Emporva combines practical homeowner knowledge with AI and your home's unique information to deliver guidance that's organized, personalized, and designed for real life.
            </p>
            <p className="text-lg text-[#333645] mb-8 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              As you build your home's digital memory, Emporva becomes a smarter, more valuable companion—helping you care for your home with confidence every step of the way.
            </p>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-[#0B1F33]/10 rounded-lg">
                  <i className="ri-shield-check-line text-2xl text-[#0B1F33]"></i>
                </div>
                <p className="text-sm font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Proactive Home Care
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-[#D4B483]/10 rounded-lg">
                  <i className="ri-lightbulb-line text-2xl text-[#D4B483]"></i>
                </div>
                <p className="text-sm font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Personalized AI Guidance
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center bg-[#6B7C8F]/10 rounded-lg">
                  <i className="ri-file-list-3-line text-2xl text-[#6B7C8F]"></i>
                </div>
                <p className="text-sm font-semibold text-[#333645]" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                  Your Home's Digital Memory
                </p>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img 
                src="https://readdy.ai/api/search-image?query=Professional%20contractor%20using%20tablet%20device%20with%20AI%20interface%20displaying%20property%20diagnostics%20and%20workflow%20sequences%20in%20modern%20clean%20workspace%20with%20tools%20and%20blueprints%20showing%20trust%20and%20technology%20integration%20in%20construction%20industry&width=800&height=900&seq=trust-img-001&orientation=portrait"
                alt="Trust and Technology"
                className="w-full h-full object-cover object-top"
              />
            </div>
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-6 border-2 border-[#D4B483]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#D4B483] rounded-lg">
                  <i className="ri-star-fill text-2xl text-white"></i>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>4.9/5</p>
                  <p className="text-sm text-[#333645]" style={{ fontFamily: 'Inter, sans-serif' }}>Customer Rating</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
