
import { useState } from 'react';

interface EmailPreviewProps {
  type: 'invoice-sent' | 'invoice-paid' | 'invoice-reminder';
  data: {
    recipientName: string;
    recipientEmail: string;
    senderName: string;
    invoiceNumber: string;
    jobTitle: string;
    amount: number;
    dueDate?: string;
    paidDate?: string;
    confirmationId?: string;
    propertyAddress?: string;
  };
  onClose: () => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function EmailPreview({ type, data, onClose }: EmailPreviewProps) {
  const [activeDevice, setActiveDevice] = useState<'desktop' | 'mobile'>('desktop');

  const getSubjectLine = () => {
    switch (type) {
      case 'invoice-sent':
        return `New Invoice ${data.invoiceNumber} from ${data.senderName}`;
      case 'invoice-paid':
        return `Payment Received — Invoice ${data.invoiceNumber}`;
      case 'invoice-reminder':
        return `Payment Reminder — Invoice ${data.invoiceNumber} Due ${data.dueDate}`;
      default:
        return '';
    }
  };

  const getPreheader = () => {
    switch (type) {
      case 'invoice-sent':
        return `You have a new invoice for ${formatCurrency(data.amount)} for ${data.jobTitle}. View and pay securely through Emporva.`;
      case 'invoice-paid':
        return `${data.recipientName} has paid ${formatCurrency(data.amount)} for invoice ${data.invoiceNumber}. Funds are in escrow.`;
      case 'invoice-reminder':
        return `Friendly reminder: Invoice ${data.invoiceNumber} for ${formatCurrency(data.amount)} is due ${data.dueDate}.`;
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#00B8A9]/10 rounded-lg flex items-center justify-center">
              <i className="ri-mail-line text-[#00B8A9] text-lg"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Email Notification Preview
              </h3>
              <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                {type === 'invoice-sent' ? 'Sent to homeowner' : type === 'invoice-paid' ? 'Sent to contractor' : 'Reminder to homeowner'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Device Toggle */}
            <div className="flex bg-[#F9F9FB] rounded-lg p-1">
              <button
                onClick={() => setActiveDevice('desktop')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeDevice === 'desktop' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-computer-line mr-1"></i>Desktop
              </button>
              <button
                onClick={() => setActiveDevice('mobile')}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  activeDevice === 'mobile' ? 'bg-white text-[#0B1F33] shadow-sm' : 'text-[#6B7C8F]'
                }`}
                style={{ fontFamily: 'Montserrat, sans-serif' }}
              >
                <i className="ri-smartphone-line mr-1"></i>Mobile
              </button>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <i className="ri-close-line text-[#6B7C8F] text-xl"></i>
            </button>
          </div>
        </div>

        {/* Email Meta */}
        <div className="px-6 py-3 bg-[#F9F9FB] border-b border-gray-100 flex-shrink-0">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7C8F] font-semibold w-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>To:</span>
              <span className="text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.recipientName} &lt;{data.recipientEmail}&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7C8F] font-semibold w-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>From:</span>
              <span className="text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>Emporva &lt;notifications@emporva.com&gt;</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="text-[#6B7C8F] font-semibold w-12" style={{ fontFamily: 'Montserrat, sans-serif' }}>Subject:</span>
              <span className="text-[#0B1F33] font-semibold" style={{ fontFamily: 'Inter, sans-serif' }}>{getSubjectLine()}</span>
            </div>
          </div>
        </div>

        {/* Email Body */}
        <div className="flex-1 overflow-y-auto p-6 flex justify-center bg-gray-50">
          <div
            className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all ${
              activeDevice === 'mobile' ? 'w-[375px]' : 'w-full max-w-[600px]'
            }`}
          >
            {/* Email Header Banner */}
            <div className="bg-[#0B1F33] px-8 py-6">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
                  alt="Emporva"
                  className="w-8 h-8"
                />
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>Emporva</span>
              </div>
              {type === 'invoice-sent' && (
                <div>
                  <p className="text-white/60 text-xs uppercase tracking-wider mb-1" style={{ fontFamily: 'Montserrat, sans-serif' }}>New Invoice</p>
                  <p className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(data.amount)}</p>
                  <p className="text-white/70 text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>From {data.senderName}</p>
                </div>
              )}
              {type === 'invoice-paid' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <i className="ri-check-line text-white text-sm"></i>
                    </div>
                    <p className="text-green-400 text-xs uppercase tracking-wider font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Payment Received</p>
                  </div>
                  <p className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(data.amount)}</p>
                  <p className="text-white/70 text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>From {data.recipientName}</p>
                </div>
              )}
              {type === 'invoice-reminder' && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                      <i className="ri-time-line text-white text-sm"></i>
                    </div>
                    <p className="text-orange-400 text-xs uppercase tracking-wider font-bold" style={{ fontFamily: 'Montserrat, sans-serif' }}>Payment Reminder</p>
                  </div>
                  <p className="text-white text-xl font-bold" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(data.amount)}</p>
                  <p className="text-white/70 text-sm mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>Due {data.dueDate}</p>
                </div>
              )}
            </div>

            {/* Email Content */}
            <div className="px-8 py-6">
              <p className="text-sm text-[#0B1F33] mb-4" style={{ fontFamily: 'Inter, sans-serif' }}>
                Hi {data.recipientName.split(' ')[0]},
              </p>

              {type === 'invoice-sent' && (
                <>
                  <p className="text-sm text-[#333645] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    {data.senderName} has sent you a new invoice through Emporva for work on your property. Please review the details below and pay securely through your dashboard.
                  </p>

                  {/* Invoice Summary Card */}
                  <div className="bg-[#F9F9FB] rounded-lg p-5 mb-5 border border-gray-100">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Invoice</span>
                        <span className="font-semibold text-[#0B1F33] font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>{data.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Project</span>
                        <span className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.jobTitle}</span>
                      </div>
                      {data.propertyAddress && (
                        <div className="flex justify-between text-sm">
                          <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Property</span>
                          <span className="font-semibold text-[#0B1F33] text-right max-w-[200px]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.propertyAddress}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>Due Date</span>
                        <span className="font-semibold text-[#0B1F33]" style={{ fontFamily: 'Inter, sans-serif' }}>{data.dueDate}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 flex justify-between">
                        <span className="font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Amount Due</span>
                        <span className="font-bold text-[#00B8A9] text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(data.amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center mb-5">
                    <div className="inline-block px-8 py-3.5 bg-[#00B8A9] text-white rounded-lg font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      View &amp; Pay Invoice
                    </div>
                  </div>

                  <div className="bg-[#00B8A9]/5 border border-[#00B8A9]/20 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <i className="ri-shield-check-line text-[#00B8A9] mt-0.5"></i>
                    <p className="text-xs text-[#6B7C8F] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Your payment is protected by Emporva&apos;s escrow system. Funds are held securely until work is verified and approved by you.
                    </p>
                  </div>
                </>
              )}

              {type === 'invoice-paid' && (
                <>
                  <p className="text-sm text-[#333645] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Great news! Payment has been received for your invoice. The funds have been deposited into your Emporva escrow account and will be released upon work verification.
                  </p>

                  {/* Payment Summary Card */}
                  <div className="bg-green-50 rounded-lg p-5 mb-5 border border-green-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <i className="ri-check-line text-white text-xs"></i>
                      </div>
                      <span className="text-sm font-bold text-green-700" style={{ fontFamily: 'Montserrat, sans-serif' }}>Payment Confirmed</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Invoice</span>
                        <span className="font-semibold text-green-900 font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>{data.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Project</span>
                        <span className="font-semibold text-green-900" style={{ fontFamily: 'Inter, sans-serif' }}>{data.jobTitle}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Paid By</span>
                        <span className="font-semibold text-green-900" style={{ fontFamily: 'Inter, sans-serif' }}>{data.recipientName}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Date</span>
                        <span className="font-semibold text-green-900" style={{ fontFamily: 'Inter, sans-serif' }}>{data.paidDate}</span>
                      </div>
                      {data.confirmationId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Confirmation</span>
                          <span className="font-semibold text-green-900 font-mono text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>{data.confirmationId}</span>
                        </div>
                      )}
                      <div className="border-t border-green-200 pt-3 flex justify-between">
                        <span className="font-bold text-green-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Amount Received</span>
                        <span className="font-bold text-green-700 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(data.amount)}</span>
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="text-center mb-5">
                    <div className="inline-block px-8 py-3.5 bg-[#0B1F33] text-white rounded-lg font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      View in Dashboard
                    </div>
                  </div>

                  <div className="bg-[#D4B483]/10 border border-[#D4B483]/30 rounded-lg p-4 mb-4 flex items-start gap-3">
                    <i className="ri-funds-line text-[#D4B483] mt-0.5"></i>
                    <p className="text-xs text-[#6B7C8F] leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Funds are held in Emporva escrow and will be released to your account once the associated work milestone is verified and approved by the homeowner.
                    </p>
                  </div>
                </>
              )}

              {type === 'invoice-reminder' && (
                <>
                  <p className="text-sm text-[#333645] mb-4 leading-relaxed" style={{ fontFamily: 'Inter, sans-serif' }}>
                    This is a friendly reminder that you have an outstanding invoice from {data.senderName}. Please review and pay at your earliest convenience to avoid any delays.
                  </p>

                  <div className="bg-orange-50 rounded-lg p-5 mb-5 border border-orange-100">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Invoice</span>
                        <span className="font-semibold text-orange-900 font-mono" style={{ fontFamily: 'Inter, sans-serif' }}>{data.invoiceNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Project</span>
                        <span className="font-semibold text-orange-900" style={{ fontFamily: 'Inter, sans-serif' }}>{data.jobTitle}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-orange-700/70" style={{ fontFamily: 'Inter, sans-serif' }}>Due Date</span>
                        <span className="font-bold text-red-600" style={{ fontFamily: 'Inter, sans-serif' }}>{data.dueDate}</span>
                      </div>
                      <div className="border-t border-orange-200 pt-3 flex justify-between">
                        <span className="font-bold text-orange-900" style={{ fontFamily: 'Poppins, sans-serif' }}>Balance Due</span>
                        <span className="font-bold text-orange-700 text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>{formatCurrency(data.amount)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-center mb-5">
                    <div className="inline-block px-8 py-3.5 bg-[#00B8A9] text-white rounded-lg font-bold text-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
                      Pay Now
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Email Footer */}
            <div className="bg-[#F9F9FB] px-8 py-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="https://static.readdy.ai/image/66e50cc192035f783553c7c162167e1c/39e601a2f40e479bb8334d3024d41d38.png"
                  alt="Emporva"
                  className="w-5 h-5"
                />
                <span className="text-xs font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>Emporva</span>
              </div>
              <p className="text-xs text-[#6B7C8F] leading-relaxed mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                This email was sent by Emporva on behalf of {type === 'invoice-paid' ? data.recipientName : data.senderName}. If you have questions about this invoice, reply directly or contact support.
              </p>
              <div className="flex items-center gap-4 text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
                <span className="underline cursor-pointer">Unsubscribe</span>
                <span className="underline cursor-pointer">Privacy Policy</span>
                <span className="underline cursor-pointer">Help Center</span>
              </div>
              <p className="text-xs text-[#6B7C8F]/60 mt-3" style={{ fontFamily: 'Inter, sans-serif' }}>
                {getPreheader()}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-white flex-shrink-0">
          <p className="text-xs text-[#6B7C8F]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <i className="ri-information-line mr-1"></i>
            This is a preview of the email notification that will be sent automatically
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-[#0B1F33] text-white rounded-lg text-sm font-semibold hover:bg-[#1a3a52] transition-colors cursor-pointer whitespace-nowrap"
            style={{ fontFamily: 'Montserrat, sans-serif' }}
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
