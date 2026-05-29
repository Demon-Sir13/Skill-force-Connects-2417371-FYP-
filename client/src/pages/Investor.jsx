import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Zap, ArrowRight, CheckCircle, Shield, Briefcase,
  DollarSign, Target, Globe, Users,
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };

function Section({ label, children }) {
  return (
    <section className="py-20 px-4 border-b border-white/[0.04]">
      <div className="max-w-4xl mx-auto">
        <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-[0.2em] mb-10">{label}</p>
        {children}
      </div>
    </section>
  );
}

export default function Investor() {
  return (
    <div className="overflow-x-hidden bg-noise">

      {/* ── COVER ── */}
      <section className="py-28 px-4 border-b border-white/[0.04]">
        <div className="max-w-4xl mx-auto">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-lg">SkillForce Connect</p>
                <p className="text-gray-500 text-sm">Nepal Workforce Marketplace</p>
              </div>
            </motion.div>

            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
              Formalizing Nepal's<br />Informal Workforce
            </motion.h1>

            <motion.p variants={fadeUp} className="text-gray-400 text-lg max-w-2xl mb-10 leading-relaxed">
              A digital platform connecting verified service providers with organizations through trust infrastructure, digital contracts, and NPR payments.
            </motion.p>

            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 max-w-md">
              {[
                { val: '₨120B+', label: 'Market Size' },
                { val: '76%',    label: 'Informal Labor' },
                { val: '3%',     label: 'Current Online Rate' },
              ].map(({ val, label }) => (
                <div key={label} className="card p-4 text-center">
                  <p className="text-xl font-bold text-white">{val}</p>
                  <p className="text-[11px] text-gray-500 mt-1">{label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── SLIDE 1: THE PROBLEM ── */}
      <Section label="01 — Problem Statement">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Nepal's Workforce is Largely Informal
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 text-sm mb-10 max-w-2xl leading-relaxed">
            Over 4 million Nepali workers operate without formal contracts, verified credentials, or digital identity. Hiring relies on word-of-mouth, cash payments, and zero accountability.
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { stat: '76%',   label: 'Informal Workforce',       desc: 'Workers without formal employment contracts or legal protection.' },
              { stat: '68%',   label: 'Credential Verification Gap', desc: 'Organizations cannot verify provider credentials before hiring.' },
              { stat: '12M+',  label: 'Undigitized Workers',      desc: 'Skilled workers with no digital profile, portfolio, or rating.' },
              { stat: '₨40B+', label: 'Annual Economic Loss',     desc: 'Estimated loss from inefficient hiring and unverified placements.' },
              { stat: '3%',    label: 'Online Hiring Rate',        desc: 'Only 3% of Nepali hiring happens through digital platforms.' },
              { stat: '28%',   label: 'Gig Economy Growth (YoY)', desc: 'Growing fast — but with no trusted platform to support it.' },
            ].map(({ stat, label, desc }) => (
              <motion.div key={label} variants={fadeUp}
                className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                <p className="text-2xl font-bold text-white mb-1">{stat}</p>
                <p className="text-xs font-semibold text-gray-400 mb-2">{label}</p>
                <p className="text-gray-600 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </Section>

      {/* ── SLIDE 2: THE SOLUTION ── */}
      <Section label="02 — Proposed Solution">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-white mb-3">
            SkillForce Connect
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 text-sm mb-10 max-w-2xl leading-relaxed">
            A full-stack workforce marketplace built for Nepal — with NPR payments, AI-powered trust scoring, digital contracts, and district-level coverage.
          </motion.p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div variants={stagger} className="space-y-3">
              {[
                { icon: Shield,     title: 'Trust Infrastructure',    desc: 'AI trust scores, verified badges, and application-based hiring prevent fraud and mis-hires.' },
                { icon: Briefcase,  title: 'Digital Contracts',       desc: 'Auto-generated contracts with digital signatures bring formality to every engagement.' },
                { icon: DollarSign, title: 'NPR Payment Integration', desc: 'Khalti and eSewa integration — workers get paid digitally with a full transaction trail.' },
                { icon: Target,     title: 'AI-Powered Matching',     desc: 'Smart scoring matches providers to jobs based on skills, ratings, and success history.' },
                { icon: Globe,      title: 'District-Level Coverage', desc: 'All 77 districts supported with local categories: security, healthcare, cleaning, electrical.' },
              ].map(({ icon: Icon, title, desc }) => (
                <motion.div key={title} variants={fadeUp}
                  className="flex gap-4 p-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-gray-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-0.5">{title}</p>
                    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <div className="card p-6 h-full">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">System Architecture</p>
                <div className="space-y-3">
                  {[
                    { layer: 'Provider Layer',   items: ['Profile & Portfolio', 'Trust Score', 'Availability', 'Earnings'] },
                    { layer: 'Organization Layer', items: ['Job Posting', 'Applicant Management', 'Contract Generator', 'Analytics'] },
                    { layer: 'Trust Layer',      items: ['Verification Badges', 'AI Match Scoring', 'Review System'] },
                    { layer: 'Payment Layer',    items: ['Khalti', 'eSewa', 'Subscription Plans', 'Transaction History'] },
                  ].map(({ layer, items }) => (
                    <div key={layer} className="p-3 rounded-lg bg-surface-hover border border-surface-border">
                      <p className="text-xs font-semibold text-gray-400 mb-2">{layer}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {items.map(item => (
                          <span key={item} className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 border border-white/[0.04]">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </Section>

      {/* ── SLIDE 5: REVENUE MODEL ── */}
      <Section label="05 — Revenue Model">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
          <motion.h2 variants={fadeUp} className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Revenue Streams
          </motion.h2>
          <motion.p variants={fadeUp} className="text-gray-500 text-sm mb-10 max-w-2xl leading-relaxed">
            Multiple revenue streams designed for Nepal's market. Subscription-led with transaction and service revenue.
          </motion.p>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {[
              { stream: 'Subscription Plans',   amount: '₨150 – ₨999/mo', desc: 'Pro and Enterprise plans for organizations and providers. Recurring monthly revenue.', pct: '45%' },
              { stream: 'Transaction Fees',     amount: '2.5% per contract', desc: 'Fee on each completed contract. Scales directly with platform usage volume.', pct: '30%' },
              { stream: 'Featured Listings',    amount: '₨500 – ₨2,000',  desc: 'Organizations pay to feature jobs at the top of search results.', pct: '12%' },
              { stream: 'Messaging Unlock',     amount: '₨150 one-time',   desc: 'Free users pay to unlock unlimited messaging. Low friction conversion.', pct: '8%' },
              { stream: 'Verification Services',amount: '₨300 per check',  desc: 'Background checks and credential verification for providers.', pct: '5%' },
            ].map(({ stream, amount, desc, pct }) => (
              <motion.div key={stream} variants={fadeUp}
                className="p-5 rounded-xl border border-white/[0.06] bg-white/[0.02] flex flex-col gap-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white font-semibold text-sm">{stream}</p>
                  <span className="text-[10px] font-bold text-gray-500 shrink-0">{pct}</span>
                </div>
                <p className="text-brand-blue text-xs font-medium">{amount}</p>
                <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="card p-6">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-5">Unit Economics</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
              {[
                { label: 'Avg Revenue / User', value: '₨1,800/yr' },
                { label: 'Gross Margin',        value: '78%' },
                { label: 'CAC (estimated)',      value: '₨450' },
                { label: 'LTV : CAC',            value: '4 : 1' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xl font-bold text-white mb-1">{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* ── CLOSING ── */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="card p-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                <Zap size={18} className="text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">SkillForce Connect</h2>
            </div>
            <p className="text-gray-500 text-sm mb-8 max-w-md mx-auto leading-relaxed">
              A Final Year Project addressing Nepal's informal workforce challenge through technology, trust, and digital payments.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link to="/register" className="btn-primary px-8 py-3">Try the Platform <ArrowRight size={15} /></Link>
              <Link to="/about" className="btn-outline px-8 py-3">Learn More</Link>
            </div>
            <p className="text-xs text-gray-700 mt-6">
              Tribhuvan University · Final Year Project · 2024
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
