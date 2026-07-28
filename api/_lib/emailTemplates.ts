// Emporva branded email templates — inline CSS for Gmail/Outlook compatibility

const BRAND_COLOR = '#0B1F33';
const ACCENT_COLOR = '#00B8A9';
const GOLD_COLOR = '#D4B483';

function wrapInLayout(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background-color:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
        <!-- Header -->
        <tr><td style="background-color:${BRAND_COLOR};padding:24px 32px;text-align:center;">
          <span style="color:${GOLD_COLOR};font-size:24px;font-weight:700;letter-spacing:0.5px;">EMPORVA</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;color:#333333;font-size:15px;line-height:1.6;">
          ${bodyHtml}
        </td></tr>
        <!-- Footer -->
        <tr><td style="background-color:#f9f9fb;padding:20px 32px;border-top:1px solid #eee;text-align:center;">
          <p style="margin:0;color:#999;font-size:12px;">Sent by Emporva &middot; AI-Powered Property Services</p>
          <p style="margin:6px 0 0;color:#bbb;font-size:11px;">You're receiving this because you have an Emporva account.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function ctaButton(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr><td style="background-color:${ACCENT_COLOR};border-radius:8px;padding:14px 28px;">
      <a href="${url}" target="_blank" style="color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;display:inline-block;">${label}</a>
    </td></tr>
  </table>`;
}

function detailRow(label: string, value: string): string {
  return `<tr>
    <td style="padding:8px 12px;color:#6B7C8F;font-size:13px;border-bottom:1px solid #f0f0f0;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;color:${BRAND_COLOR};font-size:13px;font-weight:600;border-bottom:1px solid #f0f0f0;">${value}</td>
  </tr>`;
}

function detailsTable(rows: Array<{ label: string; value: string }>): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9f9fb;border-radius:8px;margin:16px 0;overflow:hidden;">
    ${rows.map(r => detailRow(r.label, r.value)).join('')}
  </table>`;
}

// ── Job Assigned ──

