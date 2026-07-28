import { useParams, Link } from 'react-router-dom';
import Navbar from '../../home/components/Navbar';
import Footer from '../../home/components/Footer';

interface CityData {
  slug: string;
  city: string;
  state: string;
  heroImage: string;
  intro: string;
  localNeeds: string[];
  services: {
    title: string;
    description: string;
    icon: string;
  }[];
  testimonials: {
    name: string;
    location: string;
    text: string;
    rating: number;
  }[];
}

const cityData: Record<string, CityData> = {
  'richmond-va': {
    slug: 'richmond-va',
    city: 'Richmond',
    state: 'Virginia',
    heroImage: 'https://readdy.ai/api/search-image?query=richmond%20virginia%20historic%20downtown%20cityscape%20with%20beautiful%20residential%20neighborhoods%20and%20classic%20architecture%20showing%20well%20maintained%20homes%20and%20properties%20on%20sunny%20day%20with%20clear%20sky%20emphasizing%20community%20and%20quality&width=1400&height=600&seq=cityhero1&orientation=landscape',
    intro: 'Richmond homeowners face unique property challenges, from maintaining historic homes to managing seasonal weather impacts. Emporva connects you with trusted local contractors who understand Richmond\'s specific needs.',
    localNeeds: [
      'Historic home preservation and restoration expertise',
      'Foundation issues common in older Richmond neighborhoods',
      'HVAC systems adapted to humid Virginia summers',
      'Roof maintenance for frequent storm damage',
      'Plumbing updates for aging infrastructure',
      'Energy efficiency improvements for older homes'
    ],
    services: [
      {
        title: 'Plumbing Services in Richmond',
        description: 'Expert plumbers familiar with Richmond\'s older pipe systems and water quality issues. From emergency repairs to full repiping projects.',
        icon: 'ri-drop-line'
      },
      {
        title: 'Electrical Services in Richmond',
        description: 'Licensed electricians specializing in updating Richmond\'s historic homes to modern safety standards while preserving character.',
        icon: 'ri-flashlight-line'
      },
      {
        title: 'Roofing Services in Richmond',
        description: 'Roofing contractors experienced with Richmond\'s weather patterns and architectural styles, from historic slate to modern shingles.',
        icon: 'ri-home-4-line'
      },
      {
        title: 'HVAC Services in Richmond',
        description: 'Climate control experts who understand Richmond\'s humid summers and cold winters, optimizing comfort and efficiency.',
        icon: 'ri-temp-cold-line'
      },
      {
        title: 'Renovation Services in Richmond',
        description: 'Full-service renovation contractors who respect Richmond\'s historic character while bringing homes into the modern era.',
        icon: 'ri-hammer-line'
      },
      {
        title: 'Handyman Services in Richmond',
        description: 'Reliable handymen for all those smaller projects that keep your Richmond property in top condition year-round.',
        icon: 'ri-tools-line'
      }
    ],
    testimonials: [
      {
        name: 'Sarah Mitchell',
        location: 'Fan District, Richmond',
        text: 'Emporva helped me find the perfect contractor to restore my 1920s home. They understood the historic requirements and delivered beautiful work.',
        rating: 5
      },
      {
        name: 'James Peterson',
        location: 'West End, Richmond',
        text: 'The AI diagnosis was spot-on for my plumbing issue. Saved me time and money by getting the right expert from the start.',
        rating: 5
      },
      {
        name: 'Maria Rodriguez',
        location: 'Church Hill, Richmond',
        text: 'Managing my rental properties is so much easier with Emporva. The workflow system keeps everything organized and on track.',
        rating: 5
      }
    ]
  },
  'norfolk-va': {
    slug: 'norfolk-va',
    city: 'Norfolk',
    state: 'Virginia',
    heroImage: 'https://readdy.ai/api/search-image?query=norfolk%20virginia%20waterfront%20cityscape%20with%20modern%20residential%20areas%20and%20coastal%20properties%20showing%20beautiful%20homes%20near%20harbor%20on%20bright%20sunny%20day%20emphasizing%20coastal%20living%20and%20property%20care&width=1400&height=600&seq=cityhero2&orientation=landscape',
    intro: 'Norfolk\'s coastal location brings unique property maintenance challenges. Emporva connects you with contractors who specialize in coastal home care and understand the impact of salt air and humidity.',
    localNeeds: [
      'Coastal weather protection and hurricane preparedness',
      'Salt air corrosion prevention for exterior materials',
      'Moisture control and mold prevention systems',
      'Foundation waterproofing for high water tables',
      'Wind-resistant roofing and siding solutions',
      'HVAC systems designed for coastal humidity'
    ],
    services: [
      {
        title: 'Plumbing Services in Norfolk',
        description: 'Coastal plumbing experts who understand Norfolk\'s water quality and corrosion challenges unique to waterfront properties.',
        icon: 'ri-drop-line'
      },
      {
        title: 'Electrical Services in Norfolk',
        description: 'Electricians experienced with coastal electrical systems, moisture protection, and storm damage prevention.',
        icon: 'ri-flashlight-line'
      },
      {
        title: 'Roofing Services in Norfolk',
        description: 'Roofing specialists using materials and techniques proven to withstand Norfolk\'s coastal weather and salt exposure.',
        icon: 'ri-home-4-line'
      },
      {
        title: 'HVAC Services in Norfolk',
        description: 'Climate control systems optimized for Norfolk\'s humid coastal environment with salt-resistant components.',
        icon: 'ri-temp-cold-line'
      },
      {
        title: 'Renovation Services in Norfolk',
        description: 'Renovation experts who use coastal-appropriate materials and methods for long-lasting Norfolk property improvements.',
        icon: 'ri-hammer-line'
      },
      {
        title: 'Handyman Services in Norfolk',
        description: 'Reliable maintenance professionals familiar with the ongoing care coastal Norfolk properties require.',
        icon: 'ri-tools-line'
      }
    ],
    testimonials: [
      {
        name: 'David Thompson',
        location: 'Ghent, Norfolk',
        text: 'Living near the water means constant maintenance. Emporva found me contractors who really understand coastal property care.',
        rating: 5
      },
      {
        name: 'Lisa Chen',
        location: 'Ocean View, Norfolk',
        text: 'After hurricane damage, Emporva\'s system helped me coordinate multiple contractors efficiently. Couldn\'t have done it without them.',
        rating: 5
      }
    ]
  }
};

