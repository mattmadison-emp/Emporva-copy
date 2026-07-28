import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser, supabase } from '../_lib/auth.js';

// Called by the team-member dashboard on mount. Flips any team_members
// rows linked to the caller's auth user from invite_status='pending' to
// 'accepted', so the contractor's UI shows green only after the invitee
// has actually authenticated and reached the dashboard.
//
// Service role is used (the supabase client in api/_lib/auth.ts is built
// with the service role key) so we can update across all contractor-
// owned rows that point at this auth_user_id without per-row RLS work.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { data, error } = await supabase
    .from('team_members')
    .update({ invite_status: 'accepted' })
    .eq('auth_user_id', user.id)
    .eq('invite_status', 'pending')
    .select('id');

  if (error) {
    console.error('[mark-accepted] update failed:', error);
    return res.status(500).json({ error: 'Failed to update invite status' });
  }

  return res.status(200).json({ updated: data?.length || 0 });
}
