interface PullToRefreshIndicatorProps {
  isVisible: boolean;
  pullDistance: number;
  pullProgress: number;
  isRefreshing: boolean;
  shouldTriggerRefresh: boolean;
}

export default function PullToRefreshIndicator({
  isVisible,
  pullDistance,
  pullProgress,
  isRefreshing,
  shouldTriggerRefresh
}: PullToRefreshIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 transition-all duration-200 ease-out"
      style={{
        transform: `translateY(${Math.min(pullDistance - 60, 40)}px)`,
        opacity: Math.min(pullProgress + 0.3, 1)
      }}
    >
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3">
          {isRefreshing ? (
            <>
              <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-[#0B1F33]">Refreshing...</span>
            </>
          ) : shouldTriggerRefresh ? (
            <>
              <i className="ri-refresh-line text-teal-600 text-xl animate-pulse"></i>
              <span className="text-sm font-medium text-teal-600">Release to refresh</span>
            </>
          ) : (
            <>
              <div 
                className="w-5 h-5 border-2 border-gray-300 rounded-full relative transition-all duration-200"
                style={{
                  transform: `rotate(${pullProgress * 180}deg)`,
                  borderTopColor: pullProgress > 0.7 ? '#14B8A6' : '#6B7280'
                }}
              >
                <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-gray-400 transform -translate-x-1/2 -translate-y-0.5 rounded-full"></div>
              </div>
              <span className="text-sm font-medium text-[#6B7C8F]">Pull to refresh</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}