export default function LocationCity() {
  const { city } = useParams<{ city: string }>();
  const data = city ? cityData[city] : null;

  if (!data) {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#2D2A74] mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Location Not Found
          </h1>
          <Link to="/locations" className="text-[#00B8A9] hover:underline cursor-pointer">
            View All Service Areas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative pt-24 pb-20 px-6 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={data.heroImage}
            alt={`${data.city}, ${data.state}`}
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto pt-16">
          <Link to="/locations" className="inline-flex items-center gap-2 text-white/90 hover:text-white hover:gap-3 transition-all mb-8 cursor-pointer">
            <i className="ri-arrow-left-line"></i>
            <span className="font-medium text-sm">All Service Areas</span>
          </Link>

          <h1 className="text-6xl font-bold text-white mb-6">
            Property Services in {data.city}, {data.state}
          </h1>
          <p className="text-2xl text-white/90 max-w-3xl leading-relaxed">
            Powered by Emporva
          </p>
        </div>
      </div>

      {/* Intro Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="bg-white rounded-2xl shadow-xl p-12">
          <p className="text-xl text-[#333645] leading-relaxed">
            {data.intro}
          </p>
        </div>
      </div>

      {/* How Emporva Helps Section */}
      <div className="max-w-7xl mx-auto px-6 mb-20">
        <h2 className="text-4xl font-bold text-[#0B1F33] mb-12 text-center">
          How Emporva Helps in {data.city}
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.localNeeds.map((need, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 flex items-center justify-center bg-[#D4B483]/10 rounded-lg flex-shrink-0">
                  <i className="ri-checkbox-circle-fill text-[#D4B483] text-xl"></i>
                </div>
                <p className="text-[#333645] leading-relaxed">
                  {need}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services Section */}
      <div className="bg-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-[#0B1F33] mb-4 text-center">
            Services Available in {data.city}
          </h2>
          <p className="text-[#6B7C8F] text-lg text-center mb-12 max-w-3xl mx-auto">
            Connect with verified local contractors who understand {data.city}'s unique property needs.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.services.map((service, index) => (
              <div key={index} className="bg-[#F9F9FB] rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 flex items-center justify-center bg-[#D4B483] rounded-xl mb-6">
                  <i className={`${service.icon} text-white text-3xl`}></i>
                </div>
                <h3 className="text-xl font-bold text-[#0B1F33] mb-3">
                  {service.title}
                </h3>
                <p className="text-[#6B7C8F] leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-[#0B1F33] mb-12 text-center">
          What {data.city} Homeowners Say
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-md">
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <i key={i} className="ri-star-fill text-[#D4B483] text-xl"></i>
                ))}
              </div>
              <p className="text-[#333645] leading-relaxed mb-6 italic">
                "{testimonial.text}"
              </p>
              <div>
                <p className="font-bold text-[#0B1F33]">
                  {testimonial.name}
                </p>
                <p className="text-[#6B7C8F] text-sm">
                  {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/90 rounded-3xl p-16 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Get Started in {data.city}?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Describe your property issue and let Emporva connect you with the right {data.city} contractors.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/" className="px-8 py-4 bg-white text-[#0B1F33] rounded-lg hover:bg-gray-100 transition-colors font-semibold whitespace-nowrap cursor-pointer">
              Describe an Issue
            </Link>
            <Link to="/providers" className="px-8 py-4 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#D4B483]/90 transition-colors font-semibold whitespace-nowrap cursor-pointer">
              Find Contractors in {data.city}
            </Link>
          </div>
        </div>
      </div>

      {/* Related Links */}
      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-2xl font-bold text-[#0B1F33] mb-6">
            Helpful Resources
          </h3>
          <div className="flex flex-wrap gap-4">
            <Link to="/locations" className="text-[#D4B483] hover:underline cursor-pointer">
              ← View All Service Areas
            </Link>
            <span className="text-[#6B7C8F]/30">|</span>
            <Link to="/blog" className="text-[#D4B483] hover:underline cursor-pointer">
              Read Maintenance Tips
            </Link>
            <span className="text-[#6B7C8F]/30">|</span>
            <Link to="/" className="text-[#D4B483] hover:underline cursor-pointer">
              How Emporva Works
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}