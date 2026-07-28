import { CONTRACTOR_TRADES } from '../../../constants/trades';

interface FilterSidebarProps {
  filters: {
    service: string;
    location: string;
    rating: number;
    verified: boolean;
  };
  onFilterChange: (filters: any) => void;
}

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  const handleClear = () => {
    onFilterChange({ service: 'All Services', location: '', rating: 0, verified: false });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 sticky top-28">
      <h3 className="text-lg font-bold text-[#0B1F33] mb-6">Filters</h3>

      {/* Service Type */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Service Type</label>
        <select
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 text-[#333645] focus:border-[#D4B483] focus:outline-none cursor-pointer"
          value={filters.service}
          onChange={(e) => onFilterChange({ ...filters, service: e.target.value })}
        >
          <option>All Services</option>
          {CONTRACTOR_TRADES.map((trade) => (
            <option key={trade} value={trade}>{trade}</option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Location</label>
        <input
          type="text"
          placeholder="Enter ZIP code or area"
          className="w-full px-4 py-2 rounded-lg border-2 border-gray-200 text-[#333645] focus:border-[#D4B483] focus:outline-none"
          value={filters.location}
          onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
        />
      </div>

      {/* Rating */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-[#0B1F33] mb-3">Minimum Rating</label>
        <div className="space-y-2">
          {[4.5, 4.0, 3.5, 3.0, 0].map((rating) => (
            <label key={rating} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="rating"
                checked={filters.rating === rating}
                onChange={() => onFilterChange({ ...filters, rating })}
                className="w-4 h-4 accent-[#D4B483]"
              />
              <div className="flex items-center gap-1">
                {rating > 0 ? (
                  <>
                    <i className="ri-star-fill text-[#D4B483]"></i>
                    <span className="text-sm text-[#333645]">{rating}+</span>
                  </>
                ) : (
                  <span className="text-sm text-[#333645]">Any rating</span>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Verified Only */}
      <div className="mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.verified}
            onChange={(e) => onFilterChange({ ...filters, verified: e.target.checked })}
            className="w-4 h-4 accent-[#D4B483]"
          />
          <span className="text-sm font-semibold text-[#0B1F33]">Verified Only</span>
        </label>
      </div>

      {/* Clear Filters */}
      <button
        onClick={handleClear}
        className="w-full py-2 border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg font-semibold hover:bg-[#0B1F33] hover:text-white transition-colors whitespace-nowrap cursor-pointer"
      >
        Clear All Filters
      </button>
    </div>
  );
}
