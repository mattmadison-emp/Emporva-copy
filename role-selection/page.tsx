import { useNavigate } from 'react-router-dom';

export default function RoleSelection() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            How will you use Emporva?
          </h1>
          <p className="text-lg text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            Choose your role to get started with the right tools
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Property Owner Card */}
          <button
            onClick={() => navigate('/enroll-homeowner')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 text-left group"
          >
            <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D4B483]/20 transition-colors">
              <i className="ri-home-4-line text-4xl text-[#D4B483]"></i>
            </div>

            <h2 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Property Owner
            </h2>

            <p className="text-[#6B7C8F] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Understand your home, organize maintenance, plan renovations, and coordinate projects with clarity.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>AI-powered issue diagnosis</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Property command center</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Shared project coordination</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Maintenance tracking</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#D4B483] font-semibold group-hover:gap-3 transition-all">
              <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Get Started</span>
              <i className="ri-arrow-right-line"></i>
            </div>
          </button>

          {/* Multi-Unit Owner Card - commented out for now
          <button
            onClick={() => navigate('/enroll-multi-unit')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 text-left group border-2 border-[#D4B483]"
          >
            <div className="w-16 h-16 bg-[#D4B483]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#D4B483]/20 transition-colors">
              <i className="ri-building-line text-4xl text-[#D4B483]"></i>
            </div>

            <h2 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Multi-Unit Owner
            </h2>

            <p className="text-[#6B7C8F] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage multiple properties and units with portfolio-level insights, preventive maintenance at scale, and centralized coordination.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Portfolio command center</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Unit-level tracking</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Preventive maintenance at scale</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#D4B483]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Portfolio analytics</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#D4B483] font-semibold group-hover:gap-3 transition-all">
              <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Get Started</span>
              <i className="ri-arrow-right-line"></i>
            </div>
          </button>
          */}

          {/* Contractor Card */}
          <button
            onClick={() => navigate('/enroll-contractor')}
            className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-all hover:scale-105 text-left group"
          >
            <div className="w-16 h-16 bg-[#0B1F33]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#0B1F33]/20 transition-colors">
              <i className="ri-tools-line text-4xl text-[#0B1F33]"></i>
            </div>
            
            <h2 className="text-2xl font-bold text-[#0B1F33] mb-3" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Contractor
            </h2>
            
            <p className="text-[#6B7C8F] mb-6 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
              Receive scoped jobs, coordinate with homeowners, manage your business, and grow with clarity.
            </p>

            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#0B1F33]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Pre-scoped, ready-to-run jobs</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#0B1F33]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Shared job rooms</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#0B1F33]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Lead import and AI scoping</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#333645]">
                <i className="ri-check-line text-[#0B1F33]"></i>
                <span style={{ fontFamily: 'Inter, sans-serif' }}>Business management tools</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[#0B1F33] font-semibold group-hover:gap-3 transition-all">
              <span style={{ fontFamily: 'Montserrat, sans-serif' }}>Get Started</span>
              <i className="ri-arrow-right-line"></i>
            </div>
          </button>
        </div>

        <p className="text-center text-sm text-[#6B7C8F] mt-8" style={{ fontFamily: 'Inter, sans-serif' }}>
          You can always change or add roles later in your account settings
        </p>
      </div>
    </div>
  );
}
