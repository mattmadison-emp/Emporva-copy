
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export interface ReceiptData {
  confirmationId: string;
  date: string;
  description: string;
  amount: number;
  tax?: number;
  discount?: number;
  subtotal?: number;
  paymentMethod: string;
  cardLast4: string;
  type: 'milestone' | 'subscription' | 'service' | string;
  jobTitle?: string;
  contractor?: string;
  milestone?: string;
  customerName?: string;
  customerEmail?: string;
  promoCode?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'milestone': return 'Milestone Payment';
    case 'subscription': return 'Subscription';
    case 'service': return 'Service Payment';
    default: return 'Payment';
  }
}

export function generateReceiptPDF(receipt: ReceiptData): void {
  const subtotal = receipt.subtotal ?? receipt.amount;
  const tax = receipt.tax ?? 0;
  const discount = receipt.discount ?? 0;
  const total = receipt.amount;

  const jobDetailsHtml = receipt.jobTitle || receipt.contractor || receipt.milestone ? `
    <div style="margin-bottom:24px;">
      <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Job Details</div>
      <table style="width:100%;border-collapse:collapse;">
        ${receipt.jobTitle ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:140px;">Project</td><td style="padding:6px 0;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.jobTitle)}</td></tr>` : ''}
        ${receipt.contractor ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:140px;">Contractor</td><td style="padding:6px 0;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.contractor)}</td></tr>` : ''}
        ${receipt.milestone ? `<tr><td style="padding:6px 0;font-size:13px;color:#6b7280;width:140px;">Milestone</td><td style="padding:6px 0;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.milestone)}</td></tr>` : ''}
      </table>
    </div>
  ` : '';

  const discountRow = discount > 0 ? `
    <tr>
      <td style="padding:8px 16px;font-size:13px;color:#059669;">Discount${receipt.promoCode ? ` (${escapeHtml(receipt.promoCode)})` : ''}</td>
      <td style="padding:8px 16px;font-size:13px;color:#059669;text-align:right;font-weight:600;">-${formatCurrency(discount)}</td>
    </tr>
  ` : '';

  const taxRow = tax > 0 ? `
    <tr>
      <td style="padding:8px 16px;font-size:13px;color:#6b7280;">Tax</td>
      <td style="padding:8px 16px;font-size:13px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(tax)}</td>
    </tr>
  ` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Emporva Receipt - ${escapeHtml(receipt.confirmationId)}</title>
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
<body style="max-width:680px;margin:0 auto;padding:40px 32px;">

  <!-- Print Controls -->
  <div class="no-print" style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:24px;">
    <button onclick="window.print()" style="padding:10px 28px;background:#00B8A9;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;">
      &#128438; Save as PDF
    </button>
    <button onclick="window.close()" style="padding:10px 24px;background:#e5e7eb;color:#374151;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">
      Close
    </button>
  </div>

  <!-- Header with Emporva Branding -->
  <div style="display:flex;justify-content:space-between;align-items:center;padding-bottom:24px;border-bottom:3px solid #00B8A9;margin-bottom:28px;">
    <div style="display:flex;align-items:center;gap:12px;">
      <img src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" alt="Emporva" style="width:44px;height:44px;" />
      <div>
        <div style="font-size:26px;font-weight:800;color:#0B1F33;letter-spacing:-0.5px;">Emporva</div>
        <div style="font-size:11px;color:#6b7280;letter-spacing:0.3px;">Smart Home Management</div>
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:22px;font-weight:800;color:#0B1F33;letter-spacing:-0.3px;">RECEIPT</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px;">${escapeHtml(receipt.confirmationId)}</div>
    </div>
  </div>

  <!-- Status Banner -->
  <div style="background:linear-gradient(135deg,#00B8A9 0%,#00a89a 100%);border-radius:10px;padding:18px 24px;margin-bottom:28px;display:flex;align-items:center;gap:14px;">
    <div style="width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-size:22px;">&#10003;</span>
    </div>
    <div>
      <div style="font-size:16px;font-weight:700;color:#fff;">Payment Successful</div>
      <div style="font-size:13px;color:rgba(255,255,255,0.85);">${escapeHtml(receipt.date)} &bull; ${getTypeLabel(receipt.type)}</div>
    </div>
    <div style="margin-left:auto;text-align:right;">
      <div style="font-size:24px;font-weight:800;color:#fff;">${formatCurrency(total)}</div>
    </div>
  </div>

  <!-- Transaction Details -->
  <div style="margin-bottom:24px;">
    <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Transaction Details</div>
    <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 16px;font-size:13px;color:#6b7280;width:160px;">Confirmation ID</td>
          <td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:700;font-family:monospace;letter-spacing:0.5px;">${escapeHtml(receipt.confirmationId)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 16px;font-size:13px;color:#6b7280;">Date</td>
          <td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.date)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 16px;font-size:13px;color:#6b7280;">Payment Type</td>
          <td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:600;">${getTypeLabel(receipt.type)}</td>
        </tr>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <td style="padding:12px 16px;font-size:13px;color:#6b7280;">Payment Method</td>
          <td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.paymentMethod)} ending in ${escapeHtml(receipt.cardLast4)}</td>
        </tr>
        ${receipt.customerName ? `<tr style="border-bottom:1px solid #e5e7eb;"><td style="padding:12px 16px;font-size:13px;color:#6b7280;">Billed To</td><td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.customerName)}</td></tr>` : ''}
        ${receipt.customerEmail ? `<tr><td style="padding:12px 16px;font-size:13px;color:#6b7280;">Email</td><td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.customerEmail)}</td></tr>` : ''}
      </table>
    </div>
  </div>

  <!-- Job Details (conditional) -->
  ${jobDetailsHtml}

  <!-- Pricing Breakdown -->
  <div style="margin-bottom:28px;">
    <div style="font-size:11px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Payment Summary</div>
    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <tr style="border-bottom:1px solid #e5e7eb;background:#f9fafb;">
          <td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:600;">${escapeHtml(receipt.description)}</td>
          <td style="padding:12px 16px;font-size:13px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(subtotal)}</td>
        </tr>
        ${discountRow}
        ${taxRow}
        <tr style="background:#0B1F33;">
          <td style="padding:14px 16px;font-size:14px;font-weight:700;color:#fff;">Total Paid</td>
          <td style="padding:14px 16px;font-size:20px;font-weight:800;color:#5eead4;text-align:right;">${formatCurrency(total)}</td>
        </tr>
      </table>
    </div>
  </div>

  <!-- Escrow Protection Notice -->
  ${receipt.type === 'milestone' || receipt.type === 'service' ? `
  <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:flex-start;gap:12px;">
    <div style="width:32px;height:32px;background:#ccfbf1;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
      <span style="color:#0d9488;font-size:16px;">&#128737;</span>
    </div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#0B1F33;margin-bottom:2px;">Emporva Payment Protection</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">This payment is held in escrow and released to the contractor only after work is verified and approved. If there is a dispute, Emporva mediates to protect both parties.</div>
    </div>
  </div>
  ` : `
  <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:flex-start;gap:12px;">
    <div style="width:32px;height:32px;background:#ccfbf1;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
      <span style="color:#0d9488;font-size:16px;">&#128737;</span>
    </div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#0B1F33;margin-bottom:2px;">Subscription Protection</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">Your subscription is covered by Emporva\\'s 30-day money-back guarantee. Cancel anytime from your account settings.</div>
    </div>
  </div>
  `}

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
      <span style="font-size:10px;color:#d1d5db;">This receipt was generated electronically and is valid without a signature.</span>
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
