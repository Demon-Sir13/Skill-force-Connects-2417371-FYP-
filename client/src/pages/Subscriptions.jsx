import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, Crown, Zap, Star, ArrowRight, Shield, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const PLAN_DETAILS = {
  free:       { name: 'Free',       price: '₨0',   period: 'forever',  icon: Zap,   color: 'text-gray-400',   glow: '' },
  pro:        { name: 'Pro',        price: '₨150',  period: '/month',   icon: Star,  color: 'text-brand-blue', glow: 'shadow-glow-blue' },
  enterprise: { name: 'Enterprise', price: '₨999',  period: '/month',   icon: Crown, color: 'text-yellow-400', glow: '' },
};

const GATEWAY_META = {
  khalti: { label: 'Khalti',  bg: 'bg-[#5C2D91]', logo: '💜' },
  esewa:  { label: 'eSewa',   bg: 'bg-[#60BB46]', logo: '💚' },
};

export default function Subscriptions() {
  const [current, setCurrent] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');
  const [gateway, setGateway] = useState('khalti');

  useEffect(() => {
    Promise.all([
      api.get('/subscriptions/my'),
      api.get('/payments/plans'),
    ]).then(([subRes, planRes]) => {
      setCurrent(subRes.data);
      setPlans(planRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (plan) => {
    if (plan === current?.plan) return;
    setUpgrading(plan);
    try {
      const { data } = await api.post('/payments/subscribe', { plan, gateway });

      // Khalti → redirect to payment URL
      if (data.gateway === 'khalti' && data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // eSewa → build and submit hidden form
      if (data.gateway === 'esewa' && data.params) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.paymentUrl;
        form.style.display = 'none';
        Object.entries(data.params).forEach(([k, v]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = k;
          input.value = String(v);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        return;
      }

      // Auto-approved (free plan or dev mode)
      setCurrent(data.subscription || data);
      toast.success(plan === 'free' ? 'Switched to free plan' : `Upgraded to ${plan} plan!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed. Please try again.');
    } finally {
      setUpgrading('');
    }
  };

  if (loading) return (
    <div className="page max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card h-80 animate-pulse bg-surface-hover" />)}
      </div>
    </div>
  );

  return (
    <div className="page max-w-4xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 mb-4">
          <CreditCard size={12} className="text-brand-blue" />
          <span className="text-xs font-semibold text-brand-blue uppercase tracking-widest">Subscription Plans</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3">Choose Your Plan</h1>
        <p className="text-gray-500 text-sm">Pay securely with Khalti or eSewa in NPR. Cancel anytime.</p>
        {current && (
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.06]">
            <span className="text-sm text-gray-500">Current plan:</span>
            <span className="text-sm font-semibold text-brand-blue capitalize">{current.plan}</span>
            {current.endDate && (
              <span className="text-xs text-gray-600">
                · expires {new Date(current.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Plans grid */}
      <motion.div initial="hidden" animate="visible" variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {Object.entries(plans || {}).map(([key, plan]) => {
          const detail = PLAN_DETAILS[key];
          const isCurrent = current?.plan === key;
          const isPro = key === 'pro';
          const Icon = detail?.icon || Zap;

          return (
            <motion.div key={key} variants={fadeUp} className={`relative group ${isPro ? 'md:-mt-4 md:mb-4' : ''}`}>
              {isPro && (
                <div className="absolute -inset-[1px] bg-gradient-brand rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 blur-sm" />
              )}
              <div className={`relative card p-7 h-full flex flex-col transition-all duration-300 ${
                isPro ? 'border-brand-blue/30 hover:border-brand-blue/50' :
                isCurrent ? 'border-emerald-500/30' : 'hover:border-white/10'
              }`}>
                {isPro && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="text-[10px] font-bold text-white bg-gradient-brand px-3 py-1 rounded-full shadow-glow-sm">
                      MOST POPULAR
                    </span>
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="badge-green text-[10px]">Active</span>
                  </div>
                )}

                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                  isPro ? 'bg-brand-blue/15 border border-brand-blue/20' : 'bg-white/[0.04] border border-white/[0.06]'
                }`}>
                  <Icon size={20} className={detail?.color} />
                </div>

                <h3 className="text-base font-bold text-white mb-1">{detail?.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white">{detail?.price}</span>
                  <span className="text-gray-600 text-sm">{detail?.period}</span>
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {(plan.features || []).map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <CheckCircle size={13} className="text-emerald-500/60 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={isCurrent || !!upgrading}
                  className={`w-full transition-all ${
                    isCurrent ? 'btn-ghost cursor-default opacity-50' :
                    isPro ? 'btn-primary' : 'btn-outline'
                  }`}>
                  {upgrading === key ? (
                    <><span className="spinner-sm" />Processing...</>
                  ) : isCurrent ? (
                    <><CheckCircle size={14} />Current Plan</>
                  ) : (
                    <>{key === 'free' ? 'Downgrade to Free' : `Upgrade to ${detail?.name}`} <ArrowRight size={14} /></>
                  )}
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Payment gateway selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="card p-6 text-center">
        <p className="text-sm font-semibold text-white mb-1">Payment Method</p>
        <p className="text-xs text-gray-500 mb-4">Choose your preferred payment gateway</p>
        <div className="inline-flex items-center gap-2 bg-surface-hover border border-surface-border rounded-xl p-1.5">
          {Object.entries(GATEWAY_META).map(([key, gw]) => (
            <button key={key} onClick={() => setGateway(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                gateway === key
                  ? `${gw.bg} text-white shadow-lg scale-[1.02]`
                  : 'text-gray-400 hover:text-white'
              }`}>
              <span>{gw.logo}</span>
              {gw.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-3">
          {gateway === 'khalti' ? 'Pay with Khalti wallet, bank, or card' : 'Pay with eSewa wallet or bank'}
          {' · '}All transactions in NPR · Secure &amp; encrypted
        </p>
      </motion.div>

      {/* Security note */}
      <div className="flex items-center justify-center gap-2 mt-6 text-gray-600">
        <Shield size={12} />
        <span className="text-xs">Payments secured by {gateway === 'khalti' ? 'Khalti' : 'eSewa'} · 256-bit SSL encryption</span>
      </div>
    </div>
  );
}
