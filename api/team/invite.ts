import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser, supabase } from '../_lib/auth.js';
import { sgMail, FROM_EMAIL } from '../_lib/sendgrid.js';
import { teamInviteEmail } from '../_lib/emailTemplates.js';

interface InviteBody {
  teamMemberId?: string | null;
  email: string;
  name: string;
  role?: string;
  color?: string;
  hourlyRate?: number;
}

const COLOR_DEFAULT = 'bg-blue-500';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { user, error: authError } = await getAuthUser(req);
  if (!user) return res.status(401).json({ error: authError });

  const { data: caller } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (caller?.role !== 'contractor') {
    return res.status(403).json({ error: 'Only contractors can invite team members' });
  }

  const body = (req.body || {}) as InviteBody;
  const email = (body.email || '').trim().toLowerCase();
  const name = (body.name || '').trim();
  if (!email || !name) return res.status(400).json({ error: 'email and name are required' });
  if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'invalid email' });

  // Has someone with this email already accepted an account?
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('email', email)
    .maybeSingle();

  if (existingProfile && existingProfile.role && existingProfile.role !== 'team-member') {
    return res.status(409).json({
      error: 'This email already belongs to a non-team-member account.',
    });
  }

  let authUserId: string | null = existingProfile?.id ?? null;

  let teamMemberId = body.teamMemberId || null;
  let isMetadataOnlyEdit = false;

  if (teamMemberId) {
    // Edit path. Look up the existing row to decide whether this is a
    // metadata-only change (already-accepted member) or a re-invite.
    const { data: existingRow, error: fetchErr } = await supabase
      .from('team_members')
      .select('invite_status, auth_user_id')
      .eq('id', teamMemberId)
      .eq('contractor_id', user.id)
      .single();
    if (fetchErr || !existingRow) {
      console.error('[team-invite] existing row lookup failed:', fetchErr);
      return res.status(404).json({ error: 'Team member not found' });
    }

    isMetadataOnlyEdit = existingRow.invite_status === 'accepted';

    if (isMetadataOnlyEdit) {
      // Edit of an accepted member — only touch editable fields. Do not
      // reset invite_status, do not send another email.
      const { error: updateErr } = await supabase
        .from('team_members')
        .update({
          name,
          role: (body.role || '').trim(),
          color: body.color || COLOR_DEFAULT,
          hourly_rate: Number.isFinite(body.hourlyRate) ? Number(body.hourlyRate) : 0,
        })
        .eq('id', teamMemberId)
        .eq('contractor_id', user.id);
      if (updateErr) {
        console.error('[team-invite] metadata update failed:', updateErr);
        return res.status(500).json({ error: 'Failed to update team member' });
      }

      return res.status(200).json({
        teamMemberId,
        authUserId: existingRow.auth_user_id,
        inviteStatus: 'accepted',
      });
    }

    // Pending → re-send invite. Refresh the row's metadata + invited_at.
    const { error: updateErr } = await supabase
      .from('team_members')
      .update({
        name,
        role: (body.role || '').trim(),
        color: body.color || COLOR_DEFAULT,
        hourly_rate: Number.isFinite(body.hourlyRate) ? Number(body.hourlyRate) : 0,
        email,
        invite_status: 'pending',
        invited_at: new Date().toISOString(),
        auth_user_id: authUserId,
        active: true,
      })
      .eq('id', teamMemberId)
      .eq('contractor_id', user.id);
    if (updateErr) {
      console.error('[team-invite] re-invite update failed:', updateErr);
      return res.status(500).json({ error: 'Failed to update team member' });
    }
  } else {
    const { data: inserted, error: insertErr } = await supabase
      .from('team_members')
      .insert({
        contractor_id: user.id,
        name,
        role: (body.role || '').trim(),
        color: body.color || COLOR_DEFAULT,
        hourly_rate: Number.isFinite(body.hourlyRate) ? Number(body.hourlyRate) : 0,
        email,
        invite_status: 'pending',
        invited_at: new Date().toISOString(),
        auth_user_id: authUserId,
        active: true,
      })
      .select('id')
      .single();
    if (insertErr || !inserted) {
      if (insertErr?.code === '23505') {
        return res.status(409).json({ error: 'You have already invited this email.' });
      }
      console.error('[team-invite] insert failed:', insertErr);
      return res.status(500).json({ error: 'Failed to create team member' });
    }
    teamMemberId = inserted.id;
  }

  const siteUrl = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://emporva.com';
  const redirectTo = `${siteUrl}/team-member-dashboard`;

  if (!authUserId) {
    // Brand-new email — Supabase creates the auth user and sends the
    // invite email itself (uses the project's SMTP / template).
    const { data: invited, error: inviteErr } = await supabase.auth.admin.inviteUserByEmail(email, {
      redirectTo,
      data: {
        invited_as: 'team-member',
        invited_by: user.id,
        invited_team_member_id: teamMemberId,
      },
    });
    if (inviteErr || !invited?.user) {
      console.error('[team-invite] inviteUserByEmail failed:', inviteErr);
      return res.status(500).json({ error: 'Failed to send invite email' });
    }
    authUserId = invited.user.id;

    await supabase
      .from('team_members')
      .update({ auth_user_id: authUserId })
      .eq('id', teamMemberId);

    await supabase
      .from('profiles')
      .upsert(
        {
          id: authUserId,
          email,
          first_name: name.split(' ')[0] || name,
          last_name: name.split(' ').slice(1).join(' ') || '',
          role: 'team-member',
          onboarding_completed: false,
        },
        { onConflict: 'id' },
      );
  } else {
    // Existing user being added to a (new or returning) contractor's crew.
    // Mint a magic-link URL via the admin API and email it ourselves so
    // the recipient gets a "you've been added to a team" message rather
    // than a generic password-reset-style email.
    const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: { redirectTo },
    });
    if (linkErr || !linkData?.properties?.action_link) {
      console.error('[team-invite] generateLink failed:', linkErr);
      return res.status(500).json({ error: 'Failed to generate sign-in link' });
    }

    // Look up contractor business name for the email body.
    const { data: contractorProfile } = await supabase
      .from('contractor_profiles')
      .select('business_name')
      .eq('contractor_id', user.id)
      .maybeSingle();
    const { data: contractorPersonal } = await supabase
      .from('profiles')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    const contractorName =
      contractorProfile?.business_name
      || [contractorPersonal?.first_name, contractorPersonal?.last_name].filter(Boolean).join(' ')
      || 'Your contractor';

    const tpl = teamInviteEmail({
      recipientName: name.split(' ')[0] || name,
      contractorName,
      signInUrl: linkData.properties.action_link,
    });

    try {
      await sgMail.send({
        to: email,
        from: FROM_EMAIL,
        subject: tpl.subject,
        html: tpl.html,
      });
    } catch (sendErr) {
      console.error('[team-invite] sgMail.send failed:', sendErr);
      return res.status(500).json({ error: 'Failed to send invite email' });
    }
  }

  return res.status(200).json({
    teamMemberId,
    authUserId,
    inviteStatus: 'pending',
  });
}
