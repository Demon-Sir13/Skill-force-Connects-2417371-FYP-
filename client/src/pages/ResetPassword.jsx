import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const getStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6) return { label: 'Too short', w: '20%', color: 'bg-red-500' };
  if (pw.length < 8) return { label: 'Weak', w: '40%', color: 'bg-orange-500' };
  if (/[A-Z]/.test(pw) && /\d/.test(pw) && pw.length >= 10) return { label: 'Strong', w: '100%', color: 'bg-emerald-500' };
  return { label: 'Fair', w: '65%', color: 'bg-yellow-500' };
};

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const email = params.get('email');

  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token || !email) setError('Invalid or missing reset link. Please request a new one.');
  }, [token, email]);

  const strength = getStrength(newPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, email, newPassword });
      setDone(true);
      toast.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-bg" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-2">
            {email && <span>Resetting for <span className="text-brand-blue">{decodeURIComponent(email)}</span></span>}
          </p>
        </div>

        <div className="card p-7">
          {done ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-emerald-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Password Reset!</h3>
              <p className="text-gray-400 text-sm mb-6">Redirecting to login in 3 seconds...</p>
              <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
            </motion.div>
          ) : error && !token ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <XCircle size={28} className="text-red-400" />
              </div>
              <h3 className="font-semibold text-white mb-2">Invalid Link</h3>
              <p className="text-gray-400 text-sm mb-6">{error}</p>
              <Link to="/forgot-password" className="btn-primary w-full justify-center">Request New Link</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="label">New Password</label>
                <div className="relative">
                  <input
                    className={`${error ? 'input-error' : 'input'} pr-11`}
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                    autoFocus
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {strength && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full bg-surface-border overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.w }} />
                    </div>
                    <span className="text-xs text-gray-500 w-14 text-right">{strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input
                  className={`${confirm && confirm !== newPassword ? 'input-error' : 'input'}`}
                  type={showPw ? 'text' : 'password'}
                  placeholder="Repeat password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                />
                {confirm && confirm !== newPassword && (
                  <p className="field-error"><AlertCircle size={12} />Passwords do not match</p>
                )}
              </div>

              {error && <p className="field-error"><AlertCircle size={12} />{error}</p>}

              <button type="submit" disabled={loading || !newPassword || newPassword !== confirm} className="btn-primary w-full py-3">
                {loading ? <><span className="spinner-sm" />Resetting...</> : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="divider my-5" />
          <Link to="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-white transition-colors">
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
