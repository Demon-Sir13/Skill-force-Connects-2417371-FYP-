import { useEffect, useState } from 'react';
import api from '../utils/api';
import { BarChart2, Briefcase, Users, DollarSign, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';

export default function OrgAnalytics() {
  const [jobs, setJobs]     = useState([]);
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/jobs', { params: { limit: 100 } }),
      api.get('/applications/org'),
    ]).then(([jRes, aRes]) => {
      setJobs(jRes.data.jobs || []);
      setApps(aRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const open       = jobs.filter(j => j.status === 'open').length;
  const inProgress = jobs.filter(j => j.status === 'in-progress').length;
  const completed  = jobs.filter(j => j.status === 'completed').length;
  const totalBudget = jobs.reduce((s, j) => s + (j.budget || 0), 0);
  const completedValue = jobs.filter(j => j.status === 'completed').reduce((s, j) => s + (j.budget || 0), 0);

  const appByStatus = ['pending','shortlisted','interview','approved','rejected','contracted'].map(s => ({
    name: s.charAt(0).toUpperCase() + s.slice(1),
    value: apps.filter(a => a.status === s).length,
  })).filter(d => d.value > 0);

  const jobStatusData = [
    { name: 'Open', count: open, fill: '#0EA5E9' },
    { name: 'In Progress', count: inProgress, fill: '#A855F7' },
    { name: 'Completed', count: completed, fill: '#10B981' },
  ];

  const PIE_COLORS = ['#F59E0B','#0EA5E9','#6366F1','#10B981','#EF4444','#6B7280'];

  if (loading) return (
    <div className="page max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse bg-surface-hover" />)}
      </div>
    </div>
  );

  return (
    <div className="page max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">Overview of your hiring activity</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Jobs',      value: jobs.length,                    icon: Briefcase,   color: 'text-brand-blue',   bg: 'bg-brand-blue/10' },
          { label: 'Total Applicants',value: apps.length,                    icon: Users,       color: 'text-brand-indigo', bg: 'bg-brand-indigo/10' },
          { label: 'Total Budget',    value: `₨${totalBudget.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
          { label: 'Completed Value', value: `₨${completedValue.toLocaleString()}`, icon: CheckCircle, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon size={16} className={color} />
            </div>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-gray-500 text-xs mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Jobs by status */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart2 size={14} className="text-brand-blue" />Jobs by Status
          </p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={jobStatusData}>
              <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#6B7280', fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ background: '#11161E', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {jobStatusData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Applications by status */}
        <div className="card p-5">
          <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <Users size={14} className="text-brand-indigo" />Applications by Status
          </p>
          {appByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={appByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
                  {appByStatus.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#11161E', border: '1px solid #1E293B', borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-600 text-sm">No application data yet</div>
          )}
        </div>
      </div>

      {/* Summary table */}
      <div className="card p-5">
        <p className="text-sm font-semibold text-white mb-4">Job Status Summary</p>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Open Jobs',    value: open,        color: 'text-brand-blue' },
            { label: 'In Progress',  value: inProgress,  color: 'text-yellow-400' },
            { label: 'Completed',    value: completed,   color: 'text-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-surface-hover">
              <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
              <p className="text-gray-500 text-xs mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
