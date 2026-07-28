import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = '404 - Page Not Found | Emporva';
  }, []);

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto mb-6 flex items-center justify-center bg-[#0B1F33]/10 rounded-full">
            <i className="ri-error-warning-line text-6xl text-[#0B1F33]"></i>
          </div>
          <h1 className="text-6xl md:text-8xl font-bold text-[#0B1F33] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            404
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-[#333645] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Page Not Found
          </h2>
          <p className="text-lg text-[#6B7C8F] mb-8" style={{ fontFamily: 'Inter, sans-serif' }}>
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-[#0B1F33] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#0B1F33]/90 transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Go to Homepage
          </button>
          <button
            onClick={() => navigate('/ai-intake')}
            className="bg-transparent border-2 border-[#0B1F33] text-[#0B1F33] px-8 py-3 rounded-lg font-semibold hover:bg-[#0B1F33] hover:text-white transition-all duration-200 whitespace-nowrap cursor-pointer"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Start a Project
          </button>
        </div>

        <div className="mt-12 pt-8 border-t border-[#6B7C8F]/20">
          <p className="text-sm text-[#6B7C8F] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            Need help? Here are some useful links:
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <button
              onClick={() => navigate('/how-it-works')}
              className="text-[#0B1F33] hover:text-[#D4B483] font-medium transition-colors cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              How It Works
            </button>
            <button
              onClick={() => navigate('/for-homeowners')}
              className="text-[#0B1F33] hover:text-[#D4B483] font-medium transition-colors cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              For Homeowners
            </button>
            <button
              onClick={() => navigate('/providers')}
              className="text-[#0B1F33] hover:text-[#D4B483] font-medium transition-colors cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Find Providers
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="text-[#0B1F33] hover:text-[#D4B483] font-medium transition-colors cursor-pointer"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              Blog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
