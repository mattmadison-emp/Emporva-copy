
import { QuoteData } from '../mocks/contractorQuotes';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export function generateQuotePDF(quote: QuoteData): void {
  const expiryDate = new Date(quote.createdAt);
  expiryDate.setDate(expiryDate.getDate() + quote.validityDays);

  const lineItemsRows = quote.lineItems.map((item, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 12px;font-size:13px;color:#1f2937;">${i + 1}</td>
      <td style="padding:10px 12px;font-size:13px;color:#1f2937;">${escapeHtml(item.description)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#1f2937;text-align:center;">${item.quantity} ${escapeHtml(item.unit)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#1f2937;text-align:right;">${formatCurrency(item.unitCost)}</td>
      <td style="padding:10px 12px;font-size:13px;color:#1f2937;text-align:right;font-weight:600;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const workStepsHtml = quote.workSteps.map((step, i) => `
    <tr style="border-bottom:1px solid #f3f4f6;">
      <td style="padding:8px 12px;font-size:13px;color:#6b7280;text-align:center;width:36px;vertical-align:top;">${i + 1}.</td>
      <td style="padding:8px 12px;font-size:13px;color:#1f2937;">${escapeHtml(step)}</td>
    </tr>
  `).join('');

  const materialsHtml = quote.materials.map(m => `
    <li style="padding:4px 0;font-size:13px;color:#1f2937;list-style:disc;margin-left:20px;">${escapeHtml(m)}</li>
  `).join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Quote - ${escapeHtml(quote.jobTitle)}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      @page { margin: 0.5in; size: letter; }
    }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; background: #fff; }
    * { box-sizing: border-box; }
  </style>
</head>
<body style="max-width:800px;margin:0 auto;padding:40px;">
  <!-- Print Button -->
  <div class="no-print" style="text-align:right;margin-bottom:20px;">
    <button onclick="window.print()" style="padding:10px 24px;background:#0d9488;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
      Download / Print PDF
    </button>
    <button onclick="window.close()" style="padding:10px 24px;background:#e5e7eb;color:#374151;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-left:8px;">
      Close
    </button>
  </div>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;border-bottom:3px solid #0d9488;padding-bottom:24px;">
    <div>
      <h1 style="margin:0;font-size:28px;color:#0B1F33;font-weight:800;letter-spacing:-0.5px;">PROPOSAL / QUOTE</h1>
      <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Quote #${escapeHtml(quote.id.toUpperCase())}</p>
    </div>
    <div style="text-align:right;">
      <h2 style="margin:0;font-size:18px;color:#0B1F33;font-weight:700;">Anderson Contracting</h2>
      <p style="margin:2px 0;font-size:12px;color:#6b7280;">Mike Anderson &bull; Licensed &amp; Insured</p>
      <p style="margin:2px 0;font-size:12px;color:#6b7280;">mike@andersoncontracting.com</p>
      <p style="margin:2px 0;font-size:12px;color:#6b7280;">(512) 555-0100 &bull; Austin, TX</p>
    </div>
  </div>

  <!-- Client & Quote Info -->
  <div style="display:flex;gap:24px;margin-bottom:28px;">
    <div style="flex:1;background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Prepared For</p>
      <p style="margin:0;font-size:14px;font-weight:600;color:#0B1F33;">${escapeHtml(quote.clientName)}</p>
      <p style="margin:2px 0;font-size:12px;color:#6b7280;">${escapeHtml(quote.clientEmail)}</p>
      <p style="margin:2px 0;font-size:12px;color:#6b7280;">${escapeHtml(quote.clientPhone)}</p>
      <p style="margin:2px 0;font-size:12px;color:#6b7280;">${escapeHtml(quote.clientAddress)}</p>
    </div>
    <div style="flex:1;background:#f9fafb;border-radius:8px;padding:16px;border:1px solid #e5e7eb;">
      <p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;">Quote Details</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="font-size:12px;color:#6b7280;padding:2px 0;">Date:</td><td style="font-size:12px;color:#0B1F33;font-weight:600;text-align:right;">${formatDate(quote.createdAt)}</td></tr>
        <tr><td style="font-size:12px;color:#6b7280;padding:2px 0;">Valid Until:</td><td style="font-size:12px;color:#0B1F33;font-weight:600;text-align:right;">${formatDate(expiryDate.toISOString())}</td></tr>
        <tr><td style="font-size:12px;color:#6b7280;padding:2px 0;">Est. Duration:</td><td style="font-size:12px;color:#0B1F33;font-weight:600;text-align:right;">${escapeHtml(quote.estimatedDuration)}</td></tr>
        <tr><td style="font-size:12px;color:#6b7280;padding:2px 0;">Payment:</td><td style="font-size:12px;color:#0B1F33;font-weight:600;text-align:right;">${escapeHtml(quote.paymentTerms)}</td></tr>
      </table>
    </div>
  </div>

  <!-- Project Title -->
  <div style="background:#0B1F33;color:#fff;border-radius:8px;padding:16px 20px;margin-bottom:28px;">
    <h3 style="margin:0;font-size:18px;font-weight:700;">${escapeHtml(quote.jobTitle)}</h3>
  </div>

  <!-- Scope of Work -->
  <div style="margin-bottom:24px;">
    <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0B1F33;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Scope of Work</h4>
    <p style="margin:0;font-size:13px;color:#374151;line-height:1.7;">${escapeHtml(quote.scopeSummary)}</p>
  </div>

  <!-- Work Sequence -->
  <div style="margin-bottom:24px;">
    <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0B1F33;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Work Sequence</h4>
    <table style="width:100%;border-collapse:collapse;">${workStepsHtml}</table>
  </div>

  <!-- Materials -->
  <div style="margin-bottom:24px;">
    <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0B1F33;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Materials Required</h4>
    <ul style="margin:0;padding:0;">${materialsHtml}</ul>
  </div>

  <!-- Pricing -->
  <div style="margin-bottom:24px;">
    <h4 style="margin:0 0 8px;font-size:14px;font-weight:700;color:#0B1F33;border-bottom:1px solid #e5e7eb;padding-bottom:6px;">Pricing Breakdown</h4>
    <table style="width:100%;border-collapse:collapse;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;width:36px;">#</th>
          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:left;text-transform:uppercase;">Description</th>
          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:center;text-transform:uppercase;">Qty</th>
          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:right;text-transform:uppercase;">Unit Cost</th>
          <th style="padding:10px 12px;font-size:11px;font-weight:700;color:#6b7280;text-align:right;text-transform:uppercase;">Total</th>
        </tr>
      </thead>
      <tbody>${lineItemsRows}</tbody>
      <tfoot>
        <tr style="background:#0B1F33;">
          <td colspan="4" style="padding:14px 12px;font-size:14px;font-weight:700;color:#fff;text-align:right;">Total Estimate:</td>
          <td style="padding:14px 12px;font-size:18px;font-weight:800;color:#5eead4;text-align:right;">${formatCurrency(quote.total)}</td>
        </tr>
      </tfoot>
    </table>
  </div>

  <!-- Assumptions & Exclusions -->
  <div style="display:flex;gap:16px;margin-bottom:24px;">
    <div style="flex:1;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px;">
      <h5 style="margin:0 0 6px;font-size:12px;font-weight:700;color:#1e40af;text-transform:uppercase;">Assumptions</h5>
      <p style="margin:0;font-size:12px;color:#1e3a5f;line-height:1.6;">${escapeHtml(quote.assumptions)}</p>
    </div>
    <div style="flex:1;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px;">
      <h5 style="margin:0 0 6px;font-size:12px;font-weight:700;color:#991b1b;text-transform:uppercase;">Exclusions</h5>
      <p style="margin:0;font-size:12px;color:#7f1d1d;line-height:1.6;">${escapeHtml(quote.exclusions)}</p>
    </div>
  </div>

  <!-- Terms -->
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:28px;">
    <h5 style="margin:0 0 8px;font-size:12px;font-weight:700;color:#6b7280;text-transform:uppercase;">Terms &amp; Conditions</h5>
    <ul style="margin:0;padding:0 0 0 20px;font-size:12px;color:#374151;line-height:1.8;">
      <li>This quote is valid for ${quote.validityDays} days from the date of issue.</li>
      <li>Payment terms: ${escapeHtml(quote.paymentTerms)}.</li>
      <li>Any changes to the scope of work may result in additional charges.</li>
      <li>All work is guaranteed for 1 year from completion date.</li>
      <li>Contractor is fully licensed and insured.</li>
    </ul>
  </div>

  <!-- Signature -->
  <div style="display:flex;gap:40px;margin-bottom:20px;">
    <div style="flex:1;border-top:2px solid #d1d5db;padding-top:12px;">
      <p style="margin:0;font-size:12px;color:#6b7280;">Contractor Signature</p>
      <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#0B1F33;">Mike Anderson</p>
      <p style="margin:2px 0;font-size:11px;color:#6b7280;">Anderson Contracting</p>
    </div>
    <div style="flex:1;border-top:2px solid #d1d5db;padding-top:12px;">
      <p style="margin:0;font-size:12px;color:#6b7280;">Client Signature</p>
      <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#0B1F33;">${escapeHtml(quote.clientName)}</p>
      <p style="margin:2px 0;font-size:11px;color:#6b7280;">Date: _______________</p>
    </div>
  </div>

  <!-- Footer -->
  <div style="text-align:center;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:32px;">
    <p style="margin:0;font-size:11px;color:#9ca3af;">Generated via Emporva &bull; Professional Contractor Management Platform</p>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
