
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-[#0B1F33] text-white py-12 sm:py-16 px-4 sm:px-6" role="contentinfo">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Company */}
          <nav aria-label="Company links">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-accent-sand" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <a href="/about" className="hover:text-white transition-colors">Company</a>
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/about" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/csr" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Giving Back
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Services
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Blog
                </Link>
              </li>
              {/* <li>
                <Link to="/locations" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Service Areas
                </Link>
              </li> */}
            </ul>
          </nav>

          {/* For Users */}
          <nav aria-label="User solutions">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-accent-sand" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <a href="/for-homeowners" className="hover:text-white transition-colors">For Users</a>
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/for-homeowners" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Homeowners
                </Link>
              </li>
              <li>
                <Link to="/early-access-contractors" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Contractors
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Problems We Solve
                </Link>
              </li>
              <li>
                <Link to="/providers" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Find Contractors
                </Link>
              </li>
            </ul>
          </nav>

          {/* Enterprise - commented out for now
          <nav aria-label="Enterprise solutions">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-accent-sand" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <a href="/for-multi-unit" className="hover:text-white transition-colors">Enterprise</a>
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/for-insurance" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Insurance Partners
                </Link>
              </li>
              <li>
                <Link to="/for-multi-unit" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Multi-Unit Owners
                </Link>
              </li>
              <li>
                <Link to="/for-real-estate" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  For Real Estate
                </Link>
              </li>
            </ul>
          </nav>
          */}

          {/* Legal */}
          <nav aria-label="Legal and trust">
            <h4 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-accent-sand" style={{ fontFamily: 'Poppins, sans-serif' }}>
              <a href="/privacy" className="hover:text-white transition-colors">Legal &amp; Trust</a>
            </h4>
            <ul className="space-y-2 sm:space-y-3">
              <li>
                <Link to="/privacy" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Terms of Service
                </Link>
              </li>
              {/* Contractor Standards — hidden until phase 2
              <li>
                <Link to="/contractor-standards" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Contractor Standards
                </Link>
              </li>
              */}
              <li>
                <Link to="/ai-disclosure" className="text-sm sm:text-base text-white/90 hover:text-accent-sand transition-colors cursor-pointer" style={{ fontFamily: 'Inter, sans-serif' }}>
                  AI Use Disclosure
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 border-t border-white/20 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-white/80 text-xs sm:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
            © 2026 Emporva. All rights reserved.
          </p>
          <div className="flex gap-4 sm:gap-6">
            <a href="https://x.com/emporva" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent-sand transition-colors cursor-pointer" aria-label="Follow Emporva on X">
              <i className="ri-twitter-x-fill text-lg sm:text-xl" aria-hidden="true"></i>
            </a>
            <a href="https://www.instagram.com/emporva/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent-sand transition-colors cursor-pointer" aria-label="Follow Emporva on Instagram">
              <i className="ri-instagram-fill text-lg sm:text-xl" aria-hidden="true"></i>
            </a>
            <a href="https://www.facebook.com/emporva" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent-sand transition-colors cursor-pointer" aria-label="Follow Emporva on Facebook">
              <i className="ri-facebook-fill text-lg sm:text-xl" aria-hidden="true"></i>
            </a>
            <a href="https://www.linkedin.com/company/emporva/" target="_blank" rel="noopener noreferrer" className="text-white/80 hover:text-accent-sand transition-colors cursor-pointer" aria-label="Follow Emporva on LinkedIn">
              <i className="ri-linkedin-fill text-lg sm:text-xl" aria-hidden="true"></i>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}