import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, ArrowRight, XCircle, Loader2 } from 'lucide-react';

export default function PaymentSuccess() {
  const [params] = useSearchParams();
  const [status, setStatus] = useState('processing');

  // Our params (from return_url we set)
  const type = params.get('type');
  const plan = params.get('plan');
  const orderId = params.get('order_id') || params.get('purchase_order_id');

  // Khalti appends these after payment
  const pidx = params.get('pidx');
  const txnId = params.get('transaction_id');
  const khaltiStatus = params.get('status');
  const amount = params.get('amount') || params.get('total_amount');

  useEffect(() => {
    const verify = async () => {
      try {
        if (type === 'subscription' && plan) {
          await api.post('/payments/verify-subscription', {
            plan, purchaseOrderId: orderId, pidx,
          });
          toast.success(`Upgraded to ${plan} plan!`);
        } else if (type === 'messaging') {
          await api.post('/payments/verify-messaging', {
            purchaseOrderId: orderId, pidx,
          });
          toast.success('Messaging unlocked!');
        }
        setStatus('success');
      } catch {
        setStatus('failed');
      }
    };
    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center mx-auto mb-5">
              <Loader2 size={28} className="text-brand-blue animate-spin" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Verifying Payment</h2>
            <p className="text-gray-500 text-sm">Confirming with Khalti...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-emerald-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful</h2>
            <p className="text-gray-500 text-sm mb-2">
              {type === 'subscription' ? `Your ${plan} plan is now active.` : 'Messaging has been unlocked.'}
            </p>
            {amount && <p className="text-emerald-400 text-sm font-semibold mb-6">₨{(Number(amount) / 100).toLocaleString()} paid via Khalti</p>}
            <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2">
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </>
        )}
        {status === 'failed' && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <XCircle size={32} className="text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-gray-500 text-sm mb-6">Payment was not completed. Please try again.</p>
            <Link to="/subscriptions" className="btn-outline inline-flex items-center gap-2">
              Try Again <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
