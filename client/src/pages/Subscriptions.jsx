import { useEffect, useState } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { CheckCircle, Crown, Zap, Star, ArrowRight, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const PLAN_DETAILS = {
  free: { name: 'Free', price: '₨0', period: 'forever', icon: Zap },
  pro: { name: 'Pro', price: '₨150', period: '/month', icon: Star },
  enterprise: { name: 'Enterprise', price: '₨999', period: '/month', icon: Crown },
};

export default function Subscriptions() {
  const [current, setCurrent] = useState(null);
  const [plans, setPlans] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState('');

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
      const { data } = await api.post('/payments/subscribe', { plan });

      // If backend returned a payment URL → redirect to PeriPay gateway
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }

      // Otherwise it was auto-approved (free plan or dev mode)
      setCurrent(data.subscription || data);
      toast.success(plan === 'free' ? 'Switched to free plan' : `Upgraded to ${plan} plan!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    } finally { setUpgrading(''); }
  };

  if (loading) return <div className="page"><div className="card h-64 animate-pulse bg-surface-hover" /></div>;

  return (
    <div className="page max-w-4xl">
      <div className="text-center mb-12">
        <p className="text-brand-blue/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Subscription</p>
        <h1 className="text-2xl font-bold text-white mb-2">Choose Your Plan</h1>
        <p className="text-gray-500 text-sm">Pay with Khalti in NPR. Upgrade anytime.</p>
        {current && (
          <div className="inline-flex items-center gap-2 mt-5 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05]">
            <span className="text-sm text-gray-500">Current:</span>
            <span className="text-sm font-semibold text-brand-blue">{PLAN_DETAILS[current.plan]?.name || current.plan}</span>
          </div>
        )}
      </div>

      <motion.div initial="hidden" animate="visible" variants={stagger}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(plans || {}).map(([key, plan]) => {
          const detail = PLAN_DETAILS[key];
          const isCurrent = current?.plan === key;
          const isPro = key === 'pro';
          const Icon = detail?.icon || Zap;
          return (
            <motion.div key={key} variants={fadeUp} className={`relative group ${isPro ? 'md:-mt-3 md:mb-3' : ''}`}>
              {isPro && (
                <div className="absolute -inset-[1px] bg-gradient-brand rounded-2xl opacity-15 group-hover:opacity-25 transition-opacity duration-500" />
              )}
              <div className={`relative card p-7 h-full flex flex-col ${isPro ? 'border-brand-blue/20' : ''}`}>
                {isPro && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-brand-blue bg-brand-blue/10 border border-brand-blue/20 px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                )}
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
                  <Icon size={18} className="text-gray-500" />
                </div>
                <h3 className="text-sm font-semibold text-gray-400">{detail?.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold text-white">{detail?.price}</span>
                  <span className="text-gray-600 text-sm">{detail?.period}</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {(plan.features || []).map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                      <CheckCircle size={13} className="text-emerald-500/50 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(key)}
                  disabled={isCurrent || upgrading === key}
                  className={isCurrent ? 'btn-ghost w-full cursor-default opacity-60' : isPro ? 'btn-primary w-full' : 'btn-outline w-full'}>
                  {upgrading === key ? <><span className="spinner-sm" />Processing...</>
                    : isCurrent ? 'Current Plan'
                    : <>{key === 'free' ? 'Downgrade' : 'Upgrade'} <ArrowRight size={14} /></>}
                </button>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      <div className="mt-10 text-center">
        <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-full px-6 py-3">
          <span className="text-lg">💳</span>
          <span className="text-sm text-gray-500">Payments via</span>
          <span className="text-sm font-semibold text-emerald-400">Khalti</span>
          <span className="text-sm text-gray-500">in NPR</span>
        </div>
      </div>
    </div>
  );
}
