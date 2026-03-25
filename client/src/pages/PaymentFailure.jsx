import { Link } from 'react-router-dom';
import { XCircle, ArrowRight } from 'lucide-react';

export default function PaymentFailure() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-card p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 text-sm mb-6">Your payment was cancelled or failed. No charges were made.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/subscriptions" className="btn-outline inline-flex items-center gap-2">
            View Plans <ArrowRight size={16} />
          </Link>
          <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2">
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
