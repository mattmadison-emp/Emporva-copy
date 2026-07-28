import { Link } from 'react-router-dom';

const categories = [
  {
    icon: 'ri-hammer-line',
    title: 'Repairs & Maintenance',
    description: 'Fix leaks, cracks, electrical issues, and more',
    color: 'bg-[#0B1F33]'
  },
  {
    icon: 'ri-paint-brush-line',
    title: 'Renovations',
    description: 'Kitchen, bathroom, basement remodels',
    color: 'bg-[#6B7C8F]'
  },
  {
    icon: 'ri-home-smile-line',
    title: 'Installations',
    description: 'HVAC, appliances, fixtures, and systems',
    color: 'bg-[#D4B483]'
  },
  {
    icon: 'ri-shield-check-line',
    title: 'Inspections',
    description: 'Pre-purchase, safety, and compliance checks',
    color: 'bg-[#0B1F33]'
  },
  {
    icon: 'ri-leaf-line',
    title: 'Outdoor & Landscaping',
    description: 'Decks, patios, fencing, and yard work',
    color: 'bg-[#6B7C8F]'
  },
  {
    icon: 'ri-flashlight-line',
    title: 'Emergency Services',
    description: '24/7 urgent repairs and damage control',
    color: 'bg-[#D4B483]'
  }
];

export default function Categories() {
  return (
    <section id="categories" className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0B1F33] mb-3 sm:mb-4 px-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
            What Can We Help You With?
          </h2>
          <p className="text-base sm:text-lg text-[#333645] max-w-2xl mx-auto px-4" style={{ fontFamily: 'Inter, sans-serif' }}>
            From small fixes to major renovations, Emporva connects you with the right professionals for any home project.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-5 sm:p-6 text-center hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-[#D4B483]"
            >
              <div 
                className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${category.color}15` }}
              >
                <i className={`${category.icon} text-2xl sm:text-3xl`} style={{ color: category.color }}></i>
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#333645] mb-2" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                {category.title}
              </h3>
              <p className="text-sm text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {category.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-8 sm:mt-12">
          <Link to="/services" className="inline-block px-6 sm:px-8 py-3 bg-[#0B1F33] text-white rounded-lg hover:bg-[#0B1F33]/90 transition-all duration-300 font-semibold whitespace-nowrap cursor-pointer text-sm sm:text-base" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            View All Services
          </Link>
        </div>
      </div>
    </section>
  );
}