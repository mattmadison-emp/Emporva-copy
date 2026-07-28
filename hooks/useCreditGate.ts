import { useState, useEffect } from 'react';

interface CreditConfig {
  ai_diagnostic: number;
  utility_upload: number;
  export: number;
}

interface CreditUsage {
  ai_diagnostic: number;
  utility_upload: number;
  export: number;
  lastReset: string;
}

// Default credit allocations for Core users
const DEFAULT_HOMEOWNER_CREDITS: CreditConfig = {
  ai_diagnostic: 3,
  utility_upload: 3,
  export: 0 // 1 every 6 months, handled separately
};

const DEFAULT_MULTIUNIT_CREDITS: CreditConfig = {
  ai_diagnostic: 0, // No AI credits for multi-unit in this phase
  utility_upload: 10,
  export: 0 // 2 every 6 months, handled separately
};

export function useCreditGate(userType: 'homeowner' | 'multiunit' = 'homeowner', isPremium: boolean = false) {
  const [credits, setCredits] = useState<CreditUsage>({
    ai_diagnostic: 0,
    utility_upload: 0,
    export: 0,
    lastReset: new Date().toISOString()
  });

  const [hasRemindedOnce, setHasRemindedOnce] = useState<Record<string, boolean>>({
    ai_diagnostic: false,
    utility_upload: false,
    export: false
  });

  // Load credits from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('emporva_credit_usage');
    if (stored) {
      const parsed = JSON.parse(stored);
      setCredits(parsed);
    } else {
      // Initialize with default credits
      const defaultCredits = userType === 'homeowner' ? DEFAULT_HOMEOWNER_CREDITS : DEFAULT_MULTIUNIT_CREDITS;
      setCredits({
        ...defaultCredits,
        lastReset: new Date().toISOString()
      });
    }

    const reminded = localStorage.getItem('emporva_credit_reminded');
    if (reminded) {
      setHasRemindedOnce(JSON.parse(reminded));
    }
  }, [userType]);

  // Save credits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('emporva_credit_usage', JSON.stringify(credits));
  }, [credits]);

  // Save reminded state
  useEffect(() => {
    localStorage.setItem('emporva_credit_reminded', JSON.stringify(hasRemindedOnce));
  }, [hasRemindedOnce]);

  // Check if credits should be reset (monthly)
  useEffect(() => {
    const lastReset = new Date(credits.lastReset);
    const now = new Date();
    const monthsSinceReset = (now.getFullYear() - lastReset.getFullYear()) * 12 + (now.getMonth() - lastReset.getMonth());

    if (monthsSinceReset >= 1) {
      const defaultCredits = userType === 'homeowner' ? DEFAULT_HOMEOWNER_CREDITS : DEFAULT_MULTIUNIT_CREDITS;
      setCredits({
        ...defaultCredits,
        lastReset: now.toISOString()
      });
      // Reset reminded state on credit reset
      setHasRemindedOnce({
        ai_diagnostic: false,
        utility_upload: false,
        export: false
      });
    }
  }, [credits.lastReset, userType]);

  const checkCredit = (type: keyof CreditConfig): boolean => {
    // Premium users have unlimited credits
    if (isPremium) return true;

    // Check if user has credits remaining
    return credits[type] > 0;
  };

  const useCredit = (type: keyof CreditConfig): boolean => {
    // Premium users don't consume credits
    if (isPremium) return true;

    if (credits[type] > 0) {
      setCredits(prev => ({
        ...prev,
        [type]: prev[type] - 1
      }));
      return true;
    }

    return false;
  };

  const getRemainingCredits = (type: keyof CreditConfig): number => {
    if (isPremium) return Infinity;
    return credits[type];
  };

  const hasBeenReminded = (type: keyof CreditConfig): boolean => {
    return hasRemindedOnce[type];
  };

  const markAsReminded = (type: keyof CreditConfig): void => {
    setHasRemindedOnce(prev => ({
      ...prev,
      [type]: true
    }));
  };

  const shouldBlockAction = (type: keyof CreditConfig): boolean => {
    // Premium users are never blocked
    if (isPremium) return false;

    // Block if no credits and already reminded once
    return credits[type] === 0 && hasRemindedOnce[type];
  };

  return {
    checkCredit,
    useCredit,
    getRemainingCredits,
    hasBeenReminded,
    markAsReminded,
    shouldBlockAction
  };
}