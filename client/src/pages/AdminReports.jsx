import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart2, Users, Briefcase, DollarSign, TrendingUp, CheckCircle } from 'lucide-react';

export default function AdminReports() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="page max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <div key={i} className="card h-28 animate-pulse bg-surface-hover" />)}
      </div>
    </div>
  );

  const metrics = stats ? [
    { label: 'Total Users',         value: stats.totalUsers || 0,         icon: Users,       color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
    { label: 'Organizations',       value: stats.totalOrgs || 0,          icon: Briefcase,   color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
    { label: 'Providers',           value: stats.totalProviders || 0,     icon: Users,       color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
    { label: 'Total Jobs',          value: stats.totalJobs || 0,          icon: Briefcase,   color: 'text-yellow-400',   bg: 'bg-yellow-400/10' },
    { label: 'Completed Jobs',      value: stats.completedJobs || 0,      icon: CheckCircle, color: 'text-emerald-400',  bg: 'bg-emerald-400/10' },
    { label: 'Active Contracts',    value: stats.activeContracts || 0,    icon: TrendingUp,  color: 'text-purple-400',   bg: 'bg-purple-400/10' },
  ] : [];

  return (
    <div className="page max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-gray-500 text-sm mt-1">Platform-wide statistics and health metrics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metrics.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value.toLocaleString()}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {stats?.recentActivity && (
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4">Platform Health</p>
          <div className="space-y-3">
            {[
              { label: 'Job Fill Rate',       value: stats.totalJobs > 0 ? Math.round((stats.completedJobs / stats.totalJobs) * 100) : 0, suffix: '%', color: 'bg-emerald-500' },
              { label: 'Provider Utilization',value: stats.totalProviders > 0 ? Math.round((stats.activeProviders / stats.totalProviders) * 100) : 0, suffix: '%', color: 'bg-brand-blue' },
              { label: 'Contract Completion', value: stats.totalContracts > 0 ? Math.round((stats.completedContracts / stats.totalContracts) * 100) : 0, suffix: '%', color: 'bg-brand-indigo' },
            ].map(({ label, value, suffix, color }) => (
              <div key={label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-400">{label}</span>
                  <span className="text-xs font-bold text-white">{value}{suffix}</span>
                </div>
                <div className="h-2 rounded-full bg-surface-border overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-1000`} style={{ width: `${value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
