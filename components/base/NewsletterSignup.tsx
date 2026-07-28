import { useState } from 'react';

interface NewsletterSignupProps {
  /** Tag stored with the subscription so we know where it came from. */
  source?: string;
}

/**
 * "Stay Updated" email capture. Shows an email field + submit button by default
 * and POSTs to /api/newsletter/subscribe, which stores the address in the
 * newsletter_subscribers table. Designed to sit on the dark gradient sidebar card.
 */
export default function NewsletterSignup({ source = 'blog' }: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'submitting') return;
    setStatus('submitting');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      });
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-start gap-2 text-white/90 text-xs sm:text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
        <i className="ri-checkbox-circle-fill text-[#D4B483] text-base flex-shrink-0 mt-0.5" aria-hidden="true"></i>
        <span>Thanks! You&rsquo;re on the list — keep an eye on your inbox.</span>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
        aria-label="Email address"
        className="w-full px-4 py-2.5 sm:py-3 rounded-lg text-sm bg-white text-[#0B1F33] placeholder-[#6B7C8F] focus:outline-none focus:ring-2 focus:ring-[#D4B483]"
        style={{ fontFamily: 'Inter, sans-serif' }}
      />
      <button
        type="submit"
        disabled={status === 'submitting'}
        className="flex items-center justify-center gap-2 w-full py-2.5 sm:py-3 bg-[#D4B483] hover:bg-[#c5a574] text-[#0B1F33] rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ fontFamily: 'Montserrat, sans-serif' }}
      >
        {status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
        <i className="ri-arrow-right-line" aria-hidden="true"></i>
      </button>
      {status === 'error' && (
        <p className="text-white/80 text-xs" style={{ fontFamily: 'Inter, sans-serif' }}>
          Something went wrong. Please try again.
        </p>
      )}
    </form>
  );
}
