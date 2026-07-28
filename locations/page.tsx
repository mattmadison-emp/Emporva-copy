import { Link } from 'react-router-dom';
import Navbar from '../home/components/Navbar';
import Footer from '../home/components/Footer';

interface Location {
  id: string;
  city: string;
  state: string;
  slug: string;
  image: string;
  description: string;
}

const locations: Location[] = [
  {
    id: '1',
    city: 'Richmond',
    state: 'VA',
    slug: 'richmond-va',
    image: 'https://readdy.ai/api/search-image?query=richmond%20virginia%20historic%20downtown%20cityscape%20with%20beautiful%20residential%20neighborhoods%20and%20classic%20architecture%20showing%20well%20maintained%20homes%20and%20properties%20on%20sunny%20day%20with%20clear%20sky%20emphasizing%20community%20and%20quality&width=600&height=400&seq=loc1&orientation=landscape',
    description: 'Serving homeowners and businesses in Richmond with expert property maintenance and renovation services.'
  },
  {
    id: '2',
    city: 'Norfolk',
    state: 'VA',
    slug: 'norfolk-va',
    image: 'https://readdy.ai/api/search-image?query=norfolk%20virginia%20waterfront%20cityscape%20with%20modern%20residential%20areas%20and%20coastal%20properties%20showing%20beautiful%20homes%20near%20harbor%20on%20bright%20sunny%20day%20emphasizing%20coastal%20living%20and%20property%20care&width=600&height=400&seq=loc2&orientation=landscape',
    description: 'Trusted property services for Norfolk residents, from coastal home maintenance to full renovations.'
  },
  {
    id: '3',
    city: 'Charlottesville',
    state: 'VA',
    slug: 'charlottesville-va',
    image: 'https://readdy.ai/api/search-image?query=charlottesville%20virginia%20scenic%20residential%20area%20with%20historic%20homes%20and%20university%20town%20architecture%20showing%20charming%20properties%20and%20tree%20lined%20streets%20on%20beautiful%20day%20emphasizing%20historic%20preservation&width=600&height=400&seq=loc3&orientation=landscape',
    description: 'Expert contractors and property services for Charlottesville\'s unique historic and modern homes.'
  },
  {
    id: '4',
    city: 'Virginia Beach',
    state: 'VA',
    slug: 'virginia-beach-va',
    image: 'https://readdy.ai/api/search-image?query=virginia%20beach%20coastal%20residential%20properties%20with%20beachfront%20homes%20and%20modern%20architecture%20showing%20well%20maintained%20properties%20near%20ocean%20on%20sunny%20day%20emphasizing%20coastal%20property%20maintenance&width=600&height=400&seq=loc4&orientation=landscape',
    description: 'Specialized property services for Virginia Beach homes, including coastal weather protection.'
  },
  {
    id: '5',
    city: 'Alexandria',
    state: 'VA',
    slug: 'alexandria-va',
    image: 'https://readdy.ai/api/search-image?query=alexandria%20virginia%20historic%20old%20town%20with%20colonial%20architecture%20and%20brick%20townhouses%20showing%20beautifully%20preserved%20properties%20and%20cobblestone%20streets%20on%20clear%20day%20emphasizing%20historic%20home%20care&width=600&height=400&seq=loc5&orientation=landscape',
    description: 'Premium property maintenance and renovation services for Alexandria\'s historic neighborhoods.'
  },
  {
    id: '6',
    city: 'Roanoke',
    state: 'VA',
    slug: 'roanoke-va',
    image: 'https://readdy.ai/api/search-image?query=roanoke%20virginia%20mountain%20view%20residential%20area%20with%20suburban%20homes%20and%20scenic%20landscape%20showing%20quality%20properties%20with%20mountain%20backdrop%20on%20beautiful%20day%20emphasizing%20mountain%20region%20property%20care&width=600&height=400&seq=loc6&orientation=landscape',
    description: 'Comprehensive property services for Roanoke homes and businesses in the Blue Ridge region.'
  }
];

export default function Locations() {
  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#0B1F33] to-[#0B1F33]/90 pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Service Areas
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
            Emporva helps property owners in select markets get clearer, smarter support for their home and business projects.
          </p>
        </div>
      </div>

      {/* Locations Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {locations.map((location) => (
            <Link
              key={location.id}
              to={`/locations/${location.slug}`}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group cursor-pointer"
            >
              {/* Image */}
              <div className="relative h-64 w-full overflow-hidden">
                <img
                  src={location.image}
                  alt={`${location.city}, ${location.state}`}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute bottom-6 left-6">
                  <h3 className="text-3xl font-bold text-white mb-1">
                    {location.city}
                  </h3>
                  <p className="text-white/90 text-lg">
                    {location.state}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-[#6B7C8F] text-sm leading-relaxed mb-4">
                  {location.description}
                </p>

                <div className="flex items-center gap-2 text-[#D4B483] font-semibold text-sm group-hover:gap-3 transition-all">
                  View Services
                  <i className="ri-arrow-right-line"></i>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 bg-white rounded-2xl shadow-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-[#0B1F33] mb-4">
            Don't See Your Area?
          </h2>
          <p className="text-[#6B7C8F] text-lg max-w-2xl mx-auto mb-8">
            We're expanding to new markets regularly. Let us know where you need Emporva's services.
          </p>
          <button className="px-8 py-4 bg-[#D4B483] text-[#0B1F33] rounded-lg hover:bg-[#D4B483]/90 transition-colors font-semibold whitespace-nowrap cursor-pointer">
            Request Your Area
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}