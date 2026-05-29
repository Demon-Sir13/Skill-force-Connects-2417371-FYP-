import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { DollarSign, Briefcase, TrendingUp, ArrowRight, Building2, Calendar } from 'lucide-react';

export default function Earnings() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/jobs/provider/earnings')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page max-w-4xl">
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-surface-hover" />)}
      </div>
    </div>
  );

  const { totalEarned = 0, totalJobs = 0, avgPerJob = 0, monthly = {}, jobs = [] } = data || {};
  const monthlyEntries = Object.entries(monthly).slice(-6);
  const maxMonthly = Math.max(...monthlyEntries.map(([, v]) => v), 1);

  return (
    <div className="page max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Earnings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your income from completed jobs</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Earned',   value: `₨${totalEarned.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Jobs Completed', value: totalJobs,                          icon: Briefcase,  color: 'text-brand-blue',  bg: 'bg-brand-blue/10' },
          { label: 'Avg per Job',    value: `₨${avgPerJob.toLocaleString()}`,   icon: TrendingUp, color: 'text-brand-indigo',bg: 'bg-brand-indigo/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={18} className={color} />
            </div>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      {monthlyEntries.length > 0 && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold mb-6 flex items-center gap-2" style={{ color: 'var(--text)' }}>
            <TrendingUp size={16} style={{ color: 'var(--brand-blue)' }} />Monthly Breakdown
          </h2>
          <div className="flex items-end gap-3 h-36">
            {monthlyEntries.map(([month, amount]) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-emerald-400 font-medium">
                  ₨{amount >= 1000 ? `${(amount/1000).toFixed(1)}k` : amount}
                </span>
                <div className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max((amount / maxMonthly) * 100, 4)}%`,
                    minHeight: '4px',
                    background: 'linear-gradient(180deg, var(--brand-blue), var(--brand-indigo))',
                  }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{month}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Job history */}
      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="font-semibold" style={{ color: 'var(--text)' }}>Completed Jobs</h2>
        </div>
        {jobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'var(--hover)' }}>
              <DollarSign size={20} style={{ color: 'var(--text-muted)' }} />
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>No completed jobs yet.</p>
            <Link to="/jobs" className="btn-primary inline-flex text-sm">Browse Jobs</Link>
          </div>
        ) : (
          <div style={{ borderTop: '1px solid var(--border)' }}>
            {jobs.map(job => (
              <div key={job._id} className="flex items-center gap-4 px-6 py-4 transition-colors duration-200"
                style={{ borderBottom: '1px solid var(--border)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(52,211,153,0.1)' }}>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${job._id}`}
                    className="text-sm font-medium transition-colors duration-200 hover:text-brand-blue line-clamp-1"
                    style={{ color: 'var(--text)' }}>
                    {job.title}
                  </Link>
                  <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                    <span className="flex items-center gap-1">
                      <Building2 size={11} />{job.organizationId?.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={11} />{new Date(job.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-emerald-400 font-semibold text-sm">₨{job.budget?.toLocaleString()}</p>
                  <span className="badge-green text-[10px]">Completed</span>
                </div>
                <Link to={`/jobs/${job._id}`} className="transition-colors duration-200 hover:text-brand-blue"
                  style={{ color: 'var(--text-muted)' }}>
                  <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
