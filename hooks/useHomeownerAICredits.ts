import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const UNLIMITED_SENTINEL = 999999;

interface UseHomeownerAICreditsResult {
  remaining: number;
  isPremium: boolean;
  isLoading: boolean;
  consume: () => Promise<{ ok: true; remaining: number } | { ok: false; remaining: 0 }>;
  refresh: () => Promise<void>;
}

export function useHomeownerAICredits(): UseHomeownerAICreditsResult {
  const { user } = useAuth();
  const [remaining, setRemaining] = useState<number>(0);
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setRemaining(0);
      setIsPremium(false);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase.rpc('get_homeowner_ai_credits');
    if (error) {
      console.error('[useHomeownerAICredits] get failed:', error.message);
      setRemaining(0);
      setIsPremium(false);
    } else {
      const value = typeof data === 'number' ? data : 0;
      setIsPremium(value === UNLIMITED_SENTINEL);
      setRemaining(value);
    }
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const consume = useCallback(async () => {
    if (!user) return { ok: false as const, remaining: 0 as const };

    const { data, error } = await supabase.rpc('consume_homeowner_ai_credit');
    if (error) {
      console.error('[useHomeownerAICredits] consume failed:', error.message);
      return { ok: false as const, remaining: 0 as const };
    }

    const value = typeof data === 'number' ? data : -1;

    if (value === UNLIMITED_SENTINEL) {
      setIsPremium(true);
      setRemaining(UNLIMITED_SENTINEL);
      return { ok: true as const, remaining: UNLIMITED_SENTINEL };
    }

    if (value < 0) {
      setRemaining(0);
      return { ok: false as const, remaining: 0 as const };
    }

    setRemaining(value);
    return { ok: true as const, remaining: value };
  }, [user]);

  return { remaining, isPremium, isLoading, consume, refresh };
}