export function jobAssignedEmail(data: {
  contractorName: string;
  jobTitle: string;
  clientName: string;
  propertyAddress: string;
  trade: string;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/contractor-dashboard';
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">You've been assigned a new job</h2>
    <p>Hi ${data.contractorName},</p>
    <p>Great news! You've been assigned to a new job on Emporva. Here are the details:</p>
    ${detailsTable([
      { label: 'Job', value: data.jobTitle },
      { label: 'Client', value: data.clientName },
      { label: 'Location', value: data.propertyAddress },
      { label: 'Trade', value: data.trade },
    ])}
    <p>Log in to your dashboard to review the full scope and get started.</p>
    ${ctaButton('View Job Details', url)}
    <p style="color:#6B7C8F;font-size:13px;">If you have questions about this assignment, you can message the homeowner directly through the Emporva platform.</p>
  `;
  return {
    subject: `New job assigned: ${data.jobTitle}`,
    html: wrapInLayout('New Job Assignment', body),
  };
}

// ── Payment Received (to contractor) ──

export function paymentReceivedEmail(data: {
  recipientName: string;
  amount: string;
  jobTitle: string;
  payerName: string;
  paymentDate: string;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/contractor-dashboard';
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">Payment received</h2>
    <p>Hi ${data.recipientName},</p>
    <p>You've received a payment through Emporva. Here's the summary:</p>
    ${detailsTable([
      { label: 'Amount', value: data.amount },
      { label: 'Job', value: data.jobTitle },
      { label: 'From', value: data.payerName },
      { label: 'Date', value: data.paymentDate },
    ])}
    <p>The funds will be reflected in your Earnings dashboard.</p>
    ${ctaButton('View Earnings', url)}
  `;
  return {
    subject: `Payment received: ${data.amount} for ${data.jobTitle}`,
    html: wrapInLayout('Payment Received', body),
  };
}

// ── Payment Sent (to homeowner) ──

export function paymentSentEmail(data: {
  recipientName: string;
  amount: string;
  jobTitle: string;
  contractorName: string;
  paymentDate: string;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/homeowner-dashboard';
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">Payment confirmed</h2>
    <p>Hi ${data.recipientName},</p>
    <p>Your payment has been processed successfully. Here's your receipt:</p>
    ${detailsTable([
      { label: 'Amount', value: data.amount },
      { label: 'Job', value: data.jobTitle },
      { label: 'Paid to', value: data.contractorName },
      { label: 'Date', value: data.paymentDate },
    ])}
    <p>You can view your full payment history in your dashboard.</p>
    ${ctaButton('View Dashboard', url)}
    <p style="color:#6B7C8F;font-size:13px;">If you didn't authorize this payment, please contact us immediately.</p>
  `;
  return {
    subject: `Payment confirmed: ${data.amount} for ${data.jobTitle}`,
    html: wrapInLayout('Payment Confirmed', body),
  };
}

// ── New Message ──

export function newMessageEmail(data: {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationTitle?: string;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/contractor-dashboard';
  const preview = data.messagePreview.length > 200
    ? data.messagePreview.substring(0, 200) + '...'
    : data.messagePreview;
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">New message from ${data.senderName}</h2>
    <p>Hi ${data.recipientName},</p>
    <p>You have a new message${data.conversationTitle ? ` in <strong>${data.conversationTitle}</strong>` : ''}:</p>
    <div style="background-color:#f9f9fb;border-left:4px solid ${ACCENT_COLOR};border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;">
      <p style="margin:0;color:${BRAND_COLOR};font-size:14px;line-height:1.5;">${preview}</p>
      <p style="margin:8px 0 0;color:#6B7C8F;font-size:12px;">— ${data.senderName}</p>
    </div>
    ${ctaButton('View Conversation', url)}
    <p style="color:#6B7C8F;font-size:13px;">You can reply directly from your Emporva dashboard.</p>
  `;
  return {
    subject: `New message from ${data.senderName}${data.conversationTitle ? ` — ${data.conversationTitle}` : ''}`,
    html: wrapInLayout('New Message', body),
  };
}

// ── Quote Sent (to homeowner) ──

export function quoteSentEmail(data: {
  homeownerName: string;
  contractorName: string;
  contractorBusiness?: string | null;
  jobTitle: string;
  total: string;
  estimatedDuration?: string | null;
  validityDays?: number | null;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/homeowner-dashboard-core';
  const senderLabel = data.contractorBusiness
    ? `${data.contractorBusiness} (${data.contractorName})`
    : data.contractorName;
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">You've received a new quote</h2>
    <p>Hi ${data.homeownerName},</p>
    <p><strong>${senderLabel}</strong> just sent you a quote for your job <strong>${data.jobTitle}</strong>.</p>
    ${detailsTable([
      { label: 'Quote total', value: data.total },
      ...(data.estimatedDuration ? [{ label: 'Estimated duration', value: data.estimatedDuration }] : []),
      ...(data.validityDays ? [{ label: 'Valid for', value: `${data.validityDays} days` }] : []),
    ])}
    <p>Review the full scope, line items, and assumptions in your dashboard. You can accept, decline, or ask the contractor a question.</p>
    ${ctaButton('Review Quote', url)}
  `;
  return {
    subject: `New quote from ${senderLabel} — ${data.total}`,
    html: wrapInLayout('New Quote', body),
  };
}

// ── Quote Accepted (to contractor) ──

export function quoteAcceptedEmail(data: {
  contractorName: string;
  homeownerName: string;
  jobTitle: string;
  total: string;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/contractor-dashboard-core';
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">Your quote was accepted</h2>
    <p>Hi ${data.contractorName},</p>
    <p>Great news — <strong>${data.homeownerName}</strong> just accepted your quote for <strong>${data.jobTitle}</strong>.</p>
    ${detailsTable([
      { label: 'Job', value: data.jobTitle },
      { label: 'Client', value: data.homeownerName },
      { label: 'Total', value: data.total },
    ])}
    <p>Head to your Quotes Hub to start coordinating the work.</p>
    ${ctaButton('Open Quotes Hub', url)}
  `;
  return {
    subject: `Quote accepted: ${data.jobTitle}`,
    html: wrapInLayout('Quote Accepted', body),
  };
}

// ── Quote Declined (to contractor) ──

export function quoteDeclinedEmail(data: {
  contractorName: string;
  homeownerName: string;
  jobTitle: string;
  reason?: string | null;
  dashboardUrl?: string;
}): { subject: string; html: string } {
  const url = data.dashboardUrl || 'https://emporva.com/contractor-dashboard-core';
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">Quote update</h2>
    <p>Hi ${data.contractorName},</p>
    <p><strong>${data.homeownerName}</strong> declined your quote for <strong>${data.jobTitle}</strong>.</p>
    ${data.reason
      ? `<div style="background-color:#f9f9fb;border-left:4px solid ${ACCENT_COLOR};border-radius:0 8px 8px 0;padding:16px 20px;margin:16px 0;"><p style="margin:0;color:${BRAND_COLOR};font-size:14px;"><strong>Their note:</strong> ${data.reason}</p></div>`
      : ''}
    <p>Keep an eye on the marketplace for similar jobs — your AI-generated quotes are ready in seconds.</p>
    ${ctaButton('Browse Marketplace', url)}
  `;
  return {
    subject: `Quote declined: ${data.jobTitle}`,
    html: wrapInLayout('Quote Declined', body),
  };
}

// ── Team Invite (existing user added to a new contractor's crew) ──

export function teamInviteEmail(data: {
  recipientName: string;
  contractorName: string;
  signInUrl: string;
}): { subject: string; html: string } {
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">${data.contractorName} added you to their team</h2>
    <p>Hi ${data.recipientName},</p>
    <p><strong>${data.contractorName}</strong> has added you as a team member on Emporva. Click below to sign in and see the work assigned to you.</p>
    ${ctaButton('Sign in to Emporva', data.signInUrl)}
    <p style="color:#6B7C8F;font-size:13px;">This link signs you in once and is safe to ignore if you weren't expecting it.</p>
  `;
  return {
    subject: `${data.contractorName} added you to their team on Emporva`,
    html: wrapInLayout('You\'ve been added to a team', body),
  };
}

// ── Early-Access Contractor Signup (internal notification) ──

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function contractorSignupNotificationEmail(data: {
  name: string;
  email: string;
  companyName?: string | null;
  primaryTrade?: string | null;
  location?: string | null;
  submittedAt?: string;
}): { subject: string; html: string } {
  const rows = [
    { label: 'Name', value: escapeHtml(data.name) },
    { label: 'Email', value: escapeHtml(data.email) },
    { label: 'Company', value: escapeHtml(data.companyName || '—') },
    { label: 'Primary Trade', value: escapeHtml(data.primaryTrade || '—') },
    { label: 'Location', value: escapeHtml(data.location || '—') },
    { label: 'Submitted', value: escapeHtml(data.submittedAt || '—') },
  ];
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">New contractor early-access signup</h2>
    <p>A new contractor just requested early access via the landing page:</p>
    ${detailsTable(rows)}
    <p style="color:#6B7C8F;font-size:13px;">Captured in the <code>early_access_contractors</code> table.</p>
  `;
  return {
    subject: `New contractor signup: ${data.name}${data.companyName ? ` (${data.companyName})` : ''}`,
    html: wrapInLayout('New contractor early-access signup', body),
  };
}

// ── Early-Access Homeowner Signup (internal notification) ──

export function homeownerSignupNotificationEmail(data: {
  firstName: string;
  email: string;
  zipCode?: string | null;
  ownership?: string | null;
  submittedAt?: string;
}): { subject: string; html: string } {
  const rows = [
    { label: 'First Name', value: escapeHtml(data.firstName) },
    { label: 'Email', value: escapeHtml(data.email) },
    { label: 'ZIP Code', value: escapeHtml(data.zipCode || '—') },
    { label: 'Ownership', value: escapeHtml(data.ownership || '—') },
    { label: 'Submitted', value: escapeHtml(data.submittedAt || '—') },
  ];
  const body = `
    <h2 style="margin:0 0 16px;color:${BRAND_COLOR};font-size:20px;">New homeowner early-access signup</h2>
    <p>A new homeowner just requested early access via the landing page:</p>
    ${detailsTable(rows)}
    <p style="color:#6B7C8F;font-size:13px;">Captured in the <code>early_access_homeowners</code> table.</p>
  `;
  return {
    subject: `New homeowner signup: ${data.firstName}`,
    html: wrapInLayout('New homeowner early-access signup', body),
  };
}
