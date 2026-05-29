import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, CheckCircle, TrendingUp, Globe, Shield,
  Users, Briefcase, DollarSign, Target, MapPin, Award,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } };

export default function About() {
  return (
    <div className="overflow-x-hidden bg-noise">

      {/* ── HERO ── */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-surface-bg" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-30 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(14,165,233,0.07) 0%, transparent 60%)' }} />
        <motion.div initial="hidden" animate="visible" variants={stagger}
          className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-full px-5 py-2 mb-8">
            <span className="text-base">🇳🇵</span>
            <span className="text-gray-400 text-sm">About SkillForce Connect</span>
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Formalizing Nepal's<br />
            <span className="gradient-text">Informal Workforce</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-10">
            SkillForce Connect is Nepal's first full-stack workforce marketplace — connecting verified providers with organizations through trust, contracts, and NPR payments.
          </motion.p>
          <motion.div variants={fadeUp} className="flex gap-4 justify-center flex-wrap">
            <Link to="/register" className="btn-primary px-8 py-3">Get Started <ArrowRight size={16} /></Link>
            <Link to="/investor" className="btn-outline px-8 py-3">Investor Deck</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* ── MISSION ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-brand-blue/70 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Our Mission</motion.p>
              <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-6">
                Bringing Dignity and Trust to Nepal's Workforce
              </motion.h2>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  'Digitize Nepal\'s 4M+ informal workers with verified profiles and trust scores',
                  'Replace cash-and-handshake hiring with formal digital contracts',
                  'Enable NPR payments through Khalti and eSewa — no USD barriers',
                  'Create a transparent, merit-based hiring ecosystem across all 77 districts',
                  'Scale the model to South Asia\'s 500M+ informal workforce',
                ].map(item => (
                  <motion.div key={item} variants={fadeUp} className="flex items-start gap-3">
                    <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-gray-400 text-sm leading-relaxed">{item}</p>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={scaleIn} transition={{ duration: 0.7 }}>
              <div className="card p-6 space-y-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">Nepal by the Numbers</p>
                {[
                  { label: 'Informal workforce', value: '76%', color: 'text-red-400' },
                  { label: 'Workers without digital identity', value: '12M+', color: 'text-yellow-400' },
                  { label: 'Annual informal labor market', value: '₨120B+', color: 'text-emerald-400' },
                  { label: 'Smartphone penetration (2024)', value: '68%', color: 'text-brand-blue' },
                  { label: 'Gig economy annual growth', value: '28%', color: 'text-brand-indigo' },
                  { label: 'Online hiring rate (current)', value: '3%', color: 'text-gray-400' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                    <span className="text-sm text-gray-400">{label}</span>
                    <span className={`text-lg font-extrabold ${color}`}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── THE PROBLEM IN DEPTH ── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none opacity-40" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-red-400/70 text-xs font-semibold uppercase tracking-[0.2em] mb-3">The Problem</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">Five Broken Systems We Fix</motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: '🏚️', title: 'Informal Labor Market',
                problem: '76% of Nepal\'s workforce operates without formal employment — no contracts, no benefits, no legal protection.',
                fix: 'SkillForce generates digital contracts for every engagement, creating a formal paper trail.',
              },
              {
                icon: '🤝', title: 'Trust Gap in Hiring',
                problem: 'Organizations can\'t verify provider credentials. Fake CVs, inflated experience, and zero accountability are rampant.',
                fix: 'AI-powered trust scores, verified badges, and application-based hiring prevent fraud.',
              },
              {
                icon: '📱', title: 'No Digital Identity',
                problem: 'Skilled workers — electricians, nurses, security guards — have no portfolio, no rating, no online presence.',
                fix: 'Every provider gets a professional profile with skills, ratings, portfolio, and verified work history.',
              },
              {
                icon: '💸', title: 'Payment Insecurity',
                problem: 'Cash-only transactions with no escrow, no receipts, and no recourse when payment is withheld.',
                fix: 'Khalti and eSewa integration with contract-linked payment release on work approval.',
              },
              {
                icon: '🌐', title: 'Workforce Fragmentation',
                problem: 'Talent is scattered across 77 districts with no central discovery layer. Hiring relies on personal networks.',
                fix: 'District-level search, AI matching, and a national provider directory solve discovery.',
              },
              {
                icon: '📊', title: 'No Market Intelligence',
                problem: 'Organizations have no data on market rates, provider availability, or hiring trends in their sector.',
                fix: 'Analytics dashboard, match scores, and market rate benchmarks give organizations real intelligence.',
              },
            ].map(({ icon, title, problem, fix }) => (
              <motion.div key={title} variants={fadeUp}
                className="card p-6 flex flex-col gap-4 group hover:border-brand-blue/20 transition-all duration-300">
                <span className="text-2xl">{icon}</span>
                <h3 className="text-white font-bold text-sm">{title}</h3>
                <div>
                  <p className="text-[10px] font-semibold text-red-400/70 uppercase tracking-wide mb-1">Problem</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{problem}</p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wide mb-1">Our Fix</p>
                  <p className="text-gray-400 text-xs leading-relaxed">{fix}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY NEPAL FIRST ── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-emerald-400/70 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Strategy</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">Why Nepal First?</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 max-w-2xl mx-auto text-sm leading-relaxed">
              Nepal is the perfect proving ground — high smartphone adoption, growing gig economy, underserved by global platforms, and a government pushing digital transformation.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: '📱', title: 'Mobile-First Nation', desc: '68% smartphone penetration with Khalti and eSewa already mainstream. Digital payments are normalized.' },
              { icon: '🏗️', title: 'Infrastructure Gap', desc: 'No dominant local workforce platform exists. The market is wide open for a Nepal-native solution.' },
              { icon: '🎓', title: 'Young Workforce', desc: 'Median age of 24. A tech-savvy generation entering the workforce and demanding digital tools.' },
              { icon: '🌏', title: 'Diaspora Opportunity', desc: '4M+ Nepalis abroad send ₨1.2T in remittances. Many want to hire back home — a unique demand driver.' },
            ].map(({ icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp}
                className="card p-5 text-center flex flex-col items-center gap-3 group hover:border-emerald-500/20 transition-all duration-300">
                <span className="text-3xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
                <p className="text-white font-semibold text-sm">{title}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── SCALING VISION ── */}
      <section className="py-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none opacity-30" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-brand-indigo/70 text-xs font-semibold uppercase tracking-[0.2em] mb-3">Vision</motion.p>
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-white mb-4">Nepal → South Asia → Global</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 max-w-2xl mx-auto text-sm">
              The informal workforce problem is not unique to Nepal. It affects 2 billion workers globally. We start here, prove the model, then scale.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                flag: '🇳🇵', region: 'Nepal', timeline: '2024–2026',
                color: 'border-brand-blue/30 bg-brand-blue/5',
                metrics: ['77 districts covered', '100K+ providers', '10K+ organizations', '₨80M ARR'],
                desc: 'Prove the model. Build trust infrastructure. Establish NPR payment rails. Become the default hiring platform for Nepal.',
              },
              {
                flag: '🌏', region: 'South Asia', timeline: '2026–2028',
                color: 'border-brand-indigo/30 bg-brand-indigo/5',
                metrics: ['Bangladesh, Sri Lanka, Myanmar', '1M+ providers', 'Multi-currency support', '₨500M ARR'],
                desc: 'Replicate the Nepal playbook in neighboring markets with similar informal workforce challenges and mobile payment ecosystems.',
              },
              {
                flag: '🌍', region: 'Emerging Markets', timeline: '2028+',
                color: 'border-yellow-400/30 bg-yellow-400/5',
                metrics: ['Africa, Southeast Asia', '10M+ providers', 'Diaspora remittance integration', '₨2B+ ARR'],
                desc: 'Target the 2 billion informal workers globally. Partner with local payment providers. Build the world\'s trust layer for informal work.',
              },
            ].map(({ flag, region, timeline, color, metrics, desc }) => (
              <motion.div key={region} variants={fadeUp}
                className={`card p-6 border ${color} flex flex-col gap-4`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{flag}</span>
                  <div>
                    <p className="text-white font-bold">{region}</p>
                    <p className="text-xs text-gray-500">{timeline}</p>
                  </div>
                </div>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
                <ul className="space-y-1.5 mt-auto">
                  {metrics.map(m => (
                    <li key={m} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle size={11} className="text-emerald-400/60 shrink-0" />{m}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-4">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center">
          <div className="card p-14 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-mesh pointer-events-none opacity-50" />
            <div className="relative z-10">
              <p className="text-3xl mb-5">🇳🇵</p>
              <h2 className="text-3xl font-bold text-white mb-4">Join the Movement</h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
                Be part of Nepal's workforce transformation. Whether you're a provider, organization, or investor — there's a place for you.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Link to="/register" className="btn-primary px-8 py-3">Create Account <ArrowRight size={16} /></Link>
                <Link to="/investor" className="btn-outline px-8 py-3">View Investor Deck</Link>
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
