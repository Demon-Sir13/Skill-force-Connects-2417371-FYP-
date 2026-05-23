import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowRight, XCircle, Loader2, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [detail, setDetail] = useState('');

  // Our params (from return_url we set)
  const type = params.get('type');
  const plan = params.get('plan');
  const orderId = params.get('order_id') || params.get('purchase_order_id');

  // Khalti appends these
  const pidx = params.get('pidx');
  const khaltiStatus = params.get('status');
  const amount = params.get('amount') || params.get('total_amount');

  // eSewa appends base64 encoded `data` param
  const esewaData = params.get('data');

  useEffect(() => {
    const verify = async () => {
      try {
        // Decode eSewa data if present
        let esewaDecoded = null;
        if (esewaData) {
          try {
            esewaDecoded = JSON.parse(atob(esewaData));
          } catch {
            esewaDecoded = null;
          }
        }

        if (type === 'subscription' && plan) {
          await api.post('/payments/verify-subscription', {
            plan,
            purchaseOrderId: orderId || esewaDecoded?.transaction_uuid,
            pidx,
            esewaData: esewaData || null,
          });
          setDetail(`Your ${plan} plan is now active.`);
          toast.success(`Upgraded to ${plan} plan!`);
        } else if (type === 'messaging') {
          await api.post('/payments/verify-messaging', {
            purchaseOrderId: orderId || esewaDecoded?.transaction_uuid,
            pidx,
            esewaData: esewaData || null,
          });
          setDetail('Unlimited messaging has been unlocked.');
          toast.success('Messaging unlocked!');
        } else {
          // Unknown type — still mark success
          setDetail('Your payment was processed successfully.');
        }
        setStatus('success');
      } catch (err) {
        setStatus('failed');
        setDetail(err.response?.data?.message || 'Payment verification failed.');
      }
    };
    verify();
  }, []);

  const amountDisplay = amount
    ? `₨${(Number(amount) / (pidx ? 100 : 1)).toLocaleString()}`
    : null;

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

        {status === 'processing' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-brand-blue animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-400 text-sm mb-2">{detail}</p>
            {amountDisplay && (
              <p className="text-emerald-400 text-sm font-semibold mb-6">
                {amountDisplay} paid {pidx ? 'via Khalti' : 'via eSewa'}
              </p>
            )}
            <div className="flex gap-3 justify-center mt-6">
              <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
              <Link to="/subscriptions" className="btn-ghost inline-flex items-center gap-2">
                View Plans
              </Link>
            </div>
          </motion.div>
        )}

        {status === 'failed' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
            <p className="text-gray-400 text-sm mb-6">{detail || 'Payment could not be verified. Please contact support.'}</p>
            <div className="flex gap-3 justify-center">
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
