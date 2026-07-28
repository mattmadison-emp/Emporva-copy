import { useNavigate } from 'react-router-dom';
import type { ProviderData } from '../page';

interface ProviderCardProps {
  provider: ProviderData;
}

export default function ProviderCard({ provider }: ProviderCardProps) {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/contractor/${provider.profileId}`);
  };

  const handleStartProject = () => {
    navigate('/ai-intake', { state: { preferredContractor: provider.profileId } });
  };

  const initials = provider.name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        {/* Provider Image */}
        <div className="flex-shrink-0">
          {provider.image ? (
            <img
              src={provider.image}
              alt={provider.name}
              className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg bg-gradient-to-br from-[#0B1F33] to-[#1a3a52] flex items-center justify-center">
              <span className="text-2xl sm:text-3xl font-bold text-white">{initials}</span>
            </div>
          )}
        </div>

        {/* Provider Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-2">
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-[#0B1F33] mb-2 truncate">{provider.name}</h3>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-[#6B7C8F] mb-2">
                {provider.rating > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="ri-star-fill text-[#D4B483]"></i>
                    <span className="font-semibold text-[#0B1F33]">{provider.rating}</span>
                    <span>({provider.reviews} review{provider.reviews !== 1 ? 's' : ''})</span>
                  </div>
                )}
                {provider.location !== '—' && (
                  <div className="flex items-center gap-1">
                    <i className="ri-map-pin-line"></i>
                    <span>{provider.location}</span>
                  </div>
                )}
                {provider.yearsInBusiness > 0 && (
                  <div className="flex items-center gap-1">
                    <i className="ri-time-line"></i>
                    <span>{provider.yearsInBusiness} yr{provider.yearsInBusiness !== 1 ? 's' : ''} in business</span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {provider.badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      badge === 'Verified'
                        ? 'bg-green-100 text-green-700'
                        : badge === 'Licensed'
                        ? 'bg-[#0B1F33]/10 text-[#0B1F33]'
                        : badge === 'Insured'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-[#D4B483]/10 text-[#0B1F33]'
                    }`}
                  >
                    {badge === 'Verified' && <i className="ri-verified-badge-line mr-1"></i>}
                    {badge === 'Licensed' && <i className="ri-file-shield-line mr-1"></i>}
                    {badge === 'Insured' && <i className="ri-shield-check-line mr-1"></i>}
                    {badge}
                  </span>
                ))}
                {provider.emergencyAvailable && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap bg-red-100 text-red-700">
                    <i className="ri-alarm-warning-line mr-1"></i>
                    Emergency Available
                  </span>
                )}
              </div>
            </div>
          </div>

          {provider.specialties.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {provider.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-[#F9F9FB] text-[#6B7C8F] rounded-lg text-sm whitespace-nowrap"
                >
                  {specialty}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-4 sm:gap-6 text-sm text-[#6B7C8F]">
              {provider.hireCount > 0 && (
                <div className="flex items-center gap-1">
                  <i className="ri-user-follow-line"></i>
                  <span>{provider.hireCount} completed job{provider.hireCount !== 1 ? 's' : ''}</span>
                </div>
              )}
              {provider.companyType && (
                <div className="flex items-center gap-1">
                  <i className="ri-team-line"></i>
                  <span className="capitalize">{provider.companyType.replace('-', ' ')}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleViewProfile}
                className="px-4 sm:px-6 py-2 border-2 border-[#0B1F33] text-[#0B1F33] rounded-lg font-semibold hover:bg-[#0B1F33] hover:text-white transition-colors whitespace-nowrap cursor-pointer text-sm"
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
