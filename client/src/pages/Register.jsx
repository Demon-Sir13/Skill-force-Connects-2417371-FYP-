import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Eye, EyeOff, Building2, Wrench, ArrowRight, AlertCircle, Users, Briefcase } from 'lucide-react';

const getStrength = (pw) => {
  if (!pw) return null;
  if (pw.length < 6) return { label: 'Too short', w: '20%', color: 'bg-red-500' };
  if (pw.length < 8) return { label: 'Weak', w: '40%', color: 'bg-orange-500' };
  if (/[A-Z]/.test(pw) && /\d/.test(pw) && pw.length >= 10) return { label: 'Strong', w: '100%', color: 'bg-emerald-500' };
  return { label: 'Fair', w: '65%', color: 'bg-yellow-500' };
};

function validate(form) {
  const errs = {};
  if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
  if (!form.email.trim()) errs.email = 'Email is required';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
  if (!form.password) errs.password = 'Password is required';
  else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
  return errs;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'provider', orgType: '' });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const strength = getStrength(form.password);

  const set = (f) => (e) => {
    setForm(prev => ({ ...prev, [f]: e.target.value }));
    if (errors[f]) setErrors(prev => ({ ...prev, [f]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    try {
      const user = await register(form.name.trim(), form.email.trim().toLowerCase(), form.password, form.role);
      toast.success('Account created! Welcome to SkillForce Nepal');
      navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      toast.error(msg);
      if (msg.toLowerCase().includes('email')) setErrors({ email: msg });
    } finally { setLoading(false); }
  };

  const roles = [
    { value: 'provider', label: 'Individual Provider', sub: 'Freelancer, electrician, nurse, etc.', icon: Wrench, color: 'brand-blue' },
    { value: 'organization', orgType: 'hiring', label: 'Hiring Organization', sub: 'Post jobs & hire talent', icon: Building2, color: 'brand-indigo' },
    { value: 'organization', orgType: 'service_provider', label: 'Service Provider Org', sub: 'Security, cleaning, staffing', icon: Users, color: 'emerald-400' },
  ];

  const selectRole = (r) => {
    setForm(f => ({ ...f, role: r.value, orgType: r.orgType || '' }));
  };

  const isSelected = (r) => form.role === r.value && form.orgType === (r.orgType || '');

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-surface-bg" />
      <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />

      <div className="w-full max-w-md animate-fade-in-up relative z-10">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center mx-auto mb-5 shadow-glow-sm">
            <Zap size={22} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Join SkillForce Nepal</h1>
          <p className="text-gray-500 text-sm mt-2">Nepal's premium workforce marketplace</p>
        </div>

        <div className="glass-card p-7">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Role selector - 3 roles */}
            <div>
              <label className="label">I am a…</label>
              <div className="grid grid-cols-1 gap-2.5">
                {roles.map((r) => (
                  <button key={r.label} type="button" onClick={() => selectRole(r)}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 ${
                      isSelected(r)
                        ? `border-${r.color}/50 bg-${r.color}/10 shadow-glow-sm`
                        : 'border-surface-border hover:border-surface-border/80 bg-surface-input'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected(r) ? `bg-${r.color}/20` : 'bg-surface-hover'
                    }`}>
                      <r.icon size={18} className={isSelected(r) ? `text-${r.color}` : 'text-gray-500'} />
                    </div>
                    <div>
                      <span className={`text-sm font-semibold ${isSelected(r) ? 'text-white' : 'text-gray-300'}`}>{r.label}</span>
                      <p className="text-[11px] text-gray-500 leading-tight">{r.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="label" htmlFor="reg-name">{form.role === 'organization' ? 'Organization Name' : 'Full Name'}</label>
              <input id="reg-name" className={errors.name ? 'input-error' : 'input'}
                placeholder={form.role === 'organization' ? 'e.g. Summit Media Strategies' : 'e.g. Aarav Sharma'}
                autoComplete="name" value={form.name} onChange={set('name')} />
              {errors.name && <p className="field-error"><AlertCircle size={12} />{errors.name}</p>}
            </div>

            <div>
              <label className="label" htmlFor="reg-email">Email address</label>
              <input id="reg-email" className={errors.email ? 'input-error' : 'input'}
                type="email" placeholder="you@company.com.np" autoComplete="email"
                value={form.email} onChange={set('email')} />
              {errors.email && <p className="field-error"><AlertCircle size={12} />{errors.email}</p>}
            </div>

            <div>
              <label className="label" htmlFor="reg-password">Password</label>
              <div className="relative">
                <input id="reg-password" className={`${errors.password ? 'input-error' : 'input'} pr-11`}
                  type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" autoComplete="new-password"
                  value={form.password} onChange={set('password')} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                  aria-label={showPw ? 'Hide password' : 'Show password'}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="field-error"><AlertCircle size={12} />{errors.password}</p>}
              {strength && !errors.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex-1 h-1 rounded-full bg-surface-border overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-500 ${strength.color}`} style={{ width: strength.w }} />
                  </div>
                  <span className="text-xs text-gray-500 w-14 text-right">{strength.label}</span>
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-1">
              {loading ? <><span className="spinner-sm" />Creating account…</> : <><span>Create Account</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="divider my-5" />
          <p className="text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-blue hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
