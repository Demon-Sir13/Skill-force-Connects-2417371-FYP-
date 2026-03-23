import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import JobCard from '../components/JobCard';
import {
  Briefcase, Star, MessageSquare, User, ArrowRight,
  Search, DollarSign, ListChecks, Award, TrendingUp, Sparkles, Target,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import Avatar from '../components/Avatar';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

export default function ProviderDashboard() {
  const { user } = useAuth();
  const [openJobs,    setOpenJobs]    = useState([]);
  const [activeJobs,  setActiveJobs]  = useState([]);
  const [profile,     setProfile]     = useState(null);
  const [earnings,    setEarnings]    = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs', { params: { status: 'open' } }),
      api.get('/jobs', { params: { providerId: user._id } }),
      api.get(`/providers/${user._id}`).catch(() => ({ data: null })),
      api.get('/jobs/provider/earnings').catch(() => ({ data: null })),
      api.get('/matching/jobs').catch(() => ({ data: [] })),
    ]).then(([openRes, activeRes, profileRes, earningsRes, matchRes]) => {
      const openData = openRes.data.jobs || openRes.data;
      const activeData = activeRes.data.jobs || activeRes.data;
      setOpenJobs(Array.isArray(openData) ? openData : []);
      setActiveJobs((Array.isArray(activeData) ? activeData : []).filter(j => j.status === 'in-progress'));
      setProfile(profileRes.data);
      setEarnings(earningsRes.data);
      setRecommended(Array.isArray(matchRes.data) ? matchRes.data.slice(0, 6) : []);
    }).finally(() => setLoading(false));
  }, [user._id]);

  const stats = [
    { label: 'Open Jobs',      value: openJobs.length,                      icon: Search,      color: 'text-brand-blue',   bg: 'bg-brand-blue/10',   to: '/jobs' },
    { label: 'Active Jobs',    value: activeJobs.length,                    icon: Briefcase,   color: 'text-yellow-400',   bg: 'bg-yellow-400/10',   to: '/my-assigned-jobs' },
    { label: 'Jobs Completed', value: profile?.totalJobsCompleted || 0,     icon: ListChecks,  color: 'text-emerald-400',  bg: 'bg-emerald-400/10',  to: '/my-assigned-jobs' },
    { label: 'Total Earned',   value: `₨${(earnings?.totalEarned || 0).toLocaleString()}`, icon: DollarSign, color: 'text-brand-indigo', bg: 'bg-brand-indigo/10', to: '/earnings' },
  ];

  const quickActions = [
    { to: '/jobs',              icon: Search,      label: 'Browse Jobs',      sub: 'Find new opportunities',      color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
    { to: '/my-assigned-jobs',  icon: ListChecks,  label: 'My Jobs',          sub: 'View & update assigned work', color: 'text-yellow-400',   bg: 'bg-yellow-400/10' },
    { to: '/earnings',          icon: DollarSign,  label: 'Earnings',         sub: 'Track your income',           color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
    { to: '/ratings',           icon: Star,        label: 'My Ratings',       sub: 'See feedback received',       color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
    { to: '/messages',          icon: MessageSquare,label: 'Messages',        sub: 'Chat with organizations',     color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
    { to: '/profile',           icon: User,        label: 'Edit Profile',     sub: 'Update skills & portfolio',   color: 'text-gray-400',     bg: 'bg-gray-400/10' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-gray-500 text-sm mb-1">Provider Dashboard</p>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, <span className="gradient-text">{user?.name}</span>
          </h1>
        </div>
        <div className="flex gap-3">
          <Link to="/messages" className="btn-ghost text-sm border border-surface-border">
            <MessageSquare size={15} />Messages
          </Link>
          <Link to="/profile" className="btn-primary text-sm">
            <User size={15} />Edit Profile
          </Link>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg, to }) => (
          <motion.div key={label} variants={fadeUp} transition={{ duration: 0.4 }}>
            <Link to={to} className="stat-card hover:border-brand-blue/30 transition-colors group block hover:shadow-glow-sm">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <Icon size={18} className={color} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs group-hover:text-gray-300 transition-colors">{label}</p>
            </Link>
          </motion.div>
        ))}
      </motion.div>

      {/* Profile completeness warning */}
      {profile && (() => {
        const checks = [
          (profile.skills?.length || 0) > 0, !!profile.experience?.trim(), !!profile.bio?.trim(),
          !!profile.location, !!profile.phone, (profile.hourlyRate || 0) > 0,
          (profile.portfolioLinks?.filter(Boolean).length || 0) > 0,
        ];
        const pct = Math.round((checks.filter(Boolean).length / checks.length) * 100);
        return pct < 70 ? (
          <div className="card p-4 mb-6 border-yellow-500/20 bg-yellow-500/[0.03]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-yellow-500/10 flex items-center justify-center shrink-0">
                <span className="text-yellow-400 text-sm">⚠️</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">Complete your profile to increase visibility</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-24 h-1.5 rounded-full bg-surface-border overflow-hidden">
                    <div className="h-full rounded-full bg-yellow-400" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-[10px] text-yellow-400 font-bold">{pct}%</span>
                </div>
              </div>
              <Link to="/profile" className="btn-outline text-xs px-3 py-1.5 shrink-0">Complete Profile</Link>
            </div>
          </div>
        ) : null;
      })()}

      {/* Rating + skills strip */}
      {profile && (
        <div className="card p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex items-center gap-3">
            <Avatar src={user?.profileImage} name={user?.name} size="lg" className="shadow-glow-sm" />
            <div>
              <p className="font-semibold text-white">{user?.name}</p>
              <div className="flex items-center gap-1 mt-0.5">
                {[1,2,3,4,5].map(n => (
                  <Star key={n} size={12}
                    className={n <= Math.round(profile.rating || 0) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'} />
                ))}
                <span className="text-xs text-gray-400 ml-1">{profile.rating?.toFixed(1) || '0.0'}</span>
              </div>
            </div>
          </div>
          {profile.skills?.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 sm:ml-4">
              {profile.skills.slice(0, 6).map(s => <span key={s} className="badge-blue text-xs">{s}</span>)}
              {profile.skills.length > 6 && <span className="badge-gray text-xs">+{profile.skills.length - 6}</span>}
            </div>
          ) : (
            <Link to="/profile" className="text-brand-blue text-sm hover:underline sm:ml-4">
              + Add skills to your profile
            </Link>
          )}
          <Link to="/ratings" className="sm:ml-auto btn-ghost text-xs border border-surface-border px-3 py-2 rounded-xl flex items-center gap-1.5">
            <Award size={13} />View Ratings
          </Link>
        </div>
      )}

      {/* Earnings chart */}
      {earnings?.monthly?.length > 0 && (
        <div className="card p-5 mb-8">
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <DollarSign size={14} className="text-emerald-400" />Monthly Earnings
          </p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={earnings.monthly}>
              <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#11161E', border: '1px solid #1E293B', borderRadius: 12, fontSize: 12 }} />
              <Bar dataKey="amount" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-10">
        {quickActions.map(({ to, icon: Icon, label, sub, color, bg }) => (
          <Link key={to} to={to} className="card-hover p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={16} className={color} />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-white text-sm truncate">{label}</p>
              <p className="text-gray-500 text-xs truncate">{sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Briefcase size={16} className="text-yellow-400" />Active Jobs
            </h2>
            <Link to="/my-assigned-jobs" className="text-brand-blue text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {activeJobs.slice(0, 3).map(job => <JobCard key={job._id} job={job} />)}
          </div>
        </>
      )}

      {/* Recommended Jobs (Smart Matching) */}
      {recommended.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />Recommended for You
            </h2>
            <Link to="/jobs" className="text-brand-blue text-sm hover:underline flex items-center gap-1">
              Browse all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {recommended.map(({ job, matchScore, matchedSkills }) => (
              <Link key={job._id} to={`/jobs/${job._id}`}
                className="card-hover p-5 flex flex-col gap-3 group">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-white group-hover:text-brand-blue transition-colors line-clamp-2">{job.title}</h3>
                  <div className="flex items-center gap-1 shrink-0 bg-brand-blue/10 px-2 py-1 rounded-lg">
                    <Target size={10} className="text-brand-blue" />
                    <span className="text-[10px] font-bold text-brand-blue">{matchScore}%</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{job.category} · ₨{job.budget?.toLocaleString()}</p>
                {matchedSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {matchedSkills.slice(0, 3).map(s => (
                      <span key={s} className="badge-green text-[10px]">{s}</span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-auto">{job.organizationId?.name}</p>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Open opportunities */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-indigo" />Open Opportunities
        </h2>
        <Link to="/jobs" className="text-brand-blue text-sm hover:underline flex items-center gap-1">
          Browse all <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-44 animate-pulse bg-surface-hover" />)}
        </div>
      ) : openJobs.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-400">No open jobs right now. Check back soon.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {openJobs.slice(0, 6).map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
