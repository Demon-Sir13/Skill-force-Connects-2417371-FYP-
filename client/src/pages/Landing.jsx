import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  Zap, Shield, Users, TrendingUp, ArrowRight, CheckCircle, Star,
  Briefcase, Globe, Award, MessageSquare, DollarSign,
  Building2, Wrench, MapPin, FileText, Lock, Play, ChevronRight,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } };

function AnimatedCounter({ value, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const numericValue = parseInt(value.replace(/[^0-9]/g, ''));

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = numericValue / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numericValue) { setCount(numericValue); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, numericValue]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

function TypingText() {
  const words = ['Hire Talent', 'Find Work', 'Build Teams', 'Grow Business'];
  const [index, setIndex] = useState(0);
  const [text, setText] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[index];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setDeleting(true), 1500);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length === 0) { setDeleting(false); setIndex((index + 1) % words.length); }
      }
    }, deleting ? 50 : 100);
    return () => clearTimeout(timeout);
  }, [text, deleting, index]);

  return (
    <span className="gradient-text">
      {text}<span className="animate-pulse text-brand-blue">|</span>
    </span>
  );
}

const features = [
  { icon: Shield, title: 'Verified Profiles', desc: 'Trust scores and verification badges ensure every provider meets quality standards.' },
  { icon: MessageSquare, title: 'Real-time Chat', desc: 'Built-in messaging with read receipts. First 10 messages free, then unlock via Khalti.' },
  { icon: TrendingUp, title: 'Smart Matching', desc: 'Intelligent matching connects you with the right talent based on skills and ratings.' },
  { icon: DollarSign, title: 'Khalti Payments', desc: 'Pay in NPR through Khalti. Subscriptions, message unlocks, and job payments.' },
  { icon: FileText, title: 'Contract Generator', desc: 'Auto-generate professional contracts with digital signatures and tracking.' },
  { icon: Lock, title: 'Two-Step Verification', desc: 'Secure login with OTP verification, account lockout, and trusted devices.' },
];

const stats = [
  { value: '12000', suffix: '+', label: 'Service Providers', icon: Users },
  { value: '3400', suffix: '+', label: 'Organizations', icon: Building2 },
  { value: '98', suffix: '%', label: 'Satisfaction Rate', icon: Star },
  { value: '24', suffix: 'M+', label: 'Paid in NPR', icon: DollarSign },
];

const testimonials = [
  { name: 'Rajesh Shrestha', role: 'CEO, Summit Media', text: 'SkillForce Nepal cut our hiring time by 70%. Finding verified designers and developers in Kathmandu has never been easier.', rating: 5 },
  { name: 'Aarav Sharma', role: 'Freelance Designer', text: 'I landed 3 long-term contracts in my first month. The trust score system and Khalti payments make everything smooth.', rating: 5 },
  { name: 'Dr. Sunita Joshi', role: 'Director, City Hospital', text: 'We use SkillForce for all our staffing needs. The contract generator saves us hours of paperwork.', rating: 5 },
  { name: 'Bikash Gurung', role: 'Full-Stack Developer', text: 'Clean interface, fast NPR payments via Khalti, and great clients. This is where serious professionals work.', rating: 5 },
];

const categories = [
  { name: 'Development', count: '2,400+', icon: '💻' },
  { name: 'Design', count: '1,800+', icon: '🎨' },
  { name: 'Security', count: '1,200+', icon: '🛡️' },
  { name: 'Healthcare', count: '900+', icon: '🏥' },
  { name: 'Cleaning', count: '600+', icon: '✨' },
  { name: 'Electrical', count: '800+', icon: '⚡' },
];

const districts = ['Kathmandu', 'Lalitpur', 'Bhaktapur', 'Pokhara', 'Chitwan', 'Biratnagar'];

