
import {
  earningsSummary,
  revenueByMonth,
  escrowHolds,
  payoutHistory,
} from '../mocks/contractorEarnings';

export interface EarningsStatementOptions {
  dateRange: string;
  dateRangeLabel: string;
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  contractorAddress: string;
  contractorLicense?: string;
  ein?: string;
}

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

export function generateEarningsStatementPDF(options: EarningsStatementOptions): void {
  const today = new Date();
  const generatedDate = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const taxYear = today.getFullYear();

  const totalRevenue = earningsSummary.totalRevenue;
  const totalPayouts = earningsSummary.totalPayouts;
  const pendingEscrow = earningsSummary.pendingEscrow;
  const platformFeeRate = 0.035;
  const platformFees = Math.round(totalRevenue * platformFeeRate * 100) / 100;
  const netEarnings = totalPayouts;
  const completedJobs = earningsSummary.completedJobs;
  const avgJobValue = earningsSummary.avgJobValue;

  const monthlyRowsHtml = revenueByMonth.map((m, i) => `
    <tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
      <td style="padding:10px 16px;font-size:12px;color:#0B1F33;font-weight:500;">${escapeHtml(m.month)} ${m.year}</td>
      <td style="padding:10px 16px;font-size:12px;color:#0B1F33;text-align:right;">${formatCurrency(m.revenue)}</td>
      <td style="padding:10px 16px;font-size:12px;color:#6b7280;text-align:right;">${formatCurrency(Math.round(m.revenue * platformFeeRate * 100) / 100)}</td>
      <td style="padding:10px 16px;font-size:12px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(m.payouts)}</td>
    </tr>
  `).join('');

  const payoutRowsHtml = payoutHistory.map((p, i) => `
    <tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
      <td style="padding:8px 16px;font-size:11px;color:#0B1F33;">${escapeHtml(p.date)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#0B1F33;font-weight:500;">${escapeHtml(p.jobTitle)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#6b7280;">${escapeHtml(p.homeowner)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(p.amount)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#6b7280;font-family:monospace;letter-spacing:0.3px;">${escapeHtml(p.confirmationId)}</td>
    </tr>
  `).join('');

  const escrowRowsHtml = escrowHolds.map((h, i) => `
    <tr style="${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
      <td style="padding:8px 16px;font-size:11px;color:#0B1F33;font-weight:500;">${escapeHtml(h.jobTitle)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#6b7280;">${escapeHtml(h.homeowner)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(h.amount)}</td>
      <td style="padding:8px 16px;font-size:11px;color:#6b7280;">${escapeHtml(h.expectedRelease)}</td>
    </tr>
  `).join('');

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Earnings Statement - ${escapeHtml(options.contractorName)} - ${taxYear}</title>
  <style>
    @media print {
      body { margin: 0; padding: 0; }
      .no-print { display: none !important; }
      .page-break { page-break-before: always; }
      @page { margin: 0.4in 0.5in; size: letter; }
    }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.5; background: #fff; }
    * { box-sizing: border-box; }
    table { border-collapse: collapse; }
  </style>
</head>
<body style="max-width:760px;margin:0 auto;padding:40px 32px;">

  <!-- Print Controls -->
  <div class="no-print" style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:24px;">
    <button onclick="window.print()" style="padding:10px 28px;background:#00B8A9;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
      &#128438; Save as PDF
    </button>
    <button onclick="window.close()" style="padding:10px 24px;background:#e5e7eb;color:#374151;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
      Close
    </button>
  </div>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #00B8A9;margin-bottom:24px;">
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
        <img src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" alt="Emporva" style="width:44px;height:44px;" />
        <div>
          <div style="font-size:26px;font-weight:800;color:#0B1F33;letter-spacing:-0.5px;">Emporva</div>
          <div style="font-size:11px;color:#6b7280;letter-spacing:0.3px;">Smart Home Management</div>
        </div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:24px;font-weight:800;color:#0B1F33;letter-spacing:-0.3px;margin-bottom:2px;">EARNINGS STATEMENT</div>
      <div style="font-size:11px;color:#6b7280;margin-bottom:2px;">For Tax Reporting Purposes</div>
      <div style="display:inline-block;padding:4px 14px;background:#f0fdfa;color:#0d9488;border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.3px;border:1px solid #99f6e4;">Tax Year ${taxYear}</div>
    </div>
  </div>

  <!-- Contractor Info + Statement Info -->
  <div style="display:flex;gap:32px;margin-bottom:24px;">
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Contractor / Payee</div>
      <div style="font-size:13px;color:#0B1F33;line-height:1.8;">
        <strong style="font-size:15px;">${escapeHtml(options.contractorName)}</strong><br>
        ${escapeHtml(options.contractorEmail)}<br>
        ${escapeHtml(options.contractorPhone)}<br>
        ${escapeHtml(options.contractorAddress)}
        ${options.contractorLicense ? `<br>License: ${escapeHtml(options.contractorLicense)}` : ''}
        ${options.ein ? `<br>EIN: ${escapeHtml(options.ein)}` : ''}
      </div>
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Statement Details</div>
      <div style="font-size:13px;color:#0B1F33;line-height:1.8;">
        <strong>Period:</strong> ${escapeHtml(options.dateRangeLabel)}<br>
        <strong>Generated:</strong> ${generatedDate}<br>
        <strong>Statement ID:</strong> ES-${taxYear}-${Date.now().toString(36).toUpperCase().slice(-6)}<br>
        <strong>Platform:</strong> Emporva, Inc.
      </div>
    </div>
  </div>

  <!-- Income Summary Banner -->
  <div style="background:linear-gradient(135deg,#0B1F33 0%,#1a3a52 100%);border-radius:12px;padding:24px 28px;margin-bottom:24px;">
    <div style="font-size:10px;font-weight:700;color:rgba(255,255,255,0.6);text-transform:uppercase;letter-spacing:1px;margin-bottom:16px;">Income Summary</div>
    <div style="display:flex;gap:20px;">
      <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:10px;padding:16px;border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Gross Revenue</div>
        <div style="font-size:24px;font-weight:800;color:#5eead4;">${formatCurrency(totalRevenue)}</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:10px;padding:16px;border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Platform Fees (3.5%)</div>
        <div style="font-size:24px;font-weight:800;color:#fbbf24;">-${formatCurrency(platformFees)}</div>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.08);border-radius:10px;padding:16px;border:1px solid rgba(255,255,255,0.1);">
        <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-bottom:4px;">Net Payouts</div>
        <div style="font-size:24px;font-weight:800;color:#fff;">${formatCurrency(netEarnings)}</div>
      </div>
    </div>
    <div style="display:flex;gap:20px;margin-top:12px;">
      <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:11px;color:rgba(255,255,255,0.5);">Pending Escrow</span>
        <span style="font-size:14px;font-weight:700;color:#fbbf24;">${formatCurrency(pendingEscrow)}</span>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:11px;color:rgba(255,255,255,0.5);">Completed Jobs</span>
        <span style="font-size:14px;font-weight:700;color:#fff;">${completedJobs}</span>
      </div>
      <div style="flex:1;background:rgba(255,255,255,0.05);border-radius:8px;padding:10px 16px;display:flex;align-items:center;justify-content:space-between;">
        <span style="font-size:11px;color:rgba(255,255,255,0.5);">Avg. Job Value</span>
        <span style="font-size:14px;font-weight:700;color:#fff;">${formatCurrency(avgJobValue)}</span>
      </div>
    </div>
  </div>

  <!-- Monthly Breakdown Table -->
  <div style="margin-bottom:24px;">
    <div style="font-size:14px;font-weight:700;color:#0B1F33;margin-bottom:10px;">Monthly Earnings Breakdown</div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <table style="width:100%;">
        <thead>
          <tr style="background:#0B1F33;">
            <th style="padding:10px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Month</th>
            <th style="padding:10px 16px;font-size:10px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Gross Revenue</th>
            <th style="padding:10px 16px;font-size:10px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Platform Fee</th>
            <th style="padding:10px 16px;font-size:10px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Net Payout</th>
          </tr>
        </thead>
        <tbody>
          ${monthlyRowsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f0fdfa;border-top:2px solid #00B8A9;">
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0B1F33;">Total</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#0B1F33;text-align:right;">${formatCurrency(totalRevenue)}</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:700;color:#6b7280;text-align:right;">${formatCurrency(platformFees)}</td>
            <td style="padding:12px 16px;font-size:13px;font-weight:800;color:#0d9488;text-align:right;">${formatCurrency(netEarnings)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Payout Transaction Log -->
  <div class="page-break" style="margin-bottom:24px;">
    <div style="font-size:14px;font-weight:700;color:#0B1F33;margin-bottom:10px;">Payout Transaction Log</div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <table style="width:100%;">
        <thead>
          <tr style="background:#0B1F33;">
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Date</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Job</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Client</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Confirmation</th>
          </tr>
        </thead>
        <tbody>
          ${payoutRowsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#f0fdfa;border-top:2px solid #00B8A9;">
            <td colspan="3" style="padding:10px 16px;font-size:12px;font-weight:700;color:#0B1F33;">Total Payouts (${payoutHistory.length} transactions)</td>
            <td style="padding:10px 16px;font-size:13px;font-weight:800;color:#0d9488;text-align:right;">${formatCurrency(payoutHistory.reduce((s, p) => s + p.amount, 0))}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  </div>

  <!-- Pending Escrow Holds -->
  <div style="margin-bottom:24px;">
    <div style="font-size:14px;font-weight:700;color:#0B1F33;margin-bottom:10px;">Pending Escrow Holds</div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <table style="width:100%;">
        <thead>
          <tr style="background:#0B1F33;">
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Job</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Client</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
            <th style="padding:8px 16px;font-size:10px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Est. Release</th>
          </tr>
        </thead>
        <tbody>
          ${escrowRowsHtml}
        </tbody>
        <tfoot>
          <tr style="background:#fefce8;border-top:2px solid #fbbf24;">
            <td colspan="2" style="padding:10px 16px;font-size:12px;font-weight:700;color:#0B1F33;">Total Pending Escrow</td>
            <td style="padding:10px 16px;font-size:13px;font-weight:800;color:#d97706;text-align:right;">${formatCurrency(pendingEscrow)}</td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
    <div style="margin-top:8px;padding:10px 14px;background:#fefce8;border:1px solid #fde68a;border-radius:8px;display:flex;align-items:flex-start;gap:8px;">
      <span style="color:#d97706;font-size:14px;margin-top:1px;">&#9888;</span>
      <p style="font-size:11px;color:#92400e;line-height:1.5;margin:0;">Escrow amounts are not yet disbursed. They will be released upon homeowner approval of completed milestones and may fall into the current or next tax year depending on release date.</p>
    </div>
  </div>

  <!-- Tax Notice -->
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px 24px;margin-bottom:24px;">
    <div style="display:flex;align-items:flex-start;gap:12px;">
      <div style="width:36px;height:36px;background:#e5e7eb;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
        <span style="font-size:18px;">&#128221;</span>
      </div>
      <div>
        <div style="font-size:13px;font-weight:700;color:#0B1F33;margin-bottom:6px;">Important Tax Information</div>
        <ul style="font-size:11px;color:#4b5563;line-height:1.8;margin:0;padding-left:16px;">
          <li>This statement is provided for informational purposes to assist with tax preparation. It is <strong>not</strong> a substitute for IRS Form 1099.</li>
          <li>If your gross earnings exceed $600, Emporva will issue a 1099-NEC by January 31 of the following year.</li>
          <li>Platform fees (3.5%) may be deductible as a business expense. Consult your tax advisor.</li>
          <li>Escrow amounts are reported as income in the tax year they are released/disbursed, not when held.</li>
          <li>Retain this statement and all confirmation IDs for your records.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div style="border-top:2px solid #e5e7eb;padding-top:20px;text-align:center;">
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px;">
      <img src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" alt="Emporva" style="width:20px;height:20px;" />
      <span style="font-size:14px;font-weight:700;color:#0B1F33;">Emporva</span>
    </div>
    <div style="font-size:11px;color:#9ca3af;line-height:1.8;">
      Smart Home Management Platform<br>
      support@emporva.com &bull; emporva.com<br>
      Charlotte, NC &bull; United States
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #f3f4f6;">
      <span style="font-size:10px;color:#d1d5db;">This earnings statement was generated electronically through the Emporva platform on ${generatedDate}. It is valid without a signature.</span>
    </div>
  </div>

</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
}
