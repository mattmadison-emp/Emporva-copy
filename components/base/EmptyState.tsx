
interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  ctaLabel?: string;
  ctaIcon?: string;
  onCtaClick?: () => void;
  ctaHref?: string;
  secondaryLabel?: string;
  secondaryIcon?: string;
  onSecondaryClick?: () => void;
  compact?: boolean;
}

export default function EmptyState({
  icon,
  title,
  description,
  ctaLabel,
  ctaIcon,
  onCtaClick,
  ctaHref,
  secondaryLabel,
  secondaryIcon,
  onSecondaryClick,
  compact = false,
}: EmptyStateProps) {
  return (
    <div className={`bg-white rounded-xl border-2 border-dashed border-gray-200 text-center ${compact ? 'p-8' : 'p-12'}`}>
      <div className={`${compact ? 'w-14 h-14' : 'w-20 h-20'} bg-[#F9F9FB] rounded-2xl flex items-center justify-center mx-auto mb-4`}>
        <i className={`${icon} ${compact ? 'text-3xl' : 'text-4xl'} text-[#6B7C8F]`}></i>
      </div>
      <h3 className={`font-bold text-[#0B1F33] mb-2 ${compact ? 'text-base' : 'text-lg'}`} style={{ fontFamily: 'Poppins, sans-serif' }}>
        {title}
      </h3>
      <p className={`text-[#6B7C8F] mb-6 max-w-md mx-auto leading-relaxed ${compact ? 'text-xs' : 'text-sm'}`} style={{ fontFamily: 'Inter, sans-serif' }}>
        {description}
      </p>
      {(ctaLabel || secondaryLabel) && (
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {ctaLabel && ctaHref && (
            <a
              href={ctaHref}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
            >
              {ctaIcon && <i className={ctaIcon}></i>}
              {ctaLabel}
            </a>
          )}
          {ctaLabel && onCtaClick && !ctaHref && (
            <button
              onClick={onCtaClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg font-semibold text-sm hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
            >
              {ctaIcon && <i className={ctaIcon}></i>}
              {ctaLabel}
            </button>
          )}
          {secondaryLabel && onSecondaryClick && (
            <button
              onClick={onSecondaryClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 text-[#6B7C8F] rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors cursor-pointer whitespace-nowrap"
            >
              {secondaryIcon && <i className={secondaryIcon}></i>}
              {secondaryLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
