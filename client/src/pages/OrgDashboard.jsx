import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import JobCard from '../components/JobCard';
import { Plus, Briefcase, Clock, CheckCircle, TrendingUp, ArrowRight, Users, ListChecks, Sparkles, Target, FileText, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import Avatar from '../components/Avatar';

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };

const appStatusBadge = { pending: 'badge-blue', shortlisted: 'badge-yellow', interview: 'badge-indigo', approved: 'badge-green', rejected: 'badge-red', contracted: 'badge-gray' };

export default function OrgDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs]     = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs', { params: { orgId: user._id } })
      .then(({ data }) => {
        const j = data.jobs || data;
        setJobs(j);
        // Fetch recommended providers for the first open job
        const openJob = (Array.isArray(j) ? j : []).find(job => job.status === 'open');
        if (openJob) {
          api.get(`/matching/providers/${openJob._id}`)
            .then(({ data: matches }) => setRecommended(Array.isArray(matches) ? matches.slice(0, 4) : []))
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    // Fetch recent applications using the org endpoint
    api.get('/applications/org')
      .then(({ data }) => {
        const sorted = data.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
        setRecentApps(sorted.slice(0, 10));
      })
      .catch(() => {});

    // Auto-refresh applications every 30s
    const interval = setInterval(() => {
      api.get('/applications/org')
        .then(({ data }) => {
          const sorted = data.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
          setRecentApps(sorted.slice(0, 10));
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [user._id]);

  const open        = jobs.filter(j => j.status === 'open').length;
  const inProgress  = jobs.filter(j => j.status === 'in-progress').length;
  const completed   = jobs.filter(j => j.status === 'completed').length;

  const updateAppStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status`, { status });
      toast.success(`Application ${status}`);
      setRecentApps(prev => prev.map(a => a._id === appId ? { ...a, status } : a));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
  };

  const handleGenerateContract = async (appId) => {
    try {
      await api.post('/contracts/generate', { applicationId: appId });
      toast.success('Contract generated!');
      setRecentApps(prev => prev.map(a => a._id === appId ? { ...a, status: 'contracted' } : a));
      navigate('/contracts');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate contract');
    }
  };

  const stats = [
    { label: 'Open Jobs',    value: open,        icon: Briefcase,   color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
    { label: 'In Progress',  value: inProgress,  icon: Clock,       color: 'text-yellow-400',   bg: 'bg-yellow-400/10' },
    { label: 'Completed',    value: completed,   icon: CheckCircle, color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
    { label: 'Total Posted', value: jobs.length, icon: TrendingUp,  color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
  ];

  return (
    <div className="page">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
        <div>
          <p className="text-gray-500 text-sm mb-1">Organization Dashboard</p>
          <h1 className="text-2xl font-bold text-white">
            Good day, <span className="gradient-text">{user?.name}</span>
          </h1>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/providers" className="btn-ghost text-sm border border-surface-border">
            <Users size={15} />Browse Providers
          </Link>
          <Link to="/my-jobs" className="btn-outline text-sm">
            <ListChecks size={15} />Manage Jobs
          </Link>
          <Link to="/post-job" className="btn-primary text-sm">
            <Plus size={15} />Post a Job
          </Link>
        </div>
      </div>

      {/* Stats */}
      <motion.div initial="hidden" animate="visible" variants={stagger}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <motion.div key={label} variants={fadeUp} transition={{ duration: 0.4 }}
            className="stat-card group hover:shadow-glow-sm">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Budget by status chart */}
      {!loading && jobs.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-10">
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={14} className="text-brand-indigo" />Jobs by Status
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={[
                { name: 'Open', count: open, fill: '#0EA5E9' },
                { name: 'In Progress', count: inProgress, fill: '#A855F7' },
                { name: 'Completed', count: completed, fill: '#10B981' },
              ]}>
                <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#11161E', border: '1px solid #1E293B', borderRadius: 12, fontSize: 12 }} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {[
                    { fill: '#0EA5E9' },
                    { fill: '#A855F7' },
                    { fill: '#10B981' },
                  ].map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card p-5">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase size={14} className="text-brand-blue" />Budget Overview
            </p>
            <div className="space-y-4 mt-2">
              {[
                { label: 'Total Budget', value: jobs.reduce((s, j) => s + (j.budget || 0), 0), color: 'text-brand-blue' },
                { label: 'Completed Value', value: jobs.filter(j => j.status === 'completed').reduce((s, j) => s + (j.budget || 0), 0), color: 'text-emerald-400' },
                { label: 'In Progress Value', value: jobs.filter(j => j.status === 'in-progress').reduce((s, j) => s + (j.budget || 0), 0), color: 'text-yellow-400' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">{item.label}</span>
                  <span className={`text-lg font-bold ${item.color}`}>₨{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { to: '/post-job',  icon: Plus,       label: 'Post New Job',       sub: 'Create a new listing',          color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
          { to: '/my-jobs',   icon: ListChecks, label: 'Manage Jobs',        sub: 'Assign, update & track',        color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
          { to: '/providers', icon: Users,      label: 'Browse Providers',   sub: 'Find the right talent',         color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
        ].map(({ to, icon: Icon, label, sub, color, bg }) => (
          <Link key={to} to={to} className="card-hover p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{label}</p>
              <p className="text-gray-500 text-xs">{sub}</p>
            </div>
            <ArrowRight size={15} className="text-gray-600 ml-auto" />
          </Link>
        ))}
      </div>

      {/* Recommended Providers (Smart Matching) */}
      {recommended.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Sparkles size={16} className="text-yellow-400" />Recommended Providers
            </h2>
            <Link to="/providers" className="text-brand-blue text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={13} />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommended.map(({ provider, matchScore, matchedSkills }) => (
              <Link key={provider._id} to={`/providers/${provider.userId?._id}`}
                className="card-hover p-4 flex flex-col gap-3 group">
                <div className="flex items-center gap-3">
                  <Avatar src={provider.userId?.profileImage} name={provider.userId?.name} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white truncate group-hover:text-brand-blue transition-colors">
                      {provider.userId?.name}
                    </p>
                    <p className="text-[10px] text-gray-500">{provider.rating?.toFixed(1)} ★ · {provider.totalJobsCompleted} jobs</p>
                  </div>
                  <div className="flex items-center gap-1 bg-brand-blue/10 px-2 py-1 rounded-lg shrink-0">
                    <Target size={10} className="text-brand-blue" />
                    <span className="text-[10px] font-bold text-brand-blue">{matchScore}%</span>
                  </div>
                </div>
                {matchedSkills?.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {matchedSkills.slice(0, 3).map(s => (
                      <span key={s} className="badge-green text-[10px]">{s}</span>
                    ))}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Applications Received */}
      {recentApps.length > 0 && (
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <FileText size={16} className="text-purple-400" />Applications Received
            </h2>
          </div>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-surface-border">
                    {['#', 'Applicant', 'Job', 'Match', 'Resume', 'Success', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((app, idx) => (
                    <tr key={app._id} className="border-b border-surface-border/50 hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3.5">
                        <span className={`text-xs font-bold ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-amber-600' : 'text-gray-600'}`}>
                          {idx < 3 ? ['🥇','🥈','🥉'][idx] : `#${idx + 1}`}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/providers/${app.providerId?._id}`} className="flex items-center gap-3 group">
                          <Avatar src={app.providerId?.profileImage} name={app.providerId?.name} size="sm" />
                          <div>
                            <p className="font-medium text-white group-hover:text-brand-blue transition-colors">{app.providerId?.name}</p>
                            <p className="text-[10px] text-gray-500">{app.providerId?.email}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3.5">
                        <Link to={`/jobs/${app.jobId?._id || app.jobId}`} className="text-gray-300 hover:text-brand-blue text-xs">{app.jobId?.title || app.jobTitle}</Link>
                      </td>
                      <td className="px-5 py-3.5">
                        {app.matchScore > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 rounded-full bg-surface-border overflow-hidden">
                              <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${app.matchScore}%` }} />
                            </div>
                            <span className={`text-[10px] font-bold ${app.matchScore >= 70 ? 'text-emerald-400' : app.matchScore >= 40 ? 'text-yellow-400' : 'text-gray-500'}`}>
                              {app.matchScore}%
                            </span>
                          </div>
                        ) : <span className="text-[10px] text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {app.resumeScore > 0 ? (
                          <div className="flex items-center gap-1">
                            <div className="w-10 h-1.5 rounded-full bg-surface-border overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${app.resumeScore}%`, background: app.resumeScore >= 70 ? '#10B981' : app.resumeScore >= 40 ? '#F59E0B' : '#6B7280' }} />
                            </div>
                            <span className={`text-[10px] font-bold ${app.resumeScore >= 70 ? 'text-emerald-400' : app.resumeScore >= 40 ? 'text-yellow-400' : 'text-gray-500'}`}>
                              {app.resumeScore}
                            </span>
                          </div>
                        ) : <span className="text-[10px] text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        {app.successLabel ? (
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            app.successLabel === 'High' ? 'bg-emerald-500/10 text-emerald-400' :
                            app.successLabel === 'Medium' ? 'bg-yellow-500/10 text-yellow-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {app.successRate}% {app.successLabel}
                          </span>
                        ) : <span className="text-[10px] text-gray-600">—</span>}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`${appStatusBadge[app.status] || 'badge-blue'} text-[10px]`}>{app.status}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex gap-1 flex-wrap">
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => updateAppStatus(app._id, 'shortlisted')} className="text-[10px] px-2 py-1 rounded-lg bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20">Shortlist</button>
                              <button onClick={() => updateAppStatus(app._id, 'rejected')} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                            </>
                          )}
                          {app.status === 'shortlisted' && (
                            <>
                              <button onClick={() => updateAppStatus(app._id, 'interview')} className="text-[10px] px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">Interview</button>
                              <button onClick={() => updateAppStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">Approve</button>
                            </>
                          )}
                          {app.status === 'interview' && (
                            <>
                              <button onClick={() => updateAppStatus(app._id, 'approved')} className="text-[10px] px-2 py-1 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20">Approve</button>
                              <button onClick={() => updateAppStatus(app._id, 'rejected')} className="text-[10px] px-2 py-1 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">Reject</button>
                            </>
                          )}
                          {app.status === 'approved' && (
                            <>
                              <Link to={`/messages/${app.providerId?._id}`} className="text-[10px] px-2 py-1 rounded-lg bg-brand-blue/10 text-brand-blue hover:bg-brand-blue/20 flex items-center gap-1">
                                <MessageSquare size={10} />Message
                              </Link>
                              <button onClick={() => handleGenerateContract(app._id)} className="text-[10px] px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">📝 Contract</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Recent jobs */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Briefcase size={16} className="text-brand-indigo" />Recent Jobs
        </h2>
        <Link to="/my-jobs" className="text-brand-blue text-sm hover:underline flex items-center gap-1">
          Manage all <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-44 animate-pulse bg-surface-hover" />)}
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Briefcase size={36} className="mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400 mb-4">No jobs posted yet</p>
          <Link to="/post-job" className="btn-primary inline-flex">Post your first job</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.slice(0, 6).map(job => <JobCard key={job._id} job={job} />)}
        </div>
      )}
    </div>
  );
}
