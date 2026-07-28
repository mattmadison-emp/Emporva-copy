import { useEffect, useCallback, useRef, useState } from 'react';

interface PullToRefreshOptions {
  threshold?: number;
  maxPullDistance?: number;
  refreshThreshold?: number;
  onRefresh: () => Promise<void> | void;
  disabled?: boolean;
}

export const usePullToRefresh = ({
  threshold: _threshold = 80,
  maxPullDistance = 120,
  refreshThreshold = 60,
  onRefresh,
  disabled = false
}: PullToRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  
  const startY = useRef(0);
  const currentY = useRef(0);
  const isScrolledToTop = useRef(true);

  const checkScrollTop = useCallback(() => {
    isScrolledToTop.current = window.scrollY <= 0;
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;
    
    checkScrollTop();
    if (!isScrolledToTop.current) return;
    
    startY.current = e.touches[0].clientY;
    currentY.current = startY.current;
  }, [disabled, isRefreshing, checkScrollTop]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing || !isScrolledToTop.current) return;
    
    currentY.current = e.touches[0].clientY;
    const pullDistance = Math.max(0, currentY.current - startY.current);
    
    if (pullDistance > 10) {
      setIsPulling(true);
      e.preventDefault(); // Prevent scroll
      setPullDistance(Math.min(pullDistance, maxPullDistance));
    }
  }, [disabled, isRefreshing, maxPullDistance]);

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !isPulling) return;
    
    if (pullDistance >= refreshThreshold) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    startY.current = 0;
    currentY.current = 0;
  }, [disabled, isRefreshing, isPulling, pullDistance, refreshThreshold, onRefresh]);

  useEffect(() => {
    if (disabled) return;

    // Add scroll listener to track scroll position
    window.addEventListener('scroll', checkScrollTop, { passive: true });
    
    // Add touch listeners
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', checkScrollTop);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [disabled, handleTouchStart, handleTouchMove, handleTouchEnd, checkScrollTop]);

  const pullProgress = Math.min(pullDistance / refreshThreshold, 1);
  const shouldTriggerRefresh = pullDistance >= refreshThreshold;

  return {
    isRefreshing,
    isPulling,
    pullDistance,
    pullProgress,
    shouldTriggerRefresh
  };
};