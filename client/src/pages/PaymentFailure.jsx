import { Link } from 'react-router-dom';
import { XCircle, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PaymentFailure() {
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

        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <XCircle size={32} className="text-red-400" />
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Payment Cancelled</h2>
        <p className="text-gray-500 text-sm mb-2">Your payment was cancelled or failed.</p>
        <p className="text-gray-600 text-xs mb-8">No charges were made to your account.</p>

        <div className="flex gap-3 justify-center">
          <Link to="/subscriptions" className="btn-primary inline-flex items-center gap-2">
            <RefreshCw size={14} />Try Again
          </Link>
          <Link to="/dashboard" className="btn-ghost inline-flex items-center gap-2">
            Dashboard <ArrowRight size={14} />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
