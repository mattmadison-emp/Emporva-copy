import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { ActiveJobView } from '../types/activeJob';
import type { WorkItem } from '../types/workItem';

function computeProgress(workItems: WorkItem[]): number {
  if (workItems.length === 0) return 0;
  const weights: Record<string, number> = {
    'completed': 100,
    'in-progress': 50,
    'assigned': 15,
    'quoted': 5,
    'open': 0,
    'cancelled': 0,
  };
  const total = workItems.reduce((sum, wi) => sum + (weights[wi.status] || 0), 0);
  return Math.round(total / workItems.length);
}

export function useContractorJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<ActiveJobView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // 1. Fetch work items assigned to this contractor (active ones)
      const { data: myWorkItems, error: wiError } = await supabase
        .from('work_items')
        .select('*')
        .eq('contractor_id', user.id)
        .in('status', ['assigned', 'in-progress', 'completed']);

      if (wiError) { setError(wiError.message); setLoading(false); return; }
      if (!myWorkItems || myWorkItems.length === 0) { setJobs([]); setLoading(false); return; }

      // 2. Get unique job IDs
      const jobIds = [...new Set(myWorkItems.map(wi => wi.job_id))];

      // 3. Fetch parent jobs with homeowner profile
      const { data: jobsData, error: jobsError } = await supabase
        .from('jobs')
        .select('id, title, description, category, status, location, user_id, created_at, homeowner:profiles!jobs_user_id_fkey(first_name, last_name, email)')
        .in('id', jobIds);

      if (jobsError) { setError(jobsError.message); setLoading(false); return; }

      // 4. Fetch all sibling work items for multi-trade coordination
      const { data: allWorkItems } = await supabase
        .from('work_items')
        .select('*')
        .in('job_id', jobIds);

      // 5. Compose ActiveJobView
      const composed: ActiveJobView[] = (jobsData || []).map((job: any) => {
        const homeowner = job.homeowner;
        const homeownerName = homeowner
          ? `${homeowner.first_name || ''} ${homeowner.last_name || ''}`.trim()
          : 'Unknown';
        const homeownerEmail = homeowner?.email || '';

        const jobWorkItems = (allWorkItems || []).filter((wi: WorkItem) => wi.job_id === job.id);
        const myItem = myWorkItems.find(wi => wi.job_id === job.id)!;
        const isMultiTrade = jobWorkItems.length > 1;

        return {
          id: job.id,
          title: job.title,
          status: job.status,
          description: job.description || '',
          category: job.category,
          created_at: job.created_at,
          homeowner_name: homeownerName,
          homeowner_email: homeownerEmail,
          property_address: job.location || '',
          my_work_item: myItem,
          is_multi_trade: isMultiTrade,
          my_trade_role: myItem.trade,
          all_work_items: jobWorkItems,
          progress: isMultiTrade ? computeProgress(jobWorkItems) : computeProgress([myItem]),
        };
      });

      setJobs(composed);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch jobs');
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, refetch: fetchJobs };
}
