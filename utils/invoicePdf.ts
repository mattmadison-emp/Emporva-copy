
export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitCost: number;
  total: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  // Contractor (From)
  contractorName: string;
  contractorEmail: string;
  contractorPhone: string;
  contractorAddress: string;
  contractorLicense?: string;
  // Client (To)
  clientName: string;
  clientEmail: string;
  clientAddress: string;
  // Job
  jobTitle: string;
  jobDescription?: string;
  // Line Items
  lineItems: InvoiceLineItem[];
  // Totals
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  discountLabel?: string;
  total: number;
  amountPaid: number;
  balanceDue: number;
  // Terms
  paymentTerms: string;
  notes?: string;
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

function getStatusStyle(status: string): { bg: string; color: string; label: string } {
  switch (status) {
    case 'paid':
      return { bg: '#dcfce7', color: '#16a34a', label: 'PAID' };
    case 'sent':
      return { bg: '#e0f2fe', color: '#0284c7', label: 'SENT' };
    case 'overdue':
      return { bg: '#fee2e2', color: '#dc2626', label: 'OVERDUE' };
    default:
      return { bg: '#f3f4f6', color: '#6b7280', label: 'DRAFT' };
  }
}

export function generateInvoicePDF(invoice: InvoiceData): void {
  const statusStyle = getStatusStyle(invoice.status);

  const lineItemsHtml = invoice.lineItems.map((item, i) => `
    <tr style="border-bottom:1px solid #e5e7eb;${i % 2 === 1 ? 'background:#f9fafb;' : ''}">
      <td style="padding:12px 16px;font-size:13px;color:#0B1F33;font-weight:500;">${escapeHtml(item.description)}</td>
      <td style="padding:12px 16px;font-size:13px;color:#6b7280;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 16px;font-size:13px;color:#6b7280;text-align:center;">${escapeHtml(item.unit)}</td>
      <td style="padding:12px 16px;font-size:13px;color:#0B1F33;text-align:right;">${formatCurrency(item.unitCost)}</td>
      <td style="padding:12px 16px;font-size:13px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(item.total)}</td>
    </tr>
  `).join('');

  const discountRow = invoice.discount > 0 ? `
    <tr>
      <td style="padding:8px 20px;font-size:13px;color:#059669;">Discount${invoice.discountLabel ? ` (${escapeHtml(invoice.discountLabel)})` : ''}</td>
      <td style="padding:8px 20px;font-size:13px;color:#059669;text-align:right;font-weight:600;">-${formatCurrency(invoice.discount)}</td>
    </tr>
  ` : '';

  const taxRow = invoice.tax > 0 ? `
    <tr>
      <td style="padding:8px 20px;font-size:13px;color:#6b7280;">Tax (${invoice.taxRate}%)</td>
      <td style="padding:8px 20px;font-size:13px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(invoice.tax)}</td>
    </tr>
  ` : '';

  const amountPaidRow = invoice.amountPaid > 0 ? `
    <tr style="border-top:1px solid #e5e7eb;">
      <td style="padding:8px 20px;font-size:13px;color:#059669;">Amount Paid</td>
      <td style="padding:8px 20px;font-size:13px;color:#059669;text-align:right;font-weight:600;">-${formatCurrency(invoice.amountPaid)}</td>
    </tr>
  ` : '';

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${escapeHtml(invoice.invoiceNumber)} - Emporva</title>
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
<body style="max-width:720px;margin:0 auto;padding:40px 32px;">

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
  <div style="display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:28px;border-bottom:3px solid #00B8A9;margin-bottom:28px;">
    <div>
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
        <img src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png" alt="Emporva" style="width:44px;height:44px;" />
        <div>
          <div style="font-size:26px;font-weight:800;color:#0B1F33;letter-spacing:-0.5px;">Emporva</div>
          <div style="font-size:11px;color:#6b7280;letter-spacing:0.3px;">Smart Home Management</div>
        </div>
      </div>
      <div style="font-size:12px;color:#6b7280;line-height:1.8;">
        ${escapeHtml(invoice.contractorName)}<br>
        ${escapeHtml(invoice.contractorEmail)}<br>
        ${escapeHtml(invoice.contractorPhone)}<br>
        ${escapeHtml(invoice.contractorAddress)}
        ${invoice.contractorLicense ? `<br>License: ${escapeHtml(invoice.contractorLicense)}` : ''}
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:32px;font-weight:800;color:#0B1F33;letter-spacing:-0.5px;margin-bottom:4px;">INVOICE</div>
      <div style="display:inline-block;padding:4px 14px;background:${statusStyle.bg};color:${statusStyle.color};border-radius:20px;font-size:11px;font-weight:700;letter-spacing:0.5px;margin-bottom:8px;">${statusStyle.label}</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.8;">
        Invoice #: <strong style="color:#0B1F33;">${escapeHtml(invoice.invoiceNumber)}</strong><br>
        Date: <strong style="color:#0B1F33;">${escapeHtml(invoice.date)}</strong><br>
        Due: <strong style="color:#0B1F33;">${escapeHtml(invoice.dueDate)}</strong>
      </div>
    </div>
  </div>

  <!-- Bill To + Job Info -->
  <div style="display:flex;gap:32px;margin-bottom:28px;">
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Bill To</div>
      <div style="font-size:13px;color:#0B1F33;line-height:1.8;">
        <strong>${escapeHtml(invoice.clientName)}</strong><br>
        ${escapeHtml(invoice.clientEmail)}<br>
        ${escapeHtml(invoice.clientAddress)}
      </div>
    </div>
    <div style="flex:1;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Project Details</div>
      <div style="font-size:13px;color:#0B1F33;line-height:1.8;">
        <strong>${escapeHtml(invoice.jobTitle)}</strong>
        ${invoice.jobDescription ? `<br><span style="color:#6b7280;">${escapeHtml(invoice.jobDescription)}</span>` : ''}
      </div>
    </div>
  </div>

  <!-- Balance Due Banner -->
  <div style="background:linear-gradient(135deg,#0B1F33 0%,#1a3a52 100%);border-radius:10px;padding:18px 24px;margin-bottom:28px;display:flex;align-items:center;justify-content:space-between;">
    <div>
      <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:2px;">Balance Due</div>
      <div style="font-size:28px;font-weight:800;color:#5eead4;">${formatCurrency(invoice.balanceDue)}</div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:12px;color:rgba(255,255,255,0.7);margin-bottom:2px;">Total Invoice</div>
      <div style="font-size:18px;font-weight:700;color:#fff;">${formatCurrency(invoice.total)}</div>
    </div>
  </div>

  <!-- Line Items Table -->
  <div style="margin-bottom:24px;">
    <div style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;">
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#0B1F33;">
            <th style="padding:12px 16px;font-size:11px;font-weight:700;color:#fff;text-align:left;text-transform:uppercase;letter-spacing:0.5px;">Description</th>
            <th style="padding:12px 16px;font-size:11px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Qty</th>
            <th style="padding:12px 16px;font-size:11px;font-weight:700;color:#fff;text-align:center;text-transform:uppercase;letter-spacing:0.5px;">Unit</th>
            <th style="padding:12px 16px;font-size:11px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Rate</th>
            <th style="padding:12px 16px;font-size:11px;font-weight:700;color:#fff;text-align:right;text-transform:uppercase;letter-spacing:0.5px;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${lineItemsHtml}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Totals -->
  <div style="display:flex;justify-content:flex-end;margin-bottom:28px;">
    <div style="width:280px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:8px 20px;font-size:13px;color:#6b7280;">Subtotal</td>
          <td style="padding:8px 20px;font-size:13px;color:#0B1F33;text-align:right;font-weight:600;">${formatCurrency(invoice.subtotal)}</td>
        </tr>
        ${discountRow}
        ${taxRow}
        <tr style="background:#0B1F33;border-radius:8px;">
          <td style="padding:12px 20px;font-size:14px;font-weight:700;color:#fff;border-radius:8px 0 0 8px;">Total</td>
          <td style="padding:12px 20px;font-size:18px;font-weight:800;color:#5eead4;text-align:right;border-radius:0 8px 8px 0;">${formatCurrency(invoice.total)}</td>
        </tr>
        ${amountPaidRow}
        ${invoice.amountPaid > 0 ? `
        <tr style="background:#f0fdfa;">
          <td style="padding:12px 20px;font-size:14px;font-weight:700;color:#0B1F33;border-radius:8px 0 0 8px;">Balance Due</td>
          <td style="padding:12px 20px;font-size:18px;font-weight:800;color:#00B8A9;text-align:right;border-radius:0 8px 8px 0;">${formatCurrency(invoice.balanceDue)}</td>
        </tr>
        ` : ''}
      </table>
    </div>
  </div>

  <!-- Payment Terms & Notes -->
  <div style="display:flex;gap:24px;margin-bottom:28px;">
    <div style="flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Payment Terms</div>
      <div style="font-size:12px;color:#0B1F33;line-height:1.6;">${escapeHtml(invoice.paymentTerms)}</div>
    </div>
    ${invoice.notes ? `
    <div style="flex:1;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Notes</div>
      <div style="font-size:12px;color:#0B1F33;line-height:1.6;">${escapeHtml(invoice.notes)}</div>
    </div>
    ` : ''}
  </div>

  <!-- Emporva Protection -->
  <div style="background:#f0fdfa;border:1px solid #99f6e4;border-radius:10px;padding:16px 20px;margin-bottom:28px;display:flex;align-items:flex-start;gap:12px;">
    <div style="width:32px;height:32px;background:#ccfbf1;border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-top:2px;">
      <span style="color:#0d9488;font-size:16px;">&#128737;</span>
    </div>
    <div>
      <div style="font-size:13px;font-weight:700;color:#0B1F33;margin-bottom:2px;">Emporva Payment Protection</div>
      <div style="font-size:12px;color:#6b7280;line-height:1.6;">Payments made through Emporva are held in escrow and released upon work verification. Both parties are protected by Emporva\\'s dispute resolution process.</div>
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
      <span style="font-size:10px;color:#d1d5db;">This invoice was generated through Emporva and is valid without a signature.</span>
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