export default function Landing() {
  return (
    <div className="overflow-x-hidden bg-noise">

      {/* ── HERO — Full-screen cinematic ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-surface-bg" />
        <div className="absolute top-[-30%] left-1/2 -translate-x-1/2 w-[1200px] h-[1200px] rounded-full opacity-60 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.04) 40%, transparent 70%)' }} />
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full opacity-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        {/* Floating glass cards */}
        <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[18%] left-[8%] hidden xl:block z-10">
          <div className="glass-card p-4 pr-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle size={16} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Job Completed</p>
                <p className="text-sm font-semibold text-white">React Dashboard</p>
                <p className="text-xs text-emerald-400">₨200,000</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [8, -8, 8] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[28%] right-[6%] hidden xl:block z-10">
          <div className="glass-card p-4 pr-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center">
                <DollarSign size={16} className="text-brand-blue" />
              </div>
              <div>
                <p className="text-[10px] text-gray-500">Khalti Payment</p>
                <p className="text-sm font-semibold text-emerald-400">+₨75,000</p>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [-6, 10, -6] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[22%] left-[12%] hidden xl:block z-10">
          <div className="glass-card p-3 px-4">
            <div className="flex items-center gap-2">
              <MapPin size={12} className="text-brand-blue" />
              <span className="text-[11px] text-gray-400">Kathmandu</span>
              <span className="text-[11px] text-emerald-400">• 340 online</span>
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ y: [6, -10, 6] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-[30%] right-[10%] hidden xl:block z-10">
          <div className="glass-card p-3 px-4">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {['bg-brand-blue', 'bg-brand-indigo', 'bg-emerald-500'].map((c, i) => (
                  <div key={i} className={`w-5 h-5 rounded-full ${c} border-2 border-surface-bg`} />
                ))}
              </div>
              <span className="text-[11px] text-gray-400">+2.4k hired this week</span>
            </div>
          </div>
        </motion.div>

        {/* Hero content */}
        <motion.div initial="hidden" animate="visible" variants={stagger} className="relative max-w-5xl mx-auto text-center px-4 z-10">
          <motion.div variants={fadeUp} transition={{ duration: 0.7 }}
            className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-5 py-2 mb-10 backdrop-blur-sm">
            <span className="text-base">🇳🇵</span>
            <span className="text-gray-400 text-sm">Nepal's #1 Workforce Marketplace</span>
            <ChevronRight size={14} className="text-gray-600" />
          </motion.div>

          <motion.h1 variants={fadeUp} transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-[5.5rem] font-extrabold leading-[1.05] tracking-tight mb-8">
            <span className="text-white">The Smartest Way to</span>
            <br />
            <TypingText />
          </motion.h1>

          <motion.p variants={fadeUp} transition={{ duration: 0.7, delay: 0.2 }}
            className="text-gray-500 text-lg sm:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Connect with verified providers, hire top talent, and manage your workforce with PeriPay payments in NPR.
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
            <Link to="/register" className="btn-primary text-base px-10 py-4 shadow-glow-blue hover:shadow-glow-lg transition-all duration-500">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/jobs" className="glass-button inline-flex items-center justify-center gap-2 text-base px-10 py-4 text-gray-300 font-semibold">
              <Play size={16} className="text-brand-blue" /> Explore Jobs
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} transition={{ duration: 0.7, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            {['No credit card needed', 'Pay with Khalti', 'Verified providers'].map(t => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-emerald-500/60" />{t}
              </span>
            ))}
          </motion.div>

          {/* Dashboard mockup preview */}
          <motion.div variants={scaleIn} transition={{ duration: 1, delay: 0.6 }}
            className="mt-20 relative mx-auto max-w-4xl">
            <div className="absolute -inset-4 bg-gradient-brand opacity-[0.06] rounded-3xl blur-2xl" />
            <div className="relative glass-card p-1 rounded-2xl overflow-hidden">
              <div className="bg-surface-bg rounded-xl p-4 sm:p-6">
                {/* Mock browser bar */}
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/[0.04]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                  </div>
                  <div className="flex-1 mx-4 h-6 rounded-lg bg-white/[0.03] flex items-center px-3">
                    <span className="text-[10px] text-gray-600">skillforce.com.np/dashboard</span>
                  </div>
                </div>
                {/* Mock dashboard content */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  {[
                    { label: 'Open Jobs', val: '24', color: 'text-brand-blue' },
                    { label: 'In Progress', val: '8', color: 'text-yellow-400' },
                    { label: 'Completed', val: '156', color: 'text-emerald-400' },
                    { label: 'Revenue', val: '₨2.4M', color: 'text-brand-indigo' },
                  ].map(s => (
                    <div key={s.label} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04]">
                      <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                      <p className="text-[9px] text-gray-600">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="bg-white/[0.02] rounded-xl p-3 border border-white/[0.04] h-20">
                      <div className="h-2 w-16 bg-white/[0.04] rounded mb-2" />
                      <div className="h-2 w-24 bg-white/[0.03] rounded mb-2" />
                      <div className="h-2 w-12 bg-brand-blue/10 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ── STATS ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} variants={stagger}
          className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
          {stats.map(({ value, suffix, label, icon: Icon }) => (
            <motion.div key={label} variants={fadeUp} transition={{ duration: 0.6 }} className="text-center group">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.06] mx-auto mb-4 flex items-center justify-center
                              group-hover:bg-brand-blue/[0.06] group-hover:border-brand-blue/20 transition-all duration-500">
                <Icon size={20} className="text-gray-500 group-hover:text-brand-blue transition-colors duration-500" />
              </div>
              <p className="text-4xl lg:text-5xl font-extrabold text-white mb-2">
                <AnimatedCounter value={value} suffix={suffix} />
              </p>
              <p className="text-gray-600 text-sm">{label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-brand-blue/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Categories</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white">Browse by Category</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map(({ name, count, icon }) => (
              <motion.div key={name} variants={fadeUp}>
                <Link to={`/jobs?category=${name}`}
                  className="card-hover p-5 text-center flex flex-col items-center gap-3 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
                  <p className="font-semibold text-gray-300 text-sm group-hover:text-white transition-colors">{name}</p>
                  <p className="text-[11px] text-gray-600">{count} jobs</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 60%)' }} />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-brand-indigo/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Features</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white mb-4">Built for Nepal's Workforce</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 max-w-lg mx-auto">Everything you need to hire, manage, and pay — in one platform.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp}
                className="card-hover p-6 flex flex-col gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center
                                group-hover:bg-brand-blue/[0.06] group-hover:border-brand-blue/20 transition-all duration-500">
                  <Icon size={18} className="text-gray-500 group-hover:text-brand-blue transition-colors duration-500" />
                </div>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── 3 ROLES ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-brand-blue/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Get Started</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Choose Your Role</h2>
          </div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {[
              { icon: Wrench, title: 'Individual Provider', desc: 'Freelancers, electricians, nurses, designers — showcase your skills.', items: ['Professional profile', 'Smart job matching', 'Trust score & ratings', 'Khalti earnings'], gradient: 'from-brand-blue/20 to-cyan-400/20' },
              { icon: Building2, title: 'Hiring Organization', desc: 'Hospitals, agencies, companies — find verified talent across Nepal.', items: ['Post unlimited jobs', 'Browse providers', 'Contract generator', 'Analytics dashboard'], gradient: 'from-brand-indigo/20 to-purple-400/20' },
              { icon: Users, title: 'Service Provider Org', desc: 'Security agencies, cleaning companies — offer your team\'s services.', items: ['Team service listings', 'Organization portfolio', 'Bulk hiring support', 'Service area coverage'], gradient: 'from-emerald-500/20 to-teal-400/20' },
            ].map(({ icon: Icon, title, desc, items, gradient }) => (
              <motion.div key={title} variants={fadeUp}
                className="card p-7 relative overflow-hidden group hover:border-white/[0.08] transition-all duration-500">
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br ${gradient} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="relative z-10">
                  <div className="w-11 h-11 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5
                                  group-hover:border-white/[0.1] transition-all duration-500">
                    <Icon size={20} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-500 mb-6 text-sm leading-relaxed">{desc}</p>
                  <ul className="space-y-2.5 mb-6">
                    {items.map(item => (
                      <li key={item} className="flex items-center gap-2.5 text-sm text-gray-400">
                        <CheckCircle size={13} className="text-emerald-500/50 shrink-0" />{item}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className="btn-outline text-sm">
                    Get Started <ArrowRight size={14} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none opacity-50" />
        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <p className="text-brand-blue/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">Simple NPR Pricing</h2>
            <p className="text-gray-500">Pay with Khalti. No hidden fees. Cancel anytime.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { plan: 'Free', price: '₨0', period: '/forever', features: ['Basic profile', '5 applications/month', '10 free messages', 'Email support'], cta: 'Start Free', popular: false },
              { plan: 'Pro', price: '₨999', period: '/month', features: ['Verified badge', 'Unlimited applications', 'Unlimited messaging', 'Analytics dashboard', 'Contract generator', 'Priority support'], cta: 'Upgrade to Pro', popular: true },
              { plan: 'Enterprise', price: '₨2,999', period: '/month', features: ['All Pro features', 'Dedicated manager', 'Custom branding', 'API access', 'Team management', 'Priority matching'], cta: 'Contact Sales', popular: false },
            ].map(({ plan, price, period, features: feats, cta, popular }) => (
              <div key={plan} className={`relative group ${popular ? 'md:-mt-4 md:mb-4' : ''}`}>
                {popular && (
                  <div className="absolute -inset-[1px] bg-gradient-brand rounded-2xl opacity-20 group-hover:opacity-30 transition-opacity duration-500" />
                )}
                <div className={`relative card p-7 h-full flex flex-col ${popular ? 'border-brand-blue/20' : ''}`}>
                  {popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-brand-blue bg-brand-blue/10 border border-brand-blue/20 px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  )}
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">{plan}</h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span className="text-3xl font-extrabold text-white">{price}</span>
                    <span className="text-gray-600 text-sm">{period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {feats.map(f => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-gray-400">
                        <CheckCircle size={13} className="text-emerald-500/50 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Link to="/register" className={popular ? 'btn-primary w-full' : 'btn-outline w-full'}>{cta}</Link>
                </div>
              </div>
            ))}
          </div>
          {/* Khalti branding */}
          <div className="mt-10 text-center">
            <div className="inline-flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-full px-6 py-3">
              <span className="text-lg">💳</span>
              <span className="text-sm text-gray-500">All payments processed securely via</span>
              <span className="text-sm font-semibold text-[#5C2D91]">Khalti</span>
              <span className="text-sm text-gray-500">in NPR</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DISTRICTS ── */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-brand-blue/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Coverage</p>
          <h2 className="text-2xl font-bold text-white mb-8">Available Across Nepal</h2>
          <div className="flex flex-wrap justify-center gap-2">
            {districts.map(d => (
              <span key={d} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.02] border border-white/[0.05] text-sm text-gray-400 hover:border-brand-blue/20 hover:text-gray-300 transition-all duration-300 cursor-default">
                <MapPin size={12} className="text-brand-blue/50" />{d}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-brand-blue/60 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-white">Trusted Across Nepal</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {testimonials.map(t => (
              <motion.div key={t.name} variants={fadeUp} className="card-hover p-6 flex flex-col gap-4">
                <div className="flex gap-0.5">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={12} className="text-yellow-500/60 fill-yellow-500/60" />)}
                </div>
                <p className="text-gray-400 text-sm leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-white/[0.04]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center text-white text-xs font-semibold">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-gray-600 text-[11px]">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center relative">
          <div className="absolute -inset-8 bg-gradient-brand opacity-[0.03] rounded-3xl blur-3xl" />
          <div className="relative card p-16 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-mesh pointer-events-none opacity-50" />
            <div className="relative z-10">
              <p className="text-3xl mb-6">🇳🇵</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to get started?</h2>
              <p className="text-gray-500 mb-10 max-w-md mx-auto">
                Join thousands of organizations and providers on SkillForce Nepal.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary text-base px-10 py-4 shadow-glow-blue">Create Free Account <ArrowRight size={18} /></Link>
                <Link to="/jobs" className="btn-outline text-base px-10 py-4">Explore Jobs</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.04] py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center">
                  <Zap size={12} className="text-white" />
                </div>
                <span className="font-bold text-white text-sm">Skill<span className="gradient-text">Force</span></span>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">Nepal's premium workforce marketplace.</p>
            </div>
            <div>
              <p className="text-gray-400 font-medium text-sm mb-3">Platform</p>
              <div className="flex flex-col gap-2">
                {[{ to: '/jobs', label: 'Browse Jobs' }, { to: '/providers', label: 'Find Providers' }, { to: '/register', label: 'Sign Up' }].map(l => (
                  <Link key={l.to} to={l.to} className="text-gray-600 text-sm hover:text-gray-400 transition-colors">{l.label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 font-medium text-sm mb-3">Services</p>
              <div className="flex flex-col gap-2">
                {['Security', 'Cleaning', 'Healthcare'].map(l => (
                  <span key={l} className="text-gray-600 text-sm">{l}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-400 font-medium text-sm mb-3">Company</p>
              <div className="flex flex-col gap-2">
                {['About', 'Privacy', 'Terms'].map(l => (
                  <span key={l} className="text-gray-600 text-sm">{l}</span>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/[0.04] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-700 text-sm">
            <span>© {new Date().getFullYear()} SkillForce Nepal</span>
            <span className="flex items-center gap-2">🇳🇵 Payments by Khalti</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
