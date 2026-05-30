import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Mail, ArrowLeft, CheckCircle, AlertCircle, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

const IS_DEV = import.meta.env.DEV;

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setSent(true);
      toast.success('Reset link sent!');
    } catch (err) {
      // Always show success to prevent enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-bg" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Forgot Password?</h1>
          <p className="text-gray-500 text-sm mt-2">Enter your email and we'll send a reset link</p>
        </div>

        <div className="card p-7">
          {!sent ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {IS_DEV && (
                <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex gap-3 items-start">
                  <Terminal size={15} className="text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-amber-300 text-xs font-semibold mb-1">Development Mode</p>
                    <p className="text-amber-400/80 text-xs leading-relaxed">
                      Reset link will print to the <span className="font-mono bg-amber-500/20 px-1 rounded">server terminal</span>. No email is sent.
                    </p>
                  </div>
                </div>
              )}
              <div>
                <label className="label" htmlFor="fp-email">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    id="fp-email"
                    className={`${error ? 'input-error' : 'input'} pl-10`}
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                {error && <p className="field-error"><AlertCircle size={12} />{error}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? <><span className="spinner-sm" />Sending...</> : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Check your inbox</h3>
              <p className="text-gray-400 text-sm mb-1">
                {IS_DEV
                  ? <>Reset link printed to the <span className="font-mono text-amber-400 bg-amber-500/10 px-1 rounded">server terminal</span></>
                  : <>We sent a reset link to <span className="text-brand-blue font-medium">{email}</span></>
                }
              </p>
                            {IS_DEV && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 mb-4">
                  <span className="text-yellow-400 text-sm shrink-0">??</span>
                  <p className="text-xs text-yellow-300 leading-relaxed">
                    <strong>Dev Mode:</strong> Reset URL is printed in the server terminal. No real email sent.
                  </p>
                </div>
              )}
              <p className="text-gray-600 text-xs mb-6">
                {IS_DEV ? 'Copy the URL from the terminal and open it in your browser.' : 'The link expires in 15 minutes. Check your spam folder too.'}
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="btn-ghost text-sm border border-surface-border w-full"
              >
                Try a different email
              </button>
            </motion.div>
          )}

          <div className="divider my-5" />
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            <ArrowLeft size={14} />Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
