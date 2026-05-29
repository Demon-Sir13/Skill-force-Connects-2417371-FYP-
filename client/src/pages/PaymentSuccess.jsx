import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowRight, XCircle, Loader2, Zap, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [params]  = useSearchParams();
  const [status, setStatus]   = useState('processing');
  const [detail, setDetail]   = useState('');
  const verified = useRef(false); // prevent double-fire in StrictMode

  // Params we set in return_url
  const type    = params.get('type');
  const plan    = params.get('plan');
  const orderId = params.get('order_id') || params.get('purchase_order_id');

  // Khalti appends these on redirect
  const pidx         = params.get('pidx');
  const khaltiStatus = params.get('status');
  const amount       = params.get('amount') || params.get('total_amount');

  // eSewa appends base64-encoded `data` param
  const esewaData = params.get('data');

  useEffect(() => {
    if (verified.current) return;
    verified.current = true;

    const verify = async () => {
      try {
        // Khalti: if status param says Completed, proceed; otherwise fail early
        if (pidx && khaltiStatus && khaltiStatus !== 'Completed') {
          setStatus('failed');
          setDetail(`Khalti payment status: ${khaltiStatus}. No charges were made.`);
          return;
        }

        if (type === 'subscription' && plan) {
          await api.post('/payments/verify-subscription', {
            plan,
            purchaseOrderId: orderId,
            pidx:      pidx      || null,
            esewaData: esewaData || null,
          });
          setDetail(`Your ${plan.charAt(0).toUpperCase() + plan.slice(1)} plan is now active.`);
          toast.success(`Upgraded to ${plan} plan!`);

        } else if (type === 'messaging') {
          await api.post('/payments/verify-messaging', {
            purchaseOrderId: orderId,
            pidx:      pidx      || null,
            esewaData: esewaData || null,
          });
          setDetail('Unlimited messaging has been unlocked.');
          toast.success('Messaging unlocked!');

        } else {
          setDetail('Your payment was processed successfully.');
        }

        setStatus('success');
      } catch (err) {
        setStatus('failed');
        setDetail(err.response?.data?.message || 'Payment verification failed. Please contact support.');
      }
    };

    verify();
  }, []);

  // Display amount — Khalti sends paisa, eSewa sends NPR
  const amountDisplay = amount
    ? `₨${(Number(amount) / (pidx ? 100 : 1)).toLocaleString()}`
    : null;

  const gateway = pidx ? 'Khalti' : esewaData ? 'eSewa' : null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-hero">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="card p-10 max-w-md w-full text-center shadow-card"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center shadow-glow-sm">
            <Zap size={15} className="text-white" />
          </div>
          <span className="font-bold text-white">Skill<span className="gradient-text">Force</span></span>
        </div>

        {/* Processing */}
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-brand-blue animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment with {gateway || 'the gateway'}...</p>
          </>
        )}

        {/* Success */}
        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 text-sm mb-2">{detail}</p>
            {amountDisplay && (
              <p className="text-emerald-400 text-sm font-semibold mb-2">
                {amountDisplay} paid{gateway ? ` via ${gateway}` : ''}
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6 flex-wrap">
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/payment-history" className="btn-ghost inline-flex items-center gap-2">
                <Receipt size={14} />Billing History
              </Link>
            </div>
          </motion.div>
        )}

        {/* Failed */}
        {status === 'failed' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 text-sm mb-6">{detail}</p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/subscriptions" className="btn-primary inline-flex items-center gap-2">
                Try Again <ArrowRight size={16} />
              </Link>
              <Link to="/dashboard" className="btn-ghost">Dashboard</Link>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
