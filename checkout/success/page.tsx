import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useRoleRoutes } from '../../../hooks/useRoleRoutes';
import { verifyCheckoutSession } from '../../../lib/stripeApi';

type Phase = 'verifying' | 'activated' | 'pending';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const { dashboard } = useRoleRoutes();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  // Confirm the upgrade against Stripe before telling the user it's done, so
  // the account reliably reflects the new plan (the webhook is async and may
  // not have landed yet). Falls back to a softer "processing" message if the
  // confirmation can't complete.
  const [phase, setPhase] = useState<Phase>(sessionId ? 'verifying' : 'activated');

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const confirm = async () => {
      // Retry a few times — covers the brief window where the subscription
      // object isn't fully settled immediately after redirect.
      for (let attempt = 0; attempt < 4 && !cancelled; attempt++) {
        const { data } = await verifyCheckoutSession(sessionId);
        if (cancelled) return;
        if (data?.tier === 'premium') {
          setPhase('activated');
          return;
        }
        if (data?.paid) {
          // Paid but tier not yet resolved to premium — keep trying briefly.
          await new Promise((r) => setTimeout(r, 1500));
        } else {
          break;
        }
      }
      if (!cancelled) setPhase('pending');
    };

    confirm();
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  if (phase === 'verifying') {
    return (
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center space-y-6">
          <div className="flex justify-center">
            <i className="ri-loader-4-line animate-spin text-5xl text-[#14B8A6]"></i>
          </div>
          <h1 className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
            Finalizing your subscription…
          </h1>
          <p className="text-[#6B7C8F] text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
            Just a moment while we confirm your payment and activate premium.
          </p>
        </div>
      </div>
    );
  }

  const pending = phase === 'pending';

  return (
    <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center space-y-6">
        {/* Status icon */}
        <div className="flex justify-center">
          <div className={`w-20 h-20 ${pending ? 'bg-amber-400/10' : 'bg-[#14B8A6]/10'} rounded-full flex items-center justify-center`}>
            <div className={`w-14 h-14 ${pending ? 'bg-amber-500' : 'bg-[#14B8A6]'} rounded-full flex items-center justify-center`}>
              <i className={`${pending ? 'ri-time-line' : 'ri-check-line'} text-white text-3xl`}></i>
            </div>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-[#0B1F33]" style={{ fontFamily: 'Poppins, sans-serif' }}>
          {pending ? 'Payment received' : 'Subscription Activated!'}
        </h1>

        <p className="text-[#6B7C8F] text-base" style={{ fontFamily: 'Inter, sans-serif' }}>
          {pending
            ? "Thanks! Your payment went through. Your premium plan will activate within a moment — if it doesn't show right away, refresh your dashboard shortly."
            : 'Your premium plan is now active. You now have access to all premium features.'}
        </p>

        <button
          onClick={() => navigate(dashboard)}
          className="w-full py-4 rounded-xl text-base font-bold bg-[#14B8A6] text-white hover:bg-[#0fa396] transition-all cursor-pointer"
          style={{ fontFamily: 'Poppins, sans-serif' }}
        >
          Go to Dashboard
        </button>
      </div>
    </div>
  );
}
