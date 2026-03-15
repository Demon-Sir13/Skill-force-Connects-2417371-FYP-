import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, ArrowRight, ArrowLeft, AlertCircle, ShieldCheck, RefreshCw, Smartphone } from 'lucide-react';

function validateCredentials(form) {
  const errs = {};
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email';
  if (!form.password) errs.password = 'Password is required';
  else if (form.password.length < 6) errs.password = 'At least 6 characters required';
  return errs;
}

export default function Login() {
  const { login, verifyOtp, resendOtp, otpState, clearOtpState } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  // Step 1 state
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 2 (OTP) state
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [rememberDevice, setRememberDevice] = useState(false);
  const inputRefs = useRef([]);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // Start cooldown when OTP step begins
  useEffect(() => {
    if (otpState) setCooldown(60);
  }, [otpState]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (otpState && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [otpState]);

  const set = (f) => (e) => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: '' }));
  };

  // ── Step 1: Submit credentials ──────────────────────────────────────────
  const handleCredentials = async (e) => {
    e.preventDefault();
    const errs = validateCredentials(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const result = await login(form.email.trim().toLowerCase(), form.password);
      if (result.step === 'otp_required') {
        toast.success('Verification code sent to your email');
      } else {
        // Trusted device — direct login
        toast.success(`Welcome back, ${result.name}`);
        navigateAfterLogin(result);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
      setErrors({ password: msg });
    } finally {
      setLoading(false);
    }
  };

  // ── Step 2: Verify OTP ──────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length !== 6) { setOtpError('Enter all 6 digits'); return; }
    setOtpLoading(true);
    setOtpError('');
    try {
      const result = await verifyOtp(otpState.userId, code, rememberDevice);
      toast.success(`Welcome back, ${result.name}`);
      navigateAfterLogin(result);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid verification code';
      setOtpError(msg);
      toast.error(msg);
      setOtpDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await resendOtp(otpState.userId);
      toast.success('New code sent to your email');
      setCooldown(60);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpError('');
      inputRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend code');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Go back to step 1 ──────────────────────────────────────────────────
  const handleBack = () => {
    clearOtpState();
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setCooldown(0);
  };

  const navigateAfterLogin = (user) => {
    if (from && from !== '/login') navigate(from, { replace: true });
    else navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
  };

  // ── OTP digit input handlers ────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    if (otpError) setOtpError('');
    // Auto-advance
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    // Auto-submit when all filled
    if (value && index === 5 && newDigits.every(d => d !== '')) {
      setTimeout(() => handleVerifyOtp(), 150);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      const code = otpDigits.join('');
      if (code.length === 6) handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...otpDigits];
    for (let i = 0; i < 6; i++) newDigits[i] = pasted[i] || '';
    setOtpDigits(newDigits);
    const focusIdx = Math.min(pasted.length, 5);
    inputRefs.current[focusIdx]?.focus();
    if (pasted.length === 6) setTimeout(() => handleVerifyOtp(), 150);
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-surface-bg" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.06) 0%, transparent 60%)' }} />
      <div className="absolute inset-0 opacity-[0.01] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
            {otpState ? <ShieldCheck size={22} className="text-white" /> : <Zap size={22} className="text-white" />}
          </div>
          <h1 className="text-2xl font-bold text-white">
            {otpState ? 'Two-Step Verification' : 'Welcome back'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {otpState
              ? <>We sent a code to <span className="text-brand-blue font-medium">{otpState.email}</span></>
              : 'Sign in to your SkillForce account'}
          </p>
        </div>

        <div className="glass-card p-7">
          {!otpState ? (
            /* ── STEP 1: Credentials ─────────────────────────────────── */
            <>
              <form onSubmit={handleCredentials} noValidate className="flex flex-col gap-5">
                <div>
                  <label className="label" htmlFor="login-email">Email address</label>
                  <input
                    id="login-email"
                    className={errors.email ? 'input-error' : 'input'}
                    type="email" placeholder="you@company.com"
                    autoComplete="email"
                    value={form.email} onChange={set('email')}
                  />
                  {errors.email && <p className="field-error"><AlertCircle size={12} />{errors.email}</p>}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="label mb-0" htmlFor="login-password">Password</label>
                    <Link to="/change-password" className="text-xs text-brand-blue hover:underline">Forgot password?</Link>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      className={`${errors.password ? 'input-error' : 'input'} pr-11`}
                      type={showPw ? 'text' : 'password'} placeholder="••••••••"
                      autoComplete="current-password"
                      value={form.password} onChange={set('password')}
                    />
                    <button type="button" onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}>
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && <p className="field-error"><AlertCircle size={12} />{errors.password}</p>}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
                  {loading
                    ? <><span className="spinner-sm" />Signing in…</>
                    : <><span>Sign In</span><ArrowRight size={16} /></>}
                </button>
              </form>

              <div className="divider my-5" />
              <p className="text-center text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/register" className="text-brand-blue hover:underline font-medium">Create one free</Link>
              </p>
            </>
          ) : (
            /* ── STEP 2: OTP Verification ────────────────────────────── */
            <div className="flex flex-col gap-5">
              {/* OTP digit inputs */}
              <div>
                <label className="label text-center block mb-3">Enter verification code</label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => inputRefs.current[i] = el}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 bg-surface-bg text-white
                        focus:outline-none focus:border-brand-blue focus:shadow-glow-sm transition-all duration-200
                        ${otpError ? 'border-red-500/50 shake' : digit ? 'border-brand-blue/50' : 'border-surface-border'}`}
                      aria-label={`Digit ${i + 1}`}
                    />
                  ))}
                </div>
                {otpError && (
                  <p className="field-error text-center mt-3"><AlertCircle size={12} />{otpError}</p>
                )}
              </div>

              {/* Remember device */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={e => setRememberDevice(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-5 h-5 rounded-md border-2 border-surface-border bg-surface-bg
                    peer-checked:bg-brand-blue peer-checked:border-brand-blue transition-all duration-200
                    flex items-center justify-center">
                    {rememberDevice && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Smartphone size={14} className="text-gray-500" />
                  <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                    Remember this device for 30 days
                  </span>
                </div>
              </label>

              {/* Verify button */}
              <button
                onClick={handleVerifyOtp}
                disabled={otpLoading || otpDigits.join('').length !== 6}
                className="btn-primary w-full py-3">
                {otpLoading
                  ? <><span className="spinner-sm" />Verifying…</>
                  : <><ShieldCheck size={16} /><span>Verify & Sign In</span></>}
              </button>

              {/* Resend + Back */}
              <div className="flex items-center justify-between">
                <button onClick={handleBack}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-300 transition-colors">
                  <ArrowLeft size={14} />Back
                </button>
                <button
                  onClick={handleResend}
                  disabled={cooldown > 0 || resendLoading}
                  className={`flex items-center gap-1.5 text-sm transition-colors
                    ${cooldown > 0 ? 'text-gray-600 cursor-not-allowed' : 'text-brand-blue hover:text-brand-blue/80'}`}>
                  <RefreshCw size={13} className={resendLoading ? 'animate-spin' : ''} />
                  {resendLoading ? 'Sending…' : cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </button>
              </div>

              {/* Info text */}
              <p className="text-center text-xs text-gray-600 mt-1">
                Check your email inbox and spam folder. Code expires in 5 minutes.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